// components/admin/ModalLugar.js
// ─────────────────────────────────────────────────────
// Modal para CREAR o EDITAR un lugar turístico
// Ahora con drag & drop de imagen que sube al bucket "experiencias"
//
// Props:
//   lugar     → null (crear) | objeto (editar)
//   onClose   → cerrar modal
//   onGuardado → callback con el lugar guardado
// ─────────────────────────────────────────────────────

"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import "@/styles/formulario-exp.css";
import "@/styles/modal-admin.css";

// ── CONSTANTES PARA IMAGEN ──
const MAX_MB = 5;
const MAX_BYTES = MAX_MB * 1024 * 1024;
const TIPOS_IMAGEN = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/jpg",
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

const CATEGORIAS = [
  "naturaleza",
  "patrimonio",
  "mirador",
  "aventura",
  "cultura",
  "gastronomia",
];

export default function ModalLugar({ lugar = null, onClose, onGuardado }) {
  const { user } = useAuth();
  const esEdicion = !!lugar;

  // ── ESTADO DEL FORMULARIO (sin imagen_url, manejado aparte) ──
  const [form, setForm] = useState({
    titulo: lugar?.titulo || "",
    descripcion: lugar?.descripcion || "",
    categoria: lugar?.categoria || "naturaleza",
    direccion: lugar?.direccion || "",
    latitud: lugar?.latitud || "",
    longitud: lugar?.longitud || "",
    destacado: lugar?.destacado || false,
    activo: lugar?.activo !== undefined ? lugar.activo : true,
  });

  // ── ESTADO PARA LA IMAGEN ──
  const [imagenFile, setImagenFile] = useState(null); // nuevo archivo seleccionado
  const [previewUrl, setPreviewUrl] = useState(lugar?.imagen_url || null); // preview (local o existente)
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  // ── Limpiar URL de preview al desmontar ──
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // ── ACTUALIZAR CAMPO TEXTO ──
  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // ── PROCESAR IMAGEN SELECCIONADA (validación y preview) ──
  function procesarImagen(file) {
    setError("");

    if (!TIPOS_IMAGEN.includes(file.type)) {
      setError("Solo se permiten imágenes JPG, PNG, WEBP o GIF.");
      return false;
    }

    if (file.size > MAX_BYTES) {
      setError(
        `La imagen no puede superar ${MAX_MB}MB. Tu archivo pesa ${(file.size / 1024 / 1024).toFixed(1)}MB.`,
      );
      return false;
    }

    // Liberar preview anterior si era blob
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    const url = URL.createObjectURL(file);
    setImagenFile(file);
    setPreviewUrl(url);
    return true;
  }

  // ── DRAG & DROP ──
  function handleDragOver(e) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave() {
    setDragOver(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) procesarImagen(file);
  }

  // ── SELECTOR DE ARCHIVO ──
  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) procesarImagen(file);
  }

  // ── QUITAR IMAGEN ──
  function quitarImagen() {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setImagenFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // ── SUBIR IMAGEN A SUPABASE STORAGE (bucket "experiencias") ──
  async function subirImagen() {
    if (!imagenFile) return null;

    // Organizamos dentro de una carpeta "lugares" para no mezclar con experiencias de usuarios
    const timestamp = Date.now();
    const extension = imagenFile.name.split(".").pop();
    const nombreArchivo = `lugares/${timestamp}_${Math.random().toString(36).substring(2, 8)}.${extension}`;

    setUploadProgress(10);

    const { data, error } = await supabase.storage
      .from("experiencias") // mismo bucket que usa FormularioExperiencia
      .upload(nombreArchivo, imagenFile, {
        cacheControl: "3600",
        upsert: false,
        contentType: imagenFile.type,
      });

    if (error) {
      console.error("Error subiendo imagen:", error);
      throw new Error("No se pudo subir la imagen. Intenta de nuevo.");
    }

    setUploadProgress(70);

    const { data: urlData } = supabase.storage
      .from("experiencias")
      .getPublicUrl(nombreArchivo);

    setUploadProgress(100);
    return urlData.publicUrl;
  }

  // ── GUARDAR (INSERT o UPDATE) ──
  async function handleGuardar() {
    setError("");

    if (!form.titulo.trim()) {
      setError("El título es obligatorio.");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // 1. Subir nueva imagen si existe
      let imagenUrl =
        previewUrl && !previewUrl.startsWith("blob:") ? previewUrl : null;
      if (imagenFile) {
        imagenUrl = await subirImagen();
      } else if (esEdicion && lugar?.imagen_url && previewUrl === null) {
        // El usuario quitó la imagen existente → se guarda null
        imagenUrl = null;
      } else if (!imagenFile && previewUrl && previewUrl.startsWith("blob:")) {
        // No debería ocurrir, pero por seguridad
        imagenUrl = null;
      }

      setUploadProgress(90);

      const payload = {
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim() || null,
        categoria: form.categoria,
        imagen_url: imagenUrl,
        direccion: form.direccion.trim() || null,
        latitud: form.latitud ? parseFloat(form.latitud) : null,
        longitud: form.longitud ? parseFloat(form.longitud) : null,
        destacado: form.destacado,
        activo: form.activo,
      };

      if (esEdicion) {
        const { data, error } = await supabase
          .from("lugares")
          .update(payload)
          .eq("id", lugar.id)
          .select()
          .single();

        if (error) throw error;
        onGuardado(data, "actualizado");
      } else {
        const { data, error } = await supabase
          .from("lugares")
          .insert({ ...payload, creado_por: user.id })
          .select()
          .single();

        if (error) throw error;
        onGuardado(data, "creado");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al guardar. Verifica los datos.");
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-card" style={{ maxWidth: 580 }}>
        {/* Header */}
        <div className="modal-header">
          <span className="modal-titulo">
            {esEdicion ? "✏️ Editar lugar" : "➕ Nuevo lugar turístico"}
          </span>
          <button
            className="btn-cerrar-modal"
            onClick={onClose}
            disabled={uploading}
          >
            <IconX />
          </button>
        </div>

        {/* Formulario */}
        <div className="form-admin">
          {/* Título */}
          <div className="form-admin-grupo">
            <label className="form-admin-label">
              Título <span className="requerido">*</span>
            </label>
            <input
              type="text"
              className="form-admin-input"
              placeholder="Nombre del lugar turístico"
              value={form.titulo}
              onChange={(e) => setField("titulo", e.target.value)}
              disabled={uploading}
            />
          </div>

          {/* Descripción */}
          <div className="form-admin-grupo">
            <label className="form-admin-label">Descripción</label>
            <textarea
              className="form-admin-textarea"
              placeholder="Descripción detallada del lugar..."
              value={form.descripcion}
              onChange={(e) => setField("descripcion", e.target.value)}
              disabled={uploading}
            />
          </div>

          {/* Categoría */}
          <div className="form-admin-grupo">
            <label className="form-admin-label">Categoría</label>
            <select
              className="form-admin-select"
              value={form.categoria}
              onChange={(e) => setField("categoria", e.target.value)}
              disabled={uploading}
            >
              {CATEGORIAS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* ── NUEVA SECCIÓN: DRAG & DROP DE IMAGEN ── */}
          <div className="form-admin-grupo">
            <label className="form-admin-label">Imagen del lugar</label>

            {previewUrl ? (
              <div className="upload-preview">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="upload-preview-img"
                />
                <button
                  className="btn-quitar-imagen"
                  onClick={quitarImagen}
                  disabled={uploading}
                  title="Quitar imagen"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div
                className={`upload-zona ${dragOver ? "drag-over" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
                <div className="upload-zona-icon">📷</div>
                <div className="upload-zona-texto">
                  Arrastra una imagen o haz clic para seleccionar
                </div>
                <div className="upload-zona-subtext">
                  JPG, PNG, WEBP o GIF — máximo {MAX_MB}MB
                </div>
              </div>
            )}

            {/* Barra de progreso durante subida */}
            {uploading && uploadProgress > 0 && (
              <div className="upload-progress" style={{ marginTop: 12 }}>
                <div className="upload-progress-label">
                  <span>Subiendo imagen...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="upload-progress-bar">
                  <div
                    className="upload-progress-fill"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Dirección */}
          <div className="form-admin-grupo">
            <label className="form-admin-label">Dirección</label>
            <input
              type="text"
              className="form-admin-input"
              placeholder="Calle, sector o referencia"
              value={form.direccion}
              onChange={(e) => setField("direccion", e.target.value)}
              disabled={uploading}
            />
          </div>

          {/* Coordenadas */}
          <div className="form-admin-fila">
            <div className="form-admin-grupo">
              <label className="form-admin-label">Latitud</label>
              <input
                type="number"
                step="any"
                className="form-admin-input"
                placeholder="-13.5175"
                value={form.latitud}
                onChange={(e) => setField("latitud", e.target.value)}
                disabled={uploading}
              />
            </div>
            <div className="form-admin-grupo">
              <label className="form-admin-label">Longitud</label>
              <input
                type="number"
                step="any"
                className="form-admin-input"
                placeholder="-72.9721"
                value={form.longitud}
                onChange={(e) => setField("longitud", e.target.value)}
                disabled={uploading}
              />
            </div>
          </div>

          <span className="form-admin-ayuda" style={{ marginTop: -8 }}>
            💡 Para obtener coordenadas: busca el lugar en Google Maps → click
            derecho → "¿Qué hay aquí?" → copia lat, lng
          </span>

          <div className="form-admin-sep" />

          {/* Checkboxes */}
          <div className="form-admin-fila">
            <label className="form-admin-check">
              <input
                type="checkbox"
                checked={form.destacado}
                onChange={(e) => setField("destacado", e.target.checked)}
                disabled={uploading}
              />
              <span className="form-admin-check-label">⭐ Lugar destacado</span>
            </label>
            <label className="form-admin-check">
              <input
                type="checkbox"
                checked={form.activo}
                onChange={(e) => setField("activo", e.target.checked)}
                disabled={uploading}
              />
              <span className="form-admin-check-label">
                ✅ Activo (visible)
              </span>
            </label>
          </div>

          {/* Error general */}
          {error && <div className="form-admin-error">⚠️ {error}</div>}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button
            className="btn-cancelar"
            onClick={onClose}
            disabled={uploading}
          >
            Cancelar
          </button>
          <button
            className="btn-submit-exp"
            onClick={handleGuardar}
            disabled={uploading || !form.titulo.trim()}
          >
            {uploading
              ? "Guardando..."
              : esEdicion
                ? "💾 Actualizar lugar"
                : "➕ Crear lugar"}
          </button>
        </div>
      </div>
    </div>
  );
}
