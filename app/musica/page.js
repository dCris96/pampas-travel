// app/musica/page.js
// ─────────────────────────────────────────────────────
// PÁGINA: musica y Leyendas — Ruta: /musica
//
// Layout idéntico a /musica:
//   Panel izquierdo sticky → reproductor de audio + info
//   Panel derecho          → lista paginada de musica
//
// El reproductor tiene:
//   ✓ Play / Pausa real con elemento <audio> nativo
//   ✓ Barra de progreso clickeable
//   ✓ Control de volumen
//   ✓ Botones anterior / siguiente
//   ✓ Tiempo transcurrido / duración total
//   ✓ Barras animadas en la lista cuando reproduce
//
// 🔧 Conecta con: tabla public.musica
// ─────────────────────────────────────────────────────

"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { getMusica } from "@/app/actions/musica";
import "@/styles/mitos.css";
import Link from "next/link";

// ── Cuántos mitos por página ──
// 🔧 PERSONALIZABLE
const POR_PAGINA = 5;

// ─────────────────────────────────────────────────────
// ÍCONOS SVG
// ─────────────────────────────────────────────────────

const IconPlay = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <polygon points="6,3 20,12 6,21" />
  </svg>
);

const IconPause = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <rect x="5" y="3" width="4" height="18" rx="1" />
    <rect x="15" y="3" width="4" height="18" rx="1" />
  </svg>
);

const IconSkipBack = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="19,20 9,12 19,4" />
    <line x1="5" y1="19" x2="5" y2="5" />
  </svg>
);

const IconSkipForward = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="5,4 15,12 5,20" />
    <line x1="19" y1="4" x2="19" y2="20" />
  </svg>
);

const IconVolumen = ({ muted }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {muted ? (
      <>
        <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" />
        <line x1="23" y1="9" x2="17" y2="15" />
        <line x1="17" y1="9" x2="23" y2="15" />
      </>
    ) : (
      <>
        <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      </>
    )}
  </svg>
);

const IconPin = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: 10, height: 10 }}
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

// ─────────────────────────────────────────────────────
// HELPER: formatear segundos → mm:ss
// ─────────────────────────────────────────────────────
function formatTiempo(segundos) {
  if (isNaN(segundos) || segundos < 0) return "0:00";
  const m = Math.floor(segundos / 60);
  const s = Math.floor(segundos % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ─────────────────────────────────────────────────────
// COMPONENTE: Reproductor de audio nativo
// Recibe el musica activa y el índice para prev/next
// ─────────────────────────────────────────────────────
function ReproductorAudio({
  musica,
  onAnterior,
  onSiguiente,
  hayAnterior,
  haySiguiente,
}) {
  const audioRef = useRef(null);
  const playPromiseRef = useRef(null);
  const isMountedRef = useRef(true);

  // Estado del reproductor
  const [reproduciendo, setReproduciendo] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [tiempoActual, setTiempoActual] = useState(0);
  const [duracionReal, setDuracionReal] = useState(0);
  const [volumen, setVolumen] = useState(0.8);
  const [silenciado, setSilenciado] = useState(false);
  const [cargando, setCargando] = useState(false);

  // Marcar si el componente sigue montado
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      // Cancelar cualquier promesa de play pendiente
      if (playPromiseRef.current) {
        playPromiseRef.current.catch(() => {});
        playPromiseRef.current = null;
      }
      // Pausar audio si existe
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
      }
    };
  }, []);

  // Al cambiar de musica: reiniciar el reproductor
  useEffect(() => {
    // Cancelar cualquier play pendiente del musica anterior
    if (playPromiseRef.current) {
      playPromiseRef.current.catch(() => {});
      playPromiseRef.current = null;
    }

    setReproduciendo(false);
    setProgreso(0);
    setTiempoActual(0);
    setDuracionReal(0);
    setCargando(false);

    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
    audio.load(); // Recarga la nueva fuente
  }, [musica?.id]);

  // Sincronizar volumen con el elemento <audio>
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = silenciado ? 0 : volumen;
  }, [volumen, silenciado]);

  // ── PLAY / PAUSE ──
  async function togglePlay() {
    const audio = audioRef.current;
    if (!audio || !musica?.archivo_url) return;

    if (reproduciendo) {
      audio.pause();
      if (isMountedRef.current) setReproduciendo(false);
    } else {
      try {
        setCargando(true);
        // Cancelar promesa previa si existe
        if (playPromiseRef.current) {
          playPromiseRef.current.catch(() => {});
          playPromiseRef.current = null;
        }
        const promise = audio.play();
        playPromiseRef.current = promise;
        await promise;
        playPromiseRef.current = null;
        if (isMountedRef.current) setReproduciendo(true);
      } catch (err) {
        // Ignorar error de interrupción por cambio de mito o desmontaje
        if (
          err.name === "AbortError" ||
          (err.message &&
            err.message.includes("interrupted because the media was removed"))
        ) {
          // Error esperado, no hacer nada
          return;
        }
        console.error("Error al reproducir:", err);
      } finally {
        if (isMountedRef.current) setCargando(false);
      }
    }
  }

  // ── CLICK EN LA BARRA DE PROGRESO ──
  function handleBarraClick(e) {
    const audio = audioRef.current;
    if (!audio || !duracionReal) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));

    audio.currentTime = pct * duracionReal;
    setProgreso(pct);
    setTiempoActual(pct * duracionReal);
  }

  // ── EVENTOS DEL <audio> ──
  function handleTimeUpdate() {
    const audio = audioRef.current;
    if (!audio || !duracionReal) return;
    const pct = audio.currentTime / duracionReal;
    setProgreso(pct);
    setTiempoActual(audio.currentTime);
  }

  function handleLoadedMetadata() {
    const audio = audioRef.current;
    if (!audio) return;
    setDuracionReal(audio.duration);
  }

  function handleEnded() {
    setReproduciendo(false);
    setProgreso(0);
    setTiempoActual(0);
    // Auto-avanzar al siguiente si existe
    if (haySiguiente) onSiguiente();
  }

  function handleCanPlay() {
    setCargando(false);
  }

  function handleWaiting() {
    setCargando(true);
  }

  // ── TIENE AUDIO REAL ──
  const tieneAudio = !!musica?.archivo_url;

  return (
    <div className="mitos-audio-section">
      {/* Elemento <audio> oculto — el motor real */}
      {tieneAudio && (
        <audio
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          onCanPlay={handleCanPlay}
          onWaiting={handleWaiting}
          preload="metadata"
        >
          <source src={musica.archivo_url} />
          Tu navegador no soporta audio HTML5.
        </audio>
      )}

      {/* ── BARRA DE PROGRESO ── */}
      <div className="mitos-audio-barra-wrapper">
        {/* Tiempo actual */}
        <span className="mitos-audio-tiempo">{formatTiempo(tiempoActual)}</span>

        {/* Barra clickeable */}
        <div
          className="mitos-progress-bar"
          onClick={tieneAudio ? handleBarraClick : undefined}
          style={{ cursor: tieneAudio ? "pointer" : "default" }}
          title={tieneAudio ? "Click para saltar" : "Sin audio disponible"}
        >
          <div
            className="mitos-progress-fill"
            style={{
              width: `${progreso * 100}%`,
              background: tieneAudio
                ? "linear-gradient(90deg, var(--color-blue), var(--color-cyan))"
                : "#1f1f1f",
            }}
          />
          {tieneAudio && (
            <div
              className="mitos-progress-thumb"
              style={{ left: `${progreso * 100}%` }}
            />
          )}
        </div>

        {/* Duración total */}
        <span className="mitos-audio-tiempo derecha">
          {duracionReal > 0
            ? formatTiempo(duracionReal)
            : musica?.duracion || "--:--"}
        </span>
      </div>

      {/* ── BOTONES DE CONTROL ── */}
      <div className="mitos-audio-controles">
        {/* Anterior */}
        <button
          className="btn-audio-skip"
          onClick={onAnterior}
          disabled={!hayAnterior}
          title="Mito anterior"
        >
          <IconSkipBack />
        </button>

        {/* Play / Pausa */}
        <button
          className={`btn-audio-play ${reproduciendo ? "playing" : ""}`}
          onClick={tieneAudio ? togglePlay : undefined}
          disabled={!tieneAudio || cargando}
          title={
            !tieneAudio
              ? "Este mito no tiene audio"
              : cargando
                ? "Cargando..."
                : reproduciendo
                  ? "Pausar"
                  : "Reproducir"
          }
        >
          {cargando ? (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{
                animation: "spin 0.8s linear infinite",
                width: 20,
                height: 20,
              }}
            >
              <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
              <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
            </svg>
          ) : reproduciendo ? (
            <IconPause />
          ) : (
            <IconPlay />
          )}
        </button>

        {/* Siguiente */}
        <button
          className="btn-audio-skip"
          onClick={onSiguiente}
          disabled={!haySiguiente}
          title="Mito siguiente"
        >
          <IconSkipForward />
        </button>
      </div>

      {/* ── VOLUMEN ── */}
      {tieneAudio && (
        <div className="mitos-audio-volumen">
          <button
            className="btn-mute"
            onClick={() => setSilenciado(!silenciado)}
            title={silenciado ? "Activar sonido" : "Silenciar"}
          >
            <IconVolumen muted={silenciado} />
          </button>
          <input
            type="range"
            className="volumen-slider"
            min="0"
            max="1"
            step="0.05"
            value={silenciado ? 0 : volumen}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              setVolumen(v);
              setSilenciado(v === 0);
            }}
            title="Volumen"
          />
        </div>
      )}

      {/* Nota cuando no hay audio */}
      {!tieneAudio && (
        <div
          style={{
            textAlign: "center",
            marginTop: 8,
            fontSize: 10,
            color: "#2a2a2a",
            fontFamily: "var(--font-display)",
            lineHeight: 1.4,
          }}
        >
          Solo lectura disponible para este mito
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL: MusicaPage
// ─────────────────────────────────────────────────────
export default function MusicaPage() {
  // ── DATOS ──
  const [musicas, setMusicas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ── CARGAR MUSICA ──
  // 🔧 Conecta con: tabla public.musica
  useEffect(() => {
    async function cargar() {
      try {
        const musicaData = await getMusica();

        setMusicas(musicaData || []);
      } catch (err) {
        console.error("Error cargando musica:", err);
        setError("No se pudieron cargar las canciones.");
      } finally {
        setLoading(false);
      }
    }
    cargar();
  }, []);

  // ── ESTADO DEL REPRODUCTOR ──
  const [musicaActiva, setMusicaActiva] = useState(null); // Objeto completo del mito seleccionado

  // ── PAGINACIÓN ──
  const [pagina, setPagina] = useState(1);
  const totalPaginas = Math.ceil(musicas.length / POR_PAGINA);
  const musicasPagina = musicas.slice(
    (pagina - 1) * POR_PAGINA,
    pagina * POR_PAGINA,
  );

  // Índice global del mito activo (para prev/next entre páginas)
  const indiceGlobal = musicaActiva
    ? musicas.findIndex((m) => m.id === musicaActiva.id)
    : -1;

  const hayAnterior = indiceGlobal > 0;
  const haySiguiente = indiceGlobal >= 0 && indiceGlobal < musicas.length - 1;

  // ── SELECCIONAR MITO ──
  // Cambia el mito activo; si está en otra página, navega a ella
  function seleccionarMusica(musica) {
    setMusicaActiva(musica);

    // Asegurar que la página muestre el mito seleccionado
    const idx = musicas.findIndex((m) => m.id === musica.id);
    const paginaDeMusica = Math.floor(idx / POR_PAGINA) + 1;
    if (paginaDeMusica !== pagina) setPagina(paginaDeMusica);
  }

  // ── ANTERIOR / SIGUIENTE ──
  function irAnterior() {
    if (!hayAnterior) return;
    seleccionarMusica(musicas[indiceGlobal - 1]);
  }

  function irSiguiente() {
    if (!haySiguiente) return;
    seleccionarMusica(musicas[indiceGlobal + 1]);
  }

  // ── CAMBIAR PÁGINA ──
  function cambiarPagina(nuevaPagina) {
    setPagina(nuevaPagina);
    document.querySelector(".mitos-lista")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  // ─────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────
  return (
    <div>
      {/* ── HEADER ── */}
      <div className="mitos-header">
        <h1>Folklore Pampasino</h1>
        <p>Melodías tradicionales que dan vida a la esencia del pueblo.</p>
      </div>

      {/* ── LAYOUT: REPRODUCTOR + LISTA ── */}
      <div className="mitos-layout">
        {/* PANEL IZQUIERDO — REPRODUCTOR */}
        <div className="mitos-player-panel">
          {musicaActiva ? (
            <>
              {musicaActiva.cover_url ? (
                <img
                  src={musicaActiva.cover_url}
                  alt={musicaActiva.titulo}
                  className="mitos-player-cover"
                />
              ) : (
                <div className="mitos-player-cover-placeholder">
                  <span className="mitos-player-cover-placeholder-icon">
                    🎵
                  </span>
                  <span className="mitos-player-cover-placeholder-texto">
                    {musicaActiva.titulo}
                  </span>
                </div>
              )}

              <div className="mitos-player-info">
                <div className="mitos-player-titulo">{musicaActiva.titulo}</div>
                {musicaActiva.artista && (
                  <div className="mitos-player-subtitulo">
                    {musicaActiva.artista}
                  </div>
                )}
                <div className="mitos-player-meta">
                  {musicaActiva.genero && (
                    <span className="mitos-player-origen">
                      {musicaActiva.genero}
                    </span>
                  )}
                </div>
              </div>

              <ReproductorAudio
                musica={musicaActiva}
                onAnterior={irAnterior}
                onSiguiente={irSiguiente}
                hayAnterior={hayAnterior}
                haySiguiente={haySiguiente}
              />

              <div className="mitos-player-extracto">
                {musicaActiva.descripcion}
              </div>
            </>
          ) : (
            <div className="mitos-player-vacio">
              <div className="mitos-player-vacio-icon">🎶</div>
              <p>
                Selecciona una canción
                <br />
                de la lista para escucharla
              </p>
            </div>
          )}
        </div>

        {/* PANEL DERECHO — LISTA + PAGINACIÓN */}
        <div>
          <div className="mitos-lista-header">
            <span className="mitos-lista-titulo">Todos los relatos</span>
            {!loading && (
              <span className="mitos-lista-count">
                {musicas.length}{" "}
                {musicas.length === 1 ? "canción" : "canciones"}
                {totalPaginas > 1 && ` · pág. ${pagina}/${totalPaginas}`}
              </span>
            )}
          </div>

          <div className="mitos-lista">
            {loading &&
              Array.from({ length: POR_PAGINA }).map((_, i) => (
                <div key={i} className="skeleton-mito">
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background:
                        "linear-gradient(90deg,#111 25%,#1a1a1a 50%,#111 75%)",
                      backgroundSize: "200% 100%",
                      animation: "shimmer 1.5s infinite",
                      flexShrink: 0,
                    }}
                  />
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 8,
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
                      gap: 7,
                    }}
                  >
                    <div
                      style={{
                        height: 13,
                        width: "70%",
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
                        width: "45%",
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
                        width: "80%",
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

            {error && !loading && (
              <div className="mitos-vacio">
                <div className="mitos-vacio-icon">⚠️</div>
                <p>{error}</p>
              </div>
            )}

            {!loading && !error && musicas.length === 0 && (
              <div className="mitos-vacio">
                <div className="mitos-vacio-icon">🎵</div>
                <p>No hay mitos y leyendas publicados todavía.</p>
              </div>
            )}

            {!loading &&
              !error &&
              musicasPagina.map((musica, i) => {
                const indiceReal = (pagina - 1) * POR_PAGINA + i;
                const esActivo = musicaActiva?.id === musica.id;
                const tieneAudio = !!musica.archivo_url;

                return (
                  <div
                    key={musica.id}
                    className={`card-mito ${esActivo ? "activo" : ""}`}
                    onClick={() => seleccionarMusica(musica)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) =>
                      e.key === "Enter" && seleccionarMusica(musica)
                    }
                    aria-label={`${esActivo ? "Seleccionado: " : ""}${musica.titulo}`}
                  >
                    <div className="card-mito-num">
                      {esActivo ? (
                        <div className="card-mito-playing">
                          <div className="bar" style={{ height: "40%" }} />
                          <div className="bar" style={{ height: "80%" }} />
                          <div className="bar" style={{ height: "55%" }} />
                        </div>
                      ) : (
                        <span>{indiceReal + 1}</span>
                      )}
                    </div>

                    {musica.cover_url ? (
                      <img
                        src={musica.cover_url}
                        alt={musica.titulo}
                        className="card-mito-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="card-mito-cover-placeholder">🎵</div>
                    )}

                    <div className="card-mito-info">
                      <span className="card-mito-titulo">{musica.titulo}</span>

                      {musica.artista && (
                        <span className="card-mito-subtitulo">
                          "{musica.artista}"
                        </span>
                      )}

                      {musica.descripcion && (
                        <p className="card-mito-preview">
                          {musica.descripcion.substring(0, 120)}...
                        </p>
                      )}
                    </div>

                    <div className="card-mito-meta">
                      {musica.duracion && (
                        <span className="card-mito-duracion">
                          {musica.duracion} min
                        </span>
                      )}

                      {musica.genero && (
                        <span className="card-mito-origen">
                          {musica.genero}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

            {!loading && totalPaginas > 1 && (
              <div className="mitos-paginacion">
                <span className="mitos-paginacion-info">
                  Mostrando {(pagina - 1) * POR_PAGINA + 1}–
                  {Math.min(pagina * POR_PAGINA, musicas.length)} de{" "}
                  {musicas.length}
                </span>

                <div className="mitos-paginacion-btns">
                  <button
                    className="btn-pag-mito"
                    onClick={() => cambiarPagina(1)}
                    disabled={pagina === 1}
                    title="Primera página"
                  >
                    «
                  </button>

                  <button
                    className="btn-pag-mito"
                    onClick={() => cambiarPagina(pagina - 1)}
                    disabled={pagina === 1}
                    title="Página anterior"
                  >
                    ‹
                  </button>

                  {Array.from({ length: totalPaginas }, (_, i) => i + 1)
                    .filter((p) => Math.abs(p - pagina) <= 2)
                    .map((p) => (
                      <button
                        key={p}
                        className={`btn-pag-mito ${p === pagina ? "activo" : ""}`}
                        onClick={() => cambiarPagina(p)}
                      >
                        {p}
                      </button>
                    ))}

                  <button
                    className="btn-pag-mito"
                    onClick={() => cambiarPagina(pagina + 1)}
                    disabled={pagina === totalPaginas}
                    title="Página siguiente"
                  >
                    ›
                  </button>

                  <button
                    className="btn-pag-mito"
                    onClick={() => cambiarPagina(totalPaginas)}
                    disabled={pagina === totalPaginas}
                    title="Última página"
                  >
                    »
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
