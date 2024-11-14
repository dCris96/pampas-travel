"use client";
import styles from "./card.module.css";
import DashboardCard from "@/app/ui/dashboard/dashboardCard/card";

const dashboardBoxes = [
  {
    imageSrc: "/users.png",
    altText: "User 1 profile picture",
    titulo: "Administradores",
    cantidad: "12",
    menuOptions: [
      { text: "View All", url: "/admins/view-all" },
      { text: "Add Admin", url: "/admins/add" },
    ],
  },
  {
    imageSrc: "/users.png",
    altText: "User 2 profile picture",
    titulo: "Moderadores",
    cantidad: "8",
    menuOptions: [
      { text: "View All", url: "/editors/view-all" },
      { text: "Add Editor", url: "/editors/add" },
    ],
  },
  {
    imageSrc: "/users.png",
    altText: "User 3 profile picture",
    titulo: "Proveedores",
    cantidad: "20",
    menuOptions: [
      { text: "View All", url: "/contributors/view-all" },
      { text: "Invite Contributor", url: "/contributors/invite" },
    ],
  },
  {
    imageSrc: "/users.png",
    altText: "User 4 profile picture",
    titulo: "Contribuidores",
    cantidad: "150",
    menuOptions: [
      { text: "View All", url: "/viewers/view-all" },
      { text: "Manage Viewers", url: "/viewers/manage" },
    ],
  },
  {
    imageSrc: "/users.png",
    altText: "User 5 profile picture",
    titulo: "Experiencias - articulos",
    cantidad: "6",
    menuOptions: [
      { text: "View All", url: "/moderators/view-all" },
      { text: "Add Moderator", url: "/moderators/add" },
    ],
  },
  {
    imageSrc: "/users.png",
    altText: "User 6 profile picture",
    titulo: "Sitios turisticos",
    cantidad: "300",
    menuOptions: [
      { text: "View All", url: "/guests/view-all" },
      { text: "Invite Guest", url: "/guests/invite" },
    ],
  },
  {
    imageSrc: "/users.png",
    altText: "User 6 profile picture",
    titulo: "Platos tipicos",
    cantidad: "300",
    menuOptions: [
      { text: "View All", url: "/guests/view-all" },
      { text: "Invite Guest", url: "/guests/invite" },
    ],
  },
  {
    imageSrc: "/users.png",
    altText: "User 6 profile picture",
    titulo: "Servicios turisticos",
    cantidad: "300",
    menuOptions: [
      { text: "View All", url: "/guests/view-all" },
      { text: "Invite Guest", url: "/guests/invite" },
    ],
  },
  {
    imageSrc: "/users.png",
    altText: "User 6 profile picture",
    titulo: "fotos subidas",
    cantidad: "300",
    menuOptions: [
      { text: "View All", url: "/guests/view-all" },
      { text: "Invite Guest", url: "/guests/invite" },
    ],
  },
  {
    imageSrc: "/users.png",
    altText: "User 6 profile picture",
    titulo: "comentarios",
    cantidad: "300",
    menuOptions: [
      { text: "View All", url: "/guests/view-all" },
      { text: "Invite Guest", url: "/guests/invite" },
    ],
  },
  {
    imageSrc: "/users.png",
    altText: "User 6 profile picture",
    titulo: "Pendientes",
    cantidad: "300",
    menuOptions: [
      { text: "View All", url: "/guests/view-all" },
      { text: "Invite Guest", url: "/guests/invite" },
    ],
  },
  {
    imageSrc: "/users.png",
    altText: "User 6 profile picture",
    titulo: "Rechazados",
    cantidad: "300",
    menuOptions: [
      { text: "View All", url: "/guests/view-all" },
      { text: "Invite Guest", url: "/guests/invite" },
    ],
  },
  {
    imageSrc: "/users.png",
    altText: "User 6 profile picture",
    titulo: "USUARIOS ACTIVOS HOY",
    cantidad: "300",
    menuOptions: [
      { text: "View All", url: "/guests/view-all" },
      { text: "Invite Guest", url: "/guests/invite" },
    ],
  },
  {
    imageSrc: "/users.png",
    altText: "User 6 profile picture",
    titulo: "USUARIOS ACTIVOS ULTIMO MES",
    cantidad: "300",
    menuOptions: [
      { text: "View All", url: "/guests/view-all" },
      { text: "Invite Guest", url: "/guests/invite" },
    ],
  },
  {
    imageSrc: "/users.png",
    altText: "User 6 profile picture",
    titulo: "Flora",
    cantidad: "300",
    menuOptions: [
      { text: "View All", url: "/guests/view-all" },
      { text: "Invite Guest", url: "/guests/invite" },
    ],
  },
  {
    imageSrc: "/users.png",
    altText: "User 6 profile picture",
    titulo: "Fauna",
    cantidad: "300",
    menuOptions: [
      { text: "View All", url: "/guests/view-all" },
      { text: "Invite Guest", url: "/guests/invite" },
    ],
  },
];

export default function DashboardCardsContainer() {
  return (
    <>
      <div className={styles.dashboardWrapper}>
        {dashboardBoxes.map((box, index) => (
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
