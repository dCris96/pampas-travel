import styles from "./loader.module.css";

export default function LoaderGeneral() {
  return (
    <div className={styles.contenedor}>
      <svg
        id="Capa_2"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 220.74 180.54"
        className={styles.loader}
      >
        <polygon points="110.56 179.12 1.41 69.97 69.97 1.41 111.33 42.78 152.31 1.8 219.33 68.82 110.56 179.12" />
        <path d="M104.44,55.8l-49.79,49.79s-41.74-32.55-12.26-62.04,62.04,12.26,62.04,12.26Z" />
      </svg>

      {/* LOADER ALTERNATIVO */}
      {/* <div className={styles.loader}>
        <div className={styles.orbe} style={{ "--index": 0 }}></div>
        <div className={styles.orbe} style={{ "--index": 1 }}></div>
        <div className={styles.orbe} style={{ "--index": 2 }}></div>
        <div className={styles.orbe} style={{ "--index": 3 }}></div>
        <div className={styles.orbe} style={{ "--index": 4 }}></div>
      </div> */}
    </div>
  );
}
