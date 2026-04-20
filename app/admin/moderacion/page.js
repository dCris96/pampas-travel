// app/admin/moderacion/page.js
// ─────────────────────────────────────────────────────
// Panel de moderación de contenido generado por usuarios.
// Solo modera: experiencias, productos, negocios.
//
// Cambios respecto al código original:
//   ✓ Eliminado setRechazandoId (variable inexistente)
//   ✓ Supabase calls movidos a Server Actions en /app/actions/moderacion.js
//   ✓ Join a profiles simplificado (sin sintaxis de FK explícita)
//   ✓ createClient eliminado del cliente — solo se usa en actions
//   ✓ Corrección de var no declaradas
// ─────────────────────────────────────────────────────

"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import BadgeEstado from "@/components/BadgeEstado";
import ModalModerar from "@/components/admin/ModalModerar";

// Server Actions — toda escritura/lectura pasa por aquí
import {
  cargarConteos,
  cargarItems,
  aprobarItem,
  rechazarItem,
} from "@/app/actions/moderacion";

import "@/styles/admin.css";
import "@/styles/moderacion.css";
import "@/styles/tabla-admin.css";

// ── CONFIGURACIÓN DE TIPOS MODERABLES ──
// Solo estos tres. Agregar aquí si en el futuro hay más.
const TIPOS = [
  {
    id: "experiencias",
    label: "Experiencias",
    emoji: "📸",
    tabla: "experiencias",
    campoUser: "user_id",
    campoNombre: "titulo",
  },
  {
    id: "productos",
    label: "Productos",
    emoji: "📦",
    tabla: "productos",
    campoUser: "user_id",
    campoNombre: "nombre",
  },
  {
    id: "negocios",
    label: "Negocios",
    emoji: "🏪",
    tabla: "negocios",
    campoUser: "creado_por",
    campoNombre: "nombre",
  },
];

const FILTROS_ESTADO = ["pendiente", "aprobado", "rechazado"];
const POR_PAGINA = 10;

// ── HELPER: tiempo relativo ──
function tiempoRelativo(iso) {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  const d = Math.floor(diff / 86_400_000);
  if (h < 1) return "hace menos de 1h";
  if (h < 24) return `hace ${h}h`;
  if (d === 1) return "ayer";
  return `hace ${d} días`;
}

// ── COMPONENTE PRINCIPAL ──
export default function ModeracionPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();

  // Qué tipo de contenido se está viendo
  const [tipoActivo, setTipoActivo] = useState("experiencias");
  // Filtro de estado: pendiente | aprobado | rechazado
  const [filtroEstado, setFiltroEstado] = useState("pendiente");

  // Datos
  const [items, setItems] = useState([]);
  const [conteos, setConteos] = useState({});

  // UI
  const [loading, setLoading] = useState(true);
  const [pagina, setPagina] = useState(1);
  const [modalItem, setModalItem] = useState(null); // ítem en modal de vista
  const [rejectModal, setRejectModal] = useState(null); // { item, reason }
  const [procesando, setProcesando] = useState(null); // id del ítem en proceso
  const [toast, setToast] = useState("");

  // ── Toast helper ──
  function mostrarToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  // ── Cargar conteos de pendientes ──
  // 🔧 Llama a Server Action — no hay Supabase en el cliente
  const refrescarConteos = useCallback(async () => {
    try {
      const data = await cargarConteos();
      setConteos(data);
    } catch (err) {
      console.error("Error cargando conteos:", err);
    }
  }, []);

  // ── Cargar ítems del tipo y estado activos ──
  const refrescarItems = useCallback(async () => {
    setLoading(true);
    try {
      const tipo = TIPOS.find((t) => t.id === tipoActivo);
      if (!tipo) return;

      const { data, error } = await cargarItems({
        tabla: tipo.tabla,
        estado: filtroEstado,
      });

      if (error) {
        console.error("Error cargando ítems:", error);
        setItems([]);
      } else {
        setItems(data);
      }
      setPagina(1);
    } finally {
      setLoading(false);
    }
  }, [tipoActivo, filtroEstado]);

  // Carga inicial y cuando cambia tipo o filtro
  useEffect(() => {
    if (!isAdmin) return;
    refrescarItems();
    refrescarConteos();
  }, [isAdmin, refrescarItems, refrescarConteos]);

  // ── APROBAR ──
  async function aprobar(item) {
    setProcesando(item.id);
    try {
      const tipo = TIPOS.find((t) => t.id === tipoActivo);
      const result = await aprobarItem({ tabla: tipo.tabla, id: item.id });

      if (!result.ok) throw new Error(result.error);

      // Quitar el ítem de la lista local sin recargar todo
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      refrescarConteos();

      const nombre = item.titulo ?? item.nombre ?? "Publicación";
      mostrarToast(`✅ "${nombre}" aprobado.`);
    } catch (err) {
      alert("Error al aprobar: " + err.message);
    } finally {
      setProcesando(null);
    }
  }

  // ── RECHAZAR (requiere motivo) ──
  async function confirmarRechazo(item, motivo) {
    if (!motivo.trim()) {
      alert("Debes escribir una razón para el rechazo.");
      return;
    }
    setProcesando(item.id);
    try {
      const tipo = TIPOS.find((t) => t.id === tipoActivo);
      const result = await rechazarItem({
        tabla: tipo.tabla,
        id: item.id,
        motivo: motivo.trim(),
      });

      if (!result.ok) throw new Error(result.error);

      setItems((prev) => prev.filter((i) => i.id !== item.id));
      setRejectModal(null);
      refrescarConteos();

      const nombre = item.titulo ?? item.nombre ?? "Publicación";
      mostrarToast(`❌ "${nombre}" rechazado.`);
    } catch (err) {
      alert("Error al rechazar: " + err.message);
    } finally {
      setProcesando(null);
    }
  }

  // ── PAGINACIÓN local ──
  const totalPaginas = Math.ceil(items.length / POR_PAGINA);
  const itemsPagina = items.slice(
    (pagina - 1) * POR_PAGINA,
    pagina * POR_PAGINA,
  );

  // ── CAMBIAR TIPO de contenido ──
  function cambiarTipo(nuevoId) {
    setTipoActivo(nuevoId);
    // Limpiamos modales y volvemos a pendientes
    setRejectModal(null);
    setModalItem(null);
  }

  // ── CAMBIAR FILTRO de estado ──
  function cambiarFiltro(estado) {
    setFiltroEstado(estado);
    setRejectModal(null);
    setModalItem(null);
  }

  // ─────────────────────────────────────────────────────
  // RENDER TABLA
  // ─────────────────────────────────────────────────────
  function renderTabla() {
    const tipoActual = TIPOS.find((t) => t.id === tipoActivo);
    const campoNombre = tipoActual.campoNombre;

    if (loading) {
      // Skeleton mientras carga
      return (
        <div className="tabla-admin-wrapper">
          <table className="tabla-admin">
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {[...Array(5)].map((_, j) => (
                    <td key={j}>
                      <div
                        style={{
                          height: 14,
                          width: "70%",
                          background:
                            "linear-gradient(90deg,#111 25%,#1a1a1a 50%,#111 75%)",
                          backgroundSize: "200% 100%",
                          animation: "shimmer 1.5s infinite",
                          borderRadius: 4,
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return (
      <div className="tabla-admin-wrapper">
        <table className="tabla-admin">
          <thead>
            <tr>
              <th>
                {tipoActual.label === "Experiencias" ? "Título" : "Nombre"}
              </th>
              <th>Autor</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {itemsPagina.map((item) => {
              const titulo = item[campoNombre] ?? item.titulo ?? "(sin título)";
              const autor = item.perfil?.nombre ?? "Usuario";
              const avatar = item.perfil?.avatar_url ?? null;
              const esProcesando = procesando === item.id;

              return (
                <tr key={item.id}>
                  {/* Nombre + thumbnail */}
                  <td>
                    <div className="tabla-celda-nombre">
                      {item.imagen_url ? (
                        <img
                          src={item.imagen_url}
                          alt={titulo}
                          className="tabla-thumbnail"
                        />
                      ) : (
                        <div className="tabla-thumbnail-placeholder">
                          {tipoActual.emoji}
                        </div>
                      )}
                      <div>
                        <div className="tabla-nombre-texto">{titulo}</div>
                        {item.categoria && (
                          <span className="tabla-nombre-sub">
                            {item.categoria}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Autor */}
                  <td>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      {avatar ? (
                        <img
                          src={avatar}
                          alt=""
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            background: "#2a2a2a",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 11,
                            color: "#777",
                            fontFamily: "var(--font-display)",
                            fontWeight: 600,
                          }}
                        >
                          {autor[0]?.toUpperCase()}
                        </div>
                      )}
                      <span style={{ fontSize: 13 }}>{autor}</span>
                    </div>
                  </td>

                  {/* Fecha */}
                  <td style={{ fontSize: 12, color: "#666" }}>
                    {tiempoRelativo(item.created_at)}
                  </td>

                  {/* Estado */}
                  <td>
                    <BadgeEstado estado={item.estado} />
                  </td>

                  {/* Acciones */}
                  <td>
                    <div className="tabla-acciones">
                      {/* Siempre disponible: ver detalles */}
                      <button
                        className="btn-tabla-ver"
                        onClick={() => setModalItem(item)}
                        title="Ver detalles completos"
                      >
                        👁️ Ver
                      </button>

                      {/* Acciones según estado actual */}
                      {filtroEstado === "pendiente" && (
                        <>
                          <button
                            className="btn-aprobar"
                            onClick={() => aprobar(item)}
                            disabled={esProcesando}
                          >
                            {esProcesando ? "..." : "✅ Aprobar"}
                          </button>
                          <button
                            className="btn-rechazar"
                            onClick={() => setRejectModal({ item, reason: "" })}
                            disabled={esProcesando}
                          >
                            ❌ Rechazar
                          </button>
                        </>
                      )}

                      {/* Rechazado → puede aprobarse */}
                      {filtroEstado === "rechazado" && (
                        <button
                          className="btn-aprobar"
                          onClick={() => aprobar(item)}
                          disabled={esProcesando}
                        >
                          {esProcesando ? "..." : "✅ Aprobar"}
                        </button>
                      )}

                      {/* Aprobado → puede revocarse */}
                      {filtroEstado === "aprobado" && (
                        <button
                          className="btn-rechazar"
                          onClick={() =>
                            setRejectModal({
                              item,
                              reason: item.nota_rechazo ?? "",
                            })
                          }
                          disabled={esProcesando}
                        >
                          {esProcesando ? "..." : "❌ Revocar"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Estado vacío */}
        {items.length === 0 && (
          <div className="tabla-vacia">
            <div className="tabla-vacia-icon">
              {filtroEstado === "pendiente"
                ? "⏳"
                : filtroEstado === "aprobado"
                  ? "✅"
                  : "❌"}
            </div>
            <p>
              {filtroEstado === "pendiente"
                ? "No hay publicaciones pendientes. ¡Todo al día!"
                : filtroEstado === "aprobado"
                  ? "No hay publicaciones aprobadas."
                  : "No hay publicaciones rechazadas."}
            </p>
          </div>
        )}

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="tabla-paginacion">
            <span style={{ fontSize: 12, color: "#555" }}>
              Página {pagina} de {totalPaginas}
            </span>
            <div className="tabla-paginacion-btns">
              <button
                className="btn-pag"
                onClick={() => setPagina(1)}
                disabled={pagina === 1}
              >
                «
              </button>
              <button
                className="btn-pag"
                onClick={() => setPagina((p) => p - 1)}
                disabled={pagina === 1}
              >
                ‹
              </button>

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

              <button
                className="btn-pag"
                onClick={() => setPagina((p) => p + 1)}
                disabled={pagina === totalPaginas}
              >
                ›
              </button>
              <button
                className="btn-pag"
                onClick={() => setPagina(totalPaginas)}
                disabled={pagina === totalPaginas}
              >
                »
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────
  // GUARDS DE ACCESO
  // ─────────────────────────────────────────────────────

  if (authLoading) {
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
  }

  if (!user || !isAdmin) {
    return (
      <div className="admin-acceso-denegado">
        <h2>🔒 Sin permisos</h2>
        <p>Solo los administradores pueden acceder al panel de moderación.</p>
        <Link
          href={!user ? "/login" : "/"}
          style={{
            color: "var(--color-blue)",
            fontFamily: "var(--font-display)",
            fontSize: 14,
          }}
        >
          {!user ? "Iniciar sesión" : "← Volver al inicio"}
        </Link>
      </div>
    );
  }

  // Total de pendientes para el badge del header
  const totalPendientes = Object.values(conteos).reduce((acc, n) => acc + n, 0);

  // ─────────────────────────────────────────────────────
  // RENDER PRINCIPAL
  // ─────────────────────────────────────────────────────
  return (
    <div>
      {/* ── HEADER ── */}
      <div className="admin-page-header">
        <h1 className="admin-page-titulo">
          Moderación
          {totalPendientes > 0 && (
            <span
              className="admin-badge"
              style={{ background: "#ff6b6b20", color: "#ff6b6b" }}
            >
              {totalPendientes} pendientes
            </span>
          )}
        </h1>
        <p className="admin-page-sub">
          Revisa y aprueba el contenido generado por los usuarios.
        </p>
      </div>

      {/* ── LAYOUT ── */}
      <div className="admin-layout">
        <AdminSidebar />

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* ── TABS: tipo de contenido ── */}
          <div className="mod-tabs">
            {TIPOS.map((t) => {
              const count = conteos[t.id] ?? 0;
              return (
                <button
                  key={t.id}
                  className={`mod-tab ${tipoActivo === t.id ? "activo" : ""}`}
                  onClick={() => cambiarTipo(t.id)}
                >
                  {t.emoji} {t.label}
                  {count > 0 && (
                    <span className="mod-tab-count urgente">{count}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* ── FILTROS: estado ── */}
          <div className="mod-filtros">
            {FILTROS_ESTADO.map((estado) => (
              <button
                key={estado}
                className={`mod-filtro-btn ${
                  filtroEstado === estado ? "activo" : ""
                }`}
                onClick={() => cambiarFiltro(estado)}
              >
                {estado === "pendiente"
                  ? "⏳ Pendientes"
                  : estado === "aprobado"
                    ? "✅ Aprobados"
                    : "❌ Rechazados"}
              </button>
            ))}
          </div>

          {/* ── TABLA ── */}
          {renderTabla()}
        </div>
      </div>

      {/* ── MODAL: ver contenido completo ── */}
      {modalItem && (
        <ModalModerar
          item={modalItem}
          tipo={TIPOS.find((t) => t.id === tipoActivo)}
          onClose={() => setModalItem(null)}
        />
      )}

      {/* ── MODAL: motivo de rechazo ── */}
      {rejectModal && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setRejectModal(null)}
        >
          <div className="modal-card" style={{ maxWidth: 450 }}>
            <div className="modal-header">
              <span className="modal-titulo">❌ Motivo del rechazo</span>
              <button
                className="btn-cerrar-modal"
                onClick={() => setRejectModal(null)}
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            <div className="form-admin">
              <div className="form-admin-grupo">
                <label className="form-admin-label">
                  Razón <span style={{ color: "var(--color-red)" }}>*</span>
                  <span
                    style={{
                      fontWeight: 400,
                      textTransform: "none",
                      marginLeft: 4,
                      color: "#555",
                    }}
                  >
                    (el usuario la verá)
                  </span>
                </label>
                <textarea
                  className="form-admin-textarea"
                  rows={3}
                  placeholder="Ej: Faltan datos de contacto, imagen inapropiada, descripción incompleta..."
                  value={rejectModal.reason}
                  autoFocus
                  onChange={(e) =>
                    setRejectModal({
                      ...rejectModal,
                      reason: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-cancelar"
                onClick={() => setRejectModal(null)}
              >
                Cancelar
              </button>
              <button
                className="btn-submit-exp"
                style={{ background: "#cc2200" }}
                onClick={() =>
                  confirmarRechazo(rejectModal.item, rejectModal.reason)
                }
                disabled={!rejectModal.reason.trim() || !!procesando}
              >
                {procesando ? "Procesando..." : "Confirmar rechazo"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      {toast && (
        <div
          className="toast-notification"
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
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
