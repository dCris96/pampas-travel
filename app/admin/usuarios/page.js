// app/admin/usuarios/page.js
// ─────────────────────────────────────────────────────
// PANEL ADMIN: Gestión de Usuarios y Roles
// Ruta: /admin/usuarios
// 🔧 Conecta con: tabla public.profiles
// ─────────────────────────────────────────────────────

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import "@/styles/admin.css";
import "@/styles/tabla-admin.css";

export default function AdminUsuariosPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();

  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [cambiando, setCambiando] = useState(null); // ID del usuario siendo actualizado

  // ── CARGAR USUARIOS ──
  // 🔧 Conecta con: tabla public.profiles SELECT todos
  useEffect(() => {
    if (!isAdmin) return;

    async function cargar() {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setUsuarios(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    cargar();
  }, [isAdmin]);

  // ── FILTRAR ──
  const usuariosFiltrados = usuarios.filter((u) => {
    if (!busqueda.trim()) return true;
    const q = busqueda.toLowerCase();
    return (
      u.nombre?.toLowerCase().includes(q) || u.id?.toLowerCase().includes(q)
    );
  });

  // ── TOAST ──
  function mostrarToast(msg) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  }

  // ── CAMBIAR ROL ──
  // 🔧 Conecta con: UPDATE profiles SET rol WHERE id
  async function cambiarRol(usuarioId, nuevoRol) {
    // Prevenir quitarse el rol de admin a uno mismo
    if (usuarioId === user.id && nuevoRol !== "admin") {
      if (
        !confirm(
          "¿Seguro que quieres quitarte el rol de administrador? Perderás acceso al panel.",
        )
      )
        return;
    }

    setCambiando(usuarioId);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ rol: nuevoRol })
        .eq("id", usuarioId);

      if (error) throw error;

      setUsuarios((prev) =>
        prev.map((u) => (u.id === usuarioId ? { ...u, rol: nuevoRol } : u)),
      );

      mostrarToast(`Rol actualizado a "${nuevoRol}"`);
    } catch (err) {
      console.error(err);
      alert("Error al cambiar el rol: " + err.message);
    } finally {
      setCambiando(null);
    }
  }

  // ── FORMATEAR FECHA ──
  function formatFecha(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  // ── GUARDS ──
  if (authLoading)
    return (
      <div
        style={{
          padding: 60,
          textAlign: "center",
          color: "#666",
          fontFamily: "var(--font-display)",
          fontSize: 13,
        }}
      >
        Verificando permisos...
      </div>
    );

  if (!isAdmin)
    return (
      <div className="admin-acceso-denegado">
        <h2>🔒 Sin permisos</h2>
        <p>Necesitas ser administrador para ver esta página.</p>
        <Link
          href="/"
          style={{
            color: "var(--color-blue)",
            fontFamily: "var(--font-display)",
          }}
        >
          ← Volver al inicio
        </Link>
      </div>
    );

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-titulo">
          Gestión de Usuarios
          <span className="admin-badge">⚡ Admin</span>
        </h1>
        <p className="admin-page-sub">
          Administra los usuarios registrados y sus roles.
        </p>
      </div>

      <div className="admin-layout">
        <AdminSidebar />

        <div>
          {/* ── AVISO DE SEGURIDAD ── */}
          <div
            style={{
              background: "rgba(245,197,66,0.06)",
              border: "1px solid rgba(245,197,66,0.2)",
              borderRadius: "var(--card-radius)",
              padding: "14px 18px",
              marginBottom: 20,
              fontSize: 13,
              color: "#888",
              lineHeight: 1.5,
              fontFamily: "var(--font-display)",
            }}
          >
            ⚠️{" "}
            <strong style={{ color: "var(--color-yellow)" }}>
              Importante:
            </strong>{" "}
            El rol <strong>admin</strong> da acceso completo al panel. Solo
            asígnalo a personas de confianza. Los cambios de rol tienen efecto
            inmediato.
          </div>

          <div className="admin-seccion">
            <div className="admin-seccion-header">
              <span className="admin-seccion-titulo">
                Usuarios ({usuariosFiltrados.length})
              </span>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {/* Stats de roles */}
                <span
                  style={{
                    fontSize: 11,
                    color: "#555",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  {usuarios.filter((u) => u.rol === "admin").length} admins ·{" "}
                  {usuarios.filter((u) => u.rol === "usuario").length} usuarios
                </span>
              </div>
            </div>

            {/* Búsqueda */}
            <div className="tabla-admin-barra">
              <div className="tabla-buscar">
                <span className="tabla-buscar-icon">🔍</span>
                <input
                  type="text"
                  className="tabla-buscar-input"
                  placeholder="Buscar por nombre o ID..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
            </div>

            {/* Tabla */}
            <div className="tabla-admin-wrapper">
              <table className="tabla-admin">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Rol actual</th>
                    <th>Miembro desde</th>
                    <th>Cambiar rol</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        {[1, 2, 3, 4].map((j) => (
                          <td key={j}>
                            <div
                              style={{
                                height: 14,
                                borderRadius: 4,
                                background:
                                  "linear-gradient(90deg,#111 25%,#1a1a1a 50%,#111 75%)",
                                backgroundSize: "200% 100%",
                                animation: "shimmer 1.5s infinite",
                              }}
                            />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : usuariosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={4}>
                        <div className="tabla-vacia">
                          <div className="tabla-vacia-icon">👥</div>
                          <p>No hay usuarios registrados todavía.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    usuariosFiltrados.map((u) => {
                      const esYo = u.id === user.id;
                      const esCambiando = cambiando === u.id;

                      return (
                        <tr key={u.id}>
                          {/* Avatar + nombre */}
                          <td>
                            <div className="tabla-celda-nombre">
                              <div
                                style={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: "50%",
                                  background:
                                    "linear-gradient(135deg,#2a5fff,#1a3fd0)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: 14,
                                  fontWeight: 700,
                                  color: "white",
                                  fontFamily: "var(--font-display)",
                                  flexShrink: 0,
                                }}
                              >
                                {(u.nombre || "U")[0].toUpperCase()}
                              </div>
                              <div>
                                <div className="tabla-nombre-texto">
                                  {u.nombre || "Sin nombre"}
                                  {esYo && (
                                    <span
                                      style={{
                                        fontSize: 10,
                                        color: "var(--color-blue)",
                                        marginLeft: 6,
                                        fontFamily: "var(--font-display)",
                                      }}
                                    >
                                      (tú)
                                    </span>
                                  )}
                                </div>
                                <span
                                  className="tabla-nombre-sub"
                                  style={{ maxWidth: 180 }}
                                >
                                  ID: {u.id.substring(0, 12)}...
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Rol actual */}
                          <td>
                            <span
                              style={{
                                display: "inline-block",
                                padding: "3px 10px",
                                borderRadius: 20,
                                fontSize: 11,
                                fontFamily: "var(--font-display)",
                                fontWeight: 500,
                                ...(u.rol === "admin"
                                  ? {
                                      background: "rgba(245,197,66,0.12)",
                                      color: "var(--color-yellow)",
                                      border: "1px solid rgba(245,197,66,0.3)",
                                    }
                                  : {
                                      background: "rgba(74,158,255,0.1)",
                                      color: "var(--color-blue)",
                                      border: "1px solid rgba(74,158,255,0.2)",
                                    }),
                              }}
                            >
                              {u.rol === "admin" ? "⚡ Admin" : "👤 Usuario"}
                            </span>
                          </td>

                          {/* Fecha */}
                          <td
                            style={{
                              fontSize: 12,
                              color: "#555",
                              fontFamily: "var(--font-display)",
                            }}
                          >
                            {formatFecha(u.created_at)}
                          </td>

                          {/* Cambiar rol */}
                          <td>
                            <div className="tabla-acciones">
                              {u.rol !== "admin" ? (
                                <button
                                  className="btn-admin-primary"
                                  style={{ fontSize: 11, padding: "5px 12px" }}
                                  onClick={() => cambiarRol(u.id, "admin")}
                                  disabled={esCambiando}
                                >
                                  {esCambiando ? "..." : "⚡ Hacer admin"}
                                </button>
                              ) : (
                                <button
                                  className="btn-admin-danger"
                                  style={{ fontSize: 11 }}
                                  onClick={() => cambiarRol(u.id, "usuario")}
                                  disabled={esCambiando}
                                >
                                  {esCambiando ? "..." : "👤 Quitar admin"}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ── TOAST ── */}
      {toastMsg && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 999,
            background: "#1a1a1a",
            border: "1px solid #2a2a2a",
            borderRadius: 10,
            padding: "12px 20px",
            fontFamily: "var(--font-display)",
            fontSize: 13,
            color: "var(--color-text)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          {toastMsg}
        </div>
      )}
    </div>
  );
}
