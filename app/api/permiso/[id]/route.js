import { NextResponse } from "next/server";
import { myConexion } from "@/libs/mysql";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();

    const [result] = await myConexion.query(
      "SELECT * FROM permisos WHERE id_permiso = ?",
      [id]
    );

    if (result.length != 0) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { message: "El permiso no existe" },
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

    const data = await request.json();

    const [updatePermiso] = await myConexion.query(
      "UPDATE permisos SET ? WHERE id_permiso = ?",
      [data, id]
    );

    if (updatePermiso.affectedRows === 0) {
      return NextResponse.json("No se encontró el permiso.");
    }

    const [result] = await myConexion.query(
      "SELECT * FROM permisos WHERE id_permiso = ?",
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
      "DELETE FROM permisos WHERE id_permiso = ?",
      [id]
    );

    if (result.affectedRows === 1) {
      return NextResponse.json(
        { message: "Registro eliminado correctamente." },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: "Permiso no encontrado." },
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
