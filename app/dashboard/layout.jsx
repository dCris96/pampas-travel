"use client";
import SideNav from "../ui/dashboard/sidenav";
import HeaderDashboard from "../ui/dashboard/header/header";
import Settings from "../ui/dashboard/settings/settings";
import styles from "./layout.module.css";
import { roboto } from "../ui/fonts";
import { useState } from "react";

export default function Layout({ children }) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  // CODIGO PARA ABRIR LOS SETTINGS DE COLORES Y MODO OSCURO
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleDrawer = (newIsDrawerOpen) => () => {
    setIsDrawerOpen(newIsDrawerOpen);
  };

  return (
    <div className={`${roboto.className}`}>
      <div>
        <SideNav isExpanded={isSidebarExpanded} />
        <HeaderDashboard
          toggleSidebar={toggleSidebar}
          toggleDrawer={toggleDrawer}
        />
      </div>
      <div
        className={
          isSidebarExpanded
            ? styles.right_content
            : styles.right_content_collapsed
        }
      >
        {children}
      </div>
      <Settings isOpen={isDrawerOpen} toggleDrawer={toggleDrawer} />
    </div>
  );
}
