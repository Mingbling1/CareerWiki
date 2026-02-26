"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Star, Send, Briefcase, ChevronDown, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { api, type Position } from "@/lib/api"
import { getAuthToken } from "@/lib/auth-helpers"
import { sileo } from "sileo"

/* ─── Curated Job Titles (Perú) ─── */

const COMMON_JOB_TITLES: Record<string, string[]> = {
  "Tecnología": [
    "Desarrollador Full Stack", "Desarrollador Frontend", "Desarrollador Backend",
    "Desarrollador Móvil", "Ingeniero DevOps", "Ingeniero de Datos",
    "Analista de Datos", "Científico de Datos", "Arquitecto de Software",
    "Tech Lead", "QA Engineer", "Analista de Sistemas",
    "Product Manager", "UX Designer",
  ],
  "Finanzas": [
    "Analista Financiero", "Controller Financiero", "Contador General",
    "Auditor Interno", "Analista de Riesgos", "Gerente de Finanzas",
  ],
  "Marketing y Ventas": [
    "Gerente de Marketing", "Ejecutivo de Ventas", "Community Manager",
    "Analista de Marketing Digital", "Ejecutivo Comercial", "Gerente Comercial",
  ],
  "RRHH": [
    "Gerente de RRHH", "Analista de Compensaciones", "Recruiter",
    "Business Partner RRHH",
  ],
  "Operaciones": [
    "Gerente de Operaciones", "Jefe de Logística", "Analista de Procesos",
    "Supervisor de Producción",
  ],
  "Ingeniería": [
    "Ingeniero Civil", "Ingeniero Industrial", "Ingeniero de Minas",
    "Ingeniero Eléctrico", "Ingeniero Mecánico",
  ],
  "Legal": [
    "Abogado Senior", "Jefe Legal", "Analista de Compliance",
  ],
  "Administración": [
    "Asistente Ejecutivo", "Asistente Administrativo",
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
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
}

function fuzzyScore(query: string, target: string): number {
  const q = normalize(query)
  const t = normalize(target)
  if (t === q) return 100
  if (t.startsWith(q)) return 90
  if (t.includes(q)) return 70
  const queryWords = q.split(/\s+/)
  const targetWords = t.split(/\s+/)
  let matchedWords = 0
  for (const qw of queryWords) {
    if (targetWords.some((tw: string) => tw.startsWith(qw) || tw.includes(qw))) matchedWords++
  }
  if (matchedWords > 0) return 30 + (matchedWords / queryWords.length) * 40
  return 0
}

/* ─── Schema ─── */

const reviewSchema = z.object({
  rating: z.number().min(1, "Selecciona una calificación").max(5),
  title: z.string().min(3, "Mínimo 3 caracteres").max(120, "Máximo 120 caracteres"),
  comment: z.string().min(20, "Cuéntanos un poco más (mínimo 20 caracteres)").max(2000, "Máximo 2000 caracteres"),
  jobTitle: z.string().min(2, "Ingresa tu cargo").max(100),
  isCurrentEmployee: z.boolean(),
})

type ReviewFormData = z.infer<typeof reviewSchema>

/* ─── Star Rating Input ─── */

function StarRating({
  value,
  onChange,
  error,
}: {
  value: number
  onChange: (v: number) => void
  error?: string
}) {
  const [hover, setHover] = useState(0)
  const labels = ["", "Muy mal", "Mal", "Regular", "Bueno", "Excelente"]

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              onClick={() => onChange(star)}
              className="p-0.5 transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  "h-7 w-7 transition-colors",
                  star <= (hover || value)
                    ? "fill-foreground text-foreground"
                    : "text-muted-foreground/25 hover:text-muted-foreground/50"
                )}
              />
            </button>
          ))}
        </div>
        {(hover || value) > 0 && (
          <span className="text-sm text-muted-foreground animate-in fade-in duration-150">
            {labels[hover || value]}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-destructive mt-1.5">{error}</p>}
    </div>
  )
}

/* ─── Job Title Combobox (reutilizado de SalaryForm) ─── */

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

  useEffect(() => { setQuery(value) }, [value])

  const suggestions = useMemo(() => {
    if (!query || query.length < 2) return []

    type Suggestion = { title: string; category: string; isExisting: boolean; score: number }
    const results: Suggestion[] = []

    for (const pos of existingPositions) {
      const score = fuzzyScore(query, pos.title)
      if (score > 20) {
        results.push({
          title: pos.title,
          category: pos.category?.name || "Esta empresa",
          isExisting: true,
          score: score + 10,
        })
      }
    }

    for (const item of ALL_JOB_TITLES) {
      const score = fuzzyScore(query, item.title)
      if (score > 20) {
        if (!results.some((r) => normalize(r.title) === normalize(item.title))) {
          results.push({ title: item.title, category: item.category, isExisting: false, score })
        }
      }
    }

    return results.sort((a, b) => b.score - a.score).slice(0, 8)
  }, [query, existingPositions])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        listRef.current && !listRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) { setOpen(false) }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  return (
    <div className="relative">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
        Cargo
      </label>
      <div className="relative">
        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); onChange(e.target.value); setOpen(true) }}
          onFocus={() => query.length >= 2 && setOpen(true)}
          placeholder="Ej: Desarrollador Full Stack"
          className="pl-9 h-9 text-sm bg-muted/30 border-border/60"
          autoComplete="off"
        />
      </div>

      {open && suggestions.length > 0 && (
        <div ref={listRef} className="absolute z-50 mt-1 w-full rounded-lg border border-border/40 bg-card shadow-lg overflow-hidden">
          <div className="max-h-60 overflow-y-auto py-1">
            {suggestions.map((s, i) => {
              const isSelected = normalize(value) === normalize(s.title)
              return (
                <button
                  key={`${s.title}-${i}`}
                  type="button"
                  onClick={() => { onChange(s.title); setQuery(s.title); setOpen(false) }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors",
                    isSelected && "bg-muted/30"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <p className={cn("truncate", s.isExisting && "font-medium")}>{s.title}</p>
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

/* ─── Review Form ─── */

interface ReviewFormProps {
  companyId: string
  companyName: string
  positions?: Position[]
  onSuccess?: () => void
}

export function ReviewForm({ companyId, companyName, positions = [], onSuccess }: ReviewFormProps) {
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
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      title: "",
      comment: "",
      jobTitle: "",
      isCurrentEmployee: true,
    },
  })

  const rating = watch("rating")
  const isCurrentEmployee = watch("isCurrentEmployee")
  const commentLength = watch("comment")?.length || 0
  const jobTitle = watch("jobTitle")

  const onSubmit = async (data: ReviewFormData) => {
    setSubmitting(true)
    try {
      const token = await getAuthToken()

      await api.reviews.add(token, {
        companyId,
        rating: data.rating,
        title: data.title,
        pros: data.comment,
        isCurrentEmployee: data.isCurrentEmployee,
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
        ? "Inicia sesión para escribir tu reseña."
        : "Hubo un problema al publicar tu reseña. Intenta de nuevo."
      sileo.error({ title: "Error", description: msg })
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-border/40 bg-muted/20 p-6 text-center">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-foreground/5 mb-3">
          <Star className="h-6 w-6 text-foreground" />
        </div>
        <h3 className="font-semibold text-sm">¡Gracias por tu reseña!</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Tu opinión ayuda a otros profesionales a tomar mejores decisiones.
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
            <Star className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              ¿Trabajas o trabajaste en {companyName}? Comparte tu experiencia...
            </p>
          </div>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="h-4 w-4 text-muted-foreground/20" />
            ))}
          </div>
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
          <h3 className="text-sm font-semibold">Tu experiencia en {companyName}</h3>
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
        {/* Rating */}
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
            Calificación general
          </label>
          <StarRating
            value={rating}
            onChange={(v) => setValue("rating", v, { shouldValidate: true })}
            error={errors.rating?.message}
          />
        </div>

        {/* Employment status + Job title row */}
        <div className="grid gap-3 sm:grid-cols-2">
          <JobTitleCombobox
            value={jobTitle}
            onChange={(v) => setValue("jobTitle", v, { shouldValidate: true })}
            existingPositions={positions}
            error={errors.jobTitle?.message}
          />

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Estado
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setValue("isCurrentEmployee", !isCurrentEmployee)}
                className="w-full flex items-center justify-between h-9 px-3 text-sm rounded-md border border-border/60 bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <span>{isCurrentEmployee ? "Empleado actual" : "Exempleado"}</span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
            Título de tu reseña
          </label>
          <Input
            {...register("title")}
            placeholder="Resume tu experiencia en una frase"
            className="h-9 text-sm bg-muted/30 border-border/60"
          />
          {errors.title && (
            <p className="text-xs text-destructive mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* Comment */}
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
            Tu experiencia
          </label>
          <Textarea
            {...register("comment")}
            placeholder="Cuéntanos sobre el ambiente laboral, la cultura, oportunidades de crecimiento, liderazgo, balance vida-trabajo..."
            className="min-h-[120px] text-sm bg-muted/30 border-border/60 resize-none"
          />
          <div className="flex items-center justify-between mt-1.5">
            {errors.comment ? (
              <p className="text-xs text-destructive">{errors.comment.message}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Sé honesto y constructivo. Tu reseña es completamente anónima.
              </p>
            )}
            <span
              className={cn(
                "text-xs tabular-nums",
                commentLength > 1800 ? "text-destructive" : "text-muted-foreground"
              )}
            >
              {commentLength}/2000
            </span>
          </div>
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
            "Publicando..."
          ) : (
            <>
              <Send className="h-3.5 w-3.5" />
              Publicar reseña
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
