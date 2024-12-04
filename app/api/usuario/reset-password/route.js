import { myConexion } from "@/libs/mysql";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { token, newPassword } = await req.json();

  try {
    // Verificar si el token es válido y no ha expirado
    const [users] = await myConexion.query(
      "SELECT * FROM usuarios WHERE reset_password_token = ? AND reset_password_expires > ?",
      [token, Date.now()]
    );
    if (users.length === 0) {
      return res.status(400).json({ message: "Token inválido o ha expirado" });
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar la contraseña en la base de datos y eliminar el token
    await myConexion.query(
      "UPDATE usuarios SET contraseña = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE reset_password_token = ?",
      [hashedPassword, token]
    );

    return NextResponse.json(
      { message: "Contraseña restablecida correctamente" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error al restablecer la contraseña" },
      { error: error.message }
    );
  }
}
