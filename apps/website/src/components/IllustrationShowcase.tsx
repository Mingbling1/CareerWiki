'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

const illustrations = [
  {
    src: '/illustrations/work/work_education.png',
    alt: 'Equipo trabajando en educación',
    width: 1200,
    height: 1197,
  },
  {
    src: '/illustrations/work/work_teamwork.png',
    alt: 'Colaboración en equipo',
    width: 1138,
    height: 1200,
  },
  {
    src: '/illustrations/work/work_collaboration.png',
    alt: 'Personas colaborando',
    width: 1094,
    height: 641,
  },
  {
    src: '/illustrations/work/work_laptop.png',
    alt: 'Trabajando en laptop',
    width: 626,
    height: 523,
  },
  {
    src: '/illustrations/work/work_presentation.png',
    alt: 'Presentación de datos',
    width: 518,
    height: 574,
  },
  {
    src: '/illustrations/work/work_planning.png',
    alt: 'Planificación',
    width: 497,
    height: 520,
  },
]

const floatVariants = {
  initial: { y: 0 },
  animate: (i: number) => ({
    y: [0, -12, 0],
    transition: {
      duration: 4 + i * 0.5,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  }),
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    },
  },
}

export function IllustrationShowcase() {
  return (
    <section className="relative py-32 overflow-hidden bg-white">
      {/* Subtle grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:80px_80px]" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <p className="text-neutral-400 font-medium mb-4 tracking-wider uppercase text-sm">
            La informaci&oacute;n es poder
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6 leading-tight">
            Tu carrera merece{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-900 via-neutral-600 to-neutral-400">
              datos reales.
            </span>
          </h2>
          <p className="text-xl text-neutral-500 max-w-2xl mx-auto">
            Miles de profesionales ya comparten informaci&oacute;n sobre salarios, organigramas
            y experiencias de entrevistas. An&oacute;nimamente.
          </p>
        </motion.div>

        {/* Bento-style illustration grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-12 gap-4 md:gap-6 auto-rows-[200px] md:auto-rows-[240px]"
        >
          {/* Large hero illustration - spans 8 cols, 2 rows */}
          <motion.div
            variants={fadeUp}
            className="col-span-12 md:col-span-8 row-span-2 relative group"
          >
            <div className="absolute inset-0 rounded-2xl border border-neutral-200 bg-gradient-to-br from-neutral-50 to-white overflow-hidden">
              <motion.div
                custom={0}
                variants={floatVariants}
                initial="initial"
                animate="animate"
                className="relative w-full h-full flex items-center justify-center p-8"
              >
                <Image
                  src={illustrations[0].src}
                  alt={illustrations[0].alt}
                  width={illustrations[0].width}
                  height={illustrations[0].height}
                  className="object-contain max-h-full w-auto opacity-90 group-hover:opacity-100 transition-opacity duration-500 mix-blend-multiply"
                />
              </motion.div>
              {/* Hover glow */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-neutral-900/5 to-transparent" />
            </div>
          </motion.div>

          {/* Side card - stat */}
          <motion.div
            variants={fadeUp}
            className="col-span-6 md:col-span-4 row-span-1 relative group"
          >
            <div className="absolute inset-0 rounded-2xl border border-neutral-200 bg-neutral-950 p-6 flex flex-col justify-between overflow-hidden">
              <div>
                <p className="text-neutral-500 text-xs font-medium tracking-wider uppercase">Salario promedio</p>
                <p className="text-white text-4xl md:text-5xl font-bold mt-2">S/ 8,500</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-neutral-400 text-sm">Senior Dev &middot; Lima</span>
              </div>
              {/* Subtle gradient overlay */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-neutral-800/50 to-transparent rounded-bl-full" />
            </div>
          </motion.div>

          {/* Side illustration */}
          <motion.div
            variants={fadeUp}
            className="col-span-6 md:col-span-4 row-span-1 relative group"
          >
            <div className="absolute inset-0 rounded-2xl border border-neutral-200 bg-gradient-to-br from-neutral-50 to-white overflow-hidden">
              <motion.div
                custom={1}
                variants={floatVariants}
                initial="initial"
                animate="animate"
                className="relative w-full h-full flex items-center justify-center p-4"
              >
                <Image
                  src={illustrations[4].src}
                  alt={illustrations[4].alt}
                  width={illustrations[4].width}
                  height={illustrations[4].height}
                  className="object-contain max-h-full w-auto opacity-85 group-hover:opacity-100 transition-opacity duration-500 mix-blend-multiply"
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Bottom row - 3 cards */}
          <motion.div
            variants={fadeUp}
            className="col-span-6 md:col-span-4 row-span-1 relative group"
          >
            <div className="absolute inset-0 rounded-2xl border border-neutral-200 bg-gradient-to-br from-neutral-50 to-white overflow-hidden">
              <motion.div
                custom={2}
                variants={floatVariants}
                initial="initial"
                animate="animate"
                className="relative w-full h-full flex items-center justify-center p-4"
              >
                <Image
                  src={illustrations[3].src}
                  alt={illustrations[3].alt}
                  width={illustrations[3].width}
                  height={illustrations[3].height}
                  className="object-contain max-h-full w-auto opacity-85 group-hover:opacity-100 transition-opacity duration-500 mix-blend-multiply"
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Quote card */}
          <motion.div
            variants={fadeUp}
            className="col-span-12 md:col-span-4 row-span-1 relative group"
          >
            <div className="absolute inset-0 rounded-2xl border border-neutral-200 bg-white p-6 flex flex-col justify-between">
              <svg className="w-8 h-8 text-neutral-200" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <p className="text-neutral-700 text-sm md:text-base leading-relaxed italic">
                &ldquo;Gracias a Empliq pude negociar un aumento del 30%. Finalmente ten&iacute;a datos reales.&rdquo;
              </p>
              <p className="text-neutral-400 text-xs">An&oacute;nimo &middot; Senior Developer</p>
            </div>
          </motion.div>

          {/* Illustration */}
          <motion.div
            variants={fadeUp}
            className="col-span-6 md:col-span-4 row-span-1 relative group"
          >
            <div className="absolute inset-0 rounded-2xl border border-neutral-200 bg-gradient-to-br from-neutral-50 to-white overflow-hidden">
              <motion.div
                custom={3}
                variants={floatVariants}
                initial="initial"
                animate="animate"
                className="relative w-full h-full flex items-center justify-center p-4"
              >
                <Image
                  src={illustrations[5].src}
                  alt={illustrations[5].alt}
                  width={illustrations[5].width}
                  height={illustrations[5].height}
                  className="object-contain max-h-full w-auto opacity-85 group-hover:opacity-100 transition-opacity duration-500 mix-blend-multiply"
                />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
