import styles from "./perfil.module.css";
import FotoPerfil from "@/app/ui/dashboard/perfil/foto/foto-perfil";
import ProgresoPerfil from "@/app/ui/dashboard/perfil/progreso/progreso-perfil";

export default function MiPerfil() {
  return (
    <div className={styles.contenedor}>
      <div className={styles.box}>
        <FotoPerfil />
      </div>

      <div className={styles.box}>
        <ProgresoPerfil />
      </div>
      <div className={`${styles.box} ${styles.help}`}>help</div>
      <div className={`${styles.box} ${styles.tabs}`}>tabs</div>
    </div>
  );
}
