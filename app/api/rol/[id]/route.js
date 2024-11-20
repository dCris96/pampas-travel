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
