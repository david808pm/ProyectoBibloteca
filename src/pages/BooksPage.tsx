import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Page, PageHeader, PageTitle, PageActions, PageBody,
  DataTable, EmptyState, Button, Dialog, DialogContent,
  DialogHeader, DialogTitle, Badge, Input, toast,
} from '@blinkdotnew/ui'
import { BookOpen, Plus, Trash2, Search, MapPin } from 'lucide-react'
import { blink } from '../blink/client'
import type { Book } from '../types'
import type { ColumnDef } from '@tanstack/react-table'
import BookForm from '../components/BookForm'

export default function BooksPage() {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [shelfSearch, setShelfSearch] = useState('')

  const { data: books = [], isLoading } = useQuery<Book[]>({
    queryKey: ['books'],
    queryFn: async () => {
      const result = await blink.db.books.list({ orderBy: { createdAt: 'desc' } })
      return result as Book[]
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => blink.db.books.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] })
      toast.success('Libro eliminado')
    },
    onError: () => toast.error('Error al eliminar el libro'),
  })

  const filtered = shelfSearch
    ? books.filter(b => b.shelfLocation.toLowerCase().includes(shelfSearch.toLowerCase()) || b.genre.toLowerCase().includes(shelfSearch.toLowerCase()))
    : books

  const columns: ColumnDef<Book>[] = [
    { accessorKey: 'title', header: 'Título' },
    { accessorKey: 'author', header: 'Autor' },
    { accessorKey: 'editor', header: 'Editorial' },
    { accessorKey: 'pages', header: 'Páginas' },
    { accessorKey: 'genre', header: 'Género' },
    {
      accessorKey: 'shelfLocation', header: 'Estantería',
      cell: ({ row }) => (
        <span className="flex items-center gap-1 font-mono text-sm font-semibold text-primary">
          <MapPin className="h-3 w-3" />{row.original.shelfLocation}
        </span>
      ),
    },
    {
      accessorKey: 'available', header: 'Estado',
      cell: ({ row }) => (
        <Badge variant={Number(row.original.available) > 0 ? 'default' : 'secondary'}>
          {Number(row.original.available) > 0 ? 'Disponible' : 'Prestado'}
        </Badge>
      ),
    },
    {
      id: 'actions', header: 'Acciones',
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
        <PageTitle>Libros</PageTitle>
        <PageActions>
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />Agregar Libro
          </Button>
        </PageActions>
      </PageHeader>
      <PageBody>
        <div className="mb-4 flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por estantería (ej: EST-001) o género..."
            value={shelfSearch}
            onChange={e => setShelfSearch(e.target.value)}
            className="max-w-md"
          />
          {shelfSearch && (
            <span className="text-sm text-muted-foreground">
              {filtered.length} resultado(s) en <span className="font-semibold text-primary">{shelfSearch}</span>
            </span>
          )}
        </div>

        {filtered.length === 0 && !isLoading
          ? <EmptyState icon={<BookOpen />} title="Sin libros registrados" description="Agrega el primer libro al inventario." action={{ label: 'Agregar Libro', onClick: () => setOpen(true) }} />
          : <DataTable columns={columns} data={filtered} loading={isLoading} searchable searchColumn="title" />
        }
      </PageBody>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Libro</DialogTitle>
          </DialogHeader>
          <BookForm
            onSuccess={() => { setOpen(false); queryClient.invalidateQueries({ queryKey: ['books'] }) }}
            onCancel={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Page>
  )
}
