import { NextResponse } from "next/server";
import { myConexion } from "@/libs/mysql";

export async function GET() {
  try {
    const [result] = await myConexion.query("SELECT * FROM usuarios");
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: error.status }
    );
  }
}

export async function POST(request) {
  try {
    const {
      nombre,
      apellido,
      email,
      contraseña,
      foto_perfil,
      id_rol,
      id_estado_usuario,
    } = await request.json();

    const [result] = await myConexion.query(
      "INSERT INTO usuarios (nombre,apellido,email,contraseña,foto_perfil,id_rol,id_estado_usuario) VALUES (?,?,?,?,?,?,?)",
      [
        nombre,
        apellido,
        email,
        contraseña,
        foto_perfil,
        id_rol,
        id_estado_usuario,
      ]
    );

    const [rows] = await myConexion.query(
      "SELECT * FROM usuarios WHERE id_usuario = ?",
      [result.insertId]
    );
    const nuevoUsuario = rows[0];

    return NextResponse.json({
      id: result.insertId,
      nombre,
      apellido,
      email,
      contraseña,
      foto_perfil,
      id_rol,
      id_estado_usuario,
      fecha_registro: nuevoUsuario.fecha_registro,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: error.status }
    );
  }
}
