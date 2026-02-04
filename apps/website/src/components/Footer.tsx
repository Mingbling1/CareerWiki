import Link from 'next/link'
import { EmpliqLogo } from './EmpliqLogo'

const footerLinks = {
  useCases: {
    title: 'CASOS DE USO',
    links: [
      { label: 'Explorar Puestos', href: '/puestos' },
      { label: 'Comparar Salarios', href: '/salarios' },
      { label: 'Ver Organigramas', href: '/organigramas' },
      { label: 'Comunidad', href: '/comunidad' },
    ],
  },
  developers: {
    title: 'DESARROLLADORES',
    links: [
      { label: 'Documentación', href: '/docs' },
      { label: 'API', href: '/api' },
      { label: 'Contribuir', href: '/contribuir' },
      { label: 'Roadmap', href: '/roadmap' },
    ],
  },
  company: {
    title: 'EMPRESA',
    links: [
      { label: 'Nosotros', href: '/nosotros' },
      { label: 'Blog', href: '/blog' },
      { label: 'Empleo', href: '/empleo' },
      { label: 'Contacto', href: '/contacto' },
      { label: 'Privacidad', href: '/privacidad' },
      { label: 'Términos', href: '/terminos' },
    ],
  },
}

const socialLinks = [
  {
    label: 'Twitter',
    href: 'https://twitter.com/empliq',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: 'Discord',
    href: 'https://discord.gg/empliq',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
      </svg>
    ),
  },
  {
    label: 'GitHub',
    href: 'https://github.com/empliq',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: 'https://youtube.com/@empliq',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
]

export function Footer() {
  return (
    <footer className="relative bg-neutral-50 pt-24 pb-12 border-t border-neutral-200">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Main CTA section */}
        <div className="text-center mb-20">
          <p className="text-neutral-400 text-sm font-medium tracking-wider mb-6">
            CONSTRUYAMOS JUNTOS
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 mb-8 leading-tight">
            La transparencia laboral<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
              empieza contigo.
            </span>
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/registro"
              className="inline-flex items-center gap-2 bg-neutral-900 text-white px-6 py-3 rounded-full font-medium hover:bg-neutral-800 transition-all hover:scale-[1.02]"
            >
              Comenzar gratis
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/contacto"
              className="inline-flex items-center gap-2 border border-neutral-300 text-neutral-700 px-6 py-3 rounded-full font-medium hover:bg-neutral-100 transition-colors"
            >
              Contactar
            </Link>
          </div>
        </div>

        {/* Links section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-16 border-b border-neutral-200">
          {/* Logo column */}
          <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <EmpliqLogo className="h-[22px] w-auto text-neutral-900 transition-transform group-hover:scale-105" />
            </Link>
            <p className="text-neutral-500 text-sm leading-relaxed">
              Transparencia laboral para todos.
            </p>
            <div className="flex items-center gap-3 mt-2">
              <Link
                href="https://github.com/empliq"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 text-sm transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                GitHub
              </Link>
            </div>
          </div>

          {/* Use Cases */}
          <div>
            <h4 className="text-neutral-400 font-medium text-xs tracking-wider mb-4">
              {footerLinks.useCases.title}
            </h4>
            <ul className="space-y-3">
              {footerLinks.useCases.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-neutral-600 hover:text-neutral-900 text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Developers */}
          <div>
            <h4 className="text-neutral-400 font-medium text-xs tracking-wider mb-4">
              {footerLinks.developers.title}
            </h4>
            <ul className="space-y-3">
              {footerLinks.developers.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-neutral-600 hover:text-neutral-900 text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-neutral-400 font-medium text-xs tracking-wider mb-4">
              {footerLinks.company.title}
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-neutral-600 hover:text-neutral-900 text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Newsletter */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <span className="text-neutral-500 text-sm whitespace-nowrap">Suscríbete al newsletter</span>
            <div className="flex items-center bg-white border border-neutral-200 rounded-full overflow-hidden flex-1 md:flex-none shadow-sm">
              <input
                type="email"
                placeholder="tu@email.com"
                className="bg-transparent px-4 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none w-full md:w-48"
              />
              <button className="bg-neutral-900 text-white px-4 py-2 text-sm font-medium hover:bg-neutral-800 transition-colors">
                →
              </button>
            </div>
          </div>

          {/* Social links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-400 hover:text-neutral-900 transition-colors"
                aria-label={social.label}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-neutral-200 text-center">
          <p className="text-neutral-500 text-sm">
            © {new Date().getFullYear()} Empliq. Open source bajo licencia MIT.
          </p>
        </div>
      </div>
    </footer>
  )
}
