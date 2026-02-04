import { formatCurrency } from '@/lib/utils'
import type { OrganigramaStats } from '@/types/organigrama'
import { Undo2, Redo2, Clock } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface StatsFooterProps {
  stats: OrganigramaStats
}

// TipPopup component - identical to Dify
function TipPopup({ title, children, shortcuts }: { title: string; children: React.ReactNode; shortcuts?: string[] }) {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="flex items-center gap-1 rounded-lg border-[0.5px] border-gray-200 bg-gray-900 p-1.5 shadow-lg"
        >
          <span className="text-xs font-medium text-white">{title}</span>
          {shortcuts && (
            <div className="flex items-center gap-0.5">
              {shortcuts.map((key, i) => (
                <kbd key={i} className="rounded bg-gray-700 px-1 py-0.5 text-[10px] font-medium text-gray-300">
                  {key}
                </kbd>
              ))}
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function StatsFooter({ stats }: StatsFooterProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-10 px-2 pb-2">
      <div className="flex items-center justify-between">
        {/* Left - Undo/Redo (Dify style) */}
        <div className="flex items-center gap-0.5 rounded-lg border-[0.5px] border-gray-200 bg-white p-0.5 shadow-lg">
          <TipPopup title="Deshacer" shortcuts={['Ctrl', 'Z']}>
            <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600">
              <Undo2 className="h-4 w-4" />
            </div>
          </TipPopup>
          <TipPopup title="Rehacer" shortcuts={['Ctrl', 'Y']}>
            <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600">
              <Redo2 className="h-4 w-4" />
            </div>
          </TipPopup>
          <div className="mx-0.5 h-4 w-px bg-gray-200" />
          <TipPopup title="Historial">
            <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600">
              <Clock className="h-4 w-4" />
            </div>
          </TipPopup>
        </div>

        {/* Center - Stats Badges (Dify "Inspeccionar Variable" style) */}
        <div className="flex items-center gap-2">
          <div className="flex h-6 items-center gap-1.5 rounded-md border-[0.5px] border-gray-200 bg-white px-2 text-xs font-medium text-gray-500 shadow-lg">
            <span className="text-gray-400">Cargos:</span>
            <span className="font-semibold text-gray-700">{stats.totalEmployees}</span>
          </div>
          <div className="flex h-6 items-center gap-1.5 rounded-md border-[0.5px] border-gray-200 bg-white px-2 text-xs font-medium text-gray-500 shadow-lg">
            <span className="text-gray-400">Masa Salarial:</span>
            <span className="font-semibold text-emerald-600">{formatCurrency(stats.totalSalary)}</span>
          </div>
          <div className="flex h-6 items-center gap-1.5 rounded-md border-[0.5px] border-gray-200 bg-white px-2 text-xs font-medium text-gray-500 shadow-lg">
            <span className="text-gray-400">Promedio:</span>
            <span className="font-semibold text-emerald-600">{formatCurrency(stats.avgSalary)}</span>
          </div>
        </div>

        {/* Right - Spacer (MiniMap + ZoomInOut are positioned absolutely) */}
        <div className="w-[120px]" />
      </div>
    </div>
  )
}
