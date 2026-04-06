// components/CardLugar.js
// ─────────────────────────────────────────────────────
// COMPONENTE REUTILIZABLE: Card de lugar turístico
//
// Props:
//   lugar      → objeto completo de la tabla lugares
//   variante   → 'normal' | 'horizontal' | 'mini'
//
// Se usa en:
//   - /lugares        (listado, variante normal)
//   - /              (home destacados, variante normal)
//   - /mapa          (sidebar del mapa, variante mini)
// ─────────────────────────────────────────────────────

import Link from "next/link";

// ── MAPA DE COLORES POR CATEGORÍA ──
// 🔧 PERSONALIZABLE: Cambia colores según tu paleta
const CATEGORIA_STYLES = {
  naturaleza: { bg: "#1a3a26", color: "#6bffab", label: "Naturaleza" },
  patrimonio: { bg: "#3a2a1a", color: "#ffb86b", label: "Patrimonio" },
  mirador: { bg: "#1a2a5c", color: "#6babff", label: "Mirador" },
  aventura: { bg: "#3a1a1a", color: "#ff8a6b", label: "Aventura" },
  cultura: { bg: "#2a1a3a", color: "#c46bff", label: "Cultura" },
  gastronomia: { bg: "#3a2a10", color: "#ffd46b", label: "Gastronomía" },
};

// ── ÍCONO DE PIN (para variante mini) ──
const IconPin = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: 12, height: 12 }}
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export default function CardLugar({ lugar, variante = "normal" }) {
  // Estilo de la categoría, con fallback
  const catStyle =
    CATEGORIA_STYLES[lugar.categoria] || CATEGORIA_STYLES.naturaleza;

  // ── VARIANTE MINI (para sidebar del mapa) ──
  if (variante === "mini") {
    return (
      <Link href={`/lugares/${lugar.id}`} className="card-lugar-mini">
        <div
          className="card-lugar-mini-img"
          style={{
            backgroundImage: `url(${lugar.imagen_url || "/placeholder.jpg"})`,
          }}
        />
        <div className="card-lugar-mini-info">
          <span className="card-lugar-mini-titulo">{lugar.titulo}</span>
          <span className="card-lugar-mini-dir">
            <IconPin /> {lugar.direccion || "Sin dirección"}
          </span>
        </div>
      </Link>
    );
  }

  // ── VARIANTE HORIZONTAL ──
  if (variante === "horizontal") {
    return (
      <Link href={`/lugares/${lugar.id}`} className="card-lugar-h">
        <div className="card-lugar-h-img-wrapper">
          <img
            src={
              lugar.imagen_url ||
              "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=70"
            }
            alt={lugar.titulo}
            className="card-lugar-h-img"
          />
          {/* Badge de categoría */}
          <span
            className="card-badge-cat"
            style={{ backgroundColor: catStyle.bg, color: catStyle.color }}
          >
            {catStyle.label}
          </span>
        </div>
        <div className="card-lugar-h-body">
          <h3 className="card-lugar-h-titulo">{lugar.titulo}</h3>
          <p className="card-lugar-h-desc">{lugar.descripcion}</p>
          {lugar.direccion && (
            <span className="card-lugar-h-dir">
              <IconPin /> {lugar.direccion}
            </span>
          )}
        </div>
      </Link>
    );
  }

  // ── VARIANTE NORMAL (default) ──
  return (
    <Link href={`/lugares/${lugar.id}`} className="card-lugar">
      {/* ── IMAGEN CON BADGE ── */}
      <div className="card-lugar-img-wrapper">
        <img
          src={
            lugar.imagen_url ||
            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=70"
          }
          alt={lugar.titulo}
          className="card-lugar-img"
          loading="lazy"
        />

        {/* Overlay hover */}
        <div className="card-lugar-overlay" />

        {/* Badge categoría */}
        <span
          className="card-badge-cat"
          style={{ backgroundColor: catStyle.bg, color: catStyle.color }}
        >
          {catStyle.label}
        </span>

        {/* Estrella si es destacado */}
        {lugar.destacado && (
          <span className="card-lugar-star" title="Sitio destacado">
            ★
          </span>
        )}
      </div>

      {/* ── CUERPO DE TEXTO ── */}
      <div className="card-lugar-body">
        <h3 className="card-lugar-titulo">{lugar.titulo}</h3>
        <p className="card-lugar-desc">{lugar.descripcion}</p>

        {/* Dirección */}
        {lugar.direccion && (
          <div className="card-lugar-footer">
            <span className="card-lugar-dir">
              <IconPin /> {lugar.direccion}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
