// next.config.js
// ─────────────────────────────────────────────────────
// Configuración de Next.js
// Permite cargar imágenes externas (Unsplash, Supabase Storage)
// ─────────────────────────────────────────────────────

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // 🔧 Agrega aquí los dominios de donde cargarás imágenes
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com", // Imágenes de ejemplo
      },
      {
        protocol: "https",
        // 🔧 IMPORTANTE: Reemplaza con tu URL de Supabase Storage
        // Ejemplo: abcdefghijklmnop.supabase.co
        hostname: "*.supabase.co",
      },
    ],
  },
};

export default nextConfig;
