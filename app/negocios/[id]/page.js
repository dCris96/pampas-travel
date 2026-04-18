// app/negocios/[id]/page.js
// ─────────────────────────────────────────────────────
// PÁGINA: Detalle de un negocio — Ruta: /negocios/[id]
// Muestra toda la info: descripción, amenidades,
// panel de precio, contacto (WhatsApp + teléfono)
// ─────────────────────────────────────────────────────

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import "@/styles/negocio-detalle.css";

// ── CONFIGURACIÓN DE TIPOS ──
const TIPO_CONFIG = {
  hotel: { emoji: "🏨", label: "Hotel", bg: "#1a2240", color: "#6babff" },
  restaurante: {
    emoji: "🍽️",
    label: "Restaurante",
    bg: "#2a1a10",
    color: "#ffb86b",
  },
  cafe: { emoji: "☕", label: "Café", bg: "#1a1510", color: "#ffd46b" },
  tienda: { emoji: "🛍️", label: "Tienda", bg: "#1a2a1a", color: "#6bffab" },
  servicio: { emoji: "⚙️", label: "Servicio", bg: "#1f1f1f", color: "#aaaaaa" },
  transporte: {
    emoji: "🚐",
    label: "Transporte",
    bg: "#1a1a2a",
    color: "#c46bff",
  },
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
const IconPhone = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);
const IconClock = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12,6 12,12 16,14" />
  </svg>
);
const IconWhatsApp = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
  </svg>
);

// ── HELPER: Formatear precio ──
function formatearPrecio(precio, moneda) {
  if (!precio) return null;
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: moneda || "PEN",
    minimumFractionDigits: 0,
  }).format(precio);
}

export default function NegocioDetallePage() {
  const { id } = useParams();
  const [negocio, setNegocio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const supabase = createClient();

  // 🔧 Conecta con: tabla public.negocios SELECT WHERE id = [id]
  useEffect(() => {
    async function cargar() {
      try {
        const { data, error } = await supabase
          .from("negocios")
          .select("*")
          .eq("id", id)
          .eq("activo", true)
          .single();

        if (error) {
          if (error.code === "PGRST116") setError("Negocio no encontrado.");
          else throw error;
          return;
        }
        setNegocio(data);
      } catch (err) {
        console.error(err);
        setError("Error al cargar el negocio.");
      } finally {
        setLoading(false);
      }
    }
    if (id) cargar();
  }, [id]);

  if (loading) {
    return (
      <div>
        <Link
          href="/negocios"
          className="btn-volver"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            color: "#666",
            textDecoration: "none",
            marginBottom: 20,
            fontFamily: "var(--font-display)",
          }}
        >
          <IconArrowLeft /> Negocios
        </Link>
        <div
          style={{
            height: 360,
            borderRadius: 12,
            background: "linear-gradient(90deg,#111 25%,#1a1a1a 50%,#111 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s infinite",
            marginBottom: 28,
          }}
        />
      </div>
    );
  }

  if (error || !negocio) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <Link
          href="/negocios"
          style={{
            color: "var(--color-blue)",
            fontSize: 13,
            fontFamily: "var(--font-display)",
            textDecoration: "none",
          }}
        >
          ← Volver a Negocios
        </Link>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            marginTop: 40,
            marginBottom: 10,
          }}
        >
          {error || "Negocio no encontrado"}
        </h2>
      </div>
    );
  }

  const config = TIPO_CONFIG[negocio.tipo] || TIPO_CONFIG.servicio;
  const precioFormateado = formatearPrecio(
    negocio.precio_desde,
    negocio.precio_moneda,
  );
  const unidadPrecio = negocio.tipo === "hotel" ? "noche" : "persona";

  return (
    <div>
      {/* ── BOTÓN VOLVER ── */}
      <Link
        href="/negocios"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 13,
          color: "#666",
          textDecoration: "none",
          marginBottom: 20,
          fontFamily: "var(--font-display)",
          transition: "color 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#666")}
      >
        <IconArrowLeft /> Negocios
      </Link>

      {/* ── HERO ── */}
      <div className="negocio-hero">
        <img
          src={
            negocio.imagen_url ||
            "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200&q=80"
          }
          alt={negocio.nombre}
          className="negocio-hero-img"
        />
        <div className="negocio-hero-overlay" />
        <div className="negocio-hero-content">
          <span
            className="negocio-hero-tipo-badge"
            style={{ backgroundColor: config.bg, color: config.color }}
          >
            {config.emoji} {config.label}
          </span>
          <h1 className="negocio-hero-nombre">{negocio.nombre}</h1>
          {negocio.direccion && (
            <div className="negocio-hero-dir">
              <IconPin /> {negocio.direccion}
            </div>
          )}
        </div>
      </div>

      {/* ── LAYOUT ── */}
      <div className="negocio-detalle-layout">
        {/* ── COLUMNA PRINCIPAL ── */}
        <div className="negocio-detalle-main">
          {/* Descripción */}
          <div className="negocio-seccion">
            <h2>Descripción</h2>
            <p className="negocio-descripcion">
              {negocio.descripcion || "Sin descripción."}
            </p>
          </div>

          {/* Amenidades */}
          {negocio.amenidades && negocio.amenidades.length > 0 && (
            <div className="negocio-seccion">
              <h2>Servicios e instalaciones</h2>
              <div className="amenidades-grid">
                {negocio.amenidades.map((am, i) => (
                  <span key={i} className="amenidad-chip">
                    {am}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Mini mapa si hay coordenadas */}
          {negocio.latitud && negocio.longitud && (
            <div className="negocio-seccion">
              <h2>Ubicación</h2>
              <iframe
                title={`Mapa ${negocio.nombre}`}
                width="100%"
                height="200"
                style={{ borderRadius: 8, border: "none", display: "block" }}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${negocio.longitud - 0.01},${negocio.latitud - 0.01},${negocio.longitud + 0.01},${negocio.latitud + 0.01}&layer=mapnik&marker=${negocio.latitud},${negocio.longitud}`}
              />
            </div>
          )}
        </div>

        {/* ── SIDEBAR ── */}
        <div className="negocio-detalle-sidebar">
          <div className="negocio-panel">
            {/* Precio destacado */}
            {precioFormateado && (
              <div className="negocio-panel-precio">
                <div className="negocio-panel-precio-label">Precio desde</div>
                <div className="negocio-panel-precio-valor">
                  {precioFormateado}
                  <span className="negocio-panel-precio-unidad">
                    /{unidadPrecio}
                  </span>
                </div>
              </div>
            )}

            {/* Datos del negocio */}
            <div className="negocio-panel-filas">
              {negocio.horario && (
                <div className="negocio-panel-fila">
                  <div className="negocio-panel-fila-icon">
                    <IconClock />
                  </div>
                  <div className="negocio-panel-fila-info">
                    <div className="negocio-panel-fila-label">Horario</div>
                    <div className="negocio-panel-fila-value">
                      {negocio.horario}
                    </div>
                  </div>
                </div>
              )}

              {negocio.telefono && (
                <div className="negocio-panel-fila">
                  <div className="negocio-panel-fila-icon">
                    <IconPhone />
                  </div>
                  <div className="negocio-panel-fila-info">
                    <div className="negocio-panel-fila-label">Teléfono</div>
                    <div className="negocio-panel-fila-value">
                      {negocio.telefono}
                    </div>
                  </div>
                </div>
              )}

              {negocio.direccion && (
                <div className="negocio-panel-fila">
                  <div className="negocio-panel-fila-icon">
                    <IconPin />
                  </div>
                  <div className="negocio-panel-fila-info">
                    <div className="negocio-panel-fila-label">Dirección</div>
                    <div className="negocio-panel-fila-value">
                      {negocio.direccion}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Botones de contacto */}
            {(negocio.whatsapp || negocio.telefono) && (
              <div className="negocio-contacto-btns">
                {negocio.whatsapp && (
                  <a
                    href={`https://wa.me/${negocio.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-whatsapp"
                  >
                    <IconWhatsApp /> Contactar por WhatsApp
                  </a>
                )}
                {negocio.telefono && (
                  <a href={`tel:${negocio.telefono}`} className="btn-llamar">
                    <IconPhone /> Llamar
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
