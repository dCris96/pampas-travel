// app/page.js — VERSIÓN SERVER COMPONENT
// Ahora obtiene los datos directamente desde el servidor

import Link from "next/link";
import { getLugaresDestacados } from "@/app/actions/lugares";
import DestacadosSection from "@/components/DestacadosSection";
import HistoriaSection from "@/components/HistoriaSection";
import HeroSlideshow from "@/components/HeroSlideshow";
import { getFiestasCount } from "@/app/actions/fiestas";
import { getLugaresCount } from "@/app/actions/lugares";
import "@/styles/home.css";

const IconLogin = () => (
  // ... SVG (puede quedarse aquí porque no usa hooks)
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <polyline points="10,17 15,12 10,7" />
    <line x1="15" y1="12" x2="3" y2="12" />
  </svg>
);

export default async function HomePage() {
  // Obtener lugares destacados desde el servidor
  const destacados = await getLugaresDestacados();

  // Llamadas paralelas para mayor eficiencia
  const [fiestasCount, sitiosCount] = await Promise.all([
    getFiestasCount(),
    getLugaresCount(),
  ]);

  // Construimos STATS con los valores reales
  const STATS = [
    { value: "2,950 - 3,000", label: "Habitantes", color: "blue" }, // si es fijo
    { value: "438.18 km²", label: "Extensión", color: "yellow" }, // si es fijo
    {
      value: fiestasCount.toString(),
      label: "Festividades/año",
      color: "cyan",
    },
    { value: sitiosCount.toString(), label: "Sitios turísticos", color: "red" },
  ];

  return (
    <div>
      {/* HERO */}
      <section className="hero">
        <HeroSlideshow />
      </section>

      {/* ESTADÍSTICAS */}
      <div className="stats-grid">
        {STATS.map((stat, i) => (
          <div key={i} className="stat-card">
            <div className={`stat-value ${stat.color}`}>{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* INFORMACIÓN LOGIN */}
      <section className="section">
        <div className="Main_login">
          <p>
            Comparte tu experiencia en nuestro distrito con toda la comunidad.
            Si deseas publicar tu negocio, producto o servicio, inicia sesión y
            cuéntanos lo que quieras mostrar al mundo.
          </p>
          <Link href="/login" className="btn-login">
            <IconLogin />
            Iniciar Sesión
          </Link>
        </div>
      </section>

      {/* SITIOS DESTACADOS - Componente cliente que recibe datos del servidor */}
      <DestacadosSection lugaresIniciales={destacados} />

      {/* HISTORIA Y CULTURA - Componente cliente con lógica de leer más */}
      <HistoriaSection />

      {/* PRÓXIMAMENTE */}
      <section className="section">
        <h2 className="section-title">Próximamente...</h2>
        <p>
          ¡Estamos preparando más contenido para ti! Estadísticas dinámicas,
          eventos en vivo y mucho más.
        </p>
      </section>
    </div>
  );
}
