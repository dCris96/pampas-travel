// components/CardNegocio.js
// ─────────────────────────────────────────────────────
// Componente reutilizable para cards de negocios
//
// Props:
//   negocio   → objeto de la tabla negocios
//   variante  → 'normal' | 'horizontal'
//
// Usado en:
//   /negocios      → variante normal (2 cols)
//   /hoteles       → variante horizontal (1 col)
//   /restaurantes  → variante horizontal (1 col)
// ─────────────────────────────────────────────────────

import Link from "next/link";

// ── ESTILOS POR TIPO DE NEGOCIO ──
// 🔧 PERSONALIZABLE: Ajusta colores y emojis
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

// ── HELPER: Formatear precio ──
function formatearPrecio(precio, moneda) {
  if (!precio) return null;
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: moneda || "MXN",
    minimumFractionDigits: 0,
  }).format(precio);
}

export default function CardNegocio({ negocio, variante = "normal" }) {
  const config = TIPO_CONFIG[negocio.tipo] || TIPO_CONFIG.servicio;
  const precioFormateado = formatearPrecio(
    negocio.precio_desde,
    negocio.precio_moneda,
  );

  // ── VARIANTE HORIZONTAL ──
  if (variante === "horizontal") {
    return (
      <Link href={`/negocios/${negocio.id}`} className="card-negocio-h">
        {/* Imagen lateral */}
        <div className="card-negocio-h-img-wrapper">
          <img
            src={
              negocio.imagen_url ||
              "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&q=70"
            }
            alt={negocio.nombre}
            className="card-negocio-h-img"
            loading="lazy"
          />
          {/* Badge tipo */}
          <span
            className="card-negocio-tipo-badge"
            style={{ backgroundColor: config.bg, color: config.color }}
          >
            {config.label}
          </span>
          {negocio.destacado && <span className="card-negocio-star">★</span>}
        </div>

        {/* Cuerpo derecho */}
        <div className="card-negocio-h-body">
          <div className="card-negocio-h-top">
            <h3 className="card-negocio-h-nombre">{negocio.nombre}</h3>
            <p className="card-negocio-h-desc">{negocio.descripcion}</p>

            {/* Meta: dirección y horario */}
            <div className="card-negocio-h-meta">
              {negocio.direccion && (
                <span className="card-negocio-h-meta-item">
                  <IconPin /> {negocio.direccion}
                </span>
              )}
              {negocio.horario && (
                <span className="card-negocio-h-meta-item">
                  <IconClock /> {negocio.horario}
                </span>
              )}
            </div>
          </div>

          {/* Footer: precio + amenidades */}
          <div className="card-negocio-h-footer">
            {precioFormateado ? (
              <div className="card-negocio-precio">
                Desde {precioFormateado}
                <span>/{negocio.tipo === "hotel" ? "noche" : "persona"}</span>
              </div>
            ) : (
              <div className="card-negocio-precio sin-precio">
                Consultar precio
              </div>
            )}

            {/* Máximo 4 amenidades */}
            {negocio.amenidades && negocio.amenidades.length > 0 && (
              <div className="card-negocio-amenidades">
                {negocio.amenidades.slice(0, 4).map((am, i) => (
                  <span key={i} className="amenidad-tag">
                    {am}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  }

  // ── VARIANTE NORMAL (default) ──
  return (
    <Link href={`/negocios/${negocio.id}`} className="card-negocio">
      {/* Imagen */}
      <div className="card-negocio-img-wrapper">
        <img
          src={
            negocio.imagen_url ||
            "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&q=70"
          }
          alt={negocio.nombre}
          className="card-negocio-img"
          loading="lazy"
        />
        <span
          className="card-negocio-tipo-badge"
          style={{ backgroundColor: config.bg, color: config.color }}
        >
          {config.label}
        </span>
        {negocio.destacado && <span className="card-negocio-star">★</span>}
      </div>

      {/* Cuerpo */}
      <div className="card-negocio-body">
        <h3 className="card-negocio-nombre">{negocio.nombre}</h3>
        <p className="card-negocio-desc">{negocio.descripcion}</p>

        {/* Precio */}
        {precioFormateado ? (
          <div className="card-negocio-precio">
            Desde {precioFormateado}
            <span>/{negocio.tipo === "hotel" ? "noche" : "persona"}</span>
          </div>
        ) : (
          <div className="card-negocio-precio sin-precio">Consultar precio</div>
        )}

        {/* Amenidades — máximo 4 chips */}
        {negocio.amenidades && negocio.amenidades.length > 0 && (
          <div className="card-negocio-amenidades">
            {negocio.amenidades.slice(0, 4).map((am, i) => (
              <span key={i} className="amenidad-tag">
                {am}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
