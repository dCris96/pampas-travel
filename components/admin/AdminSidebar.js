// components/admin/AdminSidebar.js
// ─────────────────────────────────────────────────────
// Sidebar de navegación del panel admin
// Ahora carga sus propios stats
// ─────────────────────────────────────────────────────

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getStats } from "@/app/actions/admin";

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
const IconBell = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);
const IconBook = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);
const IconMusic = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);
const IconVideo = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="23,7 16,12 23,17" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);
const IconCalendar = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const IconStar = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
  </svg>
);
const IconBriefcase = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);
const CaserioIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Casa pequeña / vivienda rural */}
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
    {/* Elemento adicional que representa varias casas pequeñas agrupadas */}
    <circle cx="18" cy="8" r="1" />
    <circle cx="6" cy="8" r="1" />
  </svg>
);

// Items del panel admin
const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", Icon: IconDashboard, statKey: null },
  {
    href: "/admin/lugares",
    label: "Lugares",
    Icon: IconCompass,
    statKey: "lugares",
  },
  { href: "/admin/mitos", label: "Mitos", Icon: IconBook, statKey: "mitos" },
  {
    href: "/admin/musica",
    label: "Música",
    Icon: IconMusic,
    statKey: "musica",
  },
  {
    href: "/admin/videos",
    label: "Videos",
    Icon: IconVideo,
    statKey: "videos",
  },
  {
    href: "/admin/Fiestas",
    label: "Fiestas",
    Icon: IconCalendar,
    statKey: "festividades",
  },
  {
    href: "/admin/caserios",
    label: "Caseríos",
    Icon: CaserioIcon,
    statKey: "caserios",
  },
  {
    href: "/admin/experiencias",
    label: "Experiencias",
    Icon: IconStar,
    statKey: "experiencias",
  },
  {
    href: "/admin/productos",
    label: "Productos",
    Icon: IconShop,
    statKey: "productos",
  },
  {
    href: "/admin/negocios",
    label: "Negocios",
    Icon: IconBriefcase,
    statKey: "negocios",
  },
  {
    href: "/admin/usuarios",
    label: "Usuarios",
    Icon: IconUsers,
    statKey: "usuarios",
  },
  {
    href: "/admin/moderacion",
    label: "Moderación",
    Icon: IconBell,
    statKey: "contenidoPendiente",
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  // Cargar stats al montar el sidebar
  useEffect(() => {
    async function cargarStats() {
      try {
        const data = await getStats();

        setStats(data);
      } catch (err) {
        console.error("Error cargando stats en sidebar:", err);
      } finally {
        setLoading(false);
      }
    }

    cargarStats();
  }, []); // Solo se carga una vez al montar

  // Función para obtener el badge según la clave
  const getBadgeValue = (statKey) => {
    if (!statKey) return null;
    return stats[statKey];
  };

  return (
    <div className="admin-sidebar">
      <div className="admin-sidebar-header">
        <div className="admin-sidebar-titulo">⚡ Admin</div>
        <div className="admin-sidebar-sub">Panel de control</div>
      </div>

      {ADMIN_NAV.map(({ href, label, Icon, statKey }) => {
        const activo = pathname === href;
        const badgeValue = getBadgeValue(statKey);

        return (
          <Link
            key={href}
            href={href}
            className={`admin-nav-item ${activo ? "activo" : ""}`}
          >
            <Icon />
            {label}
            {/* Mostrar badge si existe valor y no está cargando */}
            {!loading && badgeValue !== undefined && badgeValue !== null && (
              <span className="admin-nav-badge">{badgeValue}</span>
            )}
            {/* Opcional: mostrar skeleton mientras carga */}
            {loading && statKey && (
              <span className="admin-nav-badge admin-nav-badge-skeleton">
                —
              </span>
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
