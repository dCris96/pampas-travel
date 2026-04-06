// app/perfil/page.js
// ─────────────────────────────────────────────────────
// PÁGINA DE PERFIL — Ruta: /perfil
// Muestra los datos del usuario logueado
// Ruta PROTEGIDA: si no hay sesión, redirige al login
// ─────────────────────────────────────────────────────

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import "@/styles/perfil.css";

export default function PerfilPage() {
  const { user, perfil, loading, logout, isAdmin } = useAuth();
  const router = useRouter();

  // ── CARGANDO ──
  // Mientras verificamos la sesión, no renderizamos nada
  if (loading) {
    return (
      <div style={{ padding: "60px", textAlign: "center", color: "#666" }}>
        Cargando perfil...
      </div>
    );
  }

  // ── NO LOGUEADO ──
  // Si no hay usuario, mostramos pantalla de acceso denegado
  if (!user) {
    return (
      <div className="perfil-no-auth">
        <h2>Acceso restringido</h2>
        <p>Necesitas iniciar sesión para ver tu perfil.</p>
        <Link href="/login" className="btn-primary-link">
          Iniciar Sesión
        </Link>
      </div>
    );
  }

  // ── FUNCIÓN DE LOGOUT ──
  async function handleLogout() {
    await logout();
    router.push("/");
  }

  // ── FORMATEAR FECHA ──
  function formatearFecha(isoString) {
    if (!isoString) return "—";

    return new Date(isoString).toLocaleDateString("es-MX", {
      year: "numeric", // ✅ correcto
      month: "long",
      day: "numeric",
    });
  }

  return (
    <div>
      {/* ── HEADER CON AVATAR Y NOMBRE ── */}
      <div className="perfil-header">
        {/* Avatar (inicial si no hay imagen) */}
        <div className="perfil-avatar-lg">
          {perfil?.avatar_url ? (
            <img src={perfil.avatar_url} alt="Avatar" />
          ) : (
            <span>
              {(perfil?.nombre || user.email || "U")[0].toUpperCase()}
            </span>
          )}
        </div>

        <div className="perfil-info">
          <h1>{perfil?.nombre || "Usuario"}</h1>
          <p className="perfil-email">{user.email}</p>

          {/* Badge de rol */}
          <span className={`perfil-rol-badge ${isAdmin ? "admin" : "usuario"}`}>
            {isAdmin ? "⚡ Administrador" : "👤 Miembro"}
          </span>
        </div>
      </div>

      {/* ── DATOS DE LA CUENTA ── */}
      {/* 🔧 Conecta con: tabla public.profiles + auth.users */}
      <div className="perfil-section">
        <h2>Información de la cuenta</h2>

        <div className="perfil-dato">
          <span className="perfil-dato-label">Nombre</span>
          <span className="perfil-dato-value">{perfil?.nombre || "—"}</span>
        </div>

        <div className="perfil-dato">
          <span className="perfil-dato-label">Correo electrónico</span>
          <span className="perfil-dato-value">{user.email}</span>
        </div>

        <div className="perfil-dato">
          <span className="perfil-dato-label">Rol</span>
          <span className="perfil-dato-value">
            {isAdmin ? "Administrador" : "Usuario"}
          </span>
        </div>

        <div className="perfil-dato">
          <span className="perfil-dato-label">Miembro desde</span>
          <span className="perfil-dato-value">
            {formatearFecha(perfil?.created_at)}
          </span>
        </div>

        <div className="perfil-dato">
          <span className="perfil-dato-label">ID de usuario</span>
          <span
            className="perfil-dato-value"
            style={{ fontSize: "11px", fontFamily: "monospace", color: "#555" }}
          >
            {user.id}
          </span>
        </div>
      </div>

      {/* ── CERRAR SESIÓN ── */}
      <div className="perfil-section">
        <h2>Sesión</h2>
        <p style={{ fontSize: "13px", color: "#666", marginBottom: "16px" }}>
          Cierra tu sesión en este dispositivo.
        </p>
        <button className="btn-danger" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
