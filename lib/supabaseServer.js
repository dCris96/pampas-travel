// lib/supabaseServer.js
// ─────────────────────────────────────────────────────
// CLIENTE DE SUPABASE PARA EL SERVIDOR
//
// ¿Por qué otro cliente si ya tenemos supabaseClient.js?
// El de la Fase 1 está pensado para el NAVEGADOR: guarda la
// sesión en localStorage y renueva tokens automáticamente.
// En el servidor (donde se genera el sitemap) no hay navegador
// ni usuario logueado, así que usamos uno sin sesión.
//
// Usa la misma ANON KEY, por lo tanto solo puede leer lo que
// tus políticas RLS permiten a cualquier visitante. No expone
// nada privado.
//
// 🔧 Conecta con: variables de entorno de Supabase
//   NEXT_PUBLIC_SUPABASE_URL
//   NEXT_PUBLIC_SUPABASE_ANON_KEY
//   (las mismas que ya tienes en .env.local y en tu hosting)
//
// ⚠️ NUNCA pongas aquí la service_role key: se saltaría todas
//    las políticas RLS.
// ─────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js'

const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validación: si faltan las variables, lanza un error claro
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '⚠️ Faltan variables de entorno de Supabase. ' +
    'Revisa .env.local (local) o las variables de tu hosting (producción).'
  )
}

export const supabaseServer = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession:     false, // No guardar sesión (no hay navegador)
    autoRefreshToken:   false, // No renovar tokens
    detectSessionInUrl: false, // No buscar tokens en la URL
  },
})

// ─────────────────────────────────────────────────────
// USO EN OTROS ARCHIVOS DEL SERVIDOR:
// import { supabaseServer } from '@/lib/supabaseServer'
// ─────────────────────────────────────────────────────
