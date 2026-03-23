'use client'

import { motion } from 'framer-motion'

interface StatsProps {
  companies: number
  reviews: number
  salaries: number
  benefits: number
}

function formatNumber(n: number): string {
  if (n >= 1000) {
    const k = Math.floor(n / 1000)
    return `${k.toLocaleString('es-PE')},${String(Math.floor((n % 1000) / 100))}K`
  }
  return n.toLocaleString('es-PE')
}

const stats = [
  { key: 'companies' as const, label: 'Empresas' },
  { key: 'salaries' as const, label: 'Salarios' },
  { key: 'reviews' as const, label: 'Resenas' },
  { key: 'benefits' as const, label: 'Beneficios' },
]

export function PlatformStats({ companies, reviews, salaries, benefits }: StatsProps) {
  const values = { companies, reviews, salaries, benefits }

  return (
    <section className="relative py-10 md:py-12">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative overflow-hidden rounded-2xl border border-neutral-200/80 bg-gradient-to-br from-white via-neutral-50/80 to-stone-50 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
        >
          {/* Subtle top shine */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neutral-300/50 to-transparent" />

          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-neutral-200/60">
            {stats.map(({ key, label }, i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group relative px-6 py-6 text-center"
              >
                {/* Number — large, bold, monochromatic */}
                <p className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 tabular-nums">
                  {values[key] > 0 ? formatNumber(values[key]) : '--'}
                </p>

                {/* Label */}
                <p className="mt-1 text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  {label}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Bottom shine */}
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-neutral-200/40 to-transparent" />
        </motion.div>
      </div>
    </section>
  )
}
