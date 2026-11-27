'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  AlertCircle,
  Edit3,
  ListFilter,
  Lock,
  Phone,
  Search,
  Shield,
  User,
  X,
  Save,
} from 'lucide-react'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import Breadcrumbs from '@/components/Breadcrumbs'
import {
  SpotlightCard,
  TiltedCard,
  ShinyText,
  StarBorder,
} from '@/components/reactbits'
import { ScrollReveal } from '@/components/motion/ScrollReveal'
import { Input } from '@/components/ui/input'

type Division = 'SD' | 'SW' | 'JD' | 'JW'

interface Group { id: string; name: string }
interface Battalion { id: string; name: string }
interface Institution { id: string; name: string }

interface SearchResult {
  id: string
  name: string
  battalion_id: string
  battalions?: {
    id: string
    name: string
    group_id: string
    ncc_groups?: { id: string; name: string } | null
  } | null
}

interface Profile {
  id: string
  email?: string | null
  displayName: string | null
  phone: string | null
  division: Division | null
  divisionLocked: boolean
  institutionId: string | null
  profileComplete: boolean
  institution?: {
    id: string
    name: string
    battalion?: {
      id: string
      name: string
      group?: { id: string; name: string } | null
    } | null
  } | null
}

const CUSTOM_OPTION_VALUE = '__custom__'

const divisionMeta: Record<Division, { label: string; badge: string; spotlight: string }> = {
  SD: {
    label: 'Senior Division',
    badge: 'bg-[#242321] border-[#CC892F]/50 text-[#F4DD9F]',
    spotlight: 'rgba(204, 137, 47, 0.28)',
  },
  SW: {
    label: 'Senior Wing',
    badge: 'bg-[#242321] border-[#E3B464]/50 text-[#E3B464]',
    spotlight: 'rgba(227, 180, 100, 0.28)',
  },
  JD: {
    label: 'Junior Division',
    badge: 'bg-[#242321] border-emerald-500/35 text-emerald-300',
    spotlight: 'rgba(16, 185, 129, 0.22)',
  },
  JW: {
    label: 'Junior Wing',
    badge: 'bg-[#242321] border-amber-500/35 text-amber-200',
    spotlight: 'rgba(244, 221, 159, 0.24)',
  },
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [groups, setGroups] = useState<Group[]>([])
  const [battalions, setBattalions] = useState<Battalion[]>([])
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState('')
  const [selectedBattalionId, setSelectedBattalionId] = useState('')
  const [isCustomInstitution, setIsCustomInstitution] = useState(false)
  const [customInstitutionName, setCustomInstitutionName] = useState('')

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)

  const [form, setForm] = useState({
    displayName: '',
    phone: '',
    division: '' as Division | '',
    institutionId: '',
  })
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [saving, setSaving] = useState(false)

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  useEffect(() => {
    Promise.all([
      fetch('/api/user/profile').then(r => (r.ok ? r.json() : null)),
      fetch('/api/institutions/cascade?groups=true').then(r => (r.ok ? r.json() : [])),
    ])
      .then(([p, groupData]) => {
        if (p && p.id) {
          setProfile(p)
          setForm({
            displayName: p.displayName ?? '',
            phone: p.phone ?? '',
            division: p.division ?? '',
            institutionId: p.institutionId ?? '',
          })
          if (p.institution?.battalion?.group?.id) setSelectedGroupId(p.institution.battalion.group.id)
          if (p.institution?.battalion?.id) setSelectedBattalionId(p.institution.battalion.id)
        }
        setGroups(Array.isArray(groupData) ? groupData : [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedGroupId) { setBattalions([]); setInstitutions([]); return }
    fetch(`/api/institutions/cascade?groupId=${selectedGroupId}`)
      .then(r => r.json())
      .then(data => setBattalions(Array.isArray(data) ? data : []))
      .catch(() => setBattalions([]))
  }, [selectedGroupId])

  useEffect(() => {
    if (!selectedBattalionId) { setInstitutions([]); return }
    fetch(`/api/institutions/cascade?battalionId=${selectedBattalionId}`)
      .then(r => r.json())
      .then(data => setInstitutions(Array.isArray(data) ? data : []))
      .catch(() => setInstitutions([]))
  }, [selectedBattalionId])

  useEffect(() => {
    const trimmed = searchQuery.trim()
    if (trimmed.length < 2) {
      setSearchResults([])
      setSearching(false)
      return
    }
    setSearching(true)
    const timer = setTimeout(() => {
      fetch(`/api/institutions/cascade?search=${encodeURIComponent(trimmed)}`)
        .then(r => r.json())
        .then(data => setSearchResults(Array.isArray(data) ? data : []))
        .catch(() => setSearchResults([]))
        .finally(() => setSearching(false))
    }, 250)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleSelectSearchResult = (item: SearchResult) => {
    const groupId = item.battalions?.ncc_groups?.id || item.battalions?.group_id || ''
    const battalionId = item.battalions?.id || item.battalion_id || ''
    if (groupId) setSelectedGroupId(groupId)
    if (battalionId) setSelectedBattalionId(battalionId)
    setForm(f => ({ ...f, institutionId: item.id }))
    setIsCustomInstitution(false)
    setCustomInstitutionName('')
    setSearchQuery('')
    setSearchResults([])
  }

  const enableCustomEntry = (prefill = '') => {
    setIsCustomInstitution(true)
    setCustomInstitutionName(prefill)
    setForm(f => ({ ...f, institutionId: '' }))
    setSearchQuery('')
    setSearchResults([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isCustomInstitution && customInstitutionName.trim().length < 2) {
      showToast('Please enter your institution name (at least 2 characters).', 'error')
      return
    }
    if (!isCustomInstitution && !form.institutionId) {
      showToast('Please select your institution or enter it manually.', 'error')
      return
    }

    setSaving(true)
    const payload = isCustomInstitution
      ? {
          displayName: form.displayName,
          phone: form.phone,
          division: form.division,
          customInstitutionName: customInstitutionName.trim(),
          battalionId: selectedBattalionId || undefined,
        }
      : {
          displayName: form.displayName,
          phone: form.phone,
          division: form.division,
          institutionId: form.institutionId || null,
        }

    const res = await fetch('/api/user/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setSaving(false)

    if (res.ok) {
      const data = await res.json()
      const updated: Profile = data.profile ?? data
      setProfile(updated)
      setForm({
        displayName: updated.displayName ?? '',
        phone: updated.phone ?? '',
        division: updated.division ?? '',
        institutionId: updated.institutionId ?? '',
      })
      const savedGroupId = updated.institution?.battalion?.group?.id || ''
      const savedBnId = updated.institution?.battalion?.id || ''
      if (savedGroupId) setSelectedGroupId(savedGroupId)
      if (savedBnId) {
        setSelectedBattalionId(savedBnId)
        fetch(`/api/institutions/cascade?battalionId=${savedBnId}`)
          .then(r => r.json())
          .then(list => setInstitutions(Array.isArray(list) ? list : []))
          .catch(() => {})
      }
      if (isCustomInstitution) {
        fetch('/api/institutions/cascade?groups=true')
          .then(r => r.json())
          .then(list => setGroups(Array.isArray(list) ? list : []))
          .catch(() => {})
      }
      setIsCustomInstitution(false)
      setCustomInstitutionName('')
      showToast('Cadet record updated successfully.', 'success')
    } else {
      const { error } = await res.json()
      showToast(error ?? 'Failed to save profile', 'error')
    }
  }

  const displayName = form.displayName || profile?.displayName || 'Cadet'
  const initials =
    displayName
      .trim()
      .split(/\s+/)
      .map((w: string) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'C'

  const activeGroupName =
    groups.find(g => g.id === selectedGroupId)?.name ||
    profile?.institution?.battalion?.group?.name ||
    'Not selected'
  const activeBattalionName =
    battalions.find(b => b.id === selectedBattalionId)?.name ||
    profile?.institution?.battalion?.name ||
    'Not selected'
  const activeInstitutionName = isCustomInstitution
    ? customInstitutionName.trim() || 'Manual entry pending…'
    : institutions.find(i => i.id === form.institutionId)?.name ||
      profile?.institution?.name ||
      'Not selected'

  const activeDiv = form.division ? divisionMeta[form.division] : null

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col">
        <SiteHeader />
        <div className="flex-1 flex items-center justify-center pt-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-[#CC892F] border-t-transparent animate-spin" />
            <span className="text-[#A89F91] text-xs tracking-widest uppercase">
              Loading Service Dossier…
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-[#F5EFE6]">
      <SiteHeader />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-24 pb-20 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Breadcrumbs
            items={[
              { label: 'Cadet HQ', href: '/dashboard' },
              { label: 'Identity Profile' },
            ]}
          />

          <Link
            href="/dashboard"
            className="h-8 px-3.5 rounded-full bg-[#12110F] hover:bg-[#242321] border border-[#3A291B] text-xs font-semibold text-[#F4DD9F] inline-flex items-center gap-1.5 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Cadet HQ
          </Link>
        </div>

        {/* Hero Heading */}
        <ScrollReveal className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#3A291B]/80 pb-5">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#F5EFE6]">
              Cadet <ShinyText text="Profile" speed={5} className="font-serif" />
            </h1>
          </div>

          <span
            className={`h-7 px-3.5 inline-flex items-center gap-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase border self-start sm:self-auto ${
              profile?.profileComplete
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                : 'bg-[#CC892F]/15 border-[#CC892F]/40 text-[#F4DD9F]'
            }`}
          >
            {profile?.profileComplete ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                Dossier Verified
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5" />
                Setup Required
              </>
            )}
          </span>
        </ScrollReveal>

        {/* Toast */}
        {toast && (
          <div
            className={`px-4 py-3 rounded-2xl text-xs font-medium flex items-center gap-2.5 border ${
              toast.type === 'success'
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                : 'bg-red-500/12 border-red-500/30 text-red-300'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{toast.msg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Tilted Live Cadet Identity Card */}
          <ScrollReveal delay={0.05} className="lg:col-span-4 lg:sticky lg:top-24">
            <TiltedCard rotateAmplitude={6} scaleOnHover={1.01}>
              <SpotlightCard
                spotlightColor={activeDiv?.spotlight || 'rgba(204, 137, 47, 0.28)'}
                className="p-6 flex flex-col items-center text-center"
              >
                <div className="w-full flex items-center justify-between mb-5">
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#E3B464]">
                    DHRUVA · Cadet
                  </span>
                  {form.division ? (
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${activeDiv?.badge}`}
                    >
                      {form.division}
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#242321] border border-[#3A291B] text-[#A89F91]">
                      No Div
                    </span>
                  )}
                </div>

                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#CC892F]/35 to-[#382313] border border-[#E3B464]/45 flex items-center justify-center shadow-[0_0_24px_rgba(204,137,47,0.22)] mb-4">
                  <span className="font-serif text-3xl font-bold text-[#F4DD9F]">{initials}</span>
                </div>

                <h2 className="font-serif text-xl text-[#F4DD9F] truncate max-w-full">{displayName}</h2>
                {activeDiv && (
                  <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#A89F91] mt-1">
                    {activeDiv.label}
                  </p>
                )}

                <div className="w-full mt-5 pt-5 border-t border-[#3A291B]/80 space-y-3 text-left text-xs">
                  <div className="p-3 rounded-xl bg-[#141311] border border-[#3A291B]/70">
                    <span className="text-[10px] uppercase tracking-wider text-[#A89F91] block">
                      Institution
                    </span>
                    <span className="text-[#F5EFE6] font-medium mt-0.5 block leading-snug">
                      {activeInstitutionName}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-3 rounded-xl bg-[#141311] border border-[#3A291B]/70">
                      <span className="text-[10px] uppercase tracking-wider text-[#A89F91] block">
                        Battalion
                      </span>
                      <span className="text-[#F5EFE6] font-medium mt-0.5 block truncate">
                        {activeBattalionName}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#141311] border border-[#3A291B]/70">
                      <span className="text-[10px] uppercase tracking-wider text-[#A89F91] block">
                        NCC Group
                      </span>
                      <span className="text-[#F5EFE6] font-medium mt-0.5 block truncate">
                        {activeGroupName}
                      </span>
                    </div>
                  </div>
                </div>
              </SpotlightCard>
            </TiltedCard>
          </ScrollReveal>

          {/* Right: Configuration Form */}
          <ScrollReveal delay={0.1} className="lg:col-span-8">
            <SpotlightCard className="p-6 sm:p-8" spotlightColor="rgba(204, 137, 47, 0.16)">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Section 1: Cadet Identity */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#E3B464]">
                    <User className="w-4 h-4" />
                    <span>Cadet Particulars</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold tracking-[0.14em] uppercase text-[#A89F91] mb-2">
                        Full Cadet Name *
                      </label>
                      <Input
                        type="text"
                        required
                        value={form.displayName}
                        onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
                        placeholder="Cadet Name"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold tracking-[0.14em] uppercase text-[#A89F91] mb-2">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-[#A89F91] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <Input
                          type="tel"
                          required
                          className="pl-10"
                          value={form.phone}
                          onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                          placeholder="+91 9876543210"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold tracking-[0.14em] uppercase text-[#A89F91] mb-2">
                      Division / Wing *
                    </label>
                    {profile?.divisionLocked ? (
                      <div className="h-11 w-full bg-[#141311]/70 border border-[#3A291B] rounded-xl px-4 text-sm flex items-center justify-between text-[#A89F91]">
                        <span className="font-medium text-[#F5EFE6]">
                          {form.division} {activeDiv ? `– ${activeDiv.label}` : ''}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] text-[#A89F91]/80 uppercase tracking-wider">
                          <Lock className="w-3 h-3" />
                          Locked post-enlistment
                        </span>
                      </div>
                    ) : (
                      <div className="relative">
                        <Shield className="w-4 h-4 text-[#A89F91] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <select
                          required
                          className="h-11 w-full bg-[#141311] border border-[#3A291B]/90 rounded-xl pl-10 pr-4 text-[#F5EFE6] text-sm focus:outline-none focus:border-[#CC892F] focus:ring-1 focus:ring-[#CC892F]/70"
                          value={form.division}
                          onChange={e => setForm(f => ({ ...f, division: e.target.value as Division }))}
                        >
                          <option value="" className="bg-[#0D0C0A] text-[#A89F91]">Select division</option>
                          <option value="SD" className="bg-[#0D0C0A]">SD – Senior Division</option>
                          <option value="SW" className="bg-[#0D0C0A]">SW – Senior Wing</option>
                          <option value="JD" className="bg-[#0D0C0A]">JD – Junior Division</option>
                          <option value="JW" className="bg-[#0D0C0A]">JW – Junior Wing</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section 2: Institution Selection */}
                <div className="pt-5 border-t border-[#3A291B]/80 space-y-4">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#E3B464]">
                      <Building2 className="w-4 h-4" />
                      <span>Kerala NCC Institution</span>
                    </div>
                    <span className="text-[10px] text-[#A89F91]">
                      Search or select Group → Battalion → Institution
                    </span>
                  </div>

                  {/* Quick Search */}
                  <div>
                    <label className="block text-[10px] font-semibold tracking-[0.14em] uppercase text-[#A89F91] mb-2">
                      Quick Search Institution (Optional)
                    </label>
                    <div className="relative">
                      <Search className="w-4 h-4 text-[#A89F91] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <Input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Type school or college name to auto-fill Group & Battalion…"
                        className="pl-10 pr-10 text-xs"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => { setSearchQuery(''); setSearchResults([]) }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A89F91] hover:text-[#F4DD9F]"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {searchQuery.trim().length >= 2 && (
                      <div className="mt-2 bg-[#141311] border border-[#3A291B] rounded-xl overflow-hidden max-h-60 overflow-y-auto shadow-xl">
                        {searching ? (
                          <div className="px-4 py-3 text-xs text-[#A89F91]">Searching institutions…</div>
                        ) : searchResults.length === 0 ? (
                          <div className="px-4 py-3 flex items-center justify-between gap-3">
                            <span className="text-xs text-[#A89F91]">No matching institution found.</span>
                            <button
                              type="button"
                              onClick={() => enableCustomEntry(searchQuery.trim())}
                              className="text-xs font-semibold text-[#F4DD9F] hover:text-white underline shrink-0"
                            >
                              Use &ldquo;{searchQuery.trim()}&rdquo;
                            </button>
                          </div>
                        ) : (
                          <div className="divide-y divide-[#3A291B]/60">
                            {searchResults.map(item => (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => handleSelectSearchResult(item)}
                                className="w-full text-left px-4 py-2.5 hover:bg-[#242321]/70 transition flex flex-col gap-0.5"
                              >
                                <span className="text-xs font-medium text-[#F5EFE6]">{item.name}</span>
                                <span className="text-[10px] text-[#A89F91]">
                                  {item.battalions?.name || 'Unit'}
                                  {item.battalions?.ncc_groups?.name ? ` · ${item.battalions.ncc_groups.name}` : ''}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Group & Battalion */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold tracking-[0.14em] uppercase text-[#A89F91] mb-2">
                        NCC Group
                      </label>
                      <select
                        className="h-11 w-full bg-[#141311] border border-[#3A291B]/90 rounded-xl px-4 text-[#F5EFE6] text-sm focus:outline-none focus:border-[#CC892F] focus:ring-1 focus:ring-[#CC892F]/70"
                        value={selectedGroupId}
                        onChange={e => {
                          setSelectedGroupId(e.target.value)
                          setSelectedBattalionId('')
                          setForm(f => ({ ...f, institutionId: '' }))
                        }}
                      >
                        <option value="" className="bg-[#0D0C0A] text-[#A89F91]">Select NCC Group</option>
                        {groups.map(g => (
                          <option key={g.id} value={g.id} className="bg-[#0D0C0A]">{g.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold tracking-[0.14em] uppercase text-[#A89F91] mb-2">
                        Battalion / Unit
                      </label>
                      <select
                        className="h-11 w-full bg-[#141311] border border-[#3A291B]/90 rounded-xl px-4 text-[#F5EFE6] text-sm focus:outline-none focus:border-[#CC892F] focus:ring-1 focus:ring-[#CC892F]/70 disabled:opacity-40"
                        value={selectedBattalionId}
                        disabled={!selectedGroupId}
                        onChange={e => {
                          setSelectedBattalionId(e.target.value)
                          setForm(f => ({ ...f, institutionId: '' }))
                        }}
                      >
                        <option value="" className="bg-[#0D0C0A] text-[#A89F91]">Select Battalion</option>
                        {battalions.map(b => (
                          <option key={b.id} value={b.id} className="bg-[#0D0C0A]">{b.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Educational Institution Select OR Manual Entry */}
                  {!isCustomInstitution ? (
                    <div>
                      <label className="block text-[10px] font-semibold tracking-[0.14em] uppercase text-[#A89F91] mb-2">
                        Educational Institution *
                      </label>
                      <select
                        required
                        className="h-11 w-full bg-[#141311] border border-[#3A291B]/90 rounded-xl px-4 text-[#F5EFE6] text-sm focus:outline-none focus:border-[#CC892F] focus:ring-1 focus:ring-[#CC892F]/70 disabled:opacity-40"
                        value={form.institutionId}
                        disabled={!selectedBattalionId}
                        onChange={e => {
                          const val = e.target.value
                          if (val === CUSTOM_OPTION_VALUE) {
                            enableCustomEntry()
                          } else {
                            setForm(f => ({ ...f, institutionId: val }))
                          }
                        }}
                      >
                        <option value="" className="bg-[#0D0C0A] text-[#A89F91]">
                          {selectedBattalionId ? 'Select Institution' : 'Select Group & Battalion first'}
                        </option>
                        {institutions.map(i => (
                          <option key={i.id} value={i.id} className="bg-[#0D0C0A]">{i.name}</option>
                        ))}
                        {selectedBattalionId && (
                          <option value={CUSTOM_OPTION_VALUE} className="bg-[#0D0C0A] text-[#F4DD9F]">
                            + Institution not available in list (Enter manually)
                          </option>
                        )}
                      </select>
                      <div className="mt-2.5 flex justify-end">
                        <button
                          type="button"
                          onClick={() => enableCustomEntry()}
                          className="inline-flex items-center gap-1.5 text-xs text-[#E3B464] hover:text-[#F4DD9F] transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Institution not available in the list? Enter manually
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-[#141311] border border-[#CC892F]/50 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <label className="block text-[10px] font-semibold tracking-[0.14em] uppercase text-[#F4DD9F]">
                          Enter Institution Name *
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setIsCustomInstitution(false)
                            setCustomInstitutionName('')
                          }}
                          className="inline-flex items-center gap-1 text-[11px] text-[#E3B464] hover:text-[#F4DD9F] transition"
                        >
                          <ListFilter className="w-3.5 h-3.5" />
                          Select from list
                        </button>
                      </div>
                      <Input
                        type="text"
                        required
                        minLength={2}
                        maxLength={200}
                        value={customInstitutionName}
                        onChange={e => setCustomInstitutionName(e.target.value)}
                        placeholder="Enter full name of your school or college"
                      />
                      <p className="text-[11px] text-[#A89F91]">
                        {selectedBattalionId
                          ? 'This institution will be saved under your selected Battalion.'
                          : 'Optional: select your NCC Group and Battalion above if known, or save directly.'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Submit CTA */}
                <div className="pt-2">
                  <StarBorder
                    type="submit"
                    color="#E3B464"
                    disabled={saving}
                    className="w-full h-12 disabled:opacity-50"
                  >
                    <span className="inline-flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F4DD9F]">
                      <Save className="w-4 h-4 text-[#CC892F]" />
                      {saving ? 'Saving Dossier…' : 'Save Cadet Profile'}
                    </span>
                  </StarBorder>
                </div>
              </form>
            </SpotlightCard>
          </ScrollReveal>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
