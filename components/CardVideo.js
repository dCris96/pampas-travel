// components/CardVideo.js
// ─────────────────────────────────────────────────────
// Card de video con thumbnail de YouTube
//
// YouTube genera thumbnails automáticamente en:
// https://img.youtube.com/vi/{youtube_id}/hqdefault.jpg
// (Alta calidad: hqdefault, maxresdefault, mqdefault, default)
//
// Props:
//   video    → objeto de la tabla videos
//   activo   → boolean, si este video está reproduciéndose
//   onClick  → callback al hacer click
// ─────────────────────────────────────────────────────

// ── MAPA DE ETIQUETAS POR CATEGORÍA ──
const CAT_LABEL = {
  paisajes: "Paisajes",
  cultura: "Cultura",
  gastronomia: "Gastronomía",
  festividades: "Festividades",
  turismo: "Turismo",
  general: "General",
};

// ── ÍCONO PLAY ──
const IconPlay = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5,3 19,12 5,21" />
  </svg>
);

export default function CardVideo({ video, activo = false, onClick }) {
  // YouTube provee thumbnails gratis en varios tamaños:
  // hqdefault    → 480x360 (siempre disponible)
  // maxresdefault → 1280x720 (no siempre disponible)
  // mqdefault    → 320x180
  const thumbnailUrl = `https://img.youtube.com/vi/${video.youtube_id}/hqdefault.jpg`;

  return (
    <div
      className={`card-video ${activo ? "activo" : ""}`}
      onClick={() => onClick(video)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick(video)}
      aria-label={`Reproducir: ${video.titulo}`}
    >
      {/* ── THUMBNAIL ── */}
      <div className="card-video-thumb">
        <img
          src={thumbnailUrl}
          alt={`Thumbnail de ${video.titulo}`}
          loading="lazy"
          /* Si la imagen de YouTube no carga, muestra fondo negro */
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />

        {/* Badge de categoría */}
        <span className="card-video-cat">
          {CAT_LABEL[video.categoria] || video.categoria}
        </span>

        {/* Duración */}
        {video.duracion && (
          <span className="card-video-duracion">{video.duracion}</span>
        )}

        {/* Botón play o indicador de reproducción */}
        {activo ? (
          <div className="card-video-playing">
            <div className="playing-bars">
              <div className="playing-bar" />
              <div className="playing-bar" />
              <div className="playing-bar" />
            </div>
            Reproduciendo
          </div>
        ) : (
          <div className="card-video-play">
            <IconPlay />
          </div>
        )}
      </div>

      {/* ── CUERPO ── */}
      <div className="card-video-body">
        <h3 className="card-video-titulo">{video.titulo}</h3>
        {video.descripcion && (
          <p className="card-video-desc">{video.descripcion}</p>
        )}
      </div>
    </div>
  );
}
