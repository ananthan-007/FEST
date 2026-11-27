import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env')
  if (!fs.existsSync(envPath)) return
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const val = trimmed.slice(eqIdx + 1).trim()
    if (!process.env[key]) process.env[key] = val
  }
}

async function main() {
  loadEnv()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env')
  }

  const dataPath = path.resolve(process.cwd(), 'src', 'data', 'kerala-institutions.json')
  const { groups } = JSON.parse(fs.readFileSync(dataPath, 'utf8'))

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  let groupCount = 0
  let battalionCount = 0
  let institutionCount = 0

  for (let gi = 0; gi < groups.length; gi++) {
    const group = groups[gi]
    const { data: groupRow, error: groupErr } = await supabase
      .from('ncc_groups')
      .upsert({ name: group.name, display_order: gi + 1 }, { onConflict: 'name' })
      .select('id, name')
      .single()

    if (groupErr || !groupRow) {
      throw new Error(`Failed upserting group ${group.name}: ${groupErr?.message}`)
    }
    groupCount++

    for (let bi = 0; bi < group.battalions.length; bi++) {
      const bn = group.battalions[bi]
      const { data: bnRow, error: bnErr } = await supabase
        .from('battalions')
        .upsert(
          { group_id: groupRow.id, name: bn.name, display_order: bi + 1 },
          { onConflict: 'group_id,name' }
        )
        .select('id, name')
        .single()

      if (bnErr || !bnRow) {
        throw new Error(`Failed upserting battalion ${bn.name}: ${bnErr?.message}`)
      }
      battalionCount++

      const instPayloads = bn.institutions.map((instName, ii) => ({
        battalion_id: bnRow.id,
        name: instName,
        display_order: ii + 1,
      }))

      // Upsert in chunks of 100
      for (let start = 0; start < instPayloads.length; start += 100) {
        const chunk = instPayloads.slice(start, start + 100)
        const { error: instErr } = await supabase
          .from('institutions')
          .upsert(chunk, { onConflict: 'battalion_id,name' })
        if (instErr) {
          throw new Error(`Failed upserting institutions for ${bn.name}: ${instErr.message}`)
        }
      }
      institutionCount += instPayloads.length
    }
  }

  console.log(
    `Seeded successfully: ${groupCount} groups, ${battalionCount} battalions, ${institutionCount} institutions.`
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
