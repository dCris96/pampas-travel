// context/AuthContext.js
// ─────────────────────────────────────────────────────
// CONTEXTO DE AUTENTICACIÓN GLOBAL
//
// ¿Por qué un contexto?
// Para que CUALQUIER componente de la app pueda saber
// si hay un usuario logueado sin pasar props manualmente.
//
// Uso en cualquier componente:
//   import { useAuth } from '@/context/AuthContext'
//   const { user, perfil, loading, logout } = useAuth()
// ─────────────────────────────────────────────────────

"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

// 1. Crear el contexto vacío
const AuthContext = createContext(null);

// 2. Provider: envuelve la app y provee el estado de auth
export function AuthProvider({ children }) {
  // El objeto user de Supabase Auth (tiene id, email, etc.)
  const [user, setUser] = useState(null);

  // El perfil de nuestra tabla public.profiles (tiene nombre, rol, avatar)
  const [perfil, setPerfil] = useState(null);

  // true mientras cargamos la sesión inicial
  const [loading, setLoading] = useState(true);

  // ── Cargar perfil desde Supabase ──
  // 🔧 Conecta con: tabla public.profiles
  async function cargarPerfil(userId) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single(); // Esperamos UN solo resultado

    if (error) {
      console.error("Error cargando perfil:", error.message);
      return;
    }

    setPerfil(data);
  }

  // ── Efecto principal: detectar cambios de sesión ──
  useEffect(() => {
    // onAuthStateChange escucha eventos:
    // 'SIGNED_IN', 'SIGNED_OUT', 'TOKEN_REFRESHED', etc.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Hay sesión activa
        setUser(session.user);
        await cargarPerfil(session.user.id);
      } else {
        // No hay sesión (o se cerró)
        setUser(null);
        setPerfil(null);
      }
      // Ya terminamos de cargar
      setLoading(false);
    });

    // Cleanup: desuscribirse cuando el componente se desmonta
    return () => subscription.unsubscribe();
  }, []);

  // ── Función de logout ──
  async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Error al cerrar sesión:", error.message);
    // onAuthStateChange detectará el SIGNED_OUT y limpiará el estado
  }

  // ── Valor que se expone al resto de la app ──
  const value = {
    user, // Objeto de Supabase Auth { id, email, ... }
    perfil, // Objeto de nuestra tabla profiles { nombre, rol, avatar_url }
    loading, // boolean: ¿todavía cargando la sesión?
    logout, // función para cerrar sesión
    // Helper: ¿es admin?
    isAdmin: perfil?.rol === "admin",
    // Helper: ¿está logueado?
    isLoggedIn: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 3. Hook personalizado para consumir el contexto fácilmente
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  }
  return context;
}
