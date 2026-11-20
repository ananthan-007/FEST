'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import EventForm from '@/components/admin/EventForm'

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
    return <div className="p-6 text-gray-500">Loading event details...</div>
  }

  if (error || !event) {
    return <div className="p-6 text-red-600">Error: {error || 'Event not found'}</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Event: {event.title}</h1>
      <EventForm eventId={eventId} initialData={event} />
    </div>
  )
}
