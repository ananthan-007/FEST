import jwt from 'jsonwebtoken'
import { createAdminClient } from '@/lib/supabase/admin'

const QR_SECRET = process.env.QR_JWT_SECRET || 'ncc-fest-secret-jwt-key-2024-kerala'

export function generateQRToken(userId: string): string {
  return jwt.sign({ userId }, QR_SECRET, { algorithm: 'HS256' })
}

export function verifyQRToken(token: string): { userId: string } {
  return jwt.verify(token, QR_SECRET) as { userId: string }
}

export async function ensureQRToken(userId: string): Promise<string> {
  const supabase = createAdminClient()
  const { data: profile } = await supabase.from('profiles').select('qr_token').eq('id', userId).single()
  if (profile?.qr_token) return profile.qr_token

  const token = generateQRToken(userId)
  await supabase.from('profiles').update({ qr_token: token }).eq('id', userId)
  return token
}
