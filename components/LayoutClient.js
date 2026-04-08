// components/LayoutClient.js
"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import MobileHeader from "@/components/MobileHeader";

export default function LayoutClient({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [children, isMobile]);

  const closeSidebar = () => isMobile && setSidebarOpen(false);
  const toggleSidebar = () => isMobile && setSidebarOpen(!sidebarOpen);

  return (
    <div className="app-wrapper">
      <Navbar
        isOpen={sidebarOpen}
        isMobile={isMobile}
        closeSidebar={closeSidebar}
      />

      {/* Renderizado condicional: en escritorio no hay wrapper ni header móvil */}
      {isMobile ? (
        <div className="main-content-wrapper">
          <MobileHeader isOpen={sidebarOpen} onToggle={toggleSidebar} />
          <main className="main-content">{children}</main>
        </div>
      ) : (
        <main className="main-content">{children}</main>
      )}

      {isMobile && sidebarOpen && (
        <div className="sidebar-backdrop" onClick={closeSidebar} />
      )}
    </div>
  );
}
