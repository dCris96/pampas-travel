// lib/siteConfig.js
// ─────────────────────────────────────────────────────
// CONFIGURACIÓN CENTRAL DEL SITIO
//
// Un solo lugar para la URL pública del sitio.
// La usan app/robots.js y app/sitemap.js (y más adelante
// podrás usarla para metadatos, canonicals, etc.)
//
// 🔧 Qué debo cambiar:
//   Nada, si tu dominio es www.pampastravel.org.pe
//   Si algún día cambias de dominio, edita SOLO esta línea
//   (o define la variable NEXT_PUBLIC_SITE_URL en tu hosting).
//
// ⚠️ Reglas de la URL:
//   - Con https://
//   - Con "www" si ese es tu dominio principal
//   - SIN "/" al final
//   Debe coincidir EXACTO con el dominio que Google indexa.
//   (www.pampastravel.org.pe y pampastravel.org.pe son
//   sitios DISTINTOS para Google)
// ─────────────────────────────────────────────────────

// 🔧 URL oficial de tu sitio
const URL_POR_DEFECTO = 'https://www.pampastravel.org.pe'

// Si existe la variable de entorno NEXT_PUBLIC_SITE_URL, tiene prioridad.
// .replace(/\/$/, '') quita la "/" final por si se escribe por error.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || URL_POR_DEFECTO
).replace(/\/$/, '')
