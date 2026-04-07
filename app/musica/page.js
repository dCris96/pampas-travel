// app/musica/page.js
// ─────────────────────────────────────────────────────
// PÁGINA: Música del Distrito — Ruta: /musica
//
// Funcionalidades:
//   ✓ Reproductor sticky con cover grande
//   ✓ Embed de SoundCloud o YouTube según tipo_fuente
//   ✓ Lista de todos los tracks con info y badges
//   ✓ Grid de destacados con cover
//   ✓ Barras animadas en el track activo
//
// 🔧 Conecta con: tabla public.musica
// ─────────────────────────────────────────────────────

"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import CardMusica from "@/components/CardMusica";
import "@/styles/musica.css";

export default function MusicaPage() {
  // ── ESTADO ──
  const [tracks, setTracks] = useState([]);
  const [trackActivo, setTrackActivo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ── CARGAR MÚSICA ──
  // 🔧 Conecta con: tabla public.musica
  useEffect(() => {
    async function cargar() {
      try {
        const { data, error } = await supabase
          .from("musica")
          .select("*")
          .eq("activo", true)
          .order("destacado", { ascending: false })
          .order("created_at", { ascending: false });

        if (error) throw error;
        setTracks(data || []);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar la música.");
      } finally {
        setLoading(false);
      }
    }
    cargar();
  }, []);

  // ── SELECCIONAR TRACK ──
  function handleTrackClick(track) {
    // Toggle: click en el activo lo deselecciona
    setTrackActivo((prev) => (prev?.id === track.id ? null : track));
  }

  // ── EMBED URL SEGÚN FUENTE ──
  // Genera la URL de embed correcta según el tipo de fuente
  function getEmbedUrl(track) {
    switch (track.tipo_fuente) {
      case "soundcloud":
        // SoundCloud: usa su propia embed_url con parámetros
        return track.embed_url;

      case "youtube":
        // YouTube: construimos la URL con el youtube_id
        if (!track.youtube_id) return null;
        return `https://www.youtube.com/embed/${track.youtube_id}?autoplay=1&modestbranding=1&rel=0`;

      case "spotify":
        // Spotify: embed_url viene directamente de Spotify
        // Formato: https://open.spotify.com/embed/track/ID
        return track.embed_url;

      case "archivo":
        // Archivo en Storage: no usamos iframe, usamos <audio>
        return track.archivo_url;

      default:
        return null;
    }
  }

  // ── ALTURA DEL EMBED SEGÚN FUENTE ──
  function getEmbedHeight(tipo) {
    switch (tipo) {
      case "soundcloud":
        return 130; // SoundCloud compact
      case "spotify":
        return 80; // Spotify mini player
      case "youtube":
        return 200; // YouTube embed
      default:
        return 100;
    }
  }

  // Tracks destacados para el grid superior
  const trackDestacados = tracks.filter((t) => t.destacado);

  return (
    <div>
      {/* ── HEADER ── */}
      <div className="musica-header">
        <h1>Música</h1>
        <p>Sonidos tradicionales y modernos del Valle de los Vientos.</p>
      </div>

      {/* ── LAYOUT: REPRODUCTOR + LISTA ── */}
      <div className="musica-layout">
        {/* ─────────────────────────
            PANEL REPRODUCTOR
        ───────────────────────── */}
        <div className="musica-player-panel">
          {trackActivo ? (
            <>
              {/* Cover del track */}
              {trackActivo.cover_url ? (
                <img
                  src={trackActivo.cover_url}
                  alt={`Cover de ${trackActivo.titulo}`}
                  className="musica-player-cover"
                />
              ) : (
                <div className="musica-player-cover-placeholder">🎵</div>
              )}

              {/* Info del track */}
              <div className="musica-player-info">
                <div className="musica-player-titulo">{trackActivo.titulo}</div>
                <div className="musica-player-artista">
                  {trackActivo.artista}
                </div>
                {trackActivo.genero && (
                  <span className="musica-player-genero">
                    {trackActivo.genero}
                  </span>
                )}
              </div>

              {/* Embed del reproductor */}
              {getEmbedUrl(trackActivo) && (
                <div className="musica-embed-wrapper">
                  {trackActivo.tipo_fuente === "archivo" ? (
                    /*
                      Si es un archivo MP3 en Supabase Storage
                      usamos el elemento <audio> nativo del navegador
                      🔧 NOTA SOBRE AUDIO EN STORAGE:
                      Para música, archivos pequeños (3-5 MB por canción MP3 a 128kbps)
                      SÍ pueden almacenarse en Supabase Storage.
                      La restricción de NO subir aplica a VIDEO (500MB+), no a audio.
                    */
                    <audio
                      controls
                      autoPlay
                      style={{
                        width: "100%",
                        borderRadius: 8,
                        backgroundColor: "#111",
                      }}
                      src={trackActivo.archivo_url}
                    >
                      Tu navegador no soporta el elemento audio.
                    </audio>
                  ) : (
                    /* Embed de SoundCloud, Spotify o YouTube */
                    <iframe
                      src={getEmbedUrl(trackActivo)}
                      height={getEmbedHeight(trackActivo.tipo_fuente)}
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                      title={trackActivo.titulo}
                    />
                  )}
                </div>
              )}

              {/* Descripción */}
              {trackActivo.descripcion && (
                <div className="musica-player-desc">
                  {trackActivo.descripcion}
                </div>
              )}
            </>
          ) : (
            /* Estado: sin track seleccionado */
            <div className="musica-player-vacio">
              <div className="musica-player-vacio-icon">🎵</div>
              <p>
                Selecciona una canción
                <br />
                de la lista para escucharla
              </p>
            </div>
          )}
        </div>

        {/* ─────────────────────────
            LISTA DE TRACKS
        ───────────────────────── */}
        <div>
          {/* Grid de destacados */}
          {!loading && trackDestacados.length > 0 && (
            <div className="musica-destacados">
              <div className="musica-destacados-titulo">Destacados</div>
              <div className="musica-destacados-grid">
                {trackDestacados.map((track) => (
                  <div
                    key={track.id}
                    className="musica-destacado-item"
                    onClick={() => handleTrackClick(track)}
                    title={`${track.titulo} — ${track.artista}`}
                  >
                    {track.cover_url ? (
                      <img src={track.cover_url} alt={track.titulo} />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          background: "linear-gradient(135deg,#111,#1a1a2a)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 32,
                        }}
                      >
                        🎵
                      </div>
                    )}
                    <div className="musica-destacado-overlay">
                      <div className="musica-destacado-nombre">
                        {track.titulo}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Header de la lista completa */}
          <div className="musica-lista-header">
            <span className="musica-lista-titulo">Todos los tracks</span>
            {!loading && (
              <span className="musica-count">{tracks.length} canciones</span>
            )}
          </div>

          {/* Lista */}
          {loading ? (
            <div className="musica-lista">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 14,
                    padding: "14px 16px",
                    borderBottom: "1px solid #111",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 4,
                      background:
                        "linear-gradient(90deg,#111 25%,#1a1a1a 50%,#111 75%)",
                      backgroundSize: "200% 100%",
                      animation: "shimmer 1.5s infinite",
                    }}
                  />
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 6,
                      background:
                        "linear-gradient(90deg,#111 25%,#1a1a1a 50%,#111 75%)",
                      backgroundSize: "200% 100%",
                      animation: "shimmer 1.5s infinite",
                      flexShrink: 0,
                    }}
                  />
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    <div
                      style={{
                        height: 12,
                        width: "60%",
                        borderRadius: 4,
                        background:
                          "linear-gradient(90deg,#111 25%,#1a1a1a 50%,#111 75%)",
                        backgroundSize: "200% 100%",
                        animation: "shimmer 1.5s infinite",
                      }}
                    />
                    <div
                      style={{
                        height: 10,
                        width: "40%",
                        borderRadius: 4,
                        background:
                          "linear-gradient(90deg,#111 25%,#1a1a1a 50%,#111 75%)",
                        backgroundSize: "200% 100%",
                        animation: "shimmer 1.5s infinite",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div
              style={{
                textAlign: "center",
                padding: 40,
                color: "#555",
                fontFamily: "var(--font-display)",
                fontSize: 13,
              }}
            >
              ⚠️ {error}
            </div>
          ) : tracks.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: 60,
                color: "#444",
                fontFamily: "var(--font-display)",
                fontSize: 13,
              }}
            >
              🎵 No hay música disponible todavía.
            </div>
          ) : (
            <div className="musica-lista">
              {tracks.map((track, i) => (
                <CardMusica
                  key={track.id}
                  track={track}
                  index={i}
                  activo={trackActivo?.id === track.id}
                  onClick={handleTrackClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
