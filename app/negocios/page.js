// app/negocios/page.js
// ─────────────────────────────────────────────────────
// PÁGINA: Todos los negocios del distrito
// Ruta: /negocios
//
// - Carga todos los negocios de Supabase
// - Filtros por tipo (hotel, restaurante, etc.)
// - Toggle de vista: grid (normal) / lista (horizontal)
// - Replica el header de la imagen de referencia
//
// 🔧 Conecta con: tabla public.negocios
// ─────────────────────────────────────────────────────

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import CardNegocio from "@/components/CardNegocio";
import "@/styles/negocios.css";

// ── FILTROS DISPONIBLES ──
// 🔧 PERSONALIZABLE: Agrega los tipos que uses en tu BD
const TIPOS = [
  { valor: "todos", label: "Todos", emoji: "🏪" },
  { valor: "hotel", label: "Hoteles", emoji: "🏨" },
  { valor: "restaurante", label: "Restaurantes", emoji: "🍽️" },
  { valor: "cafe", label: "Cafés", emoji: "☕" },
  { valor: "tienda", label: "Tiendas", emoji: "🛍️" },
  { valor: "servicio", label: "Servicios", emoji: "⚙️" },
  { valor: "transporte", label: "Transporte", emoji: "🚐" },
];

// ── ÍCONOS VISTA ──
const IconGrid = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
  </svg>
);
const IconList = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);
const IconLogin = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <polyline points="10,17 15,12 10,7" />
    <line x1="15" y1="12" x2="3" y2="12" />
  </svg>
);

// ── SKELETON ──
function SkeletonNegocios({ vista }) {
  const count = vista === "grid" ? 6 : 4;
  return (
    <div className={vista === "grid" ? "negocios-grid" : "negocios-lista"}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-negocio">
          <div
            className="skeleton-negocio-img"
            style={{ height: vista === "grid" ? 210 : 140 }}
          />
          <div className="skeleton-negocio-body">
            <div className="skeleton-line medium" />
            <div className="skeleton-line short" />
            <div className="skeleton-line medium" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function NegociosPage() {
  const { user } = useAuth();

  // ── ESTADO ──
  const [negocios, setNegocios] = useState([]);
  const [filtrados, setFiltrados] = useState([]);
  const [tipo, setTipo] = useState("todos");
  // Vista: 'grid' (2 cols, card normal) | 'lista' (1 col, card horizontal)
  const [vista, setVista] = useState("grid");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ── CARGAR NEGOCIOS ──
  // 🔧 Conecta con: tabla public.negocios
  useEffect(() => {
    async function cargarNegocios() {
      try {
        const { data, error } = await supabase
          .from("negocios")
          .select("*")
          .eq("activo", true)
          .order("destacado", { ascending: false })
          .order("nombre", { ascending: true });

        if (error) throw error;
        setNegocios(data || []);
        setFiltrados(data || []);
      } catch (err) {
        console.error("Error cargando negocios:", err);
        setError("No pudimos cargar los negocios.");
      } finally {
        setLoading(false);
      }
    }
    cargarNegocios();
  }, []);

  // ── FILTRAR POR TIPO ──
  useEffect(() => {
    if (tipo === "todos") {
      setFiltrados(negocios);
    } else {
      setFiltrados(negocios.filter((n) => n.tipo === tipo));
    }
  }, [tipo, negocios]);

  return (
    <div>
      {/* ── HEADER (replica imagen de referencia) ── */}
      <div className="negocios-page-header">
        <div className="negocios-page-header-text">
          <h1>Negocios</h1>
          <p>
            Servicios, comercios y establecimientos del Valle de los Vientos.
          </p>
        </div>

        {/* Botón de login en header si no está logueado */}
        {!user && (
          <Link href="/login" className="btn-header-login">
            <IconLogin />
            Inicia sesión
          </Link>
        )}
      </div>

      {/* ── BARRA DE FILTROS + TOGGLE VISTA ── */}
      <div className="negocios-filtros">
        {TIPOS.map((t) => (
          <button
            key={t.valor}
            className={`negocio-filtro-btn ${tipo === t.valor ? "activo" : ""}`}
            onClick={() => setTipo(t.valor)}
          >
            <span className="filtro-icon">{t.emoji}</span>
            {t.label}
          </button>
        ))}

        {/* Contador */}
        {!loading && (
          <span className="negocios-count">
            {filtrados.length}{" "}
            {filtrados.length === 1 ? "resultado" : "resultados"}
          </span>
        )}

        {/* Toggle de vista */}
        <div className="vista-toggle">
          <button
            className={`vista-btn ${vista === "grid" ? "activo" : ""}`}
            onClick={() => setVista("grid")}
            title="Vista cuadrícula"
          >
            <IconGrid />
          </button>
          <button
            className={`vista-btn ${vista === "lista" ? "activo" : ""}`}
            onClick={() => setVista("lista")}
            title="Vista lista"
          >
            <IconList />
          </button>
        </div>
      </div>

      {/* ── CONTENIDO ── */}
      {loading ? (
        <SkeletonNegocios vista={vista} />
      ) : error ? (
        <div className="empty-negocios">
          <div className="empty-negocios-icon">⚠️</div>
          <h3>Error al cargar</h3>
          <p>{error}</p>
        </div>
      ) : filtrados.length === 0 ? (
        <div className={vista === "grid" ? "negocios-grid" : ""}>
          <div className="empty-negocios">
            <div className="empty-negocios-icon">🏪</div>
            <h3>Sin resultados</h3>
            <p>No encontramos negocios en esta categoría.</p>
          </div>
        </div>
      ) : (
        /* Grid o lista según la vista activa */
        <div className={vista === "grid" ? "negocios-grid" : "negocios-lista"}>
          {filtrados.map((negocio) => (
            <CardNegocio
              key={negocio.id}
              negocio={negocio}
              variante={vista === "grid" ? "normal" : "horizontal"}
            />
          ))}
        </div>
      )}
    </div>
  );
}
