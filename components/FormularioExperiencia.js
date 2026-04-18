// components/FormularioExperiencia.js
// ─────────────────────────────────────────────────────
// Modal para publicar una nueva experiencia
//
// Funcionalidades:
//   ✓ Textarea con contador de caracteres
//   ✓ Drag & drop de imagen
//   ✓ Preview de imagen antes de subir
//   ✓ Validación de tamaño (máx 5MB) y tipo de archivo
//   ✓ Barra de progreso de subida
//   ✓ Selector de lugar vinculado
//   ✓ Subida a Supabase Storage
//   ✓ INSERT en tabla experiencias
//
// Props:
//   onClose   → función para cerrar el modal
//   onPublicado → función que se llama al publicar con éxito
// ─────────────────────────────────────────────────────

"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import "@/styles/formulario-exp.css";

// ── CONSTANTES ──
const MAX_CHARS = 1000; // Máximo de caracteres permitidos
const MAX_MB = 5; // Tamaño máximo de imagen en MB
const MAX_BYTES = MAX_MB * 1024 * 1024;

// Tipos de imagen permitidos
const TIPOS_IMAGEN = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/jpg",
];

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
const IconImagen = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21,15 16,10 5,21" />
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

export default function FormularioExperiencia({ onClose, onPublicado }) {
  const { user, perfil } = useAuth();

  const supabase = createClient();

  // ── ESTADO DEL FORMULARIO ──
  const [contenido, setContenido] = useState("");
  const [imagen, setImagen] = useState(null); // File object
  const [preview, setPreview] = useState(null); // URL de preview
  const [lugarId, setLugarId] = useState(""); // UUID del lugar vinculado
  const [lugares, setLugares] = useState([]); // Para el selector
  const [dragOver, setDragOver] = useState(false);
  const [progreso, setProgreso] = useState(0); // 0-100
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);

  // Caracteres restantes
  const charsUsados = contenido.length;
  const charsClass =
    charsUsados > 950 ? "limit" : charsUsados > 800 ? "warning" : "";

  // ── CARGAR LUGARES para el selector ──
  // 🔧 Conecta con: tabla public.lugares
  useEffect(() => {
    async function cargarLugares() {
      const { data } = await supabase
        .from("lugares")
        .select("id, titulo")
        .eq("activo", true)
        .order("titulo");
      setLugares(data || []);
    }
    cargarLugares();
  }, []);

  // ── PROCESAR IMAGEN SELECCIONADA ──
  function procesarImagen(file) {
    setError("");

    // Validar tipo
    if (!TIPOS_IMAGEN.includes(file.type)) {
      setError("Solo se permiten imágenes JPG, PNG, WEBP o GIF.");
      return;
    }

    // Validar tamaño
    if (file.size > MAX_BYTES) {
      setError(
        `La imagen no puede superar ${MAX_MB}MB. Tu archivo pesa ${(file.size / 1024 / 1024).toFixed(1)}MB.`,
      );
      return;
    }

    // Crear preview local (sin subir todavía)
    const url = URL.createObjectURL(file);
    setImagen(file);
    setPreview(url);
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
    setImagen(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // ── SUBIR IMAGEN A SUPABASE STORAGE ──
  // 🔧 Conecta con: Supabase Storage → bucket "experiencias"
  //
  // EXPLICACIÓN DE LA RUTA:
  // Guardamos la imagen en: experiencias/{user_id}/{timestamp}_{nombre_archivo}
  // Esto permite:
  //   1. Organizar por usuario
  //   2. Evitar colisiones de nombres
  //   3. La política de storage usa el user_id para control de acceso
  async function subirImagen() {
    if (!imagen) return null;

    // Nombre único: {user_id}/{timestamp}_{nombre_original}
    const timestamp = Date.now();
    const extension = imagen.name.split(".").pop();
    console.log("user.id:", user.id);
    const nombreArchivo = `${user.id}/${timestamp}.${extension}`;

    // Simulamos progreso (Supabase JS no da progreso real en v2)
    // Para progreso real necesitarías usar fetch directamente
    setProgreso(20);

    const { data, error } = await supabase.storage
      .from("experiencias") // Nombre del bucket
      .upload(nombreArchivo, imagen, {
        cacheControl: "3600", // Cache 1 hora
        upsert: false, // No sobreescribir si existe
        contentType: imagen.type,
      });

    if (error) {
      console.error("Error subiendo imagen:", error);
      throw new Error("No se pudo subir la imagen. Intenta de nuevo.");
    }

    setProgreso(80);

    // Obtener URL pública de la imagen
    // 🔧 Esta URL es permanente y la guardamos en la BD
    const { data: urlData } = supabase.storage
      .from("experiencias")
      .getPublicUrl(nombreArchivo);

    setProgreso(100);
    return urlData.publicUrl;
  }

  // ── PUBLICAR EXPERIENCIA ──
  // 🔧 Conecta con: tabla public.experiencias → INSERT
  async function handlePublicar() {
    setError("");

    // Validaciones
    if (!contenido.trim()) {
      setError("Escribe algo antes de publicar.");
      return;
    }

    if (contenido.length > MAX_CHARS) {
      setError(`El contenido no puede superar ${MAX_CHARS} caracteres.`);
      return;
    }

    setSubiendo(true);
    setProgreso(0);

    try {
      // 1. Subir imagen si existe
      let imagenUrl = null;
      if (imagen) {
        imagenUrl = await subirImagen();
      }

      setProgreso(90);

      // 2. Insertar en la tabla experiencias
      // 🔧 Conecta con: tabla public.experiencias
      const { error } = await supabase.from("experiencias").insert({
        user_id: user.id, // ID del usuario logueado
        contenido: contenido.trim(), // Texto de la experiencia
        imagen_url: imagenUrl, // URL de Storage (o null)
        lugar_id: lugarId || null, // Lugar vinculado (opcional)
      });

      if (error) throw error;

      setProgreso(100);

      // 3. Notificar al padre y cerrar
      onPublicado();
    } catch (err) {
      console.error("Error publicando:", err);
      setError(err.message || "Error al publicar. Intenta de nuevo.");
      setProgreso(0);
    } finally {
      setSubiendo(false);
    }
  }

  // ── CERRAR AL HACER CLICK EN EL OVERLAY ──
  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  // ── RENDER ──
  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-card">
        {/* ── HEADER ── */}
        <div className="modal-header">
          <span className="modal-titulo">Publicar experiencia</span>
          <button
            className="btn-cerrar-modal"
            onClick={onClose}
            disabled={subiendo}
            aria-label="Cerrar"
          >
            <IconX />
          </button>
        </div>

        {/* ── CUERPO ── */}
        <div className="modal-body">
          {/* Autor */}
          <div className="form-exp-autor">
            <div className="exp-avatar">
              {perfil?.avatar_url ? (
                <img src={perfil.avatar_url} alt="Avatar" />
              ) : (
                <span>
                  {(perfil?.nombre || user?.email || "U")[0].toUpperCase()}
                </span>
              )}
            </div>
            <span className="form-exp-nombre">
              {perfil?.nombre || user?.email}
            </span>
          </div>

          {/* Textarea */}
          <textarea
            className="textarea-exp"
            placeholder="¿Qué viviste en el valle? Comparte tu experiencia con la comunidad..."
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            maxLength={MAX_CHARS}
            disabled={subiendo}
          />

          {/* Contador de caracteres */}
          <div className={`chars-counter ${charsClass}`}>
            {charsUsados}/{MAX_CHARS}
          </div>

          {/* Preview de imagen O zona de subida */}
          {preview ? (
            <div className="upload-preview">
              <img src={preview} alt="Preview" className="upload-preview-img" />
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
              {/* Input file oculto */}
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
                JPG, PNG, WEBP o GIF — máximo {MAX_MB}MB
              </div>
            </div>
          )}

          {/* Selector de lugar */}
          <select
            className="form-select"
            value={lugarId}
            onChange={(e) => setLugarId(e.target.value)}
            disabled={subiendo}
          >
            <option value="">
              📍 Vincular a un sitio turístico (opcional)
            </option>
            {lugares.map((lugar) => (
              <option key={lugar.id} value={lugar.id}>
                {lugar.titulo}
              </option>
            ))}
          </select>

          {/* Barra de progreso */}
          {subiendo && progreso > 0 && (
            <div className="upload-progress">
              <div className="upload-progress-label">
                <span>{imagen ? "Subiendo imagen..." : "Publicando..."}</span>
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
            disabled={subiendo}
          >
            Cancelar
          </button>
          <button
            className="btn-submit-exp"
            onClick={handlePublicar}
            disabled={subiendo || !contenido.trim()}
          >
            <IconEnviar />
            {subiendo ? "Publicando..." : "Publicar"}
          </button>
        </div>
      </div>
    </div>
  );
}
