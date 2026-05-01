import {
  createRouter, createRoute, createRootRoute,
  RouterProvider, Outlet, Link, useLocation,
} from '@tanstack/react-router'
import {
  AppShell, AppShellSidebar, AppShellMain, MobileSidebarTrigger,
  Sidebar, SidebarHeader, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarItem, SidebarFooter,
} from '@blinkdotnew/ui'
import { LayoutDashboard, Users, Briefcase, BookOpen, BookMarked, CalendarCheck } from 'lucide-react'
import DashboardPage from './pages/DashboardPage'
import UsersPage from './pages/UsersPage'
import EmployeesPage from './pages/EmployeesPage'
import BooksPage from './pages/BooksPage'
import LoansPage from './pages/LoansPage'
import ReservationsPage from './pages/ReservationsPage'

// ── Routes ─────────────────────────────────────────────────────
const rootRoute = createRootRoute({ component: RootLayout })
const dashboardRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: DashboardPage })
const usersRoute = createRoute({ getParentRoute: () => rootRoute, path: '/users', component: UsersPage })
const employeesRoute = createRoute({ getParentRoute: () => rootRoute, path: '/employees', component: EmployeesPage })
const booksRoute = createRoute({ getParentRoute: () => rootRoute, path: '/books', component: BooksPage })
const loansRoute = createRoute({ getParentRoute: () => rootRoute, path: '/loans', component: LoansPage })
const reservationsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/reservations', component: ReservationsPage })

const routeTree = rootRoute.addChildren([dashboardRoute, usersRoute, employeesRoute, booksRoute, loansRoute, reservationsRoute])

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register { router: typeof router }
}

// ── Layout ─────────────────────────────────────────────────────
const navItems = [
  { href: '/', label: 'Panel Principal', icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: '/users', label: 'Usuarios', icon: <Users className="h-4 w-4" /> },
  { href: '/employees', label: 'Empleados', icon: <Briefcase className="h-4 w-4" /> },
  { href: '/books', label: 'Libros', icon: <BookOpen className="h-4 w-4" /> },
  { href: '/loans', label: 'Préstamos', icon: <BookMarked className="h-4 w-4" /> },
  { href: '/reservations', label: 'Reservas', icon: <CalendarCheck className="h-4 w-4" /> },
]

function RootLayout() {
  const location = useLocation()

  return (
    <AppShell>
      <AppShellSidebar>
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2 py-1">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <p className="font-bold text-sm leading-tight text-sidebar-foreground">BiblioSystem</p>
                <p className="text-xs text-muted-foreground leading-tight">Gestión Bibliotecaria</p>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navegación</SidebarGroupLabel>
              {navItems.map(item => (
                <Link key={item.href} to={item.href}>
                  <SidebarItem
                    icon={item.icon}
                    label={item.label}
                    active={location.pathname === item.href}
                  />
                </Link>
              ))}
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <p className="text-xs text-muted-foreground px-2 py-1">v1.0 · Gestión Bibliotecaria</p>
          </SidebarFooter>
        </Sidebar>
      </AppShellSidebar>

      <AppShellMain>
        <div className="md:hidden flex items-center gap-3 px-4 h-14 border-b border-border bg-background sticky top-0 z-10">
          <MobileSidebarTrigger />
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <span className="font-bold text-sm">BiblioSystem</span>
          </div>
        </div>
        <div className="animate-fade-in">
          <Outlet />
        </div>
      </AppShellMain>
    </AppShell>
  )
}

export default function App() {
  return <RouterProvider router={router} />
}
