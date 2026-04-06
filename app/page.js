// app/page.js — VERSIÓN ACTUALIZADA CON SUPABASE
// ─────────────────────────────────────────────────────
// Ahora los lugares destacados vienen de Supabase
// ─────────────────────────────────────────────────────

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import CardLugar from "@/components/CardLugar";
import "@/styles/home.css";

// Estadísticas estáticas (en Fase 8 las hacemos dinámicas con COUNT)
// 🔧 PERSONALIZABLE
const STATS = [
  { value: "45,200", label: "Habitantes", color: "blue" },
  { value: "320 km²", label: "Extensión", color: "yellow" },
  { value: "12", label: "Festividades/año", color: "cyan" },
  { value: "8", label: "Sitios turísticos", color: "red" },
];

export default function HomePage() {
  const [destacados, setDestacados] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── CARGAR LUGARES DESTACADOS ──
  // 🔧 Conecta con: tabla public.lugares WHERE destacado = true
  useEffect(() => {
    async function cargarDestacados() {
      const { data } = await supabase
        .from("lugares")
        .select("*")
        .eq("activo", true)
        .eq("destacado", true) // Solo los marcados como destacados
        .limit(3) // Máximo 3 en el home
        .order("created_at", { ascending: false });

      setDestacados(data || []);
      setLoading(false);
    }
    cargarDestacados();
  }, []);

  return (
    <div>
      {/* ── HERO ── */}
      {/* 🔧 PERSONALIZABLE: Cambia la imagen por tu distrito */}
      <section className="hero">
        <img
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80"
          alt="Valle de los Vientos"
          className="hero-image"
        />
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1 className="hero-title">Valle de los Vientos</h1>
          <p className="hero-description">
            Un distrito envuelto en montañas, brumas y tradiciones milenarias.
            Sus valles fértiles, sus fiestas vibrantes y la calidez de su gente
            lo convierten en un destino que no olvidas.
          </p>
        </div>
      </section>

      {/* ── ESTADÍSTICAS ── */}
      <div className="stats-grid">
        {STATS.map((stat, i) => (
          <div key={i} className="stat-card">
            <div className={`stat-value ${stat.color}`}>{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ── SITIOS DESTACADOS ── */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Sitios Destacados</h2>
          <Link href="/lugares" className="section-link">
            Ver todos →
          </Link>
        </div>

        {loading ? (
          // Skeleton de 3 cards
          <div className="cards-grid">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  height: 280,
                  borderRadius: 12,
                  background:
                    "linear-gradient(90deg, #111 25%, #1a1a1a 50%, #111 75%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.5s infinite",
                  border: "1px solid #1f1f1f",
                }}
              />
            ))}
          </div>
        ) : destacados.length > 0 ? (
          // Cards reales de Supabase
          <div className="cards-grid">
            {destacados.map((lugar) => (
              <CardLugar key={lugar.id} lugar={lugar} variante="normal" />
            ))}
          </div>
        ) : (
          // Si no hay destacados aún
          <div className="empty-state">
            <p>No hay sitios destacados todavía.</p>
          </div>
        )}
      </section>
    </div>
  );
}
