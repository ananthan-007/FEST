'use client'

import Link from 'next/link'
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Clock,
  Inbox,
  Landmark,
  Plus,
  Trophy,
  UserCheck,
  XCircle,
} from 'lucide-react'
import { SpotlightCard, ShinyText } from '@/components/reactbits'
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/motion/ScrollReveal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Stats {
  totalReg: number
  verifiedReg: number
  pendingReg: number
  flaggedReg: number
  institutionCount: number
  activeEventsCount: number
}

interface Props {
  stats: Stats
  recentRegs: any[]
  events: any[]
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  badge,
  badgeVariant = 'gold',
}: {
  label: string
  value: string | number
  sub?: string
  icon: React.ElementType
  badge?: string
  badgeVariant?: 'gold' | 'success' | 'warning'
}) {
  return (
    <SpotlightCard className="p-5 flex flex-col justify-between gap-3 h-full">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#A89F91]">
          {label}
        </p>
        <div className="w-9 h-9 rounded-xl bg-[#CC892F]/15 border border-[#CC892F]/35 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-[#E3B464]" />
        </div>
      </div>
      <div>
        <p className="font-serif text-3xl sm:text-4xl gold-gradient-text leading-none">
          {value}
        </p>
        {sub && <p className="text-xs text-[#A89F91] mt-1.5">{sub}</p>}
      </div>
      {badge && (
        <Badge variant={badgeVariant} className="self-start">
          {badge}
        </Badge>
      )}
    </SpotlightCard>
  )
}

function ActivityItem({ reg }: { reg: any }) {
  const isVerified = reg.payment_status === 'verified'
  const isPending = reg.payment_status === 'pending'
  const eventTitle = reg.events?.title ?? 'Untitled Event'
  const leaderObj = Array.isArray(reg.leader) ? reg.leader[0] : reg.leader
  const name = leaderObj?.display_name || leaderObj?.email || 'Unknown Cadet'

  const timeAgo = (() => {
    const diff = Date.now() - new Date(reg.created_at).getTime()
    const m = Math.max(0, Math.floor(diff / 60000))
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    return `${Math.floor(h / 24)}d ago`
  })()

  return (
    <div className="flex items-center gap-3 py-3 border-b border-[#3A291B]/60 last:border-0">
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
          isVerified
            ? 'bg-emerald-500/12 border-emerald-500/30 text-emerald-400'
            : isPending
            ? 'bg-[#CC892F]/15 border-[#CC892F]/40 text-[#E3B464]'
            : 'bg-red-500/12 border-red-500/30 text-red-400'
        }`}
      >
        {isVerified ? (
          <CheckCircle2 className="w-4 h-4" />
        ) : isPending ? (
          <Clock className="w-4 h-4" />
        ) : (
          <XCircle className="w-4 h-4" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[#F5EFE6] truncate font-medium">{eventTitle}</p>
        <p className="text-xs text-[#A89F91] truncate">
          {name}
          {reg.team_name ? ` · ${reg.team_name}` : ''}
        </p>
      </div>
      <div className="text-right shrink-0">
        <Badge variant={isVerified ? 'success' : isPending ? 'gold' : 'danger'}>
          {reg.payment_status}
        </Badge>
        <p className="text-[10px] text-[#A89F91] mt-1">{timeAgo}</p>
      </div>
    </div>
  )
}

export default function AdminOverviewClient({ stats, recentRegs, events }: Props) {
  const verifiedPct =
    stats.totalReg > 0 ? Math.round((stats.verifiedReg / stats.totalReg) * 100) : 0

  return (
    <div className="max-w-6xl mx-auto space-y-7">
      {/* Page header — clean, single-purpose CTAs without duplicate links */}
      <ScrollReveal className="flex items-end justify-between flex-wrap gap-4 border-b border-[#3A291B]/80 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#CC892F] animate-pulse" />
            <span className="text-[10px] font-semibold tracking-[0.22em] uppercase text-[#E3B464]">
              DHRUVA Telemetry · Ops Online
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#F5EFE6]">
            Command <ShinyText text="Center" speed={5} className="font-serif" />
          </h1>
          <p className="text-xs text-[#A89F91] mt-1 max-w-lg">
            Real-time registration telemetry and conclave readiness across Kerala &amp; Lakshadweep Directorate.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Link href="/admin/registrations">
            <Button variant="bronze" size="sm">
              <ClipboardList className="w-3.5 h-3.5" />
              Registrations
            </Button>
          </Link>
          <Link href="/admin/events/new">
            <Button size="sm">
              <Plus className="w-3.5 h-3.5" />
              New Event
            </Button>
          </Link>
        </div>
      </ScrollReveal>

      {/* Stats grid */}
      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StaggerItem>
          <StatCard
            label="Total Registrations"
            value={stats.totalReg.toLocaleString()}
            sub={`${stats.verifiedReg} Verified · ${stats.pendingReg} Pending`}
            icon={UserCheck}
            badge={`${verifiedPct}% verified`}
            badgeVariant="success"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            label="Active Disciplines"
            value={stats.activeEventsCount}
            sub="Published & open events"
            icon={Trophy}
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            label="Enrolled Institutions"
            value={stats.institutionCount.toLocaleString()}
            sub="With active registrations"
            icon={Landmark}
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            label="Pending / Failed"
            value={stats.pendingReg + stats.flaggedReg}
            sub={`${stats.pendingReg} Pending · ${stats.flaggedReg} Failed`}
            icon={AlertTriangle}
            badge={stats.pendingReg > 0 ? 'Needs review' : 'All clear'}
            badgeVariant={stats.pendingReg > 0 ? 'warning' : 'success'}
          />
        </StaggerItem>
      </StaggerContainer>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activity Feed */}
        <ScrollReveal delay={0.05} className="lg:col-span-2">
          <SpotlightCard className="p-6 h-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#A89F91]">
                  Live Activity Feed
                </p>
                <h2 className="font-serif text-lg text-[#F4DD9F] mt-0.5">
                  Recent Registrations
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                  Live
                </span>
              </div>
            </div>

            {recentRegs.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <Inbox className="w-10 h-10 text-[#CC892F]/45" />
                <p className="text-[#A89F91] text-sm">No registrations recorded yet</p>
              </div>
            ) : (
              <div>
                {recentRegs.map((reg) => (
                  <ActivityItem key={reg.id} reg={reg} />
                ))}
              </div>
            )}

            <Link
              href="/admin/registrations"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#E3B464] hover:text-[#F4DD9F] transition"
            >
              Open Registration Ledger
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </SpotlightCard>
        </ScrollReveal>

        {/* Right Column: Registration Breakdown + Running Events */}
        <ScrollReveal delay={0.1} className="space-y-5">
          <SpotlightCard className="p-5">
            <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#A89F91] mb-4">
              Payment Status Breakdown
            </p>
            <div className="space-y-3">
              {[
                { label: 'Verified', value: stats.verifiedReg, color: 'bg-emerald-400' },
                { label: 'Pending', value: stats.pendingReg, color: 'bg-[#CC892F]' },
                { label: 'Failed', value: stats.flaggedReg, color: 'bg-red-400' },
              ].map(({ label, value, color }) => {
                const pct = stats.totalReg > 0 ? Math.round((value / stats.totalReg) * 100) : 0
                return (
                  <div key={label}>
                    <div className="flex justify-between text-xs text-[#A89F91] mb-1">
                      <span>{label}</span>
                      <span className="text-[#F5EFE6]">
                        {pct}% ({value})
                      </span>
                    </div>
                    <div className="h-1.5 bg-[#242321] rounded-full overflow-hidden">
                      <div
                        className={`h-full ${color} rounded-full transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </SpotlightCard>

          <SpotlightCard className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#A89F91]">
                Running Disciplines
              </p>
              <Link
                href="/admin/events"
                className="text-[11px] font-semibold text-[#E3B464] hover:text-[#F4DD9F] transition inline-flex items-center gap-1"
              >
                Manage <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {events.length === 0 ? (
              <p className="text-xs text-[#A89F91] py-3">No active events yet.</p>
            ) : (
              <div className="space-y-2">
                {events.map((ev: any) => (
                  <Link
                    key={ev.id}
                    href={`/admin/events/${ev.id}/edit`}
                    className="flex items-center gap-2.5 px-3 py-2.5 bg-[#141311] hover:bg-[#242321] rounded-xl border border-[#3A291B]/70 transition"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span className="flex-1 text-xs text-[#F5EFE6] font-medium truncate">
                      {ev.title}
                    </span>
                    <span className="text-[10px] text-[#A89F91] shrink-0">
                      {Number(ev.fee ?? 0) > 0 ? `₹${Number(ev.fee)}` : 'Free'}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </SpotlightCard>
        </ScrollReveal>
      </div>
    </div>
  )
}
