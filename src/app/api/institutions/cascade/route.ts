import { NextRequest, NextResponse } from 'next/server'
import { getGroups, getBattalions, getInstitutions, searchInstitutions } from '@/lib/db/institution'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const groups = searchParams.get('groups')
  const groupId = searchParams.get('groupId')
  const battalionId = searchParams.get('battalionId')
  const search = searchParams.get('search')

  // Public: search institutions across Kerala by name
  if (search !== null) {
    if (search.trim().length < 2) {
      return NextResponse.json([])
    }
    try {
      const results = await searchInstitutions(search)
      return NextResponse.json(results)
    } catch (err) {
      console.error('[cascade search]', err)
      return NextResponse.json([], { status: 200 })
    }
  }

  // Public: list all NCC groups (used in profile page by any authenticated user)
  if (groups === 'true') {
    try {
      const data = await getGroups()
      return NextResponse.json(data)
    } catch (err) {
      console.error('[cascade groups]', err)
      return NextResponse.json([], { status: 200 })
    }
  }

  if (groupId) {
    const battalions = await getBattalions(groupId)
    return NextResponse.json(battalions)
  }

  if (battalionId) {
    const institutions = await getInstitutions(battalionId)
    return NextResponse.json(institutions)
  }

  return NextResponse.json({ error: 'Provide groups=true, groupId, battalionId, or search' }, { status: 400 })
}
