'use client'

import { motion } from 'framer-motion'

// Empresas más grandes de Perú
const logos = [
  { name: 'BCP', letter: 'BCP' },
  { name: 'Interbank', letter: 'IB' },
  { name: 'BBVA', letter: 'BB' },
  { name: 'Alicorp', letter: 'AL' },
  { name: 'Backus', letter: 'BK' },
  { name: 'Belcorp', letter: 'BC' },
  { name: 'Rímac', letter: 'RM' },
  { name: 'Pacífico', letter: 'PC' },
  { name: 'Gloria', letter: 'GL' },
  { name: 'Telefónica', letter: 'TF' },
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

        {/* Scrolling logos */}
        <div className="flex animate-marquee">
          {[...logos, ...logos].map((logo, i) => (
            <div
              key={i}
              className="flex items-center justify-center mx-12 shrink-0"
            >
              <div className="flex items-center gap-3 text-neutral-400 hover:text-neutral-600 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center">
                  <span className="font-bold text-sm">{logo.letter}</span>
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
