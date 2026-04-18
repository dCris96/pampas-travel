// app/admin/caserios/page.js
// ─────────────────────────────────────────────────────
// PANEL ADMIN: Gestión de Caserios — CRUD completo
// Ruta: /admin/caserios
// 🔧 Conecta con: tabla public.caserios (SELECT, INSERT, UPDATE, DELETE)
// ─────────────────────────────────────────────────────

"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  getCaserios,
  toggleCaserioActivo,
  deleteCaserio,
} from "@/app/actions/caserios";
import { useAuth } from "@/context/AuthContext";
import Swal from "sweetalert2";
import AdminSidebar from "@/components/admin/AdminSidebar";
import ModalCaserio from "@/components/admin/ModalCaserio";
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

export default function AdminCaseriosPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();

  const [caserios, setCaserios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const [modal, setModal] = useState(null); // null | 'crear' | objeto lugar
  const [toastMsg, setToastMsg] = useState("");

  // ── CARGAR CASERIOS ──
  // 🔧 Conecta con: tabla public.caserios SELECT todos (activos e inactivos)
  async function cargarCaserios() {
    setLoading(true);
    try {
      const data = await getCaserios();
      setCaserios(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isAdmin) cargarCaserios();
  }, [isAdmin]);

  // ── FILTRAR Y PAGINAR ──
  const caseriosFiltrados = useMemo(() => {
    const q = busqueda.toLowerCase();
    return caserios.filter(
      (c) =>
        !q ||
        c.nombre?.toLowerCase().includes(q) ||
        c.direccion?.toLowerCase().includes(q),
    );
  }, [caserios, busqueda]);

  const totalPaginas = Math.ceil(caseriosFiltrados.length / POR_PAGINA);
  const caseriosPagina = caseriosFiltrados.slice(
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

  // ── TOGGLE ACTIVO ──
  async function toggleActivo(caserio) {
    try {
      await toggleCaserioActivo(caserio.id, caserio.activo);

      // Actualización optimista del estado local
      setCaserios((prev) =>
        prev.map((c) =>
          c.id === caserio.id ? { ...c, activo: !c.activo } : c,
        ),
      );
      mostrarToast(
        `"${caserio.nombre}" ${!caserio.activo ? "activado" : "desactivado"}`,
      );
    } catch (error) {
      console.error(error);
      mostrarToast("Error al cambiar el estado", "error");
    }
  }

  // ── BORRAR CASERIO ──
  // 🔧 Conecta con: DELETE FROM caserios WHERE id
  async function borrarCaserio(caserio) {
    const result = await Swal.fire({
      title: `¿Borrar "${caserio.nombre}"?`,
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
      await deleteCaserio(caserio.id);
      setCaserios((prev) => prev.filter((c) => c.id !== caserio.id));
      mostrarToast(`"${caserio.nombre}" eliminado`);
    } catch (error) {
      console.error(error);
      alert("Error al borrar: " + error.message);
    }
  }

  // ── AL GUARDAR EN EL MODAL ──
  function handleGuardado(caserioGuardado, accion) {
    if (accion === "creado") {
      setCaserios((prev) => [caserioGuardado, ...prev]);
      mostrarToast(`✅ "${caserioGuardado.nombre}" creado`);
    } else {
      setCaserios((prev) =>
        prev.map((c) => (c.id === caserioGuardado.id ? caserioGuardado : c)),
      );
      mostrarToast(`✅ "${caserioGuardado.nombre}" actualizado`);
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
          Gestión de Caserios y Centros poblados
          <span className="admin-badge">⚡ Admin</span>
        </h1>
        <p className="admin-page-sub">
          Crea, edita y gestiona los caserios y centros poblados del distrito.
        </p>
      </div>

      <div className="admin-layout">
        <AdminSidebar />

        <div>
          {/* ── TABLA DE CASERIOS ── */}
          <div className="admin-seccion">
            <div className="admin-seccion-header">
              <span className="admin-seccion-titulo">
                Caserios ({caseriosFiltrados.length})
              </span>
              <button
                className="btn-admin-primary"
                onClick={() => setModal("crear")}
              >
                <IconPlus /> Nuevo caserio
              </button>
            </div>

            {/* Barra de búsqueda */}
            <div className="tabla-admin-barra">
              <div className="tabla-buscar">
                <span className="tabla-buscar-icon">🔍</span>
                <input
                  type="text"
                  className="tabla-buscar-input"
                  placeholder="Buscar por nombre, categoría..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
              <span className="tabla-count">
                {caseriosFiltrados.length} de {caserios.length} caserios
              </span>
            </div>

            {/* Tabla */}
            <div className="tabla-admin-wrapper">
              <table className="tabla-admin">
                <thead>
                  <tr>
                    <th>Caserio</th>
                    <th>Población</th>
                    <th>Destacado</th>
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
                  ) : caseriosPagina.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        <div className="tabla-vacia">
                          <div className="tabla-vacia-icon">🏘️</div>
                          <p>
                            {busqueda
                              ? "Sin resultados para tu búsqueda"
                              : "No hay caserios todavía. ¡Crea el primero!"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    caseriosPagina.map((caserio) => (
                      <tr key={caserio.id}>
                        {/* Nombre + thumbnail */}
                        <td>
                          <div className="tabla-celda-nombre">
                            {caserio.imagen_url ? (
                              <img
                                src={caserio.imagen_url}
                                alt={caserio.nombre}
                                className="tabla-thumbnail"
                              />
                            ) : (
                              <div className="tabla-thumbnail-placeholder">
                                🏔️
                              </div>
                            )}
                            <div>
                              <div className="tabla-nombre-texto">
                                {caserio.nombre}
                              </div>
                              <span className="tabla-nombre-sub">
                                {caserio.altitud || "—"} msnm
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* población */}
                        <td style={{ textTransform: "capitalize" }}>
                          {caserio.poblacion || "—"}
                        </td>

                        {/* destacados */}
                        <td>
                          {caserio.destacado ? (
                            <span className="tabla-badge-star">★</span>
                          ) : (
                            <span style={{ color: "#333" }}>—</span>
                          )}
                        </td>

                        {/* Activo */}
                        <td>
                          <span
                            className={`tabla-badge-activo ${caserio.activo ? "si" : "no"}`}
                          >
                            {caserio.activo ? "Activo" : "Inactivo"}
                          </span>
                        </td>

                        {/* Acciones */}
                        <td>
                          <div className="tabla-acciones">
                            {/* Toggle activo/inactivo */}
                            <button
                              className="btn-toggle-activo"
                              onClick={() => toggleActivo(caserio)}
                              title={caserio.activo ? "Desactivar" : "Activar"}
                            >
                              {caserio.activo ? "👁️ Ocultar" : "👁️ Mostrar"}
                            </button>

                            {/* Editar */}
                            <button
                              className="btn-tabla-editar"
                              onClick={() => setModal(caserio)}
                            >
                              <IconEdit /> Editar
                            </button>

                            {/* Borrar */}
                            <button
                              className="btn-tabla-borrar"
                              onClick={() => borrarCaserio(caserio)}
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

      {/* ── MODAL DE CREAR/EDITAR ── */}
      {modal && (
        <ModalCaserio
          caserio={modal === "crear" ? null : modal}
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
