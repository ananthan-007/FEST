'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'

// Loaded client-only to avoid SSR/hydration mismatch on the live timer
const CountdownTimer = dynamic(() => import('@/components/CountdownTimer'), { ssr: false })

// ── Gallery placeholder images ───────────────────────────────────────────────
const GALLERY_ITEMS = [
  { gradient: 'from-[#C8102E]/20 to-[#161B2A]', label: 'March Past' },
  { gradient: 'from-blue-900/40 to-[#0D1321]', label: 'Cultural Parade' },
  { gradient: 'from-purple-900/40 to-[#161B2A]', label: 'Drill Display' },
  { gradient: 'from-emerald-900/40 to-[#0D1321]', label: 'Adventure Events' },
  { gradient: 'from-amber-900/40 to-[#161B2A]', label: 'Shooting Range' },
  { gradient: 'from-pink-900/40 to-[#0D1321]', label: 'Band Performance' },
  { gradient: 'from-cyan-900/40 to-[#161B2A]', label: 'Obstacle Course' },
  { gradient: 'from-[#C8102E]/30 to-[#0D1321]', label: 'Award Ceremony' },
]

function GallerySection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  // Duplicate items for seamless infinite loop
  const items = [...GALLERY_ITEMS, ...GALLERY_ITEMS]

  return (
    <section ref={ref} className="py-20 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="text-center mb-10 px-4"
      >
        <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#C8102E]">Gallery</span>
        <h2 className="font-serif text-3xl sm:text-4xl text-[#DDE2F6] mt-2">Moments from the Field</h2>
        <p className="text-[#8A94A8] text-sm mt-2 max-w-md mx-auto">
          Discipline, valor, and camaraderie captured across FEST editions
        </p>
      </motion.div>

      {/* Marquee wrapper — hides overflow, pauses on hover */}
      <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="marquee-track">
          {items.map((item, i) => (
            <div
              key={i}
              className={`flex-none w-72 aspect-video bg-gradient-to-br ${item.gradient} rounded-2xl border border-white/8 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#C8102E]/40 transition-colors`}
            >
              <span className="material-symbols-outlined text-5xl text-white/20">photo_camera</span>
              <span className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[#8A94A8]">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Contact Section ──────────────────────────────────────────────────────────
function ContactSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section ref={ref} id="contact" className="py-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto"
      >
        <div className="text-center mb-10">
          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#C8102E]">Headquarters</span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#DDE2F6] mt-2">Contact Us</h2>
        </div>

        <div className="bg-[#0D1321]/80 backdrop-blur-xl border border-white/8 rounded-2xl p-6 sm:p-8 space-y-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#C8102E]/15 border border-[#C8102E]/30 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[#C8102E] text-[20px]">location_on</span>
            </div>
            <div>
              <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#8A94A8] mb-1">Address</p>
              <p className="text-sm text-[#DDE2F6] leading-relaxed">
                NCC Kerala Directorate<br />
                Palayam, Thiruvananthapuram<br />
                Kerala — 695 033
              </p>
            </div>
          </div>

          <div className="h-px bg-white/5" />

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#C8102E]/15 border border-[#C8102E]/30 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[#C8102E] text-[20px]">mail</span>
            </div>
            <div>
              <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#8A94A8] mb-1">Email</p>
              <a href="mailto:fest@ncckerala.org" className="text-sm text-[#DDE2F6] hover:text-[#C8102E] transition">
                fest@ncckerala.org
              </a>
            </div>
          </div>

          <div className="h-px bg-white/5" />

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#C8102E]/15 border border-[#C8102E]/30 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[#C8102E] text-[20px]">phone</span>
            </div>
            <div>
              <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#8A94A8] mb-1">Phone</p>
              <a href="tel:+914712302540" className="text-sm text-[#DDE2F6] hover:text-[#C8102E] transition">
                +91 471 230 2540
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#050A18] text-[#DDE2F6]">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
      />
      <SiteHeader />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-24 pb-16 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#C8102E]/8 blur-[120px]" />
        </div>

        {/* FEST logo + title */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="flex flex-col items-center gap-4 z-10"
        >
          {/* Shield SVG */}
          <svg width="90" height="100" viewBox="0 0 40 46" fill="none" className="drop-shadow-[0_0_30px_rgba(200,16,46,0.5)]">
            <path d="M20 2L4 8v12c0 11 7 20.5 16 23.5C29 40.5 36 31 36 20V8L20 2z" fill="#C8102E" opacity="0.15" stroke="#C8102E" strokeWidth="1.5"/>
            <path d="M20 8l-9 3.5v8c0 6.5 4 12 9 14 5-2 9-7.5 9-14v-8L20 8z" fill="#C8102E" opacity="0.4"/>
            <path d="M15 20l3.5 3.5L26 16" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>

          {/* FEST wordmark */}
          <div className="text-center">
            <h1 className="font-serif text-6xl sm:text-7xl md:text-8xl font-black tracking-[0.12em] text-white leading-none">
              FEST
            </h1>
            <div className="flex items-center justify-center gap-3 mt-2">
              <span className="h-px w-10 bg-[#C8102E]" />
              <span className="text-[11px] font-semibold tracking-[0.3em] uppercase text-[#C8102E]">11.0</span>
              <span className="h-px w-10 bg-[#C8102E]" />
            </div>
            <p className="mt-2 text-sm tracking-[0.25em] uppercase text-[#8A94A8]">Kerala NCC Conclave</p>
          </div>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-6 text-base sm:text-lg text-[#8A94A8] text-center max-w-sm z-10"
        >
          Where discipline meets excellence — the premier NCC inter-directorate conclave
        </motion.p>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-10 z-10 flex flex-col items-center gap-3"
        >
          <span className="text-[9px] font-semibold tracking-[0.25em] uppercase text-[#8A94A8]">
            Commencing — January 9, 2027
          </span>
          <CountdownTimer />
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-10 flex items-center gap-4 z-10 flex-wrap justify-center"
        >
          <Link
            href="/events"
            className="h-12 px-7 rounded-full bg-[#C8102E] hover:bg-[#A00B22] text-white text-sm font-bold tracking-wider uppercase flex items-center gap-2 transition shadow-[0_0_30px_rgba(200,16,46,0.4)]"
          >
            <span className="material-symbols-outlined text-[18px]">event</span>
            View Events
          </Link>
          <Link
            href="/auth/register"
            className="h-12 px-7 rounded-full border border-white/15 text-[#DDE2F6] text-sm font-bold tracking-wider uppercase flex items-center gap-2 hover:border-white/30 transition"
          >
            Register Now
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 flex flex-col items-center gap-2 z-10"
        >
          <span className="text-[9px] tracking-[0.2em] uppercase text-[#8A94A8]">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <span className="material-symbols-outlined text-[#8A94A8] text-[18px]">keyboard_arrow_down</span>
          </motion.div>
        </motion.div>
      </section>

      {/* ── GALLERY ──────────────────────────────────────────────────────── */}
      <GallerySection />

      {/* ── CONTACT ──────────────────────────────────────────────────────── */}
      <ContactSection />

      <SiteFooter />
    </div>
  )
}
