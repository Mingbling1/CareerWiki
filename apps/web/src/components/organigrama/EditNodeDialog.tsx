import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { OrgNode } from '@/types/organigrama'

interface EditNodeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  node: OrgNode | null
  nodes: OrgNode[]
  onUpdate: (id: string, updates: Partial<OrgNode>) => void
  onDelete: (id: string) => void
}

export function EditNodeDialog({ 
  open, 
  onOpenChange, 
  node, 
  nodes, 
  onUpdate, 
  onDelete 
}: EditNodeDialogProps) {
  const [position, setPosition] = useState('')
  const [department, setDepartment] = useState('')
  const [salary, setSalary] = useState('')
  const [parentId, setParentId] = useState<string>('')

  // Actualizar form cuando cambia el nodo seleccionado
  useEffect(() => {
    if (node) {
      setPosition(node.position || '')
      setDepartment(node.department || '')
      setSalary(node.salary?.toString() || '')
      setParentId(node.parentId || '')
    }
  }, [node])

  // Filtrar nodos disponibles como padre (excluir el nodo actual y sus hijos)
  const availableParents = nodes.filter(n => {
    if (!node) return true
    if (n.id === node.id) return false
    // TODO: También excluir hijos para evitar ciclos
    return true
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!node) return
    
    onUpdate(node.id, {
      position: position.trim(),
      department: department.trim(),
      salary: parseFloat(salary) || 0,
      parentId: parentId || null,
    })
    
    onOpenChange(false)
  }

  const handleDelete = () => {
    if (!node) return
    if (confirm('¿Estás seguro de eliminar este cargo?')) {
      onDelete(node.id)
      onOpenChange(false)
    }
  }

  if (!node) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Cargo</DialogTitle>
          <DialogDescription>
            Modifica los datos del cargo seleccionado.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-position">Cargo *</Label>
              <Input
                id="edit-position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="Ej: Gerente General"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-department">Departamento</Label>
              <Input
                id="edit-department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Ej: Dirección"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-salary">Sueldo (S/.)</Label>
              <Input
                id="edit-salary"
                type="number"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="5000"
                min="0"
                step="100"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-parent">Reporta a</Label>
              <Select value={parentId || "none"} onValueChange={(val) => setParentId(val === "none" ? "" : val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sin jefe directo (raíz)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin jefe directo (raíz)</SelectItem>
                  {availableParents.map((n) => (
                    <SelectItem key={n.id} value={n.id}>
                      {n.position} - {n.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="flex justify-between">
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">Guardar</Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
