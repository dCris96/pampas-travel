"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

// Obtener sesión actual (para Server Components)
export async function getSession() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

// Obtener usuario actual (para Server Components)
export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// Obtener perfil completo desde tabla profiles
export async function getPerfil(userId) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) return null;
  return data;
}

// Cerrar sesión (Server Action)
export async function signOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error("Error al cerrar sesión");
  return { success: true };
}
