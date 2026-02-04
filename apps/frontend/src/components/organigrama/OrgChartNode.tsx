import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { formatCurrency } from '@/lib/utils'
import type { OrgNodeData } from '@/types/organigrama'
import { Badge } from '@/components/ui/badge'

interface OrgNodeProps extends NodeProps {
  data: OrgNodeData
}

export const OrgChartNode = memo(({ data, selected }: OrgNodeProps) => {
  return (
    <div
      className={`
        min-w-[200px] rounded-lg border bg-[var(--card)] p-4 shadow-sm transition-all
        hover:shadow-md cursor-pointer
        ${selected ? 'ring-2 ring-[var(--ring)] ring-offset-2' : ''}
      `}
    >
      {/* Handle superior para conexión con padre */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-gray-300 !w-2 !h-2 !border-2 !border-white !-top-1"
        isConnectable={false}
      />
      
      {/* Contenido del nodo */}
      <div className="space-y-2">
        {/* Cargo */}
        <h3 className="font-semibold text-sm text-[var(--foreground)] leading-tight">
          {data.position || 'Sin cargo'}
        </h3>
        
        {/* Departamento */}
        {data.department && (
          <Badge variant="secondary" className="text-xs">
            {data.department}
          </Badge>
        )}
        
        {/* Salario */}
        <p className="text-sm font-medium text-[var(--success)]">
          {formatCurrency(data.salary || 0)}
        </p>
      </div>
      
      {/* Handle inferior para conexión con hijos */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-gray-300 !w-2 !h-2 !border-2 !border-white !-bottom-1"
        isConnectable={false}
      />
    </div>
  )
})

OrgChartNode.displayName = 'OrgChartNode'
