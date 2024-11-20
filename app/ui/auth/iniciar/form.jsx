"use client";
import { IoMdEyeOff } from "react-icons/io";
import { FaEye } from "react-icons/fa6";
import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

import styles from "./iniciar.module.css";

export default function FormLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    contraseña: "",
  });
  const [errors, setErrors] = useState({});
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.email) {
      newErrors.email = "El correo es obligatorio";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Este correo es inválido";
    }

    if (!formData.contraseña) {
      newErrors.password = "La contraseña es obligatoria";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const response = await axios.post("/api/login", formData);
      const { token } = response.data;

      // Guardar el token en las cookies
      Cookies.set("token", token, {
        expires: 1,
        secure: process.env.NODE_ENV === "production",
        httpOnly: false,
      });

      // Redirigir al usuario a la página principal o dashboard
      router.push("/dashboard"); // Asegúrate de hacer el redireccionamiento aquí
    } catch (error) {
      const errorMsg =
        error.response?.data?.error ||
        "Error al iniciar sesión. Intenta de nuevo.";
      setErrors({ general: errorMsg });
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formulario}>
      <div className={styles.caja_ind}>
        <input
          placeholder="Correo"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          className={styles.input}
        />
        {errors.email && <p className={styles.text_error}>{errors.email}</p>}
      </div>
      <div className={styles.contras_inputs}>
        <input
          placeholder="Contraseña"
          name="contraseña"
          type={showPassword ? "text" : "password"}
          value={formData.contraseña}
          onChange={handleChange}
          className={styles.input}
        />
        <button
          className={styles.btn_pass}
          type="button"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <IoMdEyeOff /> : <FaEye />}
        </button>
      </div>
      {errors.password && (
        <p className={styles.text_error}>{errors.password}</p>
      )}

      <div className={styles.terminos}>
        ¿Olvidaste tu contraseña?<Link href="#">Clic aquí</Link>
      </div>
      {errors.general && <p className={styles.text_error}>{errors.general}</p>}
      <button type="submit" className={styles.btn_enviar}>
        Empecemos
      </button>
    </form>
  );
}
