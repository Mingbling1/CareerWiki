const testimonials = [
  {
    quote: "Gracias a Empliq pude negociar un aumento del 30%. Finalmente tenía datos reales para respaldar mi petición.",
    author: "María González",
    role: "Senior Developer",
    company: "Tech Startup",
    avatar: "M",
  },
  {
    quote: "Antes de aceptar una oferta, siempre verifico en Empliq. Me ha salvado de aceptar ofertas por debajo del mercado.",
    author: "Carlos Rodríguez",
    role: "Product Manager",
    company: "E-commerce Corp",
    avatar: "C",
  },
  {
    quote: "La comunidad de Empliq es increíble. Encontré mentores y consejos que cambiaron mi carrera por completo.",
    author: "Ana Martínez",
    role: "UX Designer",
    company: "Design Agency",
    avatar: "A",
  },
]

export function Testimonials() {
  return (
    <section className="relative py-24 bg-zinc-950 overflow-hidden">
      {/* Smooth transition glow at bottom */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black via-zinc-950/80 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-[radial-gradient(ellipse_at_bottom,rgba(59,130,246,0.08)_0%,transparent_60%)]" />

      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.1)_0%,transparent_70%)]" />
      

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-blue-400 font-medium mb-4 tracking-wider uppercase text-sm">
            Testimonios
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            De Fortune 500 a startups,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Empliq es la respuesta.
            </span>
          </h2>
        </div>

        {/* Testimonials grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, i) => (
            <div
              key={i}
              className="relative bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/[0.04] hover:border-white/20 transition-all duration-300"
            >
              {/* Quote icon */}
              <svg
                className="w-10 h-10 text-blue-500/30 mb-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>

              {/* Quote */}
              <p className="text-white/80 text-lg leading-relaxed mb-8">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="text-white font-medium">{testimonial.author}</p>
                  <p className="text-white/50 text-sm">
                    {testimonial.role} · {testimonial.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
