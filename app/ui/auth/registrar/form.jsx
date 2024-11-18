"use client";
import Link from "next/link";
import { useState } from "react";
import { IoMdEyeOff } from "react-icons/io";
import { FaEye } from "react-icons/fa6";
import axios from "axios";
import { useRouter } from "next/navigation";

import styles from "./registrar.module.css";
import LoaderGeneral from "../../loader";

export default function FormRegister() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    contraseña: "",
    repeatPassword: "",
    acceptTerms: false,
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.nombre) newErrors.nombre = "El nombre es obligatorio";
    if (!formData.apellido) newErrors.apellido = "El apellido es obligatorio";
    if (!formData.email) newErrors.email = "El correo es obligatorio";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Este correo es inválido";
    if (!formData.contraseña)
      newErrors.contraseña = "La contraseña es obligatoria";
    else if (formData.contraseña.length < 6)
      newErrors.contraseña = "La contraseña debe tener al menos 6 caracteres";
    if (formData.contraseña !== formData.repeatPassword)
      newErrors.repeatPassword = "Las contraseñas no coinciden";
    if (formData.acceptTerms !== true)
      newErrors.acceptTerms = "Debe aceptar las condiciones";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true);

      try {
        axios.post("/api/usuario", formData);
        setLoading(false);
        router.push("/auth/confirmacion");
      } catch (error) {
        console.error("Error submitting form:", error);
        setLoading(false);
      }

      // Simular demora
      // setTimeout(async () => {

      // }, 50000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formulario}>
      <div className={styles.nombres}>
        <div className={styles.input_cont}>
          <input
            placeholder="Nombres"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            className={errors.firstName ? styles.input_error : styles.input}
          />
          {errors.firstName && (
            <p className={styles.text_error}>{errors.firstName}</p>
          )}
        </div>
        <div className={styles.input_cont}>
          <input
            placeholder="Apellidos"
            name="apellido"
            value={formData.apellido}
            onChange={handleChange}
            className={errors.lastName ? styles.input_error : styles.input}
          />
          {errors.lastName && (
            <p className={styles.text_error}>{errors.lastName}</p>
          )}
        </div>
      </div>
      <div className={styles.caja_ind}>
        <input
          placeholder="Correo"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          className={errors.email ? styles.input_error : styles.input}
        />
        {errors.email && <p className={styles.text_error}>{errors.email}</p>}
      </div>

      <div className={styles.contraseña}>
        <div className={styles.contras_inputs}>
          <div className={errors.password ? styles.input_error : styles.input}>
            <input
              placeholder="Contraseña"
              name="contraseña"
              type={showPassword ? "text" : "password"}
              value={formData.contraseña}
              onChange={handleChange}
            />
            <button
              className={styles.btn_pass}
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <IoMdEyeOff /> : <FaEye />}
            </button>
          </div>
          <div
            className={
              errors.repeatPassword ? styles.input_error : styles.input
            }
          >
            <input
              placeholder="Repetir contraseña"
              name="repeatPassword"
              type={showRepeatPassword ? "text" : "password"}
              value={formData.repeatPassword}
              onChange={handleChange}
            />
            <button
              className={styles.btn_pass}
              type="button"
              onClick={() => setShowRepeatPassword(!showRepeatPassword)}
            >
              {showRepeatPassword ? <IoMdEyeOff /> : <FaEye />}
            </button>
          </div>
        </div>
        <div className={styles.contras_errores}>
          {errors.password && (
            <p className={styles.text_error}>{errors.password}</p>
          )}
          {errors.repeatPassword && (
            <p className={styles.text_error}>{errors.repeatPassword}</p>
          )}
        </div>
      </div>

      <div className={styles.terminos}>
        <input
          className={styles.checkbox}
          type="checkbox"
          id="acceptTerms"
          name="acceptTerms"
          checked={formData.acceptTerms}
          onChange={handleChange}
        />
        <label htmlFor="acceptTerms">
          Acepto los <Link href="#">Términos y condiciones</Link>
        </label>
      </div>
      {errors.acceptTerms && (
        <p className={styles.text_error}>{errors.acceptTerms}</p>
      )}
      <button type="submit" className={styles.btn_enviar}>
        {loading ? "Enviando..." : "Empecemos"}
      </button>
      {loading && <LoaderGeneral />}
    </form>
  );
}
