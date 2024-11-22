"use client";
import styles from "./card.module.css";
import DashboardCard from "@/app/ui/dashboard/dashboardCard/card";
import { useState, useEffect } from "react";
import axios from "axios";
import Skeleton from "@mui/material/Skeleton";
import useAuth from "@/app/hooks/useAuth";

const dashboardBoxes = [
  {
    imageSrc: "/usuarios.svg",
    altText: "Usuarios",
    titulo: "Usuarios",
    cantidad: "12",
    rolesPermitidos: ["Administrador"],
    menuOptions: [
      { text: "Ver todos", url: "/dashboard/usuarios" },
      { text: "Agregar", url: "/dashboard/usuarios" },
    ],
  },
  {
    imageSrc: "/roles.svg",
    altText: "Roles",
    titulo: "Roles",
    cantidad: "8",
    rolesPermitidos: ["Administrador"],
    menuOptions: [
      { text: "Ver todos", url: "/dashboard/roles" },
      { text: "Agregar", url: "/dashboard/roles" },
    ],
  },
  {
    imageSrc: "/permisos.svg",
    altText: "Permisos",
    titulo: "Permisos",
    cantidad: "20",
    rolesPermitidos: ["Administrador"],
    menuOptions: [
      { text: "View All", url: "/contributors/view-all" },
      { text: "Invite Contributor", url: "/contributors/invite" },
    ],
  },
  {
    imageSrc: "/contribuidor.svg",
    altText: "Contribuidores",
    titulo: "Contribuidores",
    cantidad: "150",
    rolesPermitidos: ["Administrador"],
    menuOptions: [
      { text: "View All", url: "/viewers/view-all" },
      { text: "Manage Viewers", url: "/viewers/manage" },
    ],
  },
  {
    imageSrc: "/proveedor.svg",
    altText: "Proveedores",
    titulo: "Proveedores",
    cantidad: "6",
    rolesPermitidos: ["Administrador"],
    menuOptions: [
      { text: "View All", url: "/moderators/view-all" },
      { text: "Add Moderator", url: "/moderators/add" },
    ],
  },
  {
    imageSrc: "/experiencias.svg",
    altText: "Experiencias",
    titulo: "Experiencias",
    cantidad: "300",
    rolesPermitidos: ["Administrador"],
    menuOptions: [
      { text: "View All", url: "/guests/view-all" },
      { text: "Invite Guest", url: "/guests/invite" },
    ],
  },
  {
    imageSrc: "/fotos.svg",
    altText: "Fotos",
    titulo: "Fotos subidas",
    cantidad: "300",
    rolesPermitidos: ["Administrador", "Contribuidor"],
    menuOptions: [
      { text: "View All", url: "/guests/view-all" },
      { text: "Invite Guest", url: "/guests/invite" },
    ],
  },
  {
    imageSrc: "/mis-experiencias.svg",
    altText: "Mis experiencias",
    titulo: "Mis experiencias",
    cantidad: "300",
    rolesPermitidos: ["Administrador", "Contribuidor"],
    menuOptions: [
      { text: "View All", url: "/guests/view-all" },
      { text: "Invite Guest", url: "/guests/invite" },
    ],
  },
  {
    imageSrc: "/sitios.svg",
    altText: "Sitios",
    titulo: "Mis sitios",
    cantidad: "300",
    rolesPermitidos: ["Administrador", "Contribuidor"],
    menuOptions: [
      { text: "View All", url: "/guests/view-all" },
      { text: "Invite Guest", url: "/guests/invite" },
    ],
  },
  {
    imageSrc: "/comentarios.svg",
    altText: "Icono comentarios",
    titulo: "Mis comentarios",
    cantidad: "300",
    rolesPermitidos: ["Administrador", "Contribuidor"],
    menuOptions: [
      { text: "View All", url: "/guests/view-all" },
      { text: "Invite Guest", url: "/guests/invite" },
    ],
  },
  {
    imageSrc: "/flora.svg",
    altText: "Icono flora",
    titulo: "Flora",
    cantidad: "300",
    rolesPermitidos: ["Administrador", "Contribuidor"],
    menuOptions: [
      { text: "View All", url: "/guests/view-all" },
      { text: "Invite Guest", url: "/guests/invite" },
    ],
  },
  {
    imageSrc: "/fauna.svg",
    altText: "Icono fauna",
    titulo: "Fauna",
    cantidad: "300",
    rolesPermitidos: ["Administrador", "Contribuidor"],
    menuOptions: [
      { text: "View All", url: "/guests/view-all" },
      { text: "Invite Guest", url: "/guests/invite" },
    ],
  },
];

export default function DashboardCardsContainer() {
  const { loading: authLoading, error: authError, user } = useAuth();
  const [filteredCards, setFilteredCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const userRole = user.role;
        if (!userRole) {
          setError("No se pudo determinar el rol del usuario.");
          setLoading(false);
          return;
        }
        const userData = await axios.get(`/api/rol/${userRole}`);
        const nombreRol = userData.data[0].nombre_rol;
        const visibleCards = dashboardBoxes.filter((card) =>
          card.rolesPermitidos.includes(nombreRol)
        );
        setFilteredCards(visibleCards);
      } catch (err) {
        setError("Error al obtener datos del usuario.");
      } finally {
        setLoading(false);
      }
    };
    if (!authLoading && !authError) {
      fetchUserRole();
    }
  }, [authLoading, authError, user, dashboardBoxes]);

  if (error) return <p>Error: {error}</p>;

  return (
    <>
      <div className={styles.dashboardWrapper}>
        {loading
          ? // Renderiza el Skeleton mientras está cargando
            Array.from({ length: 6 }).map((_, index) => (
              <Skeleton
                key={`skeleton-${index}`}
                variant="rectangular"
                height={80}
                width="32.47%"
              />
            ))
          : filteredCards.map((box, index) => (
              <DashboardCard
                key={index}
                img={box.imageSrc}
                altText={box.altText}
                title={box.titulo}
                cantidad={box.cantidad}
                menuOptions={box.menuOptions}
              />
            ))}
      </div>
    </>
  );
}
