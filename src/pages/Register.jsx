import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Validación del formulario
  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido";
    } else if (formData.nombre.trim().length < 3) {
      newErrors.nombre = "El nombre debe tener al menos 3 caracteres";
    }

    if (!formData.email.trim()) {
      newErrors.email = "El correo electrónico es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Ingresa un correo electrónico válido";
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirmar contraseña es requerido";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    return newErrors;
  };

  // Manejar cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

      // Verificar si el usuario ya existe
      const existingUsers = JSON.parse(localStorage.getItem("users") || "[]");
      if (existingUsers.some((user) => user.email === formData.email)) {
        setErrors({ general: "Este correo electrónico ya está registrado" });
        setLoading(false);
        return;
      }

      // Crear nuevo usuario
      const newUser = {
        id: Date.now(),
        nombre: formData.nombre,
        email: formData.email,
        password: formData.password, // En producción, esto debe ser hasheado
        createdAt: new Date().toISOString(),
      };

      // Guardar usuario en localStorage
      existingUsers.push(newUser);
      localStorage.setItem("users", JSON.stringify(existingUsers));

      // Guardar sesión actual
      const userData = {
        id: newUser.id,
        nombre: newUser.nombre,
        email: newUser.email,
      };
      localStorage.setItem("user", JSON.stringify(userData));
      setErrors({});

      // Redirigir al dashboard
      navigate("/", { replace: true });
    } catch (error) {
      setErrors({ general: "Error al registrarse. Intenta de nuevo." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>📝 Crear Cuenta</h2>

        {/* Mensaje de error general */}
        {errors.general && (
          <div className="alert alert-error">
            <span>⚠️</span>
            <span>{errors.general}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Campo Nombre */}
          <div className="form-group">
            <label htmlFor="nombre">
              👤 Nombre Completo
            </label>
            <input
              id="nombre"
              type="text"
              name="nombre"
              placeholder="Tu nombre"
              value={formData.nombre}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.nombre && (
              <small style={{ color: "#e74c3c", marginTop: "0.25rem", display: "block" }}>
                {errors.nombre}
              </small>
            )}
          </div>

          {/* Campo Email */}
          <div className="form-group">
            <label htmlFor="email">
              ✉️ Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={handleChange}
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
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.password && (
              <small style={{ color: "#e74c3c", marginTop: "0.25rem", display: "block" }}>
                {errors.password}
              </small>
            )}
          </div>

          {/* Campo Confirmar Contraseña */}
          <div className="form-group">
            <label htmlFor="confirmPassword">
              🔒 Confirmar Contraseña
            </label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.confirmPassword && (
              <small style={{ color: "#e74c3c", marginTop: "0.25rem", display: "block" }}>
                {errors.confirmPassword}
              </small>
            )}
          </div>

          {/* Botón de envío */}
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? "⏳ Registrando..." : "✅ Crear Cuenta"}
          </button>
        </form>

        {/* Enlaces útiles */}
        <div className="auth-link">
          <p>
            ¿Ya tienes cuenta?{" "}
            <Link to="/login">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
