'use client'

import { useState, useEffect, useCallback } from 'react'

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
  members?: { id: string; user_id: string; name: string; role: string }[]
}

interface CategoryOption {
  id: string
  name: string
}

interface EventOption {
  id: string
  title: string
  categoryId?: string
  category_id?: string
}

const divisionColors: Record<string, string> = {
  SD: 'bg-blue-500/15 border-blue-500/30 text-blue-400',
  SW: 'bg-purple-500/15 border-purple-500/30 text-purple-400',
  JD: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
  JW: 'bg-pink-500/15 border-pink-500/30 text-pink-400',
}

export default function AdminRegistrationsPage() {
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([])
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [events, setEvents] = useState<EventOption[]>([])
  const [loading, setLoading] = useState(true)
  const [verifyingId, setVerifyingId] = useState<string | null>(null)
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

  // Load filter options
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

  // Fetch registrations
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
      if (Array.isArray(data)) {
        setRegistrations(data)
      } else {
        setRegistrations([])
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch registrations', 'error')
    } finally {
      setLoading(false)
    }
  }, [selectedCategory, selectedEvent, selectedDivision, selectedStatus])

  useEffect(() => {
    fetchRegistrations()
  }, [fetchRegistrations])

  // Verify payment action
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#C8102E] block mb-1">
            Enlistment Records
          </span>
          <h1 className="text-2xl font-serif text-[#DDE2F6]">Cadet Registration Ledger</h1>
          <p className="text-xs text-[#8A94A8] mt-1">
            Review operational deployments, inspect squad rosters, and verify pending payment authorisations.
          </p>
        </div>
        <div className="h-9 px-4 flex items-center bg-[#0D1321]/80 border border-white/8 rounded-full text-xs font-medium text-[#8A94A8] shrink-0">
          Total:{' '}
          <span className="font-bold text-[#FFB3B1] ml-1">{registrations.length}</span>
          &nbsp;registrations
        </div>
      </div>

      {/* Toast Alert */}
      {toast && (
        <div
          className={`px-4 py-3 rounded-xl text-xs font-medium flex items-center justify-between gap-3 ${
            toast.type === 'success'
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
              : 'bg-[#C8102E]/15 border border-[#C8102E]/30 text-[#FFB3B1]'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">
              {toast.type === 'success' ? 'check_circle' : 'error'}
            </span>
            {toast.msg}
          </div>
          <button onClick={() => setToast(null)} className="text-current opacity-60 hover:opacity-100">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-[#0D1321]/80 backdrop-blur-xl border border-white/8 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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
            <label className="block text-[10px] font-semibold tracking-[0.14em] uppercase text-[#8A94A8] mb-1.5">
              {label}
            </label>
            <select
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full h-10 bg-[#161B2A] border border-white/10 rounded-lg px-3 text-xs text-[#DDE2F6] focus:outline-none focus:border-[#C8102E]"
            >
              {options.map((o) => (
                <option key={o.value} value={o.value} className="bg-[#0D1321]">
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Registrations Table */}
      <div className="bg-[#0D1321]/80 backdrop-blur-xl border border-white/8 rounded-2xl shadow-2xl overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-[#C8102E] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-[#8A94A8] uppercase tracking-widest">Loading Registrations…</p>
          </div>
        ) : registrations.length === 0 ? (
          <div className="py-16 text-center">
            <span className="material-symbols-outlined text-4xl text-[#8A94A8]/30 block mb-2">
              manage_search
            </span>
            <p className="text-sm font-medium text-[#8A94A8]">No registrations match current filters</p>
            <p className="text-xs text-[#8A94A8]/60 mt-1">Try clearing or adjusting filters above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#161B2A]/90 text-[10px] font-semibold tracking-[0.14em] uppercase text-[#8A94A8] border-b border-white/5">
                <tr>
                  <th className="py-4 px-5">Cadet</th>
                  <th className="py-4 px-5">Event</th>
                  <th className="py-4 px-5">Division</th>
                  <th className="py-4 px-5">Squad</th>
                  <th className="py-4 px-5">Members</th>
                  <th className="py-4 px-5">Payment</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[#DDE2F6]">
                {registrations.map((reg) => {
                  const isPending = reg.payment_status === 'pending'
                  const isVerified =
                    reg.payment_status === 'verified' || reg.payment_status === 'paid'
                  const hasOrder = Boolean(reg.razorpay_order_id)
                  const canVerify = isPending && hasOrder

                  return (
                    <tr key={reg.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-5">
                        <div className="font-semibold text-sm text-[#DDE2F6]">{reg.cadet_name}</div>
                        <div className="text-[11px] text-[#8A94A8] mt-0.5">
                          {reg.institution_name}
                          {reg.cadet_phone && ` · ${reg.cadet_phone}`}
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="font-medium text-[#DDE2F6]">{reg.event_title}</div>
                        {reg.category_name && (
                          <span className="text-[10px] text-[#8A94A8]">{reg.category_name}</span>
                        )}
                      </td>
                      <td className="py-4 px-5">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            divisionColors[reg.division] || 'bg-white/5 border-white/10 text-[#8A94A8]'
                          }`}
                        >
                          {reg.division}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        {reg.team_name ? (
                          <span className="font-medium text-[#DDE2F6]">{reg.team_name}</span>
                        ) : (
                          <span className="text-[11px] text-[#8A94A8]/60 italic">Individual</span>
                        )}
                      </td>
                      <td className="py-4 px-5">
                        <span className="h-5 px-2 inline-flex items-center bg-white/5 rounded-full font-semibold text-[10px] text-[#DDE2F6]">
                          {reg.member_count} cadet{reg.member_count > 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <span
                          className={`inline-flex items-center gap-1.5 h-6 px-3 rounded-full text-[10px] font-semibold border ${
                            isVerified
                              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                              : isPending
                              ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                              : 'bg-red-500/15 border-red-500/30 text-red-400'
                          }`}
                        >
                          <span
                            className={`w-1 h-1 rounded-full ${
                              isVerified
                                ? 'bg-emerald-400'
                                : isPending
                                ? 'bg-amber-400'
                                : 'bg-red-400'
                            }`}
                          />
                          {isVerified ? 'Verified' : isPending ? 'Pending' : reg.payment_status}
                        </span>
                        {reg.razorpay_order_id && (
                          <div
                            className="text-[10px] text-[#8A94A8]/60 font-mono mt-0.5 truncate max-w-[130px]"
                            title={reg.razorpay_order_id}
                          >
                            {reg.razorpay_order_id}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-5 text-right">
                        {canVerify ? (
                          <button
                            onClick={() => handleVerifyPayment(reg.id)}
                            disabled={verifyingId === reg.id}
                            className="inline-flex items-center gap-1.5 h-8 px-4 bg-[#C8102E] hover:bg-[#A00B22] text-white text-[10px] font-bold rounded-full shadow-[0_0_12px_rgba(200,16,46,0.35)] transition disabled:opacity-50 uppercase tracking-wider"
                          >
                            {verifyingId === reg.id ? (
                              <>
                                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Verifying…
                              </>
                            ) : (
                              'Verify Payment'
                            )}
                          </button>
                        ) : (
                          <span className="text-[10px] text-[#8A94A8]/40">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
