'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
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
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
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
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
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
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
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
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    },
  }),
}

/* ─── Mock data for the dashboard preview ─── */

const MOCK_REVIEWS = [
  {
    nickname: 'ValienteCóndor42',
    avatar: '/illustrations/avatars/avatar_2094458_01.png',
    badge: 'Empleado actual',
    rating: 4,
    title: 'Buen ambiente, pero el sueldo no alcanza',
    body: 'La gente es bacán y se aprende un montón, pero para lo que te exigen merecemos ganar mejor.',
  },
  {
    nickname: 'InkaDigital88',
    avatar: '/illustrations/avatars/avatar_2094458_04.png',
    badge: null,
    rating: 3,
    title: 'Mucha chamba, poca plata',
    body: 'Horas extras sin pagar y cero reconocimiento. Los beneficios están bien pero tus horas valen más.',
  },
]

const MOCK_SALARIES = [
  { title: 'Senior Software Engineer', company: 'BCP', salary: 'S/12,000', reports: 23 },
  { title: 'Product Manager', company: 'Interbank', salary: 'S/15,000', reports: 14 },
  { title: 'UX Designer', company: 'Alicorp', salary: 'S/8,000', reports: 9 },
]

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} className={`w-3 h-3 ${s <= rating ? 'text-neutral-800 fill-neutral-800' : 'text-neutral-300'}`} viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

// Animated text component — groups by word to prevent mid-word line breaks
function AnimatedHeadline({ text, className }: { text: string; className?: string }) {
  let charIndex = 0
  const words = text.split(' ')

  return (
    <span className={className}>
      {words.map((word, wi) => {
        const startIndex = charIndex
        charIndex += word.length + 1 // +1 for the space

        return (
          <span key={wi} style={{ display: 'inline-flex', whiteSpace: 'nowrap' }}>
            {word.split('').map((char, ci) => (
              <motion.span
                key={ci}
                custom={startIndex + ci}
                variants={letterVariants}
                initial="hidden"
                animate="visible"
                style={{ display: 'inline-block' }}
              >
                {char}
              </motion.span>
            ))}
            {wi < words.length - 1 && (
              <span style={{ display: 'inline-block', width: '0.3em' }} />
            )}
          </span>
        )
      })}
    </span>
  )
}

export function Hero() {
  const [isMounted, setIsMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<'salarios' | 'reseñas'>('salarios')

  useEffect(() => {
    setIsMounted(true)
    // Auto-switch tabs to show both features
    const interval = setInterval(() => {
      setActiveTab((prev) => (prev === 'salarios' ? 'reseñas' : 'salarios'))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative min-h-[80vh] lg:min-h-0 lg:flex-1 flex items-center justify-center overflow-hidden">
      {/* Shader Background - starts after header */}
      {isMounted && (
        <Shader3 
          className="!fixed !top-20 !h-[calc(100vh+800px)]" 
          color="#808080"
        />
      )}

      {/* Grid lines overlay - estilo Payload */}
      <div className="absolute inset-0 z-[1] pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-4 md:pt-12 pb-8">
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
              <div className="flex items-center gap-2 bg-neutral-900/10 backdrop-blur-sm border border-neutral-400/30 rounded-full px-4 py-2">
                <span className="text-neutral-700 font-medium text-sm">🇵🇪 Hecho por peruanos, para peruanos</span>
              </div>
            </motion.div>

            {/* Main heading */}
            <motion.h1
              variants={itemVariants}
              className="text-[2rem] sm:text-5xl md:text-6xl lg:text-7xl font-bold text-neutral-900 leading-[1.1] tracking-tight"
            >
              <AnimatedHeadline text="Todos merecemos" />{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-900 via-neutral-600 to-neutral-400">
                <AnimatedHeadline text="un mejor trabajo." />
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={itemVariants}
              className="text-lg sm:text-xl text-neutral-600 max-w-lg leading-relaxed"
            >
              Descubre cuánto pagan de verdad, lee reseñas de quienes ya están adentro 
              y negocia con datos reales. La comunidad laboral que el Perú necesitaba.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
              <a
                href="/empresas"
                className="inline-flex items-center gap-2 bg-neutral-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-neutral-800 transition-all hover:gap-3"
              >
                Explorar empresas
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <a
                href="/salarios"
                className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm text-neutral-800 border border-neutral-300 px-6 py-3 rounded-lg font-medium hover:bg-white/80 transition-all"
              >
                Ver salarios
              </a>
            </motion.div>

            {/* Social proof mini */}
            <motion.div variants={itemVariants} className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[1, 4, 6].map((n) => (
                  <Image
                    key={n}
                    src={`/illustrations/avatars/avatar_2094458_0${n}.png`}
                    alt=""
                    width={28}
                    height={28}
                    className="rounded-full border-2 border-white object-cover"
                  />
                ))}
              </div>
              <p className="text-sm text-neutral-700">
                <span className="font-semibold text-neutral-900">24,000+</span> empresas &middot; datos reales de la comunidad
              </p>
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
                <div className="flex-1 flex justify-center">
                  <div className="bg-neutral-100 rounded-lg px-4 py-1 text-neutral-500 text-sm font-mono">
                    empliq.io/empresas
                  </div>
                </div>
              </div>

              {/* Dashboard content */}
              <div className="p-5 space-y-4 bg-neutral-50">
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Salario promedio', value: 'S/8,500' },
                    { label: 'Puestos activos', value: '2,340' },
                    { label: 'Empresas', value: '24,223' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-xl p-3.5 border border-neutral-100 shadow-sm">
                      <p className="text-neutral-500 text-[10px] mb-1">{stat.label}</p>
                      <p className="text-neutral-900 font-bold text-base">{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* Tab switcher */}
                <div className="flex gap-1 bg-neutral-100 rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab('salarios')}
                    className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-all ${
                      activeTab === 'salarios'
                        ? 'bg-white text-neutral-900 shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-700'
                    }`}
                  >
                    Salarios
                  </button>
                  <button
                    onClick={() => setActiveTab('reseñas')}
                    className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-all ${
                      activeTab === 'reseñas'
                        ? 'bg-white text-neutral-900 shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-700'
                    }`}
                  >
                    Reseñas
                  </button>
                </div>

                {/* Tab content */}
                {activeTab === 'salarios' ? (
                  <div className="space-y-2">
                    {MOCK_SALARIES.map((job, i) => (
                      <div key={i} className="flex items-center gap-3 bg-white rounded-lg px-3.5 py-3 border border-neutral-100">
                        <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0">
                          <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-neutral-900 text-sm font-medium truncate">{job.title}</p>
                          <p className="text-neutral-400 text-[10px]">{job.company} &middot; {job.reports} reportes</p>
                        </div>
                        <span className="text-neutral-900 font-mono text-sm font-bold shrink-0">{job.salary}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {MOCK_REVIEWS.map((review, i) => (
                      <div key={i} className="bg-white rounded-lg p-3.5 border border-neutral-100">
                        <div className="flex items-center gap-2.5 mb-2">
                          <Image
                            src={review.avatar}
                            alt={review.nickname}
                            width={28}
                            height={28}
                            className="rounded-full object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-neutral-800 truncate">{review.nickname}</span>
                              {review.badge && (
                                <span className="text-[9px] bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded-full border border-neutral-200 shrink-0">
                                  {review.badge}
                                </span>
                              )}
                            </div>
                            <StarRow rating={review.rating} />
                          </div>
                        </div>
                        <p className="text-xs font-medium text-neutral-800 mb-0.5">{review.title}</p>
                        <p className="text-[11px] text-neutral-500 leading-relaxed line-clamp-2">{review.body}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Floating card — New anonymous contribution */}
            <motion.div
              custom={0.8}
              variants={floatingCardVariants}
              initial="hidden"
              animate="visible"
              className="absolute -left-6 top-[38%] bg-white backdrop-blur-lg border border-neutral-200 rounded-xl p-3.5 shadow-xl hidden lg:block"
            >
              <div className="flex items-center gap-3">
                <Image
                  src="/illustrations/avatars/avatar_2094458_07.png"
                  alt=""
                  width={36}
                  height={36}
                  className="rounded-full object-cover"
                />
                <div>
                  <p className="text-neutral-900 text-xs font-semibold">FieroAlpaca99</p>
                  <p className="text-neutral-400 text-[10px]">Reportó su sueldo 🎉</p>
                </div>
              </div>
            </motion.div>

            {/* Floating card — Verified badge */}
            <motion.div
              custom={1.0}
              variants={floatingCardVariants}
              initial="hidden"
              animate="visible"
              className="absolute -right-4 bottom-[22%] bg-white backdrop-blur-lg border border-neutral-200 rounded-xl p-3.5 shadow-xl hidden lg:block"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-neutral-900 flex items-center justify-center">
                  <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-neutral-900 text-sm font-bold">98%</p>
                  <p className="text-neutral-500 text-[10px]">Datos verificados</p>
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
