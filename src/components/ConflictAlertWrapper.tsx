'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertTriangle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
      <Link href={`/register/${eventId}`} className="block">
        <Button size="lg" className="w-full h-14">
          <span>Register Now</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </Link>
    )
  }

  return (
    <>
      <Button
        onClick={() => setModalOpen(true)}
        size="lg"
        className="w-full h-14"
      >
        <span>Register Now</span>
        <ArrowRight className="w-4 h-4" />
      </Button>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="conflict-modal-title"
        >
          <div className="bg-[#0D0C0A] border border-[#CC892F]/50 rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-7 space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#CC892F]/15 border border-[#CC892F]/40 text-[#E3B464] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h2 id="conflict-modal-title" className="text-lg font-serif text-[#F4DD9F]">
                  Schedule Conflict Notice
                </h2>
                <p className="text-xs text-[#A89F91] mt-2 leading-relaxed">
                  This operation may overlap with other deployments you have registered for. Concurrent
                  scheduling may prevent simultaneous participation.
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2 border-t border-[#3A291B]/70">
              <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                Abort
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setModalOpen(false)
                  router.push(`/register/${eventId}`)
                }}
              >
                Continue to Enlist
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
