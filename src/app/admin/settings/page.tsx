'use client'

import { useState, useEffect } from 'react'

interface AppSetting {
  key: string
  value: string
  updatedAt?: string
}

function toLocalDatetimeString(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [deadlineInput, setDeadlineInput] = useState('')
  const [festNameInput, setFestNameInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [savingKey, setSavingKey] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((data: AppSetting[]) => {
        if (Array.isArray(data)) {
          const map: Record<string, string> = {}
          data.forEach((s) => {
            map[s.key] = s.value
          })
          setSettings(map)
          if (map.registration_deadline) {
            setDeadlineInput(toLocalDatetimeString(map.registration_deadline))
          }
          if (map.fest_name) {
            setFestNameInput(map.fest_name)
          }
        }
      })
      .catch(() => {
        showToast('Failed to load settings', 'error')
      })
      .finally(() => setLoading(false))
  }, [])

  const saveSetting = async (key: string, value: string) => {
    setSavingKey(key)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      })
      const data = await res.json()
      if (res.ok) {
        setSettings((prev) => ({ ...prev, [key]: value }))
        showToast(`Setting "${key}" saved successfully!`, 'success')
      } else {
        showToast(data.error || 'Failed to save setting', 'error')
      }
    } catch (err: any) {
      showToast(err.message || 'Error saving setting', 'error')
    } finally {
      setSavingKey(null)
    }
  }

  const handleDeadlineChange = (val: string) => {
    setDeadlineInput(val)
    if (!val) return
    const isoString = new Date(val).toISOString()
    saveSetting('registration_deadline', isoString)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#8A94A8] mb-1">
          Operational Config
        </p>
        <h1 className="font-serif text-2xl text-[#DDE2F6]">System Settings</h1>
        <p className="text-xs text-[#8A94A8] mt-1">
          Configure fest-wide operational constraints and platform variables.
        </p>
      </div>

      {/* Toast Alert */}
      {toast && (
        <div
          className={`px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-between border ${
            toast.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
              : 'bg-[#C8102E]/15 border-[#C8102E]/30 text-[#FFB3B1]'
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

      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#C8102E] border-t-transparent" />
          <p className="text-xs text-[#8A94A8]">Loading settings...</p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Card: Registration Deadline */}
          <div className="bg-[#0D1321]/80 backdrop-blur-xl border border-white/8 rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[#C8102E] text-xl mt-0.5">
                  schedule
                </span>
                <div>
                  <h2 className="font-serif text-base text-[#DDE2F6]">Registration Deadline</h2>
                  <p className="text-xs text-[#8A94A8] mt-0.5">
                    Fest-wide cut-off timestamp. New registrations will be blocked across all events after this moment.
                  </p>
                </div>
              </div>
              {savingKey === 'registration_deadline' && (
                <span className="text-xs text-[#FFB3B1] font-medium animate-pulse flex items-center gap-1 shrink-0 ml-4">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#C8102E]" />
                  Saving…
                </span>
              )}
            </div>

            <div className="max-w-md space-y-2">
              <label className="block text-[10px] font-semibold tracking-[0.14em] uppercase text-[#8A94A8]">
                Deadline Date &amp; Time
              </label>
              <input
                type="datetime-local"
                value={deadlineInput}
                onChange={(e) => handleDeadlineChange(e.target.value)}
                className="h-12 w-full bg-[#161B2A] border border-white/10 rounded-lg px-3 text-[#DDE2F6] text-sm font-mono focus:outline-none focus:ring-1 focus:ring-[#C8102E]"
              />
              {settings.registration_deadline && (
                <p className="text-xs text-[#8A94A8]">
                  Stored ISO:{' '}
                  <span className="font-mono text-[#DDE2F6]/70">{settings.registration_deadline}</span>
                </p>
              )}
            </div>
          </div>

          {/* Card: Fest Branding */}
          <div className="bg-[#0D1321]/80 backdrop-blur-xl border border-white/8 rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[#C8102E] text-xl mt-0.5">
                  military_tech
                </span>
                <div>
                  <h2 className="font-serif text-base text-[#DDE2F6]">Fest Name</h2>
                  <p className="text-xs text-[#8A94A8] mt-0.5">
                    Global title displayed across headers and event badges.
                  </p>
                </div>
              </div>
              {savingKey === 'fest_name' && (
                <span className="text-xs text-[#FFB3B1] font-medium animate-pulse flex items-center gap-1 shrink-0 ml-4">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#C8102E]" />
                  Saving…
                </span>
              )}
            </div>

            <div className="max-w-md space-y-2">
              <label className="block text-[10px] font-semibold tracking-[0.14em] uppercase text-[#8A94A8]">
                Platform Title
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={festNameInput}
                  onChange={(e) => setFestNameInput(e.target.value)}
                  placeholder="e.g. FEST — NCC Fest 2025"
                  className="h-12 flex-1 bg-[#161B2A] border border-white/10 rounded-lg px-3 text-[#DDE2F6] text-sm focus:outline-none focus:ring-1 focus:ring-[#C8102E]"
                />
                <button
                  type="button"
                  onClick={() => saveSetting('fest_name', festNameInput)}
                  disabled={savingKey === 'fest_name'}
                  className="h-10 self-center px-5 bg-[#C8102E] hover:bg-[#A00B22] text-white rounded-full text-xs font-semibold uppercase tracking-wider shadow-[0_0_16px_rgba(200,16,46,0.35)] disabled:opacity-50 transition shrink-0"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
