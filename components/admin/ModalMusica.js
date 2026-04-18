// components/admin/ModalMusica.js
// ─────────────────────────────────────────────────────
// Modal para CREAR o EDITAR un Musica turístico
// Ahora con drag & drop de imagen que sube al bucket "experiencias"
//
// Props:
//   Musica     → null (crear) | objeto (editar)
//   onClose   → cerrar modal
//   onGuardado → callback con el Musica guardado
// ─────────────────────────────────────────────────────

"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import {
  subirImagenWebP,
  validarArchivo,
  formatearTamaño,
} from "@/lib/imageUtils";
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

export default function ModalMusica({ musica = null, onClose, onGuardado }) {
  const { user } = useAuth();
  const esEdicion = !!musica;

  // Variable para crear cliente Supabase, necesario para subir imagenes al storage desde este componente. Si ya tienes un cliente global, puedes importarlo directamente.
  const supabase = createClient();

  // ── ESTADO DEL FORMULARIO (sin imagen_url, manejado aparte) ──
  const [form, setForm] = useState({
    titulo: musica?.titulo || "",
    artista: musica?.artista || "",
    descripcion: musica?.descripcion || "",
    archivo_url: musica?.archivo_url || "",
    genero: musica?.genero || "",
    duracion: musica?.duracion || "",
    destacado: musica?.destacado || false,
    activo: musica?.activo !== undefined ? musica.activo : true,
  });

  // ── ESTADO PARA LA IMAGEN ──
  const [imagenFile, setImagenFile] = useState(null); // nuevo archivo seleccionado
  const [previewUrl, setPreviewUrl] = useState(musica?.cover_url || null); // preview (local o existente)
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

    const errorValidacion = validarArchivo(file);
    if (errorValidacion) {
      setError(errorValidacion);
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

    try {
      // La función subirImagenWebP maneja la conversión a WebP y la subida
      const urlPublica = await subirImagenWebP(
        imagenFile,
        supabase,
        "experiencias", // bucket
        user.id, // carpeta dentro del bucket
        (progreso) => setUploadProgress(progreso), // callback de progreso (0-100)
      );
      return urlPublica;
    } catch (error) {
      console.error("Error subiendo imagen:", error);
      throw new Error(error.message || "No se pudo subir la imagen.");
    }
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
      } else if (esEdicion && musica?.cover_url && previewUrl === null) {
        // El usuario quitó la imagen existente → se guarda null
        imagenUrl = null;
      } else if (!imagenFile && previewUrl && previewUrl.startsWith("blob:")) {
        // No debería ocurrir, pero por seguridad
        imagenUrl = null;
      }

      setUploadProgress(90);

      const payload = {
        titulo: form.titulo.trim(),
        artista: form.artista.trim() || null,
        descripcion: form.descripcion.trim() || null,
        archivo_url: form.archivo_url.trim() || null,
        cover_url: imagenUrl,
        genero: form.genero.trim() || null,
        duracion: form.duracion.trim() || null,
        destacado: form.destacado,
        activo: form.activo,
      };

      if (esEdicion) {
        const { data, error } = await supabase
          .from("musica")
          .update(payload)
          .eq("id", musica.id)
          .select()
          .single();

        if (error) throw error;
        onGuardado(data, "actualizado");
      } else {
        const { data, error } = await supabase
          .from("musica")
          .insert({ ...payload })
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
            {esEdicion ? "✏️ Editar Canción" : "➕ Nueva Canción"}
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
              placeholder="Nombre de la canción"
              value={form.titulo}
              onChange={(e) => setField("titulo", e.target.value)}
              disabled={uploading}
            />
          </div>

          <div className="form-admin-grupo">
            <label className="form-admin-label">
              Artista <span className="requerido">*</span>
            </label>
            <input
              type="text"
              className="form-admin-input"
              placeholder="Nombre del artista"
              value={form.artista}
              onChange={(e) => setField("artista", e.target.value)}
              disabled={uploading}
            />
          </div>

          {/* Descripción */}
          <div className="form-admin-grupo">
            <label className="form-admin-label">Descripción</label>
            <textarea
              className="form-admin-textarea"
              placeholder="Descripción de la canción..."
              value={form.descripcion}
              onChange={(e) => setField("descripcion", e.target.value)}
              disabled={uploading}
            />
          </div>

          {/* ── NUEVA SECCIÓN: DRAG & DROP DE IMAGEN ── */}
          <div className="form-admin-grupo">
            <label className="form-admin-label">Imagen</label>

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

          {/* URL DEL AUDIO */}
          <div className="form-admin-grupo">
            <label className="form-admin-label">
              Url del audio <span className="requerido">*</span>
            </label>
            <input
              type="text"
              className="form-admin-input"
              placeholder="URL del archivo de audio"
              value={form.archivo_url}
              onChange={(e) => setField("archivo_url", e.target.value)}
              disabled={uploading}
            />
          </div>

          {/* Genero y duración */}
          <div className="form-admin-fila">
            <div className="form-admin-grupo">
              <label className="form-admin-label">Genero</label>
              <input
                type="text"
                step="any"
                className="form-admin-input"
                placeholder="Género de la canción"
                value={form.genero}
                onChange={(e) => setField("genero", e.target.value)}
                disabled={uploading}
              />
            </div>
            <div className="form-admin-grupo">
              <label className="form-admin-label">Duración</label>
              <input
                type="text"
                step="any"
                className="form-admin-input"
                placeholder="Duración del audio"
                value={form.duracion}
                onChange={(e) => setField("duracion", e.target.value)}
                disabled={uploading}
              />
            </div>
          </div>

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
              <span className="form-admin-check-label">
                ⭐ Canción destacada
              </span>
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
                ? "💾 Actualizar canción"
                : "➕ Crear canción"}
          </button>
        </div>
      </div>
    </div>
  );
}
