"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface Tab {
  label: string
  href: string
  isActive: boolean
}

interface ScrollableTabsProps {
  tabs: Tab[]
}

export function ScrollableTabs({ tabs }: ScrollableTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 2)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    checkScroll()
    el.addEventListener("scroll", checkScroll, { passive: true })
    const observer = new ResizeObserver(checkScroll)
    observer.observe(el)

    return () => {
      el.removeEventListener("scroll", checkScroll)
      observer.disconnect()
    }
  }, [checkScroll])

  // Scroll active tab into view on mount
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const activeTab = el.querySelector("[data-active=true]") as HTMLElement | null
    if (activeTab) {
      activeTab.scrollIntoView({ inline: "center", behavior: "instant", block: "nearest" })
    }
  }, [])

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current
    if (!el) return
    const scrollAmount = el.clientWidth * 0.6
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    })
  }

  const showArrows = canScrollLeft || canScrollRight

  return (
    <div className="relative flex items-center">
      {/* Left arrow */}
      {showArrows && (
        <button
          onClick={() => scroll("left")}
          disabled={!canScrollLeft}
          className={cn(
            "absolute left-0 z-10 flex items-center justify-center w-7 h-7 rounded-full bg-background/90 border border-border/60 shadow-sm transition-all",
            canScrollLeft
              ? "text-foreground hover:bg-muted cursor-pointer"
              : "text-muted-foreground/30 cursor-default opacity-0 pointer-events-none"
          )}
          aria-label="Desplazar a la izquierda"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
      )}

      {/* Tab container */}
      <div
        ref={scrollRef}
        className={cn(
          "flex gap-0 overflow-x-auto scrollbar-none",
          showArrows && "mx-8"
        )}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            data-active={tab.isActive}
            className={cn(
              "relative px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors shrink-0",
              tab.isActive
                ? "text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-foreground after:rounded-full"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Right arrow */}
      {showArrows && (
        <button
          onClick={() => scroll("right")}
          disabled={!canScrollRight}
          className={cn(
            "absolute right-0 z-10 flex items-center justify-center w-7 h-7 rounded-full bg-background/90 border border-border/60 shadow-sm transition-all",
            canScrollRight
              ? "text-foreground hover:bg-muted cursor-pointer"
              : "text-muted-foreground/30 cursor-default opacity-0 pointer-events-none"
          )}
          aria-label="Desplazar a la derecha"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
