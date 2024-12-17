import styles from "./loader.module.css";

export default function LoaderGeneral() {
  return (
    <div className={styles.contenedor}>
      <svg
        className={styles.loader}
        id="Capa_2"
        data-name="Capa 2"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 243.39 224.75"
      >
        <polygon points="215.92 84.08 134.72 221.88 239.58 128.15 215.92 84.08" />
        <polygon points="241.9 106.35 239.58 128.15 215.92 84.08 241.9 106.35" />
        <polygon points="192.25 100.31 134.72 221.88 215.92 84.08 192.25 100.31" />
        <polygon points="119.41 1.49 119.41 221.88 183.9 54.38 119.41 1.49" />
        <polygon points="160.24 6.59 183.9 54.38 119.41 1.49 160.24 6.59" />
        <polygon points="98.07 18.19 119.41 221.88 119.41 1.49 98.07 18.19" />
        <polygon points="8.52 66.91 75.33 33.04 105.49 223.73 8.52 66.91" />
        <polygon points="17.34 38.61 75.33 33.04 8.52 66.91 17.34 38.61" />
        <polygon points="1.1 111.68 105.49 223.73 8.52 66.91 1.1 111.68" />
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
