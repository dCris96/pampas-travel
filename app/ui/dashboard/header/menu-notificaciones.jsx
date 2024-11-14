import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import { useState } from "react";
import { MdOutlineNotifications } from "react-icons/md";
import styles from "./header.module.css";
import { roboto } from "../../fonts";

export default function MenuNotificaciones() {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    event.stopPropagation();
    if (anchorEl) {
      handleClose();
    } else {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <button onClick={handleClick} className={styles.button_header}>
      <MdOutlineNotifications />
      <Menu
        anchorEl={anchorEl}
        className={`${roboto.className} ${styles.notifications}`}
        id="notifications"
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
        <div className={styles.head_notificaciones}>
          <h4 className={styles.title_notificaciones}>
            Notificaciones (<span>24</span>)
          </h4>
        </div>
        <Divider />
        <div className={styles.scroll}>
          <MenuItem className={styles.menu_item} onClick={handleClose}>
            <div className={styles.noti_cont}>
              <h5 className={styles.noti_title}>Título de la notificación</h5>
              <p className={styles.noti_desc}>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                Architecto unde asperiores non...
              </p>
              <span className={styles.noti_time}>Hace 24 minutos</span>
            </div>
          </MenuItem>
          <MenuItem className={styles.menu_item} onClick={handleClose}>
            <div className={styles.noti_cont}>
              <h5 className={styles.noti_title}>Título de la notificación</h5>
              <p className={styles.noti_desc}>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                Architecto unde asperiores non...
              </p>
              <span className={styles.noti_time}>Hace 24 minutos</span>
            </div>
          </MenuItem>
          <MenuItem className={styles.menu_item} onClick={handleClose}>
            <div className={styles.noti_cont}>
              <h5 className={styles.noti_title}>Título de la notificación</h5>
              <p className={styles.noti_desc}>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                Architecto unde asperiores non...
              </p>
              <span className={styles.noti_time}>Hace 24 minutos</span>
            </div>
          </MenuItem>
          <MenuItem className={styles.menu_item} onClick={handleClose}>
            <div className={styles.noti_cont}>
              <h5 className={styles.noti_title}>Título de la notificación</h5>
              <p className={styles.noti_desc}>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                Architecto unde asperiores non...
              </p>
              <span className={styles.noti_time}>Hace 24 minutos</span>
            </div>
          </MenuItem>
          <MenuItem className={styles.menu_item} onClick={handleClose}>
            <div className={styles.noti_cont}>
              <h5 className={styles.noti_title}>Título de la notificación</h5>
              <p className={styles.noti_desc}>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                Architecto unde asperiores non...
              </p>
              <span className={styles.noti_time}>Hace 24 minutos</span>
            </div>
          </MenuItem>
          <MenuItem className={styles.menu_item} onClick={handleClose}>
            <div className={styles.noti_cont}>
              <h5 className={styles.noti_title}>Título de la notificación</h5>
              <p className={styles.noti_desc}>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                Architecto unde asperiores non...
              </p>
              <span className={styles.noti_time}>Hace 24 minutos</span>
            </div>
          </MenuItem>
        </div>
        <Divider />
        <div className={styles.footer_notificaciones}>
          <button className={styles.button_noti}>VER TODAS</button>
        </div>
      </Menu>
    </button>
  );
}
