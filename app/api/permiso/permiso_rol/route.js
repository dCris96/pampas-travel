import { NextResponse } from "next/server";
import { myConexion } from "@/libs/mysql";
import { jwtVerify } from "jose";

// TRAER EL ROL Y LOS PERMISOS DEL MODULO
export async function GET(request) {
  try {
    // Obtener token desde cookies o headers (authorization)
    const token =
      request.cookies.get("token")?.value ||
      request.headers.get("authorization")?.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { message: "Token no proporcionado" },
        { status: 401 }
      );
    }

    const secretKey = process.env.NEXT_PUBLIC_JWT_SECRET;

    // Decodificar y verificar el token
    try {
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(secretKey)
      );
      const rol = payload?.rol; // Extraemos el rol del token

      console.log("Rol del usuario:", rol);

      if (!rol) {
        return NextResponse.json(
          { message: "Rol no especificado" },
          { status: 400 }
        );
      }

      // Consulta de permisos según el rol extraído
      const [result] = await myConexion.query(
        "SELECT * FROM permisos WHERE id_rol = ?",
        [rol]
      );

      if (result.length === 0) {
        return NextResponse.json(
          { message: "No se encontraron permisos para este rol" },
          { status: 404 }
        );
      }

      return NextResponse.json(result);
    } catch (error) {
      return NextResponse.json(
        { message: "Token inválido o expirado" },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
