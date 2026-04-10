// app/calendario/[id]/page.js
// ─────────────────────────────────────────────────────
// DETALLE DE FESTIVIDAD
// Diseño editorial: texto + fotos intercaladas + audios
// ─────────────────────────────────────────────────────

"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import "@/styles/mitos-detalle.css";
import "@/styles/festividad-detalle.css";

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

const IconPlay = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5,3 19,12 5,21" />
  </svg>
);

const IconPausa = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="4" width="4" height="16" />
    <rect x="14" y="4" width="4" height="16" />
  </svg>
);

// ── HELPER: Formatear segundos → mm:ss ──
function formatTiempo(seg) {
  if (!seg || isNaN(seg)) return "0:00";
  const m = Math.floor(seg / 60);
  const s = Math.floor(seg % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ── HELPER: Formatear fecha ──
function formatFechaLarga(fechaStr, fechaFinStr) {
  const opciones = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const f = new Date(fechaStr + "T12:00:00").toLocaleDateString(
    "es-MX",
    opciones,
  );
  if (!fechaFinStr) return f;
  const ff = new Date(fechaFinStr + "T12:00:00").toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
  });
  return `${f} al ${ff}`;
}

// ── PÁGINA PRINCIPAL ──
export default function MitosDetallePage() {
  const { id } = useParams();

  const [mito, setMito] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ── CARGAR FESTIVIDAD + AUDIOS ──
  // 🔧 Conecta con: tablas festividades + festividad_audios
  useEffect(() => {
    async function cargar() {
      try {
        // Mito
        const { data: mitoData, error: mitoErr } = await supabase
          .from("mitos")
          .select("*")
          .eq("id", id)
          .eq("activo", true)
          .single();

        if (mitoErr || !mitoData) {
          setError("Mito no encontrado.");
          return;
        }

        setMito(mitoData);
      } catch (err) {
        console.error(err);
        setError("Error al cargar el mito.");
      } finally {
        setLoading(false);
      }
    }
    if (id) cargar();
  }, [id]);

  // ── ESTADOS DE CARGA / ERROR ──
  if (loading) {
    return (
      <div className="festividad-root">
        <Link href="/mitos" className="fest-volver">
          <IconArrowLeft /> Mitos y Leyendas
        </Link>
        <div
          style={{
            height: "clamp(280px, 45vw, 480px)",
            borderRadius: 14,
            background: "linear-gradient(90deg,#111 25%,#1a1a1a 50%,#111 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s infinite",
            marginBottom: 40,
          }}
        />
        <div
          style={{
            maxWidth: 840,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {[100, 80, 90, 70, 85].map((w, i) => (
            <div
              key={i}
              style={{
                height: 16,
                borderRadius: 6,
                width: `${w}%`,
                background:
                  "linear-gradient(90deg,#111 25%,#1a1a1a 50%,#111 75%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.5s infinite",
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (error || !mito) {
    return (
      <div className="festividad-root">
        <Link href="/mitos" className="fest-volver">
          <IconArrowLeft /> Mitos y Leyendas
        </Link>
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <p
            style={{
              fontFamily: "Crimson Text,Georgia,serif",
              fontSize: 20,
              fontStyle: "italic",
              color: "#666",
            }}
          >
            {error || "Mito no encontrado."}
          </p>
          <Link
            href="/mitos"
            style={{
              color: "var(--cal-gold)",
              fontFamily: "Crimson Text,Georgia,serif",
              fontSize: 16,
              marginTop: 16,
              display: "block",
              textDecoration: "none",
            }}
          >
            ← Volver a mitos y leyendas
          </Link>
        </div>
      </div>
    );
  }

  // Color de acento de esta festividad (con fallback)
  const acento = mito.color_acento || "#c8952a";

  return (
    <div
      className="festividad-root"
      style={{ "--acento": acento, "--acento-dim": acento + "99" }}
    >
      {/* ── BOTÓN VOLVER ── */}
      <Link href="/mitos" className="fest-volver">
        <IconArrowLeft />
        Mitos y Leyendas
      </Link>

      {/* ── HERO CON IMAGEN ── */}
      <div className="fest-hero">
        {mito.cover_url ? (
          <img
            src={mito.cover_url}
            alt={mito.titulo}
            className="fest-hero-img"
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              background: `linear-gradient(135deg, ${acento}22, #0c090600)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 64,
            }}
          >
            📖
          </div>
        )}
        <div className="fest-hero-overlay" />

        <div className="fest-hero-content">
          {/* Badge de fecha */}
          <div className="fest-fecha-badge">
            <p>
              Origen: {mito.origen}, | Autor: {mito.epoca}
            </p>
          </div>

          {/* Título y subtítulo */}
          <h1 className="fest-titulo">{mito.titulo}</h1>
          {mito.subtitulo && <p className="fest-subtitulo">{mito.subtitulo}</p>}
        </div>
      </div>

      {/* ── DIVIDER ── */}
      <div className="fest-divider">
        <div className="fest-divider-line" />
        <span className="fest-divider-symbol">✦</span>
        <div className="fest-divider-line" />
      </div>

      {/* ── CONTENIDO EDITORIAL ── */}
      <div className="fest-contenido">
        {/* ── PRIMER BLOQUE DE TEXTO ── */}
        {/* Con letra capital (drop cap) */}
        {mito.contenido && (
          <div className="fest-texto-bloque primero">
            <p>{mito.contenido}</p>
          </div>
        )}

        {/* ── FOTO FINAL (ancho completo) ── */}
        {mito.cover_url && (
          <div className="fest-foto-final-wrapper">
            <img
              src={mito.cover_url}
              alt={`${mito.titulo} — vista final`}
              className="fest-foto-final"
              loading="lazy"
            />
          </div>
        )}

        {/* ── COLOFÓN ── */}
        <div className="fest-divider">
          <div className="fest-divider-line" />
          <span className="fest-divider-symbol">✦</span>
          <div className="fest-divider-line" />
        </div>

        <div className="fest-colofonFinal">
          <p>
            Un relato ancentral de <strong>Pampas</strong> — narrada con
            tradición, memoria y susurros antiguos.
          </p>
        </div>
      </div>
    </div>
  );
}
