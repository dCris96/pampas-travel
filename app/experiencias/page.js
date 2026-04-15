// app/experiencias/page.js
// ─────────────────────────────────────────────────────
// PÁGINA: Feed de experiencias — Ruta: /experiencias
//
// Funcionalidades:
//   ✓ Carga experiencias con JOIN a profiles y lugares
//   ✓ Detecta si el usuario actual dio like a cada post
//   ✓ Botón "Publicar" abre el modal (solo logueados)
//   ✓ Actualización en tiempo real al publicar/borrar
//   ✓ Sidebar con estadísticas del feed
//   ✓ Skeleton loading
//
// 🔧 Conecta con: tablas experiencias, likes, profiles, lugares
// ─────────────────────────────────────────────────────

"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getExperiencias } from "@/app/actions/experiencias";
import { useAuth } from "@/context/AuthContext";
import TarjetaExperiencia from "@/components/TarjetaExperiencia";
import FormularioExperiencia from "@/components/FormularioExperiencia";
import "@/styles/experiencias.css";

// ── ÍCONOS ──
const IconPlus = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IconLogin = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <polyline points="10,17 15,12 10,7" />
    <line x1="15" y1="12" x2="3" y2="12" />
  </svg>
);

// ── SKELETON ──
function SkeletonFeed() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <div key={i} className="skeleton-exp">
          <div className="skeleton-exp-header">
            <div className="skeleton-avatar" />
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <div
                className="skeleton-line medium"
                style={{
                  height: 11,
                  borderRadius: 4,
                  background:
                    "linear-gradient(90deg,#111 25%,#1a1a1a 50%,#111 75%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.5s infinite",
                }}
              />
              <div
                className="skeleton-line short"
                style={{
                  height: 9,
                  width: "40%",
                  borderRadius: 4,
                  background:
                    "linear-gradient(90deg,#111 25%,#1a1a1a 50%,#111 75%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.5s infinite",
                }}
              />
            </div>
          </div>
          {/* Imagen skeleton solo en algunas cards */}
          {i % 2 !== 0 && <div className="skeleton-exp-img" />}
          <div className="skeleton-exp-body">
            <div
              className="skeleton-line medium"
              style={{
                height: 12,
                borderRadius: 4,
                background:
                  "linear-gradient(90deg,#111 25%,#1a1a1a 50%,#111 75%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.5s infinite",
              }}
            />
            <div
              className="skeleton-line short"
              style={{
                height: 12,
                width: "60%",
                borderRadius: 4,
                background:
                  "linear-gradient(90deg,#111 25%,#1a1a1a 50%,#111 75%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.5s infinite",
              }}
            />
          </div>
        </div>
      ))}
    </>
  );
}

export default function ExperienciasPage() {
  const { user, perfil } = useAuth();

  // ── ESTADO ──
  const [experiencias, setExperiencias] = useState([]);
  const [stats, setStats] = useState({ total: 0, conFoto: 0, usuarios: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);

  // ── CARGAR EXPERIENCIAS ──
  // Hace un JOIN manual: experiencias + profiles + lugares + likes
  // 🔧 Conecta con: tablas experiencias, profiles, lugares, likes
  const cargarExperiencias = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const resultado = await getExperiencias(user?.id);
      setExperiencias(resultado.experiencias);
      setStats(resultado.stats);
    } catch (err) {
      console.error("Error cargando experiencias:", err);
      setError(err.message || "No se pudieron cargar las experiencias.");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Cargar al montar y cuando cambia el usuario
  useEffect(() => {
    cargarExperiencias();
  }, [cargarExperiencias]);

  // ── HANDLERS ──

  // Cuando se publica una nueva experiencia
  function handlePublicado() {
    setModalAbierto(false);
    cargarExperiencias(); // Recargar el feed
  }

  // Cuando se borra una experiencia
  function handleBorrada(id) {
    setExperiencias((prev) => prev.filter((e) => e.id !== id));
    setStats((prev) => ({ ...prev, total: prev.total - 1 }));
  }

  // ── RENDER ──
  return (
    <div>
      {/* ── HEADER ── */}
      <div className="exp-page-header">
        <div className="exp-page-header-text">
          <h1>Experiencias</h1>
          <p>Lo que la comunidad vive y comparte en el Valle de los Vientos.</p>
        </div>

        {user ? (
          /* Botón publicar para usuarios logueados */
          <button
            className="btn-publicar"
            onClick={() => setModalAbierto(true)}
          >
            <IconPlus />
            Publicar experiencia
          </button>
        ) : (
          /* Botón de login para visitantes */
          <Link
            href="/login"
            className="btn-publicar"
            style={{ textDecoration: "none" }}
          >
            <IconLogin />
            Inicia sesión para publicar
          </Link>
        )}
      </div>

      {/* ── LAYOUT: FEED + SIDEBAR ── */}
      <div className="exp-layout">
        {/* ── FEED PRINCIPAL ── */}
        <div className="exp-feed">
          {loading ? (
            <SkeletonFeed />
          ) : error ? (
            <div className="empty-feed">
              <div className="empty-feed-icon">⚠️</div>
              <h3>Error al cargar</h3>
              <p>{error}</p>
            </div>
          ) : experiencias.length === 0 ? (
            <div className="empty-feed">
              <div className="empty-feed-icon">🌄</div>
              <h3>Sé el primero en compartir</h3>
              <p>
                Aún no hay experiencias publicadas.
                {user
                  ? " ¡Comparte algo con la comunidad!"
                  : " Inicia sesión para publicar tu primera experiencia."}
              </p>
            </div>
          ) : (
            /* Renderizar tarjetas del feed */
            experiencias.map((exp) => (
              <TarjetaExperiencia
                key={exp.id}
                experiencia={exp}
                onBorrada={handleBorrada}
              />
            ))
          )}
        </div>

        {/* ── SIDEBAR ── */}
        <aside className="exp-sidebar">
          {/* Stats del feed */}
          <div className="exp-sidebar-panel">
            <h3>Actividad del valle</h3>
            <div className="exp-sidebar-stat">
              <span className="exp-sidebar-stat-label">Experiencias</span>
              <span className="exp-sidebar-stat-value">{stats.total}</span>
            </div>
            <div className="exp-sidebar-stat">
              <span className="exp-sidebar-stat-label">Con foto</span>
              <span className="exp-sidebar-stat-value">{stats.conFoto}</span>
            </div>
            <div className="exp-sidebar-stat">
              <span className="exp-sidebar-stat-label">Autores</span>
              <span className="exp-sidebar-stat-value">{stats.usuarios}</span>
            </div>
          </div>

          {/* Panel para usuarios no logueados */}
          {!user && (
            <div className="exp-sidebar-panel">
              <h3>Únete a la comunidad</h3>
              <p
                style={{
                  fontSize: 13,
                  color: "#666",
                  marginBottom: 14,
                  lineHeight: 1.5,
                }}
              >
                Crea una cuenta gratis para publicar tus experiencias y
                conectarte con el valle.
              </p>
              <Link
                href="/registro"
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "10px",
                  background: "var(--color-btn-primary)",
                  color: "white",
                  borderRadius: 8,
                  fontFamily: "var(--font-display)",
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: "none",
                  transition: "background-color 0.15s ease",
                }}
              >
                Crear cuenta gratis
              </Link>
            </div>
          )}

          {/* Panel para usuarios logueados */}
          {user && (
            <div className="exp-sidebar-panel">
              <h3>Tu actividad</h3>
              <p
                style={{
                  fontSize: 12,
                  color: "#666",
                  marginBottom: 14,
                  lineHeight: 1.5,
                }}
              >
                Comparte momentos, fotos y recomendaciones de tus visitas al
                distrito.
              </p>
              <button
                className="btn-publicar"
                onClick={() => setModalAbierto(true)}
                style={{ width: "100%", justifyContent: "center" }}
              >
                <IconPlus />
                Nueva experiencia
              </button>
            </div>
          )}
        </aside>
      </div>

      {/* ── MODAL DE PUBLICACIÓN ── */}
      {/*
        Solo se monta cuando modalAbierto === true
        Esto resetea el estado del formulario automáticamente al cerrar
      */}
      {modalAbierto && (
        <FormularioExperiencia
          onClose={() => setModalAbierto(false)}
          onPublicado={handlePublicado}
        />
      )}
    </div>
  );
}
