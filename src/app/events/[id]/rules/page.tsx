import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, FileText } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import Breadcrumbs from '@/components/Breadcrumbs'
import { SpotlightCard } from '@/components/reactbits'
import { ScrollReveal } from '@/components/motion/ScrollReveal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

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
    <div className="min-h-screen flex flex-col bg-[#050505] text-[#F5EFE6]">
      <SiteHeader />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 pt-24 pb-20 space-y-6">
        <Breadcrumbs
          items={[
            { label: 'Events', href: '/events' },
            { label: event.title, href: `/events/${event.id}` },
            { label: 'Rules & Regulations' },
          ]}
        />

        <ScrollReveal className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#CC892F] block mb-1">
              Standing Orders
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl gold-gradient-text leading-tight">
              {event.title}
            </h1>
          </div>
          <Badge variant="gold">Official Rules</Badge>
        </ScrollReveal>

        <div className="border-t border-[#3A291B]/80" />

        <ScrollReveal delay={0.05}>
          <SpotlightCard className="p-6 sm:p-8">
            {event.rules_content || event.description ? (
              <div className="text-[#F5EFE6] text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-sans">
                {event.rules_content || event.description}
              </div>
            ) : (
              <div className="py-8 text-center text-[#A89F91]">
                <FileText className="w-10 h-10 mx-auto mb-2 opacity-30 text-[#E3B464]" />
                <p className="text-sm">No official rules published for this event yet.</p>
              </div>
            )}
          </SpotlightCard>
        </ScrollReveal>

        <div className="pt-2 flex flex-wrap justify-between items-center gap-3">
          <Link href={`/events/${event.id}`}>
            <Button variant="bronze">
              <ArrowLeft className="w-4 h-4" />
              Return to Brief
            </Button>
          </Link>
          <Link href={`/register/${event.id}`}>
            <Button variant="gold">
              Register Now
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
