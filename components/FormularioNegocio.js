// components/FormularioNegocio.js
// Usuario sugiere un negocio → queda pendiente de aprobación

"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import "@/styles/formulario-exp.css";
import "@/styles/modal-admin.css";

const TIPOS = [
  "hotel",
  "restaurante",
  "cafe",
  "tienda",
  "servicio",
  "transporte",
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

export default function FormularioNegocio({ onClose, onPublicado }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    tipo: "tienda",
    direccion: "",
    telefono: "",
    horario: "",
    imagen_url: "",
    precio_desde: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function setField(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  // 🔧 Conecta con: tabla public.negocios INSERT
  // estado queda 'pendiente' por default
  async function handlePublicar() {
    setError("");
    if (!form.nombre.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("negocios").insert({
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim() || null,
        tipo: form.tipo,
        direccion: form.direccion.trim() || null,
        telefono: form.telefono.trim() || null,
        horario: form.horario.trim() || null,
        imagen_url: form.imagen_url.trim() || null,
        precio_desde: form.precio_desde ? parseFloat(form.precio_desde) : null,
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
          <span className="modal-titulo">🏪 Sugerir negocio</span>
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
          El equipo verificará los datos y la publicará.
        </div>

        <div className="form-admin">
          <div className="form-admin-grupo">
            <label className="form-admin-label">
              Nombre <span className="requerido">*</span>
            </label>
            <input
              type="text"
              className="form-admin-input"
              placeholder="Nombre del negocio"
              value={form.nombre}
              onChange={(e) => setField("nombre", e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-admin-grupo">
            <label className="form-admin-label">Descripción</label>
            <textarea
              className="form-admin-textarea"
              placeholder="Describe el negocio brevemente..."
              value={form.descripcion}
              onChange={(e) => setField("descripcion", e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-admin-fila">
            <div className="form-admin-grupo">
              <label className="form-admin-label">Tipo</label>
              <select
                className="form-admin-select"
                value={form.tipo}
                onChange={(e) => setField("tipo", e.target.value)}
                disabled={loading}
              >
                {TIPOS.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-admin-grupo">
              <label className="form-admin-label">Precio desde (MXN)</label>
              <input
                type="number"
                min="0"
                className="form-admin-input"
                placeholder="Opcional"
                value={form.precio_desde}
                onChange={(e) => setField("precio_desde", e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-admin-grupo">
            <label className="form-admin-label">Dirección</label>
            <input
              type="text"
              className="form-admin-input"
              placeholder="Calle, número, colonia"
              value={form.direccion}
              onChange={(e) => setField("direccion", e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-admin-fila">
            <div className="form-admin-grupo">
              <label className="form-admin-label">Teléfono</label>
              <input
                type="text"
                className="form-admin-input"
                placeholder="+52 744 123 4567"
                value={form.telefono}
                onChange={(e) => setField("telefono", e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="form-admin-grupo">
              <label className="form-admin-label">Horario</label>
              <input
                type="text"
                className="form-admin-input"
                placeholder="Lun-Sab 9am-6pm"
                value={form.horario}
                onChange={(e) => setField("horario", e.target.value)}
                disabled={loading}
              />
            </div>
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
            {loading ? "Enviando..." : "🏪 Enviar para revisión"}
          </button>
        </div>
      </div>
    </div>
  );
}
