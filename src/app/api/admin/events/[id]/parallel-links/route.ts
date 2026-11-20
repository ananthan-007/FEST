import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkAdmin } from '@/lib/auth/checkRole'


export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const adminClient = createAdminClient()

  const { data, error } = await adminClient
    .from('parallel_event_links')
    .select(`
      *,
      event_a:events!parallel_event_links_event_a_id_fkey (*),
      event_b:events!parallel_event_links_event_b_id_fkey (*)
    `)
    .or(`event_a_id.eq.${id},event_b_id.eq.${id}`)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const { linked_event_id } = await req.json()

  if (!linked_event_id || linked_event_id === id) {
    return NextResponse.json({ error: 'Valid distinct linked_event_id is required' }, { status: 400 })
  }

  // Enforce canonical ordering: eventAId < eventBId
  const [eventAId, eventBId] = id < linked_event_id ? [id, linked_event_id] : [linked_event_id, id]
  const adminClient = createAdminClient()

  const { data, error } = await adminClient
    .from('parallel_event_links')
    .upsert({ event_a_id: eventAId, event_b_id: eventBId })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const { linked_event_id } = await req.json()

  const [eventAId, eventBId] = id < linked_event_id ? [id, linked_event_id] : [linked_event_id, id]
  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from('parallel_event_links')
    .delete()
    .match({ event_a_id: eventAId, event_b_id: eventBId })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
