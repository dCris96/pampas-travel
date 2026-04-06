// app/login/page.js
// ─────────────────────────────────────────────────────
// PÁGINA DE LOGIN — Ruta: /login
//
// Flujo:
// 1. Usuario llena email + contraseña
// 2. Llamamos a supabase.auth.signInWithPassword()
// 3. Si hay error → mostramos mensaje
// 4. Si exitoso → redirigimos al inicio
//
// El AuthContext detecta automáticamente el login
// y actualiza el estado global
// ─────────────────────────────────────────────────────

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import "@/styles/auth.css";

// Ícono montaña para el logo
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

// Ícono ojo (para mostrar/ocultar contraseña)
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

export default function LoginPage() {
  // ── ESTADO DEL FORMULARIO ──
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  // ── FUNCIÓN DE LOGIN ──
  // 🔧 Conecta con: Supabase Auth → signInWithPassword
  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        // Traducimos los errores más comunes de Supabase
        if (error.message.includes("Invalid login credentials")) {
          setError("Email o contraseña incorrectos.");
        } else if (error.message.includes("Email not confirmed")) {
          setError("Debes confirmar tu email antes de iniciar sesión.");
        } else {
          setError(error.message);
        }
        return;
      }

      // Login exitoso: redirigir al inicio
      // El AuthContext detectará automáticamente la sesión
      router.push("/");
      router.refresh(); // Fuerza re-render del layout
    } catch (err) {
      setError("Error inesperado. Intenta de nuevo.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    /*
      auth-page: ocupa toda la pantalla
      El sidebar NO aparece aquí porque podemos manejarlo
      con el layout — ver nota abajo
    */
    <div className="auth-page">
      <div className="auth-card">
        {/* ── LOGO ── */}
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <IconMountain />
          </div>
          <div>
            {/* 🔧 PERSONALIZABLE */}
            <div className="auth-logo-text">Valle de los Vientos</div>
            <div className="auth-logo-sub">Portal del Distrito</div>
          </div>
        </div>

        {/* ── ENCABEZADO ── */}
        <h1 className="auth-title">Bienvenido de vuelta</h1>
        <p className="auth-subtitle">
          Inicia sesión para publicar experiencias y conectarte con la
          comunidad.
        </p>

        {/* ── FORMULARIO ── */}
        <form className="auth-form" onSubmit={handleLogin}>
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
                placeholder="Tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              {/* Botón mostrar/ocultar */}
              <button
                type="button"
                className="btn-toggle-password"
                onClick={() => setShowPass(!showPass)}
                aria-label={
                  showPass ? "Ocultar contraseña" : "Mostrar contraseña"
                }
              >
                {showPass ? <IconEyeOff /> : <IconEye />}
              </button>
            </div>
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="auth-message error" role="alert">
              {error}
            </div>
          )}

          {/* Botón submit */}
          <button type="submit" className="btn-auth-submit" disabled={loading}>
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </form>

        {/* ── LINK A REGISTRO ── */}
        <p className="auth-footer-link">
          ¿No tienes cuenta? <Link href="/registro">Regístrate gratis</Link>
        </p>
      </div>
    </div>
  );
}
