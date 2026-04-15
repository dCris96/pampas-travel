"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getNegocios() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("negocios").select("*");
  if (error) throw error;
  return data;
}

// Obtener negocios con coordenadas para el mapa
export async function getNegociosParaMapa() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("negocios")
    .select(
      "id, nombre, descripcion, tipo, imagen_url, latitud, longitud, direccion",
    )
    .eq("activo", true)
    .not("latitud", "is", null)
    .not("longitud", "is", null);

  if (error) {
    console.error("Error al obtener negocios para mapa:", error);
    return [];
  }
  return data || [];
}

export async function getHoteles() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("negocios")
    .select("*")
    .eq("activo", true)
    .eq("tipo", "hotel")
    .order("destacado", { ascending: false })
    .order("precio_desde", { ascending: true }); // Más baratos primero
  if (error) throw error;
  return data || null;
}

export async function getRestaurantes() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("negocios")
    .select("*")
    .eq("activo", true)
    .eq("tipo", "restaurante")
    .order("destacado", { ascending: false })
    .order("precio_desde", { ascending: true }); // Más baratos primero
  if (error) throw error;
  return data || null;
}

export async function getNegociosPagina() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("negocios")
    .select("*")
    .eq("activo", true)
    .order("destacado", { ascending: false })
    .order("nombre", { ascending: true });
  if (error) throw error;
  return data || null;
}
