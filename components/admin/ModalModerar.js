// components/admin/ModalModerar.js
// ─────────────────────────────────────────────────────
// Modal de solo lectura para revisar el contenido
// completo de un ítem antes de aprobar o rechazar.
//
// Props:
//   item    → objeto completo del ítem
//   tipo    → objeto del array TIPOS (id, label, emoji, campoNombre)
//   onClose → función para cerrar
// ─────────────────────────────────────────────────────

import BadgeEstado from "@/components/BadgeEstado";
import "@/styles/formulario-exp.css"; // reutilizamos .modal-overlay y .modal-card

const IconX = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: 15, height: 15 }}
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// Muestra un campo si tiene valor
function Campo({ label, valor }) {
  if (!valor && valor !== 0) return null;
  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          fontSize: 10,
          fontFamily: "var(--font-display)",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "#555",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 13, color: "#ccc", lineHeight: 1.6 }}>
        {valor}
      </div>
    </div>
  );
}

export default function ModalModerar({ item, tipo, onClose }) {
  if (!item || !tipo) return null;

  // Nombre principal del ítem según el tipo
  const nombre =
    item[tipo.campoNombre] ?? item.titulo ?? item.nombre ?? "(sin título)";

  // Detecta si tiene imagen
  const imagen = item.imagen_url ?? item.foto_url ?? null;

  // Autor
  const autor = item.perfil?.nombre ?? "Usuario desconocido";
  const avatar = item.perfil?.avatar_url ?? null;

  // Fecha formateada
  const fecha = item.created_at
    ? new Date(item.created_at).toLocaleString("es-MX", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="modal-card"
        style={{ maxWidth: 560, maxHeight: "90vh", overflowY: "auto" }}
      >
        {/* ── HEADER ── */}
        <div className="modal-header">
          <span className="modal-titulo">
            {tipo.emoji} Revisar {tipo.label.slice(0, -1)}
          </span>
          <button
            className="btn-cerrar-modal"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <IconX />
          </button>
        </div>

        {/* ── IMAGEN ── */}
        {imagen && (
          <img
            src={imagen}
            alt={nombre}
            style={{
              width: "100%",
              maxHeight: 260,
              objectFit: "cover",
              display: "block",
              backgroundColor: "#0a0a0a",
            }}
          />
        )}

        {/* ── CUERPO ── */}
        <div style={{ padding: "20px 22px" }}>
          {/* Autor + fecha + estado */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 18,
              paddingBottom: 14,
              borderBottom: "1px solid #1f1f1f",
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: avatar ? "transparent" : "#1a2240",
                overflow: "hidden",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 15,
                fontWeight: 700,
                color: "white",
                fontFamily: "var(--font-display)",
              }}
            >
              {avatar ? (
                <img
                  src={avatar}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                autor[0]?.toUpperCase()
              )}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                  color: "#fff",
                }}
              >
                {autor}
              </div>
              <div style={{ fontSize: 11, color: "#555" }}>{fecha}</div>
            </div>

            <BadgeEstado estado={item.estado} />
          </div>

          {/* Nombre / Título */}
          <Campo label="Título / Nombre" valor={nombre} />

          {/* Descripción o contenido */}
          <Campo
            label="Descripción / Contenido"
            valor={item.descripcion ?? item.contenido}
          />

          {/* Campos específicos según tipo */}
          <Campo label="Categoría" valor={item.categoria} />
          <Campo label="Dirección" valor={item.direccion} />
          <Campo label="Precio" valor={item.precio} />
          <Campo label="Teléfono" valor={item.telefono} />
          <Campo label="WhatsApp" valor={item.whatsapp} />
          <Campo label="Horario" valor={item.horario} />

          {/* Amenidades (array) */}
          {Array.isArray(item.amenidades) && item.amenidades.length > 0 && (
            <Campo label="Amenidades" valor={item.amenidades.join(", ")} />
          )}

          {/* Coordenadas */}
          {item.latitud && item.longitud && (
            <Campo
              label="Coordenadas"
              valor={`${item.latitud}, ${item.longitud}`}
            />
          )}

          {/* Nota de rechazo si existe */}
          {item.nota_rechazo && (
            <div
              style={{
                marginTop: 16,
                padding: "10px 14px",
                background: "rgba(255,74,74,0.08)",
                border: "1px solid rgba(255,74,74,0.25)",
                borderRadius: 8,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  color: "#ff6b6b",
                  marginBottom: 4,
                }}
              >
                Motivo de rechazo
              </div>
              <div style={{ fontSize: 13, color: "#ff9a9a" }}>
                {item.nota_rechazo}
              </div>
            </div>
          )}
        </div>

        {/* ── FOOTER ── */}
        <div className="modal-footer">
          <button className="btn-cancelar" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
