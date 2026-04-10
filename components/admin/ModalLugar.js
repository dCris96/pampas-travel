// components/FormularioLugar.js
"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { subirImagenWebP, validarArchivo } from "@/lib/imageUtils";
import "@/styles/formulario-exp.css";
import "@/styles/modal-admin.css";

const CATEGORIAS = [
  "naturaleza",
  "patrimonio",
  "mirador",
  "aventura",
  "cultura",
  "gastronomia",
];

const IconX = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default function FormularioLugar({ onClose, onPublicado }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    categoria: "naturaleza",
    direccion: "",
    latitud: "",
    longitud: "",
  });
  const [imagen, setImagen] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  function setField(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  // Procesar imagen seleccionada (validación + preview)
  function procesarImagen(file) {
    const errorMsg = validarArchivo(file);
    if (errorMsg) {
      setError(errorMsg);
      return;
    }
    setError("");
    setImagen(file);
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
  }

  // Drag & Drop
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
  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) procesarImagen(file);
  }
  function quitarImagen() {
    if (preview) URL.revokeObjectURL(preview);
    setImagen(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // Publicar lugar (con subida de imagen a Storage)
  async function handlePublicar() {
    setError("");
    if (!form.titulo.trim()) {
      setError("El título es obligatorio.");
      return;
    }
    setSubiendo(true);
    setProgreso(0);

    try {
      let imagenUrl = null;
      if (imagen) {
        imagenUrl = await subirImagenWebP(
          imagen,
          supabase,
          "experiencias", // bucket para imágenes de lugares
          user.id,
          (p) => setProgreso(Math.round(p * 0.8)), // 80% del progreso para la imagen
        );
      }

      setProgreso(85);
      const { error: insertError } = await supabase.from("lugares").insert({
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim() || null,
        categoria: form.categoria,
        direccion: form.direccion.trim() || null,
        imagen_url: imagenUrl,
        latitud: form.latitud ? parseFloat(form.latitud) : null,
        longitud: form.longitud ? parseFloat(form.longitud) : null,
        creado_por: user.id,
      });
      if (insertError) throw insertError;

      setProgreso(100);
      onPublicado();
    } catch (err) {
      console.error("Error al publicar lugar:", err);
      setError(err.message || "Error al enviar. Intenta de nuevo.");
      setProgreso(0);
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-card" style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <span className="modal-titulo">
            🗺️ Sugerir lugar turísticossssssss
          </span>
          <button
            className="btn-cerrar-modal"
            onClick={onClose}
            disabled={subiendo}
          >
            <IconX />
          </button>
        </div>

        <div className="modal-body">
          {/* Aviso de revisión */}
          <div
            style={{
              marginBottom: 20,
              padding: "10px 14px",
              background: "rgba(245,197,66,0.07)",
              border: "1px solid rgba(245,197,66,0.2)",
              borderRadius: 8,
              fontSize: 12,
              color: "#888",
            }}
          >
            ⏳ Tu sugerencia quedará{" "}
            <strong style={{ color: "#f5c542" }}>pendiente de revisión</strong>.
            El equipo verificará y la publicará en el mapa.
          </div>

          {/* Campos del formulario */}
          <div className="form-admin">
            <div className="form-admin-grupo">
              <label className="form-admin-label">
                Nombre del lugar <span className="requerido">*</span>
              </label>
              <input
                type="text"
                className="form-admin-input"
                placeholder="¿Cómo se llama?"
                value={form.titulo}
                onChange={(e) => setField("titulo", e.target.value)}
                disabled={subiendo}
              />
            </div>

            <div className="form-admin-grupo">
              <label className="form-admin-label">Descripción</label>
              <textarea
                className="form-admin-textarea"
                placeholder="¿Qué hay ahí? ¿Por qué vale la pena visitarlo?"
                value={form.descripcion}
                onChange={(e) => setField("descripcion", e.target.value)}
                disabled={subiendo}
              />
            </div>

            <div className="form-admin-grupo">
              <label className="form-admin-label">Categoría</label>
              <select
                className="form-admin-select"
                value={form.categoria}
                onChange={(e) => setField("categoria", e.target.value)}
                disabled={subiendo}
              >
                {CATEGORIAS.map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-admin-grupo">
              <label className="form-admin-label">Dirección o referencia</label>
              <input
                type="text"
                className="form-admin-input"
                placeholder="Cómo llegar..."
                value={form.direccion}
                onChange={(e) => setField("direccion", e.target.value)}
                disabled={subiendo}
              />
            </div>

            {/* DRAG & DROP / PREVIEW DE IMAGEN */}
            {preview ? (
              <div className="upload-preview">
                <img
                  src={preview}
                  alt="Preview"
                  className="upload-preview-img"
                />
                <button
                  className="btn-quitar-imagen"
                  onClick={quitarImagen}
                  disabled={subiendo}
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
                  disabled={subiendo}
                />
                <div className="upload-zona-icon">📷</div>
                <div className="upload-zona-texto">
                  Arrastra una imagen o haz clic para seleccionar
                </div>
                <div className="upload-zona-subtext">
                  JPG, PNG, WEBP o GIF — máximo 10MB (se convertirá a WebP)
                </div>
              </div>
            )}

            {/* Barra de progreso */}
            {subiendo && progreso > 0 && (
              <div className="upload-progress">
                <div className="upload-progress-label">
                  <span>
                    {imagen ? "Procesando imagen..." : "Publicando..."}
                  </span>
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

            {/* Coordenadas */}
            <div className="form-admin-fila">
              <div className="form-admin-grupo">
                <label className="form-admin-label">Latitud (opcional)</label>
                <input
                  type="number"
                  step="any"
                  className="form-admin-input"
                  placeholder="-13.5175"
                  value={form.latitud}
                  onChange={(e) => setField("latitud", e.target.value)}
                  disabled={subiendo}
                />
              </div>
              <div className="form-admin-grupo">
                <label className="form-admin-label">Longitud (opcional)</label>
                <input
                  type="number"
                  step="any"
                  className="form-admin-input"
                  placeholder="-72.9721"
                  value={form.longitud}
                  onChange={(e) => setField("longitud", e.target.value)}
                  disabled={subiendo}
                />
              </div>
            </div>

            {error && <div className="form-admin-error">⚠️ {error}</div>}
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="btn-cancelar"
            onClick={onClose}
            disabled={subiendo}
          >
            Cancelar
          </button>
          <button
            className="btn-submit-exp"
            onClick={handlePublicar}
            disabled={subiendo || !form.titulo.trim()}
          >
            {subiendo ? "Enviando..." : "🗺️ Enviar para revisión"}
          </button>
        </div>
      </div>
    </div>
  );
}
