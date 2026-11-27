'use client'

import { Mail, MapPin, Phone } from 'lucide-react'
import SpotlightCard from '@/components/reactbits/SpotlightCard'
import { ScrollReveal } from '@/components/motion/ScrollReveal'
import { Separator } from '@/components/ui/separator'

export default function ContactSection() {
  return (
    <section id="contact" className="py-16 px-4">
      <ScrollReveal className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <span className="text-[10px] font-semibold tracking-[0.24em] uppercase text-[#CC892F]">
            Headquarters
          </span>
          <h2 className="font-serif text-3xl text-[#F4DD9F] mt-1.5">
            Contact
          </h2>
        </div>

        <SpotlightCard className="p-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-9 h-9 rounded-xl bg-[#CC892F]/15 border border-[#CC892F]/40 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-[#E3B464]" />
            </div>
            <div>
              <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#A89F91] mb-0.5">
                Address
              </p>
              <p className="text-sm text-[#F5EFE6] leading-relaxed">
                NCC Kerala Directorate, Palayam, Thiruvananthapuram — 695 033
              </p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#CC892F]/15 border border-[#CC892F]/40 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-[#E3B464]" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#A89F91]">
                  Email
                </p>
                <a
                  href="mailto:fest@ncckerala.org"
                  className="text-sm text-[#F5EFE6] hover:text-[#F4DD9F] transition truncate block"
                >
                  fest@ncckerala.org
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#CC892F]/15 border border-[#CC892F]/40 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4 text-[#E3B464]" />
              </div>
              <div>
                <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#A89F91]">
                  Phone
                </p>
                <a
                  href="tel:+914712302540"
                  className="text-sm text-[#F5EFE6] hover:text-[#F4DD9F] transition"
                >
                  +91 471 230 2540
                </a>
              </div>
            </div>
          </div>
        </SpotlightCard>
      </ScrollReveal>
    </section>
  )
}
