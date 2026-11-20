import React from 'react'
import Link from 'next/link'
import { signOut } from '@/app/actions/auth'

export default function VolunteerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-slate-900 text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-xl font-bold tracking-tight">NCC Fest — Volunteer Panel</span>
            <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              Staff
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/volunteer/scan"
              className="text-sm text-slate-300 hover:text-white transition font-medium"
            >
              Scan Pass
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-md border border-slate-700 transition"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  )
}
