import Link from 'next/link'

export function CTA() {
  return (
    <section className="relative py-24 bg-black overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.15)_0%,transparent_50%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      
      <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-8">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-blue-400 text-sm font-medium">100% Gratis para empezar</span>
        </div>

        {/* Heading */}
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
          Estamos construyendo{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
            algo mejor.
          </span>
        </h2>

        {/* Description */}
        <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed">
          La información laboral no debería ser un secreto. Únete a la comunidad de profesionales 
          que están cambiando las reglas del juego.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          <Link
            href="/registro"
            className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-lg font-medium text-lg hover:bg-white/90 transition-all hover:gap-3"
          >
            Comenzar Gratis
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 border border-white/20 text-white px-8 py-4 rounded-lg font-medium text-lg hover:bg-white/5 transition-colors"
          >
            Ver Demo
          </Link>
        </div>

        {/* Stats */}
        <div className="pt-12 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '2,500+', label: 'Puestos documentados' },
            { value: '10k+', label: 'Profesionales' },
            { value: '500+', label: 'Empresas' },
            { value: '98%', label: 'Datos verificados' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-white/50 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
