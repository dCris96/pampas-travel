"use server";

import { createClient } from "@/lib/supabase/server";

export async function getProductos() {
  const supabase = await createClient();

  // 1. Obtener productos
  const { data: productos, error } = await supabase
    .from("productos")
    .select("*")
    .eq("estado", "aprobado")
    .eq("activo", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error al obtener productos:", error);
    throw new Error("No se pudieron cargar los productos.");
  }

  if (!productos || productos.length === 0) return [];

  // 2. Obtener los perfiles asociados
  const userIds = [...new Set(productos.map((p) => p.user_id).filter(Boolean))];
  const { data: perfiles } = await supabase
    .from("profiles")
    .select("id, nombre")
    .in("id", userIds);

  // 3. Combinar datos
  const productosConPerfil = productos.map((producto) => ({
    ...producto,
    perfil: perfiles?.find((p) => p.id === producto.user_id) || null,
  }));

  return productosConPerfil;
}
