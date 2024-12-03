import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./rolesUi.module.css";
import Switch from "@mui/material/Switch";
import { IoClose } from "react-icons/io5";

export default function ModalRoles({ selectRolId, onClose }) {
  const [modulos, setModulos] = useState([]);
  const [permisos, setPermisos] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Resetear estado al cambiar de rol
    setPermisos({});
    setLoading(true);
    setError(null);

    async function fetchData() {
      try {
        const [modulesRes, permisosRes] = await Promise.all([
          axios.get("/api/modulo"),
          axios.get("/api/permiso"), // Traer todos los permisos
        ]);

        const modulosData = modulesRes.data;
        const permisosData = permisosRes.data;

        setModulos(modulosData);

        // Filtrar permisos por el rol seleccionado
        const permisosFiltrados = permisosData.filter(
          (permiso) => permiso.id_rol === selectRolId
        );

        // Crear un mapa de permisos indexado por id_modulo
        const permisosMap = modulosData.reduce((acc, modulo) => {
          const permiso = permisosFiltrados.find(
            (p) => p.id_modulo === modulo.id_modulo
          );
          acc[modulo.id_modulo] = {
            r: permiso?.r || false,
            w: permiso?.w || false,
            u: permiso?.u || false,
            d: permiso?.d || false,
          };
          return acc;
        }, {});

        setPermisos(permisosMap);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
        setError("Hubo un problema al cargar los datos.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [selectRolId]);

  const handleSwitchChange = (moduleId, action) => {
    setPermisos((prev) => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        [action]: !prev[moduleId]?.[action],
      },
    }));
  };

  const handleSave = async () => {
    try {
      const payload = Object.keys(permisos).map((moduleId) => ({
        id_modulo: moduleId,
        id_rol: selectRolId,
        ...permisos[moduleId],
      }));

      await axios.put("/api/permiso", payload);

      alert("Permisos guardados correctamente");
      onClose();
    } catch (error) {
      console.error("Error al guardar permisos:", error);
      alert("Hubo un problema al guardar los permisos.");
    }
  };

  if (loading) {
    return (
      <div className={styles.modal_background}>
        <div className={styles.modal}>
          <h3>Cargando...</h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.modal_background}>
        <div className={styles.modal}>
          <h3>{error}</h3>
          <button onClick={onClose}>Cerrar</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.modal_background}>
      <div className={styles.modal}>
        <div className={styles.modal_head}>
          <h3>Permisos de los roles de usuarios</h3>
          <button onClick={onClose}>
            <IoClose />
          </button>
        </div>
        <div className={styles.modal_body}>
          <div className={styles.tabla}>
            <table className="table">
              <thead className="thead">
                <tr>
                  <th>#</th>
                  <th>MÓDULO</th>
                  <th>VER</th>
                  <th>CREAR</th>
                  <th>ACTUALIZAR</th>
                  <th>ELIMINAR</th>
                </tr>
              </thead>
              <tbody className="tbody">
                {modulos.map((modulo, index) => (
                  <tr key={modulo.id_modulo}>
                    <td>{index + 1}</td>
                    <td>{modulo.nombre_modulo}</td>
                    {["r", "w", "u", "d"].map((action) => (
                      <td key={action}>
                        <Switch
                          checked={
                            permisos[modulo.id_modulo]?.[action] || false
                          }
                          onChange={() =>
                            handleSwitchChange(modulo.id_modulo, action)
                          }
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={styles.botones}>
            <button onClick={handleSave}>Guardar</button>
            <button onClick={onClose}>Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
