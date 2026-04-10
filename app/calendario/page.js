// app/calendario/page.js
// ─────────────────────────────────────────────────────
// PÁGINA: Calendario de Festividades
// Timeline vertical que alterna izquierda/derecha
// ─────────────────────────────────────────────────────

"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import "@/styles/calendario.css";

// Nombres de meses en español
const MESES_ES = [
  "",
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

// Meses abreviados para los filtros
const MESES_CORTOS = [
  "",
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

// Formatear fecha legible
function formatearFecha(fechaStr, fechaFinStr) {
  const f = new Date(fechaStr + "T12:00:00");
  const dia = f.getDate();
  const mes = MESES_ES[f.getMonth() + 1];
  const anio = f.getFullYear();

  if (!fechaFinStr) return `${dia} de ${mes}, ${anio}`;

  const ff = new Date(fechaFinStr + "T12:00:00");
  const diaFin = ff.getDate();
  const mesFin = MESES_ES[ff.getMonth() + 1];

  if (mes === mesFin) return `${dia} – ${diaFin} de ${mes}, ${anio}`;
  return `${dia} ${mes} – ${diaFin} ${mesFin}, ${anio}`;
}

// Calcular duración en días
function calcularDuracion(fechaStr, fechaFinStr) {
  if (!fechaFinStr) return null;
  const inicio = new Date(fechaStr);
  const fin = new Date(fechaFinStr);
  const dias = Math.round((fin - inicio) / 86400000) + 1;
  return `${dias} días`;
}

// Skeleton de un item del timeline
function SkeletonItem({ lado }) {
  return (
    <div className={`timeline-item ${lado}`}>
      {lado === "izquierda" && (
        <div className="timeline-skeleton-card" style={{ opacity: 0.4 }}>
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <div className="skel-circle" />
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 7,
              }}
            >
              <div className="skel-line" style={{ width: "45%", height: 9 }} />
              <div className="skel-line" style={{ width: "75%", height: 13 }} />
            </div>
          </div>
          <div
            className="skel-line"
            style={{ width: "100%", marginBottom: 7 }}
          />
          <div className="skel-line" style={{ width: "80%" }} />
        </div>
      )}

      <div className="timeline-nodo">
        <div className="timeline-nodo-circulo" style={{ opacity: 0.3 }} />
      </div>

      {lado === "derecha" && (
        <div className="timeline-skeleton-card" style={{ opacity: 0.4 }}>
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <div className="skel-circle" />
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 7,
              }}
            >
              <div className="skel-line" style={{ width: "45%", height: 9 }} />
              <div className="skel-line" style={{ width: "75%", height: 13 }} />
            </div>
          </div>
          <div
            className="skel-line"
            style={{ width: "100%", marginBottom: 7 }}
          />
          <div className="skel-line" style={{ width: "80%" }} />
        </div>
      )}
    </div>
  );
}

export default function CalendarioPage() {
  const [festividades, setFestividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mesFiltro, setMesFiltro] = useState(0); // 0 = todos

  // 🔧 Conecta con: tabla public.festividades
  useEffect(() => {
    async function cargar() {
      const { data } = await supabase
        .from("festividades")
        .select(
          "id, titulo, subtitulo, fecha, fecha_fin, descripcion_corta, imagen_card, color_acento",
        )
        .eq("activo", true)
        .order("fecha", { ascending: true });

      setFestividades(data || []);
      setLoading(false);
    }
    cargar();
  }, []);

  // Filtrar por mes
  const filtradas = useMemo(() => {
    if (mesFiltro === 0) return festividades;
    return festividades.filter((f) => {
      const m = new Date(f.fecha + "T12:00:00").getMonth() + 1;
      return m === mesFiltro;
    });
  }, [festividades, mesFiltro]);

  // Agrupar por mes para los separadores
  const porMes = useMemo(() => {
    const grupos = {};
    filtradas.forEach((f) => {
      const d = new Date(f.fecha + "T12:00:00");
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      if (!grupos[key])
        grupos[key] = {
          mes: d.getMonth() + 1,
          anio: d.getFullYear(),
          items: [],
        };
      grupos[key].items.push(f);
    });
    return Object.values(grupos);
  }, [filtradas]);

  // Meses que tienen festividades (para el filtro)
  const mesesConFest = useMemo(() => {
    const set = new Set(
      festividades.map((f) => new Date(f.fecha + "T12:00:00").getMonth() + 1),
    );
    return Array.from(set).sort((a, b) => a - b);
  }, [festividades]);

  return (
    <div className="calendario-root">
      {/* ── HEADER ── */}
      <div className="calendario-header">
        <span className="calendario-pretitulo">Valle de los Vientos</span>
        <h1 className="calendario-titulo">
          Calendario de <em>Festividades</em>
        </h1>
        <p className="calendario-subtitulo">
          Las celebraciones que dan vida y memoria al distrito a lo largo del
          año.
        </p>
        <div className="calendario-ornamento">
          <div className="cal-orn-line" />
          <span className="cal-orn-symbol">✦</span>
          <div className="cal-orn-line right" />
        </div>
      </div>

      {/* ── FILTRO DE MESES ── */}
      {!loading && mesesConFest.length > 1 && (
        <div className="calendario-meses">
          <button
            className={`mes-btn ${mesFiltro === 0 ? "activo" : ""}`}
            onClick={() => setMesFiltro(0)}
          >
            Todo el año
          </button>
          {mesesConFest.map((m) => (
            <button
              key={m}
              className={`mes-btn ${mesFiltro === m ? "activo" : ""}`}
              onClick={() => setMesFiltro(m)}
            >
              {MESES_CORTOS[m]}
            </button>
          ))}
        </div>
      )}

      {/* ── TIMELINE ── */}
      <div className="timeline-wrapper">
        {loading ? (
          // Skeleton
          ["izquierda", "derecha", "izquierda"].map((lado, i) => (
            <SkeletonItem key={i} lado={lado} />
          ))
        ) : filtradas.length === 0 ? (
          <div className="calendario-vacio">
            <p>No hay festividades en este período.</p>
          </div>
        ) : (
          // Renderizar agrupado por mes
          porMes.map((grupo) => (
            <div key={`${grupo.anio}-${grupo.mes}`}>
              {/* Separador de mes */}
              <div className="timeline-mes-label">
                <div className="timeline-mes-label-inner">
                  {MESES_ES[grupo.mes]} {grupo.anio}
                </div>
              </div>

              {/* Items del mes */}
              {grupo.items.map((fest, idx) => {
                // Alternar izquierda/derecha globalmente
                const posGlobal = filtradas.indexOf(fest);
                const lado = posGlobal % 2 === 0 ? "izquierda" : "derecha";
                const acento = fest.color_acento || "#c8952a";
                const duracion = calcularDuracion(fest.fecha, fest.fecha_fin);

                return (
                  <div key={fest.id} className={`timeline-item ${lado}`}>
                    {/* ── CARD (lado izquierdo) ── */}
                    {lado === "izquierda" && (
                      <Link
                        href={`/calendario/${fest.id}`}
                        className="timeline-card"
                        style={{ textAlign: "right" }}
                      >
                        <div
                          className="timeline-card-inner"
                          style={{ "--card-acento": acento }}
                        >
                          {/* Top: foto redonda + títulos (en reverse para izquierda) */}
                          <div
                            className="timeline-card-top"
                            style={{ flexDirection: "row-reverse" }}
                          >
                            {fest.imagen_card ? (
                              <img
                                src={fest.imagen_card}
                                alt={fest.titulo}
                                className="timeline-foto-redonda"
                              />
                            ) : (
                              <div className="timeline-foto-placeholder">
                                🎊
                              </div>
                            )}
                            <div
                              className="timeline-card-meta"
                              style={{ textAlign: "right" }}
                            >
                              <span className="timeline-fecha-tag">
                                {formatearFecha(fest.fecha, fest.fecha_fin)}
                              </span>
                              <div className="timeline-titulo">
                                {fest.titulo}
                              </div>
                            </div>
                          </div>

                          {/* Descripción corta */}
                          {fest.descripcion_corta && (
                            <p className="timeline-desc">
                              {fest.descripcion_corta}
                            </p>
                          )}

                          {/* Duración */}
                          {duracion && (
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "flex-end",
                              }}
                            >
                              <span className="timeline-duracion">
                                📅 {duracion}
                              </span>
                            </div>
                          )}

                          {/* Ver más */}
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "flex-end",
                            }}
                          >
                            <span className="timeline-ver-mas">leer más ←</span>
                          </div>
                        </div>
                      </Link>
                    )}

                    {/* ── NODO CENTRAL ── */}
                    <div className="timeline-nodo">
                      <div
                        className="timeline-nodo-circulo"
                        style={{ "--nodo-color": acento }}
                      />
                    </div>

                    {/* ── CARD (lado derecho) ── */}
                    {lado === "derecha" && (
                      <Link
                        href={`/calendario/${fest.id}`}
                        className="timeline-card"
                      >
                        <div
                          className="timeline-card-inner"
                          style={{ "--card-acento": acento }}
                        >
                          {/* Top: foto redonda + títulos */}
                          <div className="timeline-card-top">
                            {fest.imagen_card ? (
                              <img
                                src={fest.imagen_card}
                                alt={fest.titulo}
                                className="timeline-foto-redonda"
                              />
                            ) : (
                              <div className="timeline-foto-placeholder">
                                🎊
                              </div>
                            )}
                            <div className="timeline-card-meta">
                              <span className="timeline-fecha-tag">
                                {formatearFecha(fest.fecha, fest.fecha_fin)}
                              </span>
                              <div className="timeline-titulo">
                                {fest.titulo}
                              </div>
                            </div>
                          </div>

                          {fest.descripcion_corta && (
                            <p className="timeline-desc">
                              {fest.descripcion_corta}
                            </p>
                          )}

                          {duracion && (
                            <span className="timeline-duracion">
                              📅 {duracion}
                            </span>
                          )}

                          <span className="timeline-ver-mas">leer más →</span>
                        </div>
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
