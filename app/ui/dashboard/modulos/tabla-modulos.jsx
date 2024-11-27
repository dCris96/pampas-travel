"use client";

import { FaPencilAlt } from "react-icons/fa";
import { IoMdTrash } from "react-icons/io";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import { LuClipboardList } from "react-icons/lu";
import axios from "axios";

import styles from "./modulos.module.css";
import { useEffect, useState } from "react";

export default function TablaModulos() {
  const [modulos, setModulos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchModulos = async () => {
      try {
        const response = await axios.get("/api/modulo");
        setModulos(response.data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchModulos();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className={styles.cont_tabla}>
      <h4 className="subtitulos-dashboard">
        <LuClipboardList /> Listado de Módulos
      </h4>
      <div>Buscar...</div>
      <div className={styles.cont_table}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th>ID</th>
              <th>NOMBRE</th>
              <th>DESCRIPCION</th>
              <th>RUTA</th>
              <th>ICONO</th>
              <th>ESTADO</th>
              <th>ACTION</th>
            </tr>
          </thead>

          <tbody className={styles.tbody}>
            {modulos.map((modulo) => (
              <tr key={modulo.id_modulo}>
                <td>{modulo.id_modulo}</td>
                <td>{modulo.nombre_modulo}</td>
                <td>{modulo.descripcion}</td>
                <td>{modulo.ruta}</td>
                <td>{modulo.icono}</td>
                <td>{modulo.id_estado_modulo}</td>
                <td>
                  <div className={styles.cont_actions}>
                    <button>
                      <FaPencilAlt />
                    </button>
                    <button>
                      <IoMdTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className={styles.paginacion}>
          <div>
            Mostrando <span>10</span> de <span>20</span> módulos
          </div>
          <Stack spacing={2}>
            <Pagination
              count={10}
              showFirstButton
              showLastButton
              color="primary"
            />
          </Stack>
        </div>
      </div>
    </div>
  );
}
