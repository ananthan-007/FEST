'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const DIVISIONS = ['SD', 'SW', 'JD', 'JW'] as const
type Division = typeof DIVISIONS[number]

interface PrizePoolGroup {
  id?: string
  label: string
  divisions: Division[]
  first_prize: number
  second_prize: number
  third_prize: number
  error?: string
}

interface Category {
  id: string
  name: string
  sub_categories?: SubCategory[]
}

interface SubCategory {
  id: string
  name: string
  category_id: string
}

interface EventFormProps {
  eventId?: string
  initialData?: Record<string, any>
}

function validatePrizePool(pool: PrizePoolGroup): string | null {
  if (pool.divisions.includes('SD') && pool.divisions.includes('JD')) {
    return 'SD and JD cannot be in the same prize pool'
  }
  if (pool.divisions.includes('SW') && pool.divisions.includes('JW')) {
    return 'SW and JW cannot be in the same prize pool'
  }
  return null
}

const divisionColors: Record<Division, string> = {
  SD: 'bg-blue-500/15 border-blue-500/30 text-blue-400',
  SW: 'bg-purple-500/15 border-purple-500/30 text-purple-400',
  JD: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
  JW: 'bg-pink-500/15 border-pink-500/30 text-pink-400',
}

const inputCls = 'h-12 w-full bg-[#141311] border border-[#3A291B]/90 rounded-lg px-3 text-[#F5EFE6] text-sm focus:outline-none focus:ring-1 focus:ring-[#CC892F] placeholder:text-[#A89F91]/60'
const labelCls = 'block text-[10px] font-semibold tracking-[0.14em] uppercase text-[#A89F91] mb-1.5'
const cardCls = 'bg-[#0D0C0A]/80 backdrop-blur-xl border border-[#3A291B]/80 rounded-2xl p-6 space-y-5'

export default function EventForm({ eventId, initialData }: EventFormProps) {
  const router = useRouter()
  const isEdit = !!eventId

  const [title, setTitle] = useState(initialData?.title ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [posterUrl, setPosterUrl] = useState(initialData?.poster_url ?? '')
  const [posterFile, setPosterFile] = useState<File | null>(null)
  const [categoryId, setCategoryId] = useState(
    initialData?.category_id ?? initialData?.sub_categories?.category_id ?? ''
  )
  const [subCategoryId, setSubCategoryId] = useState(
    initialData?.sub_category_id ?? initialData?.subcategory_id ?? ''
  )
  const [dateTime, setDateTime] = useState(() => {
    if (initialData?.date_time) {
      return new Date(initialData.date_time).toISOString().slice(0, 16)
    }
    if (initialData?.event_date) {
      const timePart = initialData.event_time ? initialData.event_time.slice(0, 5) : '09:00'
      return `${initialData.event_date}T${timePart}`
    }
    return ''
  })
  const [venue, setVenue] = useState(initialData?.venue ?? '')
  const [fee, setFee] = useState<number>(Number(initialData?.fee ?? 0))
  const [participationType, setParticipationType] = useState<'individual' | 'team'>(
    initialData?.participation_type ?? 'individual'
  )
  const [teamMin, setTeamMin] = useState<number>(initialData?.team_min ?? 2)
  const [teamMax, setTeamMax] = useState<number>(initialData?.team_max ?? 0)
  const [eligibleDivisions, setEligibleDivisions] = useState<Division[]>(
    initialData?.eligible_divisions ?? []
  )
  const [institutionRestriction, setInstitutionRestriction] = useState(
    initialData?.institution_restriction ?? 'none'
  )
  const [conflictAlertEnabled, setConflictAlertEnabled] = useState(
    initialData?.conflict_alert_enabled ?? false
  )
  const [prizePools, setPrizePools] = useState<PrizePoolGroup[]>(
    (initialData?.prize_pool_groups ?? []).map((p: any) => ({
      id: p.id,
      label: p.label ?? p.name ?? '',
      divisions: p.divisions ?? [],
      first_prize: Number(p.first_prize ?? p.prize_1st ?? 0),
      second_prize: Number(p.second_prize ?? p.prize_2nd ?? 0),
      third_prize: Number(p.third_prize ?? p.prize_3rd ?? 0),
    }))
  )

  const [allSubCategories, setAllSubCategories] = useState<Record<string, SubCategory[]>>({})
  const [categories, setCategories] = useState<Category[]>([])
  const [subCategories, setSubCategories] = useState<SubCategory[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetch('/api/admin/categories')
      .then(r => r.json())
      .then(data => {
        const cats: Category[] = Array.isArray(data) ? data : []
        setCategories(cats)
        // Build a map of categoryId → sub_categories from embedded data
        const map: Record<string, SubCategory[]> = {}
        for (const cat of cats) {
          if (Array.isArray(cat.sub_categories)) {
            map[cat.id] = cat.sub_categories
          }
        }
        setAllSubCategories(map)
      })
      .catch(() => setCategories([]))
  }, [])

  // When categoryId changes, use the pre-loaded map (instant, no extra fetch)
  // Fall back to API fetch if not in map (e.g. freshly added category)
  useEffect(() => {
    if (!categoryId) { setSubCategories([]); return }
    if (allSubCategories[categoryId]) {
      setSubCategories(allSubCategories[categoryId])
    } else {
      fetch(`/api/admin/subcategories?categoryId=${categoryId}`)
        .then(r => r.json())
        .then(data => setSubCategories(Array.isArray(data) ? data : []))
        .catch(() => setSubCategories([]))
    }
  }, [categoryId, allSubCategories])

  const toggleDivision = (div: Division) => {
    setEligibleDivisions(prev =>
      prev.includes(div) ? prev.filter(d => d !== div) : [...prev, div]
    )
  }

  const handlePosterUpload = async (file: File): Promise<string> => {
    // 1. Try server-side admin upload (bypasses bucket RLS policies)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/admin/upload-poster', {
        method: 'POST',
        body: formData,
      })
      if (res.ok) {
        const json = await res.json()
        if (json.url) return json.url
      }
    } catch {
      // Fallback to client-side upload if endpoint fails
    }

    // 2. Direct client-side upload to 'posters' bucket
    const supabase = createClient()
    const ext = file.name.split('.').pop() || 'jpg'
    const path = `events/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('posters').upload(path, file)
    if (error) throw error
    const { data } = supabase.storage.from('posters').getPublicUrl(path)
    return data.publicUrl
  }

  const addPrizePool = () => {
    setPrizePools(prev => [
      ...prev,
      { label: '', divisions: [], first_prize: 0, second_prize: 0, third_prize: 0 },
    ])
  }

  const removePrizePool = (index: number) => {
    setPrizePools(prev => prev.filter((_, i) => i !== index))
  }

  const updatePrizePool = (index: number, updates: Partial<PrizePoolGroup>) => {
    setPrizePools(prev => prev.map((p, i) => i === index ? { ...p, ...updates } : p))
  }

  const togglePoolDivision = (poolIndex: number, div: Division) => {
    setPrizePools(prev => prev.map((p, i) => {
      if (i !== poolIndex) return p
      const divisions = p.divisions.includes(div)
        ? p.divisions.filter(d => d !== div)
        : [...p.divisions, div] as Division[]
      const error = validatePrizePool({ ...p, divisions }) ?? undefined
      return { ...p, divisions, error }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate prize pools
    for (const pool of prizePools) {
      const err = validatePrizePool(pool)
      if (err) { setError(`Prize pool "${pool.label}": ${err}`); return }
    }

    setSubmitting(true)

    try {
      let finalPosterUrl = posterUrl

      if (posterFile) {
        setUploading(true)
        finalPosterUrl = await handlePosterUpload(posterFile)
        setUploading(false)
      }

      const payload = {
        title,
        description,
        poster_url: finalPosterUrl,
        sub_category_id: subCategoryId || null,
        event_date: dateTime ? dateTime.split('T')[0] : null,
        event_time: dateTime ? dateTime.split('T')[1] : null,
        venue,
        fee: Number(fee),
        participation_type: participationType || 'individual',
        team_min: participationType === 'team' ? Number(teamMin) : null,
        team_max: participationType === 'team' ? Number(teamMax) : null,
        eligible_divisions: eligibleDivisions,
        institution_restriction: institutionRestriction,
        conflict_alert_enabled: conflictAlertEnabled,
        prize_pools: prizePools,
      }

      const url = isEdit ? `/api/admin/events/${eventId}` : '/api/admin/events'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Failed to save event')
        return
      }

      const savedEventId = data.id ?? eventId

      // Prize pools are handled by the API POST route (passed in prize_pools field)
      // No separate API calls needed for new events

      router.push('/admin/events')
      router.refresh()
    } catch (err: any) {
      setError(err.message ?? 'An unexpected error occurred')
    } finally {
      setSubmitting(false)
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-3xl">
      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#CC892F]/15 border border-[#CC892F]/30 text-[#F4DD9F] text-sm">
          <span className="material-symbols-outlined text-base">error</span>
          {error}
        </div>
      )}

      {/* ── Basic Info ─────────────────────────────────────────────────────── */}
      <section className={cardCls}>
        <div className="flex items-center gap-2 pb-1 border-b border-[#3A291B]/60">
          <span className="material-symbols-outlined text-[#CC892F] text-lg">info</span>
          <h2 className="font-serif text-base text-[#F5EFE6]">Basic Information</h2>
        </div>

        <div>
          <label className={labelCls}>Title *</label>
          <input
            type="text"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            className={inputCls}
            placeholder="Event title"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Category *</label>
            <select
              required
              value={categoryId}
              onChange={e => { setCategoryId(e.target.value); setSubCategoryId('') }}
              className={`${inputCls} appearance-none`}
            >
              <option value="">Select category…</option>
              {(Array.isArray(categories) ? categories : []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Sub-Category</label>
            <select
              value={subCategoryId}
              onChange={e => setSubCategoryId(e.target.value)}
              disabled={!categoryId}
              className={`${inputCls} appearance-none disabled:opacity-40`}
            >
              <option value="">
                {!categoryId
                  ? 'Select a category first'
                  : subCategories.length === 0
                  ? 'No sub-categories — add in Categories page'
                  : 'None (no sub-category)'}
              </option>
              {subCategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className={labelCls}>Description / Rules</label>
          <textarea
            rows={5}
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full bg-[#141311] border border-[#3A291B]/90 rounded-xl px-4 py-3 text-[#F5EFE6] text-sm focus:outline-none focus:ring-1 focus:ring-[#CC892F] placeholder:text-[#A89F91]/60 resize-none"
            placeholder="Event description, rules, guidelines…"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Date &amp; Time</label>
            <input
              type="datetime-local"
              value={dateTime}
              onChange={e => setDateTime(e.target.value)}
              className={`${inputCls} font-mono`}
            />
          </div>
          <div>
            <label className={labelCls}>Venue</label>
            <input
              type="text"
              value={venue}
              onChange={e => setVenue(e.target.value)}
              className={inputCls}
              placeholder="Location / hall name"
            />
          </div>
        </div>

        <div>
          <label className={labelCls}>Registration Fee (₹)</label>
          <input
            type="number"
            min={0}
            value={fee}
            onChange={e => setFee(Number(e.target.value))}
            className={inputCls}
          />
        </div>

        {/* Poster Upload */}
        <div>
          <label className={labelCls}>Event Poster</label>
          {posterUrl && (
            <div className="mb-3">
              <img src={posterUrl} alt="Poster preview" className="h-24 rounded-xl object-cover border border-[#3A291B]/90" />
            </div>
          )}
          <label className="inline-flex items-center gap-2 h-10 px-4 bg-white/5 border border-[#3A291B]/90 rounded-full text-xs text-[#F5EFE6] cursor-pointer hover:bg-white/10 transition">
            <span className="material-symbols-outlined text-base text-[#A89F91]">upload</span>
            Choose image
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={e => {
                const file = e.target.files?.[0]
                if (file) {
                  setPosterFile(file)
                  setPosterUrl(URL.createObjectURL(file))
                }
              }}
            />
          </label>
          {uploading && (
            <p className="text-xs text-[#F4DD9F] mt-2 flex items-center gap-1.5">
              <span className="animate-spin material-symbols-outlined text-sm">progress_activity</span>
              Uploading poster…
            </p>
          )}
        </div>
      </section>

      {/* ── Participation ───────────────────────────────────────────────────── */}
      <section className={cardCls}>
        <div className="flex items-center gap-2 pb-1 border-b border-[#3A291B]/60">
          <span className="material-symbols-outlined text-[#CC892F] text-lg">groups</span>
          <h2 className="font-serif text-base text-[#F5EFE6]">Participation</h2>
        </div>

        <div>
          <label className={labelCls}>Participation Type *</label>
          <div className="flex gap-3">
            {(['individual', 'team'] as const).map(type => (
              <label
                key={type}
                className={`flex items-center gap-2 h-10 px-4 rounded-full border cursor-pointer transition text-sm font-medium capitalize ${
                  participationType === type
                    ? 'bg-[#CC892F]/15 border-[#CC892F]/40 text-[#F4DD9F]'
                    : 'bg-white/5 border-[#3A291B]/90 text-[#A89F91] hover:bg-white/10'
                }`}
              >
                <input
                  type="radio"
                  name="participation_type"
                  value={type}
                  checked={participationType === type}
                  onChange={() => setParticipationType(type)}
                  className="sr-only"
                />
                <span className="material-symbols-outlined text-sm">
                  {type === 'individual' ? 'person' : 'group'}
                </span>
                {type}
              </label>
            ))}
          </div>
        </div>

        {participationType === 'team' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Min Team Size</label>
              <input
                type="number"
                min={1}
                value={teamMin}
                onChange={e => setTeamMin(Number(e.target.value))}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Max Team Size (0 = unlimited)</label>
              <input
                type="number"
                min={0}
                value={teamMax}
                onChange={e => setTeamMax(Number(e.target.value))}
                className={inputCls}
              />
            </div>
          </div>
        )}

        <div>
          <label className={labelCls}>Eligible Divisions</label>
          <div className="flex flex-wrap gap-2">
            {DIVISIONS.map(div => (
              <button
                key={div}
                type="button"
                onClick={() => toggleDivision(div)}
                className={`inline-flex items-center h-8 px-3 rounded-full border text-xs font-bold tracking-wider transition ${
                  eligibleDivisions.includes(div)
                    ? divisionColors[div]
                    : 'bg-white/5 border-[#3A291B]/90 text-[#A89F91] hover:bg-white/10'
                }`}
              >
                {div}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelCls}>Institution Restriction</label>
          <select
            value={institutionRestriction}
            onChange={e => setInstitutionRestriction(e.target.value)}
            className={`${inputCls} appearance-none`}
          >
            <option value="none">None</option>
            <option value="per_institution">One per institution</option>
            <option value="per_division">One per institution per division</option>
          </select>
        </div>

        <label className="flex items-center gap-3 cursor-pointer group">
          <div
            onClick={() => setConflictAlertEnabled(!conflictAlertEnabled)}
            className={`relative w-10 h-6 rounded-full border transition ${
              conflictAlertEnabled
                ? 'bg-[#CC892F]/30 border-[#CC892F]/50'
                : 'bg-white/5 border-[#3A291B]/90'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform ${
                conflictAlertEnabled ? 'translate-x-4 bg-[#CC892F]' : 'bg-[#A89F91]'
              }`}
            />
          </div>
          <input
            type="checkbox"
            checked={conflictAlertEnabled}
            onChange={e => setConflictAlertEnabled(e.target.checked)}
            className="sr-only"
          />
          <span className="text-sm text-[#F5EFE6]/80 group-hover:text-[#F5EFE6] transition">
            Enable conflict alert (parallel events)
          </span>
        </label>
      </section>

      {/* ── Prize Pools ─────────────────────────────────────────────────────── */}
      <section className={cardCls}>
        <div className="flex items-center justify-between pb-1 border-b border-[#3A291B]/60">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#CC892F] text-lg">emoji_events</span>
            <h2 className="font-serif text-base text-[#F5EFE6]">Prize Pools</h2>
          </div>
          <button
            type="button"
            onClick={addPrizePool}
            className="inline-flex items-center gap-1.5 h-8 px-3 bg-white/5 border border-[#3A291B]/90 rounded-full text-xs text-[#E3B464] hover:bg-white/10 transition"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Add Pool Group
          </button>
        </div>

        {prizePools.length === 0 && (
          <p className="text-xs text-[#A89F91]/60 py-4 text-center">
            No prize pools configured. Click above to add one.
          </p>
        )}

        {prizePools.map((pool, index) => (
          <div key={index} className="bg-[#141311] border border-[#3A291B]/80 rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Group label (e.g. Senior, SD+SW)"
                value={pool.label}
                onChange={e => updatePrizePool(index, { label: e.target.value })}
                className="h-9 flex-1 bg-[#0D0C0A] border border-[#3A291B]/90 rounded-lg px-3 text-sm text-[#F5EFE6] placeholder:text-[#A89F91]/60 focus:outline-none focus:ring-1 focus:ring-[#CC892F]"
              />
              <button
                type="button"
                onClick={() => removePrizePool(index)}
                className="inline-flex items-center gap-1 h-8 px-3 bg-[#CC892F]/15 border border-[#CC892F]/30 text-[#F4DD9F] rounded-full text-[10px] font-bold uppercase tracking-wider hover:bg-[#CC892F]/25 transition"
              >
                <span className="material-symbols-outlined text-sm">close</span>
                Remove
              </button>
            </div>

            <div>
              <p className={labelCls}>Divisions</p>
              <div className="flex flex-wrap gap-2">
                {DIVISIONS.map(div => (
                  <button
                    key={div}
                    type="button"
                    onClick={() => togglePoolDivision(index, div)}
                    className={`inline-flex items-center h-7 px-3 rounded-full border text-[10px] font-bold tracking-wider transition ${
                      pool.divisions.includes(div)
                        ? divisionColors[div]
                        : 'bg-white/5 border-[#3A291B]/90 text-[#A89F91] hover:bg-white/10'
                    }`}
                  >
                    {div}
                  </button>
                ))}
              </div>
              {pool.error && (
                <p className="text-xs text-[#F4DD9F] mt-1.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">warning</span>
                  {pool.error}
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              {(['first_prize', 'second_prize', 'third_prize'] as const).map((field, rank) => (
                <div key={field}>
                  <label className={labelCls}>
                    {rank === 0 ? '🥇 1st Prize (₹)' : rank === 1 ? '🥈 2nd Prize (₹)' : '🥉 3rd Prize (₹)'}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={pool[field]}
                    onChange={e => updatePrizePool(index, { [field]: Number(e.target.value) })}
                    className="h-10 w-full bg-[#0D0C0A] border border-[#3A291B]/90 rounded-lg px-3 text-sm text-[#F5EFE6] font-mono focus:outline-none focus:ring-1 focus:ring-[#CC892F]"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* ── Submit ──────────────────────────────────────────────────────────── */}
      <div className="flex gap-3 pb-6">
        <button
          type="submit"
          disabled={submitting}
          className="h-12 px-8 gold-gradient-button rounded-full text-sm font-semibold uppercase tracking-wider shadow-[0_0_20px_rgba(204,137,47,0.4)] disabled:opacity-50 transition flex items-center gap-2"
        >
          {submitting ? (
            <>
              <span className="animate-spin material-symbols-outlined text-base">progress_activity</span>
              {uploading ? 'Uploading poster…' : 'Saving…'}
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-base">
                {isEdit ? 'save' : 'add_circle'}
              </span>
              {isEdit ? 'Update Event' : 'Create Event'}
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="h-12 px-6 bg-white/5 border border-[#3A291B]/90 text-[#F5EFE6] rounded-full text-sm font-medium hover:bg-white/10 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
