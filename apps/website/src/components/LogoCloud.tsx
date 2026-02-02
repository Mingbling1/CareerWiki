const logos = [
  { name: 'Microsoft', letter: 'M' },
  { name: 'Google', letter: 'G' },
  { name: 'Apple', letter: 'A' },
  { name: 'Meta', letter: 'M' },
  { name: 'Amazon', letter: 'A' },
  { name: 'Tesla', letter: 'T' },
  { name: 'Netflix', letter: 'N' },
  { name: 'Spotify', letter: 'S' },
]

export function LogoCloud() {
  return (
    <section className="relative py-16 border-y border-white/10 bg-black/90 backdrop-blur-xl">
      {/* Label */}
      <div className="text-center mb-10">
        <p className="text-white/40 text-sm font-medium tracking-wider uppercase">
          Profesionales de las empresas más innovadoras confían en Empliq
        </p>
      </div>

      {/* Logo marquee */}
      <div className="relative overflow-hidden">
        {/* Gradient masks */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black to-transparent z-10" />

        {/* Scrolling logos */}
        <div className="flex animate-marquee">
          {[...logos, ...logos].map((logo, i) => (
            <div
              key={i}
              className="flex items-center justify-center mx-12 shrink-0"
            >
              <div className="flex items-center gap-3 text-white/30 hover:text-white/60 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                  <span className="font-bold text-lg">{logo.letter}</span>
                </div>
                <span className="font-medium text-lg">{logo.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
