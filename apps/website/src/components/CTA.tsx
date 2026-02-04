import Link from 'next/link'

export function CTA() {
  return (
    <section className="relative py-24 bg-neutral-50 overflow-hidden border-t border-neutral-200">
      {/* Top gradient blur transition */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white to-transparent" />
      
      {/* Background blur effect - similar to shader */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-blue-400/20 via-cyan-300/15 to-blue-500/20 rounded-full blur-[120px]" />
      </div>
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      
      <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-600/20 rounded-full px-4 py-2 mb-8">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-blue-600 text-sm font-medium">100% Gratis para empezar</span>
        </div>

        {/* Heading */}
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
          Estamos construyendo{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
            algo mejor.
          </span>
        </h2>

        {/* Description */}
        <p className="text-xl text-neutral-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          La información laboral no debería ser un secreto. Únete a la comunidad de profesionales 
          que están cambiando las reglas del juego.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          <Link
            href="/registro"
            className="inline-flex items-center gap-2 bg-neutral-900 text-white px-8 py-4 rounded-lg font-medium text-lg hover:bg-neutral-800 transition-all hover:gap-3"
          >
            Comenzar Gratis
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 border border-neutral-300 text-neutral-700 px-8 py-4 rounded-lg font-medium text-lg hover:bg-neutral-100 transition-colors"
          >
            Ver Demo
          </Link>
        </div>

        {/* Stats */}
        <div className="pt-12 border-t border-neutral-200 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '2,500+', label: 'Puestos documentados' },
            { value: '10k+', label: 'Profesionales' },
            { value: '500+', label: 'Empresas' },
            { value: '98%', label: 'Datos verificados' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-neutral-900 mb-1">{stat.value}</div>
              <div className="text-neutral-500 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
