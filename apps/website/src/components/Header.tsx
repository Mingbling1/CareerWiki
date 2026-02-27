'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { EmpliqLogo } from './EmpliqLogo'
import { createClient } from '@/lib/supabase/client'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Building2, DollarSign } from 'lucide-react'

const recursos = [
  {
    title: "Salarios",
    href: "/salarios",
    description: "No te dejes engañar. Conoce cuánto ganan de verdad.",
    icon: DollarSign,
  },
  {
    title: "Empresas",
    href: "/empresas",
    description: "Investiga sueldos, beneficios y reseñas reales.",
    icon: Building2,
  },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user)
    })
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-xl bg-white/80 border-b border-neutral-200',
      )}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <nav className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <EmpliqLogo className="h-[32px] w-auto text-neutral-900 transition-transform group-hover:scale-105" />
          </Link>

          {/* Desktop navigation - centro */}
          <div className="hidden md:flex items-center">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Recursos</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-1 p-2 md:w-[500px] md:grid-cols-2 bg-white">
                      {recursos.map((item) => (
                        <li key={item.title}>
                          <NavigationMenuLink asChild>
                            <Link
                              href={item.href}
                              className="flex items-start gap-3 rounded-md p-3 hover:bg-neutral-100 transition-colors"
                            >
                              <item.icon className="w-5 h-5 text-neutral-500 mt-0.5" />
                              <div className="flex flex-col gap-1">
                                <div className="text-sm font-medium text-neutral-900">{item.title}</div>
                                <div className="text-xs text-neutral-500 line-clamp-2">{item.description}</div>
                              </div>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-2">
            {!isLoggedIn && (
              <Link
                href="/login"
                className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                Iniciar sesión
              </Link>
            )}
            <Link
              href="/empresas"
              className="px-4 py-2.5 text-sm bg-neutral-900 text-white rounded-full font-medium hover:bg-neutral-800 transition-all hover:scale-[1.02]"
            >
              Explorar empresas
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors"
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
          <div className="py-4 space-y-1 border-t border-neutral-200">
            {recursos.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 active:bg-neutral-200 active:text-neutral-900 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                <div>
                  <div className="text-sm font-medium">{item.title}</div>
                  <div className="text-xs text-neutral-400">{item.description}</div>
                </div>
              </Link>
            ))}
            <div className="pt-4 mt-4 border-t border-neutral-200 space-y-2">
              {!isLoggedIn && (
                <Link
                  href="/login"
                  className="block px-4 py-3 text-neutral-600 hover:text-neutral-900 rounded-lg transition-colors text-center"
                >
                  Iniciar sesión
                </Link>
              )}
              <Link
                href="/empresas"
                className="block px-4 py-3 bg-neutral-900 text-white rounded-lg font-medium text-center hover:bg-neutral-800 transition-colors"
              >
                Explorar empresas
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
