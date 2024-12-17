import useAuth from "@/app/hooks/useAuth";
import styles from "./informacion.module.css";
import { useState } from "react";
import axios from "axios";
import LoaderGeneral from "@/app/ui/loader";
import Swal from "sweetalert2";

export default function ChangeContraseña() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    contraseña: "",
    repeatContraseña: "",
  });
  const [error, setError] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validatePassword = () => {
    let newError = {};
    if (formData.contraseña !== formData.repeatContraseña) {
      newError.repeatContraseña = "Las contraseñas no coinciden.";
    }
    setError(newError);
    return Object.keys(newError).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validatePassword() && user && user.id) {
      setLoading(true);
      try {
        await axios.put(`/api/usuario/${user.id}`, {
          contraseña: formData.contraseña,
        });
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Contraseña actualizada",
          showConfirmButton: false,
          timer: 1500,
        });
        setFormData({ contraseña: "", repeatContraseña: "" });
      } catch (err) {
        console.log("No se pudo actualizar la contraseña", err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <form className={styles.form_change} onSubmit={handleSubmit}>
      <div className={styles.cont_change}>
        <div className={styles.input_box}>
          <label htmlFor="contra">Nueva contraseña</label>
          <input
            type="text"
            name="contraseña"
            value={formData.contraseña}
            onChange={handleChange}
            id="contra"
          />
        </div>
        <div className={styles.input_box}>
          <label htmlFor="repeatContra">Confirma contraseña</label>
          <input
            type="text"
            name="repeatContraseña"
            value={formData.repeatContraseña}
            onChange={handleChange}
            id="repeatContra"
          />
          {error.repeatContraseña && (
            <p className={styles.text_error}>{error.repeatContraseña}</p>
          )}
        </div>
      </div>
      <button type="submit" className={styles.boton_change}>
        Guardar
      </button>
      {loading && <LoaderGeneral />}
    </form>
  );
}
