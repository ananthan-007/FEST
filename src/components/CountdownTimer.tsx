'use client'

import { useState, useEffect } from 'react'

function getTimeLeft() {
  const target = new Date('2027-01-09T00:00:00')
  const now = new Date()
  const diff = target.getTime() - now.getTime()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  }
}

export default function CountdownTimer() {
  const [time, setTime] = useState(getTimeLeft())

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft()), 1000)
    return () => clearInterval(id)
  }, [])

  const pad = (n: number) => String(n).padStart(2, '0')

  const units = [
    { label: 'Days', value: String(time.days).padStart(3, '0') },
    { label: 'Hours', value: pad(time.hours) },
    { label: 'Min', value: pad(time.minutes) },
    { label: 'Sec', value: pad(time.seconds) },
  ]

  return (
    <div className="flex items-center gap-2 sm:gap-4">
      {units.map(({ label, value }, i) => (
        <div key={label} className="flex items-center gap-2 sm:gap-4">
          <div className="flex flex-col items-center">
            <div className="bg-[#0D0C0A]/95 border border-[#64401F]/70 rounded-xl px-4 py-3 min-w-[64px] flex items-center justify-center shadow-[0_0_24px_rgba(204,137,47,0.16)]">
              <span className="font-mono text-3xl sm:text-4xl font-bold gold-gradient-text tabular-nums">
                {value}
              </span>
            </div>
            <span className="mt-1.5 text-[9px] font-semibold tracking-[0.2em] uppercase text-[#A89F91]">
              {label}
            </span>
          </div>
          {i < 3 && (
            <span className="text-[#CC892F] text-2xl font-bold pb-5 opacity-75">:</span>
          )}
        </div>
      ))}
    </div>
  )
}
