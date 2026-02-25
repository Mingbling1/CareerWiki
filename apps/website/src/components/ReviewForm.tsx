"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Star, Send, Briefcase, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"

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

/* ─── Review Form ─── */

interface ReviewFormProps {
  companyId: string
  companyName: string
  onSuccess?: () => void
}

export function ReviewForm({ companyId, companyName, onSuccess }: ReviewFormProps) {
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

  const onSubmit = async (data: ReviewFormData) => {
    setSubmitting(true)
    try {
      await api.reviews.add({
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
    } catch {
      // Silently handle — in production, show toast
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
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Cargo
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                {...register("jobTitle")}
                placeholder="Ej: Analista de TI"
                className="pl-9 h-9 text-sm bg-muted/30 border-border/60"
              />
            </div>
            {errors.jobTitle && (
              <p className="text-xs text-destructive mt-1">{errors.jobTitle.message}</p>
            )}
          </div>

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

        {/* Comment (replaces pros/cons) */}
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
                commentLength > 1800
                  ? "text-destructive"
                  : "text-muted-foreground"
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
