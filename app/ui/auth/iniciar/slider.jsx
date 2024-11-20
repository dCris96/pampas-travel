"use client";

import { useState, useEffect } from "react";
import styles from "./iniciar.module.css";
import Image from "next/image";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa6";

export default function SliderLogin() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % 3);
    }, 10000); // Change slide every 3 seconds

    return () => clearInterval(timer);
  }, []);
  return (
    <div className={styles.container}>
      <div className={styles.logo}>
        <Image
          src="/logo.png"
          alt="Logo de pampas travel"
          width={40}
          height={50}
        />
      </div>
      <div className={styles.link}>
        <Link href="#">
          Regresar al sitio <FaArrowRight />
        </Link>
      </div>

      <div className={styles.sliderContainer}>
        <div
          className={`${styles.slide} ${
            currentSlide === 0 ? styles.slideVisible : styles.slideHidden
          }`}
        >
          <div className={styles.fondo}>
            <Image src="/lago.jpg" alt="lago" fill />
          </div>

          <div className={styles.contenido}>
            <h2>Nuestra Fauna salvaje</h2>
            <p>Colibri gigante en el centro poblado Uchupampa.</p>
            <span>Fotografía: Cristian Crespin</span>
          </div>
        </div>
        <div
          className={`${styles.slide} ${
            currentSlide === 1 ? styles.slideVisible : styles.slideHidden
          }`}
        >
          <div className={styles.fondo}>
            <Image src="/montaña.jpg" alt="montaña" fill />
          </div>

          <div className={styles.contenido}>
            <h2>Conoce nuestras localidades</h2>
            <p>fotografia del centro urbano de Uchupampa.</p>
            <span>Fotografía: Cristian Crespin</span>
          </div>
        </div>
        <div
          className={`${styles.slide} ${
            currentSlide === 2 ? styles.slideVisible : styles.slideHidden
          }`}
        >
          <div className={styles.fondo}>
            <Image src="/ruinas.jpg" alt="ruinas" fill />
          </div>

          <div className={styles.contenido}>
            <h2>Flora asombrosa</h2>
            <p>Flor silvestre de los alrededores de Uchupampa.</p>
            <span>Fotografía: Cristian Crespin</span>
          </div>
        </div>

        <div className={styles.indicators}>
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className={`${styles.indicator} ${
                index === currentSlide
                  ? styles.indicatorActive
                  : styles.indicatorInactive
              }`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}
