import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Page, PageHeader, PageTitle, PageActions, PageBody,
  DataTable, EmptyState, Button, Dialog, DialogContent,
  DialogHeader, DialogTitle, Badge, toast,
} from '@blinkdotnew/ui'
import { CalendarCheck, Plus, Trash2 } from 'lucide-react'
import { blink } from '../blink/client'
import type { Reservation, Book, LibraryUser, Employee } from '../types'
import type { ColumnDef } from '@tanstack/react-table'
import ReservationForm from '../components/ReservationForm'
import { format } from 'date-fns'

export default function ReservationsPage() {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const { data: reservations = [], isLoading } = useQuery<Reservation[]>({
    queryKey: ['reservations'],
    queryFn: async () => blink.db.reservations.list({ orderBy: { createdAt: 'desc' } }) as Promise<Reservation[]>,
  })

  const { data: books = [] } = useQuery<Book[]>({
    queryKey: ['books'],
    queryFn: async () => blink.db.books.list() as Promise<Book[]>,
  })

  const { data: users = [] } = useQuery<LibraryUser[]>({
    queryKey: ['library_users'],
    queryFn: async () => blink.db.libraryUsers.list() as Promise<LibraryUser[]>,
  })

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ['employees'],
    queryFn: async () => blink.db.employees.list() as Promise<Employee[]>,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => blink.db.reservations.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      toast.success('Reserva eliminada')
    },
    onError: () => toast.error('Error al eliminar la reserva'),
  })

  const bookMap = Object.fromEntries(books.map(b => [b.id, b]))
  const userMap = Object.fromEntries(users.map(u => [u.id, u]))
  const empMap = Object.fromEntries(employees.map(e => [e.id, e]))

  const userStatusBadge: Record<string, 'default' | 'secondary' | 'destructive'> = {
    active: 'default',
    inactive: 'secondary',
    suspended: 'destructive',
  }
  const userStatusLabel: Record<string, string> = {
    active: 'Activo',
    inactive: 'Inactivo',
    suspended: 'Suspendido',
  }

  const columns: ColumnDef<Reservation>[] = [
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
