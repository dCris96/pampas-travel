// app/caserios/[id]/page.js
// ─────────────────────────────────────────────────────
// PÁGINA: Detalle de caserío — Ruta: /caserios/[id]
//
// Muestra:
//   ✓ Info del caserío (descripción, stats, mapa)
//   ✓ Lista de lugares vinculados (sidebar)
//   ✓ GALERÍA de fotos de los lugares vinculados (parte inferior)
//
// 🔧 Conecta con: tablas caserios + lugares
// ─────────────────────────────────────────────────────

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import GaleriaFotos from "@/components/GaleriaFotos";
import "@/styles/caserios.css";
import "@/styles/galeria.css";

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
const IconUsers = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
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
const IconRoad = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 19l4-14h8l4 14" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

function formatNum(n) {
  if (!n && n !== 0) return "—";
  return n.toLocaleString("es-PE");
}

export default function CaserioDetallePage() {
  const { id } = useParams();

  const [caserio, setCaserio] = useState(null);
  const [lugares, setLugares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    async function cargar() {
      try {
        // 1. Cargar el caserío
        const { data: cas, error: casError } = await supabase
          .from("caserios")
          .select("*")
          .eq("id", id)
          .eq("activo", true)
          .single();

        if (casError) {
          setError(
            casError.code === "PGRST116"
              ? "Caserío no encontrado."
              : "Error al cargar el caserío.",
          );
          return;
        }

        setCaserio(cas);

        // 2. Cargar lugares vinculados a este caserío
        // 🔧 Conecta con: tabla lugares WHERE caserio_id = id
        const { data: lugs, error: lugsError } = await supabase
          .from("lugares")
          .select("id, titulo, descripcion, categoria, imagen_url, direccion")
          .eq("caserio_id", id)
          .eq("activo", true)
          .order("titulo");

        if (!lugsError) setLugares(lugs || []);
      } catch (err) {
        console.error(err);
        setError("Error inesperado al cargar.");
      } finally {
        setLoading(false);
      }
    }

    cargar();
  }, [id]);

  // ── CONSTRUIR ARRAY DE FOTOS PARA LA GALERÍA ──
  // Tomamos las imágenes de los lugares vinculados al caserío
  const fotosGaleria = lugares
    .filter((l) => l.imagen_url) // Solo los que tienen foto
    .map((l) => ({
      id: l.id,
      url: l.imagen_url,
      titulo: l.titulo,
      subtitulo: l.categoria
        ? l.categoria.charAt(0).toUpperCase() + l.categoria.slice(1)
        : "",
      link: `/lugares/${l.id}`, // Link al detalle del lugar
    }));

  // ── ESTADOS DE CARGA ──
  if (loading) {
    return (
      <div>
        <Link href="/caserios" className="btn-volver">
          <IconArrowLeft /> Caseríos
        </Link>
        <div
          style={{
            height: 380,
            borderRadius: 12,
            marginBottom: 28,
            background: "linear-gradient(90deg,#111 25%,#1a1a1a 50%,#111 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s infinite",
          }}
        />
      </div>
    );
  }

  if (error || !caserio) {
    return (
      <div>
        <Link href="/caserios" className="btn-volver">
          <IconArrowLeft /> Caseríos
        </Link>
        <div style={{ textAlign: "center", padding: 80 }}>
          <h2 style={{ fontFamily: "var(--font-display)", marginBottom: 10 }}>
            🏘️ {error || "Caserío no encontrado"}
          </h2>
          <Link
            href="/caserios"
            style={{
              color: "var(--color-blue)",
              fontFamily: "var(--font-display)",
              fontSize: 14,
              textDecoration: "none",
            }}
          >
            ← Ver todos los caseríos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* ── BOTÓN VOLVER ── */}
      <Link href="/caserios" className="btn-volver">
        <IconArrowLeft /> Caseríos y Centros Poblados
      </Link>

      {/* ── HERO ── */}
      <div className="caserio-hero">
        <img
          src={
            caserio.imagen_url ||
            "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80"
          }
          alt={caserio.nombre}
          className="caserio-hero-img"
        />
        <div className="caserio-hero-overlay" />

        <div className="caserio-hero-content">
          <h1 className="caserio-hero-nombre">{caserio.nombre}</h1>

          {/* Stats en el hero */}
          <div className="caserio-hero-stats">
            {caserio.altitud && (
              <span className="caserio-hero-stat">
                <IconMountain />
                {formatNum(caserio.altitud)} msnm
              </span>
            )}
            {caserio.poblacion && (
              <span className="caserio-hero-stat">
                <IconUsers />
                {formatNum(caserio.poblacion)} hab.
              </span>
            )}
            {caserio.distancia_km !== null && (
              <span className="caserio-hero-stat">
                <IconRoad />
                {caserio.distancia_km === 0
                  ? "Capital del distrito"
                  : `${caserio.distancia_km} km del centro`}
              </span>
            )}
            {lugares.length > 0 && (
              <span className="caserio-hero-stat">
                <IconPin />
                {lugares.length} sitio{lugares.length !== 1 ? "s" : ""}{" "}
                turístico{lugares.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── LAYOUT: MAIN + SIDEBAR ── */}
      <div className="caserio-detalle-layout">
        {/* ── COLUMNA PRINCIPAL ── */}
        <div>
          {/* Descripción */}
          <div className="caserio-seccion">
            <h2>Sobre el caserío</h2>
            <p className="caserio-descripcion">
              {caserio.descripcion || "No hay descripción disponible."}
            </p>
          </div>

          {/* ── GALERÍA DE LUGARES VINCULADOS ── */}
          {/*
            Esta es la galería principal de esta página:
            Muestra las fotos de todos los lugares turísticos
            que pertenecen a este caserío
          */}
          <GaleriaFotos
            fotos={fotosGaleria}
            titulo={`Sitios turísticos en ${caserio.nombre}`}
            icono="🏔️"
            columnas={3}
            maxVisible={9}
          />

          {/* Mini mapa si hay coordenadas */}
          {caserio.latitud && caserio.longitud && (
            <div
              className="caserio-seccion"
              style={{ padding: 0, overflow: "hidden" }}
            >
              <div
                style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid var(--color-border)",
                }}
              >
                <h2 style={{ margin: 0 }}>Ubicación</h2>
              </div>
              <iframe
                title={`Mapa de ${caserio.nombre}`}
                className="caserio-mapa-mini"
                style={{ height: 220 }}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${caserio.longitud - 0.02},${caserio.latitud - 0.02},${caserio.longitud + 0.02},${caserio.latitud + 0.02}&layer=mapnik&marker=${caserio.latitud},${caserio.longitud}`}
              />
              <div
                style={{
                  padding: "10px 20px",
                  borderTop: "1px solid var(--color-border)",
                }}
              >
                <a
                  href={`https://www.openstreetmap.org/?mlat=${caserio.latitud}&mlon=${caserio.longitud}#map=14/${caserio.latitud}/${caserio.longitud}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "var(--color-blue)",
                    fontSize: 12,
                    fontFamily: "var(--font-display)",
                    textDecoration: "none",
                  }}
                >
                  Ver en mapa completo →
                </a>
              </div>
            </div>
          )}
        </div>

        {/* ── SIDEBAR ── */}
        <div>
          {/* Panel de datos */}
          <div className="caserio-panel">
            {caserio.altitud && (
              <div className="caserio-panel-fila">
                <div className="caserio-panel-fila-icon">🏔️</div>
                <div className="caserio-panel-fila-info">
                  <div className="caserio-panel-fila-label">Altitud</div>
                  <div className="caserio-panel-fila-valor">
                    {formatNum(caserio.altitud)} msnm
                  </div>
                </div>
              </div>
            )}

            {caserio.poblacion && (
              <div className="caserio-panel-fila">
                <div className="caserio-panel-fila-icon">👥</div>
                <div className="caserio-panel-fila-info">
                  <div className="caserio-panel-fila-label">Población</div>
                  <div className="caserio-panel-fila-valor">
                    {formatNum(caserio.poblacion)} hab.
                  </div>
                </div>
              </div>
            )}

            {caserio.distancia_km !== null && (
              <div className="caserio-panel-fila">
                <div className="caserio-panel-fila-icon">🛣️</div>
                <div className="caserio-panel-fila-info">
                  <div className="caserio-panel-fila-label">Distancia</div>
                  <div className="caserio-panel-fila-valor">
                    {caserio.distancia_km === 0
                      ? "Capital del distrito"
                      : `${caserio.distancia_km} km`}
                  </div>
                </div>
              </div>
            )}

            <div className="caserio-panel-fila">
              <div className="caserio-panel-fila-icon">🗺️</div>
              <div className="caserio-panel-fila-info">
                <div className="caserio-panel-fila-label">
                  Sitios turísticos
                </div>
                <div className="caserio-panel-fila-valor">{lugares.length}</div>
              </div>
            </div>
          </div>

          {/* Lista de lugares vinculados */}
          {lugares.length > 0 && (
            <div className="caserio-panel" style={{ marginTop: 14 }}>
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
                  Lugares para visitar
                </div>
              </div>

              <div className="caserio-lugares-lista">
                {lugares.map((lugar) => (
                  <Link
                    key={lugar.id}
                    href={`/lugares/${lugar.id}`}
                    className="caserio-lugar-item"
                  >
                    {lugar.imagen_url ? (
                      <img
                        src={lugar.imagen_url}
                        alt={lugar.titulo}
                        className="caserio-lugar-thumb"
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className="caserio-lugar-thumb"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 16,
                          background: "#111",
                        }}
                      >
                        🏔️
                      </div>
                    )}
                    <div>
                      <span className="caserio-lugar-nombre">
                        {lugar.titulo}
                      </span>
                      <span className="caserio-lugar-cat">
                        {lugar.categoria}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
