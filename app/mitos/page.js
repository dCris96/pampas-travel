// app/mitos/page.js
// ─────────────────────────────────────────────────────
// PÁGINA: Mitos y Leyendas — Ruta: /mitos
//
// Layout idéntico a /musica:
//   Panel izquierdo sticky → reproductor de audio + info
//   Panel derecho          → lista paginada de mitos
//
// El reproductor tiene:
//   ✓ Play / Pausa real con elemento <audio> nativo
//   ✓ Barra de progreso clickeable
//   ✓ Control de volumen
//   ✓ Botones anterior / siguiente
//   ✓ Tiempo transcurrido / duración total
//   ✓ Barras animadas en la lista cuando reproduce
//
// 🔧 Conecta con: tabla public.mitos
// ─────────────────────────────────────────────────────

"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
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
// Recibe el mito activo y el índice para prev/next
// ─────────────────────────────────────────────────────
function ReproductorAudio({
  mito,
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

  // Al cambiar de mito: reiniciar el reproductor
  useEffect(() => {
    // Cancelar cualquier play pendiente del mito anterior
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
  }, [mito?.id]);

  // Sincronizar volumen con el elemento <audio>
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = silenciado ? 0 : volumen;
  }, [volumen, silenciado]);

  // ── PLAY / PAUSE ──
  async function togglePlay() {
    const audio = audioRef.current;
    if (!audio || !mito?.audio_url) return;

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
  const tieneAudio = !!mito?.audio_url;

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
          <source src={mito.audio_url} />
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
            : mito?.duracion || "--:--"}
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
// COMPONENTE PRINCIPAL: MitosPage
// ─────────────────────────────────────────────────────
export default function MitosPage() {
  // ── DATOS ──
  const [mitos, setMitos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ── ESTADO DEL REPRODUCTOR ──
  const [mitoActivo, setMitoActivo] = useState(null); // Objeto completo del mito seleccionado

  // ── PAGINACIÓN ──
  const [pagina, setPagina] = useState(1);
  const totalPaginas = Math.ceil(mitos.length / POR_PAGINA);
  const mitosPagina = mitos.slice(
    (pagina - 1) * POR_PAGINA,
    pagina * POR_PAGINA,
  );

  // Índice global del mito activo (para prev/next entre páginas)
  const indiceGlobal = mitoActivo
    ? mitos.findIndex((m) => m.id === mitoActivo.id)
    : -1;

  const hayAnterior = indiceGlobal > 0;
  const haySiguiente = indiceGlobal >= 0 && indiceGlobal < mitos.length - 1;

  // ── CARGAR MITOS ──
  // 🔧 Conecta con: tabla public.mitos
  useEffect(() => {
    async function cargar() {
      try {
        const { data, error } = await supabase
          .from("mitos")
          .select("*")
          .eq("activo", true)
          .eq("estado", "aprobado")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setMitos(data || []);
      } catch (err) {
        console.error("Error cargando mitos:", err);
        setError("No se pudieron cargar los mitos y leyendas.");
      } finally {
        setLoading(false);
      }
    }
    cargar();
  }, []);

  // ── SELECCIONAR MITO ──
  // Cambia el mito activo; si está en otra página, navega a ella
  function seleccionarMito(mito) {
    setMitoActivo(mito);

    // Asegurar que la página muestre el mito seleccionado
    const idx = mitos.findIndex((m) => m.id === mito.id);
    const paginaDelMito = Math.floor(idx / POR_PAGINA) + 1;
    if (paginaDelMito !== pagina) setPagina(paginaDelMito);
  }

  // ── ANTERIOR / SIGUIENTE ──
  function irAnterior() {
    if (!hayAnterior) return;
    seleccionarMito(mitos[indiceGlobal - 1]);
  }

  function irSiguiente() {
    if (!haySiguiente) return;
    seleccionarMito(mitos[indiceGlobal + 1]);
  }

  // ── CAMBIAR PÁGINA ──
  function cambiarPagina(nuevaPagina) {
    setPagina(nuevaPagina);
    document.querySelector(".mitos-lista")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  // Limpiar reproductor al hacer clic fuera de las tarjetas y fuera de la paginación
  function handleBackgroundClick(e) {
    // Si el clic ocurrió dentro de una tarjeta, no hacemos nada (selección normal)
    if (e.target.closest(".card-mito")) return;
    // Si el clic ocurrió dentro de la paginación (botones), no limpiamos
    if (e.target.closest(".mitos-paginacion")) return;
    // Si el clic ocurrió en el encabezado de la lista, no limpiamos (opcional)
    if (e.target.closest(".mitos-lista-header")) return;

    // En cualquier otro caso (fondo vacío, skeleton, mensaje de error, etc.) limpiamos el reproductor
    setMitoActivo(null);
  }

  // ─────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────
  return (
    <div>
      {/* ── HEADER ── */}
      <div className="mitos-header">
        <h1>Mitos y Leyendas</h1>
        <p>
          Historias ancestrales que dan vida al Valle de los Vientos.
          {!loading && mitos.length > 0 && ` ${mitos.length} relatos.`}
        </p>
      </div>

      {/* ── LAYOUT: REPRODUCTOR + LISTA ── */}
      <div className="mitos-layout">
        {/* PANEL IZQUIERDO — REPRODUCTOR */}
        <div className="mitos-player-panel">
          {mitoActivo ? (
            <>
              {mitoActivo.cover_url ? (
                <img
                  src={mitoActivo.cover_url}
                  alt={mitoActivo.titulo}
                  className="mitos-player-cover"
                />
              ) : (
                <div className="mitos-player-cover-placeholder">
                  <span className="mitos-player-cover-placeholder-icon">
                    📖
                  </span>
                  <span className="mitos-player-cover-placeholder-texto">
                    {mitoActivo.titulo}
                  </span>
                </div>
              )}

              <div className="mitos-player-info">
                <div className="mitos-player-titulo">{mitoActivo.titulo}</div>
                {mitoActivo.subtitulo && (
                  <div className="mitos-player-subtitulo">
                    "{mitoActivo.subtitulo}"
                  </div>
                )}
                <div className="mitos-player-meta">
                  {mitoActivo.origen && (
                    <span className="mitos-player-origen">
                      <IconPin /> {mitoActivo.origen}
                    </span>
                  )}
                  {mitoActivo.epoca && (
                    <span className="mitos-player-epoca">
                      {mitoActivo.epoca}
                    </span>
                  )}
                </div>
              </div>

              <ReproductorAudio
                mito={mitoActivo}
                onAnterior={irAnterior}
                onSiguiente={irSiguiente}
                hayAnterior={hayAnterior}
                haySiguiente={haySiguiente}
              />

              {mitoActivo.contenido && (
                <div className="mitos-player-acciones">
                  <Link
                    href=""
                    className="btn-cerrar"
                    onClick={(e) => {
                      setMitoActivo(null);
                    }}
                  >
                    Cerrar Cuento
                  </Link>
                  <Link
                    href={`/mitos/${mitoActivo.id}`}
                    className="btn-ver-mas"
                  >
                    Leer cuento
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="mitos-player-vacio">
              <div className="mitos-player-vacio-icon">📖</div>
              <p>
                Selecciona una leyenda
                <br />
                de la lista para leerla
                <br />o escuchar su narración.
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
                {mitos.length} {mitos.length === 1 ? "leyenda" : "leyendas"}
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

            {!loading && !error && mitos.length === 0 && (
              <div className="mitos-vacio">
                <div className="mitos-vacio-icon">📖</div>
                <p>No hay mitos y leyendas publicados todavía.</p>
              </div>
            )}

            {!loading &&
              !error &&
              mitosPagina.map((mito, i) => {
                const indiceReal = (pagina - 1) * POR_PAGINA + i;
                const esActivo = mitoActivo?.id === mito.id;
                const tieneAudio = !!mito.audio_url;

                return (
                  <div
                    key={mito.id}
                    className={`card-mito ${esActivo ? "activo" : ""}`}
                    onClick={() => seleccionarMito(mito)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) =>
                      e.key === "Enter" && seleccionarMito(mito)
                    }
                    aria-label={`${esActivo ? "Seleccionado: " : ""}${mito.titulo}`}
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

                    {mito.cover_url ? (
                      <img
                        src={mito.cover_url}
                        alt={mito.titulo}
                        className="card-mito-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="card-mito-cover-placeholder">📖</div>
                    )}

                    <div className="card-mito-info">
                      <span className="card-mito-titulo">{mito.titulo}</span>

                      {mito.subtitulo && (
                        <span className="card-mito-subtitulo">
                          "{mito.subtitulo}"
                        </span>
                      )}

                      {mito.contenido && (
                        <p className="card-mito-preview">
                          {mito.contenido.substring(0, 120)}...
                        </p>
                      )}
                    </div>

                    <div className="card-mito-meta">
                      {mito.duracion && (
                        <span className="card-mito-duracion">
                          {mito.duracion} min
                        </span>
                      )}

                      {tieneAudio ? (
                        <span className="badge-audio">🔊 audio</span>
                      ) : (
                        <>
                          <span className="badge-sin-audio">📖 lectura</span>
                          <Link href={`/mitos/${mito.id}`} className="ver-mas">
                            Leer historia completa
                          </Link>
                        </>
                      )}

                      {mito.origen && (
                        <span className="card-mito-origen">{mito.origen}</span>
                      )}
                    </div>
                  </div>
                );
              })}

            {!loading && totalPaginas > 1 && (
              <div className="mitos-paginacion">
                <span className="mitos-paginacion-info">
                  Mostrando {(pagina - 1) * POR_PAGINA + 1}–
                  {Math.min(pagina * POR_PAGINA, mitos.length)} de{" "}
                  {mitos.length}
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
