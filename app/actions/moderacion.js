"use server";

import { createClient } from "@/lib/supabase/server";

// Tablas permitidas — lista blanca explícita
const TABLAS_PERMITIDAS = ["experiencias", "productos", "negocios"];

// Columna FK al usuario según la tabla
const CAMPO_USER = {
  experiencias: "user_id",
  productos: "user_id",
  negocios: "creado_por",
};

function validarTabla(tabla) {
  if (!TABLAS_PERMITIDAS.includes(tabla)) {
    throw new Error(`Tabla no permitida: ${tabla}`);
  }
}

// ─────────────────────────────────────────────────────
// cargarConteos
// ─────────────────────────────────────────────────────
export async function cargarConteos() {
  const supabase = await createClient();

  const resultados = await Promise.all(
    TABLAS_PERMITIDAS.map(async (tabla) => {
      const { count, error } = await supabase
        .from(tabla)
        .select("id", { count: "exact", head: true })
        .eq("estado", "pendiente");

      if (error) {
        console.error(`Error contando ${tabla}:`, error.message);
        return [tabla, 0];
      }
      return [tabla, count ?? 0];
    }),
  );

  return Object.fromEntries(resultados);
}

// ─────────────────────────────────────────────────────
// cargarItems
//
// En lugar de un JOIN que Supabase no puede resolver,
// hacemos dos queries y unimos en JS:
//   1. Items filtrados por estado
//   2. Profiles de los user_ids encontrados
// ─────────────────────────────────────────────────────
export async function cargarItems({ tabla, estado }) {
  validarTabla(tabla);

  const supabase = await createClient();
  const campoUser = CAMPO_USER[tabla];

  // ── Query 1: traer los items ──
  const { data: items, error: itemsError } = await supabase
    .from(tabla)
    .select("*")
    .eq("estado", estado)
    .order("created_at", { ascending: estado === "pendiente" })
    .limit(200);

  if (itemsError) {
    console.error(`Error cargando ${tabla}:`, itemsError.message);
    return { data: [], error: itemsError.message };
  }

  if (!items || items.length === 0) {
    return { data: [], error: null };
  }

  // ── Query 2: traer los perfiles de los autores ──
  // Extraemos los IDs únicos de usuario de los items
  const userIds = [
    ...new Set(items.map((item) => item[campoUser]).filter(Boolean)),
  ];

  let perfilesMap = {};

  if (userIds.length > 0) {
    const { data: perfiles, error: perfilesError } = await supabase
      .from("profiles")
      .select("id, nombre, avatar_url")
      .in("id", userIds);

    if (perfilesError) {
      // No es fatal: los items se muestran sin nombre de autor
      console.warn("Error cargando perfiles:", perfilesError.message);
    } else {
      // Convertimos el array a un mapa { id → perfil } para búsqueda O(1)
      perfilesMap = Object.fromEntries((perfiles ?? []).map((p) => [p.id, p]));
    }
  }

  // ── Unir: agregar el perfil a cada item ──
  const itemsConPerfil = items.map((item) => ({
    ...item,
    perfil: perfilesMap[item[campoUser]] ?? null,
  }));

  return { data: itemsConPerfil, error: null };
}

// ─────────────────────────────────────────────────────
// aprobarItem
// ─────────────────────────────────────────────────────
export async function aprobarItem({ tabla, id }) {
  validarTabla(tabla);

  const supabase = await createClient();

  // .select() al final hace que Supabase devuelva las filas afectadas
  // Si data viene vacío [], el UPDATE no encontró la fila (RLS o ID incorrecto)
  const { data, error } = await supabase
    .from(tabla)
    .update({ estado: "aprobado", nota_rechazo: null })
    .eq("id", id)
    .select("id, estado"); // ← clave para ver qué pasó

  // Log en terminal de Next.js (npm run dev)
  console.log("[aprobarItem]", { tabla, id, data, error });

  if (error) {
    console.error(`Error aprobando en ${tabla}:`, error.message);
    return { ok: false, error: error.message };
  }

  // Si data está vacío, RLS bloqueó silenciosamente o el ID no existe
  if (!data || data.length === 0) {
    const msg = `UPDATE no afectó ninguna fila. Verifica RLS y que el id="${id}" exista en ${tabla}`;
    console.error("[aprobarItem]", msg);
    return { ok: false, error: msg };
  }

  return { ok: true };
}

// ─────────────────────────────────────────────────────
// rechazarItem
// ─────────────────────────────────────────────────────
export async function rechazarItem({ tabla, id, motivo }) {
  validarTabla(tabla);

  if (!motivo?.trim()) {
    return { ok: false, error: "El motivo de rechazo es obligatorio." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from(tabla)
    .update({ estado: "rechazado", nota_rechazo: motivo.trim() })
    .eq("id", id)
    .select("id, estado"); // ← igual aquí

  console.log("[rechazarItem]", { tabla, id, data, error });

  if (error) {
    console.error(`Error rechazando en ${tabla}:`, error.message);
    return { ok: false, error: error.message };
  }

  if (!data || data.length === 0) {
    const msg = `UPDATE no afectó ninguna fila. Verifica RLS y que el id="${id}" exista en ${tabla}`;
    console.error("[rechazarItem]", msg);
    return { ok: false, error: msg };
  }

  return { ok: true };
}
