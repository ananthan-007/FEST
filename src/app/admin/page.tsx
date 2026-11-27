import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkAdmin } from '@/lib/auth/checkRole'
import AdminOverviewClient from './AdminOverviewClient'

export const dynamic = 'force-dynamic'

export default async function AdminOverviewPage() {
  const admin = await checkAdmin()
  if (!admin) redirect('/unauthorized')

  const adminClient = createAdminClient()

  const [
    { count: totalReg },
    { count: verifiedReg },
    { count: pendingReg },
    { count: flaggedReg },
    { data: regInstitutionRows },
    { count: activeEventsCount },
    { data: recentRegs },
    { data: events },
  ] = await Promise.all([
    adminClient.from('registrations').select('*', { count: 'exact', head: true }),
    adminClient.from('registrations').select('*', { count: 'exact', head: true }).eq('payment_status', 'verified'),
    adminClient.from('registrations').select('*', { count: 'exact', head: true }).eq('payment_status', 'pending'),
    adminClient.from('registrations').select('*', { count: 'exact', head: true }).eq('payment_status', 'failed'),
    adminClient
      .from('registrations')
      .select('institution_id, leader:profiles!registrations_leader_id_fkey(institution_id)')
      .neq('payment_status', 'failed'),
    adminClient.from('events').select('*', { count: 'exact', head: true }).eq('is_active', true),
    adminClient
      .from('registrations')
      .select(`
        id, created_at, payment_status, team_name,
        events ( id, title ),
        leader:profiles!registrations_leader_id_fkey ( display_name, email )
      `)
      .order('created_at', { ascending: false })
      .limit(6),
    adminClient
      .from('events')
      .select('id, title, venue, fee, is_active')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(8),
  ])

  const enrolledInstitutions = new Set<string>()
  for (const row of regInstitutionRows || []) {
    const leaderObj = Array.isArray((row as any).leader)
      ? (row as any).leader[0]
      : (row as any).leader
    const instId = (row as any).institution_id || leaderObj?.institution_id
    if (instId) enrolledInstitutions.add(instId)
  }

  const stats = {
    totalReg: totalReg ?? 0,
    verifiedReg: verifiedReg ?? 0,
    pendingReg: pendingReg ?? 0,
    flaggedReg: flaggedReg ?? 0,
    institutionCount: enrolledInstitutions.size,
    activeEventsCount: activeEventsCount ?? 0,
  }

  return (
    <AdminOverviewClient
      stats={stats}
      recentRegs={recentRegs ?? []}
      events={events ?? []}
    />
  )
}
