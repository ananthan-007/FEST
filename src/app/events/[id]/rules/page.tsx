import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EventRulesPage({ params }: PageProps) {
  const { id } = await params

  const adminClient = createAdminClient()
  const { data: event } = await adminClient
    .from('events')
    .select('id, title, rules_content, description')
    .eq('id', id)
    .single()

  if (!event) notFound()

  return (
    <div className="min-h-screen bg-[#050A18] text-[#DDE2F6] pb-24">
      {/* Top Bar */}
      <header className="h-16 px-4 sm:px-8 border-b border-white/5 flex items-center justify-between bg-[#050A18]/80 backdrop-blur-xl sticky top-0 z-40">
        <Link
          href={`/events/${event.id}`}
          className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#8A94A8] hover:text-[#DDE2F6] transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Event Brief
        </Link>
        <span className="h-6 px-3 inline-flex items-center bg-[#C8102E]/15 border border-[#C8102E]/30 rounded-full text-[9px] font-semibold tracking-wider uppercase text-[#FFB3B1]">
          Standing Orders
        </span>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <div>
          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#C8102E] block mb-1">
            Rules &amp; Regulations
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#DDE2F6] leading-tight">
            {event.title}
          </h1>
        </div>

        <div className="border-t border-white/10" />

        <div className="bg-[#0D1321]/75 backdrop-blur-xl border border-white/8 rounded-2xl p-6 sm:p-8 shadow-2xl">
          {event.rules_content || event.description ? (
            <div className="text-[#DDE2F6] text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-sans">
              {event.rules_content || event.description}
            </div>
          ) : (
            <div className="py-8 text-center text-[#8A94A8]">
              <span className="material-symbols-outlined text-4xl block mb-2 opacity-30">description</span>
              <p className="text-sm">No official rules published for this event yet.</p>
            </div>
          )}
        </div>

        <div className="pt-4 flex justify-between items-center">
          <Link
            href={`/events/${event.id}`}
            className="h-11 px-6 inline-flex items-center gap-2 bg-[#161B2A] border border-white/8 hover:border-[#C8102E]/30 rounded-full text-xs font-semibold uppercase tracking-wider text-[#DDE2F6] transition"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Return to Brief
          </Link>
          <Link
            href={`/register/${event.id}`}
            className="h-11 px-8 inline-flex items-center gap-2 bg-[#C8102E] hover:bg-[#A00B22] text-white rounded-full text-xs font-semibold uppercase tracking-wider shadow-[0_0_20px_rgba(200,16,46,0.35)] transition"
          >
            Register Now
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
