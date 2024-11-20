import styles from "./layout.module.css";

export default function LayotuAuth({ children }) {
  return <div className={styles.container}>{children}</div>;
}
