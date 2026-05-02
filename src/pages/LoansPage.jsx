import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Page, PageHeader, PageTitle, PageActions, PageBody,
  DataTable, EmptyState, Button, Dialog, DialogContent,
  DialogHeader, DialogTitle, Badge, toast,
} from '@blinkdotnew/ui'
import { BookMarked, Plus, Trash2 } from 'lucide-react'
import { blink } from '../blink/client'
import LoanForm from '../components/LoanForm'
import { format } from 'date-fns'

export default function LoansPage() {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const { data: loans = [], isLoading } = useQuery({
    queryKey: ['loans'],
    queryFn: async () => await blink.db.loans.list({ orderBy: { createdAt: 'desc' } }),
  })

  const { data: books = [] } = useQuery({
    queryKey: ['books'],
    queryFn: async () => await blink.db.books.list(),
  })

  const { data: users = [] } = useQuery({
    queryKey: ['library_users'],
    queryFn: async () => await blink.db.libraryUsers.list(),
  })

  const deleteMutation = useMutation({
    mutationFn: async (loan) => {
      await blink.db.books.update(loan.bookId, { available: 1 })
      await blink.db.loans.delete(loan.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] })
      queryClient.invalidateQueries({ queryKey: ['books'] })
      toast.success('Préstamo eliminado — libro disponible nuevamente')
    },
    onError: () => toast.error('Error al eliminar el préstamo'),
  })

  const bookMap = Object.fromEntries(books.map(b => [b.id, b]))
  const userMap = Object.fromEntries(users.map(u => [u.id, u]))

  const statusBadge = {
    active: 'default',
    returned: 'secondary',
    overdue: 'destructive',
  }
  const statusLabel = {
    active: 'Activo',
    returned: 'Devuelto',
    overdue: 'Vencido',
  }

  const columns = [
    { accessorKey: 'id', header: 'ID Préstamo', cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span> },
    {
      accessorKey: 'userId', header: 'Usuario',
      cell: ({ row }) => {
        const u = userMap[row.original.userId]
        return u ? `${u.firstName} ${u.lastName}` : row.original.userId
      },
    },
    {
      accessorKey: 'userType', header: 'Tipo Usuario',
      cell: ({ row }) => <Badge variant="outline">{row.original.userType}</Badge>,
    },
    {
      accessorKey: 'bookId', header: 'Libro',
      cell: ({ row }) => bookMap[row.original.bookId]?.title ?? row.original.bookId,
    },
    { accessorKey: 'loanDate', header: 'Fecha Préstamo', cell: ({ row }) => format(new Date(row.original.loanDate), 'dd/MM/yyyy') },
    { accessorKey: 'returnDate', header: 'Fecha Devolución', cell: ({ row }) => format(new Date(row.original.returnDate), 'dd/MM/yyyy') },
    {
      accessorKey: 'status', header: 'Estado',
      cell: ({ row }) => <Badge variant={statusBadge[row.original.status]}>{statusLabel[row.original.status]}</Badge>,
    },
    {
      id: 'actions', header: '',
      cell: ({ row }) => (
        <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => deleteMutation.mutate(row.original)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ]

  return (
    <Page>
      <PageHeader>
        <PageTitle>Préstamos</PageTitle>
        <PageActions>
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />Nuevo Préstamo
          </Button>
        </PageActions>
      </PageHeader>
      <PageBody>
        {loans.length === 0 && !isLoading
          ? <EmptyState icon={<BookMarked />} title="Sin préstamos registrados" description="Registra el primer préstamo de un libro." action={{ label: 'Nuevo Préstamo', onClick: () => setOpen(true) }} />
          : <DataTable columns={columns} data={loans} loading={isLoading} />
        }
      </PageBody>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Préstamo</DialogTitle>
          </DialogHeader>
          <LoanForm
            books={books}
            users={users}
            onSuccess={() => { setOpen(false); queryClient.invalidateQueries({ queryKey: ['loans'] }) }}
            onCancel={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Page>
  )
}
