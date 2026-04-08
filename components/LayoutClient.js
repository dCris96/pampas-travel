// components/LayoutClient.js
"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";

export default function LayoutClient({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Cerrar sidebar al cambiar de ruta (opcional)
  useEffect(() => {
    setSidebarOpen(false);
  }, [children]);

  // Cerrar sidebar si la pantalla pasa a >768px
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [sidebarOpen]);

  return (
    <div className="app-wrapper">
      <Navbar isOpen={sidebarOpen} />
      <main className="main-content">
        {/* Botón hamburguesa que se transforma en X */}
        <button
          className={`mobile-menu-btn ${sidebarOpen ? "open" : ""}`}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label={sidebarOpen ? "Cerrar menú" : "Abrir menú"}
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
        {children}
      </main>
    </div>
  );
}
