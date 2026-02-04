import { useState } from 'react'
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
import { generateId } from '@/lib/utils'

interface AddNodeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  nodes: OrgNode[]
  onAdd: (node: OrgNode) => void
}

export function AddNodeDialog({ open, onOpenChange, nodes, onAdd }: AddNodeDialogProps) {
  const [position, setPosition] = useState('')
  const [department, setDepartment] = useState('')
  const [salary, setSalary] = useState('')
  const [parentId, setParentId] = useState<string>('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newNode: OrgNode = {
      id: generateId(),
      parentId: parentId || null,
      position: position.trim(),
      department: department.trim(),
      salary: parseFloat(salary) || 0,
    }
    
    onAdd(newNode)
    resetForm()
    onOpenChange(false)
  }

  const resetForm = () => {
    setPosition('')
    setDepartment('')
    setSalary('')
    setParentId('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Agregar Cargo</DialogTitle>
          <DialogDescription>
            Agrega un nuevo cargo al organigrama.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="position">Cargo *</Label>
              <Input
                id="position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="Ej: Gerente General"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="department">Departamento</Label>
              <Input
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Ej: Dirección"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="salary">Sueldo (S/.)</Label>
              <Input
                id="salary"
                type="number"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="5000"
                min="0"
                step="100"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="parent">Reporta a</Label>
              <Select value={parentId || "none"} onValueChange={(val) => setParentId(val === "none" ? "" : val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sin jefe directo (raíz)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin jefe directo (raíz)</SelectItem>
                  {nodes.map((node) => (
                    <SelectItem key={node.id} value={node.id}>
                      {node.position} - {node.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Agregar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
