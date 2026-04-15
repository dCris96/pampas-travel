"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getStats() {
  const supabase = await createClient();

  try {
    const [
      lugaresRes,
      mitosRes,
      musicaRes,
      videosRes,
      festividadesRes,
      caseriosRes,
      productosRes,
      negociosRes,
      experienciasRes,
      usersRes,
      contPendRes,
    ] = await Promise.all([
      supabase.from("lugares").select("id", { count: "exact", head: true }),
      supabase.from("mitos").select("id", { count: "exact", head: true }),
      supabase.from("musica").select("id", { count: "exact", head: true }),
      supabase.from("videos").select("id", { count: "exact", head: true }),
      supabase
        .from("festividades")
        .select("id", { count: "exact", head: true }),
      supabase.from("caserios").select("id", { count: "exact", head: true }),
      supabase.from("productos").select("id", { count: "exact", head: true }),
      supabase.from("negocios").select("id", { count: "exact", head: true }),
      supabase
        .from("experiencias")
        .select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase
        .from("contenido_pendiente")
        .select("id", { count: "exact", head: true }),
    ]);

    // Verificar errores individuales (opcional pero recomendado)
    const errors = [];
    if (lugaresRes.error) errors.push(`lugares: ${lugaresRes.error.message}`);
    if (mitosRes.error) errors.push(`mitos: ${mitosRes.error.message}`);
    // ... puedes agregar todos si quieres

    if (errors.length > 0) {
      console.error("Errores en algunas consultas de stats:", errors);
      // Decidir si lanzar error o devolver parcial
    }

    return {
      lugares: lugaresRes.count || 0,
      mitos: mitosRes.count || 0,
      musica: musicaRes.count || 0,
      videos: videosRes.count || 0,
      festividades: festividadesRes.count || 0,
      caserios: caseriosRes.count || 0,
      productos: productosRes.count || 0,
      negocios: negociosRes.count || 0,
      experiencias: experienciasRes.count || 0,
      usuarios: usersRes.count || 0,
      contenidoPendiente: contPendRes.count || 0,
    };
  } catch (error) {
    console.error("Error en getStats:", error);
    throw new Error("No se pudieron cargar las estadísticas");
  }
}

export async function getExpRecientes() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("experiencias")
    .select("id, contenido, created_at, perfil:profiles(nombre)")
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    console.error("Error en getExpRecientes:", error);
    throw new Error("No se pudieron cargar las experiencias recientes");
  }

  return data || [];
}
