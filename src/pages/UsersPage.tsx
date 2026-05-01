import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Page, PageHeader, PageTitle, PageActions, PageBody,
  DataTable, EmptyState, Button, Dialog, DialogContent,
  DialogHeader, DialogTitle, DialogFooter, Badge, toast,
} from '@blinkdotnew/ui'
import { Users, Plus, Trash2, Edit2 } from 'lucide-react'
import { blink } from '../blink/client'
import type { LibraryUser } from '../types'
import type { ColumnDef } from '@tanstack/react-table'
import UserForm from '../components/UserForm'

export default function UsersPage() {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<LibraryUser | null>(null)

  const { data: users = [], isLoading } = useQuery<LibraryUser[]>({
    queryKey: ['library_users'],
    queryFn: async () => {
      const result = await blink.db.libraryUsers.list({ orderBy: { createdAt: 'desc' } })
      return result as LibraryUser[]
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await blink.db.libraryUsers.delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library_users'] })
      toast.success('Usuario eliminado correctamente')
    },
    onError: () => toast.error('Error al eliminar el usuario'),
  })

  const userTypeLabel: Record<string, string> = {
    student: 'Estudiante',
    teacher: 'Docente',
    external: 'Externo',
  }
  const userTypeBadge: Record<string, 'default' | 'secondary' | 'outline'> = {
    student: 'default',
    teacher: 'secondary',
    external: 'outline',
  }

  const columns: ColumnDef<LibraryUser>[] = [
    { accessorKey: 'id', header: 'ID', cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.id.slice(0, 8)}...</span> },
    { accessorKey: 'firstName', header: 'Nombre', cell: ({ row }) => `${row.original.firstName} ${row.original.lastName}` },
    { accessorKey: 'email', header: 'Correo' },
    { accessorKey: 'phone', header: 'Teléfono' },
    {
      accessorKey: 'userType', header: 'Tipo',
      cell: ({ row }) => (
        <Badge variant={userTypeBadge[row.original.userType]}>
          {userTypeLabel[row.original.userType] ?? row.original.userType}
        </Badge>
      ),
    },
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
        <PageTitle>Usuarios</PageTitle>
        <PageActions>
          <Button onClick={() => { setEditing(null); setOpen(true) }}>
            <Plus className="h-4 w-4 mr-2" />Nuevo Usuario
          </Button>
        </PageActions>
      </PageHeader>
      <PageBody>
        {users.length === 0 && !isLoading
          ? <EmptyState icon={<Users />} title="Sin usuarios registrados" description="Agrega tu primer usuario para comenzar." action={{ label: 'Nuevo Usuario', onClick: () => setOpen(true) }} />
          : <DataTable columns={columns} data={users} loading={isLoading} searchable searchColumn="email" />
        }
      </PageBody>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
          </DialogHeader>
          <UserForm
            initialData={editing}
            onSuccess={() => { setOpen(false); queryClient.invalidateQueries({ queryKey: ['library_users'] }) }}
            onCancel={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Page>
  )
}
