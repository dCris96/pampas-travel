// app/registro/page.js
// ─────────────────────────────────────────────────────
// PÁGINA DE REGISTRO — Ruta: /registro
//
// Flujo:
// 1. Usuario llena nombre, email, contraseña
// 2. Llamamos a supabase.auth.signUp() con metadata { nombre }
// 3. El trigger en Supabase crea automáticamente el perfil
// 4. Mostramos mensaje de éxito (confirmar email)
// ─────────────────────────────────────────────────────

"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import "@/styles/auth.css";

const IconMountain = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="3,20 21,20 12,4" />
    <polyline points="3,20 9,12 12,15 15,11 21,20" />
  </svg>
);

const IconEye = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconEyeOff = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

export default function RegistroPage() {
  // ── ESTADO DEL FORMULARIO ──
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  // ── VALIDACIONES ──
  function validar() {
    if (nombre.trim().length < 2) {
      setError("El nombre debe tener al menos 2 caracteres.");
      return false;
    }
    if (!email.includes("@")) {
      setError("Ingresa un correo válido.");
      return false;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return false;
    }
    if (password !== password2) {
      setError("Las contraseñas no coinciden.");
      return false;
    }
    return true;
  }

  // ── FUNCIÓN DE REGISTRO ──
  // 🔧 Conecta con: Supabase Auth → signUp
  // El trigger en Supabase crea el perfil automáticamente
  async function handleRegistro(e) {
    e.preventDefault();
    setError("");

    if (!validar()) return;

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          // Metadata que guardamos en auth.users
          // El trigger la usa para crear el perfil
          data: {
            nombre: nombre.trim(),
          },
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          setError("Este correo ya está registrado. ¿Quieres iniciar sesión?");
        } else {
          setError(error.message);
        }
        return;
      }

      // Registro exitoso
      setSuccess(true);
    } catch (err) {
      setError("Error inesperado. Intenta de nuevo.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // ── PANTALLA DE ÉXITO ──
  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <IconMountain />
            </div>
            <div>
              <div className="auth-logo-text">Valle de los Vientos</div>
              <div className="auth-logo-sub">Portal del Distrito</div>
            </div>
          </div>

          <h1 className="auth-title">¡Registro exitoso!</h1>
          <p className="auth-subtitle">
            Te enviamos un correo de confirmación a <strong>{email}</strong>.
            Revisa tu bandeja de entrada y haz clic en el enlace para activar tu
            cuenta.
          </p>

          <div className="auth-message success">
            ✓ Correo enviado. Revisa también tu carpeta de spam.
          </div>

          <p className="auth-footer-link" style={{ marginTop: "24px" }}>
            <Link href="/login">Volver a iniciar sesión</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* ── LOGO ── */}
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <IconMountain />
          </div>
          <div>
            <div className="auth-logo-text">Valle de los Vientos</div>
            <div className="auth-logo-sub">Portal del Distrito</div>
          </div>
        </div>

        {/* ── ENCABEZADO ── */}
        <h1 className="auth-title">Crea tu cuenta</h1>
        <p className="auth-subtitle">
          Únete a la comunidad del distrito. Publica experiencias y descubre lo
          mejor del valle.
        </p>

        {/* ── FORMULARIO ── */}
        <form className="auth-form" onSubmit={handleRegistro}>
          {/* Nombre */}
          <div className="form-group">
            <label className="form-label" htmlFor="nombre">
              Nombre completo
            </label>
            <input
              id="nombre"
              type="text"
              className="form-input"
              placeholder="Tu nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              autoComplete="name"
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          {/* Contraseña */}
          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Contraseña
            </label>
            <div className="input-password-wrapper">
              <input
                id="password"
                type={showPass ? "text" : "password"}
                className="form-input"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                className="btn-toggle-password"
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? <IconEyeOff /> : <IconEye />}
              </button>
            </div>
          </div>

          {/* Confirmar contraseña */}
          <div className="form-group">
            <label className="form-label" htmlFor="password2">
              Confirmar contraseña
            </label>
            <input
              id="password2"
              type={showPass ? "text" : "password"}
              className="form-input"
              placeholder="Repite tu contraseña"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="auth-message error" role="alert">
              {error}
            </div>
          )}

          {/* Submit */}
          <button type="submit" className="btn-auth-submit" disabled={loading}>
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        {/* ── LINK A LOGIN ── */}
        <p className="auth-footer-link">
          ¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
