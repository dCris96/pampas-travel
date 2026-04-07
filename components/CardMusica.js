// components/CardMusica.js
// ─────────────────────────────────────────────────────
// Card de track musical en la lista
//
// Props:
//   track    → objeto de la tabla musica
//   index    → número de orden en la lista
//   activo   → boolean, si este track está activo
//   onClick  → callback al seleccionar
// ─────────────────────────────────────────────────────

// Ícono play simple
const IconPlay = () => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    style={{ width: 14, height: 14 }}
  >
    <polygon points="5,3 19,12 5,21" />
  </svg>
);

export default function CardMusica({ track, index, activo = false, onClick }) {
  return (
    <div
      className={`card-musica ${activo ? "activo" : ""}`}
      onClick={() => onClick(track)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick(track)}
      aria-label={`${activo ? "Reproduciendo" : "Reproducir"}: ${track.titulo} de ${track.artista}`}
    >
      {/* Número o ícono de reproducción */}
      <div className="card-musica-num">
        {activo ? (
          /* Barras animadas cuando está activo */
          <div className="card-musica-playing">
            <div className="bar" style={{ height: "40%" }} />
            <div className="bar" style={{ height: "80%" }} />
            <div className="bar" style={{ height: "60%" }} />
          </div>
        ) : (
          /* Número en hover muestra play */
          <span style={{ fontSize: 12, color: "#444" }}>{index + 1}</span>
        )}
      </div>

      {/* Cover miniatura */}
      {track.cover_url ? (
        <img
          src={track.cover_url}
          alt={`Cover de ${track.titulo}`}
          className="card-musica-cover"
          loading="lazy"
        />
      ) : (
        <div className="card-musica-cover-placeholder">🎵</div>
      )}

      {/* Info del track */}
      <div className="card-musica-info">
        <span className="card-musica-titulo">{track.titulo}</span>
        <span className="card-musica-artista">{track.artista}</span>
        {track.genero && (
          <span className="card-musica-genero">{track.genero}</span>
        )}
      </div>

      {/* Duración + fuente */}
      <div className="card-musica-meta">
        {track.duracion && (
          <span className="card-musica-duracion">{track.duracion}</span>
        )}
        <span className={`fuente-badge ${track.tipo_fuente}`}>
          {track.tipo_fuente}
        </span>
      </div>
    </div>
  );
}
