import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { jwtVerify } from "jose";

const useAuth = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const verifyToken = async () => {
      const token = Cookies.get("token"); // Obtén el token desde las cookies
      if (!token) {
        setError("No se encontró un token.");
        setLoading(false);
        return;
      }

      const secretKey = process.env.NEXT_PUBLIC_JWT_SECRET;

      try {
        const { payload } = await jwtVerify(
          token,
          new TextEncoder().encode(secretKey)
        );
        setUser({
          id: payload.id,
          email: payload.email,
          role: payload.rol,
        });
        setLoading(false);
      } catch (error) {
        setError("Token inválido o expirado.");
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  return { loading, error, user };
};

export default useAuth;
