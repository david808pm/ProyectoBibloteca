import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Page, PageHeader, PageTitle, PageActions, PageBody,
  DataTable, EmptyState, Button, Dialog, DialogContent,
  DialogHeader, DialogTitle, toast,
} from '@blinkdotnew/ui'
import { Briefcase, Plus, Trash2, Edit2 } from 'lucide-react'
import { blink } from '../blink/client'
import type { Employee } from '../types'
import type { ColumnDef } from '@tanstack/react-table'
import EmployeeForm from '../components/EmployeeForm'

export default function EmployeesPage() {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Employee | null>(null)

  const { data: employees = [], isLoading } = useQuery<Employee[]>({
    queryKey: ['employees'],
    queryFn: async () => {
      const result = await blink.db.employees.list({ orderBy: { createdAt: 'desc' } })
      return result as Employee[]
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => blink.db.employees.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      toast.success('Empleado eliminado')
    },
    onError: () => toast.error('Error al eliminar el empleado'),
  })

  const columns: ColumnDef<Employee>[] = [
    { accessorKey: 'id', header: 'ID', cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.id}</span> },
    { accessorKey: 'firstName', header: 'Nombre', cell: ({ row }) => `${row.original.firstName} ${row.original.lastName}` },
    { accessorKey: 'email', header: 'Correo' },
    { accessorKey: 'phone', header: 'Teléfono' },
    {
      id: 'actions', header: 'Acciones',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button size="icon" variant="ghost" onClick={() => { setEditing(row.original); setOpen(true) }}>
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => deleteMutation.mutate(row.original.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <Page>
      <PageHeader>
        <PageTitle>Empleados</PageTitle>
        <PageActions>
          <Button onClick={() => { setEditing(null); setOpen(true) }}>
            <Plus className="h-4 w-4 mr-2" />Nuevo Empleado
          </Button>
        </PageActions>
      </PageHeader>
      <PageBody>
        {employees.length === 0 && !isLoading
          ? <EmptyState icon={<Briefcase />} title="Sin empleados registrados" description="Agrega el primer empleado del sistema." action={{ label: 'Nuevo Empleado', onClick: () => setOpen(true) }} />
          : <DataTable columns={columns} data={employees} loading={isLoading} searchable searchColumn="email" />
        }
      </PageBody>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Empleado' : 'Nuevo Empleado'}</DialogTitle>
          </DialogHeader>
          <EmployeeForm
            initialData={editing}
            onSuccess={() => { setOpen(false); queryClient.invalidateQueries({ queryKey: ['employees'] }) }}
            onCancel={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Page>
  )
}
