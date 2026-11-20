'use client'

import Link from 'next/link'

interface Stats {
  totalReg: number
  verifiedReg: number
  pendingReg: number
  flaggedReg: number
  institutionCount: number
}

interface Props {
  stats: Stats
  recentRegs: any[]
  events: any[]
}

function StatCard({
  label, value, sub, icon, iconBg, iconColor, badge, badgeColor,
}: {
  label: string; value: string | number; sub?: string; icon: string;
  iconBg: string; iconColor: string; badge?: string; badgeColor?: string;
}) {
  return (
    <div className="bg-[#0D1321]/80 border border-white/8 rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#8A94A8]">{label}</p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
          <span className={`material-symbols-outlined text-[20px] ${iconColor}`}>{icon}</span>
        </div>
      </div>
      <div>
        <p className="font-serif text-4xl text-[#DDE2F6] leading-none">{value}</p>
        {sub && <p className="text-xs text-[#8A94A8] mt-1">{sub}</p>}
      </div>
      {badge && (
        <span className={`self-start inline-flex items-center h-5 px-2 rounded-full text-[9px] font-bold tracking-wider uppercase border ${badgeColor}`}>
          {badge}
        </span>
      )}
    </div>
  )
}

function ActivityItem({ reg }: { reg: any }) {
  const isVerified = reg.payment_status === 'verified'
  const isPending = reg.payment_status === 'pending'
  const isFlagged = reg.payment_status === 'flagged'
  const eventTitle = reg.events?.title ?? 'Unknown Event'
  const name = reg.profiles?.display_name ?? reg.profiles?.email ?? 'Unknown'
  const timeAgo = (() => {
    const diff = Date.now() - new Date(reg.created_at).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 60) return `${m}m ago`
    return `${Math.floor(m / 60)}h ago`
  })()

  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
        isVerified ? 'bg-emerald-500/15' : isPending ? 'bg-amber-500/15' : 'bg-red-500/15'
      }`}>
        <span className={`material-symbols-outlined text-[18px] ${
          isVerified ? 'text-emerald-400' : isPending ? 'text-amber-400' : 'text-red-400'
        }`}>
          {isVerified ? 'check_circle' : isPending ? 'pending' : 'warning'}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[#DDE2F6] truncate font-medium">{eventTitle}</p>
        <p className="text-xs text-[#8A94A8] truncate">{name}</p>
      </div>
      <div className="text-right shrink-0">
        <span className={`inline-flex items-center h-5 px-2 rounded-full text-[9px] font-bold uppercase border ${
          isVerified ? 'bg-emerald-500/15 border-emerald-500/25 text-emerald-400' :
          isPending ? 'bg-amber-500/15 border-amber-500/25 text-amber-400' :
          'bg-red-500/15 border-red-500/25 text-red-400'
        }`}>
          {reg.payment_status}
        </span>
        <p className="text-[10px] text-[#8A94A8] mt-0.5">{timeAgo}</p>
      </div>
    </div>
  )
}

export default function AdminOverviewClient({ stats, recentRegs, events }: Props) {
  const verifiedPct = stats.totalReg > 0 ? Math.round((stats.verifiedReg / stats.totalReg) * 100) : 0

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      {/* Page header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#C8102E] animate-pulse" />
            <span className="text-[9px] font-semibold tracking-[0.2em] uppercase text-[#C8102E]">
              Defence Corps Telemetry · Ops Running
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#DDE2F6]">Command Center Overview</h1>
          <p className="text-sm text-[#8A94A8] mt-1 max-w-lg">
            Real-time registration telemetry and conclave readiness across Kerala &amp; Lakshadweep Directorate.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/admin/registrations"
            className="h-9 px-4 rounded-full border border-white/15 text-[#DDE2F6] text-xs font-bold tracking-wider uppercase flex items-center gap-2 hover:border-white/30 transition"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            Export Report
          </Link>
          <Link
            href="/admin/registrations"
            className="h-9 px-4 rounded-full bg-[#C8102E] hover:bg-[#A00B22] text-white text-xs font-bold tracking-wider uppercase flex items-center gap-2 transition shadow-[0_0_20px_rgba(200,16,46,0.3)]"
          >
            <span className="material-symbols-outlined text-[16px]">campaign</span>
            Manage Registrations
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Registrations"
          value={stats.totalReg.toLocaleString()}
          sub={`${stats.verifiedReg.toLocaleString()} Verified · ${stats.pendingReg} In-Review`}
          icon="how_to_reg"
          iconBg="bg-[#C8102E]/15"
          iconColor="text-[#C8102E]"
          badge={`+${verifiedPct}% verified`}
          badgeColor="bg-emerald-500/15 border-emerald-500/25 text-emerald-400"
        />
        <StatCard
          label="Verified Credentials"
          value={stats.verifiedReg.toLocaleString()}
          sub={`${verifiedPct}% Ready for Gate ID`}
          icon="verified"
          iconBg="bg-emerald-500/15"
          iconColor="text-emerald-400"
        />
        <StatCard
          label="Enrolled Institutions"
          value={stats.institutionCount}
          sub="Across NCC Groups"
          icon="account_balance"
          iconBg="bg-blue-500/15"
          iconColor="text-blue-400"
        />
        <StatCard
          label="Pending / Flagged"
          value={stats.pendingReg + stats.flaggedReg}
          sub={`${stats.pendingReg} Pending · ${stats.flaggedReg} Flagged`}
          icon="warning"
          iconBg="bg-amber-500/15"
          iconColor="text-amber-400"
          badge="Needs action"
          badgeColor="bg-amber-500/15 border-amber-500/25 text-amber-400"
        />
      </div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Recent Activity Feed */}
        <div className="lg:col-span-2 bg-[#0D1321]/80 border border-white/8 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#8A94A8]">
                Tactical Activity Feed
              </p>
              <h2 className="font-serif text-lg text-[#DDE2F6] mt-0.5">Recent Registrations</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">Live</span>
            </div>
          </div>

          {recentRegs.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10">
              <span className="material-symbols-outlined text-5xl text-[#8A94A8]/40">inbox</span>
              <p className="text-[#8A94A8] text-sm">No registrations yet</p>
            </div>
          ) : (
            <div>
              {recentRegs.map((reg) => <ActivityItem key={reg.id} reg={reg} />)}
            </div>
          )}

          <Link
            href="/admin/registrations"
            className="mt-4 flex items-center gap-2 text-xs font-semibold text-[#C8102E] hover:text-[#E8203E] transition"
          >
            View all registrations
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>

        {/* Quick links panel */}
        <div className="space-y-4">
          {/* Registration breakdown */}
          <div className="bg-[#0D1321]/80 border border-white/8 rounded-2xl p-5">
            <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#8A94A8] mb-4">
              Registration Status
            </p>
            <div className="space-y-3">
              {[
                { label: 'Verified', value: stats.verifiedReg, total: stats.totalReg, color: 'bg-emerald-400' },
                { label: 'Pending', value: stats.pendingReg, total: stats.totalReg, color: 'bg-amber-400' },
                { label: 'Flagged', value: stats.flaggedReg, total: stats.totalReg, color: 'bg-red-400' },
              ].map(({ label, value, total, color }) => {
                const pct = total > 0 ? Math.round((value / total) * 100) : 0
                return (
                  <div key={label}>
                    <div className="flex justify-between text-xs text-[#8A94A8] mb-1">
                      <span>{label}</span>
                      <span>{pct}% ({value})</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${color} rounded-full transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Command Grid — quick nav */}
          <div className="bg-[#0D1321]/80 border border-white/8 rounded-2xl p-5">
            <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#8A94A8] mb-3">
              Operational Grid
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Events', href: '/admin/events', icon: 'military_tech', color: 'text-[#C8102E]' },
                { label: 'Registrations', href: '/admin/registrations', icon: 'assignment', color: 'text-blue-400' },
                { label: 'Categories', href: '/admin/categories', icon: 'category', color: 'text-purple-400' },
                { label: 'Institutions', href: '/admin/institutions', icon: 'account_balance', color: 'text-emerald-400' },
                { label: 'Volunteers', href: '/admin/volunteers', icon: 'shield_person', color: 'text-amber-400' },
                { label: 'Settings', href: '/admin/settings', icon: 'settings', color: 'text-[#8A94A8]' },
              ].map(({ label, href, icon, color }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex flex-col items-start gap-2 p-3 rounded-xl bg-[#161B2A] hover:bg-[#1D2235] border border-white/5 hover:border-white/10 transition"
                >
                  <span className={`material-symbols-outlined text-[20px] ${color}`}>{icon}</span>
                  <span className="text-xs font-semibold text-[#DDE2F6]">{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Active events table */}
      {events.length > 0 && (
        <div className="bg-[#0D1321]/80 border border-white/8 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#8A94A8]">Active Events</p>
              <h2 className="font-serif text-lg text-[#DDE2F6] mt-0.5">Running Disciplines</h2>
            </div>
            <Link href="/admin/events" className="text-xs font-semibold text-[#C8102E] hover:text-[#E8203E] transition flex items-center gap-1">
              Manage all <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>
          <div className="space-y-2">
            {events.map((ev: any) => (
              <div key={ev.id} className="flex items-center gap-3 px-4 py-3 bg-[#161B2A] rounded-xl border border-white/5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                <p className="flex-1 text-sm text-[#DDE2F6] font-medium truncate">{ev.title}</p>
                <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  Active
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
