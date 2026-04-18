"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getCaserios() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("caserios").select("*");
  if (error) throw error;
  return data;
}

export async function toggleCaserioActivo(id, activoActual) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("caserios")
    .update({ activo: !activoActual })
    .eq("id", id);

  if (error) {
    console.error("Error al cambiar estado del caserío:", error);
    throw new Error("No se pudo actualizar el estado.");
  }

  // Revalida la ruta donde se muestran los caseríos
  // Ajusta la ruta según corresponda (ej: '/admin/caserios', '/caserios', etc.)
  revalidatePath("/admin/caserios");

  return { success: true };
}

export async function deleteCaserio(id) {
  const supabase = await createClient();
  const { error } = await supabase.from("caserios").delete().eq("id", id);
  if (error) throw new Error("Error al eliminar caserío");
  revalidatePath("/admin/caserios");
}
