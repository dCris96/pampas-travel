import Link from "next/link";
import Image from "next/image";
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
        <div>
          <div className={styles.separator}>
            <div className={styles.line}></div>
            <div>
              <span>O continuar con</span>
            </div>
            <div className={styles.line}></div>
          </div>

          <div className={styles.botones}>
            <button>
              <Image
                src="/google-color-svgrepo-com.svg"
                alt="Logo de google"
                width={40}
                height={40}
              />
              Google
            </button>
            <button>
              <Image
                src="/facebook-2-logo-svgrepo-com.svg"
                alt="Logo de google"
                width={40}
                height={40}
              />{" "}
              Facebook
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
