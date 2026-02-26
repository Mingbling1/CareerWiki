"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect, useTransition } from "react"
import {
  ArrowLeft,
  User,
  Bell,
  Shield,
  Globe,
  Moon,
  Sun,
  CreditCard,
  HelpCircle,
  ExternalLink,
  Loader2,
  Check,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase/client"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import type { LucideIcon } from "lucide-react"

/* ─── Types ─── */

type Section =
  | "perfil"
  | "notificaciones"
  | "privacidad"
  | "apariencia"
  // | "plan"
  // | "ayuda"

interface MenuItem {
  id: Section
  label: string
  description: string
  icon: LucideIcon
}

const menuItems: MenuItem[] = [
  { id: "perfil", label: "Perfil", description: "Nombre, email, foto", icon: User },
  { id: "notificaciones", label: "Notificaciones", description: "Alertas y preferencias", icon: Bell },
  { id: "privacidad", label: "Privacidad", description: "Visibilidad de datos", icon: Shield },
  { id: "apariencia", label: "Apariencia", description: "Tema e idioma", icon: Moon },
  // { id: "plan", label: "Plan", description: "Tu suscripcion actual", icon: CreditCard },
  // { id: "ayuda", label: "Ayuda", description: "Soporte y recursos", icon: HelpCircle },
]

/* ─── Toggle ─── */

const AVATAR_OPTIONS = [
  "/illustrations/avatars/avatar_2094458_01.png",
  "/illustrations/avatars/avatar_2094458_02.png",
  "/illustrations/avatars/avatar_2094458_03.png",
  "/illustrations/avatars/avatar_2094458_04.png",
  "/illustrations/avatars/avatar_2094458_05.png",
  "/illustrations/avatars/avatar_2094458_06.png",
  "/illustrations/avatars/avatar_2094458_07.png",
  "/illustrations/avatars/avatar_2094458_08.png",
  "/illustrations/avatars/avatar_2094458_09.png",
  "/illustrations/avatars/avatar_four_happy_women_portraits_black_white_1089355_401.png",
  "/illustrations/avatars/avatar_Gemini_Generated_Image_vlmic5vlmic5vlmi_01.png",
  "/illustrations/avatars/avatar_Gemini_Generated_Image_vlmic5vlmic5vlmi_02.png",
  "/illustrations/avatars/avatar_Gemini_Generated_Image_vlmic5vlmic5vlmi_03.png",
  "/illustrations/avatars/avatar_Gemini_Generated_Image_vlmic5vlmic5vlmi_04.png",
  "/illustrations/avatars/avatar_people_communicating_various_ways_phone_call_laptop_chat_discussion_675502_1390_01.png",
  "/illustrations/avatars/avatar_people_communicating_various_ways_phone_call_laptop_chat_discussion_675502_1390_02.png",
  "/illustrations/avatars/avatar_people_communicating_various_ways_phone_call_laptop_chat_discussion_675502_1390_03.png",
  "/illustrations/avatars/avatar_people_communicating_various_ways_phone_call_laptop_chat_discussion_675502_1390_04.png",
  "/illustrations/avatars/avatar_people_communicating_various_ways_phone_call_laptop_chat_discussion_675502_1390_05.png",
  "/illustrations/avatars/avatar_people_communicating_various_ways_phone_call_laptop_chat_discussion_675502_1390_06.png",
  "/illustrations/avatars/avatar_women_emotions_monochrome_flat_linear_character_heads_set_151150_15217_01.png",
  "/illustrations/avatars/avatar_women_emotions_monochrome_flat_linear_character_heads_set_151150_15217_02.png",
  "/illustrations/avatars/avatar_women_emotions_monochrome_flat_linear_character_heads_set_151150_15217_03.png",
  "/illustrations/avatars/avatar_women_emotions_monochrome_flat_linear_character_heads_set_151150_15217_04.png",
]

function Toggle({
  enabled,
  onToggle,
  disabled,
}: {
  enabled: boolean
  onToggle: () => void
  disabled?: boolean
}) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors",
        enabled ? "bg-foreground" : "bg-muted-foreground/30",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 rounded-full bg-background transition-transform mt-0.5",
          enabled ? "translate-x-4 ml-0.5" : "translate-x-0.5"
        )}
      />
    </button>
  )
}

/* ─── Section: Perfil ─── */

function PerfilSection({ user }: { user: SupabaseUser | null }) {
  const router = useRouter()
  const userName = user?.user_metadata?.full_name || ""
  const userAvatar = user?.user_metadata?.avatar_url
  const userEmail = user?.email || ""
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null)
  const [savedAvatar, setSavedAvatar] = useState<string | null>(null)
  const [nickname, setNickname] = useState("")
  const [savedNickname, setSavedNickname] = useState("")
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [nicknameError, setNicknameError] = useState<string | null>(null)

  // Load current profile avatar from API
  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.access_token) return
      api.profiles.getMe(session.access_token).then((profile) => {
        if (profile.avatarUrl) {
          setSelectedAvatar(profile.avatarUrl)
          setSavedAvatar(profile.avatarUrl)
        }
        if (profile.nickname) {
          setNickname(profile.nickname)
          setSavedNickname(profile.nickname)
        }
      }).catch(() => {})
    })
  }, [user])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    setSaveSuccess(false)
    setNicknameError(null)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      // Save avatar if changed
      if (selectedAvatar && selectedAvatar !== savedAvatar) {
        await api.profiles.updateAvatar(session.access_token, selectedAvatar)
        setSavedAvatar(selectedAvatar)
      }

      // Save nickname if changed
      if (nickname !== savedNickname && nickname.length >= 3) {
        await api.profiles.updateNickname(session.access_token, nickname)
        setSavedNickname(nickname)
      }

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)

      // Invalidate server-side cache & refresh to sync header
      const { revalidateProfile } = await import("@/app/(app)/actions")
      await revalidateProfile()
      router.refresh()
    } catch (err: any) {
      if (err?.message?.includes("nickname") || err?.message?.includes("Nickname")) {
        setNicknameError("Ese nickname ya está en uso")
      } else {
        console.error("Error saving profile:", err)
      }
    } finally {
      setSaving(false)
    }
  }

  const handleNicknameChange = (value: string) => {
    setNicknameError(null)
    setNickname(value)
  }

  const avatarChanged = selectedAvatar !== savedAvatar && selectedAvatar !== null
  const nicknameChanged = nickname !== savedNickname && nickname.length >= 3
  const hasChanges = avatarChanged || nicknameChanged

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Perfil</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Administra tu información personal
        </p>
      </div>

      <Separator />

      {/* Avatar actual */}
      <div className="flex items-center gap-4">
        {/* Google avatar — logged-in indicator */}
        <Avatar className="h-14 w-14">
          {userAvatar ? (
            <AvatarImage src={userAvatar} alt={userName} />
          ) : (
            <AvatarFallback className="text-lg bg-muted">
              {userName.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          )}
        </Avatar>
        {/* Custom anonymous avatar */}
        <Avatar className="h-14 w-14 border-2 border-border/60">
          {selectedAvatar ? (
            <AvatarImage src={selectedAvatar} alt="Avatar anonimo" />
          ) : (
            <AvatarFallback className="text-xs bg-muted text-muted-foreground">
              Anon
            </AvatarFallback>
          )}
        </Avatar>
        <div>
          <p className="text-sm font-medium">{userName || "Usuario"}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4 shrink-0">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <p className="text-xs text-muted-foreground">
              Verificado con Google
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tu avatar anonimo es visible publicamente
          </p>
        </div>
      </div>

      {/* Avatar Picker */}
      <div className="space-y-3">
        <div>
          <Label className="text-sm">Elige tu avatar</Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Selecciona una ilustración para tu perfil público
          </p>
        </div>
        <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-w-lg">
          {AVATAR_OPTIONS.map((src) => (
            <button
              key={src}
              onClick={() => setSelectedAvatar(src)}
              className={cn(
                "relative h-12 w-12 rounded-lg overflow-hidden border-2 transition-all hover:scale-105",
                selectedAvatar === src
                  ? "border-foreground ring-2 ring-foreground/20"
                  : "border-border/40 hover:border-border"
              )}
            >
              <img
                src={src}
                alt="Avatar"
                className="h-full w-full object-cover"
              />
              {selectedAvatar === src && (
                <div className="absolute inset-0 bg-foreground/10 flex items-center justify-center">
                  <Check className="h-4 w-4 text-foreground" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Form fields */}
      <div className="space-y-4 max-w-md">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm">Nombre completo</Label>
          <Input
            id="name"
            defaultValue={userName}
            className="bg-muted/50 border-border/60"
            disabled
          />
          <p className="text-xs text-muted-foreground">
            Sincronizado desde tu cuenta de Google
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm">Correo electronico</Label>
          <Input
            id="email"
            defaultValue={userEmail}
            className="bg-muted/50 border-border/60"
            disabled
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nickname" className="text-sm">Nickname</Label>
          <Input
            id="nickname"
            value={nickname}
            onChange={(e) => handleNicknameChange(e.target.value)}
            placeholder="Ej: VelozCóndor4521"
            className={cn(
              "bg-muted/50 border-border/60",
              nicknameError && "border-red-500 focus-visible:ring-red-500"
            )}
            maxLength={30}
          />
          {nicknameError ? (
            <p className="text-xs text-red-500">{nicknameError}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Visible en tus reseñas. Mínimo 3 caracteres.
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          size="sm"
          disabled={!hasChanges || saving}
          onClick={handleSave}
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Guardando...
            </>
          ) : (
            "Guardar cambios"
          )}
        </Button>
        {saveSuccess && (
          <p className="text-xs text-green-600 font-medium">
            Cambios guardados correctamente
          </p>
        )}
      </div>
    </div>
  )
}

/* ─── Section: Notificaciones ─── */

function NotificacionesSection() {
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [salaryAlerts, setSalaryAlerts] = useState(false)
  const [reviewAlerts, setReviewAlerts] = useState(false)
  const [weeklyDigest, setWeeklyDigest] = useState(true)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Notificaciones</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Elige que alertas quieres recibir
        </p>
      </div>

      <Separator />

      <div className="space-y-5 max-w-lg">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Notificaciones por email</p>
            <p className="text-xs text-muted-foreground">
              Recibe actualizaciones en tu correo
            </p>
          </div>
          <Toggle enabled={emailNotifs} onToggle={() => setEmailNotifs(!emailNotifs)} />
        </div>

        <Separator />

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Alertas de salarios</p>
            <p className="text-xs text-muted-foreground">
              Cuando se publican nuevos salarios en empresas que sigues
            </p>
          </div>
          <Toggle enabled={salaryAlerts} onToggle={() => setSalaryAlerts(!salaryAlerts)} />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Alertas de reseñas</p>
            <p className="text-xs text-muted-foreground">
              Cuando hay nuevas reseñas de empresas que sigues
            </p>
          </div>
          <Toggle enabled={reviewAlerts} onToggle={() => setReviewAlerts(!reviewAlerts)} />
        </div>

        <Separator />

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Resumen semanal</p>
            <p className="text-xs text-muted-foreground">
              Un resumen de las novedades de la semana
            </p>
          </div>
          <Toggle enabled={weeklyDigest} onToggle={() => setWeeklyDigest(!weeklyDigest)} />
        </div>
      </div>

      <p className="text-xs text-muted-foreground italic">
        Las preferencias se guardarán automáticamente (próximamente)
      </p>
    </div>
  )
}

/* ─── Section: Privacidad ─── */

function PrivacidadSection() {
  const [publicProfile, setPublicProfile] = useState(false)
  const [showSalary, setShowSalary] = useState(false)
  const [showCompany, setShowCompany] = useState(true)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Privacidad</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Controla la visibilidad de tu información
        </p>
      </div>

      <Separator />

      <div className="space-y-5 max-w-lg">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Perfil público</p>
            <p className="text-xs text-muted-foreground">
              Otros usuarios pueden ver tu perfil
            </p>
          </div>
          <Toggle enabled={publicProfile} onToggle={() => setPublicProfile(!publicProfile)} />
        </div>

        <Separator />

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Mostrar salario en reseñas</p>
            <p className="text-xs text-muted-foreground">
              Tu salario reportado será visible en la empresa
            </p>
          </div>
          <Toggle enabled={showSalary} onToggle={() => setShowSalary(!showSalary)} />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Mostrar empresa actual</p>
            <p className="text-xs text-muted-foreground">
              Tu empresa aparecera en tu perfil
            </p>
          </div>
          <Toggle enabled={showCompany} onToggle={() => setShowCompany(!showCompany)} />
        </div>
      </div>

      <Separator />

      <div className="max-w-lg">
        <h3 className="text-sm font-medium text-destructive">Zona de peligro</h3>
        <p className="text-xs text-muted-foreground mt-1 mb-3">
          Estas acciones son irreversibles
        </p>
        <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10" disabled>
          Eliminar cuenta
        </Button>
      </div>
    </div>
  )
}

/* ─── Section: Apariencia ─── */

function AparienciaSection() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light")

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Apariencia</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Personaliza como se ve Empliq
        </p>
      </div>

      <Separator />

      <div className="space-y-4 max-w-md">
        <Label className="text-sm">Tema</Label>
        <div className="grid grid-cols-3 gap-3">
          {([
            { id: "light" as const, label: "Claro", icon: Sun },
            { id: "dark" as const, label: "Oscuro", icon: Moon },
            { id: "system" as const, label: "Sistema", icon: Globe },
          ]).map((option) => (
            <button
              key={option.id}
              onClick={() => setTheme(option.id)}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
                theme === option.id
                  ? "border-foreground bg-muted/50"
                  : "border-border/60 hover:border-border hover:bg-muted/30"
              )}
            >
              <option.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{option.label}</span>
              {theme === option.id && (
                <Check className="h-3.5 w-3.5 text-foreground" />
              )}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Por ahora solo disponible en modo claro
        </p>
      </div>

      <Separator />

      <div className="space-y-2 max-w-md">
        <Label className="text-sm">Idioma</Label>
        <div className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-muted/30">
          <span className="text-lg">🇵🇪</span>
          <div className="flex-1">
            <p className="text-sm font-medium">Español (Perú)</p>
            <p className="text-xs text-muted-foreground">Único idioma disponible</p>
          </div>
          <Check className="h-4 w-4 text-foreground" />
        </div>
      </div>

      <div className="space-y-2 max-w-md">
        <Label className="text-sm">Moneda</Label>
        <div className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-muted/30">
          <span className="text-lg">🇵🇪</span>
          <div className="flex-1">
            <p className="text-sm font-medium">PEN – S/. Sol Peruano</p>
            <p className="text-xs text-muted-foreground">Unica moneda disponible</p>
          </div>
          <Check className="h-4 w-4 text-foreground" />
        </div>
      </div>
    </div>
  )
}

/* ─── Section: Plan ─── */

function PlanSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Plan</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Tu suscripcion y limites de uso
        </p>
      </div>

      <Separator />

      {/* Current plan */}
      <div className="max-w-md p-5 rounded-xl border border-border/60 bg-muted/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Plan Gratuito</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Acceso basico a salarios y empresas
            </p>
          </div>
          <span className="text-xs font-medium bg-muted px-2 py-1 rounded-full">
            Activo
          </span>
        </div>

        <Separator className="my-4" />

        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Busquedas por dia</span>
            <span className="font-medium text-foreground">Ilimitadas</span>
          </div>
          <div className="flex justify-between">
            <span>Empresas visibles</span>
            <span className="font-medium text-foreground">Todas</span>
          </div>
          <div className="flex justify-between">
            <span>Filtros avanzados</span>
            <span className="font-medium text-muted-foreground">Próximamente</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Los planes de pago estarán disponibles próximamente
      </p>
    </div>
  )
}

/* ─── Section: Ayuda ─── */

function AyudaSection() {
  const links = [
    {
      label: "Preguntas frecuentes",
      description: "Encuentra respuestas rapidas",
      href: "#",
    },
    {
      label: "Centro de ayuda",
      description: "Guias y tutoriales",
      href: "#",
    },
    {
      label: "Reportar un problema",
      description: "Enviar feedback o reportar errores",
      href: "#",
    },
    {
      label: "Contactar soporte",
      description: "Escríbenos directamente",
      href: "mailto:soporte@empliq.io",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Ayuda</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Soporte y recursos para usar Empliq
        </p>
      </div>

      <Separator />

      <div className="space-y-2 max-w-md">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
          >
            <div>
              <p className="text-sm font-medium group-hover:text-foreground">
                {link.label}
              </p>
              <p className="text-xs text-muted-foreground">{link.description}</p>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
          </a>
        ))}
      </div>

      <Separator />

      <div className="max-w-md">
        <p className="text-xs text-muted-foreground">
          Empliq v1.0 — Hecho con dedicación en Perú 🇵🇪
        </p>
      </div>
    </div>
  )
}

/* ─── Settings Page Shell ─── */

export function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState<Section>("perfil")

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar skeleton */}
          <div className="hidden md:block w-56 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full rounded-lg" />
            ))}
          </div>
          {/* Content skeleton */}
          <div className="flex-1 space-y-6">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-px w-full" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    )
  }

  const renderSection = () => {
    switch (activeSection) {
      case "perfil":
        return <PerfilSection user={user} />
      case "notificaciones":
        return <NotificacionesSection />
      case "privacidad":
        return <PrivacidadSection />
      case "apariencia":
        return <AparienciaSection />
      // case "plan":
      //   return <PlanSection />
      // case "ayuda":
      //   return <AyudaSection />
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </button>

      <h1 className="text-2xl font-bold tracking-tight mb-1">Configuracion</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Administra tu cuenta y preferencias
      </p>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar menu */}
        <nav className="md:w-56 shrink-0 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left",
                activeSection === item.id
                  ? "bg-muted font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <div className="min-w-0">
                <span className="block">{item.label}</span>
                <span className="text-xs text-muted-foreground font-normal hidden md:block">
                  {item.description}
                </span>
              </div>
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="rounded-xl border border-border/40 bg-card p-6 sm:p-8">
            {renderSection()}
          </div>
        </div>
      </div>
    </div>
  )
}
