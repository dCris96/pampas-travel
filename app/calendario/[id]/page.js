// app/calendario/[id]/page.js
// ─────────────────────────────────────────────────────
// DETALLE DE FESTIVIDAD
// Diseño editorial: texto + fotos intercaladas + audios
// ─────────────────────────────────────────────────────

"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import "@/styles/festividad-detalle.css";

// ── ÍCONOS ──
const IconArrowLeft = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12,19 5,12 12,5" />
  </svg>
);

const IconPlay = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5,3 19,12 5,21" />
  </svg>
);

const IconPausa = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="4" width="4" height="16" />
    <rect x="14" y="4" width="4" height="16" />
  </svg>
);

// ── HELPER: Formatear segundos → mm:ss ──
function formatTiempo(seg) {
  if (!seg || isNaN(seg)) return "0:00";
  const m = Math.floor(seg / 60);
  const s = Math.floor(seg % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ── HELPER: Formatear fecha ──
function formatFechaLarga(fechaStr, fechaFinStr) {
  const opciones = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const f = new Date(fechaStr + "T12:00:00").toLocaleDateString(
    "es-MX",
    opciones,
  );
  if (!fechaFinStr) return f;
  const ff = new Date(fechaFinStr + "T12:00:00").toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
  });
  return `${f} al ${ff}`;
}

// ── COMPONENTE: Reproductor de audio individual ──
function AudioItem({ audio, estaReproduciendo, onPlay }) {
  const audioRef = useRef(null);
  const [progreso, setProgreso] = useState(0);
  const [duracion, setDuracion] = useState(0);
  const [tiempo, setTiempo] = useState(0);

  // Cuando cambia estaReproduciendo desde el padre
  useEffect(() => {
    if (!audioRef.current) return;
    if (estaReproduciendo) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [estaReproduciendo]);

  function handleTimeUpdate() {
    if (!audioRef.current) return;
    const dur = audioRef.current.duration || 0;
    const cur = audioRef.current.currentTime || 0;
    setProgreso(dur > 0 ? (cur / dur) * 100 : 0);
    setTiempo(cur);
    setDuracion(dur);
  }

  function handleClickBarra(e) {
    if (!audioRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = pct * audioRef.current.duration;
  }

  function handleEnded() {
    setProgreso(0);
    setTiempo(0);
    // Notifica al padre que terminó (para limpiar el estado)
    onPlay(null);
  }

  return (
    <div className={`audio-item ${estaReproduciendo ? "reproduciendo" : ""}`}>
      {/* Elemento audio HTML (oculto) */}
      <audio
        ref={audioRef}
        src={audio.audio_url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onEnded={handleEnded}
        preload="metadata"
      />

      {/* Botón play/pausa */}
      <button
        className="audio-btn-play"
        onClick={() => onPlay(estaReproduciendo ? null : audio.id)}
        aria-label={estaReproduciendo ? "Pausar" : "Reproducir"}
      >
        {estaReproduciendo ? (
          /* Ícono de pausa */
          <IconPausa />
        ) : (
          /* Ícono de play */
          <IconPlay />
        )}
      </button>

      {/* Info */}
      <div className="audio-info">
        <span className="audio-titulo">{audio.titulo}</span>
        {audio.descripcion && (
          <span className="audio-descripcion">{audio.descripcion}</span>
        )}

        {/* Barra de progreso — solo cuando reproduce */}
        {estaReproduciendo && (
          <div className="audio-progreso-wrapper">
            <span className="audio-tiempo">{formatTiempo(tiempo)}</span>
            <div
              className="audio-barra-fondo"
              onClick={handleClickBarra}
              role="slider"
              aria-valuenow={progreso}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="audio-barra-progreso"
                style={{ width: `${progreso}%` }}
              />
            </div>
            <span className="audio-tiempo" style={{ textAlign: "right" }}>
              {formatTiempo(duracion)}
            </span>
          </div>
        )}
      </div>

      {/* Duración (cuando no reproduce) */}
      {!estaReproduciendo && audio.duracion && (
        <span className="audio-duracion">{audio.duracion}</span>
      )}

      {/* Ondas animadas (cuando reproduce, en lugar de la duración) */}
      {estaReproduciendo && (
        <div className="audio-ondas">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="audio-onda-barra" />
          ))}
        </div>
      )}
    </div>
  );
}

// ── PÁGINA PRINCIPAL ──
export default function FestividadDetallePage() {
  const { id } = useParams();

  const supabase = createClient();

  const [fest, setFest] = useState(null);
  const [audios, setAudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // ID del audio que está reproduciéndose (null = ninguno)
  const [audioActivo, setAudioActivo] = useState(null);

  // ── CARGAR FESTIVIDAD + AUDIOS ──
  // 🔧 Conecta con: tablas festividades + festividad_audios
  useEffect(() => {
    async function cargar() {
      try {
        // Festividad
        const { data: festData, error: festErr } = await supabase
          .from("festividades")
          .select("*")
          .eq("id", id)
          .eq("activo", true)
          .single();

        if (festErr || !festData) {
          setError("Festividad no encontrada.");
          return;
        }

        setFest(festData);

        // Audios vinculados
        const { data: audData } = await supabase
          .from("festividad_audios")
          .select("*")
          .eq("festividad_id", id)
          .order("orden", { ascending: true });

        setAudios(audData || []);
      } catch (err) {
        console.error(err);
        setError("Error al cargar la festividad.");
      } finally {
        setLoading(false);
      }
    }
    if (id) cargar();
  }, [id]);

  // ── MANEJAR PLAY DE AUDIOS ──
  // Solo un audio puede reproducirse a la vez
  const handlePlay = useCallback((audioId) => {
    setAudioActivo(audioId);
  }, []);

  // ── ESTADOS DE CARGA / ERROR ──
  if (loading) {
    return (
      <div className="festividad-root">
        <Link href="/calendario" className="fest-volver">
          <IconArrowLeft /> Calendario
        </Link>
        <div
          style={{
            height: "clamp(280px, 45vw, 480px)",
            borderRadius: 14,
            background: "linear-gradient(90deg,#111 25%,#1a1a1a 50%,#111 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s infinite",
            marginBottom: 40,
          }}
        />
        <div
          style={{
            maxWidth: 840,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {[100, 80, 90, 70, 85].map((w, i) => (
            <div
              key={i}
              style={{
                height: 16,
                borderRadius: 6,
                width: `${w}%`,
                background:
                  "linear-gradient(90deg,#111 25%,#1a1a1a 50%,#111 75%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.5s infinite",
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (error || !fest) {
    return (
      <div className="festividad-root">
        <Link href="/calendario" className="fest-volver">
          <IconArrowLeft /> Calendario
        </Link>
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <p
            style={{
              fontFamily: "Crimson Text,Georgia,serif",
              fontSize: 20,
              fontStyle: "italic",
              color: "#666",
            }}
          >
            {error || "Festividad no encontrada."}
          </p>
          <Link
            href="/calendario"
            style={{
              color: "var(--cal-gold)",
              fontFamily: "Crimson Text,Georgia,serif",
              fontSize: 16,
              marginTop: 16,
              display: "block",
              textDecoration: "none",
            }}
          >
            ← Volver al calendario
          </Link>
        </div>
      </div>
    );
  }

  // Color de acento de esta festividad (con fallback)
  const acento = fest.color_acento || "#c8952a";

  return (
    <div
      className="festividad-root"
      style={{ "--acento": acento, "--acento-dim": acento + "99" }}
    >
      {/* ── BOTÓN VOLVER ── */}
      <Link href="/calendario" className="fest-volver">
        <IconArrowLeft />
        Calendario de Festividades
      </Link>

      {/* ── HERO CON IMAGEN ── */}
      <div className="fest-hero">
        {fest.imagen_hero ? (
          <img
            src={fest.imagen_hero}
            alt={fest.titulo}
            className="fest-hero-img"
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              background: `linear-gradient(135deg, ${acento}22, #0c090600)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 64,
            }}
          >
            🎊
          </div>
        )}
        <div className="fest-hero-overlay" />

        <div className="fest-hero-content">
          {/* Badge de fecha */}
          <div className="fest-fecha-badge">
            📅 {formatFechaLarga(fest.fecha, fest.fecha_fin)}
          </div>

          {/* Título y subtítulo */}
          <h1 className="fest-titulo">{fest.titulo}</h1>
          {fest.subtitulo && <p className="fest-subtitulo">{fest.subtitulo}</p>}
        </div>
      </div>

      {/* ── DIVIDER ── */}
      <div className="fest-divider">
        <div className="fest-divider-line" />
        <span className="fest-divider-symbol">✦</span>
        <div className="fest-divider-line" />
      </div>

      {/* ── CONTENIDO EDITORIAL ── */}
      <div className="fest-contenido">
        {/* ── PRIMER BLOQUE DE TEXTO ── */}
        {/* Con letra capital (drop cap) */}
        {fest.descripcion && (
          <div className="fest-texto-bloque primero">
            <p>{fest.descripcion}</p>
          </div>
        )}

        {/* ── SEGUNDA SECCIÓN: TEXTO + IMAGEN AL COSTADO ── */}
        {/* La foto lateral aparece mientras lees el segundo bloque */}
        {fest.descripcion_2 && (
          <div
            className={`fest-layout-con-imagen ${
              /* Alterna el lado de la foto */
              fest.imagen_medio ? "" : ""
            }`}
          >
            {/* Texto */}
            <div className="fest-texto-bloque">
              <p>{fest.descripcion_2}</p>
            </div>

            {/* Foto lateral */}
            {fest.imagen_medio && (
              <div className="fest-foto-lateral">
                <div className="fest-foto-marco">
                  <img
                    src={fest.imagen_medio}
                    alt={`${fest.titulo} — imagen`}
                    className="fest-foto-lateral-img"
                    loading="lazy"
                  />
                </div>
                <p className="fest-foto-caption">
                  {fest.subtitulo || fest.titulo}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── DIVIDER ── */}
        {audios.length > 0 && (
          <div className="fest-divider">
            <div className="fest-divider-line" />
            <span className="fest-divider-symbol">♪</span>
            <div className="fest-divider-line" />
          </div>
        )}

        {/* ── SECCIÓN DE AUDIOS ── */}
        {audios.length > 0 && (
          <div className="fest-audios-seccion">
            <div className="fest-audios-titulo">Música de la Festividad</div>
            <p className="fest-audios-subtitulo">
              Sonidos y cantos que acompañan la celebración desde tiempos
              inmemoriales.
            </p>

            <div className="fest-audios-lista">
              {audios.map((audio) => (
                <AudioItem
                  key={audio.id}
                  audio={audio}
                  estaReproduciendo={audioActivo === audio.id}
                  onPlay={handlePlay}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── TERCER BLOQUE DE TEXTO ── */}
        {fest.descripcion_3 && (
          <>
            <div className="fest-divider">
              <div className="fest-divider-line" />
              <span className="fest-divider-symbol">✦</span>
              <div className="fest-divider-line" />
            </div>
            <div className="fest-texto-bloque">
              <p>{fest.descripcion_3}</p>
            </div>
          </>
        )}

        {/* ── FOTO FINAL (ancho completo) ── */}
        {fest.imagen_final && (
          <div className="fest-foto-final-wrapper">
            <img
              src={fest.imagen_final}
              alt={`${fest.titulo} — vista final`}
              className="fest-foto-final"
              loading="lazy"
            />
          </div>
        )}

        {/* ── COLOFÓN ── */}
        <div className="fest-divider">
          <div className="fest-divider-line" />
          <span className="fest-divider-symbol">✦</span>
          <div className="fest-divider-line" />
        </div>

        <div className="fest-colofonFinal">
          <p>
            Una festividad del <strong>Valle de los Vientos</strong> — celebrada
            con devoción, memoria y alegría colectiva.
          </p>
        </div>
      </div>
    </div>
  );
}
