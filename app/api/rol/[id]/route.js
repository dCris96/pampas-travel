import { NextResponse } from "next/server";
import { myConexion } from "@/libs/mysql";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();

    const [result] = await myConexion.query(
      "SELECT * FROM roles WHERE id_rol = ?",
      [id]
    );

    if (result.length != 0) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { message: "El rol no existe" },
        { status: 404 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: error.status }
    );
  }
}

export async function PUT(request) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();

    // Convertir la primera letra de cada palabra en mayúscula
    const formatName = (str) =>
      str.replace(/\b\w/g, (char) => char.toUpperCase());

    // Función para sanitizar cadenas
    const sanitizeString = (str) => {
      // Eliminar caracteres no alfanuméricos y múltiples espacios
      return str
        .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s]/g, "") // Eliminar símbolos no deseados
        .replace(/\s+/g, " ") // Reemplazar múltiples espacios con uno solo
        .trim(); // Eliminar espacios al principio y al final
    };

    const data = await request.json();

    if (data.nombre_rol) {
      data.nombre_rol = formatName(sanitizeString(data.nombre_rol));
    }

    const [updateRol] = await myConexion.query(
      "UPDATE roles SET ? WHERE id_rol = ?",
      [data, id]
    );

    if (updateRol.affectedRows === 0) {
      return NextResponse.json("No se encontró el rol.");
    }

    const [result] = await myConexion.query(
      "SELECT * FROM roles WHERE id_rol = ?",
      [id]
    );

    return NextResponse.json(result[0]);
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: error.status }
    );
  }
}

export async function DELETE(request) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();

    const [result] = await myConexion.query(
      "DELETE FROM roles WHERE id_rol = ?",
      [id]
    );

    if (result.affectedRows === 1) {
      return NextResponse.json(
        { message: "Registro eliminado correctamente." },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: "Rol no encontrado." },
        { status: 404 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: error.status }
    );
  }
}
