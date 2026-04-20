// app/mis-publicaciones/page.js
// El usuario ve TODAS sus publicaciones y su estado de moderación

"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getContenidoUsuario } from "@/app/actions/mis-publicaciones";
import { useAuth } from "@/context/AuthContext";
import BadgeEstado from "@/components/BadgeEstado";
import FormularioProducto from "@/components/FormularioProducto";
import FormularioNegocio from "@/components/FormularioNegocio";
import FormularioExperiencia from "@/components/FormularioExperiencia";
import "@/styles/mis-publicaciones.css";

const TABS = [
  { id: "experiencias", label: "Experiencias", emoji: "📸" },
  { id: "productos", label: "Productos", emoji: "📦" },
  { id: "negocios", label: "Negocios", emoji: "🏪" },
];

const ITEMS_PER_PAGE = 10;

function tiempoRelativo(iso) {
  const diff = Date.now() - new Date(iso);
  const dias = Math.floor(diff / 86400000);
  if (dias === 0) return "hoy";
  if (dias === 1) return "ayer";
  if (dias < 7) return `hace ${dias} días`;
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
  });
}

export default function MisPublicacionesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState("experiencias");
  const [data, setData] = useState({
    experiencias: [],
    productos: [],
    negocios: [],
  });
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // 'experiencia'|'producto'|'negocio'|'lugar'
  const [toast, setToast] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const mostrarToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  };

  // ── CARGAR TODAS LAS PUBLICACIONES DEL USUARIO ──
  // 🔧 Conecta con: 4 tablas filtrando por user_id
  const cargar = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const contenido = await getContenidoUsuario(user.id);
      setData(contenido);

      // Calcular pendientes
      const pendientes = {};
      Object.entries(contenido).forEach(([key, arr]) => {
        pendientes[key] = arr.filter((i) => i.estado === "pendiente").length;
      });
      setCounts(pendientes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) cargar();
  }, [user, cargar]);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  // Resetear página al cambiar de tab
  useEffect(() => {
    setCurrentPage(1);
  }, [tab]);

  if (authLoading || !user)
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
        Cargando...
      </div>
    );

  const items = data[tab] || [];
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = items.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Helper para obtener título según tipo
  const getTitulo = (item, tipo) => {
    if (tipo === "experiencias")
      return item.titulo || item.contenido?.substring(0, 60) + "...";
    if (tipo === "productos") return item.nombre || "Producto sin nombre";
    if (tipo === "negocios") return item.nombre || "Negocio sin nombre";
    return "Sin título";
  };

  // Helper para obtener descripción/preview
  const getDescripcion = (item, tipo) => {
    if (tipo === "experiencias") return item.contenido || "";
    if (tipo === "productos") return item.descripcion || "";
    if (tipo === "negocios") return item.descripcion || "";
    return "";
  };

  const MODAL_MAP = {
    experiencia: (
      <FormularioExperiencia
        onClose={() => setModal(null)}
        onPublicado={() => {
          setModal(null);
          mostrarToast("✅ Experiencia enviada para revisión.");
          cargar();
        }}
      />
    ),
    producto: (
      <FormularioProducto
        onClose={() => setModal(null)}
        onPublicado={() => {
          setModal(null);
          mostrarToast("✅ Producto enviado para revisión.");
          cargar();
        }}
      />
    ),
    negocio: (
      <FormularioNegocio
        onClose={() => setModal(null)}
        onPublicado={() => {
          setModal(null);
          mostrarToast("✅ Negocio enviado para revisión.");
          cargar();
        }}
      />
    ),
  };

  return (
    <div>
      <div className="mispub-header">
        <h1>Mis publicaciones</h1>
        <p>Gestiona todo el contenido que has enviado al portal.</p>
      </div>

      {/* Botones de crear */}
      <div
        style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}
      >
        {[
          { label: "📸 Agregar Experiencia", modal: "experiencia" },
          { label: "📦 Agregar Producto", modal: "producto" },
          { label: "🏪 Agregar Negocio", modal: "negocio" },
        ].map((btn) => (
          <button
            key={btn.modal}
            onClick={() => setModal(btn.modal)}
            style={{
              padding: "8px 16px",
              background: "var(--color-bg-card)",
              border: "1px solid var(--color-border)",
              borderRadius: 8,
              fontFamily: "var(--font-display)",
              fontSize: 12,
              color: "var(--color-text-muted)",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#333";
              e.currentTarget.style.color = "var(--color-text)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--color-border)";
              e.currentTarget.style.color = "var(--color-text-muted)";
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="mispub-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`mispub-tab ${tab === t.id ? "activo" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.emoji} {t.label}
            {counts[t.id] > 0 && (
              <span className="mispub-tab-count">
                {counts[t.id]} pendientes
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tabla con paginación */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
          Cargando publicaciones...
        </div>
      ) : paginatedItems.length === 0 ? (
        <div className="mispub-vacio">
          <div className="mispub-vacio-icon">
            {
              {
                experiencias: "📸",
                productos: "📦",
                negocios: "🏪",
              }[tab]
            }
          </div>
          <p>
            No tienes {TABS.find((t) => t.id === tab)?.label.toLowerCase()}{" "}
            publicadas todavía.
          </p>
        </div>
      ) : (
        <>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontFamily: "var(--font-display)",
                fontSize: "13px",
                background: "var(--color-bg-card)",
                borderRadius: "12px",
                overflow: "hidden",
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid var(--color-border)",
                    background: "rgba(0,0,0,0.2)",
                  }}
                >
                  <th
                    style={{
                      padding: "12px 8px",
                      textAlign: "left",
                      width: "60px",
                    }}
                  >
                    Imagen
                  </th>
                  <th style={{ padding: "12px 8px", textAlign: "left" }}>
                    Título
                  </th>
                  <th style={{ padding: "12px 8px", textAlign: "left" }}>
                    Descripción
                  </th>
                  <th
                    style={{
                      padding: "12px 8px",
                      textAlign: "left",
                      width: "110px",
                    }}
                  >
                    Estado
                  </th>
                  <th
                    style={{
                      padding: "12px 8px",
                      textAlign: "left",
                      width: "100px",
                    }}
                  >
                    Fecha
                  </th>
                  <th
                    style={{
                      padding: "12px 8px",
                      textAlign: "left",
                      width: "180px",
                    }}
                  >
                    Razón rechazo
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((item) => {
                  const titulo = getTitulo(item, tab);
                  const descripcion = getDescripcion(item, tab);
                  const imagen = item.imagen_url;
                  const emoji = {
                    experiencias: "📸",
                    productos: "📦",
                    negocios: "🏪",
                  }[tab];

                  return (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom: "1px solid var(--color-border)",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(255,255,255,0.03)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <td style={{ padding: "10px 8px" }}>
                        {imagen ? (
                          <img
                            src={imagen}
                            alt={titulo}
                            style={{
                              width: "48px",
                              height: "48px",
                              objectFit: "cover",
                              borderRadius: "8px",
                              background: "#111",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "48px",
                              height: "48px",
                              borderRadius: "8px",
                              background: "#1a1a1a",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "24px",
                            }}
                          >
                            {emoji}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "10px 8px", fontWeight: 500 }}>
                        {titulo}
                      </td>
                      <td
                        style={{
                          padding: "10px 8px",
                          color: "var(--color-text-muted)",
                          maxWidth: "300px",
                          whiteSpace: "normal",
                          wordBreak: "break-word",
                        }}
                      >
                        {descripcion.length > 80
                          ? descripcion.substring(0, 80) + "..."
                          : descripcion}
                      </td>
                      <td style={{ padding: "10px 8px" }}>
                        <BadgeEstado estado={item.estado || "pendiente"} />
                      </td>
                      <td
                        style={{
                          padding: "10px 8px",
                          color: "var(--color-text-muted)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {tiempoRelativo(item.created_at)}
                      </td>
                      <td
                        style={{
                          padding: "10px 8px",
                          color: "#e06c75",
                          fontSize: "12px",
                        }}
                      >
                        {item.estado === "rechazado" && item.nota_rechazo
                          ? item.nota_rechazo
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "8px",
                marginTop: "24px",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  padding: "6px 12px",
                  background: "var(--color-bg-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "6px",
                  fontFamily: "var(--font-display)",
                  fontSize: "12px",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  opacity: currentPage === 1 ? 0.5 : 1,
                  color: "var(--color-text)",
                }}
              >
                ← Anterior
              </button>
              <span
                style={{ fontSize: "13px", color: "var(--color-text-muted)" }}
              >
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                  padding: "6px 12px",
                  background: "var(--color-bg-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "6px",
                  fontFamily: "var(--font-display)",
                  fontSize: "12px",
                  cursor:
                    currentPage === totalPages ? "not-allowed" : "pointer",
                  opacity: currentPage === totalPages ? 0.5 : 1,
                  color: "var(--color-text)",
                }}
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}

      {/* Modales */}
      {modal && MODAL_MAP[modal]}

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
