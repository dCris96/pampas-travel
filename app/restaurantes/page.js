// app/restaurantes/page.js
"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { getRestaurantes } from "@/app/actions/negocios";
import { useAuth } from "@/context/AuthContext";
import CardNegocio from "@/components/CardNegocio";
import "@/styles/negocios.css";

const POR_PAGINA = 6;

const IconLogin = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <polyline points="10,17 15,12 10,7" />
    <line x1="15" y1="12" x2="3" y2="12" />
  </svg>
);

function SkeletonRestaurantes() {
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

export default function RestaurantesPage() {
  const { user } = useAuth();
  const [restaurantes, setRestaurantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagina, setPagina] = useState(1);

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

  const totalPaginas = Math.ceil(restaurantes.length / POR_PAGINA);
  const restaurantesPagina = restaurantes.slice(
    (pagina - 1) * POR_PAGINA,
    pagina * POR_PAGINA,
  );

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
        <SkeletonRestaurantes />
      ) : error ? (
        <div className="empty-negocios">
          <div className="empty-negocios-icon">⚠️</div>
          <h3>Error al cargar</h3>
          <p>{error}</p>
        </div>
      ) : restaurantes.length === 0 ? (
        <div className="negocios-grid">
          <div className="empty-negocios">
            <div className="empty-negocios-icon">🍽️</div>
            <h3>Sin restaurantes registrados</h3>
            <p>Próximamente habrá opciones gastronómicas disponibles.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="negocios-grid">
            {restaurantesPagina.map((r) => (
              <CardNegocio key={r.id} negocio={r} />
            ))}
          </div>

          {totalPaginas > 1 && (
            <div className="tabla-paginacion">
              <span>Página {pagina} de {totalPaginas}</span>
              <div className="tabla-paginacion-btns">
                <button className="btn-pag" onClick={() => setPagina(1)} disabled={pagina === 1}>«</button>
                <button className="btn-pag" onClick={() => setPagina((p) => p - 1)} disabled={pagina === 1}>‹</button>
                {Array.from({ length: totalPaginas }, (_, i) => i + 1)
                  .filter((p) => Math.abs(p - pagina) <= 2)
                  .map((p) => (
                    <button key={p} className={`btn-pag ${p === pagina ? "activo" : ""}`} onClick={() => setPagina(p)}>{p}</button>
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