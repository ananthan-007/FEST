'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  CheckCircle2,
  AlertCircle,
  Download,
  Search,
  Users,
  X,
} from 'lucide-react'
import { SpotlightCard, ShinyText } from '@/components/reactbits'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface RegistrationItem {
  id: string
  event_id: string
  event_title: string
  category_id: string | null
  category_name: string | null
  cadet_name: string
  cadet_email?: string
  cadet_phone?: string
  division: string
  participation_type: string
  team_name: string | null
  member_count: number
  payment_status: string
  razorpay_order_id: string | null
  institution_name: string
  created_at: string
  members?: { id: string; user_id: string; name: string; email?: string; role: string }[]
}

interface CategoryOption {
  id: string
  name: string
}

interface EventOption {
  id: string
  title: string
}

const divisionColors: Record<string, string> = {
  SD: 'bg-[#242321] border-[#CC892F]/50 text-[#F4DD9F]',
  SW: 'bg-[#242321] border-[#E3B464]/50 text-[#E3B464]',
  JD: 'bg-[#242321] border-emerald-500/35 text-emerald-300',
  JW: 'bg-[#242321] border-amber-500/35 text-amber-200',
}

export default function AdminRegistrationsPage() {
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([])
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [events, setEvents] = useState<EventOption[]>([])
  const [loading, setLoading] = useState(true)
  const [verifyingId, setVerifyingId] = useState<string | null>(null)
  const [expandedRosterId, setExpandedRosterId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedEvent, setSelectedEvent] = useState('')
  const [selectedDivision, setSelectedDivision] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  useEffect(() => {
    fetch('/api/admin/categories')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data)
      })
      .catch(() => {})

    fetch('/api/admin/events')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setEvents(data)
      })
      .catch(() => {})
  }, [])

  const fetchRegistrations = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (selectedCategory) params.set('category_id', selectedCategory)
    if (selectedEvent) params.set('event_id', selectedEvent)
    if (selectedDivision) params.set('division', selectedDivision)
    if (selectedStatus) params.set('payment_status', selectedStatus)

    try {
      const res = await fetch(`/api/admin/registrations?${params.toString()}`)
      const data = await res.json()
      setRegistrations(Array.isArray(data) ? data : [])
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch registrations', 'error')
    } finally {
      setLoading(false)
    }
  }, [selectedCategory, selectedEvent, selectedDivision, selectedStatus])

  useEffect(() => {
    fetchRegistrations()
  }, [fetchRegistrations])

  const handleVerifyPayment = async (regId: string) => {
    setVerifyingId(regId)
    try {
      const res = await fetch('/api/admin/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registration_id: regId }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        showToast(data.error || 'Payment verification failed', 'error')
      } else if (data.success && data.payment_status === 'verified') {
        setRegistrations((prev) =>
          prev.map((r) => (r.id === regId ? { ...r, payment_status: 'verified' } : r))
        )
        showToast('Payment verified successfully!', 'success')
      } else {
        showToast(data.message || 'Payment not yet captured by Razorpay', 'error')
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to verify payment', 'error')
    } finally {
      setVerifyingId(null)
    }
  }

  const handleExportCsv = () => {
    if (registrations.length === 0) return
    const headers = [
      'Cadet Name',
      'Email',
      'Phone',
      'Institution',
      'Event',
      'Category',
      'Division',
      'Format',
      'Team Name',
      'Members',
      'Payment Status',
      'Order ID',
      'Registered At',
    ]
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const rows = registrations.map((r) =>
      [
        r.cadet_name,
        r.cadet_email,
        r.cadet_phone,
        r.institution_name,
        r.event_title,
        r.category_name,
        r.division,
        r.participation_type,
        r.team_name || 'Individual',
        r.member_count,
        r.payment_status,
        r.razorpay_order_id || '',
        new Date(r.created_at).toISOString(),
      ]
        .map(esc)
        .join(',')
    )
    const csv = [headers.map(esc).join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `dhruva-registrations-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#3A291B]/80 pb-5">
        <div>
          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#CC892F] block mb-1">
            Enlistment Records
          </span>
          <h1 className="text-3xl font-serif text-[#F5EFE6]">
            Registration <ShinyText text="Ledger" speed={5} className="font-serif" />
          </h1>
          <p className="text-xs text-[#A89F91] mt-1">
            Review cadet deployments, inspect squad rosters, export records, and verify pending payments.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="h-9 px-4 flex items-center bg-[#0D0C0A] border border-[#3A291B] rounded-full text-xs font-medium text-[#A89F91]">
            Total:{' '}
            <span className="font-bold text-[#F4DD9F] ml-1">{registrations.length}</span>
          </div>
          <Button
            variant="bronze"
            size="sm"
            onClick={handleExportCsv}
            disabled={registrations.length === 0}
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Toast Alert */}
      {toast && (
        <div
          className={`px-4 py-3 rounded-xl text-xs font-medium flex items-center justify-between gap-3 border ${
            toast.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/12 border-red-500/30 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{toast.msg}</span>
          </div>
          <button onClick={() => setToast(null)} className="opacity-60 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters Bar */}
      <SpotlightCard className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Category',
            value: selectedCategory,
            onChange: (v: string) => { setSelectedCategory(v); setSelectedEvent('') },
            options: [
              { value: '', label: 'All Categories' },
              ...categories.map((c) => ({ value: c.id, label: c.name })),
            ],
          },
          {
            label: 'Event',
            value: selectedEvent,
            onChange: (v: string) => setSelectedEvent(v),
            options: [
              { value: '', label: 'All Events' },
              ...events.map((ev) => ({ value: ev.id, label: ev.title })),
            ],
          },
          {
            label: 'Division',
            value: selectedDivision,
            onChange: (v: string) => setSelectedDivision(v),
            options: [
              { value: '', label: 'All Divisions' },
              { value: 'SD', label: 'SD — Senior Division' },
              { value: 'SW', label: 'SW — Senior Wing' },
              { value: 'JD', label: 'JD — Junior Division' },
              { value: 'JW', label: 'JW — Junior Wing' },
            ],
          },
          {
            label: 'Payment Status',
            value: selectedStatus,
            onChange: (v: string) => setSelectedStatus(v),
            options: [
              { value: '', label: 'All Statuses' },
              { value: 'pending', label: 'Pending' },
              { value: 'verified', label: 'Verified' },
              { value: 'failed', label: 'Failed' },
            ],
          },
        ].map(({ label, value, onChange, options }) => (
          <div key={label}>
            <label className="block text-[10px] font-semibold tracking-[0.14em] uppercase text-[#A89F91] mb-1.5">
              {label}
            </label>
            <select
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full h-10 bg-[#141311] border border-[#3A291B] rounded-lg px-3 text-xs text-[#F5EFE6] focus:outline-none focus:border-[#CC892F]"
            >
              {options.map((o) => (
                <option key={o.value} value={o.value} className="bg-[#0D0C0A]">
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </SpotlightCard>

      {/* Registrations Table */}
      <SpotlightCard className="overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-[#CC892F] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-[#A89F91] uppercase tracking-widest">Loading Registrations…</p>
          </div>
        ) : registrations.length === 0 ? (
          <div className="py-16 text-center">
            <Search className="w-9 h-9 text-[#CC892F]/35 mx-auto mb-2" />
            <p className="text-sm font-medium text-[#A89F91]">No registrations match current filters</p>
            <p className="text-xs text-[#A89F91]/70 mt-1">Try clearing or adjusting filters above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#141311]/95 text-[10px] font-semibold tracking-[0.14em] uppercase text-[#A89F91] border-b border-[#3A291B]/70">
                <tr>
                  <th className="py-4 px-5">Cadet &amp; Institution</th>
                  <th className="py-4 px-5">Event</th>
                  <th className="py-4 px-5">Division</th>
                  <th className="py-4 px-5">Squad / Members</th>
                  <th className="py-4 px-5">Payment</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3A291B]/60 text-[#F5EFE6]">
                {registrations.map((reg) => {
                  const isPending = reg.payment_status === 'pending'
                  const isVerified =
                    reg.payment_status === 'verified' || reg.payment_status === 'paid'
                  const canVerify = isPending && Boolean(reg.razorpay_order_id)
                  const isExpanded = expandedRosterId === reg.id

                  return (
                    <tr key={reg.id} className="hover:bg-[#242321]/35 transition-colors align-top">
                      <td className="py-4 px-5">
                        <div className="font-semibold text-sm text-[#F4DD9F]">{reg.cadet_name}</div>
                        <div className="text-[11px] text-[#A89F91] mt-0.5">
                          {reg.institution_name}
                          {reg.cadet_phone && ` · ${reg.cadet_phone}`}
                        </div>
                        {reg.cadet_email && (
                          <div className="text-[10px] font-mono text-[#A89F91]/80 mt-0.5">
                            {reg.cadet_email}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-5">
                        <div className="font-medium text-[#F5EFE6]">{reg.event_title}</div>
                        {reg.category_name && (
                          <span className="text-[10px] text-[#A89F91]">{reg.category_name}</span>
                        )}
                      </td>
                      <td className="py-4 px-5">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            divisionColors[reg.division] || 'bg-[#242321] border-[#3A291B] text-[#A89F91]'
                          }`}
                        >
                          {reg.division}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <div className="space-y-1">
                          <div>
                            {reg.team_name ? (
                              <span className="font-medium text-[#F5EFE6]">{reg.team_name}</span>
                            ) : (
                              <span className="text-[11px] text-[#A89F91] italic">Individual</span>
                            )}
                          </div>
                          {reg.members && reg.members.length > 0 ? (
                            <button
                              type="button"
                              onClick={() => setExpandedRosterId(isExpanded ? null : reg.id)}
                              className="h-5 px-2 inline-flex items-center gap-1 bg-[#242321] hover:bg-[#3A291B] border border-[#3A291B] rounded-full font-semibold text-[10px] text-[#E3B464] transition"
                            >
                              <Users className="w-3 h-3" />
                              {reg.member_count} cadet{reg.member_count > 1 ? 's' : ''}
                            </button>
                          ) : (
                            <span className="h-5 px-2 inline-flex items-center bg-[#242321] rounded-full font-semibold text-[10px] text-[#A89F91]">
                              {reg.member_count} cadet{reg.member_count > 1 ? 's' : ''}
                            </span>
                          )}
                          {isExpanded && reg.members && (
                            <div className="mt-2 p-2 rounded-lg bg-[#141311] border border-[#3A291B] space-y-1">
                              {reg.members.map((m) => (
                                <div key={m.id} className="text-[10px] flex items-center justify-between gap-2">
                                  <span className="text-[#F5EFE6] truncate">{m.name}</span>
                                  <span className="uppercase text-[#A89F91]">{m.role}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <Badge variant={isVerified ? 'success' : isPending ? 'gold' : 'danger'}>
                          {isVerified ? 'Verified' : isPending ? 'Pending' : reg.payment_status}
                        </Badge>
                        {reg.razorpay_order_id && (
                          <div
                            className="text-[10px] text-[#A89F91]/70 font-mono mt-1 truncate max-w-[130px]"
                            title={reg.razorpay_order_id}
                          >
                            {reg.razorpay_order_id}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-5 text-right">
                        {canVerify ? (
                          <Button
                            size="sm"
                            onClick={() => handleVerifyPayment(reg.id)}
                            disabled={verifyingId === reg.id}
                          >
                            {verifyingId === reg.id ? 'Verifying…' : 'Verify Payment'}
                          </Button>
                        ) : (
                          <span className="text-[10px] text-[#A89F91]/40">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </SpotlightCard>
    </div>
  )
}
