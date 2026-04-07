// components/admin/ModalLugar.js
// ─────────────────────────────────────────────────────
// Modal para CREAR o EDITAR un lugar turístico
//
// Props:
//   lugar     → null (crear) | objeto (editar)
//   onClose   → cerrar modal
//   onGuardado → callback con el lugar guardado
// ─────────────────────────────────────────────────────

"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
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

  // ── ESTADO DEL FORMULARIO ──
  // Si es edición, precarga los datos existentes
  const [form, setForm] = useState({
    titulo: lugar?.titulo || "",
    descripcion: lugar?.descripcion || "",
    categoria: lugar?.categoria || "naturaleza",
    imagen_url: lugar?.imagen_url || "",
    direccion: lugar?.direccion || "",
    latitud: lugar?.latitud || "",
    longitud: lugar?.longitud || "",
    destacado: lugar?.destacado || false,
    activo: lugar?.activo !== undefined ? lugar.activo : true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ── ACTUALIZAR CAMPO ──
  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // ── GUARDAR ──
  // 🔧 Conecta con: tabla public.lugares → INSERT o UPDATE
  async function handleGuardar() {
    setError("");

    // Validaciones
    if (!form.titulo.trim()) {
      setError("El título es obligatorio.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim() || null,
        categoria: form.categoria,
        imagen_url: form.imagen_url.trim() || null,
        direccion: form.direccion.trim() || null,
        latitud: form.latitud ? parseFloat(form.latitud) : null,
        longitud: form.longitud ? parseFloat(form.longitud) : null,
        destacado: form.destacado,
        activo: form.activo,
      };

      if (esEdicion) {
        // ── ACTUALIZAR ──
        // 🔧 UPDATE WHERE id = lugar.id
        const { data, error } = await supabase
          .from("lugares")
          .update(payload)
          .eq("id", lugar.id)
          .select()
          .single();

        if (error) throw error;
        onGuardado(data, "actualizado");
      } else {
        // ── CREAR ──
        // 🔧 INSERT con creado_por = user.id
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
    } finally {
      setLoading(false);
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
            disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
            />
          </div>

          {/* Categoría */}
          <div className="form-admin-grupo">
            <label className="form-admin-label">Categoría</label>
            <select
              className="form-admin-select"
              value={form.categoria}
              onChange={(e) => setField("categoria", e.target.value)}
              disabled={loading}
            >
              {CATEGORIAS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* URL de imagen */}
          <div className="form-admin-grupo">
            <label className="form-admin-label">URL de imagen</label>
            <div className="form-admin-url-wrapper">
              <input
                type="url"
                className="form-admin-input"
                placeholder="https://..."
                value={form.imagen_url}
                onChange={(e) => setField("imagen_url", e.target.value)}
                disabled={loading}
              />
              {/* Preview de la imagen */}
              {form.imagen_url && (
                <img
                  src={form.imagen_url}
                  alt="Preview"
                  className="form-admin-img-preview"
                  onError={(e) => (e.target.style.display = "none")}
                />
              )}
            </div>
            <span className="form-admin-ayuda">
              Usa una URL de Unsplash o sube una imagen a Supabase Storage y
              pega la URL pública.
            </span>
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
              disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
              />
              <span className="form-admin-check-label">⭐ Lugar destacado</span>
            </label>
            <label className="form-admin-check">
              <input
                type="checkbox"
                checked={form.activo}
                onChange={(e) => setField("activo", e.target.checked)}
                disabled={loading}
              />
              <span className="form-admin-check-label">
                ✅ Activo (visible)
              </span>
            </label>
          </div>

          {/* Error */}
          {error && <div className="form-admin-error">⚠️ {error}</div>}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-cancelar" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button
            className="btn-submit-exp"
            onClick={handleGuardar}
            disabled={loading || !form.titulo.trim()}
          >
            {loading
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
