// app/layout.js
import { AuthProvider } from "@/context/AuthContext";
import LayoutClient from "@/components/LayoutClient"; // ← nuevo
import "@/styles/globals.css";
import "@/styles/layout.css"; // ← asegúrate de importar layout.css
import "@/styles/lugares.css";

export const metadata = {
  title: "Valle de los Vientos — Portal del Distrito",
  description:
    "Un distrito envuelto en montañas, brumas y tradiciones milenarias.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" data-scroll-behavior="smooth">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body>
        <AuthProvider>
          <LayoutClient>{children}</LayoutClient>
        </AuthProvider>
      </body>
    </html>
  );
}
