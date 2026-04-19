// components/admin/ModalAudiosFiesta.js
// Modal para gestionar audios de una festividad (listar, agregar, eliminar)

"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import Swal from "sweetalert2";
import "@/styles/formulario-exp.css";
import "@/styles/modal-admin.css";

const IconX = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconAudio = () => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path d="M3 10v4a2 2 0 0 0 2 2h2.5l3.5 3V7L7.5 10H5a2 2 0 0 0-2 2z" />
    <path d="M16 8a5 5 0 0 1 0 8" />
    <path d="M19 5a9 9 0 0 1 0 14" />
  </svg>
);

export default function ModalAudiosFiesta({
  festividadId,
  festividadTitulo = "",
  onClose,
  onGuardado,
}) {
  const { user } = useAuth();
  const supabase = createClient();

  // Estado del formulario para nuevo audio
  const [nuevoAudio, setNuevoAudio] = useState({
    titulo: "",
    descripcion: "",
    audio_url: "",
    duracion: "",
  });

  const [audios, setAudios] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  // Cargar audios al abrir el modal o cambiar el ID
  useEffect(() => {
    if (festividadId) {
      fetchAudios();
    }
  }, [festividadId]);

  // Acción para traer todos los audios de una festividad
  async function fetchAudios() {
    if (!festividadId) return;
    setCargando(true);
    setError("");

    try {
      const { data, error } = await supabase
        .from("festividad_audios")
        .select("*")
        .eq("festividad_id", festividadId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAudios(data || []);
    } catch (err) {
      console.error("Error al cargar audios:", err);
      setError("No se pudieron cargar los audios.");
    } finally {
      setCargando(false);
    }
  }

  // Agregar un nuevo audio
  async function handleAgregarAudio(e) {
    e.preventDefault();
    if (!nuevoAudio.titulo.trim()) {
      setError("El título del audio es obligatorio.");
      return;
    }
    if (!nuevoAudio.audio_url.trim()) {
      setError("La URL del audio es obligatoria.");
      return;
    }

    setEnviando(true);
    setError("");

    try {
      const { data, error } = await supabase
        .from("festividad_audios")
        .insert({
          festividad_id: festividadId,
          titulo: nuevoAudio.titulo.trim(),
          descripcion: nuevoAudio.descripcion.trim() || null,
          audio_url: nuevoAudio.audio_url.trim(),
          duracion: nuevoAudio.duracion.trim() || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Actualizar la lista local
      setAudios((prev) => [data, ...prev]);

      // Limpiar formulario
      setNuevoAudio({
        titulo: "",
        descripcion: "",
        audio_url: "",
        duracion: "",
      });

      // Notificar al padre si se necesita
      if (onGuardado) onGuardado("agregado", data);
    } catch (err) {
      console.error("Error al agregar audio:", err);
      setError(err.message || "Error al guardar el audio.");
    } finally {
      setEnviando(false);
    }
  }

  // Eliminar un audio
  async function handleEliminarAudio(audioId) {
    const result = await Swal.fire({
      title: "Borrar audio permanentemente",
      theme: "dark",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, borrar",
      cancelButtonText: "Cancelar",
    });
    // Si el usuario no confirma, detenemos la ejecución
    if (!result.isConfirmed) return;

    try {
      const { error } = await supabase
        .from("festividad_audios")
        .delete()
        .eq("id", audioId);

      if (error) throw error;

      setAudios((prev) => prev.filter((a) => a.id !== audioId));
      if (onGuardado) onGuardado("eliminado", audioId);
    } catch (error) {
      console.error("Error al eliminar audio:", error);
      setError("No se pudo eliminar el audio.");
    }
  }

  // Manejar cambios en el formulario
  function handleInputChange(e) {
    const { name, value } = e.target;
    setNuevoAudio((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-card" style={{ maxWidth: 700 }}>
        <div className="modal-header">
          <span className="modal-titulo">
            🎵 Gestionar audios
            {festividadTitulo && ` · ${festividadTitulo}`}
            {!festividadTitulo && festividadId && ` · ID: ${festividadId}`}
          </span>
          <button className="btn-cerrar-modal" onClick={onClose}>
            <IconX />
          </button>
        </div>

        <div className="form-admin">
          {/* FORMULARIO PARA AGREGAR NUEVO AUDIO */}
          <div className="form-admin-separator">
            <span>Agregar nuevo audio</span>
          </div>

          <form onSubmit={handleAgregarAudio}>
            <div className="form-admin-grupo">
              <label className="form-admin-label">
                Título <span className="requerido">*</span>
              </label>
              <input
                type="text"
                name="titulo"
                className="form-admin-input"
                value={nuevoAudio.titulo}
                onChange={handleInputChange}
                disabled={enviando}
                placeholder="Ej: Marcha principal"
              />
            </div>

            <div className="form-admin-grupo">
              <label className="form-admin-label">Descripción</label>
              <textarea
                name="descripcion"
                className="form-admin-textarea"
                rows="2"
                value={nuevoAudio.descripcion}
                onChange={handleInputChange}
                disabled={enviando}
                placeholder="Breve descripción del audio (opcional)"
              />
            </div>

            <div className="form-admin-fila">
              <div className="form-admin-grupo" style={{ flex: 2 }}>
                <label className="form-admin-label">
                  URL del audio <span className="requerido">*</span>
                </label>
                <input
                  type="url"
                  name="audio_url"
                  className="form-admin-input"
                  value={nuevoAudio.audio_url}
                  onChange={handleInputChange}
                  disabled={enviando}
                  placeholder="https://ejemplo.com/audio.mp3"
                />
              </div>
              <div className="form-admin-grupo" style={{ flex: 1 }}>
                <label className="form-admin-label">Duración</label>
                <input
                  type="text"
                  name="duracion"
                  className="form-admin-input"
                  value={nuevoAudio.duracion}
                  onChange={handleInputChange}
                  disabled={enviando}
                  placeholder="Ej: 3:45"
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-submit-exp"
              disabled={
                enviando ||
                !nuevoAudio.titulo.trim() ||
                !nuevoAudio.audio_url.trim()
              }
              style={{ marginTop: "0.5rem" }}
            >
              {enviando ? "Agregando..." : "+ Agregar audio"}
            </button>
          </form>

          {/* LISTADO DE AUDIOS EXISTENTES */}
          <div className="form-admin-separator">
            <span>Audios disponibles</span>
          </div>

          {cargando && (
            <div
              className="form-admin-loading"
              style={{ textAlign: "center", padding: "2rem" }}
            >
              Cargando audios...
            </div>
          )}

          {!cargando && audios.length === 0 && (
            <div
              style={{ textAlign: "center", padding: "2rem", color: "#6c757d" }}
            >
              <IconAudio />
              <p style={{ marginTop: "0.5rem" }}>
                No hay audios asociados a esta festividad.
              </p>
              <small>
                Usa el formulario de arriba para agregar el primero.
              </small>
            </div>
          )}

          {!cargando && audios.length > 0 && (
            <div
              className="audios-lista"
              style={{ maxHeight: "400px", overflowY: "auto" }}
            >
              {audios.map((audio) => (
                <div
                  key={audio.id}
                  className="audio-item"
                  style={{
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    padding: "1rem",
                    marginBottom: "0.75rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "1rem",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ flex: 1, minWidth: "200px" }}>
                    <h4 style={{ margin: "0 0 0.25rem 0", fontSize: "1rem" }}>
                      {audio.titulo}
                    </h4>
                    {audio.descripcion && (
                      <p
                        style={{
                          margin: "0 0 0.25rem 0",
                          fontSize: "0.85rem",
                          color: "#555",
                        }}
                      >
                        {audio.descripcion}
                      </p>
                    )}
                    <div style={{ fontSize: "0.8rem", color: "#6c757d" }}>
                      {audio.duracion && <span>⏱️ {audio.duracion} · </span>}
                      <a
                        href={audio.audio_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ wordBreak: "break-all" }}
                      >
                        🎵 Escuchar
                      </a>
                    </div>
                  </div>
                  <button
                    onClick={() => handleEliminarAudio(audio.id)}
                    className="btn-cancelar"
                    style={{ padding: "0.25rem 0.75rem", fontSize: "0.8rem" }}
                    title="Eliminar audio"
                  >
                    ✕ Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}

          {error && <div className="form-admin-error">⚠️ {error}</div>}
        </div>

        <div className="modal-footer">
          <button className="btn-cancelar" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
