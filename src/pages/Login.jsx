import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Validación del formulario
  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "El correo electrónico es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Ingresa un correo electrónico válido";
    }

    if (!password) {
      newErrors.password = "La contraseña es requerida";
    } else if (password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    return newErrors;
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      // Simulamos una petición al servidor (en producción sería una API real)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Intentar login
      login(email, password);
      setErrors({});

      // Redirigimos al dashboard
      navigate("/", { replace: true });
    } catch (error) {
      setErrors({ general: error.message || "Error al iniciar sesión. Intenta de nuevo." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>🔐 Iniciar Sesión</h2>

        {/* Mensaje de error general */}
        {errors.general && (
          <div className="alert alert-error">
            <span>⚠️</span>
            <span>{errors.general}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Campo Email */}
          <div className="form-group">
            <label htmlFor="email">
              ✉️ Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            {errors.email && (
              <small style={{ color: "#e74c3c", marginTop: "0.25rem", display: "block" }}>
                {errors.email}
              </small>
            )}
          </div>

          {/* Campo Contraseña */}
          <div className="form-group">
            <label htmlFor="password">
              🔒 Contraseña
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            {errors.password && (
              <small style={{ color: "#e74c3c", marginTop: "0.25rem", display: "block" }}>
                {errors.password}
              </small>
            )}
          </div>

          {/* Botón de envío */}
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? "⏳ Ingresando..." : "✅ Acceder"}
          </button>
        </form>

        {/* Enlaces útiles */}
        <div className="auth-link">
          <p>
            ¿No tienes cuenta?{" "}
            <Link to="/register">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
