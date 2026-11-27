import Link from 'next/link'
import { ArrowLeft, ShieldAlert } from 'lucide-react'
import { SpotlightCard } from '@/components/reactbits'
import { Button } from '@/components/ui/button'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] text-[#F5EFE6] px-4">
      <SpotlightCard className="max-w-md w-full p-8 text-center space-y-5 border-[#CC892F]/45">
        <div className="w-16 h-16 rounded-full bg-[#CC892F]/15 border border-[#CC892F]/40 text-[#E3B464] flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div>
          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#CC892F] block mb-1">
            Security Checkpoint
          </span>
          <h1 className="text-2xl font-serif text-[#F4DD9F]">Access Restricted</h1>
          <p className="text-xs text-[#A89F91] mt-2 leading-relaxed">
            Your credentials do not possess the required clearance level to access this tactical
            sector.
          </p>
        </div>
        <div className="pt-2">
          <Link href="/">
            <Button>
              <ArrowLeft className="w-4 h-4" />
              Return to Perimeter
            </Button>
          </Link>
        </div>
      </SpotlightCard>
    </div>
  )
}
