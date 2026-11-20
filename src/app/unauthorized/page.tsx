import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050A18] text-[#DDE2F6] px-4">
      <div className="max-w-md w-full bg-[#0D1321]/80 backdrop-blur-xl border border-[#C8102E]/30 rounded-2xl shadow-2xl p-8 text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-[#C8102E]/15 border border-[#C8102E]/30 text-[#C8102E] flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-3xl">gpp_bad</span>
        </div>
        <div>
          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#C8102E] block mb-1">
            Security Checkpoint
          </span>
          <h1 className="text-2xl font-serif text-[#DDE2F6]">Access Restricted</h1>
          <p className="text-xs text-[#8A94A8] mt-2 leading-relaxed">
            Your credentials do not possess the required clearance level to access this tactical
            sector.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 h-11 px-8 bg-[#C8102E] hover:bg-[#A00B22] text-white rounded-full text-xs font-semibold uppercase tracking-wider shadow-[0_0_20px_rgba(200,16,46,0.35)] transition"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Return to Perimeter
          </Link>
        </div>
      </div>
    </div>
  )
}
