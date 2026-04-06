// components/AuthGuard.js
// ─────────────────────────────────────────────────────
// GUARDIA DE AUTENTICACIÓN
//
// Envuelve cualquier página que quieras proteger.
// Si el usuario no está logueado, redirige al login.
//
// USO:
//   import AuthGuard from '@/components/AuthGuard'
//
//   export default function MiPaginaProtegida() {
//     return (
//       <AuthGuard>
//         <div>Contenido privado</div>
//       </AuthGuard>
//     )
//   }
//
// Para rutas solo de admin:
//   <AuthGuard soloAdmin>
//     <div>Panel de admin</div>
//   </AuthGuard>
// ─────────────────────────────────────────────────────

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function AuthGuard({ children, soloAdmin = false }) {
  const { user, perfil, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Solo actuamos cuando ya terminó de cargar la sesión
    if (loading) return;

    // Si no hay usuario, redirige al login
    if (!user) {
      router.push("/login");
      return;
    }

    // Si requiere admin y no es admin, redirige al inicio
    if (soloAdmin && !isAdmin) {
      router.push("/");
    }
  }, [user, loading, isAdmin, soloAdmin, router]);

  // ── ESTADO DE CARGA ──
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          color: "#666",
          fontSize: "14px",
          fontFamily: "var(--font-display)",
        }}
      >
        Verificando sesión...
      </div>
    );
  }

  // ── SIN PERMISO (admin requerido) ──
  if (soloAdmin && !isAdmin) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <h2 style={{ fontFamily: "var(--font-display)", marginBottom: "10px" }}>
          Acceso restringido
        </h2>
        <p style={{ color: "#666", marginBottom: "24px", fontSize: "14px" }}>
          No tienes permisos para ver esta página.
        </p>
        <Link
          href="/"
          style={{
            color: "var(--color-blue)",
            fontFamily: "var(--font-display)",
            fontSize: "14px",
          }}
        >
          ← Volver al inicio
        </Link>
      </div>
    );
  }

  // ── SIN USUARIO ──
  if (!user) return null; // La redirección ya está en marcha

  // ── AUTORIZADO ──
  return children;
}
