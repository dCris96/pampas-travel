// components/FormularioNegocio.js
// Usuario sugiere un negocio → queda pendiente de aprobación

"use client";

import { useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import {
  convertirAWebP,
  validarArchivo,
  formatearTamaño,
  TIPOS_IMAGEN_ACEPTADOS,
} from "@/lib/imageUtils";
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
    whatsapp: "",
    horario: "",
    precio_desde: "",
    latitud: "",
    longitud: "",
    amenidades_texto: "",
  });

  // ── ESTADO DE IMAGEN ──
  const [archivoOriginal, setArchivoOriginal] = useState(null);
  const [blobWebP, setBlobWebP] = useState(null);
  const [preview, setPreview] = useState(null);
  const [infoOriginal, setInfoOriginal] = useState(null);
  const [infoFinal, setInfoFinal] = useState(null);
  const [convirtiendo, setConvirtiendo] = useState(false);
  const [progresoConversion, setProgresoConversion] = useState(0);

  const [loading, setLoading] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const supabase = createClient();

  function setField(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  // ── PROCESAR IMAGEN: Conversión WebP ──
  const procesarImagen = useCallback(
    async (archivo) => {
      setError("");

      const errorValidacion = validarArchivo(archivo);
      if (errorValidacion) {
        setError(errorValidacion);
        return;
      }

      setConvirtiendo(true);
      setProgresoConversion(0);

      try {
        if (preview) URL.revokeObjectURL(preview);

        const resultado = await convertirAWebP(archivo, {
          onProgreso: setProgresoConversion,
        });

        setBlobWebP(resultado.blob);
        setPreview(resultado.preview);
        setInfoOriginal(resultado.infoOriginal);
        setInfoFinal(resultado.infoFinal);
        setArchivoOriginal(archivo);
      } catch (err) {
        setError(err.message);
        setBlobWebP(null);
        setPreview(null);
        setInfoOriginal(null);
        setInfoFinal(null);
      } finally {
        setConvirtiendo(false);
        setProgresoConversion(0);
      }
    },
    [preview],
  );

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

  // ── CLICK EN ZONA: solo abre file picker, no hay input invisible superpuesto ──
  function handleClickZona() {
    if (!convirtiendo && !loading) {
      fileInputRef.current?.click();
    }
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) procesarImagen(file);
    // Resetear el input para permitir seleccionar el mismo archivo de nuevo
    e.target.value = "";
  }

  function quitarImagen() {
    if (preview) URL.revokeObjectURL(preview);
    setBlobWebP(null);
    setPreview(null);
    setInfoOriginal(null);
    setInfoFinal(null);
    setArchivoOriginal(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // ── SUBIR IMAGEN WEBP ──
  async function subirImagen() {
    if (!blobWebP) return null;

    const bucket = "experiencias";
    const timestamp = Date.now();
    const path = `${user.id}/${timestamp}.webp`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, blobWebP, {
        contentType: "image/webp",
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw new Error(`Error al subir imagen: ${error.message}`);

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
    return urlData.publicUrl;
  }

  // ── CONVERTIR TEXTO DE AMENIDADES A ARRAY ──
  function parsearAmenidades(texto) {
    if (!texto || !texto.trim()) return null;
    return texto
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  async function handlePublicar() {
    setError("");
    if (!form.nombre.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }

    setLoading(true);
    setProgreso(10);

    try {
      let imagenUrl = null;
      if (blobWebP) {
        setProgreso(30);
        imagenUrl = await subirImagen();
        setProgreso(70);
      }

      const amenidadesArray = parsearAmenidades(form.amenidades_texto);

      const { error } = await supabase.from("negocios").insert({
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim() || null,
        tipo: form.tipo,
        direccion: form.direccion.trim() || null,
        telefono: form.telefono.trim() || null,
        whatsapp: form.whatsapp.trim() || null,
        horario: form.horario.trim() || null,
        imagen_url: imagenUrl,
        precio_desde: form.precio_desde ? parseFloat(form.precio_desde) : null,
        latitud: form.latitud ? parseFloat(form.latitud) : null,
        longitud: form.longitud ? parseFloat(form.longitud) : null,
        amenidades: amenidadesArray,
        creado_por: user.id,
      });

      if (error) throw error;
      setProgreso(100);
      onPublicado();
    } catch (err) {
      setError(err.message || "Error al enviar.");
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
          <span className="modal-titulo">🏪 Agregar negocio</span>
          <button
            className="btn-cerrar-modal"
            onClick={onClose}
            disabled={loading || convirtiendo}
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
              disabled={loading || convirtiendo}
            />
          </div>

          <div className="form-admin-grupo">
            <label className="form-admin-label">Descripción</label>
            <textarea
              className="form-admin-textarea"
              placeholder="Describe el negocio brevemente..."
              value={form.descripcion}
              onChange={(e) => setField("descripcion", e.target.value)}
              disabled={loading || convirtiendo}
            />
          </div>

          <div className="form-admin-fila">
            <div className="form-admin-grupo">
              <label className="form-admin-label">Tipo</label>
              <select
                className="form-admin-select"
                value={form.tipo}
                onChange={(e) => setField("tipo", e.target.value)}
                disabled={loading || convirtiendo}
              >
                {TIPOS.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-admin-grupo">
              <label className="form-admin-label">Precio desde (S/)</label>
              <input
                type="number"
                min="0"
                className="form-admin-input"
                placeholder="Opcional"
                value={form.precio_desde}
                onChange={(e) => setField("precio_desde", e.target.value)}
                disabled={loading || convirtiendo}
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
              disabled={loading || convirtiendo}
            />
          </div>

          {/* ── LATITUD + LONGITUD ── */}
          <div className="form-admin-fila">
            <div className="form-admin-grupo">
              <label className="form-admin-label">Latitud</label>
              <input
                type="number"
                step="any"
                className="form-admin-input"
                placeholder="Ej: -13.1631"
                value={form.latitud}
                onChange={(e) => setField("latitud", e.target.value)}
                disabled={loading || convirtiendo}
              />
            </div>
            <div className="form-admin-grupo">
              <label className="form-admin-label">Longitud</label>
              <input
                type="number"
                step="any"
                className="form-admin-input"
                placeholder="Ej: -72.5450"
                value={form.longitud}
                onChange={(e) => setField("longitud", e.target.value)}
                disabled={loading || convirtiendo}
              />
            </div>
          </div>

          <div className="form-admin-fila">
            <div className="form-admin-grupo">
              <label className="form-admin-label">Teléfono</label>
              <input
                type="text"
                className="form-admin-input"
                placeholder="987 654 321"
                value={form.telefono}
                onChange={(e) => setField("telefono", e.target.value)}
                disabled={loading || convirtiendo}
              />
            </div>
            <div className="form-admin-grupo">
              <label className="form-admin-label">WhatsApp</label>
              <input
                type="text"
                className="form-admin-input"
                placeholder="963 852 741"
                value={form.whatsapp}
                onChange={(e) => setField("whatsapp", e.target.value)}
                disabled={loading || convirtiendo}
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
                disabled={loading || convirtiendo}
              />
            </div>
          </div>

          {/* ── AMENIDADES: TEXTO LIBRE SIN SUGERENCIAS ── */}
          <div className="form-admin-grupo">
            <label className="form-admin-label">
              Amenidades
              <span
                style={{
                  fontSize: 11,
                  color: "var(--color-text-muted)",
                  fontWeight: 400,
                  marginLeft: 6,
                }}
              >
                — separadas por comas
              </span>
            </label>
            <input
              type="text"
              className="form-admin-input"
              placeholder="WiFi, Estacionamiento, Cable, Música en vivo..."
              value={form.amenidades_texto}
              onChange={(e) => setField("amenidades_texto", e.target.value)}
              disabled={loading || convirtiendo}
            />
            {form.amenidades_texto.trim() && (
              <div
                style={{
                  fontSize: 11,
                  color: "var(--color-text-muted)",
                  marginTop: 6,
                  fontFamily: "var(--font-display)",
                  fontStyle: "italic",
                }}
              >
                Se guardará como: [{parsearAmenidades(form.amenidades_texto)
                  ?.map((a) => `"${a}"`)
                  .join(", ") || "—"}]
              </div>
            )}
          </div>

          {/* ── ZONA DE IMAGEN (drag&drop reparado, sin doble apertura) ── */}
          <div className="form-admin-grupo">
            <label className="form-admin-label">Foto del negocio</label>
            {preview ? (
              <div style={{ position: "relative" }}>
                <img
                  src={preview}
                  alt="Preview"
                  style={{
                    width: "100%",
                    height: 200,
                    objectFit: "cover",
                    borderRadius: 8,
                  }}
                />
                {infoFinal && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: "rgba(0,0,0,0.8)",
                      padding: "6px 10px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: 10,
                      fontFamily: "var(--font-display)",
                      borderRadius: "0 0 8px 8px",
                    }}
                  >
                    <span style={{ color: "#888" }}>
                      Original: {formatearTamaño(infoOriginal.tamaño)}
                    </span>
                    <span style={{ color: "var(--color-green)" }}>
                      WebP: {formatearTamaño(infoFinal.tamaño)}
                      {infoFinal.reduccion > 0 && ` (−${infoFinal.reduccion}%)`}
                    </span>
                    <button
                      onClick={quitarImagen}
                      disabled={loading}
                      style={{
                        background: "rgba(255,74,74,0.8)",
                        border: "none",
                        color: "white",
                        borderRadius: 4,
                        padding: "2px 8px",
                        cursor: "pointer",
                        fontSize: 10,
                        fontFamily: "var(--font-display)",
                      }}
                    >
                      ✕ Quitar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div
                className={`upload-zona ${dragOver ? "drag-over" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClickZona}
                style={{
                  opacity: convirtiendo ? 0.7 : 1,
                  cursor: convirtiendo || loading ? "not-allowed" : "pointer",
                  position: "relative",
                }}
              >
                {/* 
                  Input oculto pero NO superpuesto sobre toda la zona.
                  El click se maneja via onClick del div padre (handleClickZona).
                  Esto evita el bug de doble apertura del file picker.
                */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={TIPOS_IMAGEN_ACEPTADOS.join(",")}
                  onChange={handleFileChange}
                  disabled={loading || convirtiendo}
                  style={{ display: "none" }}
                />
                {convirtiendo ? (
                  <>
                    <div className="upload-zona-icon">⚙️</div>
                    <div className="upload-zona-texto">
                      Convirtiendo a WebP... {progresoConversion}%
                    </div>
                    <div
                      style={{
                        width: "80%",
                        height: 3,
                        background: "#1f1f1f",
                        borderRadius: 2,
                        overflow: "hidden",
                        marginTop: 8,
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          borderRadius: 2,
                          background:
                            "linear-gradient(90deg,var(--color-blue),var(--color-cyan))",
                          width: `${progresoConversion}%`,
                          transition: "width 0.2s ease",
                        }}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="upload-zona-icon">📷</div>
                    <div className="upload-zona-texto">
                      Arrastra una imagen o haz click
                    </div>
                    <div className="upload-zona-subtext">
                      JPG, PNG, WebP, HEIC — Se convierte a WebP automáticamente
                    </div>
                  </>
                )}
              </div>
            )}
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
          <button
            className="btn-cancelar"
            onClick={onClose}
            disabled={loading || convirtiendo}
          >
            Cancelar
          </button>
          <button
            className="btn-submit-exp"
            onClick={handlePublicar}
            disabled={loading || convirtiendo || !form.nombre.trim()}
          >
            {loading ? "Enviando..." : "🏪 Enviar para revisión"}
          </button>
        </div>
      </div>
    </div>
  );
}