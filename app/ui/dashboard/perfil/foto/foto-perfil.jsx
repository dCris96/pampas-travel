"use client";
import Image from "next/image";
import { FaCameraRetro } from "react-icons/fa";
import styles from "./foto-perfil.module.css";
import ModalFoto from "./modal-foto";
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import useAuth from "@/app/hooks/useAuth";
import { ProfileImageContext } from "@/app/contextos/ProfileImageContext";

export default function FotoPerfil() {
  const { profileImage, setProfileImage } = useContext(ProfileImageContext);
  const { loading: authLoading, error: authError, user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [isLoadingUserData, setIsLoadingUserData] = useState(false); // Control de carga

  const handleShowModal = () => setIsModalOpen(true);
  const handleClose = () => setIsModalOpen(false);
  const handleAcept = () => {
    // window.location.reload();
    setIsModalOpen(false);
  };

  useEffect(() => {
    const getUsuarioData = async () => {
      if (!user || !user.id) return; // Si no hay usuario o ID, no hacer nada
      setIsLoadingUserData(true); // Comienza a cargar
      try {
        const response = await axios.get(`/api/usuario/${user.id}`);
        setUsuario(response.data[0]);
      } catch (error) {
        console.error("No se pudo traer el usuario", error);
      } finally {
        setIsLoadingUserData(false); // Termina de cargar
      }
    };

    getUsuarioData();
  }, [user]); // Se ejecuta cada vez que `user` cambia

  // Renderizado condicional
  if (authLoading) return <div>Cargando autenticación...</div>;
  if (!user) return <div>No hay usuario autenticado</div>;
  if (isLoadingUserData) return <div>Cargando datos del usuario...</div>;

  return (
    <div className={styles.contenedor}>
      <h2 className={styles.titulo}>PERFIL</h2>
      {usuario ? (
        <div>
          <div className={styles.foto}>
            <div className={styles.imagen}>
              <Image
                src={profileImage || usuario.foto_perfil}
                alt="Imagen de perfil"
                width={400}
                height={400}
              />
            </div>
            <button className={styles.boton} onClick={handleShowModal}>
              <FaCameraRetro />
            </button>
          </div>
          <div className={styles.nombres}>
            <p>{usuario.nombre}</p>
            <p>{usuario.apellido}</p>
          </div>
        </div>
      ) : (
        <div>No se encontraron datos del usuario</div>
      )}
      {isModalOpen && <ModalFoto onClose={handleClose} onAcept={handleAcept} />}
    </div>
  );
}
