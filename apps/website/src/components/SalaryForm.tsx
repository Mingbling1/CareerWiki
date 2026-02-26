"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  DollarSign,
  Send,
  Check,
  Briefcase,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { api, type Position } from "@/lib/api"
import { getAuthToken } from "@/lib/auth-helpers"
import { sileo } from "sileo"

/* ─── Curated Job Titles (Perú) ─── */

const COMMON_JOB_TITLES: Record<string, string[]> = {
  "Tecnología": [
    "Desarrollador Full Stack",
    "Desarrollador Frontend",
    "Desarrollador Backend",
    "Desarrollador Móvil",
    "Ingeniero DevOps",
    "Ingeniero de Datos",
    "Analista de Datos",
    "Científico de Datos",
    "Arquitecto de Software",
    "Arquitecto de Soluciones",
    "Tech Lead",
    "QA Engineer",
    "Analista de Sistemas",
    "Administrador de Base de Datos",
    "Scrum Master",
    "Product Manager",
    "Product Owner",
    "UX Designer",
    "UI Designer",
    "Ingeniero de Seguridad Informática",
  ],
  "Finanzas": [
    "Analista Financiero",
    "Controller Financiero",
    "Contador General",
    "Tesorero",
    "Auditor Interno",
    "Auditor Externo",
    "Analista de Riesgos",
    "Analista de Créditos",
    "Jefe de Contabilidad",
    "Gerente de Finanzas",
  ],
  "Marketing y Ventas": [
    "Gerente de Marketing",
    "Ejecutivo de Ventas",
    "Community Manager",
    "Brand Manager",
    "Analista de Marketing Digital",
    "Key Account Manager",
    "Ejecutivo Comercial",
    "Gerente Comercial",
    "Coordinador de Marketing",
    "Diseñador Gráfico",
  ],
  "RRHH": [
    "Gerente de RRHH",
    "Analista de Compensaciones",
    "Recruiter",
    "Business Partner RRHH",
    "Jefe de Selección",
    "Analista de Nóminas",
    "Coordinador de Capacitación",
    "Especialista en Bienestar",
  ],
  "Operaciones": [
    "Gerente de Operaciones",
    "Jefe de Logística",
    "Supervisor de Producción",
    "Analista de Procesos",
    "Coordinador de Supply Chain",
    "Jefe de Almacén",
    "Planificador de Demanda",
  ],
  "Ingeniería": [
    "Ingeniero Civil",
    "Ingeniero de Minas",
    "Ingeniero Industrial",
    "Ingeniero Eléctrico",
    "Ingeniero Mecánico",
    "Ingeniero Ambiental",
    "Ingeniero de Producción",
    "Ingeniero de Proyectos",
  ],
  "Legal": [
    "Abogado Senior",
    "Jefe Legal",
    "Analista de Compliance",
    "Abogado Corporativo",
    "Analista Legal",
    "Secretario General",
  ],
  "Administración": [
    "Asistente Ejecutivo",
    "Administrador de Oficina",
    "Recepcionista",
    "Asistente Administrativo",
    "Coordinador Administrativo",
    "Gerente de Administración",
  ],
}

const ALL_JOB_TITLES = Object.entries(COMMON_JOB_TITLES).flatMap(
  ([category, titles]) => titles.map((t) => ({ title: t, category }))
)

/* ─── Fuzzy Match ─── */

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .trim()
}

function fuzzyScore(query: string, target: string): number {
  const q = normalize(query)
  const t = normalize(target)

  // Exact match
  if (t === q) return 100
  // Starts with
  if (t.startsWith(q)) return 90
  // Contains
  if (t.includes(q)) return 70

  // Word-level matching
  const queryWords = q.split(/\s+/)
  const targetWords = t.split(/\s+/)
  let matchedWords = 0
  for (const qw of queryWords) {
    if (targetWords.some((tw) => tw.startsWith(qw) || tw.includes(qw))) {
      matchedWords++
    }
  }
  if (matchedWords > 0) return 30 + (matchedWords / queryWords.length) * 40

  // Levenshtein for short queries (typo tolerance)
  if (q.length >= 3) {
    const dist = levenshtein(q, t.slice(0, q.length + 2))
    if (dist <= 2) return 50 - dist * 10
  }

  return 0
}

function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[m][n]
}

/* ─── Schema ─── */

const salarySchema = z.object({
  jobTitle: z.string().min(2, "Ingresa el nombre del puesto").max(120),
  amount: z.number({ error: "Ingresa un monto válido" }).min(1, "El monto debe ser mayor a 0"),
  currency: z.literal("PEN"),
  period: z.enum(["MONTHLY", "YEARLY"], { message: "Selecciona un período" }),
  yearsExperience: z
    .number({ error: "Ingresa un número" })
    .min(0, "Mínimo 0")
    .max(50, "Máximo 50")
    .optional(),
  level: z.string().optional(),
})

type SalaryFormData = z.infer<typeof salarySchema>

const LEVELS = ["Practicante", "Junior", "Mid", "Senior", "Especialista", "Gerente", "Director"]

/* ─── Combobox ─── */

interface ComboboxProps {
  value: string
  onChange: (value: string) => void
  existingPositions: Position[]
  error?: string
}

function JobTitleCombobox({ value, onChange, existingPositions, error }: ComboboxProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setQuery(value)
  }, [value])

  const suggestions = useMemo(() => {
    if (!query || query.length < 2) return []

    type Suggestion = { title: string; category: string; isExisting: boolean; score: number }
    const results: Suggestion[] = []

    // Score existing positions (higher priority)
    for (const pos of existingPositions) {
      const score = fuzzyScore(query, pos.title)
      if (score > 20) {
        results.push({
          title: pos.title,
          category: pos.category?.name || "Esta empresa",
          isExisting: true,
          score: score + 10, // boost existing
        })
      }
    }

    // Score curated titles
    for (const item of ALL_JOB_TITLES) {
      const score = fuzzyScore(query, item.title)
      if (score > 20) {
        // Skip if already in existing positions
        if (!results.some((r) => normalize(r.title) === normalize(item.title))) {
          results.push({
            title: item.title,
            category: item.category,
            isExisting: false,
            score,
          })
        }
      }
    }

    return results.sort((a, b) => b.score - a.score).slice(0, 8)
  }, [query, existingPositions])

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
        Puesto / Cargo
      </label>
      <div className="relative">
        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            onChange(e.target.value)
            setOpen(true)
          }}
          onFocus={() => query.length >= 2 && setOpen(true)}
          placeholder="Ej: Desarrollador Full Stack"
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
          <div className="max-h-60 overflow-y-auto py-1">
            {suggestions.map((s, i) => {
              const isSelected = normalize(value) === normalize(s.title)
              return (
                <button
                  key={`${s.title}-${i}`}
                  type="button"
                  onClick={() => {
                    onChange(s.title)
                    setQuery(s.title)
                    setOpen(false)
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors",
                    isSelected && "bg-muted/30"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <p className={cn("truncate", s.isExisting && "font-medium")}>
                      {s.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {s.isExisting ? "Ya existe en esta empresa" : s.category}
                    </p>
                  </div>
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

/* ─── Salary Form ─── */

interface SalaryFormProps {
  companyId: string
  companyName: string
  positions: Position[]
  onSuccess?: () => void
}

export function SalaryForm({ companyId, companyName, positions, onSuccess }: SalaryFormProps) {
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
  } = useForm<SalaryFormData>({
    resolver: zodResolver(salarySchema),
    defaultValues: {
      jobTitle: "",
      amount: undefined,
      currency: "PEN",
      period: "MONTHLY",
      yearsExperience: undefined,
      level: "",
    },
  })

  const jobTitle = watch("jobTitle")
  const period = watch("period")
  const level = watch("level")

  const onSubmit = async (data: SalaryFormData) => {
    setSubmitting(true)
    try {
      const token = await getAuthToken()

      // Find existing position by fuzzy match
      const existingPos = positions.find(
        (p) => normalize(p.title) === normalize(data.jobTitle)
      )

      let positionId: string

      if (existingPos) {
        positionId = existingPos.id
      } else {
        // Create new position
        const newPos = await api.positions.create(token, {
          companyId,
          title: data.jobTitle,
          level: data.level || undefined,
        })
        positionId = newPos.id
      }

      await api.salaries.add(token, positionId, {
        amount: data.amount,
        currency: data.currency,
        period: data.period,
        yearsExperience: data.yearsExperience,
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
        ? "Inicia sesión para reportar tu salario."
        : "Hubo un problema al guardar tu salario. Intenta de nuevo."
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
          <DollarSign className="h-6 w-6 text-foreground" />
        </div>
        <h3 className="font-semibold text-sm">¡Gracias por reportar tu salario!</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Tu aporte ayuda a la comunidad a negociar mejores condiciones.
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
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              ¿Trabajas en {companyName}? Reporta tu salario de forma anónima...
            </p>
          </div>
          <span className="text-xs text-muted-foreground/50 hidden sm:block">
            100% anónimo
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
          <h3 className="text-sm font-semibold">Reportar salario en {companyName}</h3>
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
        {/* Job Title with autocomplete */}
        <JobTitleCombobox
          value={jobTitle}
          onChange={(v) => setValue("jobTitle", v, { shouldValidate: true })}
          existingPositions={positions}
          error={errors.jobTitle?.message}
        />

        {/* Level selector */}
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
            Nivel
          </label>
          <div className="flex flex-wrap gap-2">
            {LEVELS.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setValue("level", level === l ? "" : l)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-colors border",
                  level === l
                    ? "bg-foreground text-background border-foreground"
                    : "bg-muted/30 text-muted-foreground border-border/60 hover:bg-muted/50 hover:text-foreground"
                )}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Salary amount + Period row */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Salario bruto (S/)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                S/
              </span>
              <Input
                type="number"
                {...register("amount", { valueAsNumber: true })}
                placeholder="5,000"
                className="pl-9 h-9 text-sm bg-muted/30 border-border/60"
              />
            </div>
            {errors.amount && (
              <p className="text-xs text-destructive mt-1">{errors.amount.message}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Período
            </label>
            <div className="flex gap-2">
              {(
                [
                  { value: "MONTHLY" as const, label: "Mensual" },
                  { value: "YEARLY" as const, label: "Anual" },
                ] as const
              ).map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setValue("period", p.value)}
                  className={cn(
                    "flex-1 px-3 py-2 rounded-md text-xs font-medium transition-colors border",
                    period === p.value
                      ? "bg-foreground text-background border-foreground"
                      : "bg-muted/30 text-muted-foreground border-border/60 hover:bg-muted/50"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Years of experience */}
        <div className="max-w-50">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
            Años de experiencia
          </label>
          <Input
            type="number"
            {...register("yearsExperience", { valueAsNumber: true })}
            placeholder="3"
            min={0}
            max={50}
            className="h-9 text-sm bg-muted/30 border-border/60"
          />
          {errors.yearsExperience && (
            <p className="text-xs text-destructive mt-1">{errors.yearsExperience.message}</p>
          )}
        </div>
      </div>

      {/* Submit bar */}
      <div className="px-5 py-3 bg-muted/20 border-t border-border/40 flex items-center justify-between">
        <p className="text-[11px] text-muted-foreground hidden sm:block">
          Tu salario es completamente anónimo
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
              Reportar salario
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
