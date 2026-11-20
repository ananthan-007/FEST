import { NextRequest, NextResponse } from 'next/server'
import { getGroups, getBattalions, getInstitutions } from '@/lib/db/institution'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const groups = searchParams.get('groups')
  const groupId = searchParams.get('groupId')
  const battalionId = searchParams.get('battalionId')

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

  return NextResponse.json({ error: 'Provide groups=true, groupId, or battalionId' }, { status: 400 })
}
