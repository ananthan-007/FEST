'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { AlertTriangle, ArrowRight, CheckCircle2, Verified, Wallet, X } from 'lucide-react'
import RazorpayCheckout from './RazorpayCheckout'
import { SpotlightCard } from '@/components/reactbits'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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
  const [conflicts, setConflicts] = useState<ConflictingEvent[] | null>(null)
  const [showConflictModal, setShowConflictModal] = useState(false)

  const [paymentData, setPaymentData] = useState<{
    registrationId: string
    razorpayOrderId?: string
    amount?: number
    currency?: string
    paymentStatus?: string
    razorpayKey?: string
  } | null>(null)

  const [paymentSuccess, setPaymentSuccess] = useState(false)

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

  if (paymentSuccess) {
    return (
      <SpotlightCard className="p-8 text-center max-w-lg mx-auto">
        <div className="w-16 h-16 bg-emerald-500/15 border border-emerald-500/35 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif text-[#F4DD9F] mb-2">Registration Confirmed</h2>
        <p className="text-sm text-[#A89F91] mb-6">
          Cadet credentials established for <strong className="text-[#F5EFE6]">{event.title}</strong>.
          Your QR entry pass has been updated on your dashboard.
        </p>
        <Link href="/dashboard">
          <Button>View Entry Pass →</Button>
        </Link>
      </SpotlightCard>
    )
  }

  if (paymentData?.razorpayOrderId && paymentData?.amount) {
    return (
      <SpotlightCard className="p-8 max-w-lg mx-auto">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-[#CC892F]/15 border border-[#CC892F]/40 text-[#F4DD9F] rounded-full flex items-center justify-center mx-auto mb-3">
            <Wallet className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-serif text-[#F4DD9F]">Payment Verification</h2>
          <p className="text-[#A89F91] text-xs mt-1">
            Complete transaction to finalize registration credentials.
          </p>
        </div>

        <div className="bg-[#141311] rounded-xl p-4 mb-6 border border-[#3A291B]/80 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[#A89F91]">Operation</span>
            <span className="font-semibold text-[#F5EFE6]">{event.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#A89F91]">Leader</span>
            <span className="font-medium text-[#F5EFE6]">{userProfile.displayName}</span>
          </div>
          {isTeam && (
            <div className="flex justify-between">
              <span className="text-[#A89F91]">Squad Call-sign</span>
              <span className="font-medium text-[#F5EFE6]">{teamName}</span>
            </div>
          )}
          <div className="border-t border-[#3A291B]/70 pt-2 flex justify-between font-bold text-[#F5EFE6]">
            <span>Total Payable</span>
            <span className="text-[#F4DD9F]">₹{(paymentData.amount / 100).toFixed(2)}</span>
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
      </SpotlightCard>
    )
  }

  const feeNumber = Number(event.fee ?? 0)

  return (
    <SpotlightCard className="p-6 sm:p-8">
      {errorMessage && (
        <div className="mb-6 flex items-center gap-2 p-4 rounded-xl bg-red-500/12 border border-red-500/30 text-red-300 text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="mb-6 border-b border-[#3A291B]/70 pb-4">
        <h2 className="text-xl font-serif text-[#F4DD9F]">
          {isTeam ? 'Squad Manifest' : 'Cadet Registration'}
        </h2>
        <p className="text-xs text-[#A89F91] mt-1">
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
            <label className="block text-[10px] font-semibold tracking-[0.14em] uppercase text-[#A89F91] mb-2">
              Squad Name / Call-Sign *
            </label>
            <Input
              type="text"
              required
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="e.g. Dhruva Alpha"
              className="h-12"
            />
          </div>
        )}

        {isTeam && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="block text-[10px] font-semibold tracking-[0.14em] uppercase text-[#A89F91]">
                Squad Roster ({members.length}/{maxMembers})
              </label>
              {members.length < maxMembers && (
                <Button type="button" variant="bronze" size="sm" onClick={addMemberSlot}>
                  + Add Member
                </Button>
              )}
            </div>

            {members.map((member, idx) => (
              <div
                key={idx}
                className="bg-[#141311] p-3.5 rounded-xl border border-[#3A291B]/80 space-y-2"
              >
                <div className="flex gap-2 items-center">
                  <div className="flex-1">
                    <Input
                      type="email"
                      required
                      placeholder={`Cadet ${idx + 1} Registered Email`}
                      value={member.email}
                      onChange={(e) => handleMemberEmailChange(idx, e.target.value)}
                      className="h-10 text-xs"
                    />
                  </div>
                  {members.length > minMembers && (
                    <button
                      type="button"
                      onClick={() => removeMemberSlot(idx)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[#A89F91] hover:text-[#F4DD9F] hover:bg-white/5 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="text-[10px]">
                  {member.status === 'loading' && (
                    <span className="text-[#A89F91] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E3B464] animate-pulse" />
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
                    <span className="text-red-300 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                      Cadet record not found
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="bg-[#141311] rounded-xl p-4 border border-[#3A291B]/80 text-xs space-y-2">
          <div className="flex justify-between text-[#A89F91]">
            <span>Participation Type:</span>
            <span className="font-semibold text-[#F5EFE6] capitalize">{event.participationType}</span>
          </div>
          <div className="flex justify-between text-[#A89F91]">
            <span>Registration Fee:</span>
            <span className="font-semibold text-[#F4DD9F]">
              {feeNumber > 0 ? `₹${feeNumber.toFixed(2)}` : 'Complimentary'}
            </span>
          </div>
        </div>

        <Button type="submit" disabled={loading} size="lg" className="w-full h-12">
          {loading ? (
            'Processing Enlistment…'
          ) : feeNumber > 0 ? (
            <>
              Proceed to Payment
              <ArrowRight className="w-4 h-4" />
            </>
          ) : (
            <>
              Confirm Registration
              <Verified className="w-4 h-4" />
            </>
          )}
        </Button>
      </form>

      {showConflictModal && conflicts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#0D0C0A] border border-[#CC892F]/50 rounded-2xl shadow-2xl max-w-md w-full p-6 text-left">
            <div className="w-12 h-12 rounded-full bg-[#CC892F]/15 border border-[#CC892F]/40 text-[#E3B464] flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif text-[#F4DD9F] mb-2">Schedule Conflict Detected</h3>
            <p className="text-xs text-[#A89F91] leading-relaxed mb-5">
              You are currently registered for{' '}
              <strong className="text-[#E3B464]">
                {conflicts.map((c) => c.title).join(', ')}
              </strong>{' '}
              which runs concurrently with this operation. Do you still intend to proceed?
            </p>
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowConflictModal(false)}>
                Abort
              </Button>
              <Button type="button" size="sm" onClick={() => handleSubmit(true)}>
                Proceed Anyway
              </Button>
            </div>
          </div>
        </div>
      )}
    </SpotlightCard>
  )
}
