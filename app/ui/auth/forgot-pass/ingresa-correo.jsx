"use client";
import { useState } from "react";
import { RiKey2Line } from "react-icons/ri";
import { FaArrowLeftLong } from "react-icons/fa6";
import Link from "next/link";
import styles from "./forgot-password.module.css";
import { roboto } from "@/app/ui/fonts";
import axios from "axios";
import LoaderGeneral from "../../loader";

export default function IngresaCorreo({ onNext }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/api/usuario/forgot-password", { email });
      onNext(); // Avanzar a la siguiente etapa
    } catch (error) {
      console.error("Error al enviar el correo de restablecimiento:", error);
    }
  };

  return (
    <div className={`${styles.contenedor} ${roboto.className}`}>
      <div className={styles.icono}>
        <RiKey2Line />
      </div>
      <h2 className={styles.titulo}>¿Has olvidado la contraseña?</h2>
      <p className={styles.parrafo}>
        Te enviaremos un enlace por correo electrónico para que puedas
        restablecer tu contraseña.
      </p>
      <form className={styles.formulario} onSubmit={handleSubmit}>
        <label className={styles.label} htmlFor="email">
          Correo
        </label>
        <input
          className={styles.input}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          id="email"
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
