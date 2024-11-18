import { NextResponse } from "next/server";
import { myConexion } from "@/libs/mysql";
import bcrypt from "bcrypt";

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
      id_rol = 4,
      id_estado_usuario = 4,
    } = await request.json();

    // Convertir la primera letra de cada palabra en mayúscula
    const formatName = (str) =>
      str.replace(/\b\w/g, (char) => char.toUpperCase());
    const nombreFormatted = formatName(nombre);
    const apellidoFormatted = formatName(apellido);

    // Función para sanitizar cadenas
    const sanitizeString = (str) => {
      // Eliminar caracteres no alfanuméricos y múltiples espacios
      return str
        .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s]/g, "") // Eliminar símbolos no deseados
        .replace(/\s+/g, " ") // Reemplazar múltiples espacios con uno solo
        .trim(); // Eliminar espacios al principio y al final
    };

    const nombreSanado = sanitizeString(nombreFormatted);
    const apellidoSanado = sanitizeString(apellidoFormatted);

    // Cifrado / Hasheo de contraseña
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    const [result] = await myConexion.query(
      "INSERT INTO usuarios (nombre,apellido,email,contraseña,foto_perfil,id_rol,id_estado_usuario) VALUES (?,?,?,?,?,?,?)",
      [
        nombreSanado,
        apellidoSanado,
        email,
        hashedPassword,
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
