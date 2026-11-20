import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkAdmin } from '@/lib/auth/checkRole'


export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const adminClient = createAdminClient()

  const { data, error } = await adminClient
    .from('prize_pool_groups')
    .select('*')
    .eq('event_id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const body = await req.json()
  const { name, label, divisions, first_prize, second_prize, third_prize, prize_1st, prize_2nd, prize_3rd } = body

  // Enforce division grouping rule: SD+JD or SW+JW cannot be mixed
  const divs: string[] = divisions || []
  const hasSD = divs.includes('SD')
  const hasJD = divs.includes('JD')
  const hasSW = divs.includes('SW')
  const hasJW = divs.includes('JW')

  if ((hasSD && hasJD) || (hasSW && hasJW)) {
    return NextResponse.json(
      { error: 'Invalid prize pool grouping: SD+JD and SW+JW division combinations are not allowed together.' },
      { status: 422 }
    )
  }

  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from('prize_pool_groups')
    .insert({
      event_id: id,
      name: name || label || 'Prize Group',
      divisions: divs,
      prize_1st: first_prize ?? prize_1st ?? null,
      prize_2nd: second_prize ?? prize_2nd ?? null,
      prize_3rd: third_prize ?? prize_3rd ?? null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE() {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  return NextResponse.json({ error: 'Specify poolId to delete' }, { status: 400 })
}
