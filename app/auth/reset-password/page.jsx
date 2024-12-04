"use client";
import { useState } from "react";
import NuevaContraseña from "@/app/ui/auth/forgot-pass/nueva-contraseña";
import ContraseñaReseteada from "@/app/ui/auth/forgot-pass/contraseña-reseteada";

export default function ResetPassword() {
  const [stage, setStage] = useState("nuevaContraseña"); // Estado inicial
  const handleContraseñaReseteada = () => setStage("contraseñaReseteada");

  return (
    <div className="auth_mid">
      {stage === "nuevaContraseña" && (
        <NuevaContraseña onNext={handleContraseñaReseteada} />
      )}
      {stage === "contraseñaReseteada" && <ContraseñaReseteada />}{" "}
    </div>
  );
}
