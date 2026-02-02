'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'

// Importar Shader3 dinámicamente para evitar problemas de SSR con Three.js
const Shader3 = dynamic(
  () => import('./Shader3').then((mod) => ({ default: mod.Shader3 })),
  { ssr: false }
)

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
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left column - Text */}
          <div className="flex flex-col gap-8">
            {/* Command line badge - estilo Payload */}
            <div className="inline-flex self-start">
              <div className="flex items-center gap-3 bg-black/50 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2">
                <span className="text-white/50 font-mono text-sm">$</span>
                <code className="text-white/90 font-mono text-sm">npx create-empliq-app</code>
                <button className="text-white/50 hover:text-white transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Main heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight">
              La transparencia laboral que{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                Perú necesita.
              </span>
            </h1>

            {/* Description */}
            <p className="text-xl text-white/60 max-w-lg leading-relaxed">
              Empliq es la plataforma open-source donde profesionales comparten información real 
              sobre salarios, puestos y estructuras organizacionales.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link
                href="/registro"
                className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-white/90 transition-all hover:gap-3"
              >
                Comenzar gratis
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 border border-white/20 text-white px-6 py-3 rounded-lg font-medium hover:bg-white/5 transition-colors backdrop-blur-sm"
              >
                Ver demo
              </Link>
            </div>
          </div>

          {/* Right column - Dashboard mockup */}
          <div className="relative lg:pl-8">
            {/* Main card - Dashboard preview */}
            <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              {/* Browser bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-white/20" />
                  <div className="w-3 h-3 rounded-full bg-white/20" />
                  <div className="w-3 h-3 rounded-full bg-white/20" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-white/5 rounded-lg px-4 py-1 text-white/40 text-sm font-mono">
                    app.empliq.com
                  </div>
                </div>
              </div>

              {/* Dashboard content */}
              <div className="p-6 space-y-4">
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Salario promedio', value: '$45,000', change: '+12%' },
                    { label: 'Puestos activos', value: '2,340', change: '+5%' },
                    { label: 'Empresas', value: '156', change: '+8%' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white/5 rounded-xl p-4">
                      <p className="text-white/50 text-xs mb-1">{stat.label}</p>
                      <p className="text-white font-semibold text-lg">{stat.value}</p>
                      <span className="text-green-400 text-xs">{stat.change}</span>
                    </div>
                  ))}
                </div>

                {/* Sample job listings */}
                <div className="space-y-2">
                  {[
                    { title: 'Senior Software Engineer', company: 'Tech Corp', salary: '$85,000' },
                    { title: 'Product Manager', company: 'StartupMX', salary: '$72,000' },
                    { title: 'UX Designer', company: 'DesignCo', salary: '$58,000' },
                  ].map((job, i) => (
                    <div key={i} className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-3">
                      <div>
                        <p className="text-white text-sm font-medium">{job.title}</p>
                        <p className="text-white/50 text-xs">{job.company}</p>
                      </div>
                      <span className="text-blue-400 font-mono text-sm">{job.salary}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating cards */}
            <div className="absolute -left-8 top-1/4 bg-black/60 backdrop-blur-lg border border-white/10 rounded-xl p-4 shadow-xl hidden lg:block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                  +
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Nuevo dato</p>
                  <p className="text-white/50 text-xs">Salario verificado</p>
                </div>
              </div>
            </div>

            <div className="absolute -right-4 bottom-1/4 bg-black/60 backdrop-blur-lg border border-white/10 rounded-xl p-4 shadow-xl hidden lg:block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">98%</p>
                  <p className="text-white/50 text-xs">Datos verificados</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-[2]" />
    </section>
  )
}
