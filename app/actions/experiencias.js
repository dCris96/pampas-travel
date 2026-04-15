"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getExperiencias(userId = null) {
  const supabase = await createClient();

  // 1. Obtener experiencias con perfil y lugar
  const { data: experiencias, error: expError } = await supabase
    .from("experiencias")
    .select(
      `
      *,
      perfil:profiles(nombre, avatar_url),
      lugar:lugares(id, titulo)
    `,
    )
    .eq("activo", true)
    .order("created_at", { ascending: false })
    .limit(50);

  if (expError) {
    console.error("Error al obtener experiencias:", expError);
    throw new Error("No se pudieron cargar las experiencias.");
  }

  if (!experiencias || experiencias.length === 0) {
    return { experiencias: [], stats: { total: 0, conFoto: 0, usuarios: 0 } };
  }

  // 2. Obtener conteo de likes por experiencia (usando count en BD, más eficiente)
  const experienciaIds = experiencias.map((e) => e.id);

  const { data: likesData, error: likesError } = await supabase
    .from("likes")
    .select("experiencia_id")
    .in("experiencia_id", experienciaIds);

  if (likesError) {
    console.error("Error al obtener likes:", likesError);
    throw new Error("Error al procesar likes.");
  }

  // Contar likes manualmente (o podrías usar una consulta agrupada)
  const likesCount = {};
  likesData?.forEach((like) => {
    likesCount[like.experiencia_id] =
      (likesCount[like.experiencia_id] || 0) + 1;
  });

  // 3. Si hay userId, obtener los likes de ese usuario
  let userLikedIds = [];
  if (userId) {
    const { data: userLikes, error: userLikesError } = await supabase
      .from("likes")
      .select("experiencia_id")
      .eq("user_id", userId)
      .in("experiencia_id", experienciaIds);

    if (!userLikesError) {
      userLikedIds = userLikes?.map((l) => l.experiencia_id) || [];
    }
  }

  // 4. Combinar datos
  const experienciasProcesadas = experiencias.map((exp) => ({
    ...exp,
    likes_count: likesCount[exp.id] || 0,
    user_liked: userLikedIds.includes(exp.id),
  }));

  // 5. Calcular estadísticas
  const total = experienciasProcesadas.length;
  const conFoto = experienciasProcesadas.filter((e) => e.imagen_url).length;
  const usuariosUnicos = new Set(experienciasProcesadas.map((e) => e.user_id))
    .size;

  return {
    experiencias: experienciasProcesadas,
    stats: { total, conFoto, usuarios: usuariosUnicos },
  };
}
