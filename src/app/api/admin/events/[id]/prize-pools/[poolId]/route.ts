import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkAdmin } from '@/lib/auth/checkRole'


export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; poolId: string }> }
) {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { poolId } = await params
  const adminClient = createAdminClient()

  const { error } = await adminClient.from('prize_pool_groups').delete().eq('id', poolId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
