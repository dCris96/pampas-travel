import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { jwtVerify } from "jose";
import axios from "axios";

export const useUserPermissions = () => {
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    const fetchPermissions = async () => {
      const token = Cookies.get("token"); // Obtener rol del usuario desde las cookies

      const secretKey = process.env.NEXT_PUBLIC_JWT_SECRET;

      if (token) {
        try {
          // Verifica y decodifica el token
          const { payload } = await jwtVerify(
            token,
            new TextEncoder().encode(secretKey)
          );

          const role = payload?.rol; // Aquí extraes el rol del payload del token

          if (!role) {
            console.log("no existe el rol");
          }

          try {
            const response = await axios.get(`/api/permiso?rol=${role}`);
            setPermissions(response.data); // Guardamos los permisos en el estado
          } catch (error) {
            console.error("Error al obtener permisos:", error);
          }
        } catch (error) {
          console.error("Token inválido o expirado", error);
        }
      }
    };

    fetchPermissions();
  }, []);

  return permissions; // Retornamos los permisos del usuario
};
