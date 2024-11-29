"use client";
import styles from "./modulos.module.css";
import { BiSolidLayerPlus } from "react-icons/bi";
import { roboto } from "../../fonts";
import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

export default function FormModulos({ onRegistroCreado }) {
  const [formData, setFormData] = useState({
    nombre_modulo: "",
    descripcion: "",
    ruta: "",
    icono: "",
    id_estado_modulo: 0,
  });
  const [isEnviado, setIsEnviado] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsEnviado(true);

    try {
      const response = await axios.post("/api/modulo", formData);
      // Notificar al padre con el nuevo registro
      if (onRegistroCreado) {
        onRegistroCreado(response.data); // `response.data` contiene el nuevo registro
      }
      Swal.fire({
        title: "Creado correctamente!",
        icon: "success",
        confirmButtonText: "Genial",
      });
      setFormData({
        nombre_modulo: "",
        descripcion: "",
        ruta: "",
        icono: "",
        id_estado_modulo: "",
      });
    } catch (error) {
      Swal.fire({
        title: "Error al crear el módulo",
        icon: "error",
        confirmButtonText: "Ok",
        text: error.message,
      });
    } finally {
      setIsEnviado(false);
    }
  };

  return (
    <>
      <div className={styles.cont_form}>
        <h5 className="subtitulos-dashboard">
          <BiSolidLayerPlus /> Crear nuevo módulo
        </h5>
        <form className={styles.formulario} onSubmit={handleSubmit}>
          <input
            className={styles.campo}
            type="text"
            placeholder="Nombre del modulo"
            id="nombre_modulo"
            name="nombre_modulo"
            value={formData.nombre_modulo}
            onChange={handleChange}
            required
          />
          <textarea
            className={`${styles.campo} ${styles.textarea} ${roboto.className}`}
            placeholder="Descripcion"
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            required
          ></textarea>
          <input
            className={styles.campo}
            type="text"
            placeholder="/dashboard/ruta..."
            id="ruta"
            name="ruta"
            value={formData.ruta}
            onChange={handleChange}
            required
          />
          <input
            className={styles.campo}
            type="text"
            placeholder="icono"
            id="icono"
            name="icono"
            value={formData.icono}
            onChange={handleChange}
            required
          />
          <input
            className={styles.campo}
            type="number"
            placeholder="1"
            id="id_estado_modulo"
            name="id_estado_modulo"
            value={formData.id_estado_modulo}
            onChange={handleChange}
            required
          />
          <button type="submit" className={styles.boton}>
            {isEnviado ? "Creando..." : "Crear Módulo"}
          </button>
        </form>
      </div>
    </>
  );
}
