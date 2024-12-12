import styles from "./perfil.module.css";
import FotoPerfil from "@/app/ui/dashboard/perfil/foto/foto-perfil";
import ProgresoPerfil from "@/app/ui/dashboard/perfil/progreso/progreso-perfil";
import ContenedorTabsInformacion from "@/app/ui/dashboard/perfil/informacion/contenedor";

export default function MiPerfil() {
  return (
    <div className={styles.contenedor}>
      <div className={styles.foto}>
        <FotoPerfil />
      </div>
      <div className={styles.boxes}>
        <div className={styles.box}>
          <ProgresoPerfil />
        </div>
        <div className={`${styles.box} ${styles.tabs}`}>
          <ContenedorTabsInformacion />
        </div>
      </div>
    </div>
  );
}
