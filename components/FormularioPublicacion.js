// components/FormularioPublicacion.js
// ─────────────────────────────────────────────────────
// Formulario UNIFICADO para que usuarios publiquen:
//   - Experiencias
//   - Negocios
//   - Productos
//
// Características:
//   ✓ Conversión automática a WebP antes de subir
//   ✓ Preview con info del archivo original vs final
//   ✓ Estado "pendiente" automático para usuarios
//   ✓ Estado "aprobado" automático para admins
//   ✓ Selector de tipo de publicación
//   ✓ Campos dinámicos según el tipo
// ─────────────────────────────────────────────────────

"use client";

import { useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import {
  convertirAWebP,
  validarArchivo,
  formatearTamaño,
  TIPOS_IMAGEN_ACEPTADOS,
} from "@/lib/imageUtils";
import "@/styles/formulario-exp.css";
import "@/styles/modal-admin.css";

// ── ÍCONOS ──
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
const IconEnviar = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22,2 15,22 11,13 2,9" />
  </svg>
);

// ── TIPOS DE PUBLICACIÓN DISPONIBLES ──
// 🔧 PERSONALIZABLE: Agrega o quita tipos
const TIPOS_PUBLICACION = [
  {
    valor: "experiencia",
    label: "📸 Experiencia",
    desc: "Comparte un momento vivido",
  },
  { valor: "negocio", label: "🏪 Negocio", desc: "Registra un negocio local" },
  { valor: "producto", label: "🛍️ Producto", desc: "Vende un producto local" },
];

export default function FormularioPublicacion({
  onClose,
  onPublicado,
  tipoInicial = "experiencia",
}) {
  const { user, perfil, isAdmin } = useAuth();

  // ── ESTADO ──
  const [tipo, setTipo] = useState(tipoInicial);
  const [progreso, setProgreso] = useState(0);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  // Estado de la imagen
  const [archivoOriginal, setArchivoOriginal] = useState(null);
  const [blobWebP, setBlobWebP] = useState(null);
  const [preview, setPreview] = useState(null);
  const [infoOriginal, setInfoOriginal] = useState(null);
  const [infoFinal, setInfoFinal] = useState(null);
  const [convirtiendo, setConvirtiendo] = useState(false);

  // Campos del formulario por tipo
  const [campos, setCampos] = useState({
    // Experiencia
    contenido: "",
    // Negocio
    nombre: "",
    tipo_negocio: "tienda",
    telefono: "",
    direccion: "",
    horario: "",
    precio_desde: "",
    // Producto
    nombre_producto: "",
    descripcion: "",
    precio: "",
    categoria_producto: "artesania",
  });

  const fileInputRef = useRef(null);

  // ── ACTUALIZAR CAMPO ──
  function setField(key, value) {
    setCampos((prev) => ({ ...prev, [key]: value }));
  }

  // ── PROCESAR IMAGEN SELECCIONADA ──
  // Convierte a WebP en el cliente ANTES de subir
  const procesarImagen = useCallback(
    async (archivo) => {
      setError("");

      // Validar antes de convertir
      const errorValidacion = validarArchivo(archivo);
      if (errorValidacion) {
        setError(errorValidacion);
        return;
      }

      setConvirtiendo(true);
      setProgreso(0);

      try {
        // Limpiar preview anterior
        if (preview) URL.revokeObjectURL(preview);

        // Convertir a WebP
        const resultado = await convertirAWebP(archivo, {
          onProgreso: setProgreso,
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
      } finally {
        setConvirtiendo(false);
        setProgreso(0);
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

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) procesarImagen(file);
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

  // ── SUBIR IMAGEN WEBP A STORAGE ──
  // 🔧 Conecta con: Supabase Storage → bucket según tipo
  async function subirImagen() {
    if (!blobWebP) return null;

    const bucket = tipo === "experiencia" ? "experiencias" : "negocios";
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

  // ── PUBLICAR ──
  async function handlePublicar() {
    setError("");

    // El estado depende del rol:
    // admin → aprobado directo
    // usuario → pendiente, espera revisión
    const estadoInicial = isAdmin ? "aprobado" : "pendiente";

    // Validaciones por tipo
    if (tipo === "experiencia" && !campos.contenido.trim()) {
      setError("Escribe el contenido de la experiencia.");
      return;
    }
    if (tipo === "negocio" && !campos.nombre.trim()) {
      setError("El nombre del negocio es obligatorio.");
      return;
    }
    if (tipo === "producto" && !campos.nombre_producto.trim()) {
      setError("El nombre del producto es obligatorio.");
      return;
    }

    setSubiendo(true);
    setProgreso(10);

    try {
      // Subir imagen si hay una seleccionada
      let imagenUrl = null;
      if (blobWebP) {
        setProgreso(20);
        imagenUrl = await subirImagen();
        setProgreso(70);
      }

      // Insertar según el tipo
      // 🔧 Conecta con: tablas experiencias, negocios, productos
      let resultado;

      if (tipo === "experiencia") {
        const { data, error } = await supabase
          .from("experiencias")
          .insert({
            user_id: user.id,
            contenido: campos.contenido.trim(),
            imagen_url: imagenUrl,
            estado: estadoInicial,
          })
          .select()
          .single();

        if (error) throw error;
        resultado = data;
      } else if (tipo === "negocio") {
        const { data, error } = await supabase
          .from("negocios")
          .insert({
            creado_por: user.id,
            nombre: campos.nombre.trim(),
            tipo: campos.tipo_negocio,
            telefono: campos.telefono || null,
            direccion: campos.direccion || null,
            horario: campos.horario || null,
            precio_desde: campos.precio_desde
              ? parseFloat(campos.precio_desde)
              : null,
            imagen_url: imagenUrl,
            activo: true,
            estado: estadoInicial,
          })
          .select()
          .single();

        if (error) throw error;
        resultado = data;
      } else if (tipo === "producto") {
        const { data, error } = await supabase
          .from("productos")
          .insert({
            user_id: user.id,
            nombre: campos.nombre_producto.trim(),
            descripcion: campos.descripcion || null,
            precio: campos.precio ? parseFloat(campos.precio) : null,
            categoria: campos.categoria_producto,
            imagen_url: imagenUrl,
            estado: estadoInicial,
          })
          .select()
          .single();

        if (error) throw error;
        resultado = data;
      }

      setProgreso(100);
      onPublicado(resultado, tipo, estadoInicial);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al publicar. Intenta de nuevo.");
      setProgreso(0);
    } finally {
      setSubiendo(false);
    }
  }

  // ── RENDER ──
  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-card" style={{ maxWidth: 580 }}>
        {/* ── HEADER ── */}
        <div className="modal-header">
          <span className="modal-titulo">Nueva publicación</span>
          <button
            className="btn-cerrar-modal"
            onClick={onClose}
            disabled={subiendo}
          >
            <IconX />
          </button>
        </div>

        {/* ── SELECTOR DE TIPO ── */}
        <div
          style={{
            display: "flex",
            gap: 8,
            padding: "14px 22px",
            borderBottom: "1px solid var(--color-border)",
            flexWrap: "wrap",
          }}
        >
          {TIPOS_PUBLICACION.map((t) => (
            <button
              key={t.valor}
              onClick={() => setTipo(t.valor)}
              disabled={subiendo}
              style={{
                padding: "7px 14px",
                borderRadius: 20,
                border: `1px solid ${tipo === t.valor ? "var(--color-blue)" : "var(--color-border)"}`,
                background: tipo === t.valor ? "rgba(74,158,255,0.1)" : "none",
                color:
                  tipo === t.valor
                    ? "var(--color-blue)"
                    : "var(--color-text-muted)",
                fontFamily: "var(--font-display)",
                fontSize: 12,
                fontWeight: tipo === t.valor ? 600 : 400,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── FORMULARIO ── */}
        <div className="form-admin" style={{ maxHeight: "55vh" }}>
          {/* Avatar del autor */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#2a5fff,#1a3fd0)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-display)",
                fontSize: 15,
                fontWeight: 700,
                color: "white",
              }}
            >
              {(perfil?.nombre || "U")[0].toUpperCase()}
            </div>
            <div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--color-text)",
                }}
              >
                {perfil?.nombre || user?.email}
              </div>
              {/* Indicador de estado que tendrá */}
              <div
                style={{
                  fontSize: 11,
                  color: isAdmin ? "var(--color-green)" : "var(--color-yellow)",
                }}
              >
                {isAdmin
                  ? "✅ Se publicará directamente"
                  : "⏳ Requiere aprobación"}
              </div>
            </div>
          </div>

          {/* ── CAMPOS POR TIPO ── */}

          {/* EXPERIENCIA */}
          {tipo === "experiencia" && (
            <>
              <div className="form-admin-grupo">
                <label className="form-admin-label">
                  ¿Qué viviste? <span className="requerido">*</span>
                </label>
                <textarea
                  className="form-admin-textarea"
                  placeholder="Comparte tu experiencia con la comunidad..."
                  value={campos.contenido}
                  onChange={(e) => setField("contenido", e.target.value)}
                  maxLength={1000}
                  disabled={subiendo}
                  style={{ minHeight: 110 }}
                />
                <div
                  style={{
                    fontSize: 10,
                    color: campos.contenido.length > 900 ? "#cc0" : "#444",
                    fontFamily: "var(--font-display)",
                    textAlign: "right",
                  }}
                >
                  {campos.contenido.length}/1000
                </div>
              </div>
            </>
          )}

          {/* NEGOCIO */}
          {tipo === "negocio" && (
            <>
              <div className="form-admin-grupo">
                <label className="form-admin-label">
                  Nombre del negocio <span className="requerido">*</span>
                </label>
                <input
                  type="text"
                  className="form-admin-input"
                  placeholder="Nombre de tu negocio"
                  value={campos.nombre}
                  onChange={(e) => setField("nombre", e.target.value)}
                  disabled={subiendo}
                />
              </div>
              <div className="form-admin-fila">
                <div className="form-admin-grupo">
                  <label className="form-admin-label">Tipo</label>
                  <select
                    className="form-admin-select"
                    value={campos.tipo_negocio}
                    onChange={(e) => setField("tipo_negocio", e.target.value)}
                    disabled={subiendo}
                  >
                    {[
                      "hotel",
                      "restaurante",
                      "cafe",
                      "tienda",
                      "servicio",
                      "transporte",
                    ].map((t) => (
                      <option key={t} value={t}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-admin-grupo">
                  <label className="form-admin-label">Teléfono</label>
                  <input
                    type="tel"
                    className="form-admin-input"
                    placeholder="+52 744 ..."
                    value={campos.telefono}
                    onChange={(e) => setField("telefono", e.target.value)}
                    disabled={subiendo}
                  />
                </div>
              </div>
              <div className="form-admin-grupo">
                <label className="form-admin-label">Dirección</label>
                <input
                  type="text"
                  className="form-admin-input"
                  placeholder="Calle, número, colonia..."
                  value={campos.direccion}
                  onChange={(e) => setField("direccion", e.target.value)}
                  disabled={subiendo}
                />
              </div>
              <div className="form-admin-fila">
                <div className="form-admin-grupo">
                  <label className="form-admin-label">Horario</label>
                  <input
                    type="text"
                    className="form-admin-input"
                    placeholder="Lun-Sab 9am-6pm"
                    value={campos.horario}
                    onChange={(e) => setField("horario", e.target.value)}
                    disabled={subiendo}
                  />
                </div>
                <div className="form-admin-grupo">
                  <label className="form-admin-label">Precio desde</label>
                  <input
                    type="number"
                    className="form-admin-input"
                    placeholder="0.00"
                    value={campos.precio_desde}
                    onChange={(e) => setField("precio_desde", e.target.value)}
                    disabled={subiendo}
                  />
                </div>
              </div>
            </>
          )}

          {/* PRODUCTO */}
          {tipo === "producto" && (
            <>
              <div className="form-admin-grupo">
                <label className="form-admin-label">
                  Nombre del producto <span className="requerido">*</span>
                </label>
                <input
                  type="text"
                  className="form-admin-input"
                  placeholder="Nombre de tu producto"
                  value={campos.nombre_producto}
                  onChange={(e) => setField("nombre_producto", e.target.value)}
                  disabled={subiendo}
                />
              </div>
              <div className="form-admin-grupo">
                <label className="form-admin-label">Descripción</label>
                <textarea
                  className="form-admin-textarea"
                  placeholder="Describe tu producto..."
                  value={campos.descripcion}
                  onChange={(e) => setField("descripcion", e.target.value)}
                  disabled={subiendo}
                  style={{ minHeight: 70 }}
                />
              </div>
              <div className="form-admin-fila">
                <div className="form-admin-grupo">
                  <label className="form-admin-label">Categoría</label>
                  <select
                    className="form-admin-select"
                    value={campos.categoria_producto}
                    onChange={(e) =>
                      setField("categoria_producto", e.target.value)
                    }
                    disabled={subiendo}
                  >
                    {[
                      "artesania",
                      "gastronomia",
                      "textil",
                      "ceramica",
                      "madera",
                      "otro",
                    ].map((c) => (
                      <option key={c} value={c}>
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-admin-grupo">
                  <label className="form-admin-label">Precio (MXN)</label>
                  <input
                    type="number"
                    className="form-admin-input"
                    placeholder="0.00"
                    value={campos.precio}
                    onChange={(e) => setField("precio", e.target.value)}
                    disabled={subiendo}
                  />
                </div>
              </div>
            </>
          )}

          {/* ── ZONA DE IMAGEN ── */}
          {preview ? (
            <div style={{ position: "relative" }}>
              <img
                src={preview}
                alt="Preview"
                className="form-admin-img-preview"
                style={{ height: 180, width: "100%" }}
              />
              {/* Info de compresión */}
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
                    disabled={subiendo}
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
              style={{ opacity: convirtiendo ? 0.7 : 1 }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={TIPOS_IMAGEN_ACEPTADOS.join(",")}
                onChange={handleFileChange}
                disabled={subiendo || convirtiendo}
              />
              {convirtiendo ? (
                <>
                  <div className="upload-zona-icon">⚙️</div>
                  <div className="upload-zona-texto">
                    Convirtiendo a WebP... {progreso}%
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
                        width: `${progreso}%`,
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
                    JPG, PNG, WebP — Se convierte a WebP automáticamente
                  </div>
                </>
              )}
            </div>
          )}

          {/* Barra de progreso de subida */}
          {subiendo && progreso > 0 && (
            <div className="upload-progress">
              <div className="upload-progress-label">
                <span>Subiendo...</span>
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

          {/* Error */}
          {error && (
            <div className="form-exp-error" role="alert">
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* ── FOOTER ── */}
        <div className="modal-footer">
          <button
            className="btn-cancelar"
            onClick={onClose}
            disabled={subiendo || convirtiendo}
          >
            Cancelar
          </button>
          <button
            className="btn-submit-exp"
            onClick={handlePublicar}
            disabled={subiendo || convirtiendo}
          >
            <IconEnviar />
            {subiendo
              ? "Publicando..."
              : isAdmin
                ? "Publicar"
                : "Enviar para revisión"}
          </button>
        </div>
      </div>
    </div>
  );
}
