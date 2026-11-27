import { createAdminClient } from '@/lib/supabase/admin'

export async function getGroups() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('ncc_groups')
    .select('*')
    .order('display_order', { ascending: true })
    .order('name', { ascending: true })
  if (error) throw error
  return data || []
}

export async function createGroup(name: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('ncc_groups').insert({ name }).select().single()
  if (error) throw error
  return data
}

export async function updateGroup(id: string, name: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('ncc_groups').update({ name }).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteGroup(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('ncc_groups').delete().eq('id', id)
  if (error) throw error
  return true
}

export async function getBattalions(groupId?: string) {
  const supabase = createAdminClient()
  let query = supabase.from('battalions').select('*').order('name', { ascending: true })
  if (groupId) query = query.eq('group_id', groupId)
  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function createBattalion(name: string, groupId: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('battalions').insert({ name, group_id: groupId }).select().single()
  if (error) throw error
  return data
}

export async function updateBattalion(id: string, name: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('battalions').update({ name }).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteBattalion(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('battalions').delete().eq('id', id)
  if (error) throw error
  return true
}

export async function getInstitutions(battalionId?: string) {
  const supabase = createAdminClient()
  let query = supabase.from('institutions').select('*').order('name', { ascending: true })
  if (battalionId) query = query.eq('battalion_id', battalionId)
  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function createInstitution(name: string, battalionId: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('institutions').insert({ name, battalion_id: battalionId }).select().single()
  if (error) throw error
  return data
}

export async function updateInstitution(id: string, name: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('institutions').update({ name }).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteInstitution(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('institutions').delete().eq('id', id)
  if (error) throw error
  return true
}

export async function searchInstitutions(query: string, limit = 25) {
  const trimmed = query.trim()
  if (!trimmed) return []
  const escaped = trimmed.replace(/[%_\\]/g, '\\$&')
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('institutions')
    .select(`
      id,
      name,
      battalion_id,
      battalions (
        id,
        name,
        group_id,
        ncc_groups (
          id,
          name
        )
      )
    `)
    .ilike('name', `%${escaped}%`)
    .order('name', { ascending: true })
    .limit(limit)

  if (error) throw error
  return data || []
}
