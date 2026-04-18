"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getVideos() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("videos").select("*");
  if (error) throw error;
  return data;
}

export async function toggleVideoActivo(id, activoActual) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("videos")
    .update({ activo: !activoActual })
    .eq("id", id);

  if (error) {
    console.error("Error al cambiar estado del video:", error);
    throw new Error("No se pudo actualizar el estado.");
  }

  // Ajusta la ruta donde se listan los mitos
  revalidatePath("/admin/videos"); // o '/mitos' según tu estructura
  return { success: true };
}

export async function deleteVideo(id) {
  const supabase = await createClient();
  const { error } = await supabase.from("videos").delete().eq("id", id);
  if (error) throw new Error("Error al eliminar video");
  revalidatePath("/admin/videos");
}
