"use client";

import { useState, useEffect } from "react";

// Array con las URLs de las imágenes que quieres que pasen automáticamente
const images = [
  "https://res.cloudinary.com/dbal2qcrz/image/upload/v1775683497/_DSC0670_nczgke.jpg",
  "https://www.tallersalamandra.com/wp-content/uploads/2022/05/british-library-gUDNK8NqYHk-unsplash-scaled.jpg",
  "https://freewalkingtoursperu.com/wp-content/uploads/2024/06/10-festividades-mas-famosas-del-peru_5.webp",
];

export default function HeroSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [opacity, setOpacity] = useState(1); // Controla la opacidad de la imagen

  // Efecto para el cambio automático cada 4 segundos con fade
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Inicia el fade out
      setOpacity(0);

      // 2. Después de 300ms (mitad de la transición), cambia la imagen y hace fade in
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        setOpacity(1);
      }, 300);
    }, 5000);

    // Limpia el intervalo cuando el componente se desmonta
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="hero">
      <img
        src={images[currentIndex]}
        alt={`Pampas Travel - imagen ${currentIndex + 1}`}
        className="hero-image"
        style={{ opacity }} // 👈 Vinculamos la opacidad al estado
      />
      <div className="hero-overlay" />
      <div className="hero-content">
        <h1 className="hero-title">Pampas</h1>
        <span style={{ fontSize: 24, color: "#ffc353", fontWeight: "600" }}>
          Capital minera del norte
        </span>
        <p className="hero-description">
          Un distrito envuelto en montañas, brumas y tradiciones milenarias. Sus
          tierras fértiles, sus fiestas vibrantes y la calidez de su gente lo
          convierten en un destino que no olvidas.
        </p>
      </div>
    </section>
  );
}
