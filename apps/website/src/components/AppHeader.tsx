"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, LogOut, User, Menu, X, Bell } from "lucide-react"
import { useState, useEffect } from "react"
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
import type { User as SupabaseUser } from "@supabase/supabase-js"

const navigation = [
  { name: "Salarios", href: "/salarios" },
  { name: "Empresas", href: "/empresas" },
]

export function AppHeader() {
  const pathname = usePathname()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      },
    )

    return () => subscription.unsubscribe()
  }, [])

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Usuario"
  const userAvatar = user?.user_metadata?.avatar_url
  const userInitials = userName.charAt(0).toUpperCase()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl flex h-14 items-center gap-4 px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <EmpliqLogo className="h-7 w-auto text-foreground" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 ml-4">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "relative px-3 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "text-foreground after:absolute after:bottom-[-13px] after:left-0 after:right-0 after:h-[2px] after:bg-foreground after:rounded-full"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Search - Center */}
        <div className="flex-1 max-w-md mx-auto hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar empresa o puesto..."
              className="pl-9 h-9 bg-muted/50 border-0 focus-visible:ring-1"
            />
          </div>
        </div>

        {/* Currency Selector */}
        <div className="hidden sm:flex items-center gap-1 shrink-0">
          <span className="text-xs text-muted-foreground font-medium">S/</span>
          <span className="text-xs text-muted-foreground">PEN / mes</span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Notifications */}
          <button className="relative p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-colors">
            <Bell className="h-4 w-4" />
          </button>
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-full hover:bg-accent p-1 transition-colors"
              >
                <Avatar className="h-8 w-8">
                  {userAvatar ? (
                    <AvatarImage src={userAvatar} alt={userName} />
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
                    <div className="px-4 py-3 border-b border-border/60">
                      <p className="text-sm font-medium">{userName}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                    <div className="py-1">
                      <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                        <User className="h-4 w-4" />
                        Mi Perfil
                      </button>
                    </div>
                    <div className="border-t border-border/60 py-1">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-accent transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Iniciar sesión</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/login">Registrarse</Link>
              </Button>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/40">
          <div className="px-4 py-3 space-y-1">
            {/* Mobile Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar empresa o puesto..."
                className="pl-9 h-9 bg-muted/50 border-0"
              />
            </div>
            {navigation.map((item) => {
              const isActive =
                pathname === item.href ||
                pathname.startsWith(item.href + "/")
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "block px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  {item.name}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </header>
  )
}
