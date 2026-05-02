import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import {
  AppShell, AppShellSidebar, AppShellMain, MobileSidebarTrigger,
  Sidebar, SidebarHeader, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarItem, SidebarFooter,
} from '@blinkdotnew/ui'
import { LayoutDashboard, Users, Briefcase, BookOpen, BookMarked, CalendarCheck, LogOut } from 'lucide-react'
import { useLocation, Link } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import UsersPage from './pages/UsersPage'
import EmployeesPage from './pages/EmployeesPage'
import BooksPage from './pages/BooksPage'
import LoansPage from './pages/LoansPage'
import ReservationsPage from './pages/ReservationsPage'
import Login from './pages/Login'
import Register from './pages/Register'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ProtectedRoute } from './contexts/ProtectedRoute'

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
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

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
            <div className="space-y-2">
              {user && (
                <div className="px-2 py-2 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-1">Conectado como:</p>
                  <p className="text-sm font-medium text-sidebar-foreground truncate">{user.nombre}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-2 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Cerrar Sesión
              </button>
            </div>
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
          <Routes>
            <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
            <Route path="/employees" element={<ProtectedRoute><EmployeesPage /></ProtectedRoute>} />
            <Route path="/books" element={<ProtectedRoute><BooksPage /></ProtectedRoute>} />
            <Route path="/loans" element={<ProtectedRoute><LoansPage /></ProtectedRoute>} />
            <Route path="/reservations" element={<ProtectedRoute><ReservationsPage /></ProtectedRoute>} />
          </Routes>
        </div>
      </AppShellMain>
    </AppShell>
  )
}

function AppRouter() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <Register />} />
      <Route path="/*" element={isAuthenticated ? <RootLayout /> : <Navigate to="/login" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  )
}