import { FaRegEnvelope } from "react-icons/fa6";
import { FaArrowLeftLong } from "react-icons/fa6";
import Link from "next/link";
import styles from "./forgot-password.module.css";
import { roboto } from "@/app/ui/fonts";

export default function CorreoEnviado({ onNext }) {
  return (
    <div className={`${styles.contenedor} ${roboto.className}`}>
      <div className={styles.icono}>
        <FaRegEnvelope />
      </div>
      <h2 className={styles.titulo}>Revisa tu correo</h2>
      <p className={styles.parrafo}>
        Pronto recibirás un correo electrónico para restablecer tu contraseña.
        Si no lo encuentras, comprueba la carpeta de correo no deseado y la
        papelera.
      </p>
      <Link
        href="https://www.google.com"
        className={styles.boton}
        target="_blank"
      >
        He recibido el correo
      </Link>
      <p className={styles.aviso}>
        ¿No ha recibido el correo electrónico?{" "}
        <Link href="#">Clic para reenviar</Link>
      </p>
      <Link className={styles.vinculo} href="/auth/login">
        <FaArrowLeftLong /> o Iniciar sesión
      </Link>
    </div>
  );
}
