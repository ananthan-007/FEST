import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const PROFILE_SELECT = `
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
`

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatProfile(activeProfile: any) {
  return {
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
          id: activeProfile.institutions.id,
          name: activeProfile.institutions.name,
          battalion: activeProfile.institutions.battalions
            ? {
                id: activeProfile.institutions.battalions.id,
                name: activeProfile.institutions.battalions.name,
                group: activeProfile.institutions.battalions.ncc_groups
                  ? {
                      id: activeProfile.institutions.battalions.ncc_groups.id,
                      name: activeProfile.institutions.battalions.ncc_groups.name,
                    }
                  : null,
              }
            : null,
        }
      : null,
  }
}

async function getOrCreateUnlistedBattalionId(adminClient: ReturnType<typeof createAdminClient>) {
  const OTHER_NAME = 'Other / Unlisted'

  const { data: existingGroup } = await adminClient
    .from('ncc_groups')
    .select('id')
    .eq('name', OTHER_NAME)
    .maybeSingle()

  let groupId = existingGroup?.id
  if (!groupId) {
    const { data: createdGroup, error: groupErr } = await adminClient
      .from('ncc_groups')
      .upsert({ name: OTHER_NAME, display_order: 999 }, { onConflict: 'name' })
      .select('id')
      .single()
    if (groupErr || !createdGroup) {
      throw new Error(groupErr?.message || 'Failed to resolve unlisted NCC group')
    }
    groupId = createdGroup.id
  }

  const { data: existingBn } = await adminClient
    .from('battalions')
    .select('id')
    .eq('group_id', groupId)
    .eq('name', OTHER_NAME)
    .maybeSingle()

  if (existingBn?.id) return existingBn.id

  const { data: createdBn, error: bnErr } = await adminClient
    .from('battalions')
    .upsert({ group_id: groupId, name: OTHER_NAME, display_order: 999 }, { onConflict: 'group_id,name' })
    .select('id')
    .single()
  if (bnErr || !createdBn) {
    throw new Error(bnErr?.message || 'Failed to resolve unlisted battalion')
  }
  return createdBn.id
}

async function resolveOrCreateCustomInstitution(
  adminClient: ReturnType<typeof createAdminClient>,
  rawName: string,
  battalionId?: string | null
): Promise<string> {
  const cleanedName = rawName.replace(/\s+/g, ' ').trim()
  if (cleanedName.length < 2 || cleanedName.length > 200) {
    throw new Error('Institution name must be between 2 and 200 characters')
  }

  let targetBattalionId = battalionId?.trim() || ''
  if (targetBattalionId) {
    const { data: bn } = await adminClient
      .from('battalions')
      .select('id')
      .eq('id', targetBattalionId)
      .maybeSingle()
    if (!bn) {
      throw new Error('Selected battalion was not found')
    }
  } else {
    targetBattalionId = await getOrCreateUnlistedBattalionId(adminClient)
  }

  // Case-insensitive match within the target battalion to prevent near-duplicate rows
  const { data: existingList } = await adminClient
    .from('institutions')
    .select('id, name')
    .eq('battalion_id', targetBattalionId)

  const matched = (existingList || []).find(
    (inst) => inst.name.trim().toLowerCase() === cleanedName.toLowerCase()
  )
  if (matched) return matched.id

  const { data: inserted, error: insertErr } = await adminClient
    .from('institutions')
    .insert({ name: cleanedName, battalion_id: targetBattalionId, display_order: 999 })
    .select('id')
    .single()

  if (insertErr) {
    if (insertErr.code === '23505') {
      const { data: retryList } = await adminClient
        .from('institutions')
        .select('id, name')
        .eq('battalion_id', targetBattalionId)
      const retryMatch = (retryList || []).find(
        (inst) => inst.name.trim().toLowerCase() === cleanedName.toLowerCase()
      )
      if (retryMatch) return retryMatch.id
    }
    throw new Error(insertErr.message || 'Failed to save custom institution')
  }

  return inserted.id
}

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
      .select(PROFILE_SELECT)
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
        .select(PROFILE_SELECT)
        .eq('id', user.id)
        .single()

      if (fetchErr || !fetchedProfile) {
        return NextResponse.json({ error: 'Failed to create or load profile' }, { status: 500 })
      }
      activeProfile = fetchedProfile
    }

    return NextResponse.json(formatProfile(activeProfile))
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
    const displayName = body.displayName ?? body.display_name
    const phone = body.phone
    const division = body.division
    const institutionId = body.institutionId ?? body.institution_id
    const customInstitutionName = body.customInstitutionName ?? body.custom_institution_name
    const battalionId = body.battalionId ?? body.battalion_id

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

    let resolvedInstitutionId = institutionId
    if (typeof customInstitutionName === 'string' && customInstitutionName.trim().length > 0) {
      try {
        resolvedInstitutionId = await resolveOrCreateCustomInstitution(
          adminClient,
          customInstitutionName,
          battalionId
        )
      } catch (instErr: unknown) {
        const message = instErr instanceof Error ? instErr.message : 'Invalid custom institution'
        return NextResponse.json({ error: message }, { status: 400 })
      }
    }

    const updatePayload: Record<string, unknown> = {}
    if (displayName !== undefined) updatePayload.display_name = String(displayName).trim()
    if (phone !== undefined) updatePayload.phone = String(phone).trim()
    if (division !== undefined) updatePayload.division = division
    if (resolvedInstitutionId !== undefined) updatePayload.institution_id = resolvedInstitutionId

    const { data: updatedProfile, error: updateError } = await adminClient
      .from('profiles')
      .update(updatePayload)
      .eq('id', user.id)
      .select('id, display_name, phone, division, institution_id, profile_complete')
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
    }

    const { data: fullProfile, error: refetchErr } = await adminClient
      .from('profiles')
      .select(PROFILE_SELECT)
      .eq('id', user.id)
      .single()

    if (refetchErr || !fullProfile) {
      return NextResponse.json({ error: 'Failed to reload updated profile' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      profile: formatProfile(fullProfile),
    })
  } catch (err: unknown) {
    console.error('[PATCH /api/user/profile]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
