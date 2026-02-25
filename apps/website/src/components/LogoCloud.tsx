'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

// Empresas más grandes de Perú — logos reales verificados contra empliq_dev
const logos = [
  { name: 'BCP', src: '/logos/bcp.png' },
  { name: 'Interbank', src: '/logos/interbank.png' },
  { name: 'BBVA', src: '/logos/bbva.png' },
  { name: 'Alicorp', src: '/logos/alicorp.png' },
  { name: 'Backus', src: '/logos/backus.png' },
  { name: 'Falabella', src: '/logos/falabella.png' },
  { name: 'Rímac', src: '/logos/rimac.png' },
  { name: 'Pacífico', src: '/logos/pacifico.png' },
  { name: 'Gloria', src: '/logos/gloria.png' },
  { name: 'Telefónica', src: '/logos/telefonica.png' },
]

export function LogoCloud() {
  return (
    <section className="relative py-16 border-y border-neutral-200 bg-white/80 backdrop-blur-xl">
      {/* Label */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <p className="text-neutral-500 text-sm font-medium tracking-wider uppercase">
          Descubre qué pasa dentro de las{' '}
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-neutral-700 font-semibold"
          >
            empresas más grandes
          </motion.span>
          {' '}del Perú
        </p>
      </motion.div>

      {/* Logo marquee */}
      <div className="relative overflow-hidden">
        {/* Gradient masks */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10" />

        {/* Scrolling logos — tripled for seamless loop */}
        <div className="flex animate-marquee">
          {[...logos, ...logos, ...logos].map((logo, i) => (
            <div
              key={i}
              className="flex items-center justify-center mx-12 shrink-0"
            >
              <div className="flex items-center gap-3 text-neutral-400 hover:text-neutral-600 transition-colors">
                <div className="w-10 h-10 rounded-lg border border-neutral-200/60 bg-white flex items-center justify-center overflow-hidden p-0.5">
                  <Image
                    src={logo.src}
                    alt={logo.name}
                    width={38}
                    height={38}
                    className="object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                  />
                </div>
                <span className="font-medium text-lg">{logo.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
