// app/mapa/page.js
// ─────────────────────────────────────────────────────
// PÁGINA: Mapa Interactivo — Ruta: /mapa
//
// Funcionalidades:
//   ✓ Carga lugares Y negocios de Supabase
//   ✓ Unifica en un solo array de "puntos"
//   ✓ Sidebar con filtros por capa (toggle)
//   ✓ Lista de puntos visibles con buscador
//   ✓ Click en lista → vuela al punto en el mapa
//   ✓ Click en marcador → selecciona en la lista
//   ✓ Stats: total de puntos visibles
//
// 🔧 Conecta con: tablas lugares + negocios
// ─────────────────────────────────────────────────────

"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabaseClient";
import "@/styles/mapa.css";
import "@/styles/mapa-sidebar.css";

// ── IMPORT DINÁMICO DEL MAPA ──
// ssr: false evita que Leaflet intente acceder a window en el servidor
// Mostramos un fallback mientras carga
const MapaInteractivo = dynamic(() => import("@/components/MapaInteractivo"), {
  ssr: false,
  loading: () => (
    <div className="mapa-loading-overlay">
      <div className="mapa-loading-spinner" />
      <span className="mapa-loading-texto">Cargando mapa...</span>
    </div>
  ),
});

// ── CONFIGURACIÓN DE CAPAS ──
// Define qué capas existen, su nombre visual, color y emoji
// 🔧 PERSONALIZABLE: Agrega o quita capas según tus tipos de datos
const CAPAS_CONFIG = [
  // ── Lugares turísticos (por categoría)
  {
    id: "naturaleza",
    label: "Naturaleza",
    emoji: "🌿",
    color: "#6bffab",
    grupo: "Lugares",
  },
  {
    id: "patrimonio",
    label: "Patrimonio",
    emoji: "🏛️",
    color: "#ffb86b",
    grupo: "Lugares",
  },
  {
    id: "mirador",
    label: "Miradores",
    emoji: "🔭",
    color: "#6babff",
    grupo: "Lugares",
  },
  {
    id: "aventura",
    label: "Aventura",
    emoji: "🧗",
    color: "#ff8a6b",
    grupo: "Lugares",
  },
  {
    id: "cultura",
    label: "Cultura",
    emoji: "🎭",
    color: "#c46bff",
    grupo: "Lugares",
  },
  {
    id: "gastronomia",
    label: "Gastronomía",
    emoji: "🍲",
    color: "#ffd46b",
    grupo: "Lugares",
  },
  // ── Negocios (por tipo)
  {
    id: "hotel",
    label: "Hoteles",
    emoji: "🏨",
    color: "#6babff",
    grupo: "Servicios",
  },
  {
    id: "restaurante",
    label: "Restaurantes",
    emoji: "🍽️",
    color: "#ffb86b",
    grupo: "Servicios",
  },
  {
    id: "cafe",
    label: "Cafés",
    emoji: "☕",
    color: "#ffd46b",
    grupo: "Servicios",
  },
  {
    id: "tienda",
    label: "Tiendas",
    emoji: "🛍️",
    color: "#6bffab",
    grupo: "Servicios",
  },
  {
    id: "servicio",
    label: "Servicios",
    emoji: "⚙️",
    color: "#aaaaaa",
    grupo: "Servicios",
  },
  {
    id: "transporte",
    label: "Transporte",
    emoji: "🚐",
    color: "#c46bff",
    grupo: "Servicios",
  },
];

// ── ÍCONOS SVG ──
const IconSearch = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export default function MapaPage() {
  // ── ESTADO ──
  const [lugares, setLugares] = useState([]); // Datos de tabla lugares
  const [negocios, setNegocios] = useState([]); // Datos de tabla negocios
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [puntoActivo, setPuntoActivo] = useState(null); // ID del punto seleccionado
  const [busqueda, setBusqueda] = useState("");

  // Capas visibles: objeto { id_capa: boolean }
  // Por defecto todas visibles
  const [capasVisibles, setCapasVisibles] = useState(
    Object.fromEntries(CAPAS_CONFIG.map((c) => [c.id, true])),
  );

  // ── CARGAR DATOS DE SUPABASE ──
  // 🔧 Conecta con: tablas lugares y negocios
  useEffect(() => {
    async function cargarDatos() {
      try {
        // Cargamos en paralelo para mayor velocidad
        const [lugaresRes, negociosRes] = await Promise.all([
          supabase
            .from("lugares")
            .select(
              "id, titulo, descripcion, categoria, imagen_url, latitud, longitud",
            )
            .eq("activo", true)
            .not("latitud", "is", null) // Solo los que tienen coordenadas
            .not("longitud", "is", null),

          supabase
            .from("negocios")
            .select(
              "id, nombre, descripcion, tipo, imagen_url, latitud, longitud, direccion",
            )
            .eq("activo", true)
            .not("latitud", "is", null)
            .not("longitud", "is", null),
        ]);

        if (lugaresRes.error) throw lugaresRes.error;
        if (negociosRes.error) throw negociosRes.error;

        setLugares(lugaresRes.data || []);
        setNegocios(negociosRes.data || []);
      } catch (err) {
        console.error("Error cargando datos del mapa:", err);
        setError("No se pudieron cargar los datos del mapa.");
      } finally {
        setLoading(false);
      }
    }

    cargarDatos();
  }, []);

  // ── UNIFICAR LUGARES Y NEGOCIOS EN UN ARRAY DE PUNTOS ──
  // Normalizamos el esquema para que el mapa reciba siempre el mismo formato
  const todosLosPuntos = useMemo(() => {
    // Normalizar lugares: usan "titulo" y "categoria"
    const lugaresNorm = lugares.map((l) => ({
      id: l.id,
      nombre: l.titulo, // Unificamos a "nombre"
      descripcion: l.descripcion,
      tipo: l.categoria, // Unificamos a "tipo"
      imagen_url: l.imagen_url,
      latitud: l.latitud,
      longitud: l.longitud,
      esLugar: true, // Flag para la URL de detalle
    }));

    // Normalizar negocios: usan "nombre" y "tipo"
    const negociosNorm = negocios.map((n) => ({
      id: n.id,
      nombre: n.nombre,
      descripcion: n.descripcion,
      tipo: n.tipo,
      imagen_url: n.imagen_url,
      latitud: n.latitud,
      longitud: n.longitud,
      esLugar: false,
    }));

    return [...lugaresNorm, ...negociosNorm];
  }, [lugares, negocios]);

  // ── PUNTOS FILTRADOS (capas + búsqueda) ──
  const puntosFiltrados = useMemo(() => {
    return todosLosPuntos.filter((punto) => {
      // Filtro de capa visible
      if (capasVisibles[punto.tipo] === false) return false;

      // Filtro de búsqueda
      if (busqueda.trim()) {
        const q = busqueda.toLowerCase();
        return (
          punto.nombre?.toLowerCase().includes(q) ||
          punto.descripcion?.toLowerCase().includes(q) ||
          punto.tipo?.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [todosLosPuntos, capasVisibles, busqueda]);

  // ── CONTAR PUNTOS POR TIPO (para los badges de los filtros) ──
  const conteosPorTipo = useMemo(() => {
    const conteos = {};
    todosLosPuntos.forEach((p) => {
      conteos[p.tipo] = (conteos[p.tipo] || 0) + 1;
    });
    return conteos;
  }, [todosLosPuntos]);

  // ── TOGGLE DE CAPA ──
  function toggleCapa(id) {
    setCapasVisibles((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  // ── TOGGLE TODAS LAS CAPAS ──
  function toggleTodasCapas(visible) {
    setCapasVisibles(
      Object.fromEntries(CAPAS_CONFIG.map((c) => [c.id, visible])),
    );
  }

  // ── CLICK EN PUNTO (lista o marcador) ──
  const handlePuntoClick = useCallback((punto) => {
    setPuntoActivo((prev) => (prev === punto.id ? null : punto.id));
  }, []);

  // ── STATS ──
  const totalVisible = puntosFiltrados.length;
  const totalLugares = puntosFiltrados.filter((p) => p.esLugar).length;
  const totalNegocios = puntosFiltrados.filter((p) => !p.esLugar).length;

  // ── RENDER ──
  return (
    <div className="mapa-page">
      {/* ── HEADER ── */}
      <div className="mapa-page-header">
        <h1>Mapa Interactivo</h1>
        <p>
          {loading
            ? "Cargando puntos de interés..."
            : `${totalVisible} puntos de interés en el Valle de los Vientos`}
        </p>
      </div>

      {/* ── LAYOUT: SIDEBAR + MAPA ── */}
      <div className="mapa-layout">
        {/* ─────────────────────────
            SIDEBAR IZQUIERDO
        ───────────────────────── */}
        <div className="mapa-sidebar">
          {/* ── Panel de filtros (capas) ── */}
          <div className="mapa-panel">
            <div
              className="mapa-panel-header"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span className="mapa-panel-titulo">Capas</span>
              <div style={{ display: "flex", gap: 8 }}>
                {/* Botón "Todo" */}
                <button
                  onClick={() => toggleTodasCapas(true)}
                  style={{
                    fontSize: 10,
                    color: "var(--color-blue)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  Todo
                </button>
                {/* Botón "Nada" */}
                <button
                  onClick={() => toggleTodasCapas(false)}
                  style={{
                    fontSize: 10,
                    color: "#555",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  Nada
                </button>
              </div>
            </div>

            <div className="mapa-filtros-lista">
              {/* Agrupar por grupo */}
              {["Lugares", "Servicios"].map((grupo) => (
                <div key={grupo}>
                  {/* Label del grupo */}
                  <div
                    style={{
                      fontSize: 9,
                      fontFamily: "var(--font-display)",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: "#333",
                      padding: "8px 8px 4px",
                    }}
                  >
                    {grupo}
                  </div>

                  {/* Items del grupo */}
                  {CAPAS_CONFIG.filter((c) => c.grupo === grupo).map((capa) => {
                    const count = conteosPorTipo[capa.id] || 0;
                    const activa = capasVisibles[capa.id] !== false;
                    return (
                      <div
                        key={capa.id}
                        className={`mapa-filtro-item ${activa ? "activo" : ""}`}
                        onClick={() => toggleCapa(capa.id)}
                      >
                        <div className="mapa-filtro-izq">
                          <div
                            className="mapa-filtro-dot"
                            style={{ backgroundColor: capa.color }}
                          />
                          <span className="mapa-filtro-label">
                            {capa.label}
                          </span>
                          <span className="mapa-filtro-count">{count}</span>
                        </div>
                        <div className="mapa-filtro-toggle" />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* ── Panel de lista de puntos ── */}
          <div
            className="mapa-panel"
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Buscador */}
            <div className="mapa-buscar">
              <div className="mapa-buscar-icon">
                <IconSearch />
              </div>
              <input
                type="text"
                className="mapa-buscar-input"
                placeholder="Buscar lugar o negocio..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            {/* Lista scrolleable */}
            <div className="mapa-lista-puntos">
              {loading ? (
                /* Skeleton de la lista */
                Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 14px",
                      borderBottom: "1px solid #111",
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
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
                        gap: 5,
                      }}
                    >
                      <div
                        style={{
                          height: 11,
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
                          height: 9,
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
                ))
              ) : error ? (
                <div className="mapa-lista-vacia">⚠️ {error}</div>
              ) : puntosFiltrados.length === 0 ? (
                <div className="mapa-lista-vacia">
                  {busqueda
                    ? `Sin resultados para "${busqueda}"`
                    : "Sin puntos visibles"}
                </div>
              ) : (
                puntosFiltrados.map((punto) => {
                  // Configuración visual del tipo
                  const config = {
                    naturaleza: { emoji: "🌿", color: "#1a3a26" },
                    patrimonio: { emoji: "🏛️", color: "#3a2a1a" },
                    mirador: { emoji: "🔭", color: "#1a2a5c" },
                    aventura: { emoji: "🧗", color: "#3a1a1a" },
                    cultura: { emoji: "🎭", color: "#2a1a3a" },
                    gastronomia: { emoji: "🍲", color: "#3a2a10" },
                    hotel: { emoji: "🏨", color: "#1a2240" },
                    restaurante: { emoji: "🍽️", color: "#2a1a10" },
                    cafe: { emoji: "☕", color: "#1a1510" },
                    tienda: { emoji: "🛍️", color: "#1a2a1a" },
                    servicio: { emoji: "⚙️", color: "#1f1f1f" },
                    transporte: { emoji: "🚐", color: "#1a1a2a" },
                  }[punto.tipo] || { emoji: "📍", color: "#1f1f1f" };

                  const isActivo = puntoActivo === punto.id;

                  return (
                    <div
                      key={punto.id}
                      className={`mapa-punto-item ${isActivo ? "activo" : ""}`}
                      onClick={() => handlePuntoClick(punto)}
                    >
                      {/* Emoji en cuadrado de color */}
                      <div
                        className="mapa-punto-emoji"
                        style={{ backgroundColor: config.color }}
                      >
                        {config.emoji}
                      </div>

                      {/* Info */}
                      <div className="mapa-punto-info">
                        <span className="mapa-punto-nombre">
                          {punto.nombre}
                        </span>
                        <span className="mapa-punto-tipo">{punto.tipo}</span>
                      </div>

                      {/* Flecha */}
                      <span className="mapa-punto-arrow">›</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ── Stats bar ── */}
          {!loading && (
            <div className="mapa-stats-bar">
              <div className="mapa-stat">
                <span className="mapa-stat-valor">{totalVisible}</span>
                <span className="mapa-stat-label">Total</span>
              </div>
              <div className="mapa-stat">
                <span
                  className="mapa-stat-valor"
                  style={{ color: "var(--color-green)" }}
                >
                  {totalLugares}
                </span>
                <span className="mapa-stat-label">Lugares</span>
              </div>
              <div className="mapa-stat">
                <span
                  className="mapa-stat-valor"
                  style={{ color: "var(--color-yellow)" }}
                >
                  {totalNegocios}
                </span>
                <span className="mapa-stat-label">Negocios</span>
              </div>
            </div>
          )}
        </div>

        {/* ─────────────────────────
            MAPA PRINCIPAL
        ───────────────────────── */}
        <div className="mapa-container">
          {/*
            MapaInteractivo se carga dinámicamente (ssr: false)
            Solo se renderiza en el navegador
          */}
          <MapaInteractivo
            puntos={puntosFiltrados}
            capasVisibles={capasVisibles}
            puntoActivo={puntoActivo}
            onPuntoClick={handlePuntoClick}
            // 🔧 PERSONALIZABLE: Cambia al centro de TU distrito
            centro={[-13.5175, -72.9721]}
            zoom={13}
          />
        </div>
      </div>
    </div>
  );
}
