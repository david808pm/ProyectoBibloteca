import { useQuery } from '@tanstack/react-query'
import {
  Page, PageHeader, PageTitle, PageDescription, PageBody,
  StatGroup, Stat, Card, CardContent, CardHeader,
} from '@blinkdotnew/ui'
import { Users, BookOpen, BookMarked, CalendarCheck, Briefcase, TrendingUp } from 'lucide-react'
import { blink } from '../blink/client'

export default function DashboardPage() {
  const { data: usersCount = 0 } = useQuery({
    queryKey: ['users_count'],
    queryFn: async () => blink.db.libraryUsers.count(),
  })
  const { data: booksCount = 0 } = useQuery({
    queryKey: ['books_count'],
    queryFn: async () => blink.db.books.count(),
  })
  const { data: loansCount = 0 } = useQuery({
    queryKey: ['loans_count'],
    queryFn: async () => blink.db.loans.count(),
  })
  const { data: reservationsCount = 0 } = useQuery({
    queryKey: ['reservations_count'],
    queryFn: async () => blink.db.reservations.count(),
  })
  const { data: employeesCount = 0 } = useQuery({
    queryKey: ['employees_count'],
    queryFn: async () => blink.db.employees.count(),
  })
  const { data: books = [] } = useQuery({
    queryKey: ['books'],
    queryFn: async () => blink.db.books.list(),
  })
  const { data: loans = [] } = useQuery({
    queryKey: ['loans'],
    queryFn: async () => blink.db.loans.list(),
  })

  const availableBooks = books.filter(b => Number(b.available) > 0).length
  const activeLoans = loans.filter(l => l.status === 'active').length

  const shelfGroups = books.reduce((acc, book) => {
    const key = book.shelfLocation
    acc[key] = acc[key] || []
    acc[key].push(book)
    return acc
  }, {})

  return (
    <Page>
      <PageHeader>
        <PageTitle>Panel Principal</PageTitle>
        <PageDescription>Resumen del estado actual de la biblioteca</PageDescription>
      </PageHeader>
      <PageBody>
        <StatGroup>
          <Stat label="Usuarios registrados" value={String(usersCount)} icon={<Users />} />
          <Stat label="Libros en inventario" value={String(booksCount)} icon={<BookOpen />} />
          <Stat label="Libros disponibles" value={String(availableBooks)} icon={<TrendingUp />} />
          <Stat label="Préstamos activos" value={String(activeLoans)} icon={<BookMarked />} />
          <Stat label="Reservas" value={String(reservationsCount)} icon={<CalendarCheck />} />
          <Stat label="Empleados" value={String(employeesCount)} icon={<Briefcase />} />
        </StatGroup>

        {Object.keys(shelfGroups).length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Distribución por Estantería</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(shelfGroups).sort(([a], [b]) => a.localeCompare(b)).map(([shelf, shelfBooks]) => (
                <Card key={shelf} className="transition-all hover:shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-primary text-lg">{shelf}</span>
                      <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full font-medium">
                        {shelfBooks.length} libro(s)
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Género: {[...new Set(shelfBooks.map(b => b.genre))].join(', ')}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {shelfBooks.slice(0, 4).map(b => (
                        <li key={b.id} className="text-sm flex items-center justify-between">
                          <span className="truncate">{b.title}</span>
                          <span className={`text-xs ml-2 shrink-0 ${Number(b.available) > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                            {Number(b.available) > 0 ? '✓ Disp.' : '✗ Prest.'}
                          </span>
                        </li>
                      ))}
                      {shelfBooks.length > 4 && (
                        <li className="text-xs text-muted-foreground">+{shelfBooks.length - 4} más...</li>
                      )}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </PageBody>
    </Page>
  )
}
