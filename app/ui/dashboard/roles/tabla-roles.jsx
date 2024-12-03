"use client";
import { useState, useEffect } from "react";
import styles from "./rolesUi.module.css";
import ModalRoles from "./modal-roles";

// ICONOS
import { LuClipboardList } from "react-icons/lu";
import { IoMdKey } from "react-icons/io";

// MATERIAL UI
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";

// AXIOS PARA APIS
import axios from "axios";

// COMPONENTE DE BUSQUEDA EN TABLAS
import Search from "../../Search";

// IMPORTACION PARA EL LOADING DE LOS DATOS
import { TablasSkeleton } from "../../skeletons";
import { Suspense } from "react"; //No es necesario si la información no se carga desde una base de datos

//IMPORTAR SWEETALERT PARA NOTIFICAR
import Swal from "sweetalert2";

export default function TablaRoles({ onActualizarRegistros }) {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Variables / Constantes para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4; // Número de elementos por página

  // Variables / Constantes para la búsqueda en la tabla
  const [filteredRoles, setFilteredRoles] = useState([]);

  //Variables para abrir el modal con los datos a editar
  const [isModalOpen, setIsModalOpen] = useState(false);

  //Variables para llevar el id y el nombre del rol
  const [selectRolId, setSelectRolId] = useState(null);
  const [nombreRol, setNombreRol] = useState("");

  // Llamada de la información desde la API de Módulos
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const rolesResponse = await axios.get("/api/rol");
        setRoles(rolesResponse.data);
        setFilteredRoles(rolesResponse.data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, [onActualizarRegistros]);

  // Búsqueda en la tabla
  const handleSearch = (term) => {
    const filtered = roles.filter((rol) => {
      return Object.values(rol).some((value) =>
        String(value).toLowerCase().includes(term.toLowerCase())
      );
    });
    setFilteredRoles(filtered);
    setCurrentPage(1); // Reinicia a la primera página
  };

  // Calcular los elementos a mostrar en la página actual
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRoles.slice(indexOfFirstItem, indexOfLastItem);

  // Manejar el cambio de página
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  //Funcion para abrir el modal con los datos del modulo seleccionado
  const handleShowModal = (id, nombreRol) => {
    setNombreRol(nombreRol);
    setSelectRolId(id);
    setIsModalOpen(true);
  };

  //Cerrar el modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  if (error) return <p>Error: {error}</p>;

  return (
    <div className="cont_tabla">
      <h4 className="subtitulos-dashboard">
        <LuClipboardList /> Listado de Roles
      </h4>
      <Search placeholder="Buscar roles..." onSearch={handleSearch} />
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
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody className="tbody">
              {currentItems.map((rol) => (
                <tr key={rol.id_rol}>
                  <td>{rol.id_rol}</td>
                  <td>{rol.nombre_rol}</td>
                  <td>
                    <div className="cont_actions">
                      <button
                        className={styles.boton1}
                        onClick={() =>
                          handleShowModal(rol.id_rol, rol.nombre_rol)
                        }
                      >
                        <IoMdKey />
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
            Mostrando{" "}
            <span>
              {indexOfFirstItem + 1} a{" "}
              {Math.min(indexOfLastItem, filteredRoles.length)} de{" "}
              {filteredRoles.length} registros
            </span>
          </div>
          <Stack spacing={2}>
            <Pagination
              count={Math.ceil(filteredRoles.length / itemsPerPage)}
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
      {isModalOpen && (
        <ModalRoles
          selectRolId={selectRolId}
          nombreRol={nombreRol}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
