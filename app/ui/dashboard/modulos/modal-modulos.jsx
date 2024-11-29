"use client";
import { useState, useEffect } from "react";
import styles from "./modulos.module.css";
import { IoClose } from "react-icons/io5";
import Swal from "sweetalert2";
import { roboto } from "../../fonts";

export default function EditModuloModal({ modulo, onClose, onSave }) {
  const [formData, setFormData] = useState(modulo);

  useEffect(() => {
    setFormData(modulo); // Actualiza los datos cuando cambia el módulo
  }, [modulo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = () => {
    onSave(formData); // Llama a la función onSave con los datos actualizados
    Swal.fire({
      title: "Éxito!",
      icon: "success",
      text: "Módulo actualizado correctamente",
      confirmButtonText: "Genial",
    });
    onClose(); // Cierra el modal
  };

  return (
    <div className={styles.modal_background}>
      <div className={styles.modal}>
        <div className={styles.modal_head}>
          <h3>Editar Módulo</h3>
          <button onClick={onClose}>
            <IoClose />
          </button>
        </div>

        <div className={styles.modal_body}>
          <form className={styles.form_modal}>
            <input
              className={styles.form_box}
              type="text"
              name="nombre_modulo"
              value={formData.nombre_modulo}
              onChange={handleChange}
            />
            <textarea
              className={`${styles.form_box} ${roboto.className}`}
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
            ></textarea>
            <input
              className={styles.form_box}
              type="text"
              name="ruta"
              value={formData.ruta}
              onChange={handleChange}
            />
            <input
              className={styles.form_box}
              type="text"
              name="icono"
              value={formData.icono}
              onChange={handleChange}
            />
            <input
              className={styles.form_box}
              type="number"
              name="id_estado_modulo"
              value={formData.id_estado_modulo}
              onChange={handleChange}
            />
            <div className={styles.botones}>
              <button
                type="button"
                onClick={handleSave}
                className={styles.guardar}
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={onClose}
                className={styles.cancelar}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
