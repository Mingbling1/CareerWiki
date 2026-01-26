import { useReactFlow, useViewport } from '@xyflow/react'
import { 
  PlusCircle,
  MousePointer2, 
  Hand,
  MoreHorizontal,
  ZoomIn,
  ZoomOut,
  Check,
  Download,
  LayoutGrid
} from 'lucide-react'
import { useState, useCallback, Fragment } from 'react'
import { toPng, toJpeg } from 'html-to-image'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

// ========================
// Tipo para modo de control (como Dify)
// ========================
export type ControlMode = 'pointer' | 'hand'

// ========================
// TipPopup - Clon exacto de Dify
// ========================
interface TipPopupProps {
  title: string
  children: React.ReactNode
  shortcuts?: string[]
}

function TipPopup({ title, children, shortcuts }: TipPopupProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent 
          side="right" 
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

// ========================
// Control Panel - Clon exacto de Dify
// ========================
interface ControlsPanelProps {
  className?: string
  onAddClick?: () => void
  controlMode: ControlMode
  onModeChange: (mode: ControlMode) => void
  onOrganize?: () => void
}

export function ControlsPanel({ className, onAddClick, controlMode, onModeChange, onOrganize }: ControlsPanelProps) {
  const [moreActionsOpen, setMoreActionsOpen] = useState(false)

  const handleExportImage = useCallback(async (type: 'png' | 'jpeg') => {
    const element = document.querySelector('.react-flow__viewport') as HTMLElement
    if (!element) return
    
    try {
      const filter = (node: HTMLElement) => {
        if (node instanceof HTMLImageElement)
          return node.complete && node.naturalHeight !== 0
        return true
      }
      
      let dataUrl: string
      const filename = `organigrama-${new Date().toISOString().split('T')[0]}`
      
      if (type === 'jpeg') {
        dataUrl = await toJpeg(element, { filter, quality: 0.95 })
      } else {
        dataUrl = await toPng(element, { filter })
      }
      
      const link = document.createElement('a')
      link.download = `${filename}.${type}`
      link.href = dataUrl
      link.click()
      
      setMoreActionsOpen(false)
    } catch (error) {
      console.error('Error exportando:', error)
    }
  }, [])

  return (
    <div className={`pointer-events-auto flex flex-col items-center rounded-lg border-[0.5px] border-gray-200 bg-white p-0.5 text-gray-500 shadow-lg ${className}`}>
      {/* Add Block */}
      <TipPopup title="Agregar cargo">
        <div
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          onClick={onAddClick}
        >
          <PlusCircle className="h-4 w-4" />
        </div>
      </TipPopup>

      {/* Divider */}
      <div className="my-1 h-px w-3.5 bg-gray-200" />

      {/* Pointer Mode - Selección múltiple */}
      <TipPopup title="Modo puntero" shortcuts={['V']}>
        <div
          className={`mr-[1px] flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg ${
            controlMode === 'pointer' 
              ? 'bg-blue-50 text-blue-600' 
              : 'hover:bg-gray-100 hover:text-gray-700'
          }`}
          onClick={() => onModeChange('pointer')}
        >
          <MousePointer2 className="h-4 w-4" />
        </div>
      </TipPopup>

      {/* Hand Mode - Solo mover canvas */}
      <TipPopup title="Modo mano" shortcuts={['H']}>
        <div
          className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg ${
            controlMode === 'hand' 
              ? 'bg-blue-50 text-blue-600' 
              : 'hover:bg-gray-100 hover:text-gray-700'
          }`}
          onClick={() => onModeChange('hand')}
        >
          <Hand className="h-4 w-4" />
        </div>
      </TipPopup>

      {/* Divider */}
      <div className="my-1 h-px w-3.5 bg-gray-200" />

      {/* Organize Blocks */}
      <TipPopup title="Organizar nodos" shortcuts={['Ctrl', 'O']}>
        <div
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg hover:bg-gray-100 hover:text-gray-700"
          onClick={onOrganize}
        >
          <LayoutGrid className="h-4 w-4" />
        </div>
      </TipPopup>

      {/* More Actions - Exportar como Dify */}
      <div className="relative">
        <TipPopup title="Más acciones">
          <div
            className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg hover:bg-gray-100 hover:text-gray-700 ${moreActionsOpen ? 'bg-gray-100' : ''}`}
            onClick={() => setMoreActionsOpen(v => !v)}
          >
            <MoreHorizontal className="h-4 w-4" />
          </div>
        </TipPopup>

        {/* Dropdown Menu - Estilo Dify */}
        {moreActionsOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setMoreActionsOpen(false)}
            />
            
            {/* Menu */}
            <div className="absolute left-full top-0 z-50 ml-2 min-w-[180px] rounded-xl border-[0.5px] border-gray-200 bg-white text-gray-700 shadow-lg">
              <div className="p-1">
                <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-gray-400">
                  <Download className="h-3 w-3" />
                  Exportar imagen
                </div>
                <div
                  className="flex h-8 cursor-pointer items-center rounded-lg px-3 text-sm hover:bg-gray-100"
                  onClick={() => handleExportImage('png')}
                >
                  Exportar como PNG
                </div>
                <div
                  className="flex h-8 cursor-pointer items-center rounded-lg px-3 text-sm hover:bg-gray-100"
                  onClick={() => handleExportImage('jpeg')}
                >
                  Exportar como JPEG
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ========================
// ZoomInOut - Clon exacto de Dify (Imagen 1/2)
// ========================
enum ZoomType {
  zoomIn = 'zoomIn',
  zoomOut = 'zoomOut',
  zoomToFit = 'zoomToFit',
  zoomTo25 = 'zoomTo25',
  zoomTo50 = 'zoomTo50',
  zoomTo75 = 'zoomTo75',
  zoomTo100 = 'zoomTo100',
  zoomTo200 = 'zoomTo200',
}

// Opciones simplificadas: Ajustar + 4 opciones de zoom
const ZOOM_IN_OUT_OPTIONS = [
  [
    { key: ZoomType.zoomToFit, text: 'Ajustar a pantalla' },
  ],
  [
    { key: ZoomType.zoomTo50, text: '50%' },
    { key: ZoomType.zoomTo75, text: '75%' },
    { key: ZoomType.zoomTo100, text: '100%' },
    { key: ZoomType.zoomTo200, text: '200%' },
  ],
]

// Tooltip simple para ZoomInOut (sin bloquear clicks)
function ZoomTooltip({ title, shortcuts, children, side = 'top' }: { title: string; shortcuts?: string[]; children: React.ReactNode; side?: 'top' | 'bottom' | 'left' | 'right' }) {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent 
          side={side}
          className="flex items-center gap-1 rounded-lg border-[0.5px] border-gray-200 bg-gray-900 px-2 py-1 shadow-lg"
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

export function ZoomInOut() {
  const { zoomIn, zoomOut, zoomTo, fitView } = useReactFlow()
  const { zoom } = useViewport()
  const [open, setOpen] = useState(false)

  const handleZoom = useCallback((type: ZoomType) => {
    switch (type) {
      case ZoomType.zoomToFit:
        fitView({ padding: 0.2 })
        break
      case ZoomType.zoomTo25:
        zoomTo(0.25)
        break
      case ZoomType.zoomTo50:
        zoomTo(0.5)
        break
      case ZoomType.zoomTo75:
        zoomTo(0.75)
        break
      case ZoomType.zoomTo100:
        zoomTo(1)
        break
      case ZoomType.zoomTo200:
        zoomTo(2)
        break
    }
    setOpen(false)
  }, [zoomTo, fitView])

  return (
    <div className="relative">
      {/* Container principal - Estilo exacto de Dify */}
      <div className="h-9 cursor-pointer rounded-lg border-[0.5px] border-gray-200 bg-white p-0.5 text-[13px] shadow-lg hover:bg-gray-50">
        <div className="flex h-8 w-[98px] items-center justify-center gap-0 rounded-lg">
          {/* Zoom Out */}
          <ZoomTooltip title="Alejar" shortcuts={['Ctrl', '-']}>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                zoom <= 0.25 ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-black/5'
              }`}
              onClick={(e) => {
                if (zoom <= 0.25) return
                e.stopPropagation()
                zoomOut()
              }}
            >
              <ZoomOut className="h-4 w-4 text-gray-500 hover:text-gray-700" />
            </div>
          </ZoomTooltip>

          {/* Porcentaje - Click abre dropdown */}
          <div
            onClick={() => setOpen(v => !v)}
            className="w-[34px] cursor-pointer text-center text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            {Number.parseFloat(`${zoom * 100}`).toFixed(0)}%
          </div>

          {/* Zoom In */}
          <ZoomTooltip title="Acercar" shortcuts={['Ctrl', '+']}>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                zoom >= 2 ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-black/5'
              }`}
              onClick={(e) => {
                if (zoom >= 2) return
                e.stopPropagation()
                zoomIn()
              }}
            >
              <ZoomIn className="h-4 w-4 text-gray-500 hover:text-gray-700" />
            </div>
          </ZoomTooltip>
        </div>
      </div>

      {/* Dropdown Menu */}
      {open && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setOpen(false)}
          />
          
          {/* Menu - Alineado a la derecha para evitar overflow */}
          <div className="absolute bottom-full right-0 z-50 mb-1 w-[145px] rounded-xl border-[0.5px] border-gray-200 bg-white/95 shadow-lg backdrop-blur-[5px]">
            {ZOOM_IN_OUT_OPTIONS.map((options, i) => (
              <Fragment key={i}>
                {i !== 0 && <div className="h-px bg-gray-100" />}
                <div className="p-1">
                  {options.map(option => {
                    const isCurrentZoom = 
                      (option.key === ZoomType.zoomTo25 && Math.abs(zoom - 0.25) < 0.01) ||
                      (option.key === ZoomType.zoomTo50 && Math.abs(zoom - 0.5) < 0.01) ||
                      (option.key === ZoomType.zoomTo75 && Math.abs(zoom - 0.75) < 0.01) ||
                      (option.key === ZoomType.zoomTo100 && Math.abs(zoom - 1) < 0.01) ||
                      (option.key === ZoomType.zoomTo200 && Math.abs(zoom - 2) < 0.01)

                    return (
                      <div
                        key={option.key}
                        className="flex h-8 cursor-pointer items-center justify-between rounded-lg py-1.5 pl-3 pr-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => handleZoom(option.key)}
                      >
                        <span>{option.text}</span>
                        {isCurrentZoom && <Check className="h-4 w-4 text-blue-600" />}
                      </div>
                    )
                  })}
                </div>
              </Fragment>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
