// app/sitemap.js
// ─────────────────────────────────────────────────────
// SITEMAP DINÁMICO — se sirve automáticamente en: /sitemap.xml
//
// ¿Cómo funciona?
// Next.js reconoce el archivo app/sitemap.js: la función que
// exportas devuelve un array de URLs y Next lo convierte a XML.
//
// ¿Por qué "dinámico"?
// Tus lugares y negocios se crean desde el panel admin
// (Supabase), no desde el código. Un sitemap.xml fijo solo
// conocería las páginas que existían cuando lo escribiste.
// Aquí LEEMOS Supabase cada vez que el sitemap se regenera,
// así cada lugar o negocio nuevo aparece solo, sin redeploy.
//
// ⚠️ Ojo: por defecto Next trata este archivo como estático
// (lo genera UNA vez al hacer build y queda "congelado").
// Por eso abajo usamos `revalidate`, que lo vuelve a generar
// cada cierto tiempo.
//
// 🔧 Conecta con: tablas lugares y negocios (SELECT público)
// 🔧 Qué debo cambiar: nada para empezar
// ─────────────────────────────────────────────────────

import { supabaseServer } from '@/lib/supabaseServer'
import { SITE_URL } from '@/lib/siteConfig'

// ── CADA CUÁNTO SE REGENERA ──
// El sitemap se guarda en caché y se vuelve a generar, como
// máximo, cada 3600 segundos (1 hora).
// 🔧 PERSONALIZABLE:
//   300   → cada 5 minutos (publicas contenido a cada rato)
//   86400 → cada 24 horas (casi nunca cambia)
//
// ¿Lo quieres 100% en vivo (consulta Supabase en cada visita)?
// Borra la línea de abajo y usa en su lugar:
//   export const dynamic = 'force-dynamic'
export const revalidate = 3600

// ── COLUMNA DE FECHA ──
// Se usa para <lastmod>, la fecha de última modificación que
// Google SÍ toma en cuenta. Hoy usamos la fecha de creación.
// 🔧 Si más adelante agregas una columna "updated_at" a tus
//    tablas, cambia aquí el nombre y listo.
const COLUMNA_FECHA = 'created_at'

// ── PÁGINAS FIJAS ──
// Páginas que existen siempre, sin depender de la base de datos.
// 🔧 PERSONALIZABLE: agrega o quita rutas
//
// ❌ NO incluimos /admin, /perfil, /login ni /registro:
//    son privadas y están bloqueadas en robots.js
const PAGINAS_FIJAS = [
  { ruta: '/',             changeFrequency: 'daily',   priority: 1.0 },
  { ruta: '/lugares',      changeFrequency: 'weekly',  priority: 0.9 },
  { ruta: '/negocios',     changeFrequency: 'weekly',  priority: 0.8 },
  { ruta: '/hoteles',      changeFrequency: 'weekly',  priority: 0.8 },
  { ruta: '/restaurantes', changeFrequency: 'weekly',  priority: 0.8 },
  { ruta: '/mapa',         changeFrequency: 'weekly',  priority: 0.7 },
  { ruta: '/experiencias', changeFrequency: 'daily',   priority: 0.7 },
  { ruta: '/videos',       changeFrequency: 'monthly', priority: 0.6 },
  { ruta: '/musica',       changeFrequency: 'monthly', priority: 0.6 },

  // 🔧 Estas rutas están en tu menú pero NO las construimos en
  //    las 8 fases. Descomenta SOLO las que ya tengas creadas:
  //    una URL que da error 404 aparece como error en Search Console.
  // { ruta: '/mitos',      changeFrequency: 'weekly',  priority: 0.7 },
  // { ruta: '/calendario', changeFrequency: 'weekly',  priority: 0.6 },
  // { ruta: '/productos',  changeFrequency: 'weekly',  priority: 0.7 },
]

// ── LEER UNA TABLA DE SUPABASE ──
// Trae solo "id" y la fecha de cada fila (no necesitamos más).
//   tabla       → nombre de la tabla ('lugares', 'negocios', ...)
//   soloActivos → true: solo filas con activo = true
//                 (pon false si la tabla no tiene esa columna)
//
// Si Supabase falla, NO rompe el sitemap: avisa en la consola
// y devuelve una lista vacía (el sitemap sale con las páginas fijas).
async function cargarTabla(tabla, soloActivos = true) {
  try {
    let consulta = supabaseServer
      .from(tabla)
      .select(`id, ${COLUMNA_FECHA}`)

    // Mismo filtro que usan las páginas públicas del sitio
    if (soloActivos) consulta = consulta.eq('activo', true)

    // Más recientes primero
    const { data, error } = await consulta.order(COLUMNA_FECHA, { ascending: false })

    if (error) throw error
    return data || []
  } catch (err) {
    // Si ves este mensaje en los logs de tu hosting, la consulta falló
    console.error(`[sitemap] No se pudo leer "${tabla}":`, err.message)
    return []
  }
}

// ── FUNCIÓN PRINCIPAL ──
// Next.js la ejecuta y convierte el array que devuelve en XML.
export default async function sitemap() {

  // 1️⃣ Páginas fijas → URL completa
  const paginasFijas = PAGINAS_FIJAS.map(({ ruta, changeFrequency, priority }) => ({
    url: `${SITE_URL}${ruta}`,
    changeFrequency,
    priority,
  }))

  // 2️⃣ Datos dinámicos de Supabase (las consultas corren en paralelo)
  const [lugares, negocios] = await Promise.all([
    cargarTabla('lugares'),
    cargarTabla('negocios'),
    // 🔧 ¿Quieres otra tabla con página de detalle (ej. productos)?
    //    a) Agrégala aquí:  cargarTabla('productos'),
    //    b) Crea su "map" abajo (copia el de negocios)
    //    c) Inclúyela en el return del final
  ])

  // 3️⃣ Cada fila → una URL de detalle
  // Las tarjetas de hoteles y restaurantes también enlazan a
  // /negocios/[id], así que este map cubre todos los tipos.
  const paginasLugares = lugares.map((lugar) => ({
    url: `${SITE_URL}/lugares/${lugar.id}`,
    lastModified: new Date(lugar[COLUMNA_FECHA]),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const paginasNegocios = negocios.map((negocio) => ({
    url: `${SITE_URL}/negocios/${negocio.id}`,
    lastModified: new Date(negocio[COLUMNA_FECHA]),
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  // 4️⃣ Unir todo en un solo array
  return [...paginasFijas, ...paginasLugares, ...paginasNegocios]
}
