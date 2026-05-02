import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Page, PageHeader, PageTitle, PageActions, PageBody,
  DataTable, EmptyState, Button, Dialog, DialogContent,
  DialogHeader, DialogTitle, Badge, toast,
} from '@blinkdotnew/ui'
import { CalendarCheck, Plus, Trash2 } from 'lucide-react'
import { blink } from '../blink/client'
import ReservationForm from '../components/ReservationForm'
import { format } from 'date-fns'

export default function ReservationsPage() {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const { data: reservations = [], isLoading } = useQuery({
    queryKey: ['reservations'],
    queryFn: async () => await blink.db.reservations.list({ orderBy: { createdAt: 'desc' } }),
  })

  const { data: books = [] } = useQuery({
    queryKey: ['books'],
    queryFn: async () => await blink.db.books.list(),
  })

  const { data: users = [] } = useQuery({
    queryKey: ['library_users'],
    queryFn: async () => await blink.db.libraryUsers.list(),
  })

  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => await blink.db.employees.list(),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => blink.db.reservations.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      toast.success('Reserva eliminada')
    },
    onError: () => toast.error('Error al eliminar la reserva'),
  })

  const bookMap = Object.fromEntries(books.map(b => [b.id, b]))
  const userMap = Object.fromEntries(users.map(u => [u.id, u]))
  const empMap = Object.fromEntries(employees.map(e => [e.id, e]))

  const userStatusBadge = {
    active: 'default',
    inactive: 'secondary',
    suspended: 'destructive',
  }
  const userStatusLabel = {
    active: 'Activo',
    inactive: 'Inactivo',
    suspended: 'Suspendido',
  }

  const columns = [
    { accessorKey: 'id', header: 'ID Reserva', cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span> },
    {
      accessorKey: 'bookId', header: 'Libro',
      cell: ({ row }) => bookMap[row.original.bookId]?.title ?? row.original.bookId,
    },
    {
      accessorKey: 'userId', header: 'Usuario',
      cell: ({ row }) => {
        const u = userMap[row.original.userId]
        return u ? `${u.firstName} ${u.lastName}` : row.original.userId
      },
    },
    { accessorKey: 'reservationDate', header: 'Fecha Reserva', cell: ({ row }) => format(new Date(row.original.reservationDate), 'dd/MM/yyyy') },
    { accessorKey: 'returnDate', header: 'Fecha Devolución', cell: ({ row }) => format(new Date(row.original.returnDate), 'dd/MM/yyyy') },
    {
      accessorKey: 'userStatus', header: 'Estado Usuario',
      cell: ({ row }) => <Badge variant={userStatusBadge[row.original.userStatus]}>{userStatusLabel[row.original.userStatus]}</Badge>,
    },
    {
      accessorKey: 'employeeId', header: 'Empleado',
      cell: ({ row }) => {
        const e = empMap[row.original.employeeId]
        return e ? `${e.firstName} ${e.lastName}` : row.original.employeeId
      },
    },
    {
      id: 'actions', header: '',
      cell: ({ row }) => (
        <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => deleteMutation.mutate(row.original.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ]

  return (
    <Page>
      <PageHeader>
        <PageTitle>Reservas</PageTitle>
        <PageActions>
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />Nueva Reserva
          </Button>
        </PageActions>
      </PageHeader>
      <PageBody>
        {reservations.length === 0 && !isLoading
          ? <EmptyState icon={<CalendarCheck />} title="Sin reservas registradas" description="Registra la primera reserva de un libro." action={{ label: 'Nueva Reserva', onClick: () => setOpen(true) }} />
          : <DataTable columns={columns} data={reservations} loading={isLoading} />
        }
      </PageBody>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Reserva</DialogTitle>
          </DialogHeader>
          <ReservationForm
            books={books}
            users={users}
            employees={employees}
            onSuccess={() => { setOpen(false); queryClient.invalidateQueries({ queryKey: ['reservations'] }) }}
            onCancel={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Page>
  )
}
