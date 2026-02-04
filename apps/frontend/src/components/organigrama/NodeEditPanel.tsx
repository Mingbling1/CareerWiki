import { useState, useEffect } from 'react'
import { X, Trash2, User, Building2, DollarSign, GitBranch } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { OrgNode } from '@/types/organigrama'

interface NodeEditPanelProps {
  node: OrgNode | null
  nodes: OrgNode[]
  onClose: () => void
  onUpdate: (id: string, updates: Partial<OrgNode>) => void
  onDelete: (id: string) => void
}

export function NodeEditPanel({
  node,
  nodes,
  onClose,
  onUpdate,
  onDelete,
}: NodeEditPanelProps) {
  const [position, setPosition] = useState('')
  const [department, setDepartment] = useState('')
  const [salary, setSalary] = useState('')
  const [parentId, setParentId] = useState<string | null>(null)

  // Actualizar form cuando cambia el nodo
  useEffect(() => {
    if (node) {
      setPosition(node.position)
      setDepartment(node.department)
      setSalary(node.salary.toString())
      setParentId(node.parentId)
    }
  }, [node])

  if (!node) return null

  // Nodos posibles como padre (todos excepto el actual y sus descendientes)
  const getDescendants = (nodeId: string): string[] => {
    const children = nodes.filter(n => n.parentId === nodeId)
    return [nodeId, ...children.flatMap(c => getDescendants(c.id))]
  }
  const descendants = getDescendants(node.id)
  const possibleParents = nodes.filter(n => !descendants.includes(n.id))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate(node.id, {
      position,
      department,
      salary: Number(salary),
      parentId,
    })
  }

  const handleDelete = () => {
    onDelete(node.id)
    onClose()
  }

  return (
    <div className="absolute right-2 top-2 bottom-2 z-50 flex w-[420px] flex-col rounded-2xl border border-gray-200 bg-white shadow-xl">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-gray-100 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
            <User className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">{node.position}</h2>
            <p className="text-xs text-gray-500">{node.department}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-y-auto">
        <div className="space-y-4 p-4">
          {/* Cargo */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-gray-400" />
              <Label htmlFor="position" className="text-xs font-medium uppercase text-gray-500">
                Cargo
              </Label>
            </div>
            <Input
              id="position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="h-9"
              placeholder="Ej: Director de Marketing"
              required
            />
          </div>

          {/* Departamento */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Building2 className="h-3.5 w-3.5 text-gray-400" />
              <Label htmlFor="department" className="text-xs font-medium uppercase text-gray-500">
                Departamento
              </Label>
            </div>
            <Input
              id="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="h-9"
              placeholder="Ej: Marketing"
              required
            />
          </div>

          {/* Salario */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-3.5 w-3.5 text-gray-400" />
              <Label htmlFor="salary" className="text-xs font-medium uppercase text-gray-500">
                Salario Mensual (USD)
              </Label>
            </div>
            <Input
              id="salary"
              type="number"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              className="h-9"
              placeholder="Ej: 5000"
              min={0}
              required
            />
          </div>

          {/* Reporta a */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <GitBranch className="h-3.5 w-3.5 text-gray-400" />
              <Label htmlFor="parent" className="text-xs font-medium uppercase text-gray-500">
                Reporta a
              </Label>
            </div>
            <Select
              value={parentId || 'none'}
              onValueChange={(val) => setParentId(val === 'none' ? null : val)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Seleccionar superior" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <span className="text-gray-500">Sin superior (CEO/Presidente)</span>
                </SelectItem>
                {possibleParents.map((parent) => (
                  <SelectItem key={parent.id} value={parent.id}>
                    {parent.position} - {parent.department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Info adicional */}
          <div className="rounded-lg bg-gray-50 p-3">
            <h4 className="mb-2 text-xs font-medium uppercase text-gray-500">Información</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">ID:</span>
                <span className="font-mono text-xs text-gray-600">{node.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Subordinados directos:</span>
                <span className="font-medium text-gray-700">
                  {nodes.filter(n => n.parentId === node.id).length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto border-t border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="mr-1.5 h-4 w-4" />
              Eliminar
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" size="sm">
                Guardar cambios
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
