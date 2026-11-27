'use client'

import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import DhruvaLogo from '@/components/DhruvaLogo'

export default function DhruvaSplashLoader() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const seen = sessionStorage.getItem('dhruva_splash_seen')
      if (seen) return
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
        sessionStorage.setItem('dhruva_splash_seen', '1')
      }, 1550)
      return () => clearTimeout(timer)
    } catch {
      return
    }
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="dhruva-splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050505] px-6 overflow-hidden"
          aria-label="Loading DHRUVA"
        >
          {/* Ambient radial golden aura */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: [0.35, 0.8, 0.5], scale: [0.9, 1.15, 1] }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
            className="absolute w-[340px] h-[340px] rounded-full bg-[radial-gradient(circle,rgba(227,180,100,0.22)_0%,rgba(129,80,31,0.12)_45%,transparent_70%)] blur-2xl pointer-events-none"
          />

          {/* Rotating geometric diamond frame behind logo */}
          <div className="relative flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, rotate: 0, scale: 0.8 }}
              animate={{ opacity: 0.45, rotate: 45, scale: 1.05 }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              className="absolute w-48 h-48 sm:w-56 sm:h-56 border border-[#CC892F]/45 rounded-2xl pointer-events-none"
            />
            <motion.div
              initial={{ opacity: 0, rotate: 45, scale: 1.25 }}
              animate={{ opacity: 0.25, rotate: 135, scale: 1.15 }}
              transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
              className="absolute w-52 h-52 sm:w-60 sm:h-60 border border-[#F4DD9F]/30 rounded-2xl pointer-events-none"
            />

            {/* Logo entrance */}
            <motion.div
              initial={{ opacity: 0, scale: 0.82, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            >
              <DhruvaLogo size="xl" priority showGlow />
            </motion.div>
          </div>

          {/* Subtitle & animated gold progress bar */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="mt-6 flex flex-col items-center gap-3 w-56"
          >
            <p className="text-[10px] font-semibold tracking-[0.34em] uppercase text-[#E3B464]">
              Kerala NCC Conclave
            </p>
            <div className="h-[2px] w-full rounded-full bg-[#242321] overflow-hidden">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '0%' }}
                transition={{ duration: 1.35, ease: [0.22, 1, 0.36, 1] }}
                className="h-full w-full gold-gradient-bg"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
