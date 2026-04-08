// components/MobileHeader.js
"use client";

export default function MobileHeader({ isOpen, onToggle }) {
  return (
    <header className="mobile-header">
      <button
        className={`mobile-menu-btn ${isOpen ? "open" : ""}`}
        onClick={onToggle}
        aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
      >
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>
      <div className="mobile-header-title">Valle de los Vientos</div>
    </header>
  );
}
