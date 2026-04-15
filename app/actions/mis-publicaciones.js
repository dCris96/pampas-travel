"use server";

import { createClient } from "@/lib/supabase/server";

export async function getContenidoUsuario(userId) {
  if (!userId)
    return { experiencias: [], productos: [], negocios: [], lugares: [] };

  const supabase = await createClient();

  const [expRes, prodRes, negRes, lugRes] = await Promise.all([
    supabase
      .from("experiencias")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("productos")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("negocios")
      .select("*")
      .eq("creado_por", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("lugares")
      .select("*")
      .eq("creado_por", userId)
      .order("created_at", { ascending: false }),
  ]);

  // Manejo de errores individuales (opcional)
  if (expRes.error) console.error("Error experiencias:", expRes.error);
  if (prodRes.error) console.error("Error productos:", prodRes.error);
  if (negRes.error) console.error("Error negocios:", negRes.error);
  if (lugRes.error) console.error("Error lugares:", lugRes.error);

  return {
    experiencias: expRes.data || [],
    productos: prodRes.data || [],
    negocios: negRes.data || [],
    lugares: lugRes.data || [],
  };
}
