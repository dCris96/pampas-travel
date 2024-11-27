import { useState, useEffect } from "react";

const useScreenSize = () => {
  // Inicializa los estados con valores predeterminados
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );
  const [height, setHeight] = useState(
    typeof window !== "undefined" ? window.innerHeight : 0
  );

  useEffect(() => {
    // Verifica si `window` está disponible
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setWidth(window.innerWidth);
      setHeight(window.innerHeight);
    };

    window.addEventListener("resize", handleResize);
    // Limpia el event listener al desmontar el componente
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return { width, height };
};

export default useScreenSize;
