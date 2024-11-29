import { NextResponse } from "next/server";
import { myConexion } from "@/libs/mysql";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();

    const [result] = await myConexion.query(
      "SELECT * FROM modulos WHERE id_modulo = ?",
      [id]
    );

    if (result.length === 0) {
      return NextResponse.json(
        { message: "El modulo no existe" },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();

    const data = await request.json();

    // Convertir la primera letra de cada palabra en mayúscula
    const formatName = (str) =>
      str.replace(/(?:^|\s|["'([{¿¡])+\S/g, (match) => match.toUpperCase());

    // Función para sanitizar cadenas, Eliminar caracteres no alfanuméricos y múltiples espacios
    const sanitizeString = (str) => {
      return str
        .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s]/g, "") // Eliminar símbolos no deseados
        .replace(/\s+/g, " ") // Reemplazar múltiples espacios con uno solo
        .trim(); // Eliminar espacios al principio y al final
    };

    //Funcion para convertir la primera letra de cada parrafo o salto de linea en mayuscula
    function capitalizeFirstLetter(paragraph) {
      return paragraph.replace(/(^\w|\.\s*\w|\n\s*\w)/g, (char) =>
        char.toUpperCase()
      );
    }

    if (data.nombre_modulo) {
      data.nombre_modulo = sanitizeString(formatName(data.nombre_modulo));
    }

    if (data.descripcion) {
      data.descripcion = sanitizeString(
        capitalizeFirstLetter(data.descripcion)
      );
    }

    const [updateModulo] = await myConexion.query(
      "UPDATE modulos SET ? WHERE id_modulo = ?",
      [data, id]
    );

    if (updateModulo.affectedRows === 0) {
      return NextResponse.json(
        { message: "El modulo no existe" },
        { status: 404 }
      );
    }

    const [result] = await myConexion.query(
      "SELECT * FROM modulos WHERE id_modulo = ?",
      [id]
    );

    return NextResponse.json(result[0]);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();

    const [deleteModulo] = await myConexion.query(
      "UPDATE modulos SET id_estado_modulo = 2 WHERE id_modulo = ?",
      [id]
    );

    if (deleteModulo.affectedRows === 0) {
      return NextResponse.json(
        { message: "Modulo no encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Modulo marcado como inactivo." },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
