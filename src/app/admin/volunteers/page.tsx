'use client'

import { useState, useEffect, useCallback } from 'react'

interface UserItem {
  id: string
  display_name: string
  email: string
  role: 'user' | 'volunteer' | 'admin'
  division: string | null
  institution?: { id: string; name: string } | null
  institutions?: { id: string; name: string } | null
}

const roleBadges: Record<string, { label: string; class: string }> = {
  admin: { label: 'Admin', class: 'bg-[#CC892F]/15 border border-[#CC892F]/30 text-[#F4DD9F]' },
  volunteer: { label: 'Volunteer', class: 'bg-purple-500/15 border border-purple-500/30 text-purple-400' },
  user: { label: 'Cadet', class: 'bg-white/5 border border-[#3A291B]/90 text-[#A89F91]' },
}

const divisionColors: Record<string, string> = {
  SD: 'bg-blue-500/15 border-blue-500/30 text-blue-400',
  SW: 'bg-purple-500/15 border-purple-500/30 text-purple-400',
  JD: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
  JW: 'bg-pink-500/15 border-pink-500/30 text-pink-400',
}

export default function AdminVolunteersPage() {
  const [users, setUsers] = useState<UserItem[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const loadUsers = useCallback(async (query: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users?search=${encodeURIComponent(query)}`)
      const data = await res.json()
      if (Array.isArray(data)) {
        setUsers(data)
      } else {
        setUsers([])
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to search users', 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const handler = setTimeout(() => {
      loadUsers(search)
    }, 300)
    return () => clearTimeout(handler)
  }, [search, loadUsers])

  const handleRoleToggle = async (user: UserItem) => {
    if (user.role === 'admin') return

    const newRole = user.role === 'volunteer' ? 'user' : 'volunteer'
    setUpdatingId(user.id)

    try {
      const res = await fetch(`/api/admin/users/${user.id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, role: newRole as any } : u))
        )
        showToast(
          `User ${user.display_name} is now a ${newRole === 'volunteer' ? 'Volunteer' : 'Regular Cadet'}!`,
          'success'
        )
      } else {
        showToast(data.error || 'Failed to update user role', 'error')
      }
    } catch (err: any) {
      showToast(err.message || 'Error updating role', 'error')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-[#3A291B]/80 pb-5">
        <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#CC892F] mb-1">
          Personnel Clearance
        </p>
        <h1 className="font-serif text-3xl text-[#F5EFE6]">Volunteer &amp; Staff Management</h1>
        <p className="text-xs text-[#A89F91] mt-1">
          Search registered cadets and grant or revoke scanner desk volunteer privileges.
        </p>
      </div>

      {/* Toast Alert */}
      {toast && (
        <div
          className={`px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-between border ${
            toast.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
              : 'bg-[#CC892F]/15 border-[#CC892F]/30 text-[#F4DD9F]'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base">
              {toast.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <span>{toast.msg}</span>
          </div>
          <button onClick={() => setToast(null)} className="ml-4 opacity-60 hover:opacity-100">
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}

      {/* Search Input Bar */}
      <div className="bg-[#0D0C0A]/80 backdrop-blur-xl border border-[#3A291B]/80 rounded-2xl p-3 flex items-center gap-3">
        <span className="material-symbols-outlined text-[#A89F91] text-xl">search</span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search cadets by name or email address..."
          className="flex-1 text-sm bg-transparent text-[#F5EFE6] placeholder:text-[#A89F91]/60 outline-none"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="text-xs text-[#A89F91] hover:text-[#F5EFE6] px-2 py-1 rounded-full hover:bg-white/5 transition"
          >
            Clear
          </button>
        )}
      </div>

      {/* Users List Table */}
      <div className="bg-[#0D0C0A]/80 backdrop-blur-xl border border-[#3A291B]/80 rounded-2xl shadow-2xl overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#CC892F] border-t-transparent" />
            <p className="text-xs text-[#A89F91]">Searching accounts...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center">
            <span className="material-symbols-outlined text-4xl text-[#A89F91]/40 mb-3 block">
              manage_accounts
            </span>
            <p className="text-sm font-semibold text-[#F5EFE6]/60">No cadets found</p>
            <p className="text-xs text-[#A89F91]/60 mt-1">Try typing a different name or email.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#141311]/90 border-b border-[#3A291B]/60">
                <tr>
                  <th className="py-3.5 px-5 text-[10px] font-semibold tracking-[0.14em] uppercase text-[#A89F91]">
                    Cadet / User
                  </th>
                  <th className="py-3.5 px-4 text-[10px] font-semibold tracking-[0.14em] uppercase text-[#A89F91]">
                    Institution
                  </th>
                  <th className="py-3.5 px-4 text-[10px] font-semibold tracking-[0.14em] uppercase text-[#A89F91]">
                    Division
                  </th>
                  <th className="py-3.5 px-4 text-[10px] font-semibold tracking-[0.14em] uppercase text-[#A89F91]">
                    Current Role
                  </th>
                  <th className="py-3.5 px-5 text-right text-[10px] font-semibold tracking-[0.14em] uppercase text-[#A89F91]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3A291B]/60">
                {users.map((u) => {
                  const badge = roleBadges[u.role] || roleBadges.user
                  const isUpdating = updatingId === u.id
                  const divClass = u.division ? (divisionColors[u.division] ?? 'bg-white/5 border-[#3A291B]/90 text-[#A89F91]') : ''

                  return (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition">
                      <td className="py-3.5 px-5">
                        <div className="font-semibold text-sm text-[#F5EFE6]">{u.display_name}</div>
                        <div className="text-[11px] font-mono text-[#A89F91] mt-0.5">{u.email}</div>
                      </td>
                      <td className="py-3.5 px-4 text-sm text-[#A89F91]">
                        {u.institutions?.name || u.institution?.name || (
                          <span className="italic text-[#A89F91]/40">None</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {u.division ? (
                          <span
                            className={`inline-flex items-center h-5 px-2.5 border rounded-full text-[10px] font-bold tracking-wider ${divClass}`}
                          >
                            {u.division}
                          </span>
                        ) : (
                          <span className="text-xs text-[#A89F91]/40">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center h-5 px-2.5 border rounded-full text-[10px] font-bold tracking-wider ${badge.class}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        {u.role === 'admin' ? (
                          <span className="text-[11px] text-[#A89F91]/40 italic">System Admin</span>
                        ) : u.role === 'volunteer' ? (
                          <button
                            onClick={() => handleRoleToggle(u)}
                            disabled={isUpdating}
                            className="inline-flex items-center h-8 px-4 bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25 rounded-full text-[10px] font-bold uppercase tracking-wider transition disabled:opacity-50"
                          >
                            {isUpdating ? 'Updating...' : 'Revoke Access'}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRoleToggle(u)}
                            disabled={isUpdating}
                            className="inline-flex items-center h-8 px-4 bg-purple-500/15 border border-purple-500/30 text-purple-400 hover:bg-purple-500/25 rounded-full text-[10px] font-bold uppercase tracking-wider transition disabled:opacity-50"
                          >
                            {isUpdating ? 'Updating...' : 'Grant Volunteer'}
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
