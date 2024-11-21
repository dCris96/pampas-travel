import { NextResponse } from "next/server";
import { myConexion } from "@/libs/mysql";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();

    const [result] = await myConexion.query(
      "SELECT * FROM roles_permisos WHERE id_rol = ?",
      [id]
    );

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: error.status }
    );
  }
}
