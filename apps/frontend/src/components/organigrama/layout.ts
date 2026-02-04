import type { OrgNode } from '@/types/organigrama'
import type { Node, Edge } from '@xyflow/react'

interface LayoutNode extends Node {
  data: OrgNode
  width: number
  height: number
}

const NODE_WIDTH = 220
const NODE_HEIGHT = 100
const HORIZONTAL_GAP = 40
const VERTICAL_GAP = 80

/**
 * Convierte datos planos de organigrama a nodos y edges de React Flow
 * con layout jerárquico automático
 */
export function buildOrgChartLayout(data: OrgNode[]): { nodes: Node[], edges: Edge[] } {
  if (!data || data.length === 0) {
    return { nodes: [], edges: [] }
  }

  // Crear mapa de nodos por ID
  const nodeMap = new Map<string, OrgNode>()
  data.forEach(node => nodeMap.set(node.id, node))

  // Encontrar nodos raíz (sin padre)
  const roots = data.filter(node => !node.parentId || !nodeMap.has(node.parentId))

  // Construir árbol de hijos
  const childrenMap = new Map<string, OrgNode[]>()
  data.forEach(node => {
    if (node.parentId && nodeMap.has(node.parentId)) {
      const children = childrenMap.get(node.parentId) || []
      children.push(node)
      childrenMap.set(node.parentId, children)
    }
  })

  // Calcular el ancho de cada subárbol
  const subtreeWidths = new Map<string, number>()
  
  function calculateSubtreeWidth(nodeId: string): number {
    const children = childrenMap.get(nodeId) || []
    if (children.length === 0) {
      subtreeWidths.set(nodeId, NODE_WIDTH)
      return NODE_WIDTH
    }
    
    const childrenWidth = children.reduce((sum, child) => {
      return sum + calculateSubtreeWidth(child.id) + HORIZONTAL_GAP
    }, -HORIZONTAL_GAP) // Restar el último gap
    
    const width = Math.max(NODE_WIDTH, childrenWidth)
    subtreeWidths.set(nodeId, width)
    return width
  }

  // Calcular anchos para todos los nodos raíz
  roots.forEach(root => calculateSubtreeWidth(root.id))

  // Posicionar nodos
  const nodes: LayoutNode[] = []
  const edges: Edge[] = []

  function positionNode(node: OrgNode, x: number, y: number, level: number) {
    nodes.push({
      id: node.id,
      type: 'orgNode',
      position: { x, y },
      data: { ...node, level },
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
    })

    const children = childrenMap.get(node.id) || []
    
    if (children.length > 0) {
      // Calcular posición inicial de hijos
      const subtreeWidth = subtreeWidths.get(node.id) || NODE_WIDTH
      let childX = x + (NODE_WIDTH - subtreeWidth) / 2
      
      children.forEach(child => {
        const childSubtreeWidth = subtreeWidths.get(child.id) || NODE_WIDTH
        const childCenterX = childX + childSubtreeWidth / 2 - NODE_WIDTH / 2
        
        // Crear edge
        edges.push({
          id: `edge-${node.id}-${child.id}`,
          source: node.id,
          target: child.id,
          type: 'smoothstep',
          style: { stroke: 'var(--border)', strokeWidth: 2 },
        })
        
        // Posicionar hijo recursivamente
        positionNode(child, childCenterX, y + NODE_HEIGHT + VERTICAL_GAP, level + 1)
        
        childX += childSubtreeWidth + HORIZONTAL_GAP
      })
    }
  }

  // Posicionar todos los nodos raíz
  let rootX = 0
  roots.forEach(root => {
    const rootWidth = subtreeWidths.get(root.id) || NODE_WIDTH
    positionNode(root, rootX + (rootWidth - NODE_WIDTH) / 2, 0, 0)
    rootX += rootWidth + HORIZONTAL_GAP * 2
  })

  return { nodes, edges }
}

/**
 * Calcula estadísticas del organigrama
 */
export function calculateStats(data: OrgNode[]) {
  if (!data || data.length === 0) {
    return { totalEmployees: 0, totalSalary: 0, avgSalary: 0 }
  }

  const totalEmployees = data.length
  const totalSalary = data.reduce((sum, node) => sum + (node.salary || 0), 0)
  const avgSalary = Math.round(totalSalary / totalEmployees)

  return { totalEmployees, totalSalary, avgSalary }
}
