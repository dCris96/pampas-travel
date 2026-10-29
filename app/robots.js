// app/robots.js
// ─────────────────────────────────────────────────────
// ROBOTS.TXT — se sirve automáticamente en: /robots.txt
//
// ¿Cómo funciona?
// Next.js reconoce el archivo app/robots.js y convierte lo
// que devuelve esta función en el texto de robots.txt.
//
// ¿Para qué sirve?
// Le dice a Google y otros buscadores:
//   1. Qué partes del sitio NO deben rastrear (disallow)
//   2. Dónde está el sitemap (para que lo encuentren solos)
//
// 🔧 Qué debo cambiar: nada (usa la URL de lib/siteConfig.js)
// 🔧 Qué es personalizable: la lista "disallow"
//
// ⚠️ IMPORTANTE:
//   - robots.txt NO es seguridad. Cualquiera puede leerlo.
//     La protección real de /admin son AuthGuard y las
//     políticas RLS de Supabase.
//   - NO bloquees "/_next/": ahí vive el JavaScript que Google
//     necesita para "ver" tus páginas (tus páginas cargan sus
//     datos desde el navegador).
// ─────────────────────────────────────────────────────

import { SITE_URL } from '@/lib/siteConfig'

export default function robots() {
  return {
    rules: [
      {
        // "*" = todos los buscadores
        userAgent: '*',

        // Permitir rastrear todo el sitio...
        allow: '/',

        // ...excepto estas rutas (privadas o sin valor en buscadores)
        // 🔧 PERSONALIZABLE: agrega o quita rutas
        disallow: [
          '/admin',     // Panel de administración (y todo lo que cuelgue de él)
          '/perfil',    // Perfil privado de cada usuario
          '/login',     // Pantallas de acceso: no aportan nada en Google
          '/registro',
        ],
      },
    ],

    // Dirección del sitemap dinámico (app/sitemap.js)
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
