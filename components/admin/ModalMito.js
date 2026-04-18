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
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import {
  subirImagenWebP,
  validarArchivo,
  formatearTamaño,
} from "@/lib/imageUtils";
import "@/styles/formulario-exp.css";
import "@/styles/modal-admin.css";
import { getCaserios } from "@/app/actions/caserios";

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

export default function ModalMito({ mito = null, onClose, onGuardado }) {
  const { user } = useAuth();
  const esEdicion = !!mito;

  // Variable para crear cliente Supabase, necesario para subir imagenes al storage desde este componente. Si ya tienes un cliente global, puedes importarlo directamente.
  const supabase = createClient();

  // ── ESTADO DEL FORMULARIO (sin imagen_url, manejado aparte) ──
  const [form, setForm] = useState({
    titulo: mito?.titulo || "",
    subtitulo: mito?.subtitulo || "",
    contenido: mito?.contenido || "",
    origen: mito?.origen || "",
    epoca: mito?.epoca || "",
    audio_url: mito?.audio_url || "",
    duracion: mito?.duracion || "",
    activo: mito?.activo !== undefined ? mito.activo : true,
  });

  // ── ESTADO PARA LA IMAGEN ──
  const [imagenFile, setImagenFile] = useState(null); // nuevo archivo seleccionado
  const [previewUrl, setPreviewUrl] = useState(mito?.cover_url || null); // preview (local o existente)
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
        subtitulo: form.subtitulo.trim() || null,
        contenido: form.contenido.trim() || null,
        origen: form.origen.trim() || null,
        epoca: form.epoca.trim() || null,
        audio_url: form.audio_url.trim() || null,
        duracion: form.duracion.trim() || null,
        cover_url: imagenUrl,
        activo: form.activo,
      };

      if (esEdicion) {
        const { data, error } = await supabase
          .from("mitos")
          .update(payload)
          .eq("id", lugar.id)
          .select()
          .single();

        if (error) throw error;
        onGuardado(data, "actualizado");
      } else {
        const { data, error } = await supabase
          .from("mitos")
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
            {esEdicion ? "✏️ Editar mito" : "➕ Nuevo Mito o Leyenda"}
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
              placeholder="Nombre del Mito o Leyenda"
              value={form.titulo}
              onChange={(e) => setField("titulo", e.target.value)}
              disabled={uploading}
            />
          </div>

          <div className="form-admin-grupo">
            <label className="form-admin-label">
              Subtitulo <span className="requerido">*</span>
            </label>
            <input
              type="text"
              className="form-admin-input"
              placeholder="Subtitulo o frase corta"
              value={form.subtitulo}
              onChange={(e) => setField("subtitulo", e.target.value)}
              disabled={uploading}
            />
          </div>

          {/* Descripción */}
          <div className="form-admin-grupo">
            <label className="form-admin-label">Contenido</label>
            <textarea
              className="form-admin-textarea"
              placeholder="Contenido del mito..."
              value={form.contenido}
              onChange={(e) => setField("contenido", e.target.value)}
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

          {/* ORIGEN Y EPOCA */}
          <div className="form-admin-fila">
            <div className="form-admin-grupo">
              <label className="form-admin-label">Origen</label>
              <input
                type="text"
                step="any"
                className="form-admin-input"
                placeholder="Origen del mito"
                value={form.origen}
                onChange={(e) => setField("origen", e.target.value)}
                disabled={uploading}
              />
            </div>
            <div className="form-admin-grupo">
              <label className="form-admin-label">Epoca</label>
              <input
                type="text"
                step="any"
                className="form-admin-input"
                placeholder="Época del mito"
                value={form.epoca}
                onChange={(e) => setField("epoca", e.target.value)}
                disabled={uploading}
              />
            </div>
          </div>

          <div className="form-admin-sep" />

          {/* URL DEL AUDIO */}
          <div className="form-admin-grupo">
            <label className="form-admin-label">
              Url del audio <span className="requerido">*</span>
            </label>
            <input
              type="text"
              className="form-admin-input"
              placeholder="URL del archivo de audio"
              value={form.audio_url}
              onChange={(e) => setField("audio_url", e.target.value)}
              disabled={uploading}
            />
          </div>

          {/* Checkboxes */}
          <div className="form-admin-fila">
            <div className="form-admin-grupo">
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
                ? "💾 Actualizar mito"
                : "➕ Crear mito"}
          </button>
        </div>
      </div>
    </div>
  );
}
