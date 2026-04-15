// app/lugares/[id]/page.js — VERSIÓN CON GALERÍA DE EXPERIENCIAS
// ─────────────────────────────────────────────────────
// Agrega al final de la página la galería de fotos
// de las experiencias que mencionan este lugar
// 🔧 Conecta con: tablas lugares + experiencias + profiles
// ─────────────────────────────────────────────────────

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import GaleriaFotos from "@/components/GaleriaFotos";
import "@/styles/lugar-detalle.css";
import "@/styles/galeria.css";

// ── MAPA DE ESTILOS POR CATEGORÍA ──
const CATEGORIA_STYLES = {
  naturaleza: { bg: "#1a3a26", color: "#6bffab", label: "Naturaleza" },
  patrimonio: { bg: "#3a2a1a", color: "#ffb86b", label: "Patrimonio" },
  mirador: { bg: "#1a2a5c", color: "#6babff", label: "Mirador" },
  aventura: { bg: "#3a1a1a", color: "#ff8a6b", label: "Aventura" },
  cultura: { bg: "#2a1a3a", color: "#c46bff", label: "Cultura" },
  gastronomia: { bg: "#3a2a10", color: "#ffd46b", label: "Gastronomía" },
};

// ── ÍCONOS ──
const IconArrowLeft = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12,19 5,12 12,5" />
  </svg>
);
const IconPin = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export default function LugarDetallePage() {
  const { id } = useParams();

  const [lugar, setLugar] = useState(null);
  const [caserio, setCaserio] = useState(null); // Caserío vinculado
  const [experiencias, setExperiencias] = useState([]); // Experiencias con foto
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    async function cargar() {
      try {
        // 1. Cargar el lugar
        // 🔧 Conecta con: tabla lugares SELECT WHERE id
        const { data: lug, error: lugError } = await supabase
          .from("lugares")
          .select("*")
          .eq("id", id)
          .eq("activo", true)
          .single();

        if (lugError) {
          setError(
            lugError.code === "PGRST116"
              ? "Lugar no encontrado."
              : "Error al cargar el lugar.",
          );
          return;
        }

        setLugar(lug);

        // 2. Si tiene caserío vinculado, cargarlo
        // 🔧 Conecta con: tabla caserios WHERE id = lugar.caserio_id
        if (lug.caserio_id) {
          const { data: cas } = await supabase
            .from("caserios")
            .select("id, nombre")
            .eq("id", lug.caserio_id)
            .single();

          if (cas) setCaserio(cas);
        }

        // 3. Cargar experiencias CON FOTO vinculadas a este lugar
        // 🔧 Conecta con: tabla experiencias WHERE lugar_id = id AND imagen_url IS NOT NULL
        const { data: exps } = await supabase
          .from("experiencias")
          .select(
            `
            id,
            contenido,
            imagen_url,
            created_at,
            perfil:profiles(nombre)
          `,
          )
          .eq("lugar_id", id)
          .eq("activo", true)
          .not("imagen_url", "is", null) // Solo las que tienen foto
          .order("created_at", { ascending: false })
          .limit(30); // Máximo 30 fotos en la galería

        setExperiencias(exps || []);
      } catch (err) {
        console.error(err);
        setError("Error inesperado.");
      } finally {
        setLoading(false);
      }
    }

    cargar();
  }, [id]);

  // ── CONSTRUIR ARRAY DE FOTOS DE EXPERIENCIAS ──
  // Normalizamos al formato que espera GaleriaFotos
  const fotosExperiencias = experiencias.map((exp) => ({
    id: exp.id,
    url: exp.imagen_url,
    titulo: exp.perfil?.nombre || "Visitante",
    subtitulo: exp.contenido
      ? exp.contenido.substring(0, 60) +
        (exp.contenido.length > 60 ? "..." : "")
      : null,
    // No ponemos link porque no hay página de detalle de experiencia individual
  }));

  // ── CARGANDO ──
  if (loading) {
    return (
      <div>
        <Link href="/lugares" className="btn-volver">
          <IconArrowLeft /> Sitios Turísticos
        </Link>
        <div
          style={{
            height: 400,
            borderRadius: 12,
            marginBottom: 32,
            background: "linear-gradient(90deg,#111 25%,#1a1a1a 50%,#111 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s infinite",
          }}
        />
      </div>
    );
  }

  if (error || !lugar) {
    return (
      <div>
        <Link href="/lugares" className="btn-volver">
          <IconArrowLeft /> Sitios Turísticos
        </Link>
        <div style={{ textAlign: "center", padding: 80 }}>
          <h2 style={{ fontFamily: "var(--font-display)", marginBottom: 10 }}>
            🗺️ {error || "Lugar no encontrado"}
          </h2>
          <Link
            href="/lugares"
            style={{
              color: "var(--color-blue)",
              fontFamily: "var(--font-display)",
              fontSize: 14,
              textDecoration: "none",
            }}
          >
            ← Ver todos los lugares
          </Link>
        </div>
      </div>
    );
  }

  const catStyle =
    CATEGORIA_STYLES[lugar.categoria] || CATEGORIA_STYLES.naturaleza;

  function formatearFecha(iso) {
    return new Date(iso).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  return (
    <div>
      {/* ── BOTÓN VOLVER ── */}
      <Link href="/lugares" className="btn-volver">
        <IconArrowLeft /> Sitios Turísticos
      </Link>

      {/* ── HERO ── */}
      <div className="detalle-hero">
        <img
          src={
            lugar.imagen_url ||
            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80"
          }
          alt={lugar.titulo}
          className="detalle-hero-img"
        />
        <div className="detalle-hero-overlay" />

        <div className="detalle-hero-content">
          <div className="detalle-hero-meta">
            <span
              className="badge-cat-lg"
              style={{ backgroundColor: catStyle.bg, color: catStyle.color }}
            >
              {catStyle.label}
            </span>
            <h1 className="detalle-hero-titulo">{lugar.titulo}</h1>
            {lugar.direccion && (
              <div className="detalle-hero-dir">
                <IconPin /> {lugar.direccion}
              </div>
            )}
          </div>
          {lugar.destacado && (
            <div
              style={{
                background: "rgba(245,197,66,0.15)",
                border: "1px solid rgba(245,197,66,0.3)",
                color: "var(--color-yellow)",
                padding: "6px 14px",
                borderRadius: 20,
                fontSize: 12,
                fontFamily: "var(--font-display)",
                fontWeight: 500,
                flexShrink: 0,
              }}
            >
              ★ Sitio Destacado
            </div>
          )}
        </div>
      </div>

      {/* ── LAYOUT MAIN + SIDEBAR ── */}
      <div className="detalle-layout">
        {/* ── COLUMNA PRINCIPAL ── */}
        <div className="detalle-main">
          {/* Descripción */}
          <div className="detalle-seccion">
            <h2 className="detalle-seccion-titulo">Descripción</h2>
            <p className="detalle-descripcion">
              {lugar.descripcion || "Sin descripción disponible."}
            </p>
          </div>

          {/* ── GALERÍA DE EXPERIENCIAS ── */}
          {/*
            Esta es la sección nueva: fotos de experiencias
            que los usuarios publicaron vinculadas a este lugar.
            Solo aparece si hay al menos 1 foto.
          */}
          <GaleriaFotos
            fotos={fotosExperiencias}
            titulo="Fotos de visitantes"
            icono="📸"
            columnas={3}
            maxVisible={9}
          />
        </div>

        {/* ── SIDEBAR ── */}
        <div className="detalle-sidebar">
          {/* Panel de datos */}
          <div className="detalle-info-panel">
            {/* Caserío vinculado */}
            {caserio && (
              <div className="info-fila">
                <span className="info-label">Caserío</span>
                <Link
                  href={`/caserios/${caserio.id}`}
                  style={{
                    fontSize: 13,
                    color: "var(--color-blue)",
                    textDecoration: "none",
                    fontFamily: "var(--font-body)",
                    transition: "opacity 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  {caserio.nombre} →
                </Link>
              </div>
            )}

            <div className="info-fila">
              <span className="info-label">Categoría</span>
              <span className="info-value">{catStyle.label}</span>
            </div>

            {lugar.direccion && (
              <div className="info-fila">
                <span className="info-label">Dirección</span>
                <span className="info-value">{lugar.direccion}</span>
              </div>
            )}

            {lugar.latitud && lugar.longitud && (
              <div className="info-fila">
                <span className="info-label">Coordenadas</span>
                <span className="info-value info-coords">
                  {lugar.latitud}, {lugar.longitud}
                </span>
              </div>
            )}

            {/* Contador de fotos de visitantes */}
            <div className="info-fila">
              <span className="info-label">Fotos de visitantes</span>
              <span
                className="info-value"
                style={{ color: "var(--color-blue)" }}
              >
                {fotosExperiencias.length}
              </span>
            </div>

            <div className="info-fila">
              <span className="info-label">Estado</span>
              <span
                className="info-value"
                style={{ color: "var(--color-green)" }}
              >
                ● Disponible
              </span>
            </div>

            <div className="info-fila">
              <span className="info-label">Publicado</span>
              <span className="info-value" style={{ fontSize: 12 }}>
                {formatearFecha(lugar.created_at)}
              </span>
            </div>
          </div>

          {/* Mini mapa */}
          {lugar.latitud && lugar.longitud && (
            <div
              className="detalle-info-panel"
              style={{ padding: 0, overflow: "hidden" }}
            >
              <div
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid var(--color-border)",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "var(--color-text-label)",
                  }}
                >
                  Ubicación
                </div>
              </div>
              <iframe
                title={`Mapa de ${lugar.titulo}`}
                width="100%"
                height="160"
                style={{ border: "none", display: "block" }}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${lugar.longitud - 0.01},${lugar.latitud - 0.01},${lugar.longitud + 0.01},${lugar.latitud + 0.01}&layer=mapnik&marker=${lugar.latitud},${lugar.longitud}`}
              />
              <a
                href={`https://www.openstreetmap.org/?mlat=${lugar.latitud}&mlon=${lugar.longitud}#map=15/${lugar.latitud}/${lugar.longitud}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "8px",
                  fontSize: 11,
                  color: "var(--color-blue)",
                  fontFamily: "var(--font-display)",
                  textDecoration: "none",
                  borderTop: "1px solid var(--color-border)",
                }}
              >
                Ver en mapa completo →
              </a>
            </div>
          )}

          {/* Invitación a publicar experiencia */}
          <div
            style={{
              background: "var(--color-bg-card)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--card-radius)",
              padding: "16px",
              marginTop: 14,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 8 }}>📸</div>
            <p
              style={{
                fontSize: 12,
                color: "#666",
                fontFamily: "var(--font-display)",
                marginBottom: 12,
                lineHeight: 1.5,
              }}
            >
              ¿Visitaste este lugar? Comparte tu experiencia con la comunidad.
            </p>
            <Link
              href="/experiencias"
              style={{
                display: "block",
                padding: "9px",
                background: "var(--color-btn-primary)",
                color: "white",
                borderRadius: 8,
                fontFamily: "var(--font-display)",
                fontSize: 12,
                fontWeight: 600,
                textDecoration: "none",
                transition: "background-color 0.15s",
              }}
            >
              Publicar experiencia
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
