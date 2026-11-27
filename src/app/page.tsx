'use client'

import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, CalendarDays, ChevronDown } from 'lucide-react'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import DhruvaLogo from '@/components/DhruvaLogo'
import { ShinyText, StarBorder, ClickSpark } from '@/components/reactbits'
import { Button } from '@/components/ui/button'

const CountdownTimer = dynamic(() => import('@/components/CountdownTimer'), { ssr: false })
const GallerySection = dynamic(() => import('@/components/home/GallerySection'), { ssr: false })
const ContactSection = dynamic(() => import('@/components/home/ContactSection'), { ssr: false })

export default function HomePage() {
  return (
    <ClickSpark sparkColor="#F4DD9F" sparkCount={10} sparkRadius={24}>
      <div className="min-h-screen bg-[#050505] text-[#F5EFE6]">
        <SiteHeader />

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-24 pb-16 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-4 z-10"
          >
            <div className="relative flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 48, repeat: Infinity, ease: 'linear' }}
                className="absolute w-44 h-44 sm:w-52 sm:h-52 rounded-3xl border border-[#CC892F]/25 rotate-45 pointer-events-none"
              />
              <DhruvaLogo size="xl" priority />
            </div>

            <div className="text-center">
              <h1 className="font-serif text-5xl sm:text-7xl md:text-8xl font-black tracking-[0.2em] gold-gradient-text leading-none">
                DHRUVA
              </h1>
              <div className="flex items-center justify-center gap-3 mt-3">
                <span className="h-px w-10 bg-gradient-to-r from-transparent to-[#CC892F]" />
                <span className="text-[11px] font-semibold tracking-[0.3em] uppercase text-[#E3B464]">
                  <ShinyText text="Kerala NCC Conclave" speed={5} />
                </span>
                <span className="h-px w-10 bg-gradient-to-l from-transparent to-[#CC892F]" />
              </div>
            </div>
          </motion.div>

          {/* Countdown */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-10 z-10 flex flex-col items-center gap-3"
          >
            <span className="text-[9px] font-semibold tracking-[0.26em] uppercase text-[#A89F91]">
              January 9, 2027
            </span>
            <CountdownTimer />
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.42 }}
            className="mt-10 flex items-center gap-4 z-10 flex-wrap justify-center"
          >
            <Link href="/events">
              <Button size="lg" variant="gold" className="px-8">
                <CalendarDays className="w-4 h-4" />
                Events
              </Button>
            </Link>
            <StarBorder as={Link} href="/auth/register" color="#E3B464" speed="4.5s" className="h-12">
              <span className="px-7 py-3 text-xs font-bold tracking-wider uppercase text-[#F4DD9F] flex items-center gap-2">
                Register
                <ArrowRight className="w-4 h-4 text-[#CC892F]" />
              </span>
            </StarBorder>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.85 }}
            className="absolute bottom-7 flex flex-col items-center gap-1.5 z-10"
          >
            <motion.div
              animate={{ y: [0, 7, 0] }}
              transition={{ repeat: Infinity, duration: 1.6 }}
            >
              <ChevronDown className="w-4 h-4 text-[#E3B464]" />
            </motion.div>
          </motion.div>
        </section>

        <GallerySection />
        <ContactSection />
        <SiteFooter />
      </div>
    </ClickSpark>
  )
}
