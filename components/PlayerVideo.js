// components/PlayerVideo.js
// ─────────────────────────────────────────────────────
// Reproductor de YouTube embed
//
// USO:
//   <PlayerVideo video={videoObj} />
//
// Parámetros del embed de YouTube que usamos:
//   autoplay=1        → Inicia automáticamente
//   modestbranding=1  → Oculta logo de YouTube
//   rel=0             → No muestra videos relacionados de otros canales
//   showinfo=0        → Oculta título (deprecated pero útil en algunos)
//   color=white       → Color de la barra de progreso
// ─────────────────────────────────────────────────────

const CAT_LABEL = {
  paisajes: "Paisajes",
  cultura: "Cultura",
  gastronomia: "Gastronomía",
  festividades: "Festividades",
  turismo: "Turismo",
  general: "General",
};

const IconYouTube = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
    <polygon points="9.75,15.02 15.5,12 9.75,8.98 9.75,15.02" fill="white" />
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
    style={{ width: 12, height: 12 }}
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12,6 12,12 16,14" />
  </svg>
);

export default function PlayerVideo({ video }) {
  if (!video) return null;

  // ── URL DEL EMBED ──
  // Parámetros explicados arriba
  const embedUrl = [
    `https://www.youtube.com/embed/${video.youtube_id}`,
    "?autoplay=1", // Inicia automáticamente al abrir
    "&modestbranding=1", // Oculta el logo grande de YouTube
    "&rel=0", // No muestra videos de otros canales al terminar
    "&color=white", // Barra de progreso blanca
    "&playsinline=1", // En iOS, no abre pantalla completa automáticamente
  ].join("");

  // URL para ver en YouTube directamente
  const youtubeUrl = `https://www.youtube.com/watch?v=${video.youtube_id}`;

  return (
    <div className="video-player-principal">
      {/* ── IFRAME DEL VIDEO ── */}
      <div className="video-player-ratio">
        <iframe
          src={embedUrl}
          title={video.titulo}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>

      {/* ── INFO DEBAJO DEL REPRODUCTOR ── */}
      <div className="video-player-info">
        <h2 className="video-player-titulo">{video.titulo}</h2>

        {video.descripcion && (
          <p className="video-player-desc">{video.descripcion}</p>
        )}

        {/* Metadata + link a YouTube */}
        <div className="video-player-meta">
          {/* Categoría */}
          <span>🎬 {CAT_LABEL[video.categoria] || video.categoria}</span>

          {/* Duración */}
          {video.duracion && (
            <span>
              <IconClock /> {video.duracion}
            </span>
          )}

          {/* Link a YouTube */}
          <a
            href={youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ver-youtube"
          >
            <IconYouTube />
            Ver en YouTube
          </a>
        </div>
      </div>
    </div>
  );
}
