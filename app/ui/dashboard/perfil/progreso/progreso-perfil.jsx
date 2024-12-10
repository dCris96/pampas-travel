import styles from "./progreso.module.css";

export default function ProgresoPerfil() {
  return (
    <>
      <div className={styles.contenedor}>
        <h3 className={styles.titulo}>Completa los datos de tu cuenta.</h3>
        <p className={styles.parrafo}>
          ¡Bienvenido a la sección de personalización! Aquí puedes agregar o
          actualizar tu información para que tu perfil esté siempre al día.
          Asegúrate de llenar cada campo con información precisa para que
          podamos conocerte mejor. ¡Gracias por ayudarnos a mejorar tu
          experiencia!
        </p>
        <div className={styles.cont_barra}>
          <p>Finalización del perfil: 40%</p>
          <div className={styles.barra_full}>
            <div className={styles.barra_progres}></div>
          </div>
        </div>
      </div>
    </>
  );
}
