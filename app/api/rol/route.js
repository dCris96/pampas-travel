import { NextResponse } from "next/server";
import { myConexion } from "@/libs/mysql";

export async function GET() {
  try {
    const [result] = await myConexion.query("SELECT * FROM roles");
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
    const { nombre_rol } = await request.json();

    // Convertir la primera letra de cada palabra en mayúscula
    const formatName = (str) =>
      str.replace(/\b\w/g, (char) => char.toUpperCase());

    const nombreFormateado = formatName(nombre_rol);

    const sanitizeString = (str) => {
      // Eliminar caracteres no alfanuméricos y múltiples espacios
      return str
        .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s]/g, "") // Eliminar símbolos no deseados
        .replace(/\s+/g, " ") // Reemplazar múltiples espacios con uno solo
        .trim(); // Eliminar espacios al principio y al final
    };

    const nombreReady = sanitizeString(nombreFormateado);

    const [result] = await myConexion.query(
      "INSERT INTO roles (nombre_rol) VALUES (?)",
      [nombreReady]
    );

    return NextResponse.json({
      id: result.insertId,
      nombre_rol,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: error.status }
    );
  }
}
