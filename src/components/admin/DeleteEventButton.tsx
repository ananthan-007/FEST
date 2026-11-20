'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteEventButton({
  eventId,
  hasRegistrations,
}: {
  eventId: string
  hasRegistrations: boolean
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    const confirmMsg = hasRegistrations
      ? 'This event has registrations. It will be soft-cancelled instead of permanently removed. Continue?'
      : 'Are you sure you want to delete this event?'

    if (!confirm(confirmMsg)) return

    setLoading(true)
    try {
      const res = await fetch(`/api/admin/events/${eventId}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error || 'Failed to delete event')
      } else {
        router.refresh()
      }
    } catch (err: any) {
      alert(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-[#C8102E]/15 border border-[#C8102E]/30 text-[#FFB3B1] hover:bg-[#C8102E]/25 text-[10px] font-bold uppercase tracking-wider transition disabled:opacity-50"
    >
      <span className="material-symbols-outlined text-sm">
        {loading ? 'hourglass_empty' : 'delete'}
      </span>
      {loading ? 'Deleting...' : 'Delete'}
    </button>
  )
}
