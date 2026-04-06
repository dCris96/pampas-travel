// app/layout.js — VERSIÓN ACTUALIZADA CON AuthProvider
// ─────────────────────────────────────────────────────
// Agrega AuthProvider para que toda la app tenga acceso
// al estado de autenticación
// ─────────────────────────────────────────────────────

import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/context/AuthContext";
import "@/styles/globals.css";

export const metadata = {
  title: "Valle de los Vientos — Portal del Distrito",
  description:
    "Un distrito envuelto en montañas, brumas y tradiciones milenarias.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" data-scroll-behavior="smooth">
      <body>
        {/*
          AuthProvider envuelve TODO para que cualquier
          componente pueda usar useAuth()
        */}
        <AuthProvider>
          <div className="app-wrapper">
            <Navbar />
            <main className="main-content">{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
