import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('photo') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must not exceed 2MB' }, { status: 413 })
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    const fileExt = file.name.split('.').pop() || 'jpg'
    const fileName = `${user.id}/${Date.now()}.${fileExt}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const adminClient = createAdminClient()
    const { error: uploadError } = await adminClient.storage
      .from('profile-photos')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: { publicUrl } } = adminClient.storage
      .from('profile-photos')
      .getPublicUrl(fileName)

    await adminClient
      .from('profiles')
      .update({ photo_url: publicUrl })
      .eq('id', user.id)

    return NextResponse.json({ url: publicUrl })
  } catch (err: any) {
    console.error('[POST /api/user/profile/photo]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
