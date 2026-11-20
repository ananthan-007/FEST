'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type Division = 'SD' | 'SW' | 'JD' | 'JW'

interface Group { id: string; name: string }
interface Battalion { id: string; name: string }
interface Institution { id: string; name: string }

interface Profile {
  id: string
  display_name: string | null
  phone: string | null
  division: Division | null
  division_locked: boolean
  institution_id: string | null
  profile_complete: boolean
  institution?: {
    id: string; name: string
    battalion: { id: string; name: string; ncc_group: { id: string; name: string } }
  }
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [groups, setGroups] = useState<Group[]>([])
  const [battalions, setBattalions] = useState<Battalion[]>([])
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState('')
  const [selectedBattalionId, setSelectedBattalionId] = useState('')
  const [form, setForm] = useState({
    display_name: '',
    phone: '',
    division: '' as Division | '',
    institution_id: '',
  })
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [saving, setSaving] = useState(false)

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  useEffect(() => {
    fetch('/api/user/profile')
      .then(r => r.json())
      .then((p: Profile) => {
        setProfile(p)
        setForm({
          display_name: p.display_name ?? '',
          phone: p.phone ?? '',
          division: p.division ?? '',
          institution_id: p.institution_id ?? '',
        })
        if (p.institution?.battalion?.ncc_group?.id) setSelectedGroupId(p.institution.battalion.ncc_group.id)
        if (p.institution?.battalion?.id) setSelectedBattalionId(p.institution.battalion.id)
      })

    fetch('/api/institutions/cascade?groups=true')
      .then(r => r.json())
      .then(data => setGroups(Array.isArray(data) ? data : []))
      .catch(() => setGroups([]))
  }, [])

  useEffect(() => {
    if (!selectedGroupId) { setBattalions([]); setInstitutions([]); return }
    fetch(`/api/institutions/cascade?groupId=${selectedGroupId}`)
      .then(r => r.json())
      .then(data => setBattalions(Array.isArray(data) ? data : []))
  }, [selectedGroupId])

  useEffect(() => {
    if (!selectedBattalionId) { setInstitutions([]); return }
    fetch(`/api/institutions/cascade?battalionId=${selectedBattalionId}`)
      .then(r => r.json())
      .then(data => setInstitutions(Array.isArray(data) ? data : []))
  }, [selectedBattalionId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/user/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, institution_id: form.institution_id || null }),
    })
    setSaving(false)
    if (res.ok) {
      const updated = await res.json()
      setProfile(updated)
      showToast('Cadet record updated successfully.', 'success')
    } else {
      const { error } = await res.json()
      showToast(error ?? 'Failed to save profile', 'error')
    }
  }

  // Compute initials from name
  const displayName = form.display_name || profile?.display_name || 'C'
  const initials = displayName.trim().split(/\s+/).map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()

  const divisionColors: Record<string, string> = {
    SD: 'from-blue-600/30 to-blue-900/20 border-blue-500/30 text-blue-300',
    SW: 'from-purple-600/30 to-purple-900/20 border-purple-500/30 text-purple-300',
    JD: 'from-emerald-600/30 to-emerald-900/20 border-emerald-500/30 text-emerald-300',
    JW: 'from-pink-600/30 to-pink-900/20 border-pink-500/30 text-pink-300',
  }
  const divColor = form.division ? divisionColors[form.division] : 'from-[#C8102E]/20 to-[#161B2A] border-[#C8102E]/30 text-[#C8102E]'

  return (
    <div className="min-h-screen bg-[#050A18] text-[#DDE2F6] pb-24">
      {/* Header */}
      <header className="h-16 px-4 sm:px-8 border-b border-white/5 flex items-center justify-between bg-[#050A18]/80 backdrop-blur-xl sticky top-0 z-40">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#8A94A8] hover:text-[#DDE2F6] transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Cadet HQ
        </Link>
        <span className="h-6 px-3 inline-flex items-center bg-[#C8102E]/15 border border-[#C8102E]/30 rounded-full text-[9px] font-semibold tracking-wider uppercase text-[#FFB3B1]">
          Identity Configuration
        </span>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div>
          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#C8102E] block mb-1">
            Service Dossier
          </span>
          <h1 className="font-serif text-3xl text-[#DDE2F6]">Cadet Identity Profile</h1>
          <p className="text-xs text-[#8A94A8] mt-1">
            Ensure your division and institutional hierarchy correspond with your official NCC enrolment.
          </p>
        </div>

        {/* Toast */}
        {toast && (
          <div className={`px-4 py-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
            toast.type === 'success'
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
              : 'bg-[#C8102E]/15 border border-[#C8102E]/30 text-[#FFB3B1]'
          }`}>
            <span className="material-symbols-outlined text-sm">
              {toast.type === 'success' ? 'check_circle' : 'error'}
            </span>
            {toast.msg}
          </div>
        )}

        <div className="bg-[#0D1321]/80 backdrop-blur-xl border border-white/8 rounded-2xl p-6 sm:p-8 shadow-2xl">

          {/* Avatar centered in division card */}
          <div className={`flex flex-col items-center justify-center gap-3 p-6 mb-6 rounded-2xl border bg-gradient-to-br ${divColor}`}>
            <div className="w-20 h-20 rounded-full bg-[#050A18]/60 border-2 border-white/15 flex items-center justify-center">
              <span className="font-serif text-3xl font-bold text-[#DDE2F6]">{initials}</span>
            </div>
            <div className="text-center">
              <p className="font-serif text-lg text-[#DDE2F6]">{displayName}</p>
              {form.division && (
                <span className="text-[10px] font-semibold tracking-[0.18em] uppercase opacity-80 mt-0.5 block">
                  {form.division === 'SD' ? 'Senior Division' :
                   form.division === 'SW' ? 'Senior Wing' :
                   form.division === 'JD' ? 'Junior Division' : 'Junior Wing'}
                </span>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Display Name */}
            <div>
              <label className="block text-[10px] font-semibold tracking-[0.14em] uppercase text-[#8A94A8] mb-2">
                Full Cadet Name *
              </label>
              <input
                type="text"
                required
                className="h-12 w-full bg-[#161B2A] border border-white/10 rounded-full px-5 text-[#DDE2F6] text-sm focus:outline-none focus:ring-1 focus:ring-[#C8102E]"
                value={form.display_name}
                onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))}
                placeholder="Cadet Name"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-[10px] font-semibold tracking-[0.14em] uppercase text-[#8A94A8] mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                className="h-12 w-full bg-[#161B2A] border border-white/10 rounded-full px-5 text-[#DDE2F6] text-sm focus:outline-none focus:ring-1 focus:ring-[#C8102E]"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+91 9876543210"
              />
            </div>

            {/* Division */}
            <div>
              <label className="block text-[10px] font-semibold tracking-[0.14em] uppercase text-[#8A94A8] mb-2">
                Division / Wing *
              </label>
              {profile?.division_locked ? (
                <div className="h-12 w-full bg-[#161B2A]/50 border border-white/5 rounded-full px-5 text-sm flex items-center justify-between text-[#8A94A8]">
                  <span>{form.division}</span>
                  <span className="text-[10px] text-[#8A94A8]/60 uppercase tracking-wider">Locked post-enlistment</span>
                </div>
              ) : (
                <select
                  required
                  className="h-12 w-full bg-[#161B2A] border border-white/10 rounded-full px-5 text-[#DDE2F6] text-sm focus:outline-none focus:ring-1 focus:ring-[#C8102E]"
                  value={form.division}
                  onChange={e => setForm(f => ({ ...f, division: e.target.value as Division }))}
                >
                  <option value="" className="bg-[#0D1321] text-[#8A94A8]">Select division</option>
                  <option value="SD" className="bg-[#0D1321]">SD – Senior Division</option>
                  <option value="SW" className="bg-[#0D1321]">SW – Senior Wing</option>
                  <option value="JD" className="bg-[#0D1321]">JD – Junior Division</option>
                  <option value="JW" className="bg-[#0D1321]">JW – Junior Wing</option>
                </select>
              )}
            </div>

            {/* NCC Group */}
            <div>
              <label className="block text-[10px] font-semibold tracking-[0.14em] uppercase text-[#8A94A8] mb-2">
                NCC Group
              </label>
              <select
                className="h-12 w-full bg-[#161B2A] border border-white/10 rounded-full px-5 text-[#DDE2F6] text-sm focus:outline-none focus:ring-1 focus:ring-[#C8102E]"
                value={selectedGroupId}
                onChange={e => { setSelectedGroupId(e.target.value); setSelectedBattalionId(''); setForm(f => ({ ...f, institution_id: '' })) }}
              >
                <option value="" className="bg-[#0D1321] text-[#8A94A8]">Select NCC Group</option>
                {groups.map(g => <option key={g.id} value={g.id} className="bg-[#0D1321]">{g.name}</option>)}
              </select>
            </div>

            {/* Battalion */}
            <div>
              <label className="block text-[10px] font-semibold tracking-[0.14em] uppercase text-[#8A94A8] mb-2">
                Battalion
              </label>
              <select
                className="h-12 w-full bg-[#161B2A] border border-white/10 rounded-full px-5 text-[#DDE2F6] text-sm focus:outline-none focus:ring-1 focus:ring-[#C8102E] disabled:opacity-40"
                value={selectedBattalionId}
                disabled={!selectedGroupId}
                onChange={e => { setSelectedBattalionId(e.target.value); setForm(f => ({ ...f, institution_id: '' })) }}
              >
                <option value="" className="bg-[#0D1321] text-[#8A94A8]">Select Battalion</option>
                {battalions.map(b => <option key={b.id} value={b.id} className="bg-[#0D1321]">{b.name}</option>)}
              </select>
            </div>

            {/* Institution */}
            <div>
              <label className="block text-[10px] font-semibold tracking-[0.14em] uppercase text-[#8A94A8] mb-2">
                Educational Institution *
              </label>
              <select
                required
                className="h-12 w-full bg-[#161B2A] border border-white/10 rounded-full px-5 text-[#DDE2F6] text-sm focus:outline-none focus:ring-1 focus:ring-[#C8102E] disabled:opacity-40"
                value={form.institution_id}
                disabled={!selectedBattalionId}
                onChange={e => setForm(f => ({ ...f, institution_id: e.target.value }))}
              >
                <option value="" className="bg-[#0D1321] text-[#8A94A8]">Select Institution</option>
                {institutions.map(i => <option key={i.id} value={i.id} className="bg-[#0D1321]">{i.name}</option>)}
              </select>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="h-12 w-full bg-[#C8102E] hover:bg-[#A00B22] text-white rounded-full text-xs font-semibold uppercase tracking-wider shadow-[0_0_20px_rgba(200,16,46,0.35)] transition disabled:opacity-50"
            >
              {saving ? 'Saving Dossier…' : 'Save Cadet Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
