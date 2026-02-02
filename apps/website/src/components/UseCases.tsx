import Link from 'next/link'

const useCases = [
  {
    title: 'Explorar Puestos',
    description: 'Descubre roles y responsabilidades reales de miles de puestos en Perú.',
    href: '/puestos',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    features: ['Descripciones detalladas', 'Requisitos reales', 'Trayectorias de carrera'],
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    title: 'Comparar Salarios',
    description: 'Datos reales y verificados de compensaciones en diferentes industrias.',
    href: '/salarios',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    features: ['Rangos por experiencia', 'Beneficios incluidos', 'Tendencias del mercado'],
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    title: 'Ver Organigramas',
    description: 'Visualiza estructuras organizacionales y entiende cómo operan las empresas.',
    href: '/organigramas',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    features: ['Estructuras interactivas', 'Niveles jerárquicos', 'Tamaño de equipos'],
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    title: 'Comunidad',
    description: 'Conecta con profesionales y comparte experiencias de forma anónima.',
    href: '/comunidad',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    features: ['Discusiones anónimas', 'Reviews de empresas', 'Consejos de carrera'],
    gradient: 'from-orange-500 to-red-500',
  },
]

export function UseCases() {
  return (
    <section className="relative py-24 bg-black">
      {/* Grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-blue-400 font-medium mb-4 tracking-wider uppercase text-sm">
            Casos de uso
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Usa Empliq para construir{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              tu carrera.
            </span>
          </h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Desde explorar nuevas oportunidades hasta negociar tu salario, 
            tenemos las herramientas que necesitas.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {useCases.map((useCase, i) => (
            <Link
              key={i}
              href={useCase.href}
              className="group relative bg-neutral-900/95 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-neutral-900 hover:border-white/20 transition-all duration-300"
            >
              {/* Gradient border effect on hover */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${useCase.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              
              <div className="relative">
                {/* Icon - Glass/Platinum style */}
                <div className="w-12 h-12 rounded-xl bg-white/[0.08] backdrop-blur-md border border-white/[0.12] flex items-center justify-center text-white/80 mb-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                  {useCase.icon}
                </div>

                {/* Title */}
                <h3 className="text-2xl font-semibold text-white mb-3 group-hover:text-white transition-colors">
                  {useCase.title}
                </h3>

                {/* Description */}
                <p className="text-white/60 mb-6 leading-relaxed">
                  {useCase.description}
                </p>

                {/* Features */}
                <ul className="space-y-2">
                  {useCase.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2 text-white/50 text-sm">
                      <svg className="w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Arrow */}
                <div className="mt-6 flex items-center gap-2 text-white/50 group-hover:text-white transition-colors">
                  <span className="text-sm font-medium">Explorar</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
