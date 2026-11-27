'use client'

import { Camera } from 'lucide-react'
import { ScrollReveal } from '@/components/motion/ScrollReveal'

const GALLERY_ITEMS = [
  { gradient: 'from-[#382313]/60 to-[#0D0C0A]', label: 'March Past' },
  { gradient: 'from-[#242321]/80 to-[#0D0C0A]', label: 'Cultural Parade' },
  { gradient: 'from-[#64401F]/45 to-[#0D0C0A]', label: 'Drill Display' },
  { gradient: 'from-[#3A291B]/70 to-[#0D0C0A]', label: 'Adventure Events' },
  { gradient: 'from-[#81501F]/40 to-[#0D0C0A]', label: 'Shooting Range' },
  { gradient: 'from-[#242321]/80 to-[#0D0C0A]', label: 'Band Performance' },
  { gradient: 'from-[#4B2D16]/60 to-[#0D0C0A]', label: 'Obstacle Course' },
  { gradient: 'from-[#CC892F]/25 to-[#0D0C0A]', label: 'Award Ceremony' },
]

export default function GallerySection() {
  const items = [...GALLERY_ITEMS, ...GALLERY_ITEMS]

  return (
    <section className="py-16 overflow-hidden">
      <ScrollReveal className="text-center mb-8 px-4">
        <span className="text-[10px] font-semibold tracking-[0.24em] uppercase text-[#CC892F]">
          Gallery
        </span>
        <h2 className="font-serif text-3xl text-[#F4DD9F] mt-1.5">
          Moments
        </h2>
      </ScrollReveal>

      <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="marquee-track">
          {items.map((item, i) => (
            <div
              key={i}
              className={`flex-none w-72 aspect-video bg-gradient-to-br ${item.gradient} rounded-2xl border border-[#3A291B]/90 flex flex-col items-center justify-center gap-2.5 cursor-pointer hover:border-[#E3B464]/60 transition-colors shadow-[0_12px_30px_rgba(0,0,0,0.65)]`}
            >
              <Camera className="w-9 h-9 text-[#E3B464]/45" />
              <span className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#F4DD9F]/85">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
