// app/caserios/page.js
// ─────────────────────────────────────────────────────
// PÁGINA: Lista de caseríos — Ruta: /caserios
// 🔧 Conecta con: tabla public.caserios
// ─────────────────────────────────────────────────────

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCaserios } from "@/app/actions/caserios";
import "@/styles/caserios.css";

function formatNum(n) {
  if (!n) return "—";
  return n.toLocaleString("es-PE");
}

export default function CaseriosPage() {
  const [caserios, setCaserios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargar() {
      try {
        const data = await getCaserios();

        setCaserios(data || []);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los caseríos.");
      } finally {
        setLoading(false);
      }
    }
    cargar();
  }, []);

  return (
    <div>
      {/* ── HEADER ── */}
      <div className="caserios-header">
        <h1>Caseríos y Centros Poblados</h1>
        <p>
          {loading
            ? "Cargando centros poblados..."
            : `${caserios.length} centros poblados en el Valle de los Vientos`}
        </p>
      </div>

      {/* ── GRID ── */}
      {loading ? (
        <div className="caserios-grid">
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
              <div
                style={{
                  height: 200,
                  background:
                    "linear-gradient(90deg,#111 25%,#1a1a1a 50%,#111 75%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.5s infinite",
                }}
              />
              <div
                style={{
                  padding: "14px 16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    height: 13,
                    width: "60%",
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
      ) : error ? (
        <div
          style={{
            textAlign: "center",
            padding: 80,
            color: "#555",
            fontFamily: "var(--font-display)",
            fontSize: 14,
          }}
        >
          ⚠️ {error}
        </div>
      ) : caserios.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: 80,
            color: "#444",
            fontFamily: "var(--font-display)",
            fontSize: 14,
          }}
        >
          🏘️ No hay caseríos registrados todavía.
        </div>
      ) : (
        <div className="caserios-grid">
          {caserios.map((caserio) => (
            <Link
              key={caserio.id}
              href={`/caserios/${caserio.id}`}
              className="card-caserio"
            >
              {/* Imagen */}
              <div className="card-caserio-img-wrapper">
                <img
                  src={
                    caserio.imagen_url ||
                    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=70"
                  }
                  alt={caserio.nombre}
                  className="card-caserio-img"
                  loading="lazy"
                />
                <div className="card-caserio-overlay" />

                {/* Altitud */}
                {caserio.altitud && (
                  <span className="card-caserio-altitud">
                    ↑ {formatNum(caserio.altitud)} msnm
                  </span>
                )}

                {/* Destacado */}
                {caserio.destacado && (
                  <span className="card-caserio-star">★</span>
                )}

                {/* Nombre sobre la imagen */}
                <div className="card-caserio-nombre-img">{caserio.nombre}</div>
              </div>

              {/* Cuerpo */}
              <div className="card-caserio-body">
                {caserio.descripcion && (
                  <p className="card-caserio-desc">{caserio.descripcion}</p>
                )}

                {/* Stats */}
                <div className="card-caserio-stats">
                  {caserio.poblacion && (
                    <div className="card-caserio-stat">
                      <span className="card-caserio-stat-valor">
                        {formatNum(caserio.poblacion)}
                      </span>
                      <span className="card-caserio-stat-label">
                        habitantes
                      </span>
                    </div>
                  )}
                  {caserio.distancia_km !== null && (
                    <div className="card-caserio-stat">
                      <span className="card-caserio-stat-valor">
                        {caserio.distancia_km === 0
                          ? "Capital"
                          : `${caserio.distancia_km} km`}
                      </span>
                      <span className="card-caserio-stat-label">
                        del centro
                      </span>
                    </div>
                  )}
                  {caserio.altitud && (
                    <div className="card-caserio-stat">
                      <span className="card-caserio-stat-valor">
                        {formatNum(caserio.altitud)}m
                      </span>
                      <span className="card-caserio-stat-label">altitud</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
