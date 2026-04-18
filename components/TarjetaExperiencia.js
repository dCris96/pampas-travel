// components/TarjetaExperiencia.js
// ─────────────────────────────────────────────────────
// Tarjeta individual del feed de experiencias
//
// Funcionalidades:
//   ✓ Avatar + nombre del autor
//   ✓ Fecha relativa (hace 2 horas, ayer, etc.)
//   ✓ Imagen expandible
//   ✓ Badge del lugar vinculado
//   ✓ Botón de like (toggle)
//   ✓ Menú de opciones para el dueño (borrar)
//
// Props:
//   experiencia  → objeto de la tabla experiencias con perfil y likes
//   onBorrada    → callback cuando se borra la experiencia
// ─────────────────────────────────────────────────────

"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";

// ── HELPER: Fecha relativa ──
function tiempoRelativo(isoString) {
  const ahora = new Date();
  const fecha = new Date(isoString);
  const diffMs = ahora - fecha;
  const diffSeg = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSeg / 60);
  const diffHora = Math.floor(diffMin / 60);
  const diffDia = Math.floor(diffHora / 24);

  if (diffSeg < 60) return "justo ahora";
  if (diffMin < 60) return `hace ${diffMin} min`;
  if (diffHora < 24) return `hace ${diffHora}h`;
  if (diffDia === 1) return "ayer";
  if (diffDia < 7) return `hace ${diffDia} días`;

  return fecha.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ── ÍCONOS ──
const IconCorazon = ({ filled }) => (
  <svg
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const IconPin = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const IconPuntos = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="5" r="1.5" />
    <circle cx="12" cy="12" r="1.5" />
    <circle cx="12" cy="19" r="1.5" />
  </svg>
);

const IconTrash = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3,6 5,6 21,6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

export default function TarjetaExperiencia({ experiencia, onBorrada }) {
  const { user } = useAuth();

  const supabase = createClient();

  // ── ESTADO DE LIKES ──
  // Calculamos el estado inicial de like desde los datos ya cargados
  const [likes, setLikes] = useState(experiencia.likes_count || 0);
  const [liked, setLiked] = useState(experiencia.user_liked || false);
  const [likeLoading, setLikeLoading] = useState(false);

  // ── ESTADO DEL MENÚ DE OPCIONES ──
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [borrando, setBorrando] = useState(false);
  const menuRef = useRef(null);

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuAbierto(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // ── ES EL DUEÑO DE LA EXPERIENCIA ──
  const esDueno = user && user.id === experiencia.user_id;

  // ── TOGGLE LIKE ──
  // 🔧 Conecta con: tabla public.likes → INSERT o DELETE
  async function toggleLike() {
    if (!user) {
      alert("Inicia sesión para dar like.");
      return;
    }

    if (likeLoading) return;
    setLikeLoading(true);

    // Optimistic update: actualizamos la UI antes de la respuesta
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikes((prev) => (wasLiked ? prev - 1 : prev + 1));

    try {
      if (wasLiked) {
        // Quitar like: DELETE
        const { error } = await supabase
          .from("likes")
          .delete()
          .eq("experiencia_id", experiencia.id)
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        // Dar like: INSERT
        const { error } = await supabase.from("likes").insert({
          experiencia_id: experiencia.id,
          user_id: user.id,
        });

        if (error) throw error;
      }
    } catch (err) {
      // Revertir el optimistic update si hay error
      console.error("Error en like:", err);
      setLiked(wasLiked);
      setLikes((prev) => (wasLiked ? prev + 1 : prev - 1));
    } finally {
      setLikeLoading(false);
    }
  }

  // ── BORRAR EXPERIENCIA ──
  // 🔧 Conecta con: tabla experiencias + Storage (borra imagen)
  async function borrarExperiencia() {
    if (!confirm("¿Seguro que quieres eliminar esta experiencia?")) return;

    setBorrando(true);
    setMenuAbierto(false);

    try {
      // 1. Si tiene imagen, borrarla del Storage
      if (experiencia.imagen_url) {
        // Extraemos el path del archivo desde la URL pública
        // URL: https://xxx.supabase.co/storage/v1/object/public/experiencias/{path}
        const url = experiencia.imagen_url;
        const storageIndex = url.indexOf("/experiencias/");
        if (storageIndex !== -1) {
          const filePath = url.substring(
            storageIndex + "/experiencias/".length,
          );
          await supabase.storage.from("experiencias").remove([filePath]);
          // Si falla el borrado de la imagen, continuamos igual
        }
      }

      // 2. Borrar el registro de la tabla
      // 🔧 Conecta con: tabla public.experiencias DELETE WHERE id
      const { error } = await supabase
        .from("experiencias")
        .delete()
        .eq("id", experiencia.id)
        .eq("user_id", user.id); // Doble seguridad: solo borra la suya

      if (error) throw error;

      // 3. Notificar al padre
      onBorrada(experiencia.id);
    } catch (err) {
      console.error("Error borrando experiencia:", err);
      alert("No se pudo borrar la experiencia. Intenta de nuevo.");
    } finally {
      setBorrando(false);
    }
  }

  // ── RENDER ──
  return (
    <article
      className={`tarjeta-exp ${borrando ? "borrando" : ""}`}
      style={{ opacity: borrando ? 0.4 : 1, transition: "opacity 0.3s ease" }}
    >
      {/* ── HEADER: Avatar + nombre + fecha + menú ── */}
      <div className="tarjeta-exp-header">
        <div className="tarjeta-exp-autor">
          {/* Avatar */}
          <div className="exp-avatar">
            {experiencia.perfil?.avatar_url ? (
              <img src={experiencia.perfil.avatar_url} alt="Avatar" />
            ) : (
              <span>
                {(experiencia.perfil?.nombre || "U")[0].toUpperCase()}
              </span>
            )}
          </div>

          <div className="exp-autor-info">
            <span className="exp-autor-nombre">
              {experiencia.perfil?.nombre || "Usuario"}
            </span>
            <span className="exp-autor-fecha">
              {tiempoRelativo(experiencia.created_at)}
            </span>
          </div>
        </div>

        {/* Menú de opciones (solo para el dueño) */}
        {esDueno && (
          <div className="exp-opciones" ref={menuRef}>
            <button
              className="btn-opciones"
              onClick={() => setMenuAbierto(!menuAbierto)}
              disabled={borrando}
              aria-label="Opciones"
            >
              <IconPuntos />
            </button>

            {menuAbierto && (
              <div className="opciones-dropdown">
                <button
                  className="opciones-btn danger"
                  onClick={borrarExperiencia}
                >
                  <IconTrash />
                  Borrar
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── IMAGEN (si existe) ── */}
      {experiencia.imagen_url && (
        <img
          src={experiencia.imagen_url}
          alt="Imagen de la experiencia"
          className="tarjeta-exp-imagen"
          loading="lazy"
          onClick={() => window.open(experiencia.imagen_url, "_blank")}
          title="Click para ver en tamaño completo"
        />
      )}

      {/* ── CONTENIDO DE TEXTO ── */}
      <p className="tarjeta-exp-contenido">{experiencia.contenido}</p>

      {/* ── BADGE DEL LUGAR VINCULADO ── */}
      {experiencia.lugar && (
        <Link
          href={`/lugares/${experiencia.lugar_id}`}
          className="tarjeta-exp-lugar"
        >
          <IconPin />
          {experiencia.lugar.titulo}
        </Link>
      )}

      {/* ── FOOTER: Like ── */}
      <div className="tarjeta-exp-footer">
        <button
          className={`btn-like ${liked ? "liked" : ""}`}
          onClick={toggleLike}
          disabled={likeLoading}
          aria-label={liked ? "Quitar like" : "Dar like"}
        >
          <IconCorazon filled={liked} />
          {liked ? "Te gustó" : "Me gusta"}
        </button>

        {likes > 0 && (
          <span className="likes-count">
            {likes} {likes === 1 ? "persona" : "personas"}
          </span>
        )}
      </div>
    </article>
  );
}
