// app/hoteles/page.js
// ─────────────────────────────────────────────────────
// PÁGINA: Hoteles — Ruta: /hoteles
// Replica EXACTAMENTE la segunda imagen de referencia:
// - Header "Hoteles" + subtítulo + botón "Inicia sesión"
// - Cards horizontales con imagen, precio amarillo y amenidades
//
// 🔧 Conecta con: tabla public.negocios WHERE tipo = 'hotel'
// ─────────────────────────────────────────────────────

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getHoteles } from "@/app/actions/negocios";
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

function SkeletonHoteles() {
  return (
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
            <div className="skeleton-line short" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HotelesPage() {
  const { user } = useAuth();
  const [hoteles, setHoteles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🔧 Conecta con: tabla negocios WHERE tipo = 'hotel'
  useEffect(() => {
    async function cargarHoteles() {
      try {
        const data = await getHoteles();
        setHoteles(data || []);
      } catch (err) {
        console.error("Error cargando hoteles:", err);
        setError("No pudimos cargar los hoteles.");
      } finally {
        setLoading(false);
      }
    }
    cargarHoteles();
  }, []);

  return (
    <div>
      {/* ── HEADER (réplica exacta de la imagen de referencia) ── */}
      <div className="negocios-page-header">
        <div className="negocios-page-header-text">
          <h1>Hoteles</h1>
          <p>Alojamiento en el Valle de los Vientos.</p>
        </div>
        {!user && (
          <Link href="/login" className="btn-header-login">
            <IconLogin />
            Inicia sesión
          </Link>
        )}
      </div>

      {/* ── CONTENIDO ── */}
      {loading ? (
        <SkeletonHoteles />
      ) : error ? (
        <div className="empty-negocios">
          <div className="empty-negocios-icon">⚠️</div>
          <h3>Error al cargar</h3>
          <p>{error}</p>
        </div>
      ) : hoteles.length === 0 ? (
        <div className="empty-negocios">
          <div className="empty-negocios-icon">🏨</div>
          <h3>Sin hoteles registrados</h3>
          <p>Pronto habrá opciones de alojamiento disponibles.</p>
        </div>
      ) : (
        /*
          Variante horizontal: imagen a la izquierda
          Replica exactamente la segunda imagen de referencia
        */
        <div className="negocios-lista">
          {hoteles.map((hotel) => (
            <CardNegocio key={hotel.id} negocio={hotel} variante="horizontal" />
          ))}
        </div>
      )}
    </div>
  );
}
