'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import RazorpayCheckout from './RazorpayCheckout'

interface EventData {
  id: string
  title: string
  participationType: 'individual' | 'team'
  eligibleDivisions: string[]
  institutionRestriction: string
  teamMin: number | null
  teamMax: number | null
  fee: number | string | null
  conflictAlertEnabled: boolean
}

interface UserProfile {
  id: string
  displayName: string | null
  division: string | null
  profileComplete: boolean
}

interface ConflictingEvent {
  id: string
  title: string
}

interface MemberState {
  email: string
  status: 'idle' | 'loading' | 'found' | 'not_found'
  name?: string
}

export default function RegistrationForm({
  event,
  userProfile,
}: {
  event: EventData
  userProfile: UserProfile
}) {
  const router = useRouter()
  const isTeam = event.participationType === 'team'
  const minMembers = event.teamMin ?? 1
  const maxMembers = event.teamMax ?? 5

  const [teamName, setTeamName] = useState('')
  const [members, setMembers] = useState<MemberState[]>(() =>
    isTeam
      ? Array.from({ length: minMembers }, () => ({
          email: '',
          status: 'idle',
        }))
      : []
  )

  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Stage 2 conflict modal state
  const [conflicts, setConflicts] = useState<ConflictingEvent[] | null>(null)
  const [showConflictModal, setShowConflictModal] = useState(false)

  // Payment state
  const [paymentData, setPaymentData] = useState<{
    registrationId: string
    razorpayOrderId?: string
    amount?: number
    currency?: string
    paymentStatus?: string
    razorpayKey?: string
  } | null>(null)

  const [paymentSuccess, setPaymentSuccess] = useState(false)

  // Member email lookup with debounce
  const lookupMemberEmail = useCallback(async (index: number, email: string) => {
    if (!email || !email.includes('@')) {
      setMembers((prev) => {
        const copy = [...prev]
        copy[index] = { email, status: 'idle' }
        return copy
      })
      return
    }

    setMembers((prev) => {
      const copy = [...prev]
      copy[index] = { ...copy[index], email, status: 'loading' }
      return copy
    })

    try {
      const res = await fetch(`/api/user/lookup?email=${encodeURIComponent(email.trim())}`)
      if (res.ok) {
        const data = await res.json()
        setMembers((prev) => {
          const copy = [...prev]
          copy[index] = {
            email,
            status: 'found',
            name: data.displayName || 'Cadet',
          }
          return copy
        })
      } else {
        setMembers((prev) => {
          const copy = [...prev]
          copy[index] = { email, status: 'not_found' }
          return copy
        })
      }
    } catch {
      setMembers((prev) => {
        const copy = [...prev]
        copy[index] = { email, status: 'not_found' }
        return copy
      })
    }
  }, [])

  // Debounced input change
  useEffect(() => {
    const timers: NodeJS.Timeout[] = []
    members.forEach((m, idx) => {
      if (m.status === 'idle' && m.email.trim().length > 3) {
        const timer = setTimeout(() => {
          lookupMemberEmail(idx, m.email)
        }, 400)
        timers.push(timer)
      }
    })
    return () => {
      timers.forEach((t) => clearTimeout(t))
    }
  }, [members, lookupMemberEmail])

  const handleMemberEmailChange = (index: number, value: string) => {
    setMembers((prev) => {
      const copy = [...prev]
      copy[index] = { email: value, status: 'idle' }
      return copy
    })
  }

  const addMemberSlot = () => {
    if (members.length < maxMembers) {
      setMembers((prev) => [...prev, { email: '', status: 'idle' }])
    }
  }

  const removeMemberSlot = (index: number) => {
    if (members.length > minMembers) {
      setMembers((prev) => prev.filter((_, idx) => idx !== index))
    }
  }

  const handleSubmit = async (forceConflict: boolean = false) => {
    setLoading(true)
    setErrorMessage(null)

    if (isTeam && !teamName.trim()) {
      setErrorMessage('Please enter a team name.')
      setLoading(false)
      return
    }

    if (isTeam) {
      const invalidMembers = members.some((m) => !m.email.trim() || m.status === 'not_found')
      if (invalidMembers) {
        setErrorMessage('All member emails must be valid registered cadets.')
        setLoading(false)
        return
      }
    }

    try {
      const payload: {
        event_id: string
        team_name?: string
        member_emails?: string[]
        force_conflict?: boolean
      } = {
        event_id: event.id,
        force_conflict: forceConflict,
      }

      if (isTeam) {
        payload.team_name = teamName.trim()
        payload.member_emails = members.map((m) => m.email.trim())
      }

      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (res.status === 409 && data.conflict) {
        // Stage 2 Conflict Alert
        setConflicts(data.conflicting_events || [])
        setShowConflictModal(true)
        setLoading(false)
        return
      }

      if (!res.ok) {
        setErrorMessage(data.error || 'Registration failed.')
        setLoading(false)
        return
      }

      // Success
      setShowConflictModal(false)
      setPaymentData({
        registrationId: data.registration_id,
        razorpayOrderId: data.razorpay_order_id,
        amount: data.amount,
        currency: data.currency,
        paymentStatus: data.payment_status,
        razorpayKey: data.key,
      })
      if (data.payment_status === 'verified') {
        setPaymentSuccess(true)
      }
    } catch (err) {
      console.error(err)
      setErrorMessage('An unexpected network error occurred.')
    } finally {
      setLoading(false)
    }
  }

  // If already verified or paid
  if (paymentSuccess) {
    return (
      <div className="bg-[#0D1321]/80 backdrop-blur-xl rounded-2xl border border-white/8 p-8 text-center max-w-lg mx-auto shadow-2xl">
        <div className="w-16 h-16 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-3xl">check_circle</span>
        </div>
        <h2 className="text-2xl font-serif text-[#DDE2F6] mb-2">Registration Confirmed</h2>
        <p className="text-sm text-[#8A94A8] mb-6">
          Cadet credentials established for <strong className="text-[#DDE2F6]">{event.title}</strong>.
          Your QR entry pass has been updated on your dashboard.
        </p>
        <Link
          href="/dashboard"
          className="inline-block py-3 px-8 bg-[#C8102E] hover:bg-[#A00B22] text-white font-semibold rounded-full shadow-[0_0_20px_rgba(200,16,46,0.4)] transition text-xs uppercase tracking-wider"
        >
          View Entry Pass →
        </Link>
      </div>
    )
  }

  // If payment order created and needs checkout
  if (paymentData?.razorpayOrderId && paymentData?.amount) {
    return (
      <div className="bg-[#0D1321]/80 backdrop-blur-xl rounded-2xl border border-white/8 p-8 max-w-lg mx-auto shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-[#C8102E]/15 border border-[#C8102E]/30 text-[#FFB3B1] rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
          </div>
          <h2 className="text-2xl font-serif text-[#DDE2F6]">Payment Verification</h2>
          <p className="text-[#8A94A8] text-xs mt-1">
            Complete transaction to finalize registration credentials.
          </p>
        </div>

        <div className="bg-[#161B2A] rounded-xl p-4 mb-6 border border-white/5 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[#8A94A8]">Operation</span>
            <span className="font-semibold text-[#DDE2F6]">{event.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8A94A8]">Leader</span>
            <span className="font-medium text-[#DDE2F6]">{userProfile.displayName}</span>
          </div>
          {isTeam && (
            <div className="flex justify-between">
              <span className="text-[#8A94A8]">Squad Call-sign</span>
              <span className="font-medium text-[#DDE2F6]">{teamName}</span>
            </div>
          )}
          <div className="border-t border-white/10 pt-2 flex justify-between font-bold text-[#DDE2F6]">
            <span>Total Payable</span>
            <span className="text-[#FFB3B1]">₹{(paymentData.amount / 100).toFixed(2)}</span>
          </div>
        </div>

        <RazorpayCheckout
          orderId={paymentData.razorpayOrderId}
          amount={paymentData.amount}
          currency={paymentData.currency || 'INR'}
          registrationId={paymentData.registrationId}
          razorpayKey={paymentData.razorpayKey}
          onSuccess={() => {
            setPaymentSuccess(true)
          }}
        />
      </div>
    )
  }

  const feeNumber = Number(event.fee ?? 0)

  return (
    <div className="bg-[#0D1321]/80 backdrop-blur-xl rounded-2xl border border-white/8 p-6 sm:p-8 shadow-2xl">
      {errorMessage && (
        <div className="mb-6 flex items-center gap-2 p-4 rounded-xl bg-[#C8102E]/15 border border-[#C8102E]/30 text-[#FFB3B1] text-sm">
          <span className="material-symbols-outlined text-lg">error</span>
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="mb-6 border-b border-white/10 pb-4">
        <h2 className="text-xl font-serif text-[#DDE2F6]">
          {isTeam ? 'Squad Manifest' : 'Cadet Registration'}
        </h2>
        <p className="text-xs text-[#8A94A8] mt-1">
          {isTeam
            ? `Enlist your squad (${minMembers} to ${maxMembers} cadets). You are designated Squad Leader.`
            : 'Confirm your individual operational deployment for this event.'}
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSubmit(false)
        }}
        className="space-y-6"
      >
        {isTeam && (
          <div>
            <label className="block text-[10px] font-semibold tracking-[0.14em] uppercase text-[#8A94A8] mb-2">
              Squad Name / Call-Sign *
            </label>
            <input
              type="text"
              required
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="e.g. Victor Squad"
              className="h-12 w-full bg-[#161B2A] border border-white/10 rounded-full px-5 text-[#DDE2F6] placeholder-[#8A94A8]/60 text-sm focus:outline-none focus:ring-1 focus:ring-[#C8102E]"
            />
          </div>
        )}

        {isTeam && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="block text-[10px] font-semibold tracking-[0.14em] uppercase text-[#8A94A8]">
                Squad Roster ({members.length}/{maxMembers})
              </label>
              {members.length < maxMembers && (
                <button
                  type="button"
                  onClick={addMemberSlot}
                  className="h-7 px-3 bg-[#161B2A] border border-white/10 hover:border-[#C8102E]/40 rounded-full text-[10px] font-semibold uppercase tracking-wider text-[#ADC6FF] hover:text-white transition"
                >
                  + Add Member
                </button>
              )}
            </div>

            {members.map((member, idx) => (
              <div
                key={idx}
                className="bg-[#161B2A]/90 p-3.5 rounded-xl border border-white/5 space-y-2"
              >
                <div className="flex gap-2 items-center">
                  <div className="flex-1">
                    <input
                      type="email"
                      required
                      placeholder={`Cadet ${idx + 1} Registered Email`}
                      value={member.email}
                      onChange={(e) => handleMemberEmailChange(idx, e.target.value)}
                      className="h-10 w-full bg-[#0D1321] border border-white/10 rounded-lg px-3 text-[#DDE2F6] placeholder-[#8A94A8]/50 text-xs focus:outline-none focus:border-[#C8102E]"
                    />
                  </div>
                  {members.length > minMembers && (
                    <button
                      type="button"
                      onClick={() => removeMemberSlot(idx)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[#8A94A8] hover:text-[#C8102E] hover:bg-white/5 transition"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  )}
                </div>

                {/* Status indicator */}
                <div className="text-[10px]">
                  {member.status === 'loading' && (
                    <span className="text-[#8A94A8] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ADC6FF] animate-pulse" />
                      Verifying cadet registry…
                    </span>
                  )}
                  {member.status === 'found' && (
                    <span className="text-emerald-400 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Cadet Verified: {member.name}
                    </span>
                  )}
                  {member.status === 'not_found' && (
                    <span className="text-[#FFB3B1] font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C8102E]" />
                      Cadet record not found
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Card */}
        <div className="bg-[#161B2A] rounded-xl p-4 border border-white/5 text-xs space-y-2">
          <div className="flex justify-between text-[#8A94A8]">
            <span>Participation Type:</span>
            <span className="font-semibold text-[#DDE2F6] capitalize">{event.participationType}</span>
          </div>
          <div className="flex justify-between text-[#8A94A8]">
            <span>Registration Fee:</span>
            <span className="font-semibold text-[#DDE2F6]">
              {feeNumber > 0 ? `₹${feeNumber.toFixed(2)}` : 'Complimentary'}
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-full font-semibold text-white bg-[#C8102E] hover:bg-[#A00B22] shadow-[0_0_20px_rgba(200,16,46,0.35)] transition disabled:opacity-50 text-xs uppercase tracking-wider flex items-center justify-center gap-2"
        >
          {loading ? (
            'Processing Enlistment…'
          ) : feeNumber > 0 ? (
            <>
              Proceed to Payment
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </>
          ) : (
            <>
              Confirm Registration
              <span className="material-symbols-outlined text-[18px]">verified</span>
            </>
          )}
        </button>
      </form>

      {/* Stage 2 Conflict Modal */}
      {showConflictModal && conflicts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <div className="bg-[#0D1321] border border-amber-500/30 rounded-2xl shadow-2xl max-w-md w-full p-6 text-left">
            <div className="w-12 h-12 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-2xl">warning</span>
            </div>
            <h3 className="text-lg font-serif text-[#DDE2F6] mb-2">Schedule Conflict Detected</h3>
            <p className="text-xs text-[#8A94A8] leading-relaxed mb-5">
              You are currently registered for{' '}
              <strong className="text-amber-400">
                {conflicts.map((c) => c.title).join(', ')}
              </strong>{' '}
              which runs concurrently with this operation. Do you still intend to proceed?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowConflictModal(false)}
                className="h-10 px-5 rounded-full border border-white/10 text-xs font-semibold text-[#8A94A8] hover:text-[#DDE2F6] hover:bg-white/5 transition"
              >
                Abort
              </button>
              <button
                type="button"
                onClick={() => handleSubmit(true)}
                className="h-10 px-6 bg-amber-600 hover:bg-amber-500 rounded-full text-xs font-bold text-black uppercase tracking-wider shadow transition"
              >
                Proceed Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
