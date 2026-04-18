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
