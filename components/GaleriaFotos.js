// components/GaleriaFotos.js
// ─────────────────────────────────────────────────────
// Galería de fotos reutilizable con lightbox
//
// Props:
//   fotos      → array de objetos:
//                { id, url, titulo, subtitulo, link? }
//   titulo     → string — título de la sección
//   icono      → emoji decorativo
//   columnas   → 2 | 3 | 4 (default: 3)
//   maxVisible → número de fotos antes de mostrar "+N más"
//                (default: 9, null = mostrar todas)
// ─────────────────────────────────────────────────────

"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import "@/styles/galeria.css";

// ── ÍCONOS ──
const IconZoom = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="11" y1="8" x2="11" y2="14" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

const IconX = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconChevronLeft = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="15,18 9,12 15,6" />
  </svg>
);

const IconChevronRight = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="9,18 15,12 9,6" />
  </svg>
);

export default function GaleriaFotos({
  fotos = [],
  titulo = "Galería",
  icono = "📷",
  columnas = 3,
  maxVisible = 9,
}) {
  // ── LIGHTBOX STATE ──
  const [lightboxIdx, setLightboxIdx] = useState(null); // null = cerrado

  // Fotos a mostrar en el grid (respeta maxVisible)
  const MAX = maxVisible || fotos.length;
  const fotosVisibles = fotos.slice(0, MAX);
  const restantes = fotos.length - MAX;

  // ── ABRIR LIGHTBOX ──
  function abrirLightbox(idx) {
    setLightboxIdx(idx);
    // Bloquear scroll del body
    document.body.style.overflow = "hidden";
  }

  // ── CERRAR LIGHTBOX ──
  function cerrarLightbox() {
    setLightboxIdx(null);
    document.body.style.overflow = "";
  }

  // ── NAVEGAR EN LIGHTBOX ──
  const irAnterior = useCallback(() => {
    setLightboxIdx((i) => (i - 1 + fotos.length) % fotos.length);
  }, [fotos.length]);

  const irSiguiente = useCallback(() => {
    setLightboxIdx((i) => (i + 1) % fotos.length);
  }, [fotos.length]);

  // ── TECLADO ──
  useEffect(() => {
    if (lightboxIdx === null) return;

    function handleKey(e) {
      if (e.key === "Escape") cerrarLightbox();
      if (e.key === "ArrowLeft") irAnterior();
      if (e.key === "ArrowRight") irSiguiente();
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxIdx, irAnterior, irSiguiente]);

  // ── CLEANUP al desmontar ──
  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Si no hay fotos, mostrar estado vacío
  if (fotos.length === 0) {
    return (
      <div className="galeria-seccion">
        <div className="galeria-seccion-header">
          <h3 className="galeria-seccion-titulo">
            <span>{icono}</span> {titulo}
          </h3>
          <span className="galeria-count">0 fotos</span>
        </div>
        <div className="galeria-vacia">
          <div className="galeria-vacia-icon">🖼️</div>
          <p>Aún no hay fotos en esta galería.</p>
        </div>
      </div>
    );
  }

  const fotoActual = lightboxIdx !== null ? fotos[lightboxIdx] : null;

  return (
    <>
      {/* ── SECCIÓN ── */}
      <div className="galeria-seccion">
        {/* Header */}
        <div className="galeria-seccion-header">
          <h3 className="galeria-seccion-titulo">
            <span>{icono}</span> {titulo}
          </h3>
          <span className="galeria-count">
            {fotos.length} foto{fotos.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Grid */}
        <div className={`galeria-grid cols-${columnas}`}>
          {fotosVisibles.map((foto, idx) => {
            // La última posición puede ser el botón "+N más"
            const esUltima = idx === fotosVisibles.length - 1;
            const hayRestantes = restantes > 0;
            const mostrarMas = esUltima && hayRestantes;

            return (
              <div
                key={foto.id || idx}
                className={`galeria-item ${mostrarMas ? "ver-mas" : ""}`}
                onClick={() => abrirLightbox(idx)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && abrirLightbox(idx)}
                aria-label={
                  mostrarMas
                    ? `Ver ${restantes} fotos más`
                    : `Ver ${foto.titulo || "foto"}`
                }
              >
                {/* Imagen */}
                <img
                  src={foto.url}
                  alt={foto.titulo || "Foto de la galería"}
                  className="galeria-foto"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src =
                      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=50";
                  }}
                />

                {/* Overlay de hover */}
                <div className="galeria-overlay">
                  {!mostrarMas && (
                    <div className="galeria-overlay-icon">
                      <IconZoom />
                    </div>
                  )}
                </div>

                {/* Botón "+N más" encima de la última foto */}
                {mostrarMas && (
                  <div className="galeria-ver-mas-label">
                    +{restantes}
                    <span>más fotos</span>
                  </div>
                )}

                {/* Meta info (nombre/autor) */}
                {!mostrarMas && (foto.titulo || foto.subtitulo) && (
                  <div className="galeria-item-meta">
                    {foto.titulo && (
                      <span className="galeria-item-meta-nombre">
                        {foto.titulo}
                      </span>
                    )}
                    {foto.subtitulo && (
                      <span className="galeria-item-meta-sub">
                        {foto.subtitulo}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Link "ver todas" si hay más fotos */}
        {restantes > 0 && (
          <button
            onClick={() => abrirLightbox(0)}
            style={{
              display: "block",
              width: "100%",
              marginTop: 10,
              padding: "10px",
              background: "var(--color-bg-card)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              color: "var(--color-blue)",
              fontFamily: "var(--font-display)",
              fontSize: 13,
              cursor: "pointer",
              transition: "background-color 0.15s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--color-bg-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "var(--color-bg-card)")
            }
          >
            Ver las {fotos.length} fotos →
          </button>
        )}
      </div>

      {/* ── LIGHTBOX ── */}
      {lightboxIdx !== null && fotoActual && (
        <div
          className="lightbox-overlay"
          onClick={(e) => e.target === e.currentTarget && cerrarLightbox()}
          role="dialog"
          aria-modal="true"
          aria-label="Visor de imágenes"
        >
          {/* Botón cerrar */}
          <button
            className="lightbox-cerrar"
            onClick={cerrarLightbox}
            aria-label="Cerrar"
          >
            <IconX />
          </button>

          {/* Anterior */}
          {fotos.length > 1 && (
            <button
              className="lightbox-nav prev"
              onClick={irAnterior}
              aria-label="Anterior"
            >
              <IconChevronLeft />
            </button>
          )}

          {/* Imagen principal */}
          <div className="lightbox-contenedor">
            <img
              src={fotoActual.url}
              alt={fotoActual.titulo || "Foto"}
              className="lightbox-imagen"
            />

            {/* Info de la foto */}
            {(fotoActual.titulo || fotoActual.subtitulo) && (
              <div className="lightbox-info">
                {fotoActual.titulo && (
                  <div className="lightbox-info-nombre">
                    {fotoActual.titulo}
                  </div>
                )}
                {fotoActual.subtitulo && (
                  <div className="lightbox-info-sub">
                    {fotoActual.subtitulo}
                  </div>
                )}
                {/* Link al lugar/experiencia si existe */}
                {fotoActual.link && (
                  <Link
                    href={fotoActual.link}
                    style={{
                      color: "var(--color-blue)",
                      fontSize: 12,
                      fontFamily: "var(--font-display)",
                      textDecoration: "none",
                      display: "block",
                      marginTop: 6,
                    }}
                    onClick={cerrarLightbox}
                  >
                    Ver detalle →
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Siguiente */}
          {fotos.length > 1 && (
            <button
              className="lightbox-nav next"
              onClick={irSiguiente}
              aria-label="Siguiente"
            >
              <IconChevronRight />
            </button>
          )}

          {/* Contador */}
          {fotos.length > 1 && (
            <div className="lightbox-contador">
              {lightboxIdx + 1} / {fotos.length}
            </div>
          )}

          {/* Miniaturas (filmstrip) — solo si hay más de 2 fotos */}
          {fotos.length > 2 && (
            <div className="lightbox-miniaturas">
              {fotos.map((f, i) => (
                <div
                  key={f.id || i}
                  className={`lightbox-miniatura ${i === lightboxIdx ? "activa" : ""}`}
                  onClick={() => setLightboxIdx(i)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Ir a foto ${i + 1}`}
                >
                  <img src={f.url} alt="" loading="lazy" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
