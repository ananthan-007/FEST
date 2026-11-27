'use client'

import React from 'react'
import { motion } from 'framer-motion'
import DhruvaLogo from '@/components/DhruvaLogo'

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center px-4">
      <div className="relative flex flex-col items-center gap-5">
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <DhruvaLogo size="lg" priority showGlow />
        </motion.div>

        <div className="w-40 h-[2px] rounded-full bg-[#242321] overflow-hidden">
          <motion.div
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            className="h-full w-1/2 gold-gradient-bg"
          />
        </div>

        <span className="text-[10px] font-semibold tracking-[0.28em] uppercase text-[#A89F91]">
          Initializing DHRUVA…
        </span>
      </div>
    </div>
  )
}
