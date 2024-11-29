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
import clsx from "clsx";

// COMPONENTE DE BUSQUEDA EN TABLAS
import Search from "../../Search";

// IMPORTACION PARA EL LOADING DE LOS DATOS
import { TablasSkeleton } from "../../skeletons";
import { Suspense } from "react"; //No es necesario si la información no se carga desde una base de datos

//IMPORTAR SWEETALERT PARA NOTIFICAR
import Swal from "sweetalert2";

import EditModuloModal from "./modal-modulos";

export default function TablaModulos({ onActualizarRegistros }) {
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

  //Variables para abrir el modal con los datos a editar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedModulo, setSelectedModulo] = useState(null);

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
    // Pasar función al componente padre
    if (onActualizarRegistros) {
      onActualizarRegistros(agregarRegistro);
    }
  }, [onActualizarRegistros]);

  //Funcion para actualizar la tabla al crear un nuevo modulo en el formulario
  const agregarRegistro = (nuevoRegistro) => {
    setModulos((prev) => [...prev, nuevoRegistro]);
    setFilteredModulos((prev) => [...prev, nuevoRegistro]);
  };

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

  //Función para eliminar / marcar como inactivo un módulo
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "¿Estás seguro?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (confirm.isConfirmed) {
      try {
        const response = await axios.delete(`/api/modulo/${id}`);
        Swal.fire({
          title: "Éxito!",
          icon: "success",
          text: "Módulo marcado como inactivo",
          confirmButtonText: "Genial",
        });
        // Actualiza el estado local de la tabla
        setModulos((prevModulos) =>
          prevModulos.map((modulo) =>
            modulo.id_modulo === id
              ? { ...modulo, id_estado_modulo: 2 } // Cambiar el estado del módulo
              : modulo
          )
        );

        // Si también tienes `filteredModulos` (para búsqueda), actualiza también ese estado
        setFilteredModulos((prevFiltered) =>
          prevFiltered.map((modulo) =>
            modulo.id_modulo === id
              ? { ...modulo, id_estado_modulo: 2 }
              : modulo
          )
        );
      } catch (error) {
        Swal.fire({
          title: "Error!",
          icon: "error",
          text: "Error al intentar eliminar el módulo.",
          confirmButtonText: "Ok",
        });
      }
    }
  };

  //Funcion para abrir el modal con los datos del modulo seleccionado
  const handleEditClick = (modulo) => {
    setSelectedModulo(modulo);
    setIsModalOpen(true);
  };

  //Funcion para guardar los datos actualizados
  const handleSave = async (updatedData) => {
    try {
      await axios.put(`/api/modulo/${updatedData.id_modulo}`, updatedData);

      // Recarga los datos de la API
      const response = await axios.get("/api/modulo");
      setModulos(response.data);
      setFilteredModulos(response.data);

      setIsModalOpen(false);
      setSelectedModulo(null);
    } catch (error) {
      Swal.fire({
        title: "Error!",
        icon: "error",
        text: "Error al guardar los cambios.",
        confirmButtonText: "Ok",
      });
    }
  };

  //Cerrar el modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedModulo(null);
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
                      <button onClick={() => handleEditClick(modulo)}>
                        <FaPencilAlt />
                      </button>
                      <button onClick={() => handleDelete(modulo.id_modulo)}>
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
      {isModalOpen && (
        <EditModuloModal
          modulo={selectedModulo}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
