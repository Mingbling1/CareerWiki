import { 
  Users, 
  TrendingUp, 
  Target, 
  Sparkles,
  ArrowRight,
  Building2,
  GraduationCap,
  Briefcase
} from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-gray-900">Sueldos</span>
          </div>
          <a 
            href="/app" 
            className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition flex items-center gap-2"
          >
            Empezar <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            Construido por la comunidad
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Descubre lo que{' '}
            <span className="text-blue-500">realmente se necesita</span>{' '}
            para el trabajo que quieres
          </h1>
          
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Información real de personas reales. Salarios, habilidades, experiencia y consejos 
            para cada puesto de trabajo.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="/app" 
              className="bg-blue-500 text-white px-8 py-4 rounded-xl text-lg font-medium hover:bg-blue-600 transition flex items-center gap-2 shadow-lg shadow-blue-500/25"
            >
              Explorar Puestos <ArrowRight className="w-5 h-5" />
            </a>
            <a 
              href="#como-funciona" 
              className="text-gray-600 px-8 py-4 rounded-xl text-lg font-medium hover:text-gray-900 transition"
            >
              ¿Cómo funciona?
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '500+', label: 'Puestos documentados' },
              { value: '2,000+', label: 'Contribuciones' },
              { value: '150+', label: 'Empresas' },
              { value: '98%', label: 'Información verificada' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problema */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ¿Te suena familiar?
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Buscar trabajo sin saber qué esperar es frustrante
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Target,
                title: '"No sé qué habilidades necesito"',
                desc: 'Las descripciones de trabajo son genéricas y no dicen la verdad completa.',
              },
              {
                icon: TrendingUp,
                title: '"Los salarios son un misterio"',
                desc: 'Nunca sabes si te están pagando bien o si puedes pedir más.',
              },
              {
                icon: GraduationCap,
                title: '"¿Qué exámenes me harán?"',
                desc: 'Ir a una entrevista sin saber qué esperar reduce tus probabilidades.',
              },
            ].map(({ icon: Icon, title, desc }, i) => (
              <div 
                key={i} 
                className="bg-gray-50 rounded-2xl p-8 hover:bg-gray-100 transition"
              >
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-6">
                  <Icon className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solución */}
      <section id="como-funciona" className="py-20 px-6 bg-blue-500">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Así funciona
            </h2>
            <p className="text-blue-100 text-lg max-w-2xl mx-auto">
              Información colaborativa de quienes ya están adentro
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Explora organigramas',
                desc: 'Navega por estructuras organizacionales de empresas reales.',
              },
              {
                step: '02',
                title: 'Descubre cada puesto',
                desc: 'Ve salarios, requisitos, habilidades y consejos de cada cargo.',
              },
              {
                step: '03',
                title: 'Contribuye',
                desc: 'Comparte tu experiencia para ayudar a otros.',
              },
            ].map(({ step, title, desc }, i) => (
              <div key={i} className="text-center">
                <div className="text-6xl font-bold text-white/20 mb-4">{step}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
                <p className="text-blue-100">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: 'Colaborativo',
                desc: 'Construido por la comunidad. Cada aporte suma valor.',
              },
              {
                icon: Briefcase,
                title: 'Información real',
                desc: 'Datos de personas que están en esos puestos actualmente.',
              },
              {
                icon: TrendingUp,
                title: 'Siempre actualizado',
                desc: 'Información en tiempo real sobre el mercado laboral.',
              },
            ].map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="text-center p-8">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Icon className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-6 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Aumenta tus probabilidades de conseguir el trabajo que quieres
          </h2>
          <p className="text-gray-400 text-lg mb-10">
            Únete a miles de personas que ya usan esta información para prepararse mejor.
          </p>
          <a 
            href="/app" 
            className="inline-flex items-center gap-2 bg-blue-500 text-white px-8 py-4 rounded-xl text-lg font-medium hover:bg-blue-600 transition shadow-lg shadow-blue-500/25"
          >
            Empezar ahora <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-gray-900">Sueldos & Organigrama</span>
          </div>
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Sueldos. Hecho con ❤️ para la comunidad.
          </p>
        </div>
      </footer>
    </main>
  )
}
