// components/admin/AdminSidebar.js
// ─────────────────────────────────────────────────────
// Sidebar de navegación del panel admin
// ─────────────────────────────────────────────────────

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const IconDashboard = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
  </svg>
);
const IconCompass = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" />
  </svg>
);
const IconShop = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);
const IconUsers = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconArrowLeft = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12,19 5,12 12,5" />
  </svg>
);

// Items del panel admin
const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", Icon: IconDashboard },
  { href: "/admin/lugares", label: "Lugares", Icon: IconCompass },
  { href: "/admin/negocios", label: "Negocios", Icon: IconShop },
  { href: "/admin/usuarios", label: "Usuarios", Icon: IconUsers },
];

export default function AdminSidebar({ stats = {} }) {
  const pathname = usePathname();

  return (
    <div className="admin-sidebar">
      <div className="admin-sidebar-header">
        <div className="admin-sidebar-titulo">⚡ Admin</div>
        <div className="admin-sidebar-sub">Panel de control</div>
      </div>

      {ADMIN_NAV.map(({ href, label, Icon }) => {
        const activo = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`admin-nav-item ${activo ? "activo" : ""}`}
          >
            <Icon />
            {label}
            {/* Badge con conteo si existe */}
            {stats[label] !== undefined && (
              <span className="admin-nav-badge">{stats[label]}</span>
            )}
          </Link>
        );
      })}

      {/* Separador + link de vuelta al sitio */}
      <Link
        href="/"
        className="admin-nav-item"
        style={{ borderTop: "1px solid #1f1f1f", color: "#444" }}
      >
        <IconArrowLeft />
        Volver al sitio
      </Link>
    </div>
  );
}
