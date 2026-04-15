// app/productos/page.js
// Lista pública de productos aprobados + botón para publicar el propio

"use client";

import { useEffect, useState, useMemo } from "react";
import { getProductos } from "@/app/actions/productos";
import { useAuth } from "@/context/AuthContext";
import FormularioProducto from "@/components/FormularioProducto";
import BadgeEstado from "@/components/BadgeEstado";
import "@/styles/productos.css";

const CATEGORIAS = [
  { valor: "todos", label: "Todos", emoji: "🛒" },
  { valor: "artesania", label: "Artesanía", emoji: "🧶" },
  { valor: "gastronomia", label: "Gastronomía", emoji: "🍲" },
  { valor: "ropa", label: "Ropa", emoji: "👕" },
  { valor: "servicios", label: "Servicios", emoji: "⚙️" },
  { valor: "agricultura", label: "Agricultura", emoji: "🌽" },
  { valor: "otro", label: "Otro", emoji: "📦" },
];

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

function formatPrecio(precio) {
  if (!precio) return null;
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
  }).format(precio);
}

export default function ProductosPage() {
  const { user } = useAuth();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoria, setCategoria] = useState("todos");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [toast, setToast] = useState("");

  // 🔧 Conecta con: tabla public.productos WHERE estado = 'aprobado'
  useEffect(() => {
    async function cargar() {
      try {
        const data = await getProductos();
        setProductos(data);
      } catch (err) {
        console.error("Error:", err.message);
        // Mostrar mensaje en UI
      } finally {
        setLoading(false);
      }
    }
    cargar();
  }, []);

  const filtrados = useMemo(() => {
    if (categoria === "todos") return productos;
    return productos.filter((p) => p.categoria === categoria);
  }, [productos, categoria]);

  function handlePublicado() {
    setModalAbierto(false);
    setToast(
      "✅ Producto enviado. Quedará publicado tras la revisión del equipo.",
    );
    setTimeout(() => setToast(""), 5000);
  }

  return (
    <div>
      {/* Header */}
      <div className="productos-header">
        <div className="productos-header-text">
          <h1>Productos Locales</h1>
          <p>Artesanías, alimentos y servicios del Valle de los Vientos.</p>
        </div>
        {user ? (
          <button
            className="btn-publicar"
            onClick={() => setModalAbierto(true)}
          >
            <IconPlus /> Publicar producto
          </button>
        ) : (
          <a
            href="/login"
            className="btn-publicar"
            style={{ textDecoration: "none" }}
          >
            Inicia sesión para publicar
          </a>
        )}
      </div>

      {/* Aviso comunidad */}
      <div className="productos-aviso-comunidad">
        <div className="productos-aviso-icon">🤝</div>
        <div className="productos-aviso-texto">
          <h3>Marketplace comunitario</h3>
          <p>
            Productores y artesanos locales comparten sus productos aquí. Todas
            las publicaciones son revisadas antes de aparecer.
            {!user && " Inicia sesión para publicar el tuyo."}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="productos-filtros">
        {CATEGORIAS.map((cat) => (
          <button
            key={cat.valor}
            className={`producto-filtro-btn ${categoria === cat.valor ? "activo" : ""}`}
            onClick={() => setCategoria(cat.valor)}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
        {!loading && (
          <span
            style={{
              marginLeft: "auto",
              fontSize: 12,
              color: "#555",
              fontFamily: "var(--font-display)",
            }}
          >
            {filtrados.length} producto{filtrados.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="productos-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              style={{
                borderRadius: 12,
                overflow: "hidden",
                border: "1px solid #1f1f1f",
                backgroundColor: "#111",
              }}
            >
              <div
                style={{
                  height: 190,
                  background:
                    "linear-gradient(90deg,#111 25%,#1a1a1a 50%,#111 75%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.5s infinite",
                }}
              />
              <div
                style={{
                  padding: 14,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
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
                <div
                  style={{
                    height: 11,
                    borderRadius: 4,
                    width: "50%",
                    background:
                      "linear-gradient(90deg,#111 25%,#1a1a1a 50%,#111 75%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 1.5s infinite",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : filtrados.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "80px 20px",
            background: "var(--color-bg-card)",
            border: "1px solid var(--color-border)",
            borderRadius: 12,
          }}
        >
          <div style={{ fontSize: 44, marginBottom: 14, opacity: 0.3 }}>📦</div>
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 17,
              color: "var(--color-text)",
              marginBottom: 6,
            }}
          >
            {categoria !== "todos"
              ? "Sin productos en esta categoría"
              : "Sin productos todavía"}
          </h3>
          <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
            {user
              ? "Sé el primero en publicar un producto local."
              : "Inicia sesión para publicar."}
          </p>
        </div>
      ) : (
        <div className="productos-grid">
          {filtrados.map((prod) => {
            const precio = formatPrecio(prod.precio);
            return (
              <div key={prod.id} className="card-producto">
                <div className="card-producto-img-wrapper">
                  {prod.imagen_url ? (
                    <img
                      src={prod.imagen_url}
                      alt={prod.nombre}
                      className="card-producto-img"
                    />
                  ) : (
                    <div className="card-producto-img-placeholder">📦</div>
                  )}
                  <span className="card-producto-cat">{prod.categoria}</span>
                </div>
                <div className="card-producto-body">
                  <h3 className="card-producto-nombre">{prod.nombre}</h3>
                  {prod.descripcion && (
                    <p className="card-producto-desc">{prod.descripcion}</p>
                  )}
                  <div className="card-producto-footer">
                    {precio ? (
                      <span className="card-producto-precio">{precio}</span>
                    ) : (
                      <span className="card-producto-precio sin-precio">
                        Consultar
                      </span>
                    )}
                    {prod.contacto && (
                      <a
                        href={`https://wa.me/${prod.contacto.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-contactar-producto"
                      >
                        💬 Contactar
                      </a>
                    )}
                  </div>
                  {prod.ubicacion && (
                    <div
                      style={{
                        fontSize: 11,
                        color: "#555",
                        fontFamily: "var(--font-display)",
                        marginTop: 8,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      📍 {prod.ubicacion}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalAbierto && (
        <FormularioProducto
          onClose={() => setModalAbierto(false)}
          onPublicado={handlePublicado}
        />
      )}

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
