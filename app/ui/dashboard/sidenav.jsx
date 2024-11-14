import NavLinks from "./nav-links";
import styles from "./sidenav.module.css";

export default function SideNav({ isExpanded }) {
  return (
    <>
      <aside className={isExpanded ? styles.aside : styles.aside_collapsed}>
        <NavLinks></NavLinks>
      </aside>
    </>
  );
}
