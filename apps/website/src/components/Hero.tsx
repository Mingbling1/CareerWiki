'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'

// Importar Shader3 dinámicamente para evitar problemas de SSR con Three.js
const Shader3 = dynamic(
  () => import('./Shader3').then((mod) => ({ default: mod.Shader3 })),
  { ssr: false }
)

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
}

const letterVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: i * 0.03,
      ease: [0.25, 0.1, 0.25, 1],
    },
  }),
}

const dashboardVariants = {
  hidden: { opacity: 0, scale: 0.95, x: 40 },
  visible: {
    opacity: 1,
    scale: 1,
    x: 0,
    transition: {
      duration: 0.8,
      delay: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
}

const floatingCardVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (delay: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      delay: delay,
      ease: [0.25, 0.1, 0.25, 1],
    },
  }),
}

// Animated text component
function AnimatedHeadline({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className}>
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          custom={i}
          variants={letterVariants}
          initial="hidden"
          animate="visible"
          style={{ display: 'inline-block' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </span>
  )
}

export function Hero() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Shader Background - starts after header */}
      {isMounted && (
        <Shader3 
          className="!fixed !top-16 !h-[calc(100vh+800px)]" 
          color="#3b82f6"
        />
      )}

      {/* Grid lines overlay - estilo Payload */}
      <div className="absolute inset-0 z-[1] pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-8 md:pt-32 pb-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left column - Text */}
          <motion.div
            className="flex flex-col gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Badge */}
            <motion.div variants={itemVariants} className="inline-flex self-start">
              <div className="flex items-center gap-2 bg-blue-600/10 backdrop-blur-sm border border-blue-600/20 rounded-full px-4 py-2">
                <span className="text-blue-600 font-medium text-sm">Plataforma colaborativa</span>
              </div>
            </motion.div>

            {/* Main heading */}
            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-neutral-900 leading-[1.1] tracking-tight"
            >
              <AnimatedHeadline text="La transparencia laboral que " />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
                <AnimatedHeadline text="Perú necesita." />
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={itemVariants}
              className="text-xl text-neutral-600 max-w-lg leading-relaxed"
            >
              Empliq es la plataforma open-source donde profesionales comparten información real 
              sobre salarios, puestos y estructuras organizacionales.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
              <Link
                href="/registro"
                className="inline-flex items-center gap-2 bg-neutral-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-neutral-800 transition-all hover:gap-3"
              >
                Comenzar gratis
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right column - Dashboard mockup */}
          <div className="relative lg:pl-8">
            {/* Main card - Dashboard preview */}
            <motion.div
              variants={dashboardVariants}
              initial="hidden"
              animate="visible"
              className="relative bg-white/80 backdrop-blur-xl border border-neutral-200 rounded-2xl overflow-hidden shadow-2xl"
            >
              {/* Browser bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-200">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-neutral-100 rounded-lg px-4 py-1 text-neutral-500 text-sm font-mono">
                    app.empliq.com
                  </div>
                </div>
              </div>

              {/* Dashboard content */}
              <div className="p-6 space-y-4 bg-neutral-50">
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Salario promedio', value: 'S/8,500', change: '+12%' },
                    { label: 'Puestos activos', value: '2,340', change: '+5%' },
                    { label: 'Empresas', value: '156', change: '+8%' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-xl p-4 border border-neutral-100 shadow-sm">
                      <p className="text-neutral-500 text-xs mb-1">{stat.label}</p>
                      <p className="text-neutral-900 font-semibold text-lg">{stat.value}</p>
                      <span className="text-green-600 text-xs">{stat.change}</span>
                    </div>
                  ))}
                </div>

                {/* Sample job listings */}
                <div className="space-y-2">
                  {[
                    { title: 'Senior Software Engineer', company: 'BCP', salary: 'S/12,000' },
                    { title: 'Product Manager', company: 'Interbank', salary: 'S/15,000' },
                    { title: 'UX Designer', company: 'Alicorp', salary: 'S/8,000' },
                  ].map((job, i) => (
                    <div key={i} className="flex items-center justify-between bg-white rounded-lg px-4 py-3 border border-neutral-100">
                      <div>
                        <p className="text-neutral-900 text-sm font-medium">{job.title}</p>
                        <p className="text-neutral-500 text-xs">{job.company}</p>
                      </div>
                      <span className="text-blue-600 font-mono text-sm">{job.salary}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Floating cards */}
            <motion.div
              custom={0.8}
              variants={floatingCardVariants}
              initial="hidden"
              animate="visible"
              className="absolute -left-8 top-1/4 bg-white backdrop-blur-lg border border-neutral-200 rounded-xl p-4 shadow-xl hidden lg:block"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                  +
                </div>
                <div>
                  <p className="text-neutral-900 text-sm font-medium">Nuevo dato</p>
                  <p className="text-neutral-500 text-xs">Salario verificado</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              custom={1.0}
              variants={floatingCardVariants}
              initial="hidden"
              animate="visible"
              className="absolute -right-4 bottom-1/4 bg-white backdrop-blur-lg border border-neutral-200 rounded-xl p-4 shadow-xl hidden lg:block"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-neutral-900 text-sm font-medium">98%</p>
                  <p className="text-neutral-500 text-xs">Datos verificados</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent z-[2]" />
    </section>
  )
}
