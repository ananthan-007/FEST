import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkAdmin } from '@/lib/auth/checkRole'


export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const { name } = await req.json()
  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

  const adminClient = createAdminClient()
  const { data, error } = await adminClient.from('ncc_groups').update({ name }).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const adminClient = createAdminClient()

  // Guard: check if any battalion in this group has institutions with profiles or registrations
  const { data: battalions } = await adminClient.from('battalions').select('id').eq('group_id', id)
  const battalionIds = (battalions || []).map((b: any) => b.id)

  if (battalionIds.length > 0) {
    const { data: institutions } = await adminClient.from('institutions').select('id').in('battalion_id', battalionIds)
    const instIds = (institutions || []).map((i: any) => i.id)

    if (instIds.length > 0) {
      const { count: profileCount } = await adminClient
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .in('institution_id', instIds)

      if (profileCount && profileCount > 0) {
        return NextResponse.json({ error: 'Cannot delete group with linked profiles or registrations' }, { status: 409 })
      }
    }
  }

  const { error } = await adminClient.from('ncc_groups').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
