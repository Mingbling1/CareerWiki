"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Search, LogOut, User, Bell, Settings, Building2, DollarSign } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { EmpliqLogo } from "@/components/EmpliqLogo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { CurrencyLanguageSelector } from "@/components/CurrencyLanguageSelector"
import { api } from "@/lib/api"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export function AppHeader({ initialAvatarUrl }: { initialAvatarUrl?: string | null }) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [customAvatar, setCustomAvatar] = useState<string | null>(initialAvatarUrl ?? null)
  const [prevInitialAvatar, setPrevInitialAvatar] = useState(initialAvatarUrl)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Sync avatar when server provides a new value (after router.refresh)
  // Uses the "adjusting state during render" pattern instead of useEffect
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  if (initialAvatarUrl !== prevInitialAvatar) {
    setPrevInitialAvatar(initialAvatarUrl)
    setCustomAvatar(initialAvatarUrl ?? null)
  }

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      // Load custom avatar from profile (only if not provided server-side)
      if (user && !initialAvatarUrl) {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.access_token) {
            api.profiles.getMe(session.access_token).then((profile) => {
              if (profile.avatarUrl) setCustomAvatar(profile.avatarUrl)
            }).catch(() => {})
          }
        })
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      },
    )

    return () => subscription.unsubscribe()
  }, [initialAvatarUrl])

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Usuario"
  const googleAvatar = user?.user_metadata?.avatar_url
  const userInitials = userName.charAt(0).toUpperCase()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/empresas?search=${encodeURIComponent(searchQuery.trim())}`)
      setMobileSearchOpen(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Primary Header Bar */}
      <div className="border-b border-border/40">
        <div className="mx-auto max-w-7xl flex h-14 items-center gap-3 px-4 sm:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <EmpliqLogo className="h-7 w-auto text-foreground" />
          </Link>

          {/* Search - Desktop */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md mx-auto hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar empresa o puesto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 bg-muted/50 border-0 focus-visible:ring-1"
              />
            </div>
          </form>

          {/* Right side */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-auto">
            {/* Currency & Language Selector */}
            <CurrencyLanguageSelector />

            {/* Mobile Search Toggle */}
            <button
              className="sm:hidden p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-colors"
              onClick={() => {
                setMobileSearchOpen(!mobileSearchOpen)
                setTimeout(() => searchInputRef.current?.focus(), 100)
              }}
            >
              <Search className="h-4 w-4" />
            </button>

            {/* Notifications */}
            <button className="relative p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-colors">
              <Bell className="h-4 w-4" />
            </button>

            {/* User */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 rounded-full hover:bg-accent p-1 transition-colors"
                >
                  {/* Anonymous avatar only */}
                  <Avatar className="h-8 w-8">
                    {customAvatar ? (
                      <AvatarImage src={customAvatar} alt="Avatar anonimo" />
                    ) : (
                      <AvatarFallback className="text-xs bg-neutral-200">
                        {userInitials}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-popover rounded-lg border border-border/60 shadow-md z-50">
                      {/* User info */}
                      <div className="px-4 py-3 border-b border-border/60">
                        <div className="flex items-center gap-3 mb-2">
                          {customAvatar && (
                            <img src={customAvatar} alt="Avatar anonimo" className="h-8 w-8 rounded-lg border border-border/40" />
                          )}
                          <div>
                            <p className="text-sm font-medium">{userName}</p>

                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>

                      {/* Navigation */}
                      <div className="py-1">
                        <Link
                          href="/configuracion"
                          onClick={() => setUserMenuOpen(false)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        >
                          <Settings className="h-4 w-4" />
                          Configuracion
                        </Link>
                      </div>

                      {/* Sign out */}
                      <div className="border-t border-border/60 py-1">
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-accent transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          Cerrar sesion
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                  <Link href="/login">Iniciar sesion</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/login">
                    <User className="h-4 w-4 sm:hidden" />
                    <span className="hidden sm:inline">Registrarse</span>
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search Expanded */}
        {mobileSearchOpen && (
          <div className="sm:hidden px-4 pb-3">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  placeholder="Buscar empresa o puesto..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 bg-muted/50 border-0 focus-visible:ring-1"
                />
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Secondary Navigation Bar */}
      <div className="border-b border-border/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <nav className="flex gap-0">
            <Link
              href="/salarios"
              className={cn(
                "relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors",
                pathname.startsWith("/salarios")
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <DollarSign className="h-3.5 w-3.5" />
              Salarios
            </Link>
            <Link
              href="/empresas"
              className={cn(
                "relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors",
                pathname.startsWith("/empresas")
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Building2 className="h-3.5 w-3.5" />
              Empresas
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}

