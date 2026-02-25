"use client"

import { useState } from "react"
import { Check, Search } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

/* ─── Data ─── */

const currencies = [
    { code: "PEN", symbol: "S/.", name: "Sol Peruano", flag: "🇵🇪" },
]

const languages = [
    { code: "es-PE", name: "Español (Perú)", flag: "🇵🇪" },
]

/* ─── Selector List ─── */

interface SelectorItem {
    code: string
    name: string
    flag: string
    symbol?: string
}

function SelectorList({
    items,
    selected,
    onSelect,
    searchPlaceholder,
    showSymbol,
}: {
    items: SelectorItem[]
    selected: string
    onSelect: (code: string) => void
    searchPlaceholder: string
    showSymbol?: boolean
}) {
    const [search, setSearch] = useState("")

    const filtered = items.filter(
        (item) =>
            item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.code.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-3">
            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                    placeholder={searchPlaceholder}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 h-9 text-sm bg-muted/50 border-border/60"
                />
            </div>

            {/* List */}
            <div className="max-h-[280px] overflow-y-auto -mx-1">
                {filtered.map((item) => {
                    const isSelected = item.code === selected
                    return (
                        <button
                            key={item.code}
                            onClick={() => onSelect(item.code)}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                                isSelected
                                    ? "bg-muted font-medium"
                                    : "hover:bg-muted/50"
                            )}
                        >
                            <span className="text-base leading-none">{item.flag}</span>
                            <span className="flex-1 text-left">
                                {showSymbol && item.symbol ? (
                                    <span>
                                        <span className="font-medium">{item.code}</span>
                                        <span className="text-muted-foreground"> – {item.symbol}</span>
                                        <span className="text-muted-foreground text-xs ml-2">{item.name}</span>
                                    </span>
                                ) : (
                                    item.name
                                )}
                            </span>
                            {isSelected && (
                                <Check className="h-4 w-4 text-foreground shrink-0" />
                            )}
                        </button>
                    )
                })}
                {filtered.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                        Sin resultados
                    </p>
                )}
            </div>
        </div>
    )
}

/* ─── Main Component ─── */

export function CurrencyLanguageSelector() {
    const [currencyOpen, setCurrencyOpen] = useState(false)
    const [languageOpen, setLanguageOpen] = useState(false)
    const [selectedCurrency, setSelectedCurrency] = useState("PEN")
    const [selectedLanguage, setSelectedLanguage] = useState("es-PE")

    const currency = currencies.find((c) => c.code === selectedCurrency) || currencies[0]
    const language = languages.find((l) => l.code === selectedLanguage) || languages[0]

    return (
        <div className="hidden md:flex items-center gap-0.5">
            {/* Currency button */}
            <Dialog open={currencyOpen} onOpenChange={setCurrencyOpen}>
                <DialogTrigger asChild>
                    <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-colors">
                        <span className="font-medium">{currency.symbol}</span>
                        <span>{currency.code} / mes</span>
                    </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[360px] p-0">
                    <DialogHeader className="px-5 pt-5 pb-0">
                        <DialogTitle className="text-base font-semibold">Moneda</DialogTitle>
                    </DialogHeader>
                    <div className="px-5 pb-5 pt-3">
                        <SelectorList
                            items={currencies}
                            selected={selectedCurrency}
                            onSelect={(code) => {
                                setSelectedCurrency(code)
                                setCurrencyOpen(false)
                            }}
                            searchPlaceholder="Buscar moneda"
                            showSymbol
                        />
                    </div>
                </DialogContent>
            </Dialog>

            {/* Language button */}
            <Dialog open={languageOpen} onOpenChange={setLanguageOpen}>
                <DialogTrigger asChild>
                    <button className="flex items-center gap-1.5 px-2 py-1.5 text-xs rounded-md hover:bg-accent transition-colors">
                        <span className="text-sm leading-none">{language.flag}</span>
                    </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[360px] p-0">
                    <DialogHeader className="px-5 pt-5 pb-0">
                        <DialogTitle className="text-base font-semibold">Idioma</DialogTitle>
                    </DialogHeader>
                    <div className="px-5 pb-5 pt-3">
                        <SelectorList
                            items={languages}
                            selected={selectedLanguage}
                            onSelect={(code) => {
                                setSelectedLanguage(code)
                                setLanguageOpen(false)
                            }}
                            searchPlaceholder="Buscar idioma"
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
