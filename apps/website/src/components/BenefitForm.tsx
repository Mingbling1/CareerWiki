"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Heart,
  Send,
  Check,
  Shield,
  Wallet,
  Gift,
  Baby,
  Clock,
  GraduationCap,
  Bus,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"
import { getAuthToken } from "@/lib/auth-helpers"
import { sileo } from "sileo"

/* ─── Benefit Categories & Known Benefits ─── */

interface BenefitCategory {
  name: string
  icon: LucideIcon
  benefits: string[]
}

const BENEFIT_CATEGORIES: BenefitCategory[] = [
  {
    name: "Salud y Seguro",
    icon: Shield,
    benefits: [
      "EPS (Seguro de salud)",
      "Seguro dental",
      "Seguro de vida",
      "Seguro oncológico",
      "Salud mental / Psicólogo",
      "Chequeo médico anual",
      "Seguro para familiares",
      "EPS con cobertura al 100%",
      "Seguro de accidentes",
    ],
  },
  {
    name: "Financiero y Retiro",
    icon: Wallet,
    benefits: [
      "Bono anual por desempeño",
      "Utilidades",
      "AFP complementaria",
      "Préstamos personales",
      "Bono de productividad",
      "Gratificación completa",
      "CTS completa",
      "Adelanto de sueldo",
      "Bono por referidos",
    ],
  },
  {
    name: "Tiempo Libre",
    icon: Clock,
    benefits: [
      "Vacaciones adicionales",
      "Día libre por cumpleaños",
      "Viernes corto",
      "Horario flexible",
      "Trabajo remoto / Home office",
      "Trabajo híbrido",
      "Semana comprimida",
      "Días libres por mudanza",
      "Permiso por trámites personales",
    ],
  },
  {
    name: "Familia",
    icon: Baby,
    benefits: [
      "Licencia maternal extendida",
      "Licencia paternal extendida",
      "Guardería / Nido subvencionado",
      "Seguro familiar",
      "Bono escolar",
      "Bono por nacimiento",
      "Bono navideño para hijos",
      "Lactario",
    ],
  },
  {
    name: "Desarrollo Profesional",
    icon: GraduationCap,
    benefits: [
      "Capacitaciones pagadas",
      "Certificaciones profesionales",
      "Subsidio de educación / Maestría",
      "Presupuesto para conferencias",
      "Acceso a plataformas de aprendizaje",
      "Plan de carrera",
      "Mentoría",
      "Cursos de idiomas",
      "Biblioteca corporativa",
    ],
  },
  {
    name: "Alimentación y Transporte",
    icon: Bus,
    benefits: [
      "Vales de alimentos",
      "Comedor / Almuerzo subsidiado",
      "Movilidad / Transporte",
      "Estacionamiento gratuito",
      "Bono de alimentación",
      "Snacks y bebidas gratis",
      "Cafetería",
    ],
  },
  {
    name: "Perks y Bienestar",
    icon: Gift,
    benefits: [
      "Gimnasio / Membresía fitness",
      "Descuentos corporativos",
      "Happy hours",
      "Actividades de team building",
      "Sala de juegos / Recreación",
      "Clases de yoga / Meditación",
      "Programa de bienestar",
      "Ropa corporativa",
      "Celular corporativo",
      "Laptop corporativa",
    ],
  },
]

/* ─── Fuzzy Match ─── */

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
}

function fuzzyMatch(query: string, target: string): boolean {
  const q = normalize(query)
  const t = normalize(target)
  if (t.includes(q)) return true

  // Word-level match
  const queryWords = q.split(/\s+/)
  return queryWords.every((qw) =>
    t.split(/\s+/).some((tw) => tw.startsWith(qw) || tw.includes(qw))
  )
}

/* ─── Schema ─── */

const benefitSchema = z.object({
  category: z.string().min(1, "Selecciona una categoría"),
  name: z.string().min(2, "Ingresa el nombre del beneficio").max(120),
  description: z.string().max(500).optional(),
})

type BenefitFormData = z.infer<typeof benefitSchema>

/* ─── Benefit Name Combobox ─── */

interface BenefitComboboxProps {
  value: string
  onChange: (value: string) => void
  category: string
  error?: string
}

function BenefitNameCombobox({ value, onChange, category, error }: BenefitComboboxProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setQuery(value)
  }, [value])

  const suggestions = useMemo(() => {
    if (!category) return []

    const cat = BENEFIT_CATEGORIES.find((c) => c.name === category)
    if (!cat) return []

    if (!query || query.length < 1) return cat.benefits.slice(0, 6)

    return cat.benefits.filter((b) => fuzzyMatch(query, b)).slice(0, 6)
  }, [query, category])

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        listRef.current &&
        !listRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  return (
    <div className="relative">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
        Beneficio
      </label>
      <div className="relative">
        <Heart className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            onChange(e.target.value)
            setOpen(true)
          }}
          onFocus={() => category && setOpen(true)}
          placeholder={category ? "Ej: EPS, Bono anual..." : "Primero selecciona una categoría"}
          disabled={!category}
          className="pl-9 h-9 text-sm bg-muted/30 border-border/60"
          autoComplete="off"
        />
      </div>

      {/* Suggestions dropdown */}
      {open && suggestions.length > 0 && (
        <div
          ref={listRef}
          className="absolute z-50 mt-1 w-full rounded-lg border border-border/40 bg-card shadow-lg overflow-hidden"
        >
          <div className="max-h-50 overflow-y-auto py-1">
            {suggestions.map((s, i) => {
              const isSelected = normalize(value) === normalize(s)
              return (
                <button
                  key={`${s}-${i}`}
                  type="button"
                  onClick={() => {
                    onChange(s)
                    setQuery(s)
                    setOpen(false)
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors",
                    isSelected && "bg-muted/30"
                  )}
                >
                  <span className="flex-1 truncate">{s}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-foreground shrink-0" />}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  )
}

/* ─── Benefit Form ─── */

interface BenefitFormProps {
  companyId: string
  companyName: string
  onSuccess?: () => void
}

export function BenefitForm({ companyId, companyName, onSuccess }: BenefitFormProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<BenefitFormData>({
    resolver: zodResolver(benefitSchema),
    defaultValues: {
      category: "",
      name: "",
      description: "",
    },
  })

  const category = watch("category")
  const benefitName = watch("name")

  const onSubmit = async (data: BenefitFormData) => {
    setSubmitting(true)
    try {
      const token = await getAuthToken()

      await api.benefits.add(token, {
        companyId,
        name: data.name,
        category: data.category,
        description: data.description || undefined,
      })

      setSubmitted(true)
      reset()
      onSuccess?.()
      setTimeout(() => {
        setSubmitted(false)
        setIsExpanded(false)
      }, 3000)
    } catch (err) {
      const msg = err instanceof Error && err.message === "NO_AUTH"
        ? "Inicia sesi\u00f3n para reportar beneficios."
        : "Hubo un problema al guardar el beneficio. Intenta de nuevo."
      sileo.error({ title: "Error", description: msg })
    } finally {
      setSubmitting(false)
    }
  }

  /* ─── Success state ─── */
  if (submitted) {
    return (
      <div className="rounded-xl border border-border/40 bg-muted/20 p-6 text-center">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-foreground/5 mb-3">
          <Heart className="h-6 w-6 text-foreground" />
        </div>
        <h3 className="font-semibold text-sm">¡Gracias por reportar este beneficio!</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Tu aporte ayuda a otros profesionales a conocer mejor esta empresa.
        </p>
      </div>
    )
  }

  /* ─── Collapsed prompt ─── */
  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full rounded-xl border border-border/40 bg-card hover:bg-muted/30 p-5 transition-all group text-left"
      >
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
            <Heart className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              ¿Conoces los beneficios de {companyName}? Comparte la información...
            </p>
          </div>
          <span className="text-xs text-muted-foreground/50 hidden sm:block">
            Anónimo
          </span>
        </div>
      </button>
    )
  }

  /* ─── Expanded form ─── */
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-xl border border-border/40 bg-card overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-0">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Reportar beneficio en {companyName}</h3>
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>

      <div className="px-5 py-4 space-y-5">
        {/* Category selector */}
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
            Categoría
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {BENEFIT_CATEGORIES.map((cat) => {
              const Icon = cat.icon
              const isSelected = category === cat.name
              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => {
                    setValue("category", isSelected ? "" : cat.name, { shouldValidate: true })
                    // Reset benefit name when switching category
                    if (!isSelected) {
                      setValue("name", "")
                    }
                  }}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-3 rounded-lg border text-center transition-colors",
                    isSelected
                      ? "bg-foreground text-background border-foreground"
                      : "bg-muted/30 text-muted-foreground border-border/60 hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-[10px] font-medium leading-tight">
                    {cat.name}
                  </span>
                </button>
              )
            })}
          </div>
          {errors.category && (
            <p className="text-xs text-destructive mt-1.5">{errors.category.message}</p>
          )}
        </div>

        {/* Benefit name with autocomplete */}
        <BenefitNameCombobox
          value={benefitName}
          onChange={(v) => setValue("name", v, { shouldValidate: true })}
          category={category}
          error={errors.name?.message}
        />

        {/* Optional description */}
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
            Descripción{" "}
            <span className="text-muted-foreground/50 normal-case tracking-normal">(opcional)</span>
          </label>
          <Textarea
            {...register("description")}
            placeholder="Agrega detalles sobre este beneficio, ej: cobertura, condiciones..."
            className="min-h-20 text-sm bg-muted/30 border-border/60 resize-none"
          />
          {errors.description && (
            <p className="text-xs text-destructive mt-1">{errors.description.message}</p>
          )}
        </div>
      </div>

      {/* Submit bar */}
      <div className="px-5 py-3 bg-muted/20 border-t border-border/40 flex items-center justify-between">
        <p className="text-[11px] text-muted-foreground hidden sm:block">
          Tu identidad nunca será revelada
        </p>
        <Button
          type="submit"
          size="sm"
          disabled={submitting}
          className="gap-2"
        >
          {submitting ? (
            "Enviando..."
          ) : (
            <>
              <Send className="h-3.5 w-3.5" />
              Reportar beneficio
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
