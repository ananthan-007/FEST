'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import EventForm from '@/components/admin/EventForm'
import { ShinyText } from '@/components/reactbits'

export default function NewEventPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4 border-b border-[#3A291B]/80 pb-4">
        <div>
          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#CC892F] block mb-1">
            Event Operations
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif text-[#F5EFE6]">
            Create <ShinyText text="New Event" speed={5} className="font-serif" />
          </h1>
        </div>
        <Link
          href="/admin/events"
          className="h-9 px-4 rounded-full bg-[#141311] hover:bg-[#242321] border border-[#3A291B] text-xs font-semibold text-[#F4DD9F] inline-flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Events
        </Link>
      </div>
      <EventForm />
    </div>
  )
}
