'use client'

import Link from 'next/link'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { EmpliqLogo } from './EmpliqLogo'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Building2, Users, DollarSign, MessageSquare } from 'lucide-react'

const recursos = [
  {
    title: "Salarios",
    href: "/salarios",
    description: "Descubre rangos salariales por puesto y empresa.",
    icon: DollarSign,
  },
  {
    title: "Empresas",
    href: "/empresas",
    description: "Explora perfiles de empresas y sus organigramas.",
    icon: Building2,
  },
  {
    title: "Comunidad",
    href: "/comunidad",
    description: "Conecta con otros profesionales y comparte experiencias.",
    icon: Users,
  },
  {
    title: "Reseñas",
    href: "/resenas",
    description: "Lee y comparte reseñas sobre empresas.",
    icon: MessageSquare,
  },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header
      className={cn(
        'sticky top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-xl border-b border-white/[0.06]',
      )}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <nav className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <EmpliqLogo className="h-[28px] w-auto text-white transition-transform group-hover:scale-105" />
          </Link>

          {/* Desktop navigation - centro */}
          <div className="hidden md:flex items-center">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Recursos</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-1 p-2 md:w-[500px] md:grid-cols-2">
                      {recursos.map((item) => (
                        <li key={item.title}>
                          <NavigationMenuLink asChild>
                            <Link
                              href={item.href}
                              className="flex items-start gap-3 rounded-md p-3 hover:bg-white/5 transition-colors"
                            >
                              <item.icon className="w-5 h-5 text-white/60 mt-0.5" />
                              <div className="flex flex-col gap-1">
                                <div className="text-sm font-medium text-white">{item.title}</div>
                                <div className="text-xs text-white/50 line-clamp-2">{item.description}</div>
                              </div>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                    <Link href="/puestos">
                      Puestos
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                    <Link href="/empresas">
                      Empresas
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-2">
            <a
              href="http://localhost:5173/login"
              className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors"
            >
              Iniciar sesión
            </a>
            <a
              href="http://localhost:5173/login"
              className="px-4 py-2.5 text-sm bg-white text-black rounded-full font-medium hover:bg-white/90 transition-all hover:scale-[1.02]"
            >
              Comenzar gratis
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-white/70 hover:text-white rounded-lg hover:bg-white/[0.06] transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </nav>

        {/* Mobile menu */}
        <div
          className={cn(
            'md:hidden overflow-hidden transition-all duration-300 ease-out',
            mobileMenuOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <div className="py-4 space-y-1 border-t border-white/[0.06]">
            {recursos.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 text-white/60 hover:text-white hover:bg-white/[0.04] rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                {item.title}
              </Link>
            ))}
            <div className="pt-4 mt-4 border-t border-white/[0.06] space-y-2">
              <a
                href="http://localhost:5173/login"
                className="block px-4 py-3 text-white/60 hover:text-white rounded-lg transition-colors text-center"
              >
                Iniciar sesión
              </a>
              <a
                href="http://localhost:5173/login"
                className="block px-4 py-3 bg-white text-black rounded-lg font-medium text-center hover:bg-white/90 transition-colors"
              >
                Comenzar gratis
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
