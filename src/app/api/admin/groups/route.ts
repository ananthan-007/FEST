import { NextRequest, NextResponse } from 'next/server'
import { checkAdmin } from '@/lib/auth/checkRole'
import { getGroups, createGroup } from '@/lib/db/institution'

export async function GET() {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const groups = await getGroups()
  return NextResponse.json(groups ?? [], {
    headers: { 'Cache-Control': 'private, max-age=60, stale-while-revalidate=120' },
  })
}

export async function POST(request: NextRequest) {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { name } = await request.json()
  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  const group = await createGroup(name)
  return NextResponse.json(group, { status: 201 })
}
