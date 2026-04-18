"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getFiestasCount() {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("festividades")
    .select("*", { count: "exact", head: true }); // head: true evita traer los datos

  if (error) throw new Error("Error al obtener conteo de festividades");
  return count; // retorna un número (ej: 8)
}

export async function getFiestas() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("festividades").select("*");
  if (error) throw error;
  return data;
}

export async function toggleFiestaActiva(id, activoActual) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("festividades")
    .update({ activo: !activoActual })
    .eq("id", id);

  if (error) {
    console.error("Error al cambiar estado de la fiesta:", error);
    throw new Error("No se pudo actualizar el estado.");
  }

  // Ajusta la ruta donde se listan los mitos
  revalidatePath("/admin/fiestas"); // o '/mitos' según tu estructura
  return { success: true };
}

export async function deleteFiesta(id) {
  const supabase = await createClient();
  const { error } = await supabase.from("festividades").delete().eq("id", id);
  if (error) throw new Error("Error al eliminar fiesta");
  revalidatePath("/admin/fiestas");
}
