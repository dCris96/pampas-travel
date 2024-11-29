"use client";
import { useEffect, useState } from "react";
// ICONOS
import { FaPencilAlt } from "react-icons/fa";
import { IoMdTrash } from "react-icons/io";
import { LuClipboardList } from "react-icons/lu";

// MATERIAL UI
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";

// AXIOS PARA APIS
import axios from "axios";

// ESTILOS DEL COMPONENTE
import styles from "./modulos.module.css";
import clsx from "clsx";

// COMPONENTE DE BUSQUEDA EN TABLAS
import Search from "../../Search";

// IMPORTACION PARA EL LOADING DE LOS DATOS
import { TablasSkeleton } from "../../skeletons";
import { Suspense } from "react"; //No es necesario si la información no se carga desde una base de datos

export default function TablaModulos() {
  // Variables / Constantes para traer la información de los módulos de la base de datos y comprobrarla
  const [modulos, setModulos] = useState([]);
  const [estadosModulo, setEstadosModulo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Variables / Constantes para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4; // Número de elementos por página

  // Variables / Constantes para la búsqueda en la tabla
  const [filteredModulos, setFilteredModulos] = useState([]);

  // Llamada de la información desde la API de Módulos
  useEffect(() => {
    const fetchModulos = async () => {
      try {
        const [modulosResponse, estadosResponse] = await Promise.all([
          axios.get("/api/modulo"),
          axios.get("/api/estado_modulo"),
        ]);
        setModulos(modulosResponse.data);
        setEstadosModulo(estadosResponse.data);
        setFilteredModulos(modulosResponse.data); // Inicializa con todos los módulos
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchModulos();
  }, []);

  // Búsqueda en la tabla
  const handleSearch = (term) => {
    const filtered = modulos.filter((modulo) => {
      return Object.values(modulo).some((value) =>
        String(value).toLowerCase().includes(term.toLowerCase())
      );
    });
    setFilteredModulos(filtered);
    setCurrentPage(1); // Reinicia a la primera página
  };

  if (error) return <p>Error: {error}</p>;

  // Obtener el nombre del estado a partir del id_estado_modulo
  const getEstadoNombre = (id) => {
    const estado = estadosModulo.find(
      (estado) => estado.id_estado_modulo === id
    );
    return estado ? estado.nombre_estado : "Desconocido";
  };

  // Calcular los elementos a mostrar en la página actual
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredModulos.slice(indexOfFirstItem, indexOfLastItem);

  // Manejar el cambio de página
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  return (
    <div className="cont_tabla">
      <h4 className="subtitulos-dashboard">
        <LuClipboardList /> Listado de Módulos
      </h4>
      <Search placeholder="Buscar modulos..." onSearch={handleSearch} />
      <div className="cont_table">
        {/* Mientras carga la tabla muestra el skeleton traido del componente skeletons */}
        {loading ? (
          <Suspense>
            <TablasSkeleton></TablasSkeleton>
          </Suspense>
        ) : (
          <table className="table">
            <thead className="thead">
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
            <tbody className="tbody">
              {currentItems.map((modulo) => (
                <tr key={modulo.id_modulo}>
                  <td>{modulo.id_modulo}</td>
                  <td>{modulo.nombre_modulo}</td>
                  <td className="desc">{modulo.descripcion}</td>
                  <td>{modulo.ruta}</td>
                  <td>{modulo.icono}</td>
                  <td>
                    <span
                      className={clsx("estado", {
                        activo:
                          getEstadoNombre(modulo.id_estado_modulo) === "Activo",
                        inactivo:
                          getEstadoNombre(modulo.id_estado_modulo) ===
                          "Inactivo",
                        mantenimiento:
                          getEstadoNombre(modulo.id_estado_modulo) ===
                          "Mantenimiento",
                      })}
                    >
                      {getEstadoNombre(modulo.id_estado_modulo)}
                    </span>
                  </td>
                  <td>
                    <div className="cont_actions">
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
        )}
        <div className="paginacion">
          <div>
            Mostrando
            <span>
              {indexOfFirstItem + 1} a{" "}
              {Math.min(indexOfLastItem, filteredModulos.length)} de{" "}
              {filteredModulos.length} registros
            </span>
          </div>
          <Stack spacing={2}>
            <Pagination
              count={Math.ceil(filteredModulos.length / itemsPerPage)}
              page={currentPage}
              onChange={handlePageChange}
              showFirstButton
              showLastButton
              color="primary"
              className="numeros"
            />
          </Stack>
        </div>
      </div>
    </div>
  );
}
