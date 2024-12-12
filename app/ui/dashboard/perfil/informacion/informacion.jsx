"use client";

import dayjs from "dayjs";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import { useState, useEffect } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import styles from "./informacion.module.css";
import useAuth from "@/app/hooks/useAuth";
import axios from "axios";
import Swal from "sweetalert2";

export default function InformacionPerfil() {
  const { user, loading } = useAuth(); // Hook personalizado para obtener usuario
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    fecha_nacimiento: "",
    celular: "",
    email: "",
    direccion: "",
    ciudad: "",
    pais: "",
  });

  const [initialData, setInitialData] = useState({});
  const [isChanged, setIsChanged] = useState(false);

  // Cargar datos del usuario autenticado
  useEffect(() => {
    if (user && user.id) {
      const fetchUserData = async () => {
        try {
          const response = await axios.get(`/api/usuario/${user.id}`);
          const userData = response.data[0];
          const formattedData = {
            nombre: userData.nombre || "",
            apellido: userData.apellido || "",
            fecha_nacimiento: userData.fecha_nacimiento || "",
            celular: userData.celular || "",
            email: userData.email || "",
            direccion: userData.direccion || "",
            ciudad: userData.ciudad || "",
            pais: userData.pais || "",
          };
          setFormData(formattedData);
          setInitialData(formattedData); // Establece datos iniciales para comparación
        } catch (error) {
          console.error("Error al cargar datos del usuario", error);
        }
      };
      fetchUserData();
    }
  }, [user]);

  // Actualizar estado cuando cambian los campos
  const handleInputChange = (field, value) => {
    const updatedFormData = { ...formData, [field]: value };
    setFormData(updatedFormData);
    // Detectar cambios
    setIsChanged(
      JSON.stringify(updatedFormData) !== JSON.stringify(initialData)
    );
  };

  // Guardar cambios
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const formattedData = {
        ...formData,
        fecha_nacimiento: dayjs(formData.fecha_nacimiento).format("YYYY-MM-DD"), // Formatea la fecha
      };

      const response = await axios.put(
        `/api/usuario/${user.id}`,
        formattedData
      );
      console.log(response);

      setInitialData(formData); // Actualiza los datos iniciales
      setIsChanged(false); // Desactiva el botón
      Swal.fire({
        position: "center",
        icon: "success",
        title: "Informacion actualizada correctamente.",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      console.error("Error al guardar cambios", error);
      Swal.fire({
        position: "center",
        icon: "error",
        title: "No se puedo actualizar.",
        showConfirmButton: false,
        timer: 1500,
      });
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <>
      <form className={styles.cont_form_info} onSubmit={handleSave}>
        <div className={styles.box_form}>
          <label htmlFor="nombres">Nombres:</label>
          <input
            type="text"
            id="nombres"
            value={formData.nombre}
            onChange={(e) => handleInputChange("nombre", e.target.value)}
          />
        </div>
        <div className={styles.box_form}>
          <label htmlFor="apellidos">Apellidos:</label>
          <input
            type="text"
            id="apellidos"
            value={formData.apellido}
            onChange={(e) => handleInputChange("apellido", e.target.value)}
          />
        </div>
        <div className={styles.input_exclude}>
          <label htmlFor="">Fecha de nacimiento:</label>
          <MobileDatePicker
            value={dayjs(formData.fecha_nacimiento)}
            onChange={(newValue) =>
              handleInputChange("fecha_nacimiento", newValue?.toISOString())
            }
            disableScrollLock
          />
        </div>
        <div className={styles.input_exclude}>
          <label htmlFor="">Celular:</label>
          <PhoneInput
            country={"pe"}
            value={formData.celular}
            onChange={(value) => handleInputChange("celular", value)}
          />
        </div>
        <div className={styles.box_form}>
          <label htmlFor="correo">Correo:</label>
          <input
            type="text"
            id="correo"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
          />
        </div>
        <div className={styles.box_form}>
          <label htmlFor="direccion">Dirección:</label>
          <input
            type="text"
            id="direccion"
            value={formData.direccion}
            onChange={(e) => handleInputChange("direccion", e.target.value)}
          />
        </div>
        <div className={styles.box_form}>
          <label htmlFor="ciudad">Ciudad:</label>
          <input
            type="text"
            id="ciudad"
            value={formData.ciudad}
            onChange={(e) => handleInputChange("ciudad", e.target.value)}
          />
        </div>
        <div className={styles.box_form}>
          <label htmlFor="pais">País:</label>
          <input
            type="text"
            id="pais"
            value={formData.pais}
            onChange={(e) => handleInputChange("pais", e.target.value)}
          />
        </div>
        <div className={styles.cont_boton}>
          <button type="submit" disabled={!isChanged}>
            Guardar
          </button>
        </div>
      </form>
    </>
  );
}
