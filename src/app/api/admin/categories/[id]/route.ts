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
  const { data, error } = await adminClient.from('categories').update({ name }).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const adminClient = createAdminClient()

  // Guard: check if events in subcategories of this category have active registrations
  const { data: subcats } = await adminClient.from('sub_categories').select('id').eq('category_id', id)
  const subcatIds = (subcats || []).map((s: any) => s.id)

  if (subcatIds.length > 0) {
    const { data: events } = await adminClient.from('events').select('id').in('subcategory_id', subcatIds)
    const eventIds = (events || []).map((e: any) => e.id)

    if (eventIds.length > 0) {
      const { count } = await adminClient
        .from('registrations')
        .select('id', { count: 'exact', head: true })
        .in('event_id', eventIds)

      if (count && count > 0) {
        return NextResponse.json(
          { error: 'Cannot delete category containing events with active registrations' },
          { status: 409 }
        )
      }
    }
  }

  const { error } = await adminClient.from('categories').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
