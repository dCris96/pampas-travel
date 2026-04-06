// app/lugares/page.js
// ─────────────────────────────────────────────────────
// PÁGINA: Lista de todos los lugares turísticos
// Ruta: /lugares
//
// Funcionalidades:
//   - Carga lugares desde Supabase
//   - Filtros por categoría (client-side)
//   - Skeleton loading mientras carga
//   - Estado vacío si no hay resultados
//
// 🔧 Conecta con: tabla public.lugares
// ─────────────────────────────────────────────────────

"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import CardLugar from "@/components/CardLugar";
import "@/styles/lugares.css";

// ── DEFINICIÓN DE CATEGORÍAS ──
// 'todos' = sin filtro, resto filtra por categoria
// 🔧 PERSONALIZABLE: Agrega las categorías que uses en tu BD
const CATEGORIAS = [
  { valor: "todos", label: "Todos" },
  { valor: "naturaleza", label: "Naturaleza" },
  { valor: "patrimonio", label: "Patrimonio" },
  { valor: "mirador", label: "Mirador" },
  { valor: "aventura", label: "Aventura" },
  { valor: "cultura", label: "Cultura" },
  { valor: "gastronomia", label: "Gastronomía" },
];

// ── COMPONENTE SKELETON ──
// Se muestra mientras cargan los datos de Supabase
function SkeletonLugares() {
  return (
    <div className="skeleton-grid">
      {/* Generamos 6 cards fantasma */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-img" />
          <div className="skeleton-body">
            <div className="skeleton-line medium" />
            <div className="skeleton-line short" />
            <div className="skeleton-line medium" />
            <div className="skeleton-line short" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function LugaresPage() {
  // ── ESTADO ──
  const [lugares, setLugares] = useState([]); // Todos los lugares de Supabase
  const [filtrados, setFiltrados] = useState([]); // Lugares después de aplicar filtro
  const [categoria, setCategoria] = useState("todos"); // Filtro activo
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ── CARGAR LUGARES DE SUPABASE ──
  // Se ejecuta una sola vez al montar el componente
  useEffect(() => {
    async function cargarLugares() {
      try {
        // 🔧 Conecta con: tabla public.lugares
        // SELECT * FROM lugares WHERE activo = true ORDER BY created_at DESC
        const { data, error } = await supabase
          .from("lugares")
          .select("*") // Todos los campos
          .eq("activo", true) // Solo lugares activos
          .order("destacado", { ascending: false }) // Destacados primero
          .order("created_at", { ascending: false }); // Más nuevos primero

        if (error) throw error;

        setLugares(data || []);
        setFiltrados(data || []);
      } catch (err) {
        console.error("Error cargando lugares:", err);
        setError("No pudimos cargar los lugares. Intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    }

    cargarLugares();
  }, []); // [] = solo al montar

  // ── APLICAR FILTRO DE CATEGORÍA ──
  // Se ejecuta cuando cambia la categoría seleccionada
  useEffect(() => {
    if (categoria === "todos") {
      setFiltrados(lugares);
    } else {
      setFiltrados(lugares.filter((l) => l.categoria === categoria));
    }
  }, [categoria, lugares]);

  // ── RENDER ──
  return (
    <div>
      {/* ── CABECERA ── */}
      <div className="page-header">
        <h1 className="page-title">Sitios Turísticos</h1>
        <p className="page-subtitle">
          Descubre los lugares más importantes del Valle de los Vientos.
        </p>
      </div>

      {/* ── BARRA DE FILTROS ── */}
      <div className="filtros-bar">
        {CATEGORIAS.map((cat) => (
          <button
            key={cat.valor}
            className={`filtro-btn ${categoria === cat.valor ? "activo" : ""}`}
            onClick={() => setCategoria(cat.valor)}
          >
            {cat.label}
          </button>
        ))}

        {/* Contador de resultados */}
        {!loading && (
          <span className="resultados-count">
            {filtrados.length} {filtrados.length === 1 ? "lugar" : "lugares"}
          </span>
        )}
      </div>

      {/* ── CONTENIDO ── */}
      {loading ? (
        // Skeleton mientras carga
        <SkeletonLugares />
      ) : error ? (
        // Error de conexión
        <div className="empty-lugares">
          <div className="empty-lugares-icon">⚠️</div>
          <h3>Error al cargar</h3>
          <p>{error}</p>
        </div>
      ) : (
        // Grid de cards
        <div className="lugares-grid">
          {filtrados.length > 0 ? (
            filtrados.map((lugar) => (
              <CardLugar key={lugar.id} lugar={lugar} variante="normal" />
            ))
          ) : (
            // Estado vacío cuando el filtro no da resultados
            <div className="empty-lugares">
              <div className="empty-lugares-icon">🗺️</div>
              <h3>Sin resultados</h3>
              <p>No hay lugares en la categoría "{categoria}".</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
