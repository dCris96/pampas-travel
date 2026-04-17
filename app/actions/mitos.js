"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getMitos() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("mitos").select("*");
  if (error) throw error;
  return data;
}

export async function toggleMitoActivo(id, activoActual) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("mitos")
    .update({ activo: !activoActual })
    .eq("id", id);

  if (error) {
    console.error("Error al cambiar estado del mito:", error);
    throw new Error("No se pudo actualizar el estado.");
  }

  // Ajusta la ruta donde se listan los mitos
  revalidatePath("/admin/mitos"); // o '/mitos' según tu estructura
  return { success: true };
}

export async function deleteMito(id) {
  const supabase = await createClient();
  const { error } = await supabase.from("mitos").delete().eq("id", id);
  if (error) throw new Error("Error al eliminar mito");
  revalidatePath("/admin/mitos");
}
