// lib/supabaseClient.js
// ─────────────────────────────────────────────────────
// Este archivo crea y exporta el cliente de Supabase.
// Solo se crea UNA VEZ y se reutiliza en toda la app.
// ─────────────────────────────────────────────────────

import { createClient } from "@supabase/supabase-js";

// 🔧 Estas variables vienen de tu archivo .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validación: si faltan las variables, lanza error claro
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "⚠️ Faltan variables de entorno de Supabase. " +
      "Revisa tu archivo .env.local",
  );
}

// Creamos el cliente con opciones de autenticación
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Persiste la sesión en localStorage automáticamente
    persistSession: true,
    // Detecta cambios de sesión en otras pestañas
    autoRefreshToken: true,
  },
});

// ─────────────────────────────────────────────────────
// USO EN OTROS ARCHIVOS:
// import { supabase } from '@/lib/supabaseClient'
// ─────────────────────────────────────────────────────
