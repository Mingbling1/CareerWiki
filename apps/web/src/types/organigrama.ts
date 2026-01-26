/**
 * Tipos para el Organigrama
 */

export interface OrgNode {
  id: string
  parentId: string | null
  position: string      // Cargo
  department: string    // Departamento
  salary: number        // Sueldo
}

export interface OrgNodeData extends OrgNode {
  hasChildren?: boolean
  isExpanded?: boolean
  level?: number
}

export interface ConnectedUser {
  id: string
  name: string
  color: string
}

export interface OrganigramaStats {
  totalEmployees: number
  totalSalary: number
  avgSalary: number
}
