'use client'

import { useState, useEffect } from 'react'

interface SubCategory {
  id: string
  name: string
  category_id: string
}

interface Category {
  id: string
  name: string
  sub_categories?: SubCategory[]
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [subCategoriesMap, setSubCategoriesMap] = useState<Record<string, SubCategory[]>>({})
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({})

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // New Category state
  const [newCatName, setNewCatName] = useState('')
  const [addingCat, setAddingCat] = useState(false)

  // Edit Category state
  const [editingCatId, setEditingCatId] = useState<string | null>(null)
  const [editingCatName, setEditingCatName] = useState('')

  // New SubCategory state per category
  const [newSubCatNames, setNewSubCatNames] = useState<Record<string, string>>({})

  // Edit SubCategory state
  const [editingSubCatId, setEditingSubCatId] = useState<string | null>(null)
  const [editingSubCatName, setEditingSubCatName] = useState('')

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories')
      if (!res.ok) throw new Error('Failed to load categories')
      const data = await res.json()
      const cats: Category[] = Array.isArray(data) ? data : []
      setCategories(cats)

      // Pre-populate subCategoriesMap from the embedded sub_categories returned by the API
      // This avoids a separate fetch per category on expand
      const mapFromEmbedded: Record<string, SubCategory[]> = {}
      for (const cat of cats) {
        if (Array.isArray(cat.sub_categories)) {
          mapFromEmbedded[cat.id] = cat.sub_categories
        }
      }
      setSubCategoriesMap(prev => ({ ...prev, ...mapFromEmbedded }))
    } catch (err: any) {
      setError(err.message)
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  const fetchSubCategories = async (categoryId: string) => {
    try {
      const res = await fetch(`/api/admin/subcategories?categoryId=${categoryId}`)
      if (!res.ok) throw new Error('Failed to load subcategories')
      const data = await res.json()
      setSubCategoriesMap((prev) => ({ ...prev, [categoryId]: Array.isArray(data) ? data : [] }))
    } catch (err: any) {
      console.error(err)
      setSubCategoriesMap((prev) => ({ ...prev, [categoryId]: [] }))
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const toggleExpand = (catId: string) => {
    setExpandedCats((prev) => {
      const next = !prev[catId]
      // Always refresh subcategories from API when expanding (gets latest data)
      if (next) {
        fetchSubCategories(catId)
      }
      return { ...prev, [catId]: next }
    })
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCatName.trim()) return
    setAddingCat(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCatName.trim() }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to add category')
      }
      setNewCatName('')
      await fetchCategories()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setAddingCat(false)
    }
  }

  const handleUpdateCategory = async (catId: string) => {
    if (!editingCatName.trim()) return
    setError(null)
    try {
      const res = await fetch(`/api/admin/categories/${catId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingCatName.trim() }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to update category')
      }
      setEditingCatId(null)
      await fetchCategories()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleDeleteCategory = async (catId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return
    setError(null)
    try {
      const res = await fetch(`/api/admin/categories/${catId}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to delete category')
      }
      await fetchCategories()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleAddSubCategory = async (categoryId: string) => {
    const subName = newSubCatNames[categoryId]?.trim()
    if (!subName) return
    setError(null)
    try {
      const res = await fetch('/api/admin/subcategories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: subName, category_id: categoryId }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to add subcategory')
      }
      setNewSubCatNames((prev) => ({ ...prev, [categoryId]: '' }))
      await fetchSubCategories(categoryId)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleUpdateSubCategory = async (subCatId: string, categoryId: string) => {
    if (!editingSubCatName.trim()) return
    setError(null)
    try {
      const res = await fetch(`/api/admin/subcategories/${subCatId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingSubCatName.trim() }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to update subcategory')
      }
      setEditingSubCatId(null)
      await fetchSubCategories(categoryId)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleDeleteSubCategory = async (subCatId: string, categoryId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete subcategory "${name}"?`)) return
    setError(null)
    try {
      const res = await fetch(`/api/admin/subcategories/${subCatId}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to delete subcategory')
      }
      await fetchSubCategories(categoryId)
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#C8102E] block mb-1">
          Taxonomy Command
        </span>
        <h1 className="text-2xl font-serif text-[#DDE2F6]">Event Categories &amp; Wings</h1>
        <p className="text-xs text-[#8A94A8] mt-1">
          Configure operational classification and competition sub-categories.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-[#C8102E]/15 border border-[#C8102E]/30 text-[#FFB3B1] text-xs flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">error</span>
          {error}
        </div>
      )}

      {/* Add New Category */}
      <form onSubmit={handleAddCategory} className="flex gap-3">
        <input
          type="text"
          placeholder="New Category Name (e.g. Cultural, Sports, Tactical Drill)"
          value={newCatName}
          onChange={(e) => setNewCatName(e.target.value)}
          className="flex-1 h-12 bg-[#0D1321]/80 border border-white/10 rounded-full px-5 text-sm text-[#DDE2F6] placeholder-[#8A94A8]/50 focus:outline-none focus:ring-1 focus:ring-[#C8102E]"
        />
        <button
          type="submit"
          disabled={addingCat || !newCatName.trim()}
          className="h-12 px-6 bg-[#C8102E] hover:bg-[#A00B22] text-white rounded-full text-xs font-semibold uppercase tracking-wider shadow-[0_0_20px_rgba(200,16,46,0.35)] disabled:opacity-50 transition shrink-0"
        >
          {addingCat ? 'Adding…' : '+ Add Category'}
        </button>
      </form>

      {/* Category List */}
      {loading ? (
        <div className="py-12 flex items-center justify-center gap-3 text-[#8A94A8] text-xs uppercase tracking-widest">
          <div className="w-6 h-6 border-2 border-[#C8102E] border-t-transparent rounded-full animate-spin" />
          Loading Classifications…
        </div>
      ) : categories.length === 0 ? (
        <div className="p-8 bg-[#0D1321]/60 border border-white/5 rounded-2xl text-center text-[#8A94A8] text-xs">
          No categories found. Define one above to initialize event classification.
        </div>
      ) : (
        <div className="space-y-3">
          {(Array.isArray(categories) ? categories : []).map((cat) => {
            const isExpanded = !!expandedCats[cat.id]
            const subCats = subCategoriesMap[cat.id] || []
            const isEditing = editingCatId === cat.id

            return (
              <div
                key={cat.id}
                className="border border-white/8 rounded-2xl bg-[#0D1321]/80 backdrop-blur-xl shadow-xl overflow-hidden"
              >
                {/* Category Header */}
                <div className="p-4 flex items-center justify-between bg-[#161B2A]/80 border-b border-white/5">
                  <div className="flex items-center gap-3 flex-1">
                    <button
                      type="button"
                      onClick={() => toggleExpand(cat.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/5 text-[#8A94A8] transition"
                    >
                      <span
                        className={`material-symbols-outlined text-[18px] transform transition-transform ${
                          isExpanded ? 'rotate-90' : ''
                        }`}
                      >
                        chevron_right
                      </span>
                    </button>

                    {isEditing ? (
                      <div className="flex items-center gap-2 flex-1 max-w-sm">
                        <input
                          type="text"
                          value={editingCatName}
                          onChange={(e) => setEditingCatName(e.target.value)}
                          className="h-9 border border-white/10 bg-[#0D1321] rounded-lg px-3 text-xs text-[#DDE2F6] flex-1 focus:outline-none focus:border-[#C8102E]"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateCategory(cat.id)}
                          className="h-8 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCatId(null)}
                          className="h-8 px-3 bg-white/5 hover:bg-white/10 text-[#8A94A8] text-xs font-semibold rounded-lg"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <span className="font-serif text-base text-[#DDE2F6]">{cat.name}</span>
                    )}
                  </div>

                  {!isEditing && (
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCatId(cat.id)
                          setEditingCatName(cat.name)
                        }}
                        className="text-xs font-semibold text-[#ADC6FF] hover:text-white transition"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        className="text-xs font-semibold text-[#FFB3B1] hover:text-white transition"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                {/* SubCategories Dropdown / Accordion */}
                {isExpanded && (
                  <div className="p-5 bg-[#080E1C]/90 space-y-3">
                    <div className="text-[10px] font-semibold text-[#8A94A8] tracking-[0.14em] uppercase">
                      Sub-Categories
                    </div>

                    {/* Subcategories list */}
                    {subCats.length === 0 ? (
                      <div className="text-xs text-[#8A94A8]/60 italic py-1">
                        No sub-categories assigned to this wing.
                      </div>
                    ) : (
                      <div className="divide-y divide-white/5">
                        {(Array.isArray(subCats) ? subCats : []).map((sub) => {
                          const isEditingSub = editingSubCatId === sub.id

                          return (
                            <div key={sub.id} className="py-2.5 flex items-center justify-between">
                              {isEditingSub ? (
                                <div className="flex items-center gap-2 flex-1 max-w-xs">
                                  <input
                                    type="text"
                                    value={editingSubCatName}
                                    onChange={(e) => setEditingSubCatName(e.target.value)}
                                    className="h-8 border border-white/10 bg-[#0D1321] rounded px-2.5 text-xs text-[#DDE2F6] flex-1 focus:outline-none focus:border-[#C8102E]"
                                    autoFocus
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateSubCategory(sub.id, cat.id)}
                                    className="h-8 px-2.5 bg-emerald-600 text-white text-xs rounded font-semibold"
                                  >
                                    Save
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingSubCatId(null)}
                                    className="h-8 px-2.5 bg-white/5 text-[#8A94A8] text-xs rounded"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <span className="text-xs font-medium text-[#DDE2F6]">{sub.name}</span>
                              )}

                              {!isEditingSub && (
                                <div className="flex items-center gap-3">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingSubCatId(sub.id)
                                      setEditingSubCatName(sub.name)
                                    }}
                                    className="text-xs text-[#ADC6FF] hover:text-white"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDeleteSubCategory(sub.id, cat.id, sub.name)
                                    }
                                    className="text-xs text-[#FFB3B1] hover:text-white"
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Inline Add SubCategory */}
                    <div className="pt-2 flex gap-2">
                      <input
                        type="text"
                        placeholder="New Sub-Category Name"
                        value={newSubCatNames[cat.id] || ''}
                        onChange={(e) =>
                          setNewSubCatNames((prev) => ({ ...prev, [cat.id]: e.target.value }))
                        }
                        className="flex-1 max-w-sm h-9 border border-white/10 bg-[#0D1321] rounded-full px-4 text-xs text-[#DDE2F6] placeholder-[#8A94A8]/40 focus:outline-none focus:border-[#C8102E]"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddSubCategory(cat.id)}
                        disabled={!newSubCatNames[cat.id]?.trim()}
                        className="h-9 px-4 bg-[#161B2A] hover:bg-[#242A39] border border-white/10 text-white rounded-full text-xs font-medium disabled:opacity-40 transition-colors"
                      >
                        + Add Sub-Category
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
