// app/admin/fiestas/page.js
// ─────────────────────────────────────────────────────
// PANEL ADMIN: Gestión de Fiestas — CRUD completo
// Ruta: /admin/fiestas
// 🔧 Conecta con: tabla public.fiestas (SELECT, INSERT, UPDATE, DELETE)
// ─────────────────────────────────────────────────────

"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  getFiestas,
  toggleFiestaActiva,
  deleteFiesta,
} from "@/app/actions/fiestas";
import { useAuth } from "@/context/AuthContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import ModalFiesta from "@/components/admin/ModalFiesta";
import ModalAudiosFiesta from "@/components/admin/ModalAudiosFiesta";
import Swal from "sweetalert2";
import "@/styles/admin.css";
import "@/styles/tabla-admin.css";

const IconEdit = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const IconTrash = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3,6 5,6 21,6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);
const IconPlus = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

// Número de filas por página
const POR_PAGINA = 10;

export default function AdminFiestasPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();

  const [fiestas, setFiestas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const [modal, setModal] = useState(null); // null | 'crear' | objeto lugar
  const [toastMsg, setToastMsg] = useState("");

  const [modalAudiosAbierto, setModalAudiosAbierto] = useState(false);
  const [festividadSeleccionada, setFestividadSeleccionada] = useState(null);

  // ── CARGAR MITOS ──
  // 🔧 Conecta con: tabla public.mitos SELECT todos (activos e inactivos)
  async function cargarFiestas() {
    setLoading(true);
    try {
      const data = await getFiestas();
      setFiestas(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isAdmin) cargarFiestas();
  }, [isAdmin]);

  // ── FILTRAR Y PAGINAR ──
  const fiestasFiltradas = useMemo(() => {
    const q = busqueda.toLowerCase();
    return fiestas.filter(
      (f) =>
        !q ||
        f.titulo?.toLowerCase().includes(q) ||
        f.fecha?.toLowerCase().includes(q) ||
        f.mes?.toLowerCase().includes(q),
    );
  }, [fiestas, busqueda]);

  const totalPaginas = Math.ceil(fiestasFiltradas.length / POR_PAGINA);
  const fiestasPagina = fiestasFiltradas.slice(
    (pagina - 1) * POR_PAGINA,
    pagina * POR_PAGINA,
  );

  // Reset página al buscar
  useEffect(() => {
    setPagina(1);
  }, [busqueda]);

  // ── TOAST ──
  function mostrarToast(msg) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  }

  // ── TOGGLE ACTIVO (Server Action) ───────────────────
  async function toggleActivo(fiesta) {
    try {
      await toggleFiestaActiva(fiesta.id, fiesta.activo);
      setFiestas((prev) =>
        prev.map((f) => (f.id === fiesta.id ? { ...f, activo: !f.activo } : f)),
      );
      mostrarToast(
        `"${fiesta.titulo}" ${!fiesta.activo ? "activado" : "desactivado"}`,
      );
    } catch (error) {
      console.error(error);
      mostrarToast("Error al cambiar el estado", "error");
    }
  }

  // ── BORRAR MITO ──
  // 🔧 Conecta con: DELETE FROM mitos WHERE id
  async function borrarFiesta(fiesta) {
    const result = await Swal.fire({
      title: `¿Borrar "${fiesta.titulo}"?`,
      theme: "dark",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, borrar",
      cancelButtonText: "Cancelar",
    });
    // Si el usuario no confirma, detenemos la ejecución
    if (!result.isConfirmed) return;

    try {
      await deleteFiesta(fiesta.id);
      setFiestas((prev) => prev.filter((f) => f.id !== fiesta.id));
      mostrarToast(`"${fiesta.titulo}" eliminado`);
    } catch (error) {
      console.error(error);
      alert("Error al borrar: " + error.message);
    }
  }

  // ── AL GUARDAR EN EL MODAL ──
  function handleGuardado(fiestaGuardada, accion) {
    if (accion === "creado") {
      setFiestas((prev) => [fiestaGuardada, ...prev]);
      mostrarToast(`✅ "${fiestaGuardada.titulo}" creado`);
    } else {
      setFiestas((prev) =>
        prev.map((f) => (f.id === fiestaGuardada.id ? fiestaGuardada : f)),
      );
      mostrarToast(`✅ "${fiestaGuardada.titulo}" actualizado`);
    }
    setModal(null);
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
        <p>Necesitas ser administrador para acceder a esta página.</p>
        <Link
          href="/"
          style={{
            color: "var(--color-blue)",
            fontFamily: "var(--font-display)",
            fontSize: 14,
          }}
        >
          ← Volver al inicio
        </Link>
      </div>
    );

  return (
    <div>
      {/* ── HEADER ── */}
      <div className="admin-page-header">
        <h1 className="admin-page-titulo">
          Gestión de Fiestas
          <span className="admin-badge">⚡ Admin</span>
        </h1>
        <p className="admin-page-sub">
          Crea, edita y gestiona las fiestas del distrito.
        </p>
      </div>

      <div className="admin-layout">
        <AdminSidebar />

        <div>
          {/* ── TABLA DE MITOS ── */}
          <div className="admin-seccion">
            <div className="admin-seccion-header">
              <span className="admin-seccion-titulo">
                Mitos ({fiestasFiltradas.length})
              </span>
              <button
                className="btn-admin-primary"
                onClick={() => setModal("crear")}
              >
                <IconPlus /> Nueva Fiesta
              </button>
            </div>

            {/* Barra de búsqueda */}
            <div className="tabla-admin-barra">
              <div className="tabla-buscar">
                <span className="tabla-buscar-icon">🔍</span>
                <input
                  type="text"
                  className="tabla-buscar-input"
                  placeholder="Buscar por nombre, fecha..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
              <span className="tabla-count">
                {fiestasFiltradas.length} de {fiestas.length} fiestas
              </span>
            </div>

            {/* Tabla */}
            <div className="tabla-admin-wrapper">
              <table className="tabla-admin">
                <thead>
                  <tr>
                    <th>Fiesta</th>
                    <th>Fecha</th>
                    <th>Mes</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        {[1, 2, 3, 4, 5].map((j) => (
                          <td key={j}>
                            <div
                              style={{
                                height: 14,
                                borderRadius: 4,
                                width: "70%",
                                background:
                                  "linear-gradient(90deg,#111 25%,#1a1a1a 50%,#111 75%)",
                                backgroundSize: "200% 100%",
                                animation: "shimmer 1.5s infinite",
                              }}
                            />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : fiestasPagina.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        <div className="tabla-vacia">
                          <div className="tabla-vacia-icon">🎉</div>
                          <p>
                            {busqueda
                              ? "Sin resultados para tu búsqueda"
                              : "No hay fiestas todavía. ¡Crea el primero!"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    fiestasPagina.map((fiesta) => (
                      <tr key={fiesta.id}>
                        {/* Nombre + thumbnail */}
                        <td>
                          <div className="tabla-celda-nombre">
                            {fiesta.imagen_card ? (
                              <img
                                src={fiesta.imagen_card}
                                alt={fiesta.titulo}
                                className="tabla-thumbnail"
                              />
                            ) : (
                              <div className="tabla-thumbnail-placeholder">
                                🎉
                              </div>
                            )}
                            <div>
                              <div className="tabla-nombre-texto">
                                {fiesta.titulo}
                              </div>
                              <span className="tabla-nombre-sub">
                                {fiesta.subtitulo || "—"}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* fecha */}
                        <td style={{ textTransform: "capitalize" }}>
                          {fiesta.fecha}
                        </td>

                        {/* mes */}
                        <td style={{ textTransform: "capitalize" }}>
                          {fiesta.mes}
                        </td>

                        {/* Activo */}
                        <td>
                          <span
                            className={`tabla-badge-activo ${fiesta.activo ? "si" : "no"}`}
                          >
                            {fiesta.activo ? "Activo" : "Inactivo"}
                          </span>
                        </td>

                        {/* Acciones */}
                        <td>
                          <div className="tabla-acciones">
                            {/* Audios */}
                            <button
                              className="btn-tabla-editar"
                              onClick={() => {
                                setFestividadSeleccionada(fiesta);
                                setModalAudiosAbierto(true);
                              }}
                            >
                              🎵 Audios
                            </button>
                            {/* Toggle activo/inactivo */}
                            <button
                              className="btn-toggle-activo"
                              onClick={() => toggleActivo(fiesta)}
                              title={fiesta.activo ? "Desactivar" : "Activar"}
                            >
                              {fiesta.activo ? "👁️ Ocultar" : "👁️ Mostrar"}
                            </button>

                            {/* Editar */}
                            <button
                              className="btn-tabla-editar"
                              onClick={() => setModal(fiesta)}
                            >
                              <IconEdit /> Editar
                            </button>
                            {/* Borrar */}
                            <button
                              className="btn-tabla-borrar"
                              onClick={() => borrarFiesta(fiesta)}
                            >
                              <IconTrash /> Borrar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {totalPaginas > 1 && (
              <div className="tabla-paginacion">
                <span>
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
        </div>
      </div>

      {modalAudiosAbierto && (
        <ModalAudiosFiesta
          festividadId={festividadSeleccionada.id}
          festividadTitulo={festividadSeleccionada.titulo}
          onClose={() => setModalAudiosAbierto(false)}
          onGuardado={(accion, data) => {
            // Opcional: refrescar algún estado si es necesario
            console.log(`Audio ${accion}`, data);
          }}
        />
      )}

      {/* ── MODAL DE CREAR/EDITAR ── */}
      {modal && (
        <ModalFiesta
          fiesta={modal === "crear" ? null : modal}
          onClose={() => setModal(null)}
          onGuardado={handleGuardado}
        />
      )}

      {/* ── TOAST ── */}
      {toastMsg && (
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
            animation: "slideUp 0.2s ease",
          }}
        >
          {toastMsg}
        </div>
      )}
    </div>
  );
}
