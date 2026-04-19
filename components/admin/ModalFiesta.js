// components/admin/ModalFiesta.js
// Modal para CREAR o EDITAR una festividad (4 imágenes: card, hero, medio, final)

"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { subirImagenWebP, validarArchivo } from "@/lib/imageUtils";
import "@/styles/formulario-exp.css";
import "@/styles/modal-admin.css";

const MAX_MB = 5;

const IconX = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// Configuración de las cuatro imágenes
const IMAGENES_CONFIG = [
  { key: "imagen_card", label: "Imagen Card (tarjeta)", bucketFolder: "card" },
  {
    key: "imagen_hero",
    label: "Imagen Hero (principal)",
    bucketFolder: "hero",
  },
  { key: "imagen_medio", label: "Imagen Medio", bucketFolder: "medio" },
  { key: "imagen_final", label: "Imagen Final", bucketFolder: "final" },
];

export default function ModalFiesta({ fiesta = null, onClose, onGuardado }) {
  const { user } = useAuth();
  const supabase = createClient();
  const esEdicion = !!fiesta;

  // --- Estado del formulario (solo campos de festividades) ---
  const [form, setForm] = useState({
    titulo: fiesta?.titulo || "",
    subtitulo: fiesta?.subtitulo || "",
    fecha: fiesta?.fecha || "",
    fecha_fin: fiesta?.fecha_fin || "",
    descripcion_corta: fiesta?.descripcion_corta || "",
    descripcion: fiesta?.descripcion || "",
    descripcion_2: fiesta?.descripcion_2 || "",
    descripcion_3: fiesta?.descripcion_3 || "",
    color_acento: fiesta?.color_acento || "",
    activo: fiesta?.activo !== undefined ? fiesta.activo : true,
  });

  // --- Estado para las cuatro imágenes ---
  const [imagenes, setImagenes] = useState(() => {
    const initial = {};
    for (const cfg of IMAGENES_CONFIG) {
      initial[cfg.key] = {
        file: null,
        preview: fiesta?.[cfg.key] || null,
        removed: false, // marca si se eliminó una imagen existente
      };
    }
    return initial;
  });

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRefs = useRef({});

  // Liberar URLs blob al desmontar
  useEffect(() => {
    return () => {
      for (const cfg of IMAGENES_CONFIG) {
        const preview = imagenes[cfg.key]?.preview;
        if (preview && preview.startsWith("blob:")) {
          URL.revokeObjectURL(preview);
        }
      }
    };
  }, [imagenes]);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // Procesar una imagen (validación + preview)
  function procesarImagen(file, imageKey) {
    setError("");
    const errorValidacion = validarArchivo(file);
    if (errorValidacion) {
      setError(errorValidacion);
      return false;
    }

    // Liberar preview anterior si era blob
    const prevPreview = imagenes[imageKey]?.preview;
    if (prevPreview && prevPreview.startsWith("blob:")) {
      URL.revokeObjectURL(prevPreview);
    }

    const url = URL.createObjectURL(file);
    setImagenes((prev) => ({
      ...prev,
      [imageKey]: {
        file,
        preview: url,
        removed: false,
      },
    }));
    return true;
  }

  // Quitar imagen (marca como eliminada o simplemente la borra)
  function quitarImagen(imageKey) {
    const prev = imagenes[imageKey];
    if (prev?.preview?.startsWith("blob:")) {
      URL.revokeObjectURL(prev.preview);
    }

    setImagenes((prev) => ({
      ...prev,
      [imageKey]: {
        file: null,
        preview: null,
        removed: true, // indica que debe guardarse null en la BD
      },
    }));

    if (fileInputRefs.current[imageKey]) {
      fileInputRefs.current[imageKey].value = "";
    }
  }

  // Manejadores drag & drop específicos por imagen
  function handleDragOver(e) {
    e.preventDefault();
  }

  function handleDrop(e, imageKey) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) procesarImagen(file, imageKey);
  }

  function handleFileChange(e, imageKey) {
    const file = e.target.files[0];
    if (file) procesarImagen(file, imageKey);
  }

  // Subir una imagen individual al storage
  async function subirUnaImagen(file, imageKey) {
    const carpeta = `${user.id}/festividades/${imageKey}`;
    const url = await subirImagenWebP(
      file,
      supabase,
      "experiencias",
      carpeta,
      // ✅ No pasar quinto argumento → usa el valor por defecto () => {}
    );
    return url;
  }

  // Guardar festividad (crear o actualizar)
  async function handleGuardar() {
    setError("");
    if (!form.titulo.trim()) {
      setError("El título es obligatorio.");
      return;
    }

    setUploading(true);

    try {
      // Construir objeto con las URLs finales de cada imagen
      const imagenesUrls = {};

      for (const cfg of IMAGENES_CONFIG) {
        const key = cfg.key;
        const imgData = imagenes[key];

        if (imgData.removed) {
          // El usuario eliminó la imagen existente → null
          imagenesUrls[key] = null;
        } else if (imgData.file) {
          // Hay un archivo nuevo → subirlo
          const url = await subirUnaImagen(imgData.file, key);
          imagenesUrls[key] = url;
        } else {
          // Sin cambios: mantener el valor original (si existe)
          imagenesUrls[key] = fiesta?.[key] || null;
        }
      }

      const payload = {
        titulo: form.titulo.trim(),
        subtitulo: form.subtitulo.trim() || null,
        fecha: form.fecha || null,
        fecha_fin: form.fecha_fin || null,
        descripcion_corta: form.descripcion_corta.trim() || null,
        descripcion: form.descripcion.trim() || null,
        descripcion_2: form.descripcion_2.trim() || null,
        descripcion_3: form.descripcion_3.trim() || null,
        color_acento: form.color_acento.trim() || null,
        activo: form.activo,
        // Cuatro imágenes
        imagen_card: imagenesUrls.imagen_card,
        imagen_hero: imagenesUrls.imagen_hero,
        imagen_medio: imagenesUrls.imagen_medio,
        imagen_final: imagenesUrls.imagen_final,
      };

      let result;
      if (esEdicion) {
        const { data, error } = await supabase
          .from("festividades")
          .update(payload)
          .eq("id", fiesta.id)
          .select()
          .single();
        if (error) throw error;
        result = data;
        onGuardado(result, "actualizado");
      } else {
        const { data, error } = await supabase
          .from("festividades")
          .insert({ ...payload })
          .select()
          .single();
        if (error) throw error;
        result = data;
        onGuardado(result, "creado");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al guardar. Verifica los datos.");
    } finally {
      setUploading(false);
    }
  }

  // Renderizar un área de drop para cada imagen
  function renderImageUpload(cfg) {
    const key = cfg.key;
    const imgData = imagenes[key];
    const previewUrl = imgData?.preview;
    const hasImage = !!previewUrl;

    return (
      <div className="form-admin-grupo" key={key}>
        <label className="form-admin-label">{cfg.label}</label>

        {hasImage ? (
          <div className="upload-preview">
            <img
              src={previewUrl}
              alt={`Preview ${cfg.label}`}
              className="upload-preview-img"
            />
            <button
              className="btn-quitar-imagen"
              onClick={() => quitarImagen(key)}
              disabled={uploading}
              title="Quitar imagen"
            >
              ✕
            </button>
          </div>
        ) : (
          <div
            className="upload-zona"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, key)}
          >
            <input
              ref={(el) => (fileInputRefs.current[key] = el)}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(e) => handleFileChange(e, key)}
              disabled={uploading}
            />
            <div className="upload-zona-icon">📷</div>
            <div className="upload-zona-texto">
              Arrastra o haz clic para seleccionar
            </div>
            <div className="upload-zona-subtext">
              JPG, PNG, WEBP o GIF — máx {MAX_MB}MB
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-card" style={{ maxWidth: 700 }}>
        <div className="modal-header">
          <span className="modal-titulo">
            {esEdicion ? "✏️ Editar festividad" : "➕ Nueva festividad"}
          </span>
          <button
            className="btn-cerrar-modal"
            onClick={onClose}
            disabled={uploading}
          >
            <IconX />
          </button>
        </div>

        <div className="form-admin">
          {/* Título */}
          <div className="form-admin-grupo">
            <label className="form-admin-label">
              Título <span className="requerido">*</span>
            </label>
            <input
              type="text"
              className="form-admin-input"
              value={form.titulo}
              onChange={(e) => setField("titulo", e.target.value)}
              disabled={uploading}
            />
          </div>

          {/* Subtítulo */}
          <div className="form-admin-grupo">
            <label className="form-admin-label">Subtítulo</label>
            <input
              type="text"
              className="form-admin-input"
              value={form.subtitulo}
              onChange={(e) => setField("subtitulo", e.target.value)}
              disabled={uploading}
            />
          </div>

          {/* Fechas */}
          <div className="form-admin-fila">
            <div className="form-admin-grupo">
              <label className="form-admin-label">Fecha inicio</label>
              <input
                type="date"
                className="form-admin-input"
                value={form.fecha}
                onChange={(e) => setField("fecha", e.target.value)}
                disabled={uploading}
              />
            </div>
            <div className="form-admin-grupo">
              <label className="form-admin-label">Fecha fin</label>
              <input
                type="date"
                className="form-admin-input"
                value={form.fecha_fin}
                onChange={(e) => setField("fecha_fin", e.target.value)}
                disabled={uploading}
              />
            </div>
          </div>

          {/* Descripción corta */}
          <div className="form-admin-grupo">
            <label className="form-admin-label">Descripción corta</label>
            <textarea
              className="form-admin-textarea"
              rows="2"
              value={form.descripcion_corta}
              onChange={(e) => setField("descripcion_corta", e.target.value)}
              disabled={uploading}
            />
          </div>

          {/* Descripción larga 1 */}
          <div className="form-admin-grupo">
            <label className="form-admin-label">Descripción principal</label>
            <textarea
              className="form-admin-textarea"
              rows="4"
              value={form.descripcion}
              onChange={(e) => setField("descripcion", e.target.value)}
              disabled={uploading}
            />
          </div>

          {/* Descripción 2 */}
          <div className="form-admin-grupo">
            <label className="form-admin-label">Descripción adicional 1</label>
            <textarea
              className="form-admin-textarea"
              rows="3"
              value={form.descripcion_2}
              onChange={(e) => setField("descripcion_2", e.target.value)}
              disabled={uploading}
            />
          </div>

          {/* Descripción 3 */}
          <div className="form-admin-grupo">
            <label className="form-admin-label">Descripción adicional 2</label>
            <textarea
              className="form-admin-textarea"
              rows="3"
              value={form.descripcion_3}
              onChange={(e) => setField("descripcion_3", e.target.value)}
              disabled={uploading}
            />
          </div>

          {/* Color acento */}
          <div className="form-admin-grupo">
            <label className="form-admin-label">Color acento (hex)</label>
            <input
              type="text"
              className="form-admin-input"
              placeholder="#FF5733"
              value={form.color_acento}
              onChange={(e) => setField("color_acento", e.target.value)}
              disabled={uploading}
            />
          </div>

          {/* Activo */}
          <div className="form-admin-grupo">
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

          {/* SECCIÓN DE CUATRO IMÁGENES */}
          <div className="form-admin-separator">
            <span>Imágenes de la festividad</span>
          </div>

          {IMAGENES_CONFIG.map((cfg) => renderImageUpload(cfg))}

          {error && <div className="form-admin-error">⚠️ {error}</div>}
        </div>

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
                ? "💾 Actualizar festividad"
                : "➕ Crear festividad"}
          </button>
        </div>
      </div>
    </div>
  );
}
