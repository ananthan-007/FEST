'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface EventStatusSwitchProps {
  eventId: string
  initialActive: boolean
}

export default function EventStatusSwitch({
  eventId,
  initialActive,
}: EventStatusSwitchProps) {
  const router = useRouter()
  const [isActive, setIsActive] = useState(initialActive)
  const [saving, setSaving] = useState(false)

  const handleToggle = async () => {
    if (saving) return
    const nextValue = !isActive
    setIsActive(nextValue)
    setSaving(true)

    try {
      const res = await fetch(`/api/admin/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: nextValue }),
      })
      if (!res.ok) {
        setIsActive(!nextValue)
      } else {
        router.refresh()
      }
    } catch {
      setIsActive(!nextValue)
    } finally {
      setSaving(false)
    }
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isActive}
      aria-label={isActive ? 'Close event registration' : 'Open event registration'}
      onClick={handleToggle}
      disabled={saving}
      className={`inline-flex items-center gap-2 h-7 pl-1.5 pr-2.5 rounded-full border text-[10px] font-bold uppercase tracking-wider transition disabled:opacity-60 ${
        isActive
          ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-300 hover:bg-emerald-500/20'
          : 'bg-[#242321] border-[#3A291B] text-[#A89F91] hover:border-[#64401F]'
      }`}
    >
      <span
        className={`relative inline-flex w-7 h-4 rounded-full transition-colors ${
          isActive ? 'bg-emerald-500/40' : 'bg-[#141311]'
        }`}
      >
        <span
          className={`absolute top-0.5 w-3 h-3 rounded-full transition-transform ${
            isActive ? 'translate-x-3.5 bg-emerald-400' : 'translate-x-0.5 bg-[#A89F91]'
          }`}
        />
      </span>
      <span>{isActive ? 'Open' : 'Closed'}</span>
    </button>
  )
}
