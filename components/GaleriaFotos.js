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

import { useState, useEffect, useCallback, useRef } from "react";
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

  // ── SWIPE STATE ──
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const isSwiping = useRef(false);
  const swipeThreshold = 50;

  // ── ABRIR LIGHTBOX ──
  function abrirLightbox(idx) {
    setLightboxIdx(idx);
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

  // ── NAVEGACIÓN DEL NAVEGADOR (history) ──
  useEffect(() => {
    if (lightboxIdx === null) return;

    const state = { lightboxOpen: true };
    window.history.pushState(state, "", window.location.href);

    function handlePopState(e) {
      cerrarLightbox();
    }

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [lightboxIdx]);

  // ── SWIPE / DRAG ──
  const handleTouchStart = useCallback((e) => {
    const touch = e.touches ? e.touches[0] : e;
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    isSwiping.current = false;
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (touchStartX.current === null) return;

    const touch = e.touches ? e.touches[0] : e;
    const diffX = touch.clientX - touchStartX.current;
    const diffY = touch.clientY - touchStartY.current;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
      isSwiping.current = true;
      if (e.preventDefault) e.preventDefault();
    }
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (touchStartX.current === null) return;

    const touch = e.changedTouches ? e.changedTouches[0] : e;
    const diffX = touch.clientX - touchStartX.current;

    if (Math.abs(diffX) > swipeThreshold && isSwiping.current) {
      if (diffX > 0) {
        irAnterior();
      } else {
        irSiguiente();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
    isSwiping.current = false;
  }, [irAnterior, irSiguiente]);

  // ── MOUSE DRAG ──
  const isMouseDown = useRef(false);
  const mouseStartX = useRef(null);

  const handleMouseDown = useCallback((e) => {
    isMouseDown.current = true;
    mouseStartX.current = e.clientX;
  }, []);

  const handleMouseUp = useCallback((e) => {
    if (!isMouseDown.current || mouseStartX.current === null) return;

    const diffX = e.clientX - mouseStartX.current;

    if (Math.abs(diffX) > swipeThreshold) {
      if (diffX > 0) {
        irAnterior();
      } else {
        irSiguiente();
      }
    }

    isMouseDown.current = false;
    mouseStartX.current = null;
  }, [irAnterior, irSiguiente]);

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

        {/* Grid Masonry */}
        <div className={`galeria-grid cols-${columnas}`}>
          {fotosVisibles.map((foto, idx) => {
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

                <div className="galeria-overlay">
                  {!mostrarMas && (
                    <div className="galeria-overlay-icon">
                      <IconZoom />
                    </div>
                  )}
                </div>

                {mostrarMas && (
                  <div className="galeria-ver-mas-label">
                    +{restantes}
                    <span>más fotos</span>
                  </div>
                )}

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
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            isMouseDown.current = false;
            mouseStartX.current = null;
          }}
        >
          {/* Botón cerrar (X) */}
          <button
            className="lightbox-cerrar"
            onClick={cerrarLightbox}
            aria-label="Cerrar"
          >
            <IconX />
          </button>

          {/* Botón retroceder (flecha atrás) - visible en pantallas grandes */}
          <button
            className="lightbox-atras"
            onClick={cerrarLightbox}
            aria-label="Volver atrás"
          >
            <IconArrowLeft />
            <span>Volver</span>
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

          {/* Miniaturas */}
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