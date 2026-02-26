'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

const useCases = [
  {
    title: 'Conoce las Empresas',
    description: 'No te vayas a ciegas, causa. Investiga sueldos, beneficios y reseñas reales antes de aceptar una oferta.',
    href: '/empresas',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    features: ['Resenas de empleados reales', 'Beneficios detallados', '19,000+ empresas peruanas'],
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    title: 'Compara tu Sueldo',
    description: 'Tu chamba vale mas de lo que crees. Compara tu sueldo con miles de profesionales en tu industria.',
    href: '/salarios',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    features: ['Rangos por experiencia', 'Datos verificados por comunidad', 'Tendencias del mercado peruano'],
    gradient: 'from-green-500 to-emerald-500',
  },
  // TODO: Habilitar cuando estén implementados para MVP
  // {
  //   title: 'Ver Organigramas',
  //   description: 'Visualiza estructuras organizacionales y entiende cómo operan las empresas.',
  //   href: '/organigramas',
  //   icon: (
  //     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  //     </svg>
  //   ),
  //   features: ['Estructuras interactivas', 'Niveles jerárquicos', 'Tamaño de equipos'],
  //   gradient: 'from-purple-500 to-pink-500',
  // },
  // {
  //   title: 'Comunidad',
  //   description: 'Conecta con profesionales y comparte experiencias de forma anónima.',
  //   href: '/comunidad',
  //   icon: (
  //     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  //     </svg>
  //   ),
  //   features: ['Discusiones anónimas', 'Reviews de empresas', 'Consejos de carrera'],
  //   gradient: 'from-orange-500 to-red-500',
  // },
]

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  },
}

export function UseCases() {
  return (
    <section className="relative py-24 bg-white">
      {/* Grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-neutral-500 font-medium mb-4 tracking-wider uppercase text-sm">
            Para que no te cuenteen
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
            Tu siguiente chamba,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-900 via-neutral-600 to-neutral-400">
              con los ojos bien abiertos.
            </span>
          </h2>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Antes de firmar, enterate cuanto pagan, como tratan a su gente
            y si de verdad vale la pena.
          </p>
        </motion.div>

        {/* Cards grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid md:grid-cols-2 gap-6"
        >
          {useCases.map((useCase, i) => (
            <motion.div key={i} variants={cardVariants}>
              <Link
                href={useCase.href}
                className="group relative block bg-white backdrop-blur-sm border border-neutral-200 rounded-2xl p-8 hover:bg-neutral-50 hover:border-neutral-300 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                {/* Gradient border effect on hover */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${useCase.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                <div className="relative">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-600 mb-6 group-hover:bg-neutral-900 group-hover:text-white group-hover:border-neutral-800 transition-colors">
                    {useCase.icon}
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-semibold text-neutral-900 mb-3 group-hover:text-neutral-700 transition-colors">
                    {useCase.title}
                  </h3>

                  {/* Description */}
                  <p className="text-neutral-600 mb-6 leading-relaxed">
                    {useCase.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-2">
                    {useCase.features.map((feature, j) => (
                      <li key={j} className="flex items-center gap-2 text-neutral-500 text-sm">
                        <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Arrow */}
                  <div className="mt-6 flex items-center gap-2 text-neutral-400 group-hover:text-neutral-900 transition-colors">
                    <span className="text-sm font-medium">Explorar</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
