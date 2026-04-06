// app/lugares/[id]/page.js
// ─────────────────────────────────────────────────────
// PÁGINA: Detalle de un lugar turístico
// Ruta dinámica: /lugares/[id]
//
// El [id] en el nombre de la carpeta es el parámetro
// dinámico de Next.js — se pasa como prop "params"
//
// 🔧 Conecta con: tabla public.lugares → SELECT por id
// ─────────────────────────────────────────────────────

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import "@/styles/lugar-detalle.css";

// ── MAPA DE ESTILOS DE CATEGORÍA ──
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

const IconCalendar = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: 14, height: 14 }}
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

export default function LugarDetallePage() {
  // useParams() obtiene el { id } de la URL dinámica
  const { id } = useParams();

  // ── ESTADO ──
  const [lugar, setLugar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ── CARGAR LUGAR POR ID ──
  // 🔧 Conecta con: tabla public.lugares → SELECT WHERE id = [id]
  useEffect(() => {
    async function cargarLugar() {
      try {
        const { data, error } = await supabase
          .from("lugares")
          .select("*")
          .eq("id", id) // Filtramos por el ID de la URL
          .eq("activo", true) // Solo si está activo
          .single(); // Esperamos un solo resultado

        if (error) {
          // .single() lanza error si no encuentra nada
          if (error.code === "PGRST116") {
            setError("Lugar no encontrado.");
          } else {
            throw error;
          }
          return;
        }

        setLugar(data);
      } catch (err) {
        console.error("Error cargando lugar:", err);
        setError("Error al cargar el lugar. Intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    }

    if (id) cargarLugar();
  }, [id]);

  // ── FORMATEAR FECHA ──
  function formatearFecha(iso) {
    return new Date(iso).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  // ── ESTADOS DE CARGA Y ERROR ──

  if (loading) {
    return (
      <div>
        <Link href="/lugares" className="btn-volver">
          <IconArrowLeft /> Sitios Turísticos
        </Link>
        {/* Skeleton del hero */}
        <div
          style={{
            height: 400,
            borderRadius: 12,
            background:
              "linear-gradient(90deg, #111 25%, #1a1a1a 50%, #111 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s infinite",
            marginBottom: 32,
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
        <div className="not-found-page">
          <h2>🗺️ {error || "Lugar no encontrado"}</h2>
          <p>Es posible que este lugar haya sido eliminado o no exista.</p>
          <Link
            href="/lugares"
            className="btn-primary-link"
            style={{
              display: "inline-block",
              padding: "11px 24px",
              background: "var(--color-btn-primary)",
              color: "white",
              borderRadius: 8,
              fontFamily: "var(--font-display)",
              fontSize: 14,
              textDecoration: "none",
            }}
          >
            Ver todos los lugares
          </Link>
        </div>
      </div>
    );
  }

  // Estilos de la categoría del lugar cargado
  const catStyle =
    CATEGORIA_STYLES[lugar.categoria] || CATEGORIA_STYLES.naturaleza;

  // ── RENDER PRINCIPAL ──
  return (
    <div>
      {/* ── BREADCRUMB / BOTÓN VOLVER ── */}
      <Link href="/lugares" className="btn-volver">
        <IconArrowLeft /> Sitios Turísticos
      </Link>

      {/* ── HERO CON IMAGEN ── */}
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

        {/* Contenido sobre la imagen */}
        <div className="detalle-hero-content">
          <div className="detalle-hero-meta">
            {/* Badge de categoría */}
            <span
              className="badge-cat-lg"
              style={{ backgroundColor: catStyle.bg, color: catStyle.color }}
            >
              {catStyle.label}
            </span>

            {/* Título */}
            <h1 className="detalle-hero-titulo">{lugar.titulo}</h1>

            {/* Dirección */}
            {lugar.direccion && (
              <div className="detalle-hero-dir">
                <IconPin />
                {lugar.direccion}
              </div>
            )}
          </div>

          {/* Estrella de destacado */}
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

      {/* ── LAYOUT: MAIN + SIDEBAR ── */}
      <div className="detalle-layout">
        {/* ── COLUMNA PRINCIPAL ── */}
        <div className="detalle-main">
          {/* Descripción completa */}
          <div className="detalle-seccion">
            <h2 className="detalle-seccion-titulo">Descripción</h2>
            <p className="detalle-descripcion">
              {lugar.descripcion || "Sin descripción disponible."}
            </p>
          </div>

          {/*
            🔧 EN FASES FUTURAS puedes agregar aquí:
            - Galería de fotos (cuando tengas storage)
            - Experiencias relacionadas (Fase 5)
            - Mapa embebido (Fase 6)
          */}
        </div>

        {/* ── SIDEBAR DE INFORMACIÓN ── */}
        <div className="detalle-sidebar">
          {/* Panel de datos rápidos */}
          <div className="detalle-info-panel">
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

            {/* Coordenadas (si existen) */}
            {lugar.latitud && lugar.longitud && (
              <div className="info-fila">
                <span className="info-label">Coordenadas</span>
                <span className="info-value info-coords">
                  {lugar.latitud}, {lugar.longitud}
                </span>
              </div>
            )}

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

          {/* Mini mapa placeholder (se activa en Fase 6) */}
          {lugar.latitud && lugar.longitud && (
            <div className="detalle-info-panel" style={{ padding: 16 }}>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--color-text-label)",
                  marginBottom: 12,
                }}
              >
                Ubicación
              </h3>
              {/* Iframe de mapa estático de OpenStreetMap */}
              <iframe
                title={`Mapa de ${lugar.titulo}`}
                width="100%"
                height="160"
                style={{ borderRadius: 8, border: "none", display: "block" }}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${lugar.longitud - 0.01},${lugar.latitud - 0.01},${lugar.longitud + 0.01},${lugar.latitud + 0.01}&layer=mapnik&marker=${lugar.latitud},${lugar.longitud}`}
              />
              <a
                href={`https://www.openstreetmap.org/?mlat=${lugar.latitud}&mlon=${lugar.longitud}#map=15/${lugar.latitud}/${lugar.longitud}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block",
                  textAlign: "center",
                  marginTop: 8,
                  fontSize: 11,
                  color: "var(--color-blue)",
                  fontFamily: "var(--font-display)",
                  textDecoration: "none",
                }}
              >
                Ver en mapa completo →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
