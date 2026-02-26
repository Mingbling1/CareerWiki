"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { X, ChevronRight, Search, DollarSign, Briefcase, Send, Check, Loader2, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { api, type Company, type Position } from "@/lib/api"
import { createClient } from "@/lib/supabase/client"
import { getAuthToken } from "@/lib/auth-helpers"
import { revalidateCompanyData } from "@/app/(app)/actions"
import { sileo } from "sileo"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

/* ─── Tiered Contribution Types ─── */

const TIERS = [
  {
    id: "salary",
    delay: 45,
    title: "Comparte tu salario",
    description: "Ayuda a otros profesionales compartiendo tu rango salarial de forma anonima.",
    cta: "Reportar salario",
    icon: DollarSign,
  },
  {
    id: "review",
    delay: 90,
    title: "Como es trabajar ahi?",
    description: "Tu experiencia puede ayudar a alguien a tomar una mejor decision laboral.",
    cta: "Escribir resena",
    icon: Briefcase,
  },
  {
    id: "position",
    delay: 150,
    title: "Que puesto tienes?",
    description: "Agrega tu cargo para enriquecer los datos de tu empresa.",
    cta: "Agregar puesto",
    icon: Building2,
  },
]

/* ─── Fuzzy helpers ─── */

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
}

function fuzzyMatch(query: string, target: string): number {
  const q = normalize(query)
  const t = normalize(target)
  if (t === q) return 100
  if (t.startsWith(q)) return 90
  if (t.includes(q)) return 70
  const words = q.split(/\s+/)
  const tWords = t.split(/\s+/)
  let matched = 0
  for (const w of words) {
    if (tWords.some((tw) => tw.startsWith(w) || tw.includes(w))) matched++
  }
  if (matched > 0) return 30 + (matched / words.length) * 40
  return 0
}

/* ─── Common Job Titles ─── */

const COMMON_JOB_TITLES: Record<string, string[]> = {
  "Tecnologia": [
    "Desarrollador Full Stack", "Desarrollador Frontend", "Desarrollador Backend",
    "Ingeniero DevOps", "Ingeniero de Datos", "Analista de Datos",
    "Arquitecto de Software", "Tech Lead", "QA Engineer",
    "Analista de Sistemas", "Product Manager", "UX Designer",
  ],
  "Finanzas": [
    "Analista Financiero", "Controller Financiero", "Contador General",
    "Auditor Interno", "Analista de Riesgos", "Gerente de Finanzas",
  ],
  "Marketing": [
    "Gerente de Marketing", "Ejecutivo de Ventas", "Community Manager",
    "Analista de Marketing Digital", "Ejecutivo Comercial",
  ],
  "RRHH": [
    "Gerente de RRHH", "Recruiter", "Analista de Compensaciones",
    "Business Partner RRHH",
  ],
  "Operaciones": [
    "Gerente de Operaciones", "Jefe de Logistica", "Analista de Procesos",
  ],
}

const ALL_JOB_TITLES = Object.entries(COMMON_JOB_TITLES).flatMap(
  ([cat, titles]) => titles.map((t) => ({ title: t, category: cat }))
)

/* ─── Salary Schema ─── */

const salarySchema = z.object({
  jobTitle: z.string().min(2, "Ingresa el nombre del puesto").max(120),
  amount: z.number({ error: "Ingresa un monto valido" }).min(1, "El monto debe ser mayor a 0"),
  currency: z.literal("PEN"),
  period: z.enum(["MONTHLY", "YEARLY"], { message: "Selecciona un periodo" }),
  yearsExperience: z.number({ error: "Ingresa un numero" }).min(0).max(50).optional(),
  level: z.string().optional(),
})

type SalaryFormData = z.infer<typeof salarySchema>

const LEVELS = ["Practicante", "Junior", "Mid", "Senior", "Especialista", "Gerente", "Director"]

/* ─── Company Search ─── */

function CompanySearchInput({
  onSelect,
  selectedCompany,
}: {
  onSelect: (company: Company) => void
  selectedCompany: Company | null
}) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Company[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        listRef.current && !listRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const searchCompanies = useCallback((q: string) => {
    if (q.length < 2) {
      setResults([])
      return
    }
    setLoading(true)
    api.companies.getAll({ search: q, limit: 8 }).then((res) => {
      setResults(res.data)
      setOpen(true)
    }).catch(() => {
      setResults([])
    }).finally(() => setLoading(false))
  }, [])

  const handleChange = (value: string) => {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => searchCompanies(value), 300)
  }

  if (selectedCompany) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-muted/20">
        {selectedCompany.logoUrl ? (
          <img
            src={selectedCompany.logoUrl}
            alt={selectedCompany.name}
            className="h-8 w-8 rounded-md object-cover bg-white"
          />
        ) : (
          <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{selectedCompany.name}</p>
          <p className="text-xs text-muted-foreground truncate">
            {selectedCompany.industry || "Empresa"}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            onSelect(null as unknown as Company)
            setQuery("")
          }}
          className="text-xs text-muted-foreground"
        >
          Cambiar
        </Button>
      </div>
    )
  }

  return (
    <div className="relative">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
        Empresa
      </label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => results.length && setOpen(true)}
          placeholder="Buscar empresa..."
          className="pl-9 h-9 text-sm bg-muted/30 border-border/60"
          autoComplete="off"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground animate-spin" />
        )}
      </div>

      {open && results.length > 0 && (
        <div
          ref={listRef}
          className="absolute z-[100] mt-1 w-full rounded-lg border border-border/40 bg-card shadow-lg overflow-hidden"
        >
          <div className="max-h-60 overflow-y-auto py-1">
            {results.map((company) => (
              <button
                key={company.id}
                type="button"
                onClick={() => {
                  onSelect(company)
                  setOpen(false)
                  setQuery(company.name)
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors"
              >
                {company.logoUrl ? (
                  <img
                    src={company.logoUrl}
                    alt=""
                    className="h-6 w-6 rounded object-cover bg-white shrink-0"
                  />
                ) : (
                  <div className="h-6 w-6 rounded bg-muted flex items-center justify-center shrink-0">
                    <Building2 className="h-3 w-3 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium">{company.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {company.industry || "Empresa"} {company.location ? `· ${company.location}` : ""}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Job Title Combobox (inline for dialog) ─── */

function JobTitleComboboxInline({
  value,
  onChange,
  existingPositions,
  error,
}: {
  value: string
  onChange: (v: string) => void
  existingPositions: Position[]
  error?: string
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setQuery(value) }, [value])

  const suggestions = useMemo(() => {
    if (!query || query.length < 2) return []
    type S = { title: string; category: string; isExisting: boolean; score: number }
    const results: S[] = []
    for (const pos of existingPositions) {
      const score = fuzzyMatch(query, pos.title)
      if (score > 20) {
        results.push({ title: pos.title, category: pos.category?.name || "Esta empresa", isExisting: true, score: score + 10 })
      }
    }
    for (const item of ALL_JOB_TITLES) {
      const score = fuzzyMatch(query, item.title)
      if (score > 20 && !results.some((r) => normalize(r.title) === normalize(item.title))) {
        results.push({ title: item.title, category: item.category, isExisting: false, score })
      }
    }
    return results.sort((a, b) => b.score - a.score).slice(0, 6)
  }, [query, existingPositions])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (listRef.current && !listRef.current.contains(e.target as Node) && inputRef.current && !inputRef.current.contains(e.target as Node)) {
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
          onChange={(e) => { setQuery(e.target.value); onChange(e.target.value); setOpen(true) }}
          onFocus={() => query.length >= 2 && setOpen(true)}
          placeholder="Ej: Desarrollador Full Stack"
          className="pl-9 h-9 text-sm bg-muted/30 border-border/60"
          autoComplete="off"
        />
      </div>
      {open && suggestions.length > 0 && (
        <div ref={listRef} className="absolute z-50 mt-1 w-full rounded-lg border border-border/40 bg-card shadow-lg overflow-hidden">
          <div className="max-h-48 overflow-y-auto py-1">
            {suggestions.map((s, i) => (
              <button
                key={`${s.title}-${i}`}
                type="button"
                onClick={() => { onChange(s.title); setQuery(s.title); setOpen(false) }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors",
                  normalize(value) === normalize(s.title) && "bg-muted/30"
                )}
              >
                <div className="flex-1 min-w-0">
                  <p className={cn("truncate", s.isExisting && "font-medium")}>{s.title}</p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {s.isExisting ? "Ya existe en esta empresa" : s.category}
                  </p>
                </div>
                {normalize(value) === normalize(s.title) && <Check className="h-3.5 w-3.5 text-foreground shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  )
}

/* ─── Dialog Salary Form ─── */

function DialogSalaryForm({ onSuccess }: { onSuccess: () => void }) {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [positions, setPositions] = useState<Position[]>([])
  const [submitting, setSubmitting] = useState(false)

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<SalaryFormData>({
    resolver: zodResolver(salarySchema),
    defaultValues: {
      jobTitle: "", amount: undefined, currency: "PEN", period: "MONTHLY",
      yearsExperience: undefined, level: "",
    },
  })

  const jobTitle = watch("jobTitle")
  const period = watch("period")
  const level = watch("level")

  // Load positions when company selected
  useEffect(() => {
    if (selectedCompany) {
      api.positions.getByCompany(selectedCompany.id).then(setPositions).catch(() => setPositions([]))
    } else {
      setPositions([])
    }
  }, [selectedCompany])

  const onSubmit = async (data: SalaryFormData) => {
    if (!selectedCompany) return
    setSubmitting(true)
    try {
      const token = await getAuthToken()
      const existingPos = positions.find((p) => normalize(p.title) === normalize(data.jobTitle))
      let positionId: string

      if (existingPos) {
        positionId = existingPos.id
      } else {
        const newPos = await api.positions.create(token, {
          companyId: selectedCompany.id,
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

      reset()
      revalidateCompanyData()
      onSuccess()
    } catch (err) {
      const msg = err instanceof Error && err.message === "NO_AUTH"
        ? "Inicia sesi\u00f3n para reportar tu salario."
        : "Hubo un problema al guardar tu salario. Intenta de nuevo."
      sileo.error({
        title: "Error al enviar",
        description: msg,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Company search - overflow-visible to allow dropdown to escape */}
      <div className="relative overflow-visible">
        <CompanySearchInput
          selectedCompany={selectedCompany}
          onSelect={setSelectedCompany}
        />
      </div>

      {/* Scrollable area for the rest of the form (once company selected) */}
      {selectedCompany && (
        <div className="max-h-[55vh] overflow-y-auto space-y-5 -mx-1 px-1">
          <JobTitleComboboxInline
            value={jobTitle}
            onChange={(v) => setValue("jobTitle", v, { shouldValidate: true })}
            existingPositions={positions}
            error={errors.jobTitle?.message}
          />

          {/* Level */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Nivel
            </label>
            <div className="flex flex-wrap gap-1.5">
              {LEVELS.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setValue("level", level === l ? "" : l)}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-xs font-medium transition-colors border",
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

          {/* Salary + Period */}
          <div className="grid gap-3 grid-cols-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Salario bruto (S/)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">S/</span>
                <Input
                  type="number"
                  {...register("amount", { valueAsNumber: true })}
                  placeholder="5,000"
                  className="pl-9 h-9 text-sm bg-muted/30 border-border/60"
                />
              </div>
              {errors.amount && <p className="text-xs text-destructive mt-1">{errors.amount.message}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Periodo
              </label>
              <div className="flex gap-2">
                {([{ value: "MONTHLY" as const, label: "Mensual" }, { value: "YEARLY" as const, label: "Anual" }] as const).map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setValue("period", p.value)}
                    className={cn(
                      "flex-1 px-2 py-2 rounded-md text-xs font-medium transition-colors border",
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

          {/* Years */}
          <div className="max-w-50">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Anos de experiencia
            </label>
            <Input
              type="number"
              {...register("yearsExperience", { valueAsNumber: true })}
              placeholder="3"
              min={0}
              max={50}
              className="h-9 text-sm bg-muted/30 border-border/60"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between pt-2 border-t border-border/40">
            <p className="text-[11px] text-muted-foreground">
              100% anonimo
            </p>
            <Button type="submit" size="sm" disabled={submitting} className="gap-2">
              {submitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  Reportar salario
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </form>
  )
}

/* ─── Contribution State (localStorage + rotation) ─── */

const STORAGE_KEY = "empliq_contribution_state"

interface ContributionState {
  dismissedTiers: string[]
  completedTiers: string[]
  lastDismissedAt: number | null
  currentTierIndex: number
}

function getStoredState(): ContributionState {
  const defaults: ContributionState = {
    dismissedTiers: [],
    completedTiers: [],
    lastDismissedAt: null,
    currentTierIndex: 0,
  }
  if (typeof window === "undefined") return defaults
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as ContributionState
      // Sanitize currentTierIndex — prevent NaN or out-of-range
      if (
        typeof parsed.currentTierIndex !== "number" ||
        !Number.isFinite(parsed.currentTierIndex) ||
        parsed.currentTierIndex < 0 ||
        parsed.currentTierIndex >= TIERS.length
      ) {
        parsed.currentTierIndex = 0
      }
      if (!Array.isArray(parsed.dismissedTiers)) parsed.dismissedTiers = []
      if (!Array.isArray(parsed.completedTiers)) parsed.completedTiers = []
      return { ...defaults, ...parsed }
    }
  } catch {}
  return defaults
}

function saveState(state: ContributionState) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch {}
}

/* ─── Main Component ─── */

export function ContributionPrompt() {
  const [visible, setVisible] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [currentTier, setCurrentTier] = useState<(typeof TIERS)[number] | null>(null)
  const [state, setState] = useState<ContributionState>(getStoredState)
  const [closing, setClosing] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check auth
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsAuthenticated(!!user)
    })
  }, [])

  // Find next available tier (rotational)
  const getNextTier = useCallback(
    (elapsed: number) => {
      for (let i = 0; i < TIERS.length; i++) {
        const idx = (state.currentTierIndex + i) % TIERS.length
        const tier = TIERS[idx]
        if (!tier) continue
        if (
          elapsed >= tier.delay &&
          !state.dismissedTiers.includes(tier.id) &&
          !state.completedTiers.includes(tier.id)
        ) {
          return tier
        }
      }
      return null
    },
    [state]
  )

  useEffect(() => {
    // Cooldown: don't show if dismissed recently (24h)
    if (state.lastDismissedAt) {
      const hoursSince = (Date.now() - state.lastDismissedAt) / (1000 * 60 * 60)
      if (hoursSince < 24) return
    }

    // Don't show if all tiers completed
    if (state.completedTiers.length >= TIERS.length) return

    const startTime = Date.now()

    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000
      const tier = getNextTier(elapsed)
      if (tier && !visible) {
        setCurrentTier(tier)
        setVisible(true)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [getNextTier, visible, state.lastDismissedAt, state.completedTiers.length])

  const dismiss = () => {
    setClosing(true)
    setTimeout(() => {
      setVisible(false)
      setClosing(false)
      if (currentTier) {
        const newState: ContributionState = {
          ...state,
          dismissedTiers: [...state.dismissedTiers, currentTier.id],
          lastDismissedAt: Date.now(),
          currentTierIndex: (state.currentTierIndex + 1) % TIERS.length,
        }
        setState(newState)
        saveState(newState)
      }
    }, 200)
  }

  const handleCta = () => {
    if (!isAuthenticated) {
      window.location.href = "/login"
      return
    }
    setDialogOpen(true)
    setVisible(false)
  }

  const handleContributionSuccess = () => {
    setDialogOpen(false)
    if (currentTier) {
      const newState: ContributionState = {
        ...state,
        completedTiers: [...state.completedTiers, currentTier.id],
        currentTierIndex: (state.currentTierIndex + 1) % TIERS.length,
      }
      setState(newState)
      saveState(newState)
    }

    // Emotional notification with sileo
    sileo.success({
      title: "Gracias por tu aporte",
      description: "Cada dato que compartes ayuda a miles de profesionales a tomar mejores decisiones. Eres parte del cambio.",
      duration: 8000,
    })
  }

  const TierIcon = currentTier?.icon || DollarSign

  return (
    <>
      {/* Floating prompt — RIGHT side */}
      {visible && currentTier && (
        <div
          className={cn(
            "fixed bottom-6 right-6 z-50 max-w-sm transition-all duration-300",
            closing
              ? "opacity-0 translate-y-4 scale-95"
              : "opacity-100 translate-y-0 scale-100"
          )}
        >
          <div className="rounded-2xl border border-border/60 bg-card shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-start gap-3 p-4 pb-2">
              <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                <TierIcon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold">{currentTier.title}</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {currentTier.description}
                </p>
              </div>
              <button
                onClick={dismiss}
                className="text-muted-foreground/50 hover:text-muted-foreground transition-colors p-1 -mr-1 -mt-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 p-4 pt-2">
              <Button
                size="sm"
                className="flex-1 gap-1.5"
                onClick={handleCta}
              >
                {currentTier.cta}
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={dismiss}
                className="text-muted-foreground text-xs"
              >
                Ahora no
              </Button>
            </div>

            {/* Progress dots */}
            <div className="flex items-center justify-center gap-1.5 pb-3">
              {TIERS.map((tier) => (
                <div
                  key={tier.id}
                  className={cn(
                    "h-1.5 w-1.5 rounded-full transition-colors",
                    state.completedTiers.includes(tier.id)
                      ? "bg-foreground"
                      : tier.id === currentTier.id
                        ? "bg-foreground/60"
                        : "bg-muted-foreground/20"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Dialog with embedded form */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-visible">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Reportar salario
            </DialogTitle>
          </DialogHeader>
          <DialogSalaryForm onSuccess={handleContributionSuccess} />
        </DialogContent>
      </Dialog>
    </>
  )
}
