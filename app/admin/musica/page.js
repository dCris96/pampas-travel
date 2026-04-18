// app/admin/musica/page.js
// ─────────────────────────────────────────────────────
// PANEL ADMIN: Gestión de musica — CRUD completo
// Ruta: /admin/musica
// 🔧 Conecta con: tabla public.musica (SELECT, INSERT, UPDATE, DELETE)
// ─────────────────────────────────────────────────────

"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  getMusica,
  toggleMusicaActivo,
  deleteMusica,
} from "@/app/actions/musica";
import { useAuth } from "@/context/AuthContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import Swal from "sweetalert2";
import "@/styles/admin.css";
import "@/styles/tabla-admin.css";
import ModalMusica from "@/components/admin/ModalMusica";

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

export default function AdminMusicaPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();

  const [musica, setMusica] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const [modal, setModal] = useState(null); // null | 'crear' | objeto lugar
  const [toastMsg, setToastMsg] = useState("");

  // ── CARGAR MUSICA ──
  // 🔧 Conecta con: tabla public.musica SELECT todos (activos e inactivos)
  async function cargarMusica() {
    setLoading(true);
    try {
      const data = await getMusica();
      setMusica(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isAdmin) cargarMusica();
  }, [isAdmin]);

  // ── FILTRAR Y PAGINAR ──
  const musicaFiltrada = useMemo(() => {
    const q = busqueda.toLowerCase();
    return musica.filter(
      (m) =>
        !q ||
        m.titulo?.toLowerCase().includes(q) ||
        m.artista?.toLowerCase().includes(q) ||
        m.genero?.toLowerCase().includes(q),
    );
  }, [musica, busqueda]);

  const totalPaginas = Math.ceil(musicaFiltrada.length / POR_PAGINA);
  const musicaPagina = musicaFiltrada.slice(
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
  async function toggleActivo(musica) {
    try {
      await toggleMusicaActivo(musica.id, musica.activo);
      setMusica((prev) =>
        prev.map((m) => (m.id === musica.id ? { ...m, activo: !m.activo } : m)),
      );
      mostrarToast(
        `"${musica.titulo}" ${!musica.activo ? "activado" : "desactivado"}`,
      );
    } catch (error) {
      console.error(error);
      mostrarToast("Error al cambiar el estado", "error");
    }
  }

  // ── BORRAR MITO ──
  // 🔧 Conecta con: DELETE FROM mitos WHERE id
  async function borrarMusica(musica) {
    const result = await Swal.fire({
      title: `¿Borrar "${musica.titulo}"?`,
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
      await deleteMusica(musica.id);
      setMusica((prev) => prev.filter((m) => m.id !== musica.id));
      mostrarToast(`"${musica.titulo}" eliminado`);
    } catch (error) {
      console.error(error);
      alert("Error al borrar: " + error.message);
    }
  }

  // ── AL GUARDAR EN EL MODAL ──
  function handleGuardado(musicaGuardada, accion) {
    if (accion === "creado") {
      setMusica((prev) => [musicaGuardada, ...prev]);
      mostrarToast(`✅ "${musicaGuardada.titulo}" creado`);
    } else {
      setMusica((prev) =>
        prev.map((m) => (m.id === musicaGuardada.id ? musicaGuardada : m)),
      );
      mostrarToast(`✅ "${musicaGuardada.titulo}" actualizado`);
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
          Gestión de Música
          <span className="admin-badge">⚡ Admin</span>
        </h1>
        <p className="admin-page-sub">
          Crea, edita y gestiona las canciones del distrito.
        </p>
      </div>

      <div className="admin-layout">
        <AdminSidebar />

        <div>
          {/* ── TABLA DE MITOS ── */}
          <div className="admin-seccion">
            <div className="admin-seccion-header">
              <span className="admin-seccion-titulo">
                Canciones ({musicaFiltrada.length})
              </span>
              <button
                className="btn-admin-primary"
                onClick={() => setModal("crear")}
              >
                <IconPlus /> Nueva canción
              </button>
            </div>

            {/* Barra de búsqueda */}
            <div className="tabla-admin-barra">
              <div className="tabla-buscar">
                <span className="tabla-buscar-icon">🔍</span>
                <input
                  type="text"
                  className="tabla-buscar-input"
                  placeholder="Buscar por titulo, artista..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
              <span className="tabla-count">
                {musicaFiltrada.length} de {musica.length} canciones
              </span>
            </div>

            {/* Tabla */}
            <div className="tabla-admin-wrapper">
              <table className="tabla-admin">
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Artista</th>
                    <th>Género</th>
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
                  ) : musicaPagina.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        <div className="tabla-vacia">
                          <div className="tabla-vacia-icon">📯</div>
                          <p>
                            {busqueda
                              ? "Sin resultados para tu búsqueda"
                              : "No hay canciones todavía. ¡Crea la primera!"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    musicaPagina.map((cancion) => (
                      <tr key={cancion.id}>
                        {/* Nombre + thumbnail */}
                        <td>
                          <div className="tabla-celda-nombre">
                            {cancion.cover_url ? (
                              <img
                                src={cancion.cover_url}
                                alt={cancion.titulo}
                                className="tabla-thumbnail"
                              />
                            ) : (
                              <div className="tabla-thumbnail-placeholder">
                                🎶
                              </div>
                            )}
                            <div>
                              <div className="tabla-nombre-texto">
                                {cancion.titulo}
                              </div>
                              <span className="tabla-nombre-sub">
                                {cancion.artista || "—"}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Artista */}
                        <td style={{ textTransform: "capitalize" }}>
                          {cancion.artista}
                        </td>

                        {/* Género */}
                        <td style={{ textTransform: "capitalize" }}>
                          {cancion.genero}
                        </td>

                        {/* Activo */}
                        <td>
                          <span
                            className={`tabla-badge-activo ${cancion.activo ? "si" : "no"}`}
                          >
                            {cancion.activo ? "Activo" : "Inactivo"}
                          </span>
                        </td>

                        {/* Acciones */}
                        <td>
                          <div className="tabla-acciones">
                            {/* Toggle activo/inactivo */}
                            <button
                              className="btn-toggle-activo"
                              onClick={() => toggleActivo(cancion)}
                              title={cancion.activo ? "Desactivar" : "Activar"}
                            >
                              {cancion.activo ? "👁️ Ocultar" : "👁️ Mostrar"}
                            </button>

                            {/* Editar */}
                            <button
                              className="btn-tabla-editar"
                              onClick={() => setModal(cancion)}
                            >
                              <IconEdit /> Editar
                            </button>
                            {/* Borrar */}
                            <button
                              className="btn-tabla-borrar"
                              onClick={() => borrarMusica(cancion)}
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
        <ModalMusica
          musica={modal === "crear" ? null : modal}
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
