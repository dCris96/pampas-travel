import { myConexion } from "@/libs/mysql";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  const [rows] = await myConexion.query(
    "SELECT * FROM usuarios WHERE token_confirmacion = ?",
    [token]
  );

  if (rows.length === 0) {
    return NextResponse.json({ message: "Token inválido" }, { status: 400 });
  }

  const usuario = rows[0];

  // Actualizar estado del usuario a "confirmado"
  await myConexion.query(
    "UPDATE usuarios SET id_estado_usuario = 1, token_confirmacion = NULL WHERE id_usuario = ?",
    [usuario.id_usuario]
  );

  return NextResponse.json({ message: "Cuenta confirmada exitosamente" });
}
