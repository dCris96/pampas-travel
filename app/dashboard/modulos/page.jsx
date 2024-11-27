import FormModulos from "@/app/ui/dashboard/modulos/form-modulos";
import TablaModulos from "@/app/ui/dashboard/modulos/tabla-modulos";
import styles from "./modulo-main.module.css";

export default function Modulos() {
  return (
    <>
      <div className="header_children">
        <h4 className="title_children">Gestión de Módulos</h4>
        <div>Dashdoard / Módulos</div>
      </div>
      <div className={styles.contenedor}>
        <FormModulos />
        <TablaModulos />
      </div>
    </>
  );
}
