import { NextResponse } from "next/server";
import { myConexion } from "@/libs/mysql";

export async function GET() {
  try {
    const [result] = await myConexion.query("SELECT * FROM modulos");

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { nombre_modulo, descripcion, ruta, icono, id_estado_modulo } =
      await request.json();

    // Convertir la primera letra de cada palabra en mayúscula
    const formatName = (str) =>
      str.replace(/\b\w/g, (char) => char.toUpperCase());

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

    const nombreReady = formatName(sanitizeString(nombre_modulo));
    const descReady = sanitizeString(capitalizeFirstLetter(descripcion));

    // Convertir id_estado_modulo a entero
    const idEstadoModuloInt = parseInt(id_estado_modulo, 10);

    const [result] = await myConexion.query(
      "INSERT INTO modulos (nombre_modulo, descripcion, ruta, icono, id_estado_modulo) VALUES (?,?,?,?,?)",
      [nombreReady, descReady, ruta, icono, idEstadoModuloInt]
    );

    return NextResponse.json({
      id_modulo: result.insertId,
      nombre_modulo,
      descripcion,
      ruta,
      icono,
      id_estado_modulo: idEstadoModuloInt,
    });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
