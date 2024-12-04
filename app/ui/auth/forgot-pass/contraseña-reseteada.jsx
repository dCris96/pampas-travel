import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { FaArrowLeftLong } from "react-icons/fa6";
import Link from "next/link";
import styles from "./forgot-password.module.css";
import { roboto } from "@/app/ui/fonts";

export default function ContraseñaReseteada() {
  return (
    <div className={`${styles.contenedor} ${roboto.className}`}>
      <div className={styles.icono}>
        <IoMdCheckmarkCircleOutline />
      </div>
      <h2 className={styles.titulo}>Contraseña restablecida</h2>
      <p className={styles.parrafo}>
        Su contraseña se ha restablecido correctamente. haga clic a continuación
        para iniciar sesión por arte de magia.
      </p>
      <Link className={styles.boton} href="/auth/login">
        Continuar
      </Link>
      <Link className={styles.vinculo} href="/auth/login">
        <FaArrowLeftLong /> o Iniciar sesión
      </Link>
    </div>
  );
}
