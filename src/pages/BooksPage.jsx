import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Page, PageHeader, PageTitle, PageActions, PageBody,
  DataTable, EmptyState, Button, Dialog, DialogContent,
  DialogHeader, DialogTitle, Badge, Input, toast,
} from '@blinkdotnew/ui'
import { BookOpen, Plus, Trash2, Search, MapPin } from 'lucide-react'
import { blink } from '../blink/client'
import BookForm from '../components/BookForm'
import BookCard from '../components/card'
import { readLocalCollection, deleteLocalRecord } from '../lib/localDb'

export default function BooksPage() {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [shelfSearch, setShelfSearch] = useState('')

  const { data: books = [], isLoading } = useQuery({
    queryKey: ['books'],
    queryFn: async () => {
      try {
        return await blink.db.books.list({ orderBy: { createdAt: 'desc' } })
      } catch {
        return readLocalCollection('books')
      }
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      try {
        await blink.db.books.delete(id)
      } catch {
        deleteLocalRecord('books', id)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] })
      toast.success('Libro eliminado')
    },
    onError: () => toast.error('Error al eliminar el libro'),
  })

  const filtered = shelfSearch
    ? books.filter(b =>
        b.shelfLocation?.toLowerCase().includes(shelfSearch.toLowerCase()) ||
        b.genre?.toLowerCase().includes(shelfSearch.toLowerCase()) ||
        b.title?.toLowerCase().includes(shelfSearch.toLowerCase()) ||
        b.author?.toLowerCase().includes(shelfSearch.toLowerCase())
      )
    : books

  const columns = [
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
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título, autor, estantería o género..."
              value={shelfSearch}
              onChange={e => setShelfSearch(e.target.value)}
              className="max-w-md"
            />
          </div>
          {shelfSearch && (
            <span className="text-sm text-muted-foreground">
              {filtered.length} resultado(s) en <span className="font-semibold text-primary">{shelfSearch}</span>
            </span>
          )}
        </div>

        {filtered.length > 0 && (
          <div className="grid gap-4 pb-6 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}

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

