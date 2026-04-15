"use client";

import { useState, useEffect } from "react";
import CardLugar from "@/components/CardLugar";

export default function DestacadosSection({ lugaresIniciales }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Si no hay lugares iniciales, mostramos un mensaje (el servidor ya los obtuvo)
  const displayedDestacados = isMobile
    ? lugaresIniciales.slice(0, 1)
    : lugaresIniciales;

  if (!lugaresIniciales || lugaresIniciales.length === 0) {
    return (
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Sitios Turísticos</h2>
        </div>
        <div className="empty-state">
          <p>No hay sitios destacados todavía.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="section-header">
        <h2 className="section-title">Sitios Turísticos</h2>
        <a href="/lugares" className="section-link">
          Ver todos →
        </a>
      </div>
      <div className="cards-grid">
        {displayedDestacados.map((lugar) => (
          <CardLugar key={lugar.id} lugar={lugar} variante="normal" />
        ))}
      </div>
    </section>
  );
}
