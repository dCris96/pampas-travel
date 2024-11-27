import styles from "./modulos.module.css";
import { BiSolidLayerPlus } from "react-icons/bi";

export default function FormModulos() {
  return (
    <>
      <div className={styles.cont_form}>
        <h5>
          <BiSolidLayerPlus /> Crear nuevo módulo
        </h5>
      </div>
    </>
  );
}
