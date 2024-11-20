"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { roboto } from "../ui/fonts";
import styles from "./confirmacion.module.css";

export default function ConfirmarCuenta() {
  const [message, setMessage] = useState("Validando tu cuenta...");
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      setMessage("Token inválido o faltante. Intenta nuevamente.");
      setError(true);
      setIsLoading(false);
      return;
    }

    const confirmarCuenta = async () => {
      try {
        const response = await axios.get(
          `/api/confirmar-cuenta?token=${token}`
        );
        setMessage(response.data.message); // Mensaje de éxito
        setError(false);
      } catch (error) {
        setMessage("Error al confirmar tu cuenta. Intenta nuevamente.");
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    confirmarCuenta();
  }, []);

  if (isLoading) {
    return (
      <div className={`${styles.contenedor} ${roboto.className}`}>
        <div className={styles.loader}></div>
        <h1 className={styles.titulo}>Confirmando tu cuenta...</h1>
        <p className={styles.mensaje}>Por favor, espera un momento.</p>
      </div>
    );
  }

  return (
    <div className={`${styles.contenedor} ${roboto.className}`}>
      <h1 className={styles.titulo}>
        {error ? "Error" : "¡Cuenta confirmada!"}
      </h1>
      <p className={styles.mensaje}>{message}</p>
      {error ? (
        ""
      ) : (
        <Link href="/auth/login" className={styles.link}>
          Iniciar Sesión
        </Link>
      )}
    </div>
  );
}
