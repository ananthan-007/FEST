import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkAdmin } from '@/lib/auth/checkRole'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const user = await checkAdmin()
    if (!user) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Limit to 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Poster size must not exceed 10MB' }, { status: 413 })
    }

    const ext = file.name.split('.').pop() || 'jpg'
    const fileName = `events/${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const adminClient = createAdminClient()
    const { error: uploadError } = await adminClient.storage
      .from('posters')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      console.error('[POST /api/admin/upload-poster] Storage error:', uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: { publicUrl } } = adminClient.storage
      .from('posters')
      .getPublicUrl(fileName)

    return NextResponse.json({ url: publicUrl })
  } catch (err: any) {
    console.error('[POST /api/admin/upload-poster] Exception:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
