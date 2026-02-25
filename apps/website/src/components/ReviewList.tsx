"use client"

import { useState } from "react"
import { Star, ThumbsUp, MoreHorizontal, Flag, ChevronDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { Review } from "@/lib/api"

/* ─── Utils ─── */

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return "Justo ahora"
  if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} min`
  if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)} h`

  const days = Math.floor(seconds / 86400)
  if (days === 1) return "Ayer"
  if (days < 7) return `Hace ${days} días`
  if (days < 30) return `Hace ${Math.floor(days / 7)} sem`
  if (days < 365) return `Hace ${Math.floor(days / 30)} meses`
  const years = Math.floor(days / 365)
  return `Hace ${years} ${years === 1 ? "año" : "años"}`
}

function renderStars(rating: number, size: "sm" | "md" = "sm") {
  const cls = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"
  return (
    <div className="flex items-center gap-px">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn(
            cls,
            s <= rating
              ? "fill-foreground text-foreground"
              : "text-muted-foreground/20"
          )}
        />
      ))}
    </div>
  )
}

/* Generate deterministic avatar initials/color from review data */
function getAvatarProps(review: Review) {
  const hash = review.id
    .split("")
    .reduce((acc, c) => acc + c.charCodeAt(0), 0)

  const initials = ["A", "C", "E", "J", "L", "M", "P", "R", "S", "V"]
  const colors = [
    "bg-neutral-200 text-neutral-600",
    "bg-neutral-300 text-neutral-700",
    "bg-neutral-100 text-neutral-500",
    "bg-neutral-400 text-neutral-800",
    "bg-neutral-150 text-neutral-550",
  ]

  return {
    initial: initials[hash % initials.length],
    colorClass: colors[hash % colors.length],
  }
}

/* ─── Single Review Card (YouTube-comment style) ─── */

function ReviewCard({ review }: { review: Review }) {
  const [expanded, setExpanded] = useState(false)
  const [helpful, setHelpful] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const avatar = getAvatarProps(review)
  const text = review.pros || ""
  const isLong = text.length > 300

  return (
    <div className="flex gap-3 group">
      {/* Avatar */}
      <div
        className={cn(
          "h-9 w-9 rounded-full flex items-center justify-center shrink-0 text-sm font-medium",
          avatar.colorClass
        )}
      >
        {avatar.initial}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Meta row */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[13px] font-medium">Anónimo</span>
          {review.isCurrentEmployee && (
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 h-4 font-normal"
            >
              Empleado actual
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">
            {timeAgo(review.createdAt)}
          </span>
        </div>

        {/* Rating + Title */}
        <div className="flex items-center gap-2 mt-1">
          {renderStars(review.rating)}
          {review.title && (
            <span className="text-sm font-medium">{review.title}</span>
          )}
        </div>

        {/* Body text */}
        {text && (
          <div className="mt-1.5">
            <p
              className={cn(
                "text-sm text-muted-foreground leading-relaxed",
                !expanded && isLong && "line-clamp-3"
              )}
            >
              {text}
            </p>
            {isLong && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-xs font-medium text-foreground mt-1 hover:underline"
              >
                {expanded ? "Mostrar menos" : "Leer más"}
              </button>
            )}
          </div>
        )}

        {/* Cons (if present) */}
        {review.cons && (
          <div className="mt-2">
            <span className="text-xs font-medium text-muted-foreground">Áreas de mejora: </span>
            <span className="text-xs text-muted-foreground">{review.cons}</span>
          </div>
        )}

        {/* Actions row */}
        <div className="flex items-center gap-1 mt-2 -ml-2">
          <button
            onClick={() => setHelpful(!helpful)}
            className={cn(
              "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs transition-colors",
              helpful
                ? "text-foreground bg-muted"
                : "text-muted-foreground hover:bg-muted/50"
            )}
          >
            <ThumbsUp className={cn("h-3.5 w-3.5", helpful && "fill-foreground")} />
            <span>Útil</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="inline-flex items-center p-1.5 rounded-full text-muted-foreground hover:bg-muted/50 transition-colors opacity-0 group-hover:opacity-100"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute left-0 top-full mt-1 z-20 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[140px]">
                  <button
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted transition-colors"
                    onClick={() => setShowMenu(false)}
                  >
                    <Flag className="h-3 w-3" />
                    Reportar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Review List with pagination ─── */

interface ReviewListProps {
  reviews: Review[]
  loading?: boolean
}

const REVIEWS_PER_PAGE = 10

export function ReviewList({ reviews, loading }: ReviewListProps) {
  const [visibleCount, setVisibleCount] = useState(REVIEWS_PER_PAGE)

  const visible = reviews.slice(0, visibleCount)
  const hasMore = visibleCount < reviews.length

  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-9 w-9 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="flex gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-muted/50 mb-4">
          <Star className="h-7 w-7 text-muted-foreground/40" />
        </div>
        <h3 className="text-sm font-medium">Aún no hay reseñas</h3>
        <p className="text-xs text-muted-foreground mt-1">
          ¡Sé el primero en compartir tu experiencia laboral!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Review count */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">
          {reviews.length} {reviews.length === 1 ? "reseña" : "reseñas"}
        </p>
        {/* Future: sort dropdown */}
      </div>

      {/* Reviews */}
      <div className="space-y-5">
        {visible.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setVisibleCount((v) => v + REVIEWS_PER_PAGE)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-colors"
          >
            <ChevronDown className="h-4 w-4" />
            Mostrar más reseñas
          </button>
        </div>
      )}
    </div>
  )
}
