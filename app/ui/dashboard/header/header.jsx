"use client";

import {
  MdOutlineMenuOpen,
  MdOutlineMenu,
  MdOutlineSettings,
} from "react-icons/md";
import Image from "next/image";
import styles from "./header.module.css";
import { useState, useEffect, useContext } from "react";
import { montserrat } from "../../fonts";
import { useRouter } from "next/navigation";

// IMPORTACIONES PARA EL VER EL USUARIO Y LA SESION
import Cookies from "js-cookie";
import { jwtVerify } from "jose"; // Usamos jose para verificar y decodificar el token
import axios from "axios";

// IMPORTANCIONES PARA EL MENU
import MenuNotificaciones from "./menu-notificaciones";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import { FaUserCog } from "react-icons/fa";
import { FaKey } from "react-icons/fa6";
import { IoLogOut } from "react-icons/io5";
import useScreenSize from "@/app/hooks/useScreenSize";

import { AcountSkeleton } from "../../skeletons";
import { Suspense } from "react";
import Link from "next/link";
import { ProfileImageContext } from "@/app/contextos/ProfileImageContext";

export default function HeaderDashboard({ toggleSidebar, toggleDrawer }) {
  const { profileImage } = useContext(ProfileImageContext);
  const [isToggled, setIsToggled] = useState(false);
  const { width, height } = useScreenSize();
  const router = useRouter();

  const handleIconClick = () => {
    toggleSidebar();
    setIsToggled(!isToggled);
  };
  // CODIGO PARA ABRIR EL MENU DEL USUARIO
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // CODIGO PARA CERRAR SESION
  const handleLogout = () => {
    Cookies.remove("token");
    router.push("/auth/login");
  };

  // CODIGO PAR ABRIR EL PANEL DE PERFIL DEL USUARIO
  const handlePerfil = () => {};

  // CODIGO PARA VER EL USUARIO Y SU ROL
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUserData = async () => {
      // Obtener el token desde las cookies usando js-cookie
      const token = Cookies.get("token");

      if (!token) {
        router.push("/auth/login");
        return;
      }

      try {
        // Decodificar el token usando jose
        const { payload } = await jwtVerify(
          token,
          new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_SECRET)
        );

        // Llamar a la API para obtener los datos del usuario usando el id extraído del token
        const response = await axios.get(`/api/usuario/${payload.id}`);
        const userData = response.data[0];

        // Obtener los datos del rol: id y nombre
        const idRol = response.data[0].id_rol;
        const dataRol = await axios.get(`/api/rol/${idRol}`);
        const nombreRol = dataRol.data[0].nombre_rol;

        // Extraer el primer nombre
        const [primerNombre] = userData.nombre.split(" ");

        //Extraer el primer apellido
        const [primerApellido] = userData.apellido.split(" ");

        setUser({
          ...userData,
          rol: nombreRol,
          primerNombre,
          primerApellido,
        });
      } catch (error) {
        console.error(
          "Error al verificar el token o recuperar los datos del usuario:",
          error
        );
        router.push("/auth/login");
      }
    };

    getUserData();
  }, []);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.head_logo}>
          <div className={styles.logo}>
            <Image
              src="/logo.png"
              alt="Logo de página"
              width={50}
              height={50}
            ></Image>
          </div>
          <div className={styles.cont_title_logo}>
            <h2 className={`${montserrat.className} ${styles.title_logo}`}>
              PAMPAS TRAVEL
            </h2>
            <p className={`${montserrat.className} ${styles.desc_logo}`}>
              Panel de administrador
            </p>
          </div>
          <button onClick={handleIconClick} className={styles.button_header}>
            {width < 993 ? (
              isToggled ? (
                <MdOutlineMenuOpen />
              ) : (
                <MdOutlineMenu />
              )
            ) : isToggled ? (
              <MdOutlineMenu />
            ) : (
              <MdOutlineMenuOpen />
            )}
          </button>
        </div>

        <div className={styles.user_header}>
          <button onClick={toggleDrawer(true)} className={styles.button_header}>
            <MdOutlineSettings />
          </button>

          <MenuNotificaciones />

          <div className={styles.myAccWrapper}>
            {user ? (
              <div className={styles.my_acount} onClick={handleClick}>
                <div className={styles.user_img}>
                  <span className={styles.rounded_circle}>
                    <Image
                      src={profileImage || "/Default-Profile.jpg"}
                      alt="perfil de stich"
                      width={70}
                      height={70}
                    />
                  </span>
                </div>

                <div className={styles.acount_info}>
                  <h4 className={styles.acountName}>
                    {user.primerNombre} {user.primerApellido}
                  </h4>
                  <p className={styles.rol}>{user.rol}</p>
                </div>
              </div>
            ) : (
              <Suspense>
                <AcountSkeleton />
              </Suspense>
            )}

            {/* CODIGO DEL MENU DEL USUARIO */}
            <Menu
              anchorEl={anchorEl}
              id="account-menu"
              open={open}
              onClose={handleClose}
              onClick={handleClose}
              slotProps={{
                paper: {
                  elevation: 0,
                  sx: {
                    overflow: "visible",
                    filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                    mt: 1.5,
                    "& .MuiAvatar-root": {
                      width: 32,
                      height: 32,
                      ml: -0.5,
                      mr: 1,
                    },
                    "&::before": {
                      content: '""',
                      display: "block",
                      position: "absolute",
                      top: 0,
                      right: 14,
                      width: 10,
                      height: 10,
                      bgcolor: "background.paper",
                      transform: "translateY(-50%) rotate(45deg)",
                      zIndex: 0,
                    },
                  },
                },
              }}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              disableScrollLock
            >
              <MenuItem onClick={handleClose}>
                <Link href="/dashboard/perfil">
                  <ListItemIcon>
                    <FaUserCog />
                  </ListItemIcon>
                  Mi cuenta
                </Link>
              </MenuItem>
              <MenuItem onClick={handleClose}>
                <ListItemIcon>
                  <FaKey />
                </ListItemIcon>
                Cambiar contraseña
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <IoLogOut />
                </ListItemIcon>
                Cerrar sesión
              </MenuItem>
            </Menu>
          </div>
        </div>
      </header>
    </>
  );
}
