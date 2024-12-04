"use client";
import { useState } from "react";
import IngresaCorreo from "@/app/ui/auth/forgot-pass/ingresa-correo";
import CorreoEnviado from "@/app/ui/auth/forgot-pass/correo-enviado";

export default function ForgotPassword() {
  const [stage, setStage] = useState("ingresaCorreo"); // Estado inicial

  const handleCorreoEnviado = () => setStage("correoEnviado");
  const handleNuevaContraseña = () => setStage("nuevaContraseña");

  return (
    <div className="auth_mid">
      {stage === "ingresaCorreo" && (
        <IngresaCorreo onNext={handleCorreoEnviado} />
      )}
      {stage === "correoEnviado" && (
        <CorreoEnviado onNext={handleNuevaContraseña} />
      )}
    </div>
  );
}
