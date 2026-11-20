import Link from 'next/link'
import React from 'react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const navItems = [
    { label: 'Overview', href: '/admin', icon: 'dashboard' },
    { label: 'Events', href: '/admin/events', icon: 'military_tech' },
    { label: 'Categories', href: '/admin/categories', icon: 'category' },
    { label: 'Institutions', href: '/admin/institutions', icon: 'account_balance' },
    { label: 'Registrations', href: '/admin/registrations', icon: 'assignment' },
    { label: 'Volunteers', href: '/admin/volunteers', icon: 'shield_person' },
    { label: 'Settings', href: '/admin/settings', icon: 'settings' },
  ]

  return (
    <div className="min-h-screen flex bg-[#050A18] text-[#DDE2F6]">
      {/* Sidebar */}
      <aside className="w-64 fixed left-0 top-0 h-screen bg-[#080E1C]/90 backdrop-blur-2xl border-r border-white/5 flex flex-col z-50">
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M20 3L5 9v10c0 9.5 6.4 18.4 15 21 8.6-2.6 15-11.5 15-21V9L20 3z"
                  fill="#C8102E"
                  opacity="0.2"
                  stroke="#C8102E"
                  strokeWidth="1.5"
                />
                <path
                  d="M20 10l-8 3.5v6c0 5.5 3.5 10.5 8 12 4.5-1.5 8-6.5 8-12v-6L20 10z"
                  fill="#C8102E"
                  opacity="0.5"
                />
              </svg>
            </div>
            <div>
              <p className="font-serif text-lg text-[#DDE2F6] leading-none">FEST</p>
              <p className="text-[9px] font-semibold tracking-[0.18em] uppercase text-[#8A94A8] mt-0.5">
                Admin Command
              </p>
            </div>
          </div>
          <span className="inline-flex items-center h-5 px-2 bg-[#C8102E]/15 border border-[#C8102E]/30 rounded-full text-[9px] font-semibold tracking-wider uppercase text-[#FFB3B1] mt-2">
            Clearance: Alpha
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-[#8A94A8] hover:text-[#DDE2F6] hover:bg-[#161B2A] transition-colors group"
            >
              <span className="material-symbols-outlined text-[20px] text-[#8A94A8] group-hover:text-[#C8102E] transition">
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Footer status */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#8A94A8]">
              HQ Sync: Online
            </span>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-[#8A94A8] hover:text-[#DDE2F6] transition"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            Return to Site
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 pl-64 min-h-screen">
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
