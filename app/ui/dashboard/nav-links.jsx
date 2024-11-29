"use client";

import Link from "next/link";
import styles from "./navlinks.module.css";
import clsx from "clsx";
import axios from "axios";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useUserPermissions } from "@/app/hooks/useUserPermissions";
import { SidebarSkeleton } from "../skeletons";
import { Suspense } from "react";

const loadIcon = async (iconName) => {
  try {
    const library = iconName.slice(0, 2); // Extrae el prefijo (e.g., "Bi", "Md", etc.)
    let module;

    switch (library) {
      case "Bi":
        module = await import("react-icons/bi");
        break;
      case "Md":
        module = await import("react-icons/md");
        break;
      case "Fa":
        module = await import("react-icons/fa");
        break;
      case "Pi":
        module = await import("react-icons/pi");
        break;
      case "Gi":
        module = await import("react-icons/gi");
        break;
      case "Io":
        module = await import("react-icons/io");
        break;
      case "Gr":
        module = await import("react-icons/gr");
        break;
      case "Tb":
        module = await import("react-icons/tb");
        break;
      default:
        console.error(`Biblioteca de iconos no soportada: ${library}`);
        return null;
    }

    return module[iconName] || null; // Retorna el ícono usando el nombre completo
  } catch (error) {
    console.error(`Error al cargar el icono "${iconName}":`, error);
    return null;
  }
};

export default function NavLinks() {
  const [data, setData] = useState([]);
  const [icons, setIcons] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pathname = usePathname();

  const userPermissions = useUserPermissions();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/modulo");
        const modules = response.data;

        // Carga de iconos
        const iconPromises = modules.map(async (modulo) => {
          const Icon = await loadIcon(modulo.icono);
          return { [modulo.icono]: Icon };
        });

        const loadedIcons = await Promise.all(iconPromises);
        const iconsMap = Object.assign({}, ...loadedIcons);

        setIcons(iconsMap);
        setData(modules);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (error) return <p>Error: {error}</p>;
  return (
    <>
      {data.length === 0 && loading
        ? Array.from({ length: 10 }, (_, index) => (
            <div key={index} style={{ marginBottom: "10px" }}>
              <Suspense>
                <SidebarSkeleton />
              </Suspense>
            </div>
          ))
        : data
            .filter((modulo) => {
              const permiso = userPermissions.find(
                (permiso) => permiso.id_modulo === modulo.id_modulo
              );
              return permiso && permiso.r && modulo.id_estado_modulo === 1; // Filtrar por id_estado_modulo igual a 1
            })
            .map((modulo) => {
              const LinkIcon = icons[modulo.icono];
              return (
                <Link
                  key={modulo.nombre_modulo}
                  href={modulo.ruta}
                  className={clsx(styles.link, {
                    [styles.active]: pathname === modulo.ruta,
                  })}
                >
                  {LinkIcon ? (
                    <LinkIcon className={styles.link_icon} />
                  ) : (
                    <Skeleton width={24} height={24} />
                  )}
                  <p className={styles.text}>{modulo.nombre_modulo}</p>
                </Link>
              );
            })}
    </>
  );
}
