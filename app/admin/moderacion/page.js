// app/admin/moderacion/page.js
// Panel de moderación — admin aprueba o rechaza publicaciones

"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import BadgeEstado from "@/components/BadgeEstado";
import "@/styles/admin.css";
import "@/styles/moderacion.css";

const TIPOS = [
  {
    id: "experiencias",
    label: "Experiencias",
    emoji: "📸",
    tabla: "experiencias",
    campoUser: "user_id",
  },
  {
    id: "productos",
    label: "Productos",
    emoji: "📦",
    tabla: "productos",
    campoUser: "user_id",
  },
  {
    id: "negocios",
    label: "Negocios",
    emoji: "🏪",
    tabla: "negocios",
    campoUser: "creado_por",
  },
  {
    id: "lugares",
    label: "Lugares",
    emoji: "🗺️",
    tabla: "lugares",
    campoUser: "creado_por",
  },
];

const FILTROS_ESTADO = ["pendiente", "aprobado", "rechazado"];

function tiempoRelativo(iso) {
  const diff = Date.now() - new Date(iso);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (h < 1) return "hace menos de 1h";
  if (h < 24) return `hace ${h}h`;
  if (d === 1) return "ayer";
  return `hace ${d} días`;
}

export default function ModeracionPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();

  const [tipoActivo, setTipoActivo] = useState("experiencias");
  const [filtroEstado, setFiltroEstado] = useState("pendiente");
  const [items, setItems] = useState([]);
  const [conteos, setConteos] = useState({});
  const [loading, setLoading] = useState(true);
  // ID del item con el input de rechazo abierto
  const [rechazandoId, setRechazandoId] = useState(null);
  const [notaRechazo, setNotaRechazo] = useState("");
  const [procesando, setProcesando] = useState(null); // ID en proceso
  const [toast, setToast] = useState("");

  const mostrarToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // ── CARGAR CONTEOS DE PENDIENTES ──
  // Para los badges de los tabs
  const cargarConteos = useCallback(async () => {
    const results = await Promise.all(
      TIPOS.map(async (t) => {
        const { count } = await supabase
          .from(t.tabla)
          .select("id", { count: "exact", head: true })
          .eq("estado", "pendiente");
        return [t.id, count || 0];
      }),
    );
    setConteos(Object.fromEntries(results));
  }, []);

  // ── CARGAR ITEMS DE LA TAB ACTIVA ──
  // 🔧 Conecta con: tabla dinámica según tipoActivo
  const cargarItems = useCallback(async () => {
    setLoading(true);
    try {
      const tipo = TIPOS.find((t) => t.id === tipoActivo);
      if (!tipo) return;

      let query = supabase
        .from(tipo.tabla)
        .select(
          `*, perfil:profiles!${tipo.tabla}_${tipo.campoUser}_fkey(nombre, avatar_url)`,
        )
        .eq("estado", filtroEstado)
        .order("created_at", { ascending: filtroEstado === "pendiente" }); // Pendientes: más viejos primero

      const { data, error } = await query;
      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      console.error(err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [tipoActivo, filtroEstado]);

  useEffect(() => {
    if (isAdmin) {
      cargarItems();
      cargarConteos();
    }
  }, [isAdmin, cargarItems, cargarConteos]);

  // ── APROBAR ──
  // 🔧 Conecta con: UPDATE tabla SET estado='aprobado' WHERE id
  async function aprobar(item) {
    setProcesando(item.id);
    try {
      const tipo = TIPOS.find((t) => t.id === tipoActivo);
      const { error } = await supabase
        .from(tipo.tabla)
        .update({ estado: "aprobado", nota_rechazo: null })
        .eq("id", item.id);

      if (error) throw error;

      setItems((prev) => prev.filter((i) => i.id !== item.id));
      cargarConteos();
      const nombre = item.titulo || item.nombre || "Publicación";
      mostrarToast(`✅ "${nombre}" aprobado y publicado.`);
    } catch (err) {
      alert("Error al aprobar: " + err.message);
    } finally {
      setProcesando(null);
    }
  }

  // ── RECHAZAR ──
  // 🔧 Conecta con: UPDATE tabla SET estado='rechazado', nota_rechazo WHERE id
  async function rechazar(item) {
    if (!notaRechazo.trim()) {
      alert("Escribe una razón para el rechazo (el usuario la verá).");
      return;
    }
    setProcesando(item.id);
    try {
      const tipo = TIPOS.find((t) => t.id === tipoActivo);
      const { error } = await supabase
        .from(tipo.tabla)
        .update({ estado: "rechazado", nota_rechazo: notaRechazo.trim() })
        .eq("id", item.id);

      if (error) throw error;

      setItems((prev) => prev.filter((i) => i.id !== item.id));
      setRechazandoId(null);
      setNotaRechazo("");
      cargarConteos();
      const nombre = item.titulo || item.nombre || "Publicación";
      mostrarToast(`❌ "${nombre}" rechazado.`);
    } catch (err) {
      alert("Error al rechazar: " + err.message);
    } finally {
      setProcesando(null);
    }
  }

  // ── RENDER DE UN ITEM ──
  function renderItem(item) {
    const esProcesando = procesando === item.id;
    const esRechazando = rechazandoId === item.id;
    const titulo = item.titulo || item.nombre || "(sin título)";
    const tipo = TIPOS.find((t) => t.id === tipoActivo);

    return (
      <div key={item.id} className={`mod-card ${item.estado}`}>
        {/* Header: autor + tipo + estado */}
        <div className="mod-card-header">
          <div className="mod-card-autor">
            <div className="mod-autor-avatar">
              {item.perfil?.avatar_url ? (
                <img
                  src={item.perfil.avatar_url}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "50%",
                  }}
                  alt=""
                />
              ) : (
                <span>{(item.perfil?.nombre || "U")[0].toUpperCase()}</span>
              )}
            </div>
            <div>
              <span className="mod-autor-nombre">
                {item.perfil?.nombre || "Usuario"}
              </span>
              <span className="mod-autor-fecha">
                {tiempoRelativo(item.created_at)}
              </span>
            </div>
          </div>
          <div className="mod-card-meta">
            <span className="mod-tipo-badge">
              {tipo?.emoji} {tipo?.label.slice(0, -1)}
            </span>
            <BadgeEstado estado={item.estado} />
          </div>
        </div>

        {/* Cuerpo */}
        <div className="mod-card-body">
          {/* Imagen */}
          {item.imagen_url && (
            <img
              src={item.imagen_url}
              alt=""
              className="mod-card-img"
              onClick={() => window.open(item.imagen_url, "_blank")}
            />
          )}

          {/* Título para lugares/negocios/productos */}
          {(item.titulo || item.nombre) && (
            <div className="mod-card-titulo">{titulo}</div>
          )}

          {/* Texto de experiencias */}
          {item.contenido && <p className="mod-card-texto">{item.contenido}</p>}

          {/* Descripción de otros tipos */}
          {item.descripcion && (
            <p className="mod-card-texto" style={{ fontSize: 13 }}>
              {item.descripcion}
            </p>
          )}

          {/* Datos extra */}
          <div className="mod-card-datos">
            {item.categoria && (
              <div className="mod-dato">
                <span className="mod-dato-label">Categoría</span>
                <span
                  className="mod-dato-valor"
                  style={{ textTransform: "capitalize" }}
                >
                  {item.categoria}
                </span>
              </div>
            )}
            {item.tipo && (
              <div className="mod-dato">
                <span className="mod-dato-label">Tipo</span>
                <span
                  className="mod-dato-valor"
                  style={{ textTransform: "capitalize" }}
                >
                  {item.tipo}
                </span>
              </div>
            )}
            {item.precio_desde && (
              <div className="mod-dato">
                <span className="mod-dato-label">Precio desde</span>
                <span className="mod-dato-valor">${item.precio_desde} MXN</span>
              </div>
            )}
            {item.precio && (
              <div className="mod-dato">
                <span className="mod-dato-label">Precio</span>
                <span className="mod-dato-valor">${item.precio} MXN</span>
              </div>
            )}
            {item.direccion && (
              <div className="mod-dato">
                <span className="mod-dato-label">Dirección</span>
                <span className="mod-dato-valor">{item.direccion}</span>
              </div>
            )}
            {item.ubicacion && (
              <div className="mod-dato">
                <span className="mod-dato-label">Ubicación</span>
                <span className="mod-dato-valor">{item.ubicacion}</span>
              </div>
            )}
            {item.telefono && (
              <div className="mod-dato">
                <span className="mod-dato-label">Teléfono</span>
                <span className="mod-dato-valor">{item.telefono}</span>
              </div>
            )}
            {item.contacto && (
              <div className="mod-dato">
                <span className="mod-dato-label">Contacto</span>
                <span className="mod-dato-valor">{item.contacto}</span>
              </div>
            )}
          </div>

          {/* Nota de rechazo si ya existe */}
          {item.nota_rechazo && (
            <div className="mod-nota-rechazo">
              <strong>Razón del rechazo:</strong> {item.nota_rechazo}
            </div>
          )}
        </div>

        {/* Footer: botones de acción */}
        {filtroEstado === "pendiente" && (
          <div className="mod-card-footer" style={{ flexWrap: "wrap" }}>
            {esRechazando ? (
              // Input de razón de rechazo
              <div className="rechazo-input-wrapper">
                <input
                  type="text"
                  className="rechazo-input"
                  placeholder="Razón del rechazo (el usuario la verá)..."
                  value={notaRechazo}
                  onChange={(e) => setNotaRechazo(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && rechazar(item)}
                  autoFocus
                />
                <button
                  className="btn-rechazar"
                  onClick={() => rechazar(item)}
                  disabled={esProcesando || !notaRechazo.trim()}
                >
                  {esProcesando ? "..." : "❌ Confirmar rechazo"}
                </button>
                <button
                  onClick={() => {
                    setRechazandoId(null);
                    setNotaRechazo("");
                  }}
                  style={{
                    padding: "7px 12px",
                    background: "none",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    color: "#555",
                    fontFamily: "var(--font-display)",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <>
                <button
                  className="btn-rechazar"
                  onClick={() => setRechazandoId(item.id)}
                  disabled={esProcesando}
                >
                  ❌ Rechazar
                </button>
                <button
                  className="btn-aprobar"
                  onClick={() => aprobar(item)}
                  disabled={esProcesando}
                >
                  {esProcesando ? "..." : "✅ Aprobar y publicar"}
                </button>
              </>
            )}
          </div>
        )}

        {/* Para aprobados/rechazados: opción de cambiar */}
        {filtroEstado !== "pendiente" && (
          <div className="mod-card-footer">
            {filtroEstado === "rechazado" && (
              <button
                className="btn-aprobar"
                onClick={() => aprobar(item)}
                disabled={esProcesando}
              >
                {esProcesando ? "..." : "✅ Aprobar igualmente"}
              </button>
            )}
            {filtroEstado === "aprobado" && (
              <button
                className="btn-rechazar"
                onClick={() => {
                  setRechazandoId(item.id);
                }}
                disabled={esProcesando}
              >
                ❌ Revocar aprobación
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // ── GUARDS ──
  if (authLoading)
    return (
      <div
        style={{
          padding: 60,
          textAlign: "center",
          color: "#666",
          fontFamily: "var(--font-display)",
          fontSize: 13,
        }}
      >
        Verificando permisos...
      </div>
    );

  if (!isAdmin)
    return (
      <div className="admin-acceso-denegado">
        <h2>🔒 Sin permisos</h2>
        <p>Solo los administradores pueden moderar publicaciones.</p>
        <Link
          href="/"
          style={{
            color: "var(--color-blue)",
            fontFamily: "var(--font-display)",
          }}
        >
          ← Inicio
        </Link>
      </div>
    );

  const totalPendientes = Object.values(conteos).reduce((a, b) => a + b, 0);

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-titulo">
          Moderación
          {totalPendientes > 0 && (
            <span
              style={{
                padding: "3px 12px",
                borderRadius: 20,
                fontSize: 12,
                background: "rgba(255,74,74,0.15)",
                color: "#ff6b6b",
                border: "1px solid rgba(255,74,74,0.3)",
                fontFamily: "var(--font-display)",
              }}
            >
              {totalPendientes} pendientes
            </span>
          )}
        </h1>
        <p className="admin-page-sub">
          Revisa y aprueba el contenido enviado por los usuarios.
        </p>
      </div>

      <div className="admin-layout">
        <AdminSidebar />

        <div>
          {/* Tabs de tipo */}
          <div className="mod-tabs">
            {TIPOS.map((t) => {
              const count = conteos[t.id] || 0;
              return (
                <button
                  key={t.id}
                  className={`mod-tab ${tipoActivo === t.id ? "activo" : ""}`}
                  onClick={() => {
                    setTipoActivo(t.id);
                    setRechazandoId(null);
                  }}
                >
                  {t.emoji} {t.label}
                  {count > 0 && (
                    <span
                      className={`mod-tab-count ${count > 0 ? "urgente" : ""}`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Filtros de estado */}
          <div className="mod-filtros">
            {FILTROS_ESTADO.map((estado) => (
              <button
                key={estado}
                className={`mod-filtro-btn ${filtroEstado === estado ? "activo" : ""}`}
                onClick={() => {
                  setFiltroEstado(estado);
                  setRechazandoId(null);
                }}
              >
                {
                  {
                    pendiente: "⏳ Pendientes",
                    aprobado: "✅ Aprobados",
                    rechazado: "❌ Rechazados",
                  }[estado]
                }
              </button>
            ))}
          </div>

          {/* Lista de items */}
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="mod-card pendiente">
                <div className="mod-card-header">
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: "50%",
                        background:
                          "linear-gradient(90deg,#111 25%,#1a1a1a 50%,#111 75%)",
                        backgroundSize: "200% 100%",
                        animation: "shimmer 1.5s infinite",
                      }}
                    />
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 5,
                      }}
                    >
                      <div
                        style={{
                          width: 100,
                          height: 12,
                          borderRadius: 4,
                          background:
                            "linear-gradient(90deg,#111 25%,#1a1a1a 50%,#111 75%)",
                          backgroundSize: "200% 100%",
                          animation: "shimmer 1.5s infinite",
                        }}
                      />
                      <div
                        style={{
                          width: 60,
                          height: 9,
                          borderRadius: 4,
                          background:
                            "linear-gradient(90deg,#111 25%,#1a1a1a 50%,#111 75%)",
                          backgroundSize: "200% 100%",
                          animation: "shimmer 1.5s infinite",
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="mod-card-body">
                  <div
                    style={{
                      height: 80,
                      background:
                        "linear-gradient(90deg,#111 25%,#1a1a1a 50%,#111 75%)",
                      backgroundSize: "200% 100%",
                      animation: "shimmer 1.5s infinite",
                      borderRadius: 8,
                      marginBottom: 12,
                    }}
                  />
                  <div
                    style={{
                      height: 13,
                      width: "70%",
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
          ) : items.length === 0 ? (
            <div className="mod-vacio">
              <div className="mod-vacio-icon">
                {
                  { pendiente: "⏳", aprobado: "✅", rechazado: "❌" }[
                    filtroEstado
                  ]
                }
              </div>
              <h3>
                {
                  {
                    pendiente: "Sin pendientes",
                    aprobado: "Sin aprobados",
                    rechazado: "Sin rechazados",
                  }[filtroEstado]
                }
              </h3>
              <p>
                {
                  {
                    pendiente:
                      "¡Todo al día! No hay publicaciones esperando revisión.",
                    aprobado:
                      "Aún no has aprobado ningún contenido de este tipo.",
                    rechazado: "No hay publicaciones rechazadas.",
                  }[filtroEstado]
                }
              </p>
            </div>
          ) : (
            items.map((item) => renderItem(item))
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 999,
            background: "#1a1a1a",
            border: "1px solid #2a2a2a",
            borderRadius: 10,
            padding: "12px 20px",
            fontFamily: "var(--font-display)",
            fontSize: 13,
            color: "var(--color-text)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            maxWidth: 320,
            lineHeight: 1.5,
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
