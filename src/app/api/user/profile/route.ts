import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()
    // getUser() verifies the JWT server-side (secure)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminClient = createAdminClient()
    const { data: profile, error } = await adminClient
      .from('profiles')
      .select(`
        id, email, display_name, phone, division,
        institution_id, ncc_unit, photo_url,
        profile_complete, role, division_locked, qr_token,
        institutions (
          id,
          name,
          battalions (
            id,
            name,
            ncc_groups (
              id,
              name
            )
          )
        )
      `)
      .eq('id', user.id)
      .single()

    let activeProfile = profile

    if (error || !activeProfile) {
      // Profile row missing — create it via upsert (safe — won't overwrite existing role)
      await adminClient
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email || '',
          display_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Cadet',
          role: 'user',
        })
        .select('id')
        .maybeSingle()

      const { data: fetchedProfile, error: fetchErr } = await adminClient
        .from('profiles')
        .select(`
          id, email, display_name, phone, division,
          institution_id, ncc_unit, photo_url,
          profile_complete, role, division_locked, qr_token,
          institutions (
            id,
            name,
            battalions (
              id,
              name,
              ncc_groups (
                id,
                name
              )
            )
          )
        `)
        .eq('id', user.id)
        .single()

      if (fetchErr || !fetchedProfile) {
        return NextResponse.json({ error: 'Failed to create or load profile' }, { status: 500 })
      }
      activeProfile = fetchedProfile
    }

    return NextResponse.json({
      id: activeProfile.id,
      email: activeProfile.email,
      displayName: activeProfile.display_name,
      phone: activeProfile.phone,
      division: activeProfile.division,
      institutionId: activeProfile.institution_id,
      nccUnit: activeProfile.ncc_unit,
      photoUrl: activeProfile.photo_url,
      profileComplete: activeProfile.profile_complete,
      role: activeProfile.role,
      divisionLocked: activeProfile.division_locked,
      qrToken: activeProfile.qr_token,
      institution: activeProfile.institutions
        ? {
            id: (activeProfile.institutions as any).id,
            name: (activeProfile.institutions as any).name,
            battalion: (activeProfile.institutions as any).battalions
              ? {
                  id: (activeProfile.institutions as any).battalions.id,
                  name: (activeProfile.institutions as any).battalions.name,
                  group: (activeProfile.institutions as any).battalions.ncc_groups
                    ? {
                        id: (activeProfile.institutions as any).battalions.ncc_groups.id,
                        name: (activeProfile.institutions as any).battalions.ncc_groups.name,
                      }
                    : null,
                }
              : null,
          }
        : null,
    })
  } catch (err: unknown) {
    console.error('[GET /api/user/profile]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { displayName, phone, division, institutionId } = body

    const adminClient = createAdminClient()
    const { data: currentProfile, error: profileError } = await adminClient
      .from('profiles')
      .select('division_locked, division')
      .eq('id', user.id)
      .single()

    if (profileError || !currentProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    if (division !== undefined && division !== currentProfile.division) {
      if (currentProfile.division_locked) {
        return NextResponse.json(
          { error: 'Division is locked after registering for events and cannot be changed' },
          { status: 422 }
        )
      }
    }

    const updatePayload: Record<string, unknown> = {}
    if (displayName !== undefined) updatePayload.display_name = displayName
    if (phone !== undefined) updatePayload.phone = phone
    if (division !== undefined) updatePayload.division = division
    if (institutionId !== undefined) updatePayload.institution_id = institutionId

    const { data: updatedProfile, error: updateError } = await adminClient
      .from('profiles')
      .update(updatePayload)
      .eq('id', user.id)
      .select('id, display_name, phone, division, institution_id, ncc_unit, photo_url, profile_complete, division_locked')
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 })
    }

    const isComplete = Boolean(
      updatedProfile.display_name &&
      updatedProfile.phone &&
      updatedProfile.division &&
      updatedProfile.institution_id
    )

    if (isComplete !== updatedProfile.profile_complete) {
      await adminClient
        .from('profiles')
        .update({ profile_complete: isComplete })
        .eq('id', user.id)
      updatedProfile.profile_complete = isComplete
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: updatedProfile.id,
        displayName: updatedProfile.display_name,
        phone: updatedProfile.phone,
        division: updatedProfile.division,
        institutionId: updatedProfile.institution_id,
        nccUnit: updatedProfile.ncc_unit,
        photoUrl: updatedProfile.photo_url,
        profileComplete: updatedProfile.profile_complete,
        divisionLocked: updatedProfile.division_locked,
      },
    })
  } catch (err: unknown) {
    console.error('[PATCH /api/user/profile]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
