// app/admin/page.js
// ─────────────────────────────────────────────────────
// PÁGINA: Dashboard de Administración — Ruta: /admin
// Protegida: solo admins pueden acceder
// ─────────────────────────────────────────────────────

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import "@/styles/admin.css";

export default function AdminPage() {
  const { user, perfil, loading: authLoading, isAdmin } = useAuth();

  const [stats, setStats] = useState(null);
  const [recientes, setRecientes] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── CARGAR STATS DEL DASHBOARD ──
  // 🔧 Conecta con: todas las tablas (COUNT)
  useEffect(() => {
    if (!isAdmin) return;

    async function cargarStats() {
      try {
        // Conteos en paralelo para mayor velocidad
        const [lugaresRes, negociosRes, expRes, usersRes] = await Promise.all([
          supabase.from("lugares").select("id", { count: "exact", head: true }),
          supabase
            .from("negocios")
            .select("id", { count: "exact", head: true }),
          supabase
            .from("experiencias")
            .select("id", { count: "exact", head: true }),
          supabase
            .from("profiles")
            .select("id", { count: "exact", head: true }),
        ]);

        setStats({
          lugares: lugaresRes.count || 0,
          negocios: negociosRes.count || 0,
          experiencias: expRes.count || 0,
          usuarios: usersRes.count || 0,
        });

        // Últimas experiencias para actividad reciente
        const { data: exps } = await supabase
          .from("experiencias")
          .select("id, contenido, created_at, perfil:profiles(nombre)")
          .order("created_at", { ascending: false })
          .limit(5);

        setRecientes(exps || []);
      } catch (err) {
        console.error("Error cargando stats:", err);
      } finally {
        setLoading(false);
      }
    }

    cargarStats();
  }, [isAdmin]);

  // ── CARGANDO AUTH ──
  if (authLoading) {
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
  }

  // ── ACCESO DENEGADO ──
  if (!user || !isAdmin) {
    return (
      <div className="admin-acceso-denegado">
        <h2>🔒 Acceso restringido</h2>
        <p>
          {!user
            ? "Debes iniciar sesión para acceder al panel de administración."
            : "No tienes permisos de administrador. Contacta al responsable del sitio."}
        </p>
        <Link
          href={!user ? "/login" : "/"}
          style={{
            display: "inline-block",
            padding: "11px 24px",
            background: "var(--color-btn-primary)",
            color: "white",
            borderRadius: 8,
            fontFamily: "var(--font-display)",
            fontSize: 14,
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          {!user ? "Iniciar sesión" : "Volver al inicio"}
        </Link>
      </div>
    );
  }

  // Datos para los badges del sidebar
  const sidebarStats = stats
    ? {
        Lugares: stats.lugares,
        Negocios: stats.negocios,
        Usuarios: stats.usuarios,
      }
    : {};

  return (
    <div>
      {/* ── HEADER ── */}
      <div className="admin-page-header">
        <h1 className="admin-page-titulo">
          Panel de Administración
          <span className="admin-badge">⚡ Admin</span>
        </h1>
        <p className="admin-page-sub">
          Bienvenido, <strong>{perfil?.nombre || user.email}</strong>. Gestiona
          el contenido del portal del distrito.
        </p>
      </div>

      {/* ── LAYOUT ── */}
      <div className="admin-layout">
        <AdminSidebar stats={sidebarStats} />

        <div>
          {/* ── STATS DEL DASHBOARD ── */}
          <div className="admin-stats-grid">
            {/* Lugares */}
            <div className="admin-stat-card">
              <span className="admin-stat-icon">🗺️</span>
              <div
                className="admin-stat-valor"
                style={{ color: "var(--color-blue)" }}
              >
                {loading ? "—" : stats?.lugares}
              </div>
              <div className="admin-stat-label">Lugares turísticos</div>
              <Link href="/admin/lugares" className="admin-stat-link">
                Gestionar →
              </Link>
            </div>

            {/* Negocios */}
            <div className="admin-stat-card">
              <span className="admin-stat-icon">🏪</span>
              <div
                className="admin-stat-valor"
                style={{ color: "var(--color-yellow)" }}
              >
                {loading ? "—" : stats?.negocios}
              </div>
              <div className="admin-stat-label">Negocios registrados</div>
              <Link href="/admin/negocios" className="admin-stat-link">
                Gestionar →
              </Link>
            </div>

            {/* Experiencias */}
            <div className="admin-stat-card">
              <span className="admin-stat-icon">📸</span>
              <div
                className="admin-stat-valor"
                style={{ color: "var(--color-cyan)" }}
              >
                {loading ? "—" : stats?.experiencias}
              </div>
              <div className="admin-stat-label">Experiencias publicadas</div>
              <Link href="/experiencias" className="admin-stat-link">
                Ver feed →
              </Link>
            </div>

            {/* Usuarios */}
            <div className="admin-stat-card">
              <span className="admin-stat-icon">👥</span>
              <div
                className="admin-stat-valor"
                style={{ color: "var(--color-green)" }}
              >
                {loading ? "—" : stats?.usuarios}
              </div>
              <div className="admin-stat-label">Usuarios registrados</div>
              <Link href="/admin/usuarios" className="admin-stat-link">
                Gestionar →
              </Link>
            </div>
          </div>

          {/* ── ACCESOS RÁPIDOS ── */}
          <div className="admin-seccion">
            <div className="admin-seccion-header">
              <span className="admin-seccion-titulo">Acciones rápidas</span>
            </div>
            <div
              style={{
                padding: "16px 20px",
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              <Link href="/admin/lugares" className="btn-admin-primary">
                ➕ Nuevo lugar
              </Link>
              <Link href="/admin/negocios" className="btn-admin-primary">
                ➕ Nuevo negocio
              </Link>
              <Link href="/admin/usuarios" className="btn-admin-secondary">
                👥 Ver usuarios
              </Link>
              <Link href="/lugares" className="btn-admin-secondary">
                🗺️ Ver lugares públicos
              </Link>
            </div>
          </div>

          {/* ── ACTIVIDAD RECIENTE ── */}
          <div className="admin-seccion">
            <div className="admin-seccion-header">
              <span className="admin-seccion-titulo">
                Experiencias recientes
              </span>
              <Link href="/experiencias" className="admin-stat-link">
                Ver todas →
              </Link>
            </div>

            <div className="admin-actividad-lista">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="admin-actividad-item">
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "#1a1a1a",
                        flexShrink: 0,
                      }}
                    />
                    <div
                      style={{
                        flex: 1,
                        height: 12,
                        borderRadius: 4,
                        background:
                          "linear-gradient(90deg,#111 25%,#1a1a1a 50%,#111 75%)",
                        backgroundSize: "200% 100%",
                        animation: "shimmer 1.5s infinite",
                      }}
                    />
                  </div>
                ))
              ) : recientes.length === 0 ? (
                <div
                  style={{
                    padding: "24px 20px",
                    textAlign: "center",
                    color: "#444",
                    fontSize: 13,
                    fontFamily: "var(--font-display)",
                  }}
                >
                  No hay experiencias todavía.
                </div>
              ) : (
                recientes.map((exp) => (
                  <div key={exp.id} className="admin-actividad-item">
                    <div
                      className="admin-actividad-dot"
                      style={{ backgroundColor: "var(--color-blue)" }}
                    />
                    <div className="admin-actividad-texto">
                      <strong>{exp.perfil?.nombre || "Usuario"}</strong>
                      {" publicó: "}
                      {exp.contenido?.substring(0, 60)}
                      {exp.contenido?.length > 60 ? "..." : ""}
                    </div>
                    <div className="admin-actividad-fecha">
                      {new Date(exp.created_at).toLocaleDateString("es-MX", {
                        day: "numeric",
                        month: "short",
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
