"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getMusica() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("musica").select("*");
  if (error) throw error;
  return data;
}

export async function toggleMusicaActivo(id, activoActual) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("musica")
    .update({ activo: !activoActual })
    .eq("id", id);

  if (error) {
    console.error("Error al cambiar estado de la música:", error);
    throw new Error("No se pudo actualizar el estado.");
  }

  // Ajusta la ruta donde se listan los mitos
  revalidatePath("/admin/musica"); // o '/mitos' según tu estructura
  return { success: true };
}

export async function deleteMusica(id) {
  const supabase = await createClient();
  const { error } = await supabase.from("musica").delete().eq("id", id);
  if (error) throw new Error("Error al eliminar música");
  revalidatePath("/admin/musica");
}
