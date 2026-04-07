// components/BadgeEstado.js
// Badge visual para el estado de una publicación
// Usado en "Mis publicaciones" y en el panel de moderación

export default function BadgeEstado({ estado }) {
  const config = {
    pendiente: {
      label: "⏳ Pendiente",
      bg: "rgba(245,197,66,0.12)",
      color: "#f5c542",
      border: "rgba(245,197,66,0.3)",
    },
    aprobado: {
      label: "✅ Aprobado",
      bg: "rgba(74,255,138,0.08)",
      color: "#4aff8a",
      border: "rgba(74,255,138,0.25)",
    },
    rechazado: {
      label: "❌ Rechazado",
      bg: "rgba(255,74,74,0.08)",
      color: "#ff6b6b",
      border: "rgba(255,74,74,0.25)",
    },
  }[estado] || { label: estado, bg: "#111", color: "#666", border: "#222" };

  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 11,
        fontFamily: "var(--font-display)",
        fontWeight: 500,
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        whiteSpace: "nowrap",
      }}
    >
      {config.label}
    </span>
  );
}
