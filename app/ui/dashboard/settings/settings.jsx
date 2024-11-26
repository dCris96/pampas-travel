import { IoMdClose } from "react-icons/io";
import { LuSunMedium } from "react-icons/lu";
import { MdOutlineDisplaySettings } from "react-icons/md";
import { MdOutlineDarkMode } from "react-icons/md";
import { FaCheck } from "react-icons/fa";
import styles from "./settings.module.css";
import Drawer from "@mui/material/Drawer";
import { Divider } from "@mui/material";
import { roboto } from "../../fonts";

import clsx from "clsx";
import { useTheme, useColor } from "@/app/ThemeContext";
import { useEffect, useState } from "react";

const colorOptions = [
  "#4058f2",
  "#0fd267",
  "#eabe10",
  "#e91010",
  "#ea1093",
  "#cc10ea",
  "#5910ea",
  "#489fbe",
  "#09bb90",
  "#3f8ff7",
];

export default function Settings({ isOpen, toggleDrawer }) {
  const { theme, setLightTheme, setDarkTheme, setSystemTheme } = useTheme();
  const { color, changeColor } = useColor();
  const [activeColor, setActiveColor] = useState(color);
  const isActive = true;

  useEffect(() => {
    setActiveColor(color);
  }, [color]);

  const handleColorChange = (color) => {
    changeColor(color);
    setActiveColor(color);
  };

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
                [styles.active]: theme === "light",
              })}
              onClick={setLightTheme}
            >
              <LuSunMedium /> Claro
            </button>
            <button
              className={clsx(styles.boton, {
                [styles.active]: theme === "system",
              })}
              onClick={setSystemTheme}
            >
              <MdOutlineDisplaySettings /> Sistema
            </button>
            <button
              className={clsx(styles.boton, {
                [styles.active]: theme === "dark",
              })}
              onClick={setDarkTheme}
            >
              <MdOutlineDarkMode /> Oscuro
            </button>
          </div>
        </div>
        <div className={styles.draw_box}>
          <h3 className={styles.box_title}>COLOR</h3>
          <div className={styles.colores}>
            {colorOptions.map((color) => (
              <button
                key={color}
                style={{ backgroundColor: color }}
                className={clsx(styles.btn_color, {
                  [styles.active]: activeColor === color,
                })}
                onClick={() => handleColorChange(color)}
              >
                {activeColor === color && <FaCheck />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Drawer>
  );
}
