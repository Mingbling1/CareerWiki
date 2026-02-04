import { Button } from '@/components/ui/button'
import { ButtonGroup, ButtonGroupItem } from '@/components/ui/button-group'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Maximize2, 
  Download,
  Users
} from 'lucide-react'

interface ToolbarProps {
  onAddNode: () => void
  onFitView: () => void
  onExport: () => void
  isConnected: boolean
  userCount: number
}

export function Toolbar({
  onAddNode,
  onFitView,
  onExport,
  isConnected,
  userCount,
}: ToolbarProps) {
  return (
    <div className="flex items-center justify-between p-3 border-b border-[var(--border)] bg-[var(--card)]">
      <div className="flex items-center gap-3">
        <Button onClick={onAddNode} size="sm">
          <Plus className="h-4 w-4" />
          Agregar Cargo
        </Button>
        
        <ButtonGroup size="sm">
          <ButtonGroupItem onClick={onFitView} title="Ajustar Vista">
            <Maximize2 className="h-4 w-4" />
          </ButtonGroupItem>
          <ButtonGroupItem onClick={onExport} title="Exportar PNG">
            <Download className="h-4 w-4" />
          </ButtonGroupItem>
        </ButtonGroup>
      </div>
      
      <div className="flex items-center gap-3">
        {/* Estado de conexión */}
        <div className="flex items-center gap-2">
          <div 
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'
            }`} 
          />
          <span className="text-sm text-[var(--muted-foreground)]">
            {isConnected ? 'Conectado' : 'Conectando...'}
          </span>
        </div>
        
        {/* Usuarios conectados */}
        <Badge variant="secondary" className="gap-1">
          <Users className="h-3 w-3" />
          {userCount}
        </Badge>
      </div>
    </div>
  )
}
