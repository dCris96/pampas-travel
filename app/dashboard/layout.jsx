"use client";
import SideNav from "../ui/dashboard/sidenav";
import HeaderDashboard from "../ui/dashboard/header/header";
import Settings from "../ui/dashboard/settings/settings";
import styles from "./layout.module.css";
import { roboto } from "../ui/fonts";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie"; // Importamos para manejar las cookies
import { jwtVerify } from "jose";
import axios from "axios";

export default function Layout({ children }) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [userPermissions, setUserPermissions] = useState([]); // Para almacenar permisos
  const [userRole, setUserRole] = useState(null);
  // Código para abrir los settings de colores y modo oscuro
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  // Lógica para el inicio de sesión
  const router = useRouter();

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  const toggleDrawer = (newIsDrawerOpen) => () => {
    setIsDrawerOpen(newIsDrawerOpen);
  };

  useEffect(() => {
    const checkToken = async () => {
      const token = Cookies.get("token"); // Lee el token desde las cookies
      if (!token) {
        router.push("/auth/login");
        return;
      }

      const secretKey = process.env.NEXT_PUBLIC_JWT_SECRET;

      if (!secretKey) {
        router.push("/auth/login");
        return;
      }

      try {
        const encodedSecretKey = new TextEncoder().encode(secretKey); // Aseguramos que la clave no esté vacía
        await jwtVerify(token, encodedSecretKey); // Verificamos el token con la clave codificada
        const role = Cookies.get("role"); // Obtener el rol del usuario desde las cookies
        setUserRole(role);
        // Obtener los permisos del usuario desde la API
        const response = await axios.get(
          `/api/permiso/permiso_rol?rol=${role}`
        );
        setUserPermissions(response.data);
      } catch (err) {
        router.push("/auth/login");
      }
    };

    checkToken();
  }, [router]);

  return (
    <div className={`${roboto.className}`}>
      <div>
        <SideNav
          isExpanded={isSidebarExpanded}
          userPermissions={userPermissions}
        />
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
