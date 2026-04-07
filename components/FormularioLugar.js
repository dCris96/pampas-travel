// components/FormularioLugar.js
// Usuario sugiere un lugar turístico → queda pendiente

"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";
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

export default function FormularioLugar({ onClose, onPublicado }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    categoria: "naturaleza",
    direccion: "",
    imagen_url: "",
    latitud: "",
    longitud: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function setField(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  // 🔧 Conecta con: tabla public.lugares INSERT
  async function handlePublicar() {
    setError("");
    if (!form.titulo.trim()) {
      setError("El título es obligatorio.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("lugares").insert({
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim() || null,
        categoria: form.categoria,
        direccion: form.direccion.trim() || null,
        imagen_url: form.imagen_url.trim() || null,
        latitud: form.latitud ? parseFloat(form.latitud) : null,
        longitud: form.longitud ? parseFloat(form.longitud) : null,
        creado_por: user.id,
        // estado: 'pendiente' (default en BD)
      });
      if (error) throw error;
      onPublicado();
    } catch (err) {
      setError(err.message || "Error al enviar.");
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
          <span className="modal-titulo">🗺️ Sugerir lugar turístico</span>
          <button
            className="btn-cerrar-modal"
            onClick={onClose}
            disabled={loading}
          >
            <IconX />
          </button>
        </div>

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
          ⏳ Tu sugerencia quedará{" "}
          <strong style={{ color: "#f5c542" }}>pendiente de revisión</strong>.
          El equipo verificará y la publicará en el mapa.
        </div>

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
              disabled={loading}
            />
          </div>

          <div className="form-admin-grupo">
            <label className="form-admin-label">Descripción</label>
            <textarea
              className="form-admin-textarea"
              placeholder="¿Qué hay ahí? ¿Por qué vale la pena visitarlo?"
              value={form.descripcion}
              onChange={(e) => setField("descripcion", e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-admin-grupo">
            <label className="form-admin-label">Categoría</label>
            <select
              className="form-admin-select"
              value={form.categoria}
              onChange={(e) => setField("categoria", e.target.value)}
              disabled={loading}
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
              disabled={loading}
            />
          </div>

          <div className="form-admin-grupo">
            <label className="form-admin-label">URL de imagen</label>
            <input
              type="url"
              className="form-admin-input"
              placeholder="https://..."
              value={form.imagen_url}
              onChange={(e) => setField("imagen_url", e.target.value)}
              disabled={loading}
            />
          </div>

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
                disabled={loading}
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
                disabled={loading}
              />
            </div>
          </div>

          {error && <div className="form-admin-error">⚠️ {error}</div>}
        </div>

        <div className="modal-footer">
          <button className="btn-cancelar" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button
            className="btn-submit-exp"
            onClick={handlePublicar}
            disabled={loading || !form.titulo.trim()}
          >
            {loading ? "Enviando..." : "🗺️ Enviar para revisión"}
          </button>
        </div>
      </div>
    </div>
  );
}
