import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminOverviewClient from './AdminOverviewClient'

export const dynamic = 'force-dynamic'

export default async function AdminOverviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Fetch stats
  const [
    { count: totalReg },
    { count: verifiedReg },
    { count: pendingReg },
    { count: flaggedReg },
    { count: institutionCount },
    { data: recentRegs },
    { data: events },
  ] = await Promise.all([
    supabase.from('registrations').select('*', { count: 'exact', head: true }),
    supabase.from('registrations').select('*', { count: 'exact', head: true }).eq('payment_status', 'verified'),
    supabase.from('registrations').select('*', { count: 'exact', head: true }).eq('payment_status', 'pending'),
    supabase.from('registrations').select('*', { count: 'exact', head: true }).eq('payment_status', 'flagged'),
    supabase.from('institutions').select('*', { count: 'exact', head: true }),
    supabase.from('registrations')
      .select('id, created_at, payment_status, team_name, events(title), profiles(display_name, email)')
      .order('created_at', { ascending: false })
      .limit(6),
    supabase.from('events').select('id, title, is_active').eq('is_active', true).limit(10),
  ])

  const stats = {
    totalReg: totalReg ?? 0,
    verifiedReg: verifiedReg ?? 0,
    pendingReg: pendingReg ?? 0,
    flaggedReg: flaggedReg ?? 0,
    institutionCount: institutionCount ?? 0,
  }

  return (
    <AdminOverviewClient
      stats={stats}
      recentRegs={recentRegs ?? []}
      events={events ?? []}
    />
  )
}
