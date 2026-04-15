// components/Navbar.js — VERSIÓN CON AUTH
// ─────────────────────────────────────────────────────
// Ahora el sidebar reacciona al estado de autenticación:
// - Sin login: muestra botón "Iniciar Sesión"
// - Con login: muestra avatar, nombre y botón "Salir"
// ─────────────────────────────────────────────────────

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import "../styles/layout.css";

// ── ÍCONOS (mismos de Fase 1) ──
const IconHome = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9,22 9,12 15,12 15,22" />
  </svg>
);
const IconMap = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="1,6 1,22 8,18 16,22 23,18 23,2 16,6 8,2" />
    <line x1="8" y1="2" x2="8" y2="18" />
    <line x1="16" y1="6" x2="16" y2="22" />
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
const IconCompass = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" />
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
const IconShop = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);
const IconHotel = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 22V8l9-6 9 6v14" />
    <path d="M9 22V12h6v10" />
  </svg>
);
const IconFork = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
    <line x1="7" y1="11" x2="7" y2="22" />
    <line x1="21" y1="2" x2="21" y2="22" />
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
const IconLogin = () => (
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
const IconLogout = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16,17 21,12 16,7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const IconUser = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const IconMountain = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="3,20 21,20 12,4" />
    <polyline points="3,20 9,12 12,15 15,11 21,20" />
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

// ── ESTRUCTURA DE NAVEGACIÓN ──
const NAV_SECTIONS = [
  {
    label: "Principal",
    items: [
      { href: "/", label: "Inicio", Icon: IconHome },
      { href: "/mapa", label: "Mapa Interactivo", Icon: IconMap },
    ],
  },
  {
    label: "Cultura",
    items: [
      { href: "/mitos", label: "Mitos y Leyendas", Icon: IconBook },
      { href: "/musica", label: "Música", Icon: IconMusic },
      { href: "/videos", label: "Videos", Icon: IconVideo },
      { href: "/calendario", label: "Calendario", Icon: IconCalendar },
    ],
  },
  {
    label: "Turismo",
    items: [
      { href: "/lugares", label: "Sitios Turísticos", Icon: IconCompass },
      { href: "/caserios", label: "Caseríos", Icon: CaserioIcon },
    ],
  },
  {
    label: "Comunidad",
    items: [
      { href: "/experiencias", label: "Experiencias", Icon: IconStar },
      { href: "/productos", label: "Productos", Icon: IconShop },
    ],
  },
  {
    label: "Servicios",
    items: [
      { href: "/hoteles", label: "Hoteles", Icon: IconHotel },
      { href: "/restaurantes", label: "Restaurantes", Icon: IconFork },
      { href: "/negocios", label: "Negocios", Icon: IconBriefcase },
    ],
  },
];

export default function Navbar({
  isOpen = false,
  isMobile = false,
  closeSidebar,
}) {
  const pathname = usePathname();
  const router = useRouter();

  // 🔧 Conecta con: context/AuthContext.js
  const { user, perfil, loading, logout, isAdmin } = useAuth();

  // Función auxiliar para manejar clic en enlaces
  const handleLinkClick = () => {
    if (isMobile) closeSidebar();
  };

  // ── FUNCIÓN DE LOGOUT ──
  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      {/* ── LOGO ── */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <IconMountain />
        </div>
        <div className="sidebar-logo-text">
          <div className="sidebar-logo-title">Valle de los Vientos</div>
          <div className="sidebar-logo-subtitle">Portal del Distrito</div>
        </div>
      </div>

      {/* ── NAVEGACIÓN ── */}
      <nav className="sidebar-nav">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="nav-group">
            <div className="nav-group-label">{section.label}</div>
            {section.items.map(({ href, label, Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`nav-item ${isActive ? "active" : ""}`}
                  onClick={handleLinkClick}
                >
                  <Icon />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>
        ))}

        {/* "Mis publicaciones" solo para usuarios logueados */}
        {user && (
          <div className="nav-group">
            <div className="nav-group-label">Mi cuenta</div>
            <Link
              href="/mis-publicaciones"
              className={`nav-item ${pathname === "/mis-publicaciones" ? "active" : ""}`}
              onClick={handleLinkClick}
            >
              <IconStar />
              <span>Mis publicaciones</span>
            </Link>
          </div>
        )}

        {/*
          Sección Admin: solo visible si el usuario tiene rol 'admin'
          🔧 Conecta con: tabla profiles → campo rol
        */}
        {isAdmin && (
          <div className="nav-group">
            <div className="nav-group-label">Administración</div>
            <Link
              href="/admin"
              className={`nav-item ${pathname === "/admin" ? "active" : ""}`}
              onClick={handleLinkClick}
            >
              <IconUser />
              <span>Panel Admin</span>
            </Link>
          </div>
        )}
      </nav>

      {/* ── FOOTER: Estado de autenticación ── */}
      <div className="sidebar-footer">
        {loading ? (
          // Mientras carga la sesión, muestra un indicador sutil
          <div className="sidebar-loading">
            <span className="loading-dot" />
            <span className="loading-dot" />
            <span className="loading-dot" />
          </div>
        ) : user ? (
          // ── USUARIO LOGUEADO ──
          <div className="sidebar-user">
            {/* Avatar / Iniciales */}
            <Link
              href="/perfil"
              className="sidebar-user-info"
              onClick={handleLinkClick}
            >
              <div className="sidebar-avatar">
                {perfil?.avatar_url ? (
                  <img src={perfil.avatar_url} alt="Avatar" />
                ) : (
                  // Si no hay avatar, muestra la inicial del nombre
                  <span>
                    {(perfil?.nombre || user.email || "U")[0].toUpperCase()}
                  </span>
                )}
              </div>
              <div className="sidebar-user-text">
                <span className="sidebar-user-name">
                  {perfil?.nombre || "Usuario"}
                </span>
                <span className="sidebar-user-role">
                  {isAdmin ? "⚡ Admin" : "Miembro"}
                </span>
              </div>
            </Link>

            {/* Botón Cerrar Sesión */}
            <button
              className="btn-logout"
              onClick={handleLogout}
              title="Cerrar sesión"
            >
              <IconLogout />
            </button>
          </div>
        ) : (
          // ── SIN LOGIN ──
          <>
            <p className="sidebar-footer-hint">
              Inicia sesión para publicar contenido
            </p>
            <Link href="/login" className="btn-login" onClick={handleLinkClick}>
              <IconLogin />
              Iniciar Sesión
            </Link>
          </>
        )}
      </div>
    </aside>
  );
}
