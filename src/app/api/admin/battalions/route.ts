import { NextRequest, NextResponse } from 'next/server'
import { checkAdmin } from '@/lib/auth/checkRole'
import { getBattalions, createBattalion } from '@/lib/db/institution'

export async function GET(request: NextRequest) {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const groupId = request.nextUrl.searchParams.get('groupId') ?? undefined
  const battalions = await getBattalions(groupId)
  return NextResponse.json(battalions ?? [], {
    headers: { 'Cache-Control': 'private, max-age=60, stale-while-revalidate=120' },
  })
}

export async function POST(request: NextRequest) {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { name, groupId } = await request.json()
  if (!name || !groupId) return NextResponse.json({ error: 'name and groupId are required' }, { status: 400 })
  const battalion = await createBattalion(name, groupId)
  return NextResponse.json(battalion, { status: 201 })
}
