'use client'

import EventForm from '@/components/admin/EventForm'

export default function NewEventPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Event</h1>
      <EventForm />
    </div>
  )
}
