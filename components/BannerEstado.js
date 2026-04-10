// components/BannerEstado.js
// ─────────────────────────────────────────────────────
// Banner que muestra el estado de una publicación
// al propio autor (pendiente, rechazado)
//
// Props:
//   estado        → 'pendiente' | 'rechazado' | 'aprobado'
//   razonRechazo  → string (solo si estado === 'rechazado')
//   tipo          → 'experiencia' | 'negocio' | 'producto'
// ─────────────────────────────────────────────────────

export default function BannerEstado({
  estado,
  razonRechazo,
  tipo = "publicación",
}) {
  // No mostrar nada si está aprobado
  if (estado === "aprobado") return null;

  const estilos = {
    pendiente: {
      bg: "rgba(245,197,66,0.08)",
      border: "rgba(245,197,66,0.25)",
      color: "#c8a020",
      icono: "⏳",
      titulo: "Pendiente de revisión",
      texto: `Tu ${tipo} está esperando ser revisada por un administrador. Solo tú puedes verla por ahora.`,
    },
    rechazado: {
      bg: "rgba(255,74,74,0.08)",
      border: "rgba(255,74,74,0.25)",
      color: "#cc4444",
      icono: "❌",
      titulo: "No aprobada",
      texto:
        razonRechazo ||
        `Tu ${tipo} no fue aprobada. Puedes editarla y volver a publicarla.`,
    },
  };

  const estilo = estilos[estado];
  if (!estilo) return null;

  return (
    <div
      style={{
        background: estilo.bg,
        border: `1px solid ${estilo.border}`,
        borderRadius: 8,
        padding: "10px 14px",
        marginBottom: 12,
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
      }}
    >
      <span style={{ fontSize: 16, flexShrink: 0 }}>{estilo.icono}</span>
      <div>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 12,
            fontWeight: 600,
            color: estilo.color,
            marginBottom: 3,
          }}
        >
          {estilo.titulo}
        </div>
        <div
          style={{
            fontSize: 12,
            color: "#666",
            lineHeight: 1.5,
          }}
        >
          {estilo.texto}
        </div>
      </div>
    </div>
  );
}
