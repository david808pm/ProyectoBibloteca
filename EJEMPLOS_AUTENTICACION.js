// EJEMPLOS DE USO DEL SISTEMA DE AUTENTICACIÓN

// ============================================
// 1. USAR AUTH EN UN COMPONENTE
// ============================================

import { useAuth } from './contexts/AuthContext'

export function MiComponente() {
  const { user, isAuthenticated, logout } = useAuth()

  if (!isAuthenticated) {
    return <div>Por favor inicia sesión</div>
  }

  return (
    <div>
      <h1>Bienvenido {user.nombre}</h1>
      <p>Email: {user.email}</p>
      <button onClick={logout}>Cerrar Sesión</button>
    </div>
  )
}

// ============================================
// 2. VERIFICAR AUTENTICACIÓN EN GUARDA DE RUTA
// ============================================

import { useAuth } from './contexts/AuthContext'
import { Navigate } from 'react-router-dom'

function AdminOnlyPage() {
  const { user, isAuthenticated } = useAuth()

  // Protección por autenticación
  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  // Protección por rol (ejemplo)
  if (user.rol !== 'admin') {
    return <Navigate to="/" />
  }

  return <div>Página solo para administradores</div>
}

// ============================================
// 3. INTEGRAR CON API REAL (Backend)
// ============================================

// Modificar src/contexts/AuthContext.jsx:

const login = async (email, password) => {
  try {
    const response = await fetch('https://api.ejemplo.com/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Error de autenticación')
    }

    const data = await response.json()
    
    // Guardar token en lugar de usuario
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    
    setUser(data.user)
    return data.user
  } catch (error) {
    throw new Error(error.message)
  }
}

// ============================================
// 4. AGREGAR INTERCEPTOR DE PETICIONES
// ============================================

// Crear nuevo archivo: src/lib/api.js

export const apiCall = async (url, options = {}) => {
  const token = localStorage.getItem('token')
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (response.status === 401) {
    // Token expirado, limpiar sesión
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
    throw new Error('Sesión expirada')
  }

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message)
  }

  return response.json()
}

// Uso:
// const data = await apiCall('/api/users', { method: 'GET' })

// ============================================
// 5. AGREGAR RECUPERACIÓN DE CONTRASEÑA
// ============================================

// Nuevo componente: src/pages/ForgotPassword.jsx

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Llamar a API para enviar email de recuperación
      await fetch('/api/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      })
      setSent(true)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="auth-card">
        <h2>✅ Email Enviado</h2>
        <p>Revisa tu correo para las instrucciones de recuperación</p>
      </div>
    )
  }

  return (
    <div className="auth-card">
      <h2>🔑 Recuperar Contraseña</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" disabled={loading} className="btn btn-primary btn-block">
          {loading ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
    </div>
  )
}

// ============================================
// 6. AGREGAR AUTENTICACIÓN SOCIAL (Google)
// ============================================

import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'

export function LoginWithGoogle() {
  const { setUser } = useAuth()

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      // Enviar token a backend
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        body: JSON.stringify({ token: credentialResponse.credential })
      })

      const data = await response.json()
      
      // Guardar usuario
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setUser(data.user)

      // Redirigir
      window.location.href = '/'
    } catch (error) {
      console.error('Error en login de Google:', error)
    }
  }

  return (
    <GoogleOAuthProvider clientId="YOUR_CLIENT_ID">
      <GoogleLogin onSuccess={handleGoogleSuccess} />
    </GoogleOAuthProvider>
  )
}

// ============================================
// 7. AGREGAR 2FA (Autenticación de 2 Factores)
// ============================================

// Nuevo contexto: src/contexts/OTPContext.jsx

const verify2FA = async (email, code) => {
  const response = await fetch('/api/auth/verify-2fa', {
    method: 'POST',
    body: JSON.stringify({ email, code })
  })

  if (!response.ok) {
    throw new Error('Código incorrecto')
  }

  const data = await response.json()
  localStorage.setItem('token', data.token)
  return data
}

// ============================================
// 8. AGREGAR REFRESH TOKEN
// ============================================

// Modificar AuthContext.jsx:

useEffect(() => {
  // Configurar refresh token automático cada 5 minutos
  const refreshInterval = setInterval(async () => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        const data = await response.json()
        localStorage.setItem('token', data.token)
      } catch (error) {
        logout() // Si el refresh falla, logout
      }
    }
  }, 5 * 60 * 1000)

  return () => clearInterval(refreshInterval)
}, [])

// ============================================
// 9. AGREGAR SESIÓN PERSISTENTE (Remember Me)
// ============================================

// En el formulario de login:

const [rememberMe, setRememberMe] = useState(false)

const handleSubmit = (e) => {
  e.preventDefault()

  if (rememberMe) {
    // Guardar credenciales encriptadas (NO HACER EN PRODUCCIÓN)
    // Para producción, usar solo refresh tokens
    localStorage.setItem('rememberMe', 'true')
  }

  login(email, password)
}

// En AuthContext al cargar:

useEffect(() => {
  const rememberMe = localStorage.getItem('rememberMe')
  if (rememberMe) {
    // Intentar auto-login con refresh token
    const token = localStorage.getItem('token')
    if (token) {
      // Validar token
    }
  }
}, [])

// ============================================
// 10. HOOK PERSONALIZADO: useProtected
// ============================================

// Crear archivo: src/hooks/useProtected.js

import { useAuth } from '../contexts/AuthContext'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function useProtected() {
  const { isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login', { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate])

  return { isLoading, isAuthenticated }
}

// Uso en componente:
// function MiPaginaProtegida() {
//   const { isLoading } = useProtected()
//   if (isLoading) return <Loading />
//   return <div>Contenido protegido</div>
// }

