'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Props {
  eventId: string
  conflictAlertEnabled: boolean
  userId: string
}

export default function ConflictAlertWrapper({ eventId, conflictAlertEnabled, userId: _userId }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const router = useRouter()

  if (!conflictAlertEnabled) {
    return (
      <Link
        href={`/register/${eventId}`}
        className="flex items-center justify-center h-14 w-full bg-[#C8102E] hover:bg-[#A00B22] text-white font-bold rounded-full shadow-[0_0_24px_rgba(200,16,46,0.4)] transition text-xs uppercase tracking-wider gap-2"
      >
        <span>Register Now</span>
        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
      </Link>
    )
  }

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="flex items-center justify-center h-14 w-full bg-[#C8102E] hover:bg-[#A00B22] text-white font-bold rounded-full shadow-[0_0_24px_rgba(200,16,46,0.4)] transition text-xs uppercase tracking-wider gap-2"
      >
        <span>Register Now</span>
        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
      </button>

      {/* Conflict Alert Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="conflict-modal-title"
        >
          <div className="bg-[#0D1321] border border-amber-500/30 rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-7 space-y-5">
            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">warning</span>
              </div>
              <div>
                <h2 id="conflict-modal-title" className="text-lg font-serif text-[#DDE2F6]">
                  Schedule Conflict Notice
                </h2>
                <p className="text-xs text-[#8A94A8] mt-2 leading-relaxed">
                  This operation may overlap with other deployments you have registered for. Concurrent
                  scheduling may prevent simultaneous participation.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-2 border-t border-white/5">
              <button
                onClick={() => setModalOpen(false)}
                className="h-10 px-5 rounded-full border border-white/10 text-xs font-semibold text-[#8A94A8] hover:text-[#DDE2F6] hover:bg-white/5 transition"
              >
                Abort
              </button>
              <button
                onClick={() => {
                  setModalOpen(false)
                  router.push(`/register/${eventId}`)
                }}
                className="h-10 px-6 rounded-full text-xs font-bold bg-[#C8102E] hover:bg-[#A00B22] text-white shadow-[0_0_15px_rgba(200,16,46,0.35)] transition uppercase tracking-wider"
              >
                Continue to Enlist
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
