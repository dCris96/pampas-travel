"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getLugaresCount() {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("lugares")
    .select("*", { count: "exact", head: true }); // head: true evita traer los datos

  if (error) throw new Error("Error al obtener conteo de lugares");
  return count; // retorna un número (ej: 8)
}

export async function getLugares() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lugares")
    .select("*, caserio:caserios(nombre)") // Incluye nombre del caserío si existe relación
    .order("created_at", { ascending: false });

  if (error) throw new Error("Error al obtener lugares");
  return data;
}

// Actualizar lugar existente
export async function updateLugar(id, formData) {
  const supabase = await createClient();

  const rawData = {
    titulo: formData.get("titulo"),
    descripcion: formData.get("descripcion"),
    categoria: formData.get("categoria"),
    imagen_url: formData.get("imagen_url"),
    latitud: formData.get("latitud")
      ? parseFloat(formData.get("latitud"))
      : null,
    longitud: formData.get("longitud")
      ? parseFloat(formData.get("longitud"))
      : null,
    altitud: formData.get("altitud")
      ? parseFloat(formData.get("altitud"))
      : null,
    caserio_id: formData.get("caserio_id") || null,
    destacado: formData.get("destacado") === "true",
    activo: formData.get("activo") === "true",
  };

  const { error } = await supabase.from("lugares").update(rawData).eq("id", id);
  if (error) throw new Error("Error al actualizar lugar");

  revalidatePath("/admin/lugares");
  redirect("/admin/lugares");
}

// Eliminar lugar
export async function deleteLugar(id) {
  const supabase = await createClient();
  const { error } = await supabase.from("lugares").delete().eq("id", id);
  if (error) throw new Error("Error al eliminar lugar");
  revalidatePath("/admin/lugares");
}

// Obtener lugares destacados (para home)
export async function getLugaresDestacados() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lugares")
    .select("*")
    .eq("activo", true)
    .eq("destacado", true)
    .limit(3)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error al obtener destacados:", error);
    return [];
  }
  return data;
}

// Nueva función para obtener lugares con coordenadas (para el mapa)
export async function getLugaresParaMapa() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lugares")
    .select("id, titulo, descripcion, categoria, imagen_url, latitud, longitud")
    .eq("activo", true)
    .not("latitud", "is", null)
    .not("longitud", "is", null);

  if (error) {
    console.error("Error al obtener lugares para mapa:", error);
    return [];
  }
  return data;
}

export async function toggleLugarActivo(id, activoActual) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("lugares")
    .update({ activo: !activoActual })
    .eq("id", id);

  if (error) {
    console.error("Error al cambiar estado del lugar:", error);
    throw new Error("No se pudo actualizar el estado.");
  }

  // Ajusta la ruta donde se listan los lugares
  revalidatePath("/admin/lugares"); // o '/lugares' según tu estructura
  return { success: true };
}

// Crear nuevo lugar
export async function createLugar(formData) {
  const supabase = await createClient();

  // Extraer datos del FormData
  const rawData = {
    titulo: formData.get("titulo"),
    descripcion: formData.get("descripcion"),
    categoria: formData.get("categoria"),
    imagen_url: formData.get("imagen_url"),
    latitud: formData.get("latitud")
      ? parseFloat(formData.get("latitud"))
      : null,
    longitud: formData.get("longitud")
      ? parseFloat(formData.get("longitud"))
      : null,
    altitud: formData.get("altitud")
      ? parseFloat(formData.get("altitud"))
      : null,
    caserio_id: formData.get("caserio_id") || null,
    destacado: formData.get("destacado") === "true",
    activo: formData.get("activo") === "true",
  };

  const { error } = await supabase.from("lugares").insert([rawData]);
  if (error) throw new Error("Error al crear lugar");

  revalidatePath("/admin/lugares");
  redirect("/admin/lugares");
}
