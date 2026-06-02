// app/page.js — VERSIÓN SERVER COMPONENT
// Ahora obtiene los datos directamente desde el servidor

import Link from "next/link";
import { getLugaresDestacados } from "@/app/actions/lugares";
import DestacadosSection from "@/components/DestacadosSection";
import HistoriaSection from "@/components/HistoriaSection";
import HeroSlideshow from "@/components/HeroSlideshow";
import EvolucionHistorica from "@/components/EvolucionHistorica";
import { getFiestasCount } from "@/app/actions/fiestas";
import { getLugaresCount } from "@/app/actions/lugares";
import "@/styles/home.css";

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

      {/* SITIOS DESTACADOS - Componente cliente que recibe datos del servidor */}
      <DestacadosSection lugaresIniciales={destacados} />

      {/* HISTORIA Y CULTURA - Componente cliente con lógica de leer más */}
      <section className="section">
        <EvolucionHistorica />
      </section>
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
