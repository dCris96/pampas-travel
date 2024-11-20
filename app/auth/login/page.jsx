import Link from "next/link";
import styles from "./login.module.css";
import FormLogin from "@/app/ui/auth/iniciar/form";
import SliderLogin from "@/app/ui/auth/iniciar/slider";
import { roboto } from "@/app/ui/fonts";

export default function Login() {
  return (
    <div className={`${styles.contenedor} ${roboto.className}`}>
      <div className={styles.slider_cont}>
        <SliderLogin />
      </div>
      <div className={styles.form_cont}>
        <div className={styles.form_head}>
          <h2>Inicia Sesión</h2>
          <p>
            ¿No tienes una cuenta? <Link href="./register">Registrate</Link>
          </p>
        </div>

        <div className={styles.form_caja}>
          <FormLogin />
        </div>
      </div>
    </div>
  );
}
