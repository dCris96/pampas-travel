// app/videos/page.js
// ─────────────────────────────────────────────────────
// PÁGINA: Galería de Videos — Ruta: /videos
//
// Funcionalidades:
//   ✓ Carga videos de Supabase
//   ✓ Filtros por categoría
//   ✓ Click en card → abre reproductor embed
//   ✓ Thumbnails automáticos de YouTube (gratis)
//   ✓ Aviso explicativo sobre hosting de video
//
// 🔧 Conecta con: tabla public.videos
// ─────────────────────────────────────────────────────
"use client";

import { useEffect, useState, useMemo } from "react";
import { getVideos } from "@/app/actions/videos";
import { useAuth } from "@/context/AuthContext";
import CardVideo from "@/components/CardVideo";
import PlayerVideo from "@/components/PlayerVideo";
import "@/styles/videos.css";

// ── CATEGORÍAS DISPONIBLES ──
const CATEGORIAS = [
  { valor: "todos", label: "Todos" },
  { valor: "paisajes", label: "Paisajes" },
  { valor: "cultura", label: "Cultura" },
  { valor: "gastronomia", label: "Gastronomía" },
  { valor: "festividades", label: "Festividades" },
  { valor: "turismo", label: "Turismo" },
];

// ── SKELETON ──
function SkeletonVideos() {
  return (
    <div className="videos-grid">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          style={{
            borderRadius: 12,
            overflow: "hidden",
            border: "1px solid #1f1f1f",
            backgroundColor: "#111",
          }}
        >
          {/* Ratio 16:9 */}
          <div
            style={{
              paddingBottom: "56.25%",
              position: "relative",
              background:
                "linear-gradient(90deg,#111 25%,#1a1a1a 50%,#111 75%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.5s infinite",
            }}
          />
          <div
            style={{
              padding: "12px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div
              className="skeleton-line medium"
              style={{
                height: 12,
                borderRadius: 4,
                background:
                  "linear-gradient(90deg,#111 25%,#1a1a1a 50%,#111 75%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.5s infinite",
              }}
            />
            <div
              className="skeleton-line short"
              style={{
                height: 10,
                width: "60%",
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
  );
}

export default function VideosPage() {
  const { isAdmin } = useAuth();

  // ── ESTADO ──
  const [videos, setVideos] = useState([]);
  const [videoActivo, setVideoActivo] = useState(null); // Objeto del video seleccionado
  const [categoria, setCategoria] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ── CARGAR VIDEOS ──
  // 🔧 Conecta con: tabla public.videos
  useEffect(() => {
    async function cargar() {
      try {
        const data = await getVideos();

        if (error) throw error;
        setVideos(data || []);

        // Autoseleccionar el primer video destacado
        const destacado = (data || []).find((v) => v.destacado);
        if (destacado) setVideoActivo(destacado);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los videos.");
      } finally {
        setLoading(false);
      }
    }
    cargar();
  }, []);

  // ── VIDEOS FILTRADOS ──
  const videosFiltrados = useMemo(() => {
    if (categoria === "todos") return videos;
    return videos.filter((v) => v.categoria === categoria);
  }, [videos, categoria]);

  // ── CLICK EN CARD ──
  function handleVideoClick(video) {
    setVideoActivo(video);
    // Scroll al reproductor
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div>
      {/* ── HEADER ── */}
      <div className="videos-header">
        <h1>Videos</h1>
        <p>Documentales, recorridos y momentos del Valle de los Vientos.</p>
      </div>

      {/* ── AVISO DE HOSTING (visible para admins) ── */}
      {/*
        🔧 Puedes quitar este aviso si no quieres mostrarlo a los usuarios.
        Es útil para que los admins entiendan por qué se usa YouTube.
      */}
      {isAdmin && (
        <div className="aviso-hosting">
          <div className="aviso-hosting-icon">💡</div>
          <div className="aviso-hosting-texto">
            <strong>¿Por qué YouTube y no subir videos directo?</strong>
            <br />
            Un video de 5 minutos en HD pesa entre 500MB y 1GB. El plan gratuito
            de Supabase Storage tiene solo 1GB en total. YouTube es gratis,
            tiene CDN global y genera thumbnails automáticamente. Para agregar
            un video: copia solo el ID de YouTube (en{" "}
            <code>
              youtu.be/<strong>ESTE_ID</strong>
            </code>
            ) y agrégalo en Supabase.
          </div>
        </div>
      )}

      {/* ── REPRODUCTOR PRINCIPAL ── */}
      {/* Solo se muestra cuando hay un video seleccionado */}
      {videoActivo && !loading && <PlayerVideo video={videoActivo} />}

      {/* ── FILTROS ── */}
      <div className="videos-filtros">
        {CATEGORIAS.map((cat) => (
          <button
            key={cat.valor}
            className={`video-filtro-btn ${categoria === cat.valor ? "activo" : ""}`}
            onClick={() => setCategoria(cat.valor)}
          >
            {cat.label}
          </button>
        ))}

        {!loading && (
          <span
            style={{
              marginLeft: "auto",
              fontSize: 12,
              color: "#555",
              fontFamily: "var(--font-display)",
            }}
          >
            {videosFiltrados.length}{" "}
            {videosFiltrados.length === 1 ? "video" : "videos"}
          </span>
        )}
      </div>

      {/* ── GRID DE VIDEOS ── */}
      {loading ? (
        <SkeletonVideos />
      ) : error ? (
        <div className="videos-empty">
          <div className="videos-empty-icon">⚠️</div>
          <h3>Error al cargar</h3>
          <p>{error}</p>
        </div>
      ) : videosFiltrados.length === 0 ? (
        <div className="videos-grid">
          <div className="videos-empty">
            <div className="videos-empty-icon">🎬</div>
            <h3>Sin videos en esta categoría</h3>
            <p>Pronto habrá más contenido disponible.</p>
          </div>
        </div>
      ) : (
        <div className="videos-grid">
          {videosFiltrados.map((video) => (
            <CardVideo
              key={video.id}
              video={video}
              activo={videoActivo?.id === video.id}
              onClick={handleVideoClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
