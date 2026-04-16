// app/admin/lugares/page.js
// ─────────────────────────────────────────────────────
// PANEL ADMIN: Gestión de Lugares — CRUD completo
// Ruta: /admin/lugares
// 🔧 Conecta con: acciones en app/actions/lugares.js
// ─────────────────────────────────────────────────────

"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import ModalLugar from "@/components/admin/ModalLugar";
import {
  getLugares,
  toggleLugarActivo,
  deleteLugar,
} from "@/app/actions/lugares";
import Swal from "sweetalert2";
import { getCaserios } from "@/app/actions/caserios";
import "@/styles/admin.css";
import "@/styles/tabla-admin.css";

// ── ÍCONOS ───────────────────────────────────────────
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

const POR_PAGINA = 10;

export default function AdminLugaresPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();

  const [lugares, setLugares] = useState([]);
  const [caserios, setCaserios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const [modal, setModal] = useState(null); // null | 'crear' | objeto lugar
  const [toastMsg, setToastMsg] = useState("");

  // ── CARGAR DATOS INICIALES ──────────────────────────
  async function cargarDatos() {
    setLoading(true);
    try {
      const [lugaresData, caseriosData] = await Promise.all([
        getLugares(),
        getCaserios(),
      ]);

      setLugares(lugaresData || []);
      setCaserios(caseriosData || []);
    } catch (err) {
      console.error("Error cargando datos:", err);
      mostrarToast("Error al cargar los datos", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isAdmin) cargarDatos();
  }, [isAdmin]);

  // ── FILTRAR Y PAGINAR ───────────────────────────────
  const lugaresFiltrados = useMemo(() => {
    const q = busqueda.toLowerCase();
    return lugares.filter(
      (l) =>
        !q ||
        l.titulo?.toLowerCase().includes(q) ||
        l.categoria?.toLowerCase().includes(q) ||
        l.direccion?.toLowerCase().includes(q),
    );
  }, [lugares, busqueda]);

  const totalPaginas = Math.ceil(lugaresFiltrados.length / POR_PAGINA);
  const lugaresPagina = lugaresFiltrados.slice(
    (pagina - 1) * POR_PAGINA,
    pagina * POR_PAGINA,
  );

  useEffect(() => setPagina(1), [busqueda]);

  // ── TOAST ───────────────────────────────────────────
  function mostrarToast(msg, tipo = "success") {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  }

  // ── TOGGLE ACTIVO (Server Action) ───────────────────
  async function toggleActivo(lugar) {
    try {
      await toggleLugarActivo(lugar.id, lugar.activo);
      setLugares((prev) =>
        prev.map((l) => (l.id === lugar.id ? { ...l, activo: !l.activo } : l)),
      );
      mostrarToast(
        `"${lugar.titulo}" ${!lugar.activo ? "activado" : "desactivado"}`,
      );
    } catch (error) {
      console.error(error);
      mostrarToast("Error al cambiar el estado", "error");
    }
  }

  // ── BORRAR LUGAR (Server Action) ────────────────────
  async function borrarLugar(lugar) {
    // Reemplazo de confirm con Swal.fire
    const result = await Swal.fire({
      title: `¿Borrar "${lugar.titulo}"?`,
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
      await deleteLugar(lugar.id);
      setLugares((prev) => prev.filter((l) => l.id !== lugar.id));
      mostrarToast(`"${lugar.titulo}" eliminado`);
    } catch (error) {
      console.error(error);
      alert("Error al borrar: " + error.message);
    }
  }

  // ── AL GUARDAR EN EL MODAL (el modal ya usa acciones) ──
  function handleGuardado(lugarGuardado, accion) {
    if (accion === "creado") {
      setLugares((prev) => [lugarGuardado, ...prev]);
      mostrarToast(`✅ "${lugarGuardado.titulo}" creado`);
    } else {
      setLugares((prev) =>
        prev.map((l) => (l.id === lugarGuardado.id ? lugarGuardado : l)),
      );
      mostrarToast(`✅ "${lugarGuardado.titulo}" actualizado`);
    }
    setModal(null);
  }

  // ── GUARDS ──────────────────────────────────────────
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

  if (!isAdmin) {
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
  }

  // ── RENDER PRINCIPAL ────────────────────────────────
  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-titulo">
          Gestión de Lugares
          <span className="admin-badge">⚡ Admin</span>
        </h1>
        <p className="admin-page-sub">
          Crea, edita y gestiona los sitios turísticos del distrito.
        </p>
      </div>

      <div className="admin-layout">
        <AdminSidebar />

        <div>
          <div className="admin-seccion">
            <div className="admin-seccion-header">
              <span className="admin-seccion-titulo">
                Lugares ({lugaresFiltrados.length})
              </span>
              <button
                className="btn-admin-primary"
                onClick={() => setModal("crear")}
              >
                <IconPlus /> Nuevo lugar
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
                {lugaresFiltrados.length} de {lugares.length} lugares
              </span>
            </div>

            {/* Tabla */}
            <div className="tabla-admin-wrapper">
              <table className="tabla-admin">
                <thead>
                  <tr>
                    <th>Lugar</th>
                    <th>Categoría</th>
                    <th>Estado</th>
                    <th>Destacado</th>
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
                  ) : lugaresPagina.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        <div className="tabla-vacia">
                          <div className="tabla-vacia-icon">🗺️</div>
                          <p>
                            {busqueda
                              ? "Sin resultados para tu búsqueda"
                              : "No hay lugares todavía. ¡Crea el primero!"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    lugaresPagina.map((lugar) => (
                      <tr key={lugar.id}>
                        <td>
                          <div className="tabla-celda-nombre">
                            {lugar.imagen_url ? (
                              <img
                                src={lugar.imagen_url}
                                alt={lugar.titulo}
                                className="tabla-thumbnail"
                              />
                            ) : (
                              <div className="tabla-thumbnail-placeholder">
                                🏔️
                              </div>
                            )}
                            <div>
                              <div className="tabla-nombre-texto">
                                {lugar.titulo}
                              </div>
                              <span className="tabla-nombre-sub">
                                {lugar.direccion || "—"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td style={{ textTransform: "capitalize" }}>
                          {lugar.categoria}
                        </td>
                        <td>
                          <span
                            className={`tabla-badge-activo ${lugar.activo ? "si" : "no"}`}
                          >
                            {lugar.activo ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td>
                          {lugar.destacado ? (
                            <span className="tabla-badge-star">★</span>
                          ) : (
                            <span style={{ color: "#333" }}>—</span>
                          )}
                        </td>
                        <td>
                          <div className="tabla-acciones">
                            <button
                              className="btn-toggle-activo"
                              onClick={() => toggleActivo(lugar)}
                              title={lugar.activo ? "Desactivar" : "Activar"}
                            >
                              {lugar.activo ? "👁️ Ocultar" : "👁️ Mostrar"}
                            </button>
                            <button
                              className="btn-tabla-editar"
                              onClick={() => setModal(lugar)}
                            >
                              <IconEdit /> Editar
                            </button>
                            <button
                              className="btn-tabla-borrar"
                              onClick={() => borrarLugar(lugar)}
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

      {/* Modal de creación/edición */}
      {modal && (
        <ModalLugar
          lugar={modal === "crear" ? null : modal}
          caserios={caserios}
          onClose={() => setModal(null)}
          onGuardado={handleGuardado}
        />
      )}

      {/* Toast */}
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
