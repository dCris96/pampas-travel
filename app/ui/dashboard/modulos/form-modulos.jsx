import styles from "./modulos.module.css";
import { BiSolidLayerPlus } from "react-icons/bi";
import { roboto } from "../../fonts";

export default function FormModulos() {
  return (
    <>
      <div className={styles.cont_form}>
        <h5 className="subtitulos-dashboard">
          <BiSolidLayerPlus /> Crear nuevo módulo
        </h5>
        <form className={styles.formulario}>
          <input
            className={styles.campo}
            type="text"
            placeholder="Nombre del modulo"
          />
          <textarea
            className={`${styles.campo} ${styles.textarea} ${roboto.className}`}
            placeholder="Descripcion"
          ></textarea>
          <input
            className={styles.campo}
            type="text"
            placeholder="/dashboard/ruta..."
          />
          <input className={styles.campo} type="text" placeholder="icono" />
          <input className={styles.campo} type="number" placeholder="1" />
          <button type="submit" className={styles.boton}>
            Crear
          </button>
        </form>
      </div>
    </>
  );
}
