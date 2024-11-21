import { NextResponse } from "next/server";
import { myConexion } from "@/libs/mysql";

export async function GET() {
  try {
    const [result] = await myConexion.query("SELECT * FROM permisos");
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
    const { id_modulo, r, w, u, d } = await request.json();

    const [result] = await myConexion.query(
      "INSERT INTO permisos (id_modulo, r, w, u, d) VALUES (?,?,?,?,?)",
      [id_modulo, r, w, u, d]
    );

    return NextResponse.json({
      id: result.insertId,
      r,
      w,
      u,
      d,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: error.status }
    );
  }
}
