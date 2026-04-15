// app/restaurantes/page.js
// ─────────────────────────────────────────────────────
// PÁGINA: Restaurantes — Ruta: /restaurantes
// Misma estructura que /hoteles pero filtra restaurantes
// 🔧 Conecta con: tabla public.negocios WHERE tipo = 'restaurante'
// ─────────────────────────────────────────────────────

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getRestaurantes } from "@/app/actions/negocios";
import { useAuth } from "@/context/AuthContext";
import CardNegocio from "@/components/CardNegocio";
import "@/styles/negocios.css";

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

export default function RestaurantesPage() {
  const { user } = useAuth();
  const [restaurantes, setRestaurantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🔧 Conecta con: tabla negocios WHERE tipo = 'restaurante'
  useEffect(() => {
    async function cargar() {
      try {
        const data = await getRestaurantes();
        setRestaurantes(data || []);
      } catch (err) {
        console.error(err);
        setError("No pudimos cargar los restaurantes.");
      } finally {
        setLoading(false);
      }
    }
    cargar();
  }, []);

  return (
    <div>
      <div className="negocios-page-header">
        <div className="negocios-page-header-text">
          <h1>Restaurantes</h1>
          <p>Gastronomía local en el Valle de los Vientos.</p>
        </div>
        {!user && (
          <Link href="/login" className="btn-header-login">
            <IconLogin /> Inicia sesión
          </Link>
        )}
      </div>

      {loading ? (
        <div className="negocios-lista">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="skeleton-negocio"
              style={{ display: "grid", gridTemplateColumns: "260px 1fr" }}
            >
              <div className="skeleton-negocio-img" style={{ height: 200 }} />
              <div className="skeleton-negocio-body" style={{ padding: 22 }}>
                <div className="skeleton-line medium" />
                <div className="skeleton-line short" />
                <div className="skeleton-line medium" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="empty-negocios">
          <div className="empty-negocios-icon">⚠️</div>
          <h3>Error al cargar</h3>
          <p>{error}</p>
        </div>
      ) : restaurantes.length === 0 ? (
        <div className="empty-negocios">
          <div className="empty-negocios-icon">🍽️</div>
          <h3>Sin restaurantes registrados</h3>
          <p>Próximamente habrá opciones gastronómicas disponibles.</p>
        </div>
      ) : (
        <div className="negocios-lista">
          {restaurantes.map((r) => (
            <CardNegocio key={r.id} negocio={r} variante="horizontal" />
          ))}
        </div>
      )}
    </div>
  );
}
