// app/negocios/page.js
"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { getNegociosPagina } from "@/app/actions/negocios";
import { useAuth } from "@/context/AuthContext";
import CardNegocio from "@/components/CardNegocio";
import "@/styles/negocios.css";

const POR_PAGINA = 6;

const TIPOS = [
  { valor: "todos", label: "Todos", emoji: "🏪" },
  { valor: "cafe", label: "Cafés", emoji: "☕" },
  { valor: "tienda", label: "Tiendas", emoji: "🛍️" },
  { valor: "servicio", label: "Servicios", emoji: "⚙️" },
  { valor: "transporte", label: "Transporte", emoji: "🚐" },
];

const IconLogin = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <polyline points="10,17 15,12 10,7" />
    <line x1="15" y1="12" x2="3" y2="12" />
  </svg>
);

function SkeletonNegocios() {
  return (
    <div className="negocios-grid">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="skeleton-negocio">
          <div className="skeleton-negocio-img" style={{ height: 210 }} />
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

  const [negocios, setNegocios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tipo, setTipo] = useState("todos");
  const [pagina, setPagina] = useState(1);

  // ── CARGAR NEGOCIOS ──
  useEffect(() => {
    async function cargar() {
      try {
        const data = await getNegociosPagina();
        setNegocios(data || []);
      } catch (err) {
        console.error(err);
        setError("No pudimos cargar los negocios.");
      } finally {
        setLoading(false);
      }
    }
    cargar();
  }, []);

  // ── FILTRAR POR TIPO ──
  const filtrados = useMemo(() => {
    if (tipo === "todos") return negocios;
    return negocios.filter((n) => n.tipo === tipo);
  }, [tipo, negocios]);

  // ── PAGINAR (igual que en admin lugares) ──
  const totalPaginas = Math.ceil(filtrados.length / POR_PAGINA);
  const negociosPagina = filtrados.slice(
    (pagina - 1) * POR_PAGINA,
    pagina * POR_PAGINA,
  );

  // Resetear página al cambiar filtro
  useEffect(() => setPagina(1), [tipo]);

  return (
    <div>
      {/* ── HEADER ── */}
      <div className="negocios-page-header">
        <div className="negocios-page-header-text">
          <h1>Negocios</h1>
          <p>Servicios, comercios y establecimientos en Pampas.</p>
        </div>
        {!user && (
          <Link href="/login" className="btn-header-login">
            <IconLogin /> Inicia sesión
          </Link>
        )}
      </div>

      {/* ── FILTROS ── */}
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
        {!loading && (
          <span className="negocios-count">
            {filtrados.length} {filtrados.length === 1 ? "resultado" : "resultados"}
          </span>
        )}
      </div>

      {/* ── CONTENIDO ── */}
      {loading ? (
        <SkeletonNegocios />
      ) : error ? (
        <div className="empty-negocios">
          <div className="empty-negocios-icon">⚠️</div>
          <h3>Error al cargar</h3>
          <p>{error}</p>
        </div>
      ) : filtrados.length === 0 ? (
        <div className="negocios-grid">
          <div className="empty-negocios">
            <div className="empty-negocios-icon">🏪</div>
            <h3>Sin resultados</h3>
            <p>No encontramos negocios en esta categoría.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="negocios-grid">
            {negociosPagina.map((negocio) => (
              <CardNegocio key={negocio.id} negocio={negocio} />
            ))}
          </div>

          {/* ── PAGINACIÓN (igual que admin lugares) ── */}
          {totalPaginas > 1 && (
            <div className="tabla-paginacion">
              <span>Página {pagina} de {totalPaginas}</span>
              <div className="tabla-paginacion-btns">
                <button className="btn-pag" onClick={() => setPagina(1)} disabled={pagina === 1}>«</button>
                <button className="btn-pag" onClick={() => setPagina((p) => p - 1)} disabled={pagina === 1}>‹</button>
                {Array.from({ length: totalPaginas }, (_, i) => i + 1)
                  .filter((p) => Math.abs(p - pagina) <= 2)
                  .map((p) => (
                    <button
                      key={p}
                      className={`btn-pag ${p === pagina ? "activo" : ""}`}
                      onClick={() => setPagina(p)}
                    >
                      {p}
                    </button>
                  ))}
                <button className="btn-pag" onClick={() => setPagina((p) => p + 1)} disabled={pagina === totalPaginas}>›</button>
                <button className="btn-pag" onClick={() => setPagina(totalPaginas)} disabled={pagina === totalPaginas}>»</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}