import Link from "next/link"
import { EmpliqLogo } from "./EmpliqLogo"

const footerSections = [
  {
    title: "Empliq",
    links: [
      { label: "Inicio", href: "/" },
      { label: "Salarios", href: "/salarios" },
      { label: "Empresas", href: "/empresas" },
    ],
  },
  {
    title: "Contribuir",
    links: [
      { label: "Agregar salario", href: "/salarios" },
      { label: "Escribir reseña", href: "/empresas" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Términos de servicio", href: "/terminos" },
      { label: "Política de privacidad", href: "/privacidad" },
      { label: "Contacto", href: "/contacto" },
    ],
  },
]

export function AppFooter() {
  return (
    <footer className="border-t border-border/40 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Logo + tagline */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2">
              <EmpliqLogo className="h-5 w-auto text-foreground" />
            </Link>
            <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
              Transparencia laboral para el Perú.
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              S/. PEN / mes
            </p>
          </div>

          {/* Link columns */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-xs font-medium text-muted-foreground tracking-wider uppercase mb-3">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Empliq. Todos los derechos
            reservados.
          </p>

          {/* Hecho con manos peruanas */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-stone-50 via-neutral-50 to-stone-100 shadow-sm border border-stone-200/50">
            <span className="text-sm leading-none">🇵🇪</span>
            <span className="text-xs font-semibold text-stone-700 tracking-wide">
              Hecho con manos peruanas
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/empliq"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="GitHub"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
            </a>
            <a
              href="https://twitter.com/empliq"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Twitter"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
