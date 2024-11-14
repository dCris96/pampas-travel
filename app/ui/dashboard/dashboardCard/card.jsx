"use client";
import Image from "next/image";
import { IoMdMore } from "react-icons/io";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useState } from "react";
import { useRouter } from "next/navigation";

import styles from "./card.module.css";

export default function DashboardCard({
  img,
  altText,
  title,
  cantidad,
  menuOptions,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const router = useRouter();
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (url) => {
    router.push(url);
    handleClose();
  };

  return (
    <div className={styles.dashboardBox}>
      <div className={styles.image_container}>
        <Image src={img} alt={altText} fill className={styles.image} />
      </div>
      <div className={styles.texto}>
        <span>{title}</span> <p>{cantidad}</p>
      </div>
      <div>
        <button className={styles.boton} onClick={handleClick}>
          <IoMdMore />
        </button>
        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{ "aria-labelledby": "basic-button" }}
          disableScrollLock
        >
          {menuOptions.map((option, index) => (
            <MenuItem
              key={index}
              onClick={() => handleMenuItemClick(option.url)}
            >
              {option.text}
            </MenuItem>
          ))}
        </Menu>
      </div>
    </div>
  );
}
