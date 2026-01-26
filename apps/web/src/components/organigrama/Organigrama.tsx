import { useState, useCallback, useEffect, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  SelectionMode,
  type Node,
  Panel,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { OrgChartNode } from './OrgChartNode'
import { ControlsPanel, ZoomInOut } from './CustomControls'
import type { ControlMode } from './CustomControls'
import { Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { StatsFooter } from './StatsFooter'
import { AddNodeDialog } from './AddNodeDialog'
import { NodeEditPanel } from './NodeEditPanel'
import { buildOrgChartLayout, calculateStats } from './layout'
import { getCollaborativeStore } from '@/lib/collaborative-store'
import type { OrgNode, OrganigramaStats } from '@/types/organigrama'

// Tipos de nodos personalizados
const nodeTypes = {
  orgNode: OrgChartNode,
}

// Datos iniciales de ejemplo
const initialData: OrgNode[] = [
  {
    id: 'ceo-1',
    parentId: null,
    position: 'CEO',
    department: 'Dirección General',
    salary: 25000,
  },
  {
    id: 'cfo-1',
    parentId: 'ceo-1',
    position: 'CFO',
    department: 'Finanzas',
    salary: 18000,
  },
  {
    id: 'cto-1',
    parentId: 'ceo-1',
    position: 'CTO',
    department: 'Tecnología',
    salary: 18000,
  },
  {
    id: 'coo-1',
    parentId: 'ceo-1',
    position: 'COO',
    department: 'Operaciones',
    salary: 17000,
  },
  {
    id: 'dev-1',
    parentId: 'cto-1',
    position: 'Tech Lead',
    department: 'Desarrollo',
    salary: 12000,
  },
  {
    id: 'dev-2',
    parentId: 'dev-1',
    position: 'Senior Developer',
    department: 'Backend',
    salary: 8000,
  },
  {
    id: 'dev-3',
    parentId: 'dev-1',
    position: 'Senior Developer',
    department: 'Frontend',
    salary: 8000,
  },
]

function OrganigramaFlow() {
  const { fitView } = useReactFlow()
  
  // Estado de datos del organigrama
  const [orgData, setOrgData] = useState<OrgNode[]>([])
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  
  // Estado de UI
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [selectedNode, setSelectedNode] = useState<OrgNode | null>(null)
  
  // Modo de control (pointer o hand) - como Dify
  const [controlMode, setControlMode] = useState<ControlMode>('hand')
  
  // Estado de conexión
  const [isConnected, setIsConnected] = useState(false)
  const [userCount, setUserCount] = useState(1)
  
  // Estadísticas
  const stats: OrganigramaStats = useMemo(() => calculateStats(orgData), [orgData])
  
  // Store colaborativo
  const store = useMemo(() => getCollaborativeStore(), [])

  // Atajos de teclado para cambiar modo (V = pointer, H = hand) como Dify
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar si está escribiendo en un input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      
      if (e.key.toLowerCase() === 'v') {
        setControlMode('pointer')
      } else if (e.key.toLowerCase() === 'h') {
        setControlMode('hand')
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Inicializar store y suscribirse a cambios
  useEffect(() => {
    const initStore = async () => {
      // Escuchar cambios en datos
      store.onDataChange((data) => {
        setOrgData(data)
      })
      
      // Escuchar cambios de conexión
      store.onConnectionChange((connected, count) => {
        setIsConnected(connected)
        setUserCount(count)
      })
      
      // Conectar
      await store.connect()
      
      // Si no hay datos, cargar los iniciales
      const currentData = store.getData()
      if (currentData.length === 0) {
        initialData.forEach(node => store.addNode(node))
      } else {
        setOrgData(currentData)
      }
    }
    
    initStore()
    
    return () => {
      store.disconnect()
    }
  }, [store])

  // Recalcular layout cuando cambian los datos
  useEffect(() => {
    const { nodes: layoutNodes, edges: layoutEdges } = buildOrgChartLayout(orgData)
    setNodes(layoutNodes)
    setEdges(layoutEdges)
    
    // Ajustar vista después del layout
    setTimeout(() => fitView({ padding: 0.2 }), 100)
  }, [orgData, setNodes, setEdges, fitView])

  // Handlers
  const handleAddNode = useCallback((newNode: OrgNode) => {
    store.addNode(newNode)
  }, [store])

  const handleUpdateNode = useCallback((id: string, updates: Partial<OrgNode>) => {
    store.updateNode(id, updates)
  }, [store])

  const handleDeleteNode = useCallback((id: string) => {
    // Reasignar hijos al padre del nodo eliminado
    const nodeToDelete = orgData.find(n => n.id === id)
    if (nodeToDelete) {
      const children = orgData.filter(n => n.parentId === id)
      children.forEach(child => {
        store.updateNode(child.id, { parentId: nodeToDelete.parentId })
      })
    }
    store.removeNode(id)
  }, [store, orgData])

  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    const orgNode = orgData.find(n => n.id === node.id)
    if (orgNode) {
      setSelectedNode(orgNode)
    }
  }, [orgData])

  const handleClosePanel = useCallback(() => {
    setSelectedNode(null)
  }, [])

  return (
    <div className="h-screen w-full bg-[var(--background)]">
      {/* React Flow Canvas - Full Screen con footer integrado */}
      <div className="relative h-full w-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          onPaneClick={handleClosePanel}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
          minZoom={0.1}
          maxZoom={2}
          // Modo pointer: selección con scroll, arrastrar con click izquierdo
          // Modo hand: arrastrar canvas con click izquierdo
          panOnScroll={controlMode === 'pointer'}
          panOnDrag={controlMode === 'hand' ? true : [1, 2]}
          selectionOnDrag={controlMode === 'pointer'}
          selectionMode={SelectionMode.Partial}
          zoomOnScroll
          multiSelectionKeyCode={null}
        >
          {/* Panel superior central - Solo estado de conexión */}
          <Panel position="top-center" className="flex items-center gap-3">
            {/* Estado de conexión */}
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-md shadow-md border border-gray-200">
              <div 
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'
                }`} 
              />
              <span className="text-xs text-gray-500">
                {isConnected ? 'Conectado' : 'Conectando...'}
              </span>
              <Badge variant="secondary" className="gap-1 ml-1">
                <Users className="h-3 w-3" />
                {userCount}
              </Badge>
            </div>
          </Panel>
          
          {/* Controls Panel - Centro izquierda */}
          <Panel position="top-left" className="!left-4 !top-1/2 !-translate-y-1/2">
            <ControlsPanel 
              onAddClick={() => setAddDialogOpen(true)} 
              controlMode={controlMode}
              onModeChange={setControlMode}
              onOrganize={() => fitView({ padding: 0.2 })}
            />
          </Panel>
          
          <Background gap={20} size={1} />
        </ReactFlow>
        
        {/* MiniMap - Estilo Dify (FUERA del ReactFlow) */}
        <MiniMap 
          nodeColor="#9ca3af"
          maskColor="#e9ebf0"
          zoomable
          pannable
          style={{ width: 102, height: 72 }}
          className="!absolute !bottom-14 !right-4 z-[5] !m-0 !rounded-lg !border-[0.5px] !border-gray-200 !bg-[#f9fafb] !shadow-md"
        />
        
        {/* Zoom Controls - Debajo del MiniMap */}
        <div className="pointer-events-auto absolute bottom-4 right-4 z-[20]">
          <ZoomInOut />
        </div>
        
        {/* Stats Footer - Estilo Dify (dentro del contenedor) */}
        <StatsFooter stats={stats} />
      </div>
      
      {/* Dialogs */}
      <AddNodeDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        nodes={orgData}
        onAdd={handleAddNode}
      />
      
      {/* Panel lateral de edición - Estilo Dify */}
      {selectedNode && (
        <NodeEditPanel
          node={selectedNode}
          nodes={orgData}
          onClose={handleClosePanel}
          onUpdate={handleUpdateNode}
          onDelete={handleDeleteNode}
        />
      )}
    </div>
  )
}

// Wrapper con ReactFlowProvider
export function Organigrama() {
  return (
    <ReactFlowProvider>
      <OrganigramaFlow />
    </ReactFlowProvider>
  )
}
