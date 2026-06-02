import styles from "@/styles/EvolucionHistorica.module.css";

const timelineData = [
  {
    title: "Época Prehispánica y Colonial",
    description:
      "Los orígenes de Pampas se remontan a la influencia de las culturas Pashas y Conchucos, destacadas por su avanzada arquitectura en piedra y su organización social en los valles de la provincia de Pallasca.",
  },
  {
    title: "Creación Política (1918)",
    description:
      "El distrito alcanzó su autonomía administrativa a inicios del siglo XX. Fue creado oficialmente mediante la Ley N° 2971 el 16 de diciembre de 1918.",
  },
  {
    title: "Desarrollo e Identidad",
    description:
      "Este hecho marcó el inicio de su desarrollo como entidad independiente de la capital provincial, consolidando su identidad cultural y social.",
  },
  {
    title: "Herencia Viva",
    description:
      "Hoy, Pampas mantiene viva su historia a través de sus costumbres, tradiciones y el orgullo de su gente.",
  },
];

export default function EvolucionHistorica() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>
          <span className={styles.icon}>🏛️</span>
          Evolución Histórica
        </h2>

        <div className={styles.timeline}>
          <div className={styles.line}></div>

          {timelineData.map((item, index) => (
            <div key={index} className={styles.item}>
              <div className={styles.neonDot}></div>

              <div className={styles.content}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
