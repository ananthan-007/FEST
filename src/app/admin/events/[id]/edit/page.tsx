'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import EventForm from '@/components/admin/EventForm'
import { ShinyText } from '@/components/reactbits'

export default function EditEventPage() {
  const params = useParams()
  const eventId = params?.id as string

  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!eventId) return
    fetch(`/api/admin/events/${eventId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load event')
        return res.json()
      })
      .then((data) => {
        setEvent(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [eventId])

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center gap-3 text-[#A89F91]">
        <div className="w-8 h-8 border-2 border-[#CC892F] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs uppercase tracking-widest">Loading event details…</span>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
        <p className="text-sm text-red-300">Error: {error || 'Event not found'}</p>
        <Link
          href="/admin/events"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E3B464] hover:text-[#F4DD9F]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Return to Events
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4 border-b border-[#3A291B]/80 pb-4">
        <div>
          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#CC892F] block mb-1">
            Modify Discipline
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif text-[#F5EFE6]">
            Edit: <ShinyText text={event.title || 'Event'} speed={5} className="font-serif" />
          </h1>
        </div>
        <Link
          href="/admin/events"
          className="h-9 px-4 rounded-full bg-[#141311] hover:bg-[#242321] border border-[#3A291B] text-xs font-semibold text-[#F4DD9F] inline-flex items-center gap-1.5 transition shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Events
        </Link>
      </div>
      <EventForm eventId={eventId} initialData={event} />
    </div>
  )
}
