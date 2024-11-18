import { FaRegCheckCircle } from "react-icons/fa";
import { FaRegEnvelope } from "react-icons/fa6";
import Link from "next/link";
import styles from "./confirmacion.module.css";
import { roboto } from "@/app/ui/fonts";

export default function ConfirmaRegistroUsuario() {
  return (
    <div className={`${roboto.className} ${styles.contenedor}`}>
      <div className={styles.caja_confirm}>
        <div className={styles.caja_head}>
          <div className={styles.icon}>
            <FaRegCheckCircle />
          </div>
          <h2>Registro exitoso!</h2>
        </div>

        <div className={styles.caja_body}>
          <p>
            Gracias por registrarse. Hemos enviado un correo electrónico de
            verificación a tu bandeja de entrada.
          </p>
          <div className={styles.correo}>
            <FaRegEnvelope />
            <p>Compruebe su correo electrónico</p>
          </div>
          <span>
            Si no ve el correo electrónico, compruebe su carpeta de correo no
            deseado.
          </span>
          <Link href="#" className={styles.boton}>
            Regresar a Pampas Travel
          </Link>
        </div>
      </div>
    </div>
  );
}
