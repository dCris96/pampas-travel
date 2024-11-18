import Link from "next/link";
import styles from "./register.module.css";
import FormRegister from "@/app/ui/auth/registrar/form";
import SliderRegister from "@/app/ui/auth/registrar/slider";
import { roboto } from "@/app/ui/fonts";

export default function Register() {
  return (
    <div className={`${styles.contenedor} ${roboto.className}`}>
      <div className={styles.slider_cont}>
        <SliderRegister />
      </div>
      <div className={styles.form_cont}>
        <div className={styles.form_head}>
          <h2>Crea tu cuenta</h2>
          <p>
            ¿Ya tienes una cuenta? <Link href="./login">Inicia sesión</Link>
          </p>
        </div>

        <div className={styles.form_caja}>
          <FormRegister />
        </div>
      </div>
    </div>
  );
}
