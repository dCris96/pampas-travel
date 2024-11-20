"use client";

import {
  MdOutlineMenuOpen,
  MdOutlineMenu,
  MdOutlineSettings,
} from "react-icons/md";
import Image from "next/image";
import styles from "./header.module.css";
import { useState } from "react";
import { montserrat } from "../../fonts";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

// IMPORTANCIONES PARA EL MENU
import MenuNotificaciones from "./menu-notificaciones";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import { FaUserCog } from "react-icons/fa";
import { FaKey } from "react-icons/fa6";
import { IoLogOut } from "react-icons/io5";

export default function HeaderDashboard({ toggleSidebar, toggleDrawer }) {
  const [isToggled, setIsToggled] = useState(false);

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
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove("token");

    router.push("/auth/login");
  };

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
            {isToggled ? <MdOutlineMenu /> : <MdOutlineMenuOpen />}
          </button>
        </div>

        <div className={styles.user_header}>
          <button onClick={toggleDrawer(true)} className={styles.button_header}>
            <MdOutlineSettings />
          </button>

          <MenuNotificaciones />

          <div className={styles.myAccWrapper}>
            <div className={styles.my_acount} onClick={handleClick}>
              <div className={styles.user_img}>
                <span className={styles.rounded_circle}>
                  <Image
                    src="/contri.jpeg"
                    alt="perfil de stich"
                    width={70}
                    height={70}
                    // layout="responsive"
                  />
                </span>
              </div>

              <div className={styles.acount_info}>
                <h4 className={styles.acountName}>Cristian Crespín</h4>
                <p className={styles.rol}>Administrador</p>
              </div>
            </div>

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
                <ListItemIcon>
                  <FaUserCog />
                </ListItemIcon>
                Mi cuenta
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
