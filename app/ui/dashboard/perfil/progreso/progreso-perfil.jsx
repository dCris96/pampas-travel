"use client";
import useAuth from "@/app/hooks/useAuth";
import styles from "./progreso.module.css";
import { useEffect, useState } from "react";
import axios from "axios";

export default function ProgresoPerfil() {
  const { user } = useAuth();
  const [emptyFieldsCount, setEmptyFieldsCount] = useState(0);
  const [style, setStyle] = useState({});

  useEffect(() => {
    const getUserData = async () => {
      if (!user) return;
      try {
        // await new Promise((response) => setTimeout(resolve, 10000));
        const response = await axios.get(`/api/usuario/${user.id}`);
        const userData = response.data[0];

        const excludeFields = [
          "fecha_registro",
          "id_estado_usuario",
          "id_rol",
          "id_usuario",
          "reset_password_expires",
          "reset_password_token",
          "token confirmation",
        ];

        const emptyFields = Object.keys(userData).filter(
          (key) =>
            !excludeFields.includes(key) &&
            (userData[key] === null || userData[key] === "")
        );

        const totalFields = Object.keys(userData).filter(
          (key) => !excludeFields.includes(key)
        );

        const porcentaje = Math.round(
          (emptyFields.length / totalFields.length) * 100
        );

        setEmptyFieldsCount(porcentaje);
      } catch (error) {
        console.log("No se puedo traer el usuario");
      }
    };
    getUserData();
  }, [user]);

  return (
    <>
      <div className={styles.contenedor}>
        <h3 className={styles.titulo}>Completa los datos de tu cuenta.</h3>
        <p className={styles.parrafo}>
          ¡Bienvenido a la sección de personalización! Aquí puedes agregar o
          actualizar tu información para que tu perfil esté siempre al día.
          Asegúrate de llenar cada campo con información precisa para que
          podamos conocerte mejor. ¡Gracias por ayudarnos a mejorar tu
          experiencia!
        </p>
        <div className={styles.cont_barra}>
          <p>
            Finalización del perfil: <span>{emptyFieldsCount}</span>%
          </p>
          <div className={styles.barra_full}>
            <div
              className={styles.barra_progres}
              style={{ "--target-width": `${emptyFieldsCount}%` }}
            ></div>
          </div>
        </div>
      </div>
    </>
  );
}
