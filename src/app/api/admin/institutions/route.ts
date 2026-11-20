import { NextRequest, NextResponse } from 'next/server'
import { checkAdmin } from '@/lib/auth/checkRole'
import { getInstitutions, createInstitution } from '@/lib/db/institution'

export async function GET(request: NextRequest) {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const battalionId = request.nextUrl.searchParams.get('battalionId') ?? undefined
  const institutions = await getInstitutions(battalionId)
  return NextResponse.json(institutions ?? [], {
    headers: { 'Cache-Control': 'private, max-age=60, stale-while-revalidate=120' },
  })
}

export async function POST(request: NextRequest) {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { name, battalionId } = await request.json()
  if (!name || !battalionId) return NextResponse.json({ error: 'name and battalionId are required' }, { status: 400 })
  const institution = await createInstitution(name, battalionId)
  return NextResponse.json(institution, { status: 201 })
}
