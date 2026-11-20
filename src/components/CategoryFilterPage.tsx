'use client'

import { useState, useMemo } from 'react'
import EventCard from './EventCard'
import SiteHeader from './SiteHeader'
import SiteFooter from './SiteFooter'

type Division = { id: string; division: string; status: string }

type Event = {
  id: string
  title: string
  description: string | null
  posterUrl: string | null
  participationType: string
  eligibleDivisions: string[]
  fee: number | string | null | { toNumber?: () => number }
  eventDate?: Date | string | null
  eventTime?: string | null
  venue: string | null
  conflictAlertEnabled: boolean
  isActive: boolean
  category: { id: string; name: string } | null
  subCategory: { id: string; name: string } | null
  divisionInstances: Division[]
}

interface Props { events: Event[] }

export default function CategoryFilterPage({ events }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null)
  const [selectedDivision, setSelectedDivision] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const categories = useMemo(() => {
    const map = new Map<string, string>()
    events.forEach(e => { if (e.category) map.set(e.category.id, e.category.name) })
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [events])

  const subCategories = useMemo(() => {
    if (!selectedCategory) return []
    const map = new Map<string, string>()
    events.filter(e => e.category?.id === selectedCategory && e.subCategory)
      .forEach(e => { map.set(e.subCategory!.id, e.subCategory!.name) })
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [events, selectedCategory])

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      const matchesCat = selectedSubCategory
        ? e.subCategory?.id === selectedSubCategory
        : selectedCategory ? e.category?.id === selectedCategory : true
      const matchesDiv = selectedDivision ? e.eligibleDivisions.includes(selectedDivision) : true
      const matchesSearch = searchQuery.trim() === '' ||
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.description ?? '').toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCat && matchesDiv && matchesSearch
    })
  }, [events, selectedCategory, selectedSubCategory, selectedDivision, searchQuery])

  const DIVISIONS = ['SD', 'SW', 'JD', 'JW']

  return (
    <div className="min-h-screen flex flex-col bg-[#050A18] text-[#DDE2F6]">
      <SiteHeader />

      {/* ── HERO BANNER ─────────────────────────────────────────────────── */}
      <section className="relative pt-20 pb-10 overflow-hidden">
        {/* Background radial glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-[#C8102E]/10 blur-[120px]" />
        </div>

        {/* Center FEST identity */}
        <div className="relative z-10 flex flex-col items-center pt-10 pb-6 px-4">
          <svg width="52" height="58" viewBox="0 0 40 46" fill="none" className="mb-3 drop-shadow-[0_0_20px_rgba(200,16,46,0.5)]">
            <path d="M20 2L4 8v12c0 11 7 20.5 16 23.5C29 40.5 36 31 36 20V8L20 2z" fill="#C8102E" opacity="0.15" stroke="#C8102E" strokeWidth="1.5"/>
            <path d="M20 8l-9 3.5v8c0 6.5 4 12 9 14 5-2 9-7.5 9-14v-8L20 8z" fill="#C8102E" opacity="0.4"/>
            <path d="M15 20l3.5 3.5L26 16" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>

          <div className="flex items-center gap-3 mb-1">
            <span className="h-px w-10 bg-[#C8102E]" />
            <span className="text-[9px] font-semibold tracking-[0.3em] uppercase text-[#C8102E]">FEST 11.0</span>
            <span className="h-px w-10 bg-[#C8102E]" />
          </div>

          <h1 className="font-serif text-5xl sm:text-6xl font-black tracking-[0.08em] text-white mt-2">
            EVENTS
          </h1>
          <p className="text-sm text-[#8A94A8] mt-2 tracking-wider">Kerala NCC Conclave · All Disciplines</p>
        </div>

        {/* ── Category tabs (like "All Events / General / Informal / Department") */}
        <div className="relative z-10 flex justify-center gap-1 px-4 mt-2">
          <button
            onClick={() => { setSelectedCategory(null); setSelectedSubCategory(null) }}
            className={`h-9 px-5 rounded-full text-xs font-bold tracking-wider uppercase transition ${
              selectedCategory === null
                ? 'bg-[#C8102E] text-white shadow-[0_0_16px_rgba(200,16,46,0.4)]'
                : 'bg-[#161B2A] text-[#8A94A8] hover:text-[#DDE2F6] border border-white/8'
            }`}
          >
            All Events
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => { setSelectedCategory(cat.id); setSelectedSubCategory(null) }}
              className={`h-9 px-5 rounded-full text-xs font-bold tracking-wider uppercase transition ${
                selectedCategory === cat.id
                  ? 'bg-[#C8102E] text-white shadow-[0_0_16px_rgba(200,16,46,0.4)]'
                  : 'bg-[#161B2A] text-[#8A94A8] hover:text-[#DDE2F6] border border-white/8'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* ── FILTER BAR ──────────────────────────────────────────────────── */}
      <div className="sticky top-16 sm:top-20 z-30 bg-[#050A18]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3">

          {/* Sub-category chips */}
          {subCategories.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {subCategories.map(sub => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubCategory(selectedSubCategory === sub.id ? null : sub.id)}
                  className={`h-8 px-4 rounded-full text-xs font-semibold tracking-wider uppercase transition border ${
                    selectedSubCategory === sub.id
                      ? 'bg-white/10 border-white/30 text-white'
                      : 'border-white/10 text-[#8A94A8] hover:text-white'
                  }`}
                >
                  {sub.name}
                </button>
              ))}
              <div className="w-px h-5 bg-white/10" />
            </div>
          )}

          {/* Division filters */}
          <div className="flex items-center gap-2">
            {DIVISIONS.map(div => (
              <button
                key={div}
                onClick={() => setSelectedDivision(selectedDivision === div ? null : div)}
                className={`h-8 px-3 rounded-full text-xs font-bold uppercase tracking-wider transition border ${
                  selectedDivision === div
                    ? 'bg-[#C8102E] border-[#C8102E] text-white'
                    : 'border-white/10 text-[#8A94A8] hover:text-white'
                }`}
              >
                {div}
              </button>
            ))}
          </div>

          {/* Search — pushed right */}
          <div className="ml-auto relative group">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-[#8A94A8] group-focus-within:text-[#C8102E] transition">
              search
            </span>
            <input
              type="search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search here..."
              className="h-9 pl-9 pr-4 w-56 rounded-full bg-[#161B2A] border border-white/10 text-[#DDE2F6] text-sm placeholder-[#8A94A8] focus:outline-none focus:ring-1 focus:ring-[#C8102E]/60 transition"
            />
          </div>

          {/* Reset */}
          {(selectedCategory || selectedDivision || searchQuery) && (
            <button
              onClick={() => { setSelectedCategory(null); setSelectedSubCategory(null); setSelectedDivision(null); setSearchQuery('') }}
              className="h-8 px-3 rounded-full border border-white/10 text-[#8A94A8] hover:text-white text-xs font-semibold transition flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
              Reset
            </button>
          )}
        </div>
      </div>

      {/* ── EVENTS GRID ─────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-10">
        {filteredEvents.length > 0 ? (
          <>
            <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#8A94A8] mb-6">
              {filteredEvents.length} Discipline{filteredEvents.length !== 1 ? 's' : ''} Available
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-20">
            <div className="w-20 h-20 rounded-full bg-[#C8102E]/10 border border-[#C8102E]/20 flex items-center justify-center mb-5 relative">
              <span className="material-symbols-outlined text-[36px] text-[#C8102E]/60">radar</span>
              <span className="absolute inset-0 rounded-full bg-[#C8102E]/10 animate-ping pointer-events-none" />
            </div>
            <h4 className="font-serif text-xl text-white">No events match your filter</h4>
            <p className="text-sm text-[#8A94A8] mt-2 max-w-sm">
              Try broadening your search or reset division filters to view all FEST disciplines.
            </p>
            <button
              onClick={() => { setSelectedCategory(null); setSelectedSubCategory(null); setSelectedDivision(null); setSearchQuery('') }}
              className="mt-6 h-10 px-6 rounded-full bg-[#C8102E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#A00B22] transition flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">restart_alt</span>
              Reset Filters
            </button>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  )
}
