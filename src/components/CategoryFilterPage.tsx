'use client'

import { useState, useMemo } from 'react'
import { Search, X, RotateCcw, Radar } from 'lucide-react'
import EventCard from './EventCard'
import SiteHeader from './SiteHeader'
import SiteFooter from './SiteFooter'
import DhruvaLogo from './DhruvaLogo'
import { ShinyText } from '@/components/reactbits'
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/motion/ScrollReveal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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
    events
      .filter(e => e.category?.id === selectedCategory && e.subCategory)
      .forEach(e => { map.set(e.subCategory!.id, e.subCategory!.name) })
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [events, selectedCategory])

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      const matchesCat = selectedSubCategory
        ? e.subCategory?.id === selectedSubCategory
        : selectedCategory
        ? e.category?.id === selectedCategory
        : true
      const matchesDiv = selectedDivision ? e.eligibleDivisions.includes(selectedDivision) : true
      const matchesSearch =
        searchQuery.trim() === '' ||
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.description ?? '').toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCat && matchesDiv && matchesSearch
    })
  }, [events, selectedCategory, selectedSubCategory, selectedDivision, searchQuery])

  const DIVISIONS = ['SD', 'SW', 'JD', 'JW']

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-[#F5EFE6]">
      <SiteHeader />

      {/* ── HERO BANNER ─────────────────────────────────────────────────── */}
      <section className="relative pt-20 pb-10 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-[#CC892F]/12 blur-[120px]" />
        </div>

        <ScrollReveal className="relative z-10 flex flex-col items-center pt-8 pb-5 px-4">
          <DhruvaLogo size="md" className="mb-3" />

          <h1 className="font-serif text-4xl sm:text-5xl font-black tracking-[0.14em] gold-gradient-text">
            EVENTS
          </h1>
          <p className="text-xs text-[#A89F91] mt-1.5 tracking-[0.2em] uppercase">
            <ShinyText text="DHRUVA · Kerala NCC" speed={5} />
          </p>
        </ScrollReveal>

        {/* Category tabs */}
        <div className="relative z-10 flex flex-wrap justify-center gap-2 px-4 mt-2">
          <button
            onClick={() => { setSelectedCategory(null); setSelectedSubCategory(null) }}
            className={`h-9 px-5 rounded-full text-xs font-bold tracking-wider uppercase transition ${
              selectedCategory === null
                ? 'gold-gradient-button'
                : 'bg-[#12110F] text-[#A89F91] hover:text-[#F4DD9F] border border-[#3A291B]'
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
                  ? 'gold-gradient-button'
                  : 'bg-[#12110F] text-[#A89F91] hover:text-[#F4DD9F] border border-[#3A291B]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* ── FILTER BAR ──────────────────────────────────────────────────── */}
      <div className="sticky top-16 sm:top-[72px] z-30 bg-[#050505]/95 backdrop-blur-xl border-b border-[#3A291B]/70">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
          {subCategories.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {subCategories.map(sub => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubCategory(selectedSubCategory === sub.id ? null : sub.id)}
                  className={`h-8 px-4 rounded-full text-xs font-semibold tracking-wider uppercase transition border ${
                    selectedSubCategory === sub.id
                      ? 'bg-[#CC892F]/20 border-[#E3B464]/60 text-[#F4DD9F]'
                      : 'border-[#3A291B] text-[#A89F91] hover:text-[#F4DD9F]'
                  }`}
                >
                  {sub.name}
                </button>
              ))}
              <div className="w-px h-5 bg-[#3A291B]" />
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
                    ? 'bg-[#CC892F] border-[#E3B464] text-[#050505]'
                    : 'border-[#3A291B] text-[#A89F91] hover:text-[#F4DD9F]'
                }`}
              >
                {div}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="ml-auto relative group">
            <Search className="w-4 h-4 text-[#A89F91] group-focus-within:text-[#E3B464] transition absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search disciplines..."
              className="h-9 pl-9 pr-4 w-56 rounded-full bg-[#12110F] border-[#3A291B] text-sm"
            />
          </div>

          {(selectedCategory || selectedDivision || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory(null)
                setSelectedSubCategory(null)
                setSelectedDivision(null)
                setSearchQuery('')
              }}
              className="h-8 px-3 rounded-full border border-[#3A291B] text-[#A89F91] hover:text-[#F4DD9F] text-xs font-semibold transition flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* ── EVENTS GRID ─────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-10">
        {filteredEvents.length > 0 ? (
          <>
            <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#A89F91] mb-6">
              {filteredEvents.length} Discipline{filteredEvents.length !== 1 ? 's' : ''} Available
            </p>
            <StaggerContainer
              key={`${selectedCategory ?? 'all'}-${selectedSubCategory ?? 'all'}-${selectedDivision ?? 'all'}-${searchQuery}`}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            >
              {filteredEvents.map(event => (
                <StaggerItem key={event.id}>
                  <EventCard event={event} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-20">
            <div className="w-20 h-20 rounded-full bg-[#CC892F]/10 border border-[#CC892F]/35 flex items-center justify-center mb-5 relative">
              <Radar className="w-9 h-9 text-[#E3B464]/75" />
              <span className="absolute inset-0 rounded-full bg-[#CC892F]/10 animate-ping pointer-events-none" />
            </div>
            <h4 className="font-serif text-xl text-[#F4DD9F]">No events match your filter</h4>
            <p className="text-sm text-[#A89F91] mt-2 max-w-sm">
              Try broadening your search or reset division filters to view all DHRUVA disciplines.
            </p>
            <Button
              onClick={() => {
                setSelectedCategory(null)
                setSelectedSubCategory(null)
                setSelectedDivision(null)
                setSearchQuery('')
              }}
              className="mt-6"
              size="sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filters
            </Button>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  )
}
