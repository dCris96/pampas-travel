// components/admin/ModalVideos.js
// ─────────────────────────────────────────────────────
// Modal para CREAR o EDITAR un Videos turístico
//
// Props:
//   Videos     → null (crear) | objeto (editar)
//   onClose   → cerrar modal
//   onGuardado → callback con el Videos guardado
// ─────────────────────────────────────────────────────

"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import "@/styles/formulario-exp.css";
import "@/styles/modal-admin.css";

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
  "paisajes",
  "festividades",
  "gastronomia",
  "turismo",
  "cultura",
  "historia",
  "artesanías",
  "aventura",
  "eventos",
  "servicios",
  "vida_local",
];

export default function ModalVideos({ video = null, onClose, onGuardado }) {
  const { user } = useAuth();
  const esEdicion = !!video;

  // ── ESTADO DEL FORMULARIO (sin imagen_url, manejado aparte) ──
  const [form, setForm] = useState({
    titulo: video?.titulo || "",
    descripcion: video?.descripcion || "",
    youtube_id: video?.youtube_id || "",
    categoria: video?.categoria || "paisajes",
    duracion: video?.duracion || "",
    destacado: video?.destacado || false,
    activo: video?.activo !== undefined ? video.activo : true,
  });

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  // Variable para crear cliente Supabase, necesario para subir imagenes al storage desde este componente. Si ya tienes un cliente global, puedes importarlo directamente.
  const supabase = createClient();

  // ── ACTUALIZAR CAMPO TEXTO ──
  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // ── GUARDAR (INSERT o UPDATE) ──
  async function handleGuardar() {
    setError("");

    if (!form.titulo.trim()) {
      setError("El título es obligatorio.");
      return;
    }

    try {
      const payload = {
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim() || null,
        youtube_id: form.youtube_id.trim() || null,
        categoria: form.categoria,
        duracion: form.duracion.trim() || null,
        destacado: form.destacado,
        activo: form.activo,
      };

      if (esEdicion) {
        const { data, error } = await supabase
          .from("videos")
          .update(payload)
          .eq("id", video.id)
          .select()
          .single();

        if (error) throw error;
        onGuardado(data, "actualizado");
      } else {
        const { data, error } = await supabase
          .from("videos")
          .insert({ ...payload, creado_por: user.id })
          .select()
          .single();

        if (error) throw error;
        onGuardado(data, "creado");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al guardar. Verifica los datos.");
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
            {esEdicion ? "✏️ Editar Video" : "➕ Nuevo Video"}
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
              placeholder="Título del video..."
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
              placeholder="Descripción..."
              value={form.descripcion}
              onChange={(e) => setField("descripcion", e.target.value)}
              disabled={uploading}
            />
          </div>

          {/* Youtube */}
          <div className="form-admin-grupo">
            <label className="form-admin-label">
              ID de Youtube <span className="requerido">*</span>
            </label>
            <input
              type="text"
              className="form-admin-input"
              placeholder="ID..."
              value={form.youtube_id}
              onChange={(e) => setField("youtube_id", e.target.value)}
              disabled={uploading}
            />
          </div>

          {/* CATEGORIA Y Duración */}
          <div className="form-admin-fila">
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
            {/* Duración */}
            <div className="form-admin-grupo">
              <label className="form-admin-label">Duración (minutos)</label>
              <input
                type="text"
                step="any"
                className="form-admin-input"
                placeholder="Ej: 7:34"
                value={form.duracion}
                onChange={(e) => setField("duracion", e.target.value)}
                disabled={uploading}
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="form-admin-fila">
            <label className="form-admin-check">
              <input
                type="checkbox"
                checked={form.destacado}
                onChange={(e) => setField("destacado", e.target.checked)}
                disabled={uploading}
              />
              <span className="form-admin-check-label">⭐ Video destacado</span>
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
