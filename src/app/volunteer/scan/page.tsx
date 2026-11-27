'use client'

import { useState, useEffect } from 'react'
import ParticipantDetailView, {
  ParticipantProfile,
  ParticipantRegistration,
} from '@/components/ParticipantDetailView'

interface ResolvedData {
  profile: ParticipantProfile
  registrations: ParticipantRegistration[]
}

export default function VolunteerScanPage() {
  const [participant, setParticipant] = useState<ResolvedData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(true)

  useEffect(() => {
    if (!isScanning || participant) return

    let isMounted = true
    let scannerInstance: any = null

    import('html5-qrcode')
      .then(({ Html5QrcodeScanner }) => {
        if (!isMounted) return

        const qrContainer = document.getElementById('qr-reader')
        if (!qrContainer) return

        scannerInstance = new Html5QrcodeScanner(
          'qr-reader',
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          false
        )

        scannerInstance.render(
          async (decodedText: string) => {
            if (!isMounted) return
            try {
              await scannerInstance.clear()
            } catch (err) {
              console.warn('Error clearing scanner:', err)
            }

            setLoading(true)
            setError(null)
            try {
              const res = await fetch(`/api/qr/resolve?token=${encodeURIComponent(decodedText.trim())}`)
              const data = await res.json()
              if (!res.ok) {
                setError(data.error || 'Failed to resolve QR token')
                setIsScanning(false)
              } else {
                setParticipant(data)
                setIsScanning(false)
              }
            } catch (fetchErr: any) {
              setError(fetchErr.message || 'Network error while resolving QR code')
              setIsScanning(false)
            } finally {
              setLoading(false)
            }
          },
          (_scanError: any) => {
            // Frame error; regular non-detection, suppress
          }
        )
      })
      .catch((importErr) => {
        console.error('Failed to load html5-qrcode library', importErr)
        setError('Failed to initialize camera scanner')
      })

    return () => {
      isMounted = false
      if (scannerInstance) {
        try {
          scannerInstance.clear().catch(() => {})
        } catch (e) {}
      }
    }
  }, [isScanning, participant])

  const handleScanAnother = () => {
    setParticipant(null)
    setError(null)
    setIsScanning(true)
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#050505] text-[#F5EFE6]">
      <div className="pt-6 max-w-lg mx-auto px-4 pb-12">
        <div className="flex items-center justify-between mb-4 bg-[#0D0C0A]/80 border border-[#3A291B]/90 rounded-2xl px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-[#F5EFE6] tracking-wide">Gate Scanner</p>
            <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#A89F91]">Sentry Checkpoint</p>
          </div>
          <div className="flex items-center gap-1.5 h-7 px-3 bg-emerald-500/15 border border-emerald-500/25 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>
            <span className="text-[9px] font-semibold tracking-wider uppercase text-emerald-400">Active</span>
          </div>
        </div>
        {/* Loading */}
        {loading && (
          <div className="py-20 flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-2 border-[#CC892F] border-t-transparent animate-spin"/>
            <p className="text-sm text-[#A89F91] tracking-widest uppercase">Verifying Identity…</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="mt-6 bg-[#CC892F]/10 border border-[#CC892F]/25 rounded-2xl p-6 text-center">
            <span className="material-symbols-outlined text-4xl text-[#CC892F] block mb-3">gpp_bad</span>
            <p className="font-semibold text-[#F4DD9F] mb-1">Verification Failed</p>
            <p className="text-sm text-[#A89F91] mb-5">{error}</p>
            <button
              onClick={handleScanAnother}
              className="h-10 px-6 gold-gradient-button text-sm font-semibold rounded-full shadow-[0_0_16px_rgba(204,137,47,0.4)] hover:brightness-110 transition"
            >
              Scan Again
            </button>
          </div>
        )}

        {/* Scanner Viewfinder */}
        {!participant && !loading && !error && (
          <div className="mt-6">
            {/* Tactical label */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#CC892F] text-[20px]">qr_code_scanner</span>
                <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#A89F91]">Gate Alpha · Sentry Checkpoint</span>
              </div>
            </div>

            {/* Viewfinder */}
            <div className="relative bg-[#0A0908] rounded-2xl overflow-hidden border border-[#3A291B]/80 aspect-square max-w-sm mx-auto p-4 flex flex-col items-center justify-center">
              {/* Corner brackets */}
              <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-[#CC892F] rounded-tl-sm z-10 shadow-[0_0_10px_#CC892F] pointer-events-none"/>
              <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-[#CC892F] rounded-tr-sm z-10 shadow-[0_0_10px_#CC892F] pointer-events-none"/>
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-[#CC892F] rounded-bl-sm z-10 shadow-[0_0_10px_#CC892F] pointer-events-none"/>
              <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-[#CC892F] rounded-br-sm z-10 shadow-[0_0_10px_#CC892F] pointer-events-none"/>
              {/* Scan laser line */}
              <div className="absolute inset-x-0 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-[#CC892F] to-transparent animate-pulse z-10 shadow-[0_0_8px_#CC892F] pointer-events-none"/>
              {/* QR reader container */}
              <div id="qr-reader" className="w-full h-full text-slate-800"/>
            </div>

            <p className="text-center text-xs text-[#A89F91] mt-4">
              Position cadet&apos;s QR pass in the viewfinder to verify
            </p>
          </div>
        )}

        {/* Result */}
        {participant && !loading && (
          <div className="mt-6 space-y-4">
            <ParticipantDetailView
              profile={participant.profile}
              registrations={participant.registrations}
            />
            <div className="pt-2">
              <button
                onClick={handleScanAnother}
                className="w-full h-12 flex items-center justify-center gap-2 gold-gradient-button font-semibold rounded-full shadow-[0_0_20px_rgba(204,137,47,0.4)] transition"
              >
                <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
                Scan Next Cadet
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
