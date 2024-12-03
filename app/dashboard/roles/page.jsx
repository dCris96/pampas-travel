"use client";
import { useRef } from "react";
import styles from "./roles.module.css";
import TablaRoles from "@/app/ui/dashboard/roles/tabla-roles";

export default function Page() {
  const actualizarRegistrosRef = useRef();

  const manejarRegistroCreado = (nuevoRegistro) => {
    if (actualizarRegistrosRef.current) {
      actualizarRegistrosRef.current(nuevoRegistro);
    }
  };

  return (
    <>
      <div className="header_children">
        <h4 className="title_children">Gestión de roles</h4>
        <div>Dashboard / Roles</div>
      </div>

      <div className={styles.contenedor}>
        <TablaRoles
          onActualizarRegistros={(fn) => (actualizarRegistrosRef.current = fn)}
        />
      </div>
    </>
  );
}
