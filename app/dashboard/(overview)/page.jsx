"use client";
import DashboardCardsContainer from "@/app/ui/dashboard/dashboardCard/cards-container";
import TablaDashboard from "@/app/ui/dashboard/dashboardTabla/tabla";
import styles from "./dashboard.module.css";
import useAuth from "@/app/hooks/useAuth";
import { useEffect, useState } from "react";
import axios from "axios";
import Skeleton from "@mui/material/Skeleton";

export default function Dashboard() {
  const { loading: authLoading, error: authError, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const fetchUserId = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userId = user.id;
        if (!userId) {
          setError("No se pudo determinar el id del usuario.");
          setLoading(false);
          return;
        }

        const dataUser = await axios.get(`/api/usuario/${userId}`);

        const istoken = dataUser.data[0].token_confirmacion;

        if (!istoken) {
          setMensaje("");
        } else {
          setMensaje(
            "Hemos notado que tu correo electrónico aún no ha sido verificado." +
              "Si no verificas tu correo electrónico dentro de los próximos 7 días, procederemos a desactivar tu cuenta temporalmente. Por favor, busca el correo de verificación en tu bandeja de entrada o en tu carpeta de spam."
          );
        }
      } catch (error) {
        console.log("No hay id");
      }
    };

    fetchUserId();
  }, [authLoading, authError, user]);

  return (
    <>
      {loading ? (
        <Skeleton
          className={styles.skeleton}
          variant="rectangular"
          height={40}
          width="100%"
        />
      ) : (
        mensaje && <div className={styles.aviso}>{mensaje}</div>
      )}

      <DashboardCardsContainer />
      <TablaDashboard />
      <p></p>
    </>
  );
}
