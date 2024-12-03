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
    const permisos = await request.json();

    const values = permisos.map(({ id_rol, id_modulo, r, w, u, d }) => [
      id_rol,
      id_modulo,
      r,
      w,
      u,
      d,
    ]);

    const query =
      "INSERT INTO permisos (id_rol, id_modulo, r, w, u, d) VALUES ?";
    const [result] = await myConexion.query(query, [values]);

    return NextResponse.json({
      success: true,
      insertedRows: result.affectedRows,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: error.status || 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const permisos = await request.json();

    const query = `
      INSERT INTO permisos (id_rol, id_modulo, r, w, u, d)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        r = VALUES(r),
        w = VALUES(w),
        u = VALUES(u),
        d = VALUES(d)
    `;

    for (const permiso of permisos) {
      const { id_rol, id_modulo, r, w, u, d } = permiso;
      await myConexion.query(query, [id_rol, id_modulo, r, w, u, d]);
    }

    return NextResponse.json({
      success: true,
      message: "Permisos actualizados correctamente",
    });
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: error.status || 500 }
    );
  }
}
