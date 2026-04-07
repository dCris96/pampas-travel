// app/layout.js — ACTUALIZAR: agregar CSS de Leaflet
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
      <head>
        {/*
          CSS de Leaflet — NECESARIO para que el mapa se vea correctamente
          Sin esto los tiles y controles se muestran rotos
          🔧 Versión: 1.9.4 (la misma que instala npm)
        */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body>
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
