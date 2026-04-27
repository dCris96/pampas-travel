"use client";

import { useState, useEffect } from "react";

const historiaCompleta = (
  <>
    <p>
      El distrito de <strong>Pampas</strong>, ubicado en la provincia de
      Pallasca, Áncash, es un territorio que combina una profunda herencia
      ancestral con una importancia geográfica estratégica en la sierra norte
      del Perú.
    </p>

    <hr />

    <h2>1. Evolución Histórica</h2>

    <h3>Época Prehispánica y Colonial</h3>
    <p>
      Los orígenes de Pampas se remontan a la influencia de las culturas{" "}
      <strong>Pashas</strong> y <strong>Conchucos</strong>. Estos grupos
      destacaron por su avanzada arquitectura en piedra y su organización social
      en los valles de la provincia de Pallasca. Durante la colonia, el
      territorio fue un punto de tránsito vital entre la costa y las zonas
      mineras de la sierra central.
    </p>

    <h3>Creación Política (1918)</h3>
    <p>
      El distrito alcanzó su autonomía administrativa a inicios del siglo XX.
      Fue creado oficialmente mediante la <strong>Ley N° 2971</strong> el{" "}
      <strong>16 de diciembre de 1918</strong>, bajo la rúbrica del presidente
      José Pardo y Barreda. Este hecho marcó el inicio de su desarrollo como
      entidad independiente de la capital provincial.
    </p>

    <hr />

    <h2>2. Datos Geográficos y Extensión</h2>
    <p>
      Pampas es reconocido por ser uno de los distritos más vastos de la región,
      limitando con el departamento de La Libertad.
    </p>
    <ul>
      <li>
        <strong>Extensión Territorial:</strong> 438.18 km² (el segundo más
        grande de Pallasca).
      </li>
      <li>
        <strong>Altitud:</strong> La capital se sitúa a 3,190 m.s.n.m.
      </li>
      <li>
        <strong>Geografía:</strong> Territorio accidentado que incluye valles
        interandinos y altas punas.
      </li>
    </ul>

    <hr />

    <h2>3. Demografía Actualizada</h2>
    <p>
      La población de Pampas ha experimentado cambios significativos debido a
      los procesos migratorios hacia las capitales costeras.
    </p>
    <ul>
      <li>
        <strong>Censo 2017 (INEI):</strong> 3,980 habitantes.
      </li>
      <li>
        <strong>Proyección al 2026:</strong> Se estima una población de
        aproximadamente <strong>2,950 habitantes</strong>.
      </li>
      <li>
        <strong>Densidad:</strong> 6.73 hab/km² aproximadamente.
      </li>
    </ul>

    <hr />

    <h2>4. Economía y Tradiciones</h2>

    <h3>Actividades Productivas</h3>
    <p>
      La economía del distrito se sustenta en tres ejes principales que han
      definido el sustento de sus familias por generaciones:
    </p>
    <ol>
      <li>
        <strong>Agricultura:</strong> Cultivos de altura como papa, trigo,
        cebada y maíz.
      </li>
      <li>
        <strong>Ganadería:</strong> Crianza de ganado vacuno y ovino.
      </li>
      <li>
        <strong>Minería:</strong> Actividad extractiva polimetálica en las zonas
        altas del distrito.
      </li>
    </ol>

    <h3>Cultura y Fe</h3>
    <p>
      La festividad más importante es la celebración en honor a{" "}
      <strong>San Agustín</strong> y <strong>Santa Rosa</strong>, la cual se
      lleva a cabo al finales del mes de Agosto. Es el evento cultural más
      relevante, donde se manifiesta el sincretismo religioso y el retorno de la
      diáspora pampasina.
    </p>
  </>
);

const textoPlano = `El distrito de <strong>Pampas</strong>, ubicado en la provincia de Pallasca, Áncash, es un territorio que combina una profunda herencia ancestral con una importancia geográfica estratégica en la sierra norte del Perú.`; // copia el texto plano
const resumen =
  textoPlano.slice(0, 280) + (textoPlano.length > 280 ? "..." : "");

export default function HistoriaSection() {
  const [isMobile, setIsMobile] = useState(false);
  const [textoExpandido, setTextoExpandido] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <section className="section">
      <div className="section_hitoria">
        <h2 className="title-main">
          Distrito de Pampas: Historia, Geografía y Actualidad
        </h2>
        {isMobile ? (
          !textoExpandido ? (
            <>
              <p>{resumen}</p>
              <button
                className="btn-leer-mas"
                onClick={() => setTextoExpandido(true)}
              >
                Leer más
              </button>
            </>
          ) : (
            <>
              {historiaCompleta}
              <button
                className="btn-leer-menos"
                onClick={() => setTextoExpandido(false)}
              >
                Leer menos
              </button>
            </>
          )
        ) : (
          historiaCompleta
        )}
      </div>
    </section>
  );
}
