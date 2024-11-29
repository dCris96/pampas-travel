"use client";
import FormModulos from "@/app/ui/dashboard/modulos/form-modulos";
import TablaModulos from "@/app/ui/dashboard/modulos/tabla-modulos";
import styles from "./modulo-main.module.css";
import { useRef } from "react";

export default function Modulos() {
  const actualizarRegistrosRef = useRef();

  const manejarRegistroCreado = (nuevoRegistro) => {
    if (actualizarRegistrosRef.current) {
      actualizarRegistrosRef.current(nuevoRegistro);
    }
  };

  return (
    <>
      <div className="header_children">
        <h4 className="title_children">Gestión de Módulos</h4>
        <div>Dashdoard / Módulos</div>
      </div>
      <div className={styles.contenedor}>
        <FormModulos onRegistroCreado={manejarRegistroCreado} />
        <TablaModulos
          onActualizarRegistros={(fn) => (actualizarRegistrosRef.current = fn)}
        />
      </div>
    </>
  );
}
