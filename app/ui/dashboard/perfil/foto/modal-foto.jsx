"use client";

import { useState, useContext } from "react";
import { ProfileImageContext } from "@/app/contextos/ProfileImageContext";
import styles from "./foto-perfil.module.css";
import { FiUploadCloud } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import Swal from "sweetalert2";
import axios from "axios";
import useAuth from "@/app/hooks/useAuth";

export default function ModalFoto({ onClose, onAcept }) {
  const { setProfileImage } = useContext(ProfileImageContext);
  const { loading: authLoading, error: authError, user } = useAuth();
  const [uploadedImage, setUploadedImage] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // CONSTANTES DE CLOUDINARY
  const cloud_name = "dbal2qcrz";
  const preset_name = "pampas_travel";

  const handleFileChange = async (event) => {
    const files = event.target.files;

    if (files.length > 0) {
      const file = files[0];
      const fileSize = file.size / (1024 * 1024);

      if (fileSize <= 5) {
        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", preset_name);

        if (data) {
          setIsLoading(true);
          try {
            const response = await fetch(
              `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
              { method: "POST", body: data }
            );
            const file = await response.json();
            const imageUrlUploaded = file.secure_url;
            setUploadedImage(imageUrlUploaded);
            // LOGICA PARA SUBIR LA IMAGEN A LA BASE DE DATOS
            const userId = user.id;
            const result = await axios.put(`/api/usuario/${userId}`, {
              foto_perfil: imageUrlUploaded,
            });
            setIsLoading(false);
            setProfileImage(imageUrlUploaded);
          } catch (error) {
            console.log("Error al actualizar la base de datos", error);
          }
        } else {
          console.log("No hay imagenes");
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "La imagen supera el tamaño permitido!",
        });
        onClose();
      }
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    setDragOver(false);
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const fileSize = file.size / (1024 * 1024);

      if (fileSize <= 5) {
        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", preset_name);

        if (data) {
          setIsLoading(true);
          try {
            const response = await fetch(
              `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
              { method: "POST", body: data }
            );
            const file = await response.json();
            const imageUrlUploaded = file.secure_url;
            setUploadedImage(imageUrlUploaded);
            // LOGICA PARA SUBIR LA IMAGEN A LA BASE DE DATOS
            const userId = user.id;
            const result = await axios.put(`/api/usuario/${userId}`, {
              foto_perfil: imageUrlUploaded,
            });
            setProfileImage(imageUrlUploaded);
            setIsLoading(false);
          } catch (error) {
            console.log("Error al actualizar la base de datos", error);
          }
        } else {
          console.log("No hay imagenes");
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "La imagen supera el tamaño permitido!",
        });
        onClose();
      }
    }
  };

  return (
    <div className={styles.modal_container}>
      <div className={styles.container}>
        <button className={styles.close_modal} onClick={onClose}>
          <IoClose />
        </button>
        <h4 className={styles.titulo_modal}>Cargue su imagen de perfil</h4>
        <p className={styles.parrafo_modal}>
          Elija una imagen que aparecerá como foto de perfil.
        </p>

        <div
          className={`${styles.dropZone} ${dragOver ? styles.dragOver : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isLoading ? (
            <div>Cargando...</div>
          ) : uploadedImage ? (
            <img
              src={uploadedImage}
              alt="Uploaded Preview"
              className={styles.previewImage}
            />
          ) : (
            <div className={styles.placeholder}>
              <div className={styles.icon_upload}>
                <FiUploadCloud />
              </div>
              <p>Arrastre y suelte una imagen aquí</p>
              <p>o</p>
              <label className={styles.uploadButton}>
                Selecione un archivo
                <input
                  type="file"
                  accept="image/jpg, image/png"
                  onChange={(e) => handleFileChange(e)}
                  className={styles.fileInput}
                />
              </label>
            </div>
          )}
        </div>
        <div className={styles.instrucciones}>
          JPG, PNG / Max. 05 MB / Min. 224px x 224px
        </div>
        {uploadedImage && (
          <div className={styles.cont_footer}>
            <p className={styles.successMessage}>
              ¡Imagen cargada correctamente!
            </p>
            <button className={styles.boton_acept} onClick={onAcept}>
              Aceptar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
