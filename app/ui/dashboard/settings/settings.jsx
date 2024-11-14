import { IoMdClose } from "react-icons/io";
import { LuSunMedium } from "react-icons/lu";
import { MdOutlineDisplaySettings } from "react-icons/md";
import { MdOutlineDarkMode } from "react-icons/md";
import styles from "./settings.module.css";
import Drawer from "@mui/material/Drawer";
import { Divider } from "@mui/material";
import { roboto } from "../../fonts";

import clsx from "clsx";

export default function Settings({ isOpen, toggleDrawer }) {
  const isActive = true;
  return (
    <Drawer
      sx={{
        "& .MuiDrawer-paper": { borderRadius: "10px 0 0 10px" },
      }}
      anchor="right"
      open={isOpen}
      onClose={toggleDrawer(false)}
      disableScrollLock
    >
      <div className={`${styles.drawer} ${roboto.className}`}>
        <div className={styles.draw_head}>
          <h2 className={styles.draw_title}>Configuraciones</h2>
          <button onClick={toggleDrawer(false)} className={styles.draw_close}>
            <IoMdClose />
          </button>
        </div>
        <Divider />
        <div className={styles.draw_box}>
          <h3 className={styles.box_title}>MODO</h3>
          <div className={styles.botones}>
            <button
              className={clsx(styles.boton, {
                [styles.active]: isActive,
              })}
            >
              <LuSunMedium /> Claro
            </button>
            <button className={styles.boton}>
              <MdOutlineDisplaySettings /> Sistema
            </button>
            <button className={styles.boton}>
              <MdOutlineDarkMode /> Oscuro
            </button>
          </div>
        </div>
        <div className={styles.draw_box}>
          <h3 className={styles.box_title}>COLOR</h3>
        </div>
      </div>
    </Drawer>
  );
}
