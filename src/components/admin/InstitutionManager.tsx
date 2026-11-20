'use client'

import { useState, useEffect, useCallback } from 'react'

type Group = { id: string; name: string }
type Battalion = { id: string; name: string; groupId: string }
type Institution = { id: string; name: string; battalionId: string }

export default function InstitutionManager() {
  const [groups, setGroups] = useState<Group[]>([])
  const [battalions, setBattalions] = useState<Record<string, Battalion[]>>({})
  const [institutions, setInstitutions] = useState<Record<string, Institution[]>>({})
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [expandedBattalions, setExpandedBattalions] = useState<Set<string>>(new Set())

  // Inline edit/add state
  const [editingGroup, setEditingGroup] = useState<string | null>(null)
  const [editingBattalion, setEditingBattalion] = useState<string | null>(null)
  const [editingInstitution, setEditingInstitution] = useState<string | null>(null)
  const [newGroupName, setNewGroupName] = useState('')
  const [addingGroup, setAddingGroup] = useState(false)
  const [addingBattalion, setAddingBattalion] = useState<string | null>(null)
  const [addingInstitution, setAddingInstitution] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState('')

  const loadGroups = useCallback(async () => {
    const res = await fetch('/api/admin/groups')
    if (res.ok) {
      const data = await res.json()
      setGroups(Array.isArray(data) ? data : [])
    } else {
      setGroups([])
    }
  }, [])

  useEffect(() => { loadGroups() }, [loadGroups])

  const loadBattalions = async (groupId: string) => {
    if (battalions[groupId]) return
    const res = await fetch(`/api/admin/battalions?groupId=${groupId}`)
    if (res.ok) {
      const data = await res.json()
      setBattalions(prev => ({ ...prev, [groupId]: data }))
    }
  }

  const loadInstitutions = async (battalionId: string) => {
    if (institutions[battalionId]) return
    const res = await fetch(`/api/admin/institutions?battalionId=${battalionId}`)
    if (res.ok) {
      const data = await res.json()
      setInstitutions(prev => ({ ...prev, [battalionId]: data }))
    }
  }

  const toggleGroup = async (groupId: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      if (next.has(groupId)) { next.delete(groupId) } else { next.add(groupId); loadBattalions(groupId) }
      return next
    })
  }

  const toggleBattalion = async (battalionId: string) => {
    setExpandedBattalions(prev => {
      const next = new Set(prev)
      if (next.has(battalionId)) { next.delete(battalionId) } else { next.add(battalionId); loadInstitutions(battalionId) }
      return next
    })
  }

  // ── Group CRUD ─────────────────────────────────────────────────────────────

  const handleAddGroup = async () => {
    if (!newGroupName.trim()) return
    const res = await fetch('/api/admin/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newGroupName.trim() }),
    })
    if (res.ok) { setNewGroupName(''); setAddingGroup(false); loadGroups() }
  }

  const handleUpdateGroup = async (id: string, name: string) => {
    const res = await fetch(`/api/admin/groups/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    if (res.ok) { setEditingGroup(null); loadGroups() }
  }

  const handleDeleteGroup = async (id: string, name: string) => {
    if (!window.confirm(`Delete group "${name}"? This cannot be undone.`)) return
    const res = await fetch(`/api/admin/groups/${id}`, { method: 'DELETE' })
    if (res.status === 409) { alert('Cannot delete: group has institutions with active profiles.'); return }
    if (res.ok) loadGroups()
  }

  // ── Battalion CRUD ─────────────────────────────────────────────────────────

  const handleAddBattalion = async (groupId: string) => {
    if (!inputValue.trim()) return
    const res = await fetch('/api/admin/battalions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: inputValue.trim(), groupId }),
    })
    if (res.ok) {
      setInputValue(''); setAddingBattalion(null)
      setBattalions(prev => ({ ...prev, [groupId]: [] }))
      loadBattalions(groupId)
    }
  }

  const handleUpdateBattalion = async (id: string, groupId: string) => {
    if (!inputValue.trim()) return
    const res = await fetch(`/api/admin/battalions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: inputValue.trim() }),
    })
    if (res.ok) {
      setEditingBattalion(null); setInputValue('')
      setBattalions(prev => ({ ...prev, [groupId]: [] }))
      loadBattalions(groupId)
    }
  }

  const handleDeleteBattalion = async (id: string, name: string, groupId: string) => {
    if (!window.confirm(`Delete battalion "${name}"?`)) return
    const res = await fetch(`/api/admin/battalions/${id}`, { method: 'DELETE' })
    if (res.ok) { setBattalions(prev => ({ ...prev, [groupId]: [] })); loadBattalions(groupId) }
  }

  // ── Institution CRUD ───────────────────────────────────────────────────────

  const handleAddInstitution = async (battalionId: string) => {
    if (!inputValue.trim()) return
    const res = await fetch('/api/admin/institutions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: inputValue.trim(), battalionId }),
    })
    if (res.ok) {
      setInputValue(''); setAddingInstitution(null)
      setInstitutions(prev => ({ ...prev, [battalionId]: [] }))
      loadInstitutions(battalionId)
    }
  }

  const handleUpdateInstitution = async (id: string, battalionId: string) => {
    if (!inputValue.trim()) return
    const res = await fetch(`/api/admin/institutions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: inputValue.trim() }),
    })
    if (res.ok) {
      setEditingInstitution(null); setInputValue('')
      setInstitutions(prev => ({ ...prev, [battalionId]: [] }))
      loadInstitutions(battalionId)
    }
  }

  const handleDeleteInstitution = async (id: string, name: string, battalionId: string) => {
    if (!window.confirm(`Delete institution "${name}"?`)) return
    const res = await fetch(`/api/admin/institutions/${id}`, { method: 'DELETE' })
    if (res.status === 409) { alert('Cannot delete: institution has active user profiles.'); return }
    if (res.ok) { setInstitutions(prev => ({ ...prev, [battalionId]: [] })); loadInstitutions(battalionId) }
  }

  return (
    <div className="space-y-3">
      {/* Add Group */}
      <div className="flex justify-end mb-4">
        {addingGroup ? (
          <div className="flex gap-2 items-center">
            <input
              autoFocus
              className="h-9 bg-[#0D1321] border border-white/10 rounded-lg px-3 text-xs text-[#DDE2F6] placeholder:text-[#8A94A8]/60 focus:outline-none focus:ring-1 focus:ring-[#C8102E]"
              placeholder="Group name"
              value={newGroupName}
              onChange={e => setNewGroupName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAddGroup(); if (e.key === 'Escape') setAddingGroup(false) }}
            />
            <button
              onClick={handleAddGroup}
              className="h-9 px-4 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 rounded-full text-[10px] font-bold uppercase tracking-wider transition"
            >
              Save
            </button>
            <button
              onClick={() => setAddingGroup(false)}
              className="h-9 px-4 bg-white/5 border border-white/10 text-[#8A94A8] hover:bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider transition"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAddingGroup(true)}
            className="inline-flex items-center gap-1.5 h-9 px-4 bg-[#C8102E] hover:bg-[#A00B22] text-white rounded-full text-xs font-semibold uppercase tracking-wider shadow-[0_0_16px_rgba(200,16,46,0.35)] transition"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Add Group
          </button>
        )}
      </div>

      {(Array.isArray(groups) ? groups : []).map(group => (
        <div key={group.id} className="bg-[#0D1321]/80 backdrop-blur-xl border border-white/8 rounded-2xl overflow-hidden">
          {/* Group Row */}
          <div className="flex items-center justify-between px-5 py-4">
            <button
              onClick={() => toggleGroup(group.id)}
              className="flex items-center gap-2 flex-1 text-left"
            >
              <span
                className={`material-symbols-outlined text-[#8A94A8] text-xl transition-transform duration-200 ${
                  expandedGroups.has(group.id) ? 'rotate-90' : ''
                }`}
              >
                chevron_right
              </span>
              {editingGroup === group.id ? (
                <input
                  autoFocus
                  className="h-8 bg-[#0D1321] border border-white/10 rounded-lg px-3 text-sm text-[#DDE2F6] focus:outline-none focus:ring-1 focus:ring-[#C8102E]"
                  defaultValue={group.name}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleUpdateGroup(group.id, (e.target as HTMLInputElement).value)
                    if (e.key === 'Escape') setEditingGroup(null)
                  }}
                  onClick={e => e.stopPropagation()}
                />
              ) : (
                <span className="font-serif text-base text-[#DDE2F6]">{group.name}</span>
              )}
            </button>
            <div className="flex gap-2 ml-4" onClick={e => e.stopPropagation()}>
              {editingGroup === group.id ? (
                <button
                  onClick={() => setEditingGroup(null)}
                  className="h-7 px-3 bg-white/5 border border-white/10 text-[#8A94A8] rounded-full text-[10px] font-bold uppercase tracking-wider hover:bg-white/10 transition"
                >
                  Cancel
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setEditingGroup(group.id)}
                    className="h-7 px-3 bg-[#ADC6FF]/10 border border-[#ADC6FF]/20 text-[#ADC6FF] rounded-full text-[10px] font-bold uppercase tracking-wider hover:bg-[#ADC6FF]/20 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteGroup(group.id, group.name)}
                    className="h-7 px-3 bg-[#C8102E]/15 border border-[#C8102E]/30 text-[#FFB3B1] rounded-full text-[10px] font-bold uppercase tracking-wider hover:bg-[#C8102E]/25 transition"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Battalions */}
          {expandedGroups.has(group.id) && (
            <div className="bg-[#080E1C]/90 px-5 pb-4 pt-2 space-y-2 border-t border-white/5">
              {(battalions[group.id] ?? []).map(bn => (
                <div key={bn.id} className="bg-[#0D1321]/60 border border-white/8 rounded-xl overflow-hidden">
                  {/* Battalion Row */}
                  <div className="flex items-center justify-between px-4 py-3">
                    <button
                      onClick={() => toggleBattalion(bn.id)}
                      className="flex items-center gap-2 flex-1 text-left"
                    >
                      <span
                        className={`material-symbols-outlined text-[#8A94A8] text-base transition-transform duration-200 ${
                          expandedBattalions.has(bn.id) ? 'rotate-90' : ''
                        }`}
                      >
                        chevron_right
                      </span>
                      {editingBattalion === bn.id ? (
                        <input
                          autoFocus
                          className="h-7 bg-[#080E1C] border border-white/10 rounded-lg px-3 text-xs text-[#DDE2F6] focus:outline-none focus:ring-1 focus:ring-[#C8102E]"
                          defaultValue={bn.name}
                          onChange={e => setInputValue(e.target.value)}
                          onFocus={e => setInputValue(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleUpdateBattalion(bn.id, group.id)
                            if (e.key === 'Escape') { setEditingBattalion(null); setInputValue('') }
                          }}
                          onClick={e => e.stopPropagation()}
                        />
                      ) : (
                        <span className="text-sm font-medium text-[#DDE2F6]/80">{bn.name}</span>
                      )}
                    </button>
                    <div className="flex gap-2 ml-2" onClick={e => e.stopPropagation()}>
                      {editingBattalion === bn.id ? (
                        <button
                          onClick={() => { setEditingBattalion(null); setInputValue('') }}
                          className="h-6 px-2.5 bg-white/5 border border-white/10 text-[#8A94A8] rounded-full text-[10px] font-bold uppercase tracking-wider hover:bg-white/10 transition"
                        >
                          Cancel
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => { setEditingBattalion(bn.id); setInputValue(bn.name) }}
                            className="h-6 px-2.5 bg-[#ADC6FF]/10 border border-[#ADC6FF]/20 text-[#ADC6FF] rounded-full text-[10px] font-bold uppercase tracking-wider hover:bg-[#ADC6FF]/20 transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteBattalion(bn.id, bn.name, group.id)}
                            className="h-6 px-2.5 bg-[#C8102E]/15 border border-[#C8102E]/30 text-[#FFB3B1] rounded-full text-[10px] font-bold uppercase tracking-wider hover:bg-[#C8102E]/25 transition"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Institutions */}
                  {expandedBattalions.has(bn.id) && (
                    <div className="bg-[#080E1C]/90 px-4 py-3 space-y-1.5 border-t border-white/5">
                      {(institutions[bn.id] ?? []).map(inst => (
                        <div
                          key={inst.id}
                          className="flex items-center justify-between py-1.5 px-3 rounded-lg hover:bg-white/[0.03] transition"
                        >
                          {editingInstitution === inst.id ? (
                            <input
                              autoFocus
                              className="h-7 bg-[#0D1321] border border-white/10 rounded-lg px-3 text-xs text-[#DDE2F6] flex-1 mr-2 focus:outline-none focus:ring-1 focus:ring-[#C8102E]"
                              defaultValue={inst.name}
                              onChange={e => setInputValue(e.target.value)}
                              onFocus={e => setInputValue(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') handleUpdateInstitution(inst.id, bn.id)
                                if (e.key === 'Escape') { setEditingInstitution(null); setInputValue('') }
                              }}
                            />
                          ) : (
                            <span className="text-xs text-[#DDE2F6]/70 flex-1">{inst.name}</span>
                          )}
                          <div className="flex gap-2">
                            {editingInstitution === inst.id ? (
                              <button
                                onClick={() => { setEditingInstitution(null); setInputValue('') }}
                                className="h-6 px-2.5 bg-white/5 border border-white/10 text-[#8A94A8] rounded-full text-[10px] font-bold uppercase tracking-wider hover:bg-white/10 transition"
                              >
                                Cancel
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => { setEditingInstitution(inst.id); setInputValue(inst.name) }}
                                  className="h-6 px-2.5 bg-[#ADC6FF]/10 border border-[#ADC6FF]/20 text-[#ADC6FF] rounded-full text-[10px] font-bold uppercase tracking-wider hover:bg-[#ADC6FF]/20 transition"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteInstitution(inst.id, inst.name, bn.id)}
                                  className="h-6 px-2.5 bg-[#C8102E]/15 border border-[#C8102E]/30 text-[#FFB3B1] rounded-full text-[10px] font-bold uppercase tracking-wider hover:bg-[#C8102E]/25 transition"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Add Institution */}
                      {addingInstitution === bn.id ? (
                        <div className="flex gap-2 mt-2 items-center">
                          <input
                            autoFocus
                            className="h-9 flex-1 bg-[#0D1321] border border-white/10 rounded-full px-4 text-xs text-[#DDE2F6] placeholder:text-[#8A94A8]/60 focus:outline-none focus:ring-1 focus:ring-[#C8102E]"
                            placeholder="Institution name"
                            value={inputValue}
                            onChange={e => setInputValue(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleAddInstitution(bn.id)
                              if (e.key === 'Escape') { setAddingInstitution(null); setInputValue('') }
                            }}
                          />
                          <button
                            onClick={() => handleAddInstitution(bn.id)}
                            className="h-9 px-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 rounded-full text-[10px] font-bold uppercase tracking-wider transition"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => { setAddingInstitution(null); setInputValue('') }}
                            className="h-9 w-9 flex items-center justify-center bg-white/5 border border-white/10 text-[#8A94A8] rounded-full hover:bg-white/10 transition"
                          >
                            <span className="material-symbols-outlined text-sm">close</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setAddingInstitution(bn.id); setInputValue('') }}
                          className="mt-2 inline-flex items-center gap-1 text-xs text-[#ADC6FF]/60 hover:text-[#ADC6FF] transition"
                        >
                          <span className="material-symbols-outlined text-sm">add_circle</span>
                          Add Institution
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Add Battalion */}
              {addingBattalion === group.id ? (
                <div className="flex gap-2 mt-2 items-center">
                  <input
                    autoFocus
                    className="h-9 flex-1 bg-[#0D1321] border border-white/10 rounded-full px-4 text-xs text-[#DDE2F6] placeholder:text-[#8A94A8]/60 focus:outline-none focus:ring-1 focus:ring-[#C8102E]"
                    placeholder="Battalion name"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleAddBattalion(group.id)
                      if (e.key === 'Escape') { setAddingBattalion(null); setInputValue('') }
                    }}
                  />
                  <button
                    onClick={() => handleAddBattalion(group.id)}
                    className="h-9 px-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 rounded-full text-[10px] font-bold uppercase tracking-wider transition"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => { setAddingBattalion(null); setInputValue('') }}
                    className="h-9 w-9 flex items-center justify-center bg-white/5 border border-white/10 text-[#8A94A8] rounded-full hover:bg-white/10 transition"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setAddingBattalion(group.id); setInputValue('') }}
                  className="mt-1 inline-flex items-center gap-1 text-xs text-[#ADC6FF]/60 hover:text-[#ADC6FF] transition"
                >
                  <span className="material-symbols-outlined text-sm">add_circle</span>
                  Add Battalion
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
