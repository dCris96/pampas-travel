// app/mis-publicaciones/page.js
// El usuario ve TODAS sus publicaciones y su estado de moderación

"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import BadgeEstado from "@/components/BadgeEstado";
import FormularioProducto from "@/components/FormularioProducto";
import FormularioNegocio from "@/components/FormularioNegocio";
import FormularioLugar from "@/components/FormularioLugar";
import FormularioExperiencia from "@/components/FormularioExperiencia";
import "@/styles/mis-publicaciones.css";

const TABS = [
  { id: "experiencias", label: "Experiencias", emoji: "📸" },
  { id: "productos", label: "Productos", emoji: "📦" },
  { id: "negocios", label: "Negocios", emoji: "🏪" },
  { id: "lugares", label: "Lugares", emoji: "🗺️" },
];

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
    lugares: [],
  });
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // 'experiencia'|'producto'|'negocio'|'lugar'
  const [toast, setToast] = useState("");

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
      const [expRes, prodRes, negRes, lugRes] = await Promise.all([
        supabase
          .from("experiencias")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("productos")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("negocios")
          .select("*")
          .eq("creado_por", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("lugares")
          .select("*")
          .eq("creado_por", user.id)
          .order("created_at", { ascending: false }),
      ]);

      const newData = {
        experiencias: expRes.data || [],
        productos: prodRes.data || [],
        negocios: negRes.data || [],
        lugares: lugRes.data || [],
      };

      setData(newData);

      // Conteo de pendientes por tipo
      const pendientes = {};
      Object.entries(newData).forEach(([key, arr]) => {
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

  function renderItem(item, tipo) {
    const titulo =
      item.titulo || item.nombre || item.contenido?.substring(0, 60) + "...";
    const preview = item.descripcion || item.contenido || "";
    const img = item.imagen_url || null;
    const emoji = {
      experiencias: "📸",
      productos: "📦",
      negocios: "🏪",
      lugares: "🗺️",
    }[tipo];

    return (
      <div
        key={item.id}
        className={`mispub-item ${item.estado || "pendiente"}`}
      >
        {/* Imagen o placeholder */}
        {img ? (
          <img src={img} alt={titulo} className="mispub-item-img" />
        ) : (
          <div className="mispub-item-img-placeholder">{emoji}</div>
        )}

        <div className="mispub-item-info">
          <div className="mispub-item-titulo">{titulo}</div>
          {preview && <p className="mispub-item-preview">{preview}</p>}
          <div className="mispub-item-footer">
            <BadgeEstado estado={item.estado || "pendiente"} />
            <span className="mispub-fecha">
              {tiempoRelativo(item.created_at)}
            </span>
          </div>
          {/* Razón del rechazo */}
          {item.estado === "rechazado" && item.nota_rechazo && (
            <div className="mispub-nota-rechazo">
              <strong>Razón:</strong> {item.nota_rechazo}
            </div>
          )}
        </div>
      </div>
    );
  }

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
    lugar: (
      <FormularioLugar
        onClose={() => setModal(null)}
        onPublicado={() => {
          setModal(null);
          mostrarToast("✅ Lugar enviado para revisión.");
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
          { label: "📸 Experiencia", modal: "experiencia" },
          { label: "📦 Producto", modal: "producto" },
          { label: "🏪 Negocio", modal: "negocio" },
          { label: "🗺️ Lugar", modal: "lugar" },
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

      {/* Lista */}
      {loading ? (
        Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="mispub-item pendiente">
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 8,
                background:
                  "linear-gradient(90deg,#111 25%,#1a1a1a 50%,#111 75%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.5s infinite",
                flexShrink: 0,
              }}
            />
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div
                style={{
                  height: 14,
                  width: "60%",
                  borderRadius: 4,
                  background:
                    "linear-gradient(90deg,#111 25%,#1a1a1a 50%,#111 75%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.5s infinite",
                }}
              />
              <div
                style={{
                  height: 11,
                  width: "40%",
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
        <div className="mispub-vacio">
          <div className="mispub-vacio-icon">
            {
              {
                experiencias: "📸",
                productos: "📦",
                negocios: "🏪",
                lugares: "🗺️",
              }[tab]
            }
          </div>
          <p>
            No tienes {TABS.find((t) => t.id === tab)?.label.toLowerCase()}{" "}
            publicadas todavía.
          </p>
        </div>
      ) : (
        items.map((item) => renderItem(item, tab))
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
