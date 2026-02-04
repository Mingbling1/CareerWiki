import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import {
  ThemeToggler,
  type ThemeSelection,
} from '@/components/animate-ui/primitives/effects/theme-toggler'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  
  // Determine resolved theme (for system preference)
  const resolvedTheme = theme === 'system' 
    ? (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme

  const modes: ThemeSelection[] = ['light', 'dark', 'system']

  const getNextTheme = (current: ThemeSelection): ThemeSelection => {
    const i = modes.indexOf(current)
    if (i === -1) return modes[0]
    return modes[(i + 1) % modes.length]
  }

  const getIcon = (effective: ThemeSelection, resolved: 'dark' | 'light') => {
    const theme = modes.includes('system') ? effective : resolved
    return theme === 'system' ? (
      <Monitor className="h-5 w-5" />
    ) : theme === 'dark' ? (
      <Moon className="h-5 w-5" />
    ) : (
      <Sun className="h-5 w-5" />
    )
  }

  return (
    <ThemeToggler
      theme={theme as ThemeSelection}
      resolvedTheme={resolvedTheme as 'dark' | 'light'}
      setTheme={setTheme}
      direction="ltr"
    >
      {({ effective, resolved, toggleTheme }) => (
        <button
          className="relative h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          onClick={() => toggleTheme(getNextTheme(effective))}
          aria-label="Toggle theme"
        >
          {getIcon(effective, resolved)}
        </button>
      )}
    </ThemeToggler>
  )
}
