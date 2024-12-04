import React, { useState } from "react";
import axios from "axios";

import { RiKey2Line } from "react-icons/ri";
import { FaArrowLeftLong } from "react-icons/fa6";
import Link from "next/link";
import styles from "./forgot-password.module.css";
import { roboto } from "@/app/ui/fonts";
import LoaderGeneral from "../../loader";

export default function NuevaContraseña({ onNext }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (newPassword !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }
    try {
      const token = new URLSearchParams(window.location.search).get("token");
      await axios.post("/api/usuario/reset-password", { newPassword, token });
      onNext();
    } catch (error) {
      console.error("Error al restablecer la contraseña:", error);
    }
  };

  return (
    <div className={`${styles.contenedor} ${roboto.className}`}>
      <div className={styles.icono}>
        <RiKey2Line />
      </div>
      <h2 className={styles.titulo}>Establecer nueva contraseña</h2>
      <p className={styles.parrafo}>
        Su nueva contraseña debe ser diferente de las utilizadas anteriormente.
      </p>
      <form className={styles.formulario} onSubmit={handleSubmit}>
        <label className={styles.label} htmlFor="pass">
          Contraseña
        </label>
        <input
          className={styles.input}
          type="password"
          id="pass"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

        <label className={styles.label} htmlFor="confpass">
          Confirma contraseña
        </label>
        <input
          className={styles.input}
          type="password"
          id="confpass"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button className={styles.boton} type="submit">
          Restablecer contraseña
        </button>
      </form>
      <Link className={styles.vinculo} href="/auth/login">
        <FaArrowLeftLong /> o Iniciar sesión
      </Link>
      {loading && <LoaderGeneral />}
    </div>
  );
}
