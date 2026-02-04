import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { EmpliqLogo } from '@/components/EmpliqLogo'
import { Search, LogOut, User, Settings, Bell, Home, Briefcase, Calendar, MessageSquare } from 'lucide-react'
import { useState } from 'react'
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarBadge,
} from '@/components/ui/avatar'
import { ThemeToggle } from '@/components/ui/theme-toggle'

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Jobs', href: '/jobs', icon: Briefcase },
  { name: 'Matches', href: '/matches', icon: MessageSquare },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
]

export function DashboardLayout() {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const userName = user?.name || user?.email?.split('@')[0] || 'Usuario'
  const userInitials = userName.charAt(0).toUpperCase()

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-card/90 backdrop-blur-xl border-b border-border z-50">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          {/* Left side - Logo + Nav */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <EmpliqLogo className="h-8 w-auto text-foreground transition-transform group-hover:scale-105" />
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href || 
                  (item.href !== '/' && location.pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Center Search */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search here..."
                className="w-full bg-secondary rounded-lg pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
              />
            </div>
          </div>

          {/* Right side - Post Job + icons + user */}
          <div className="flex items-center gap-3">
            {/* Post Job Button */}
            <Link
              to="/post-job"
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors"
            >
              Post Job
            </Link>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Icon buttons */}
            <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors">
              <MessageSquare className="w-5 h-5" />
            </button>
            <button className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
            </button>
            <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors">
              <Calendar className="w-5 h-5" />
            </button>

            {/* User Menu */}
            <div className="relative ml-2">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-accent transition-colors"
              >
                <Avatar size="sm">
                  {user?.image ? (
                    <AvatarImage src={user.image} alt={userName} />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-xs">
                      {userInitials}
                    </AvatarFallback>
                  )}
                  <AvatarBadge className="bg-green-500" />
                </Avatar>
              </button>

              {/* Dropdown */}
              {userMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setUserMenuOpen(false)} 
                  />
                  <div className="absolute right-0 top-full mt-2 w-64 bg-popover rounded-xl overflow-hidden shadow-xl border border-border z-50">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-medium text-foreground">{userName}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                    <div className="py-1">
                      <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                        <User className="w-4 h-4" />
                        Mi Perfil
                      </button>
                      <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                        <Settings className="w-4 h-4" />
                        Configuración
                      </button>
                    </div>
                    <div className="border-t border-border py-1">
                      <button
                        onClick={signOut}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:text-destructive hover:bg-accent transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content - no sidebar */}
      <main className="pt-20">
        <Outlet />
      </main>
    </div>
  )
}
