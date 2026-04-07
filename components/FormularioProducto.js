// components/FormularioProducto.js
// Modal para que el usuario publique un producto local
// Estado inicial: 'pendiente' (requiere aprobación del admin)

"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import "@/styles/formulario-exp.css";
import "@/styles/modal-admin.css";

const MAX_MB = 3;
const MAX_BYTES = MAX_MB * 1024 * 1024;

const CATEGORIAS = [
  { valor: "artesania", label: "🧶 Artesanía" },
  { valor: "gastronomia", label: "🍲 Gastronomía" },
  { valor: "ropa", label: "👕 Ropa y textiles" },
  { valor: "servicios", label: "⚙️ Servicios" },
  { valor: "agricultura", label: "🌽 Agricultura" },
  { valor: "otro", label: "📦 Otro" },
];

const IconX = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default function FormularioProducto({ onClose, onPublicado }) {
  const { user, perfil } = useAuth();

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    categoria: "artesania",
    contacto: "",
    ubicacion: "",
  });
  const [imagen, setImagen] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  function setField(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function procesarImagen(file) {
    if (!file.type.startsWith("image/")) {
      setError("Solo se permiten imágenes.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(`La imagen no puede superar ${MAX_MB}MB.`);
      return;
    }
    setImagen(file);
    setPreview(URL.createObjectURL(file));
    setError("");
  }

  // ── SUBIR IMAGEN A STORAGE ──
  // Bucket: experiencias (reutilizamos el mismo)
  // 🔧 Puedes crear un bucket "productos" separado si prefieres
  async function subirImagen() {
    if (!imagen) return null;
    const ext = imagen.name.split(".").pop();
    const path = `${user.id}/producto_${Date.now()}.${ext}`;
    setProgreso(30);

    const { error } = await supabase.storage
      .from("experiencias")
      .upload(path, imagen, { cacheControl: "3600", upsert: false });

    if (error) throw new Error("No se pudo subir la imagen.");
    setProgreso(80);

    const { data: urlData } = supabase.storage
      .from("experiencias")
      .getPublicUrl(path);

    setProgreso(100);
    return urlData.publicUrl;
  }

  // ── PUBLICAR ──
  // 🔧 Conecta con: tabla public.productos INSERT
  // El estado queda 'pendiente' automáticamente (default en BD)
  async function handlePublicar() {
    setError("");
    if (!form.nombre.trim()) {
      setError("El nombre del producto es obligatorio.");
      return;
    }

    setLoading(true);
    setProgreso(0);

    try {
      const imagenUrl = await subirImagen();

      const { error } = await supabase.from("productos").insert({
        user_id: user.id,
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim() || null,
        precio: form.precio ? parseFloat(form.precio) : null,
        categoria: form.categoria,
        imagen_url: imagenUrl,
        contacto: form.contacto.trim() || null,
        ubicacion: form.ubicacion.trim() || null,
        // estado: 'pendiente' (default en BD — no lo enviamos)
      });

      if (error) throw error;
      onPublicado();
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al publicar.");
      setProgreso(0);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-card" style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <span className="modal-titulo">📦 Publicar producto local</span>
          <button
            className="btn-cerrar-modal"
            onClick={onClose}
            disabled={loading}
          >
            <IconX />
          </button>
        </div>

        {/* Aviso de moderación */}
        <div
          style={{
            margin: "12px 22px 0",
            padding: "10px 14px",
            background: "rgba(245,197,66,0.07)",
            border: "1px solid rgba(245,197,66,0.2)",
            borderRadius: 8,
            fontSize: 12,
            color: "#888",
            fontFamily: "var(--font-display)",
            lineHeight: 1.5,
          }}
        >
          ⏳ Tu publicación quedará{" "}
          <strong style={{ color: "#f5c542" }}>pendiente de aprobación</strong>.
          El equipo la revisará y la publicará en breve.
        </div>

        <div className="form-admin">
          {/* Nombre */}
          <div className="form-admin-grupo">
            <label className="form-admin-label">
              Nombre del producto <span className="requerido">*</span>
            </label>
            <input
              type="text"
              className="form-admin-input"
              placeholder="¿Qué estás vendiendo?"
              value={form.nombre}
              onChange={(e) => setField("nombre", e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Descripción */}
          <div className="form-admin-grupo">
            <label className="form-admin-label">Descripción</label>
            <textarea
              className="form-admin-textarea"
              placeholder="Describe tu producto: materiales, tamaños, cómo lo haces..."
              value={form.descripcion}
              onChange={(e) => setField("descripcion", e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Categoría + Precio */}
          <div className="form-admin-fila">
            <div className="form-admin-grupo">
              <label className="form-admin-label">Categoría</label>
              <select
                className="form-admin-select"
                value={form.categoria}
                onChange={(e) => setField("categoria", e.target.value)}
                disabled={loading}
              >
                {CATEGORIAS.map((c) => (
                  <option key={c.valor} value={c.valor}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-admin-grupo">
              <label className="form-admin-label">Precio (MXN)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="form-admin-input"
                placeholder="0.00 (vacío si es a consultar)"
                value={form.precio}
                onChange={(e) => setField("precio", e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Imagen */}
          <div className="form-admin-grupo">
            <label className="form-admin-label">Foto del producto</label>
            {preview ? (
              <div className="upload-preview">
                <img
                  src={preview}
                  alt="Preview"
                  className="upload-preview-img"
                />
                <button
                  className="btn-quitar-imagen"
                  onClick={() => {
                    setImagen(null);
                    setPreview(null);
                  }}
                  disabled={loading}
                >
                  ✕
                </button>
              </div>
            ) : (
              <div
                className="upload-zona"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    e.target.files[0] && procesarImagen(e.target.files[0])
                  }
                  disabled={loading}
                  style={{ display: "none" }}
                />
                <div className="upload-zona-icon">📷</div>
                <div className="upload-zona-texto">Subir foto del producto</div>
                <div className="upload-zona-subtext">Máximo {MAX_MB}MB</div>
              </div>
            )}
          </div>

          {/* Contacto + Ubicación */}
          <div className="form-admin-fila">
            <div className="form-admin-grupo">
              <label className="form-admin-label">Contacto (WhatsApp)</label>
              <input
                type="text"
                className="form-admin-input"
                placeholder="+52 744 123 4567"
                value={form.contacto}
                onChange={(e) => setField("contacto", e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="form-admin-grupo">
              <label className="form-admin-label">Dónde encontrarlo</label>
              <input
                type="text"
                className="form-admin-input"
                placeholder="Mercado, colonia..."
                value={form.ubicacion}
                onChange={(e) => setField("ubicacion", e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Progress */}
          {loading && progreso > 0 && (
            <div className="upload-progress">
              <div className="upload-progress-label">
                <span>Publicando...</span>
                <span>{progreso}%</span>
              </div>
              <div className="upload-progress-bar">
                <div
                  className="upload-progress-fill"
                  style={{ width: `${progreso}%` }}
                />
              </div>
            </div>
          )}

          {error && <div className="form-admin-error">⚠️ {error}</div>}
        </div>

        <div className="modal-footer">
          <button className="btn-cancelar" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button
            className="btn-submit-exp"
            onClick={handlePublicar}
            disabled={loading || !form.nombre.trim()}
          >
            {loading ? "Publicando..." : "📦 Enviar para revisión"}
          </button>
        </div>
      </div>
    </div>
  );
}
