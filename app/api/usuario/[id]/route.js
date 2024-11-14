import { NextResponse } from "next/server";
import { myConexion } from "@/libs/mysql";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();

    const [result] = await myConexion.query(
      "SELECT * FROM usuarios WHERE id_usuario = ?",
      [id]
    );

    if (result.length != 0) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { message: "El usuario no existe" },
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

    const [updateUsuario] = await myConexion.query(
      "UPDATE usuarios SET ? WHERE id_usuario = ?",
      [data, id]
    );

    if (updateUsuario.affectedRows === 0) {
      return NextResponse.json("No se encontró el usuario.");
    }

    const [result] = await myConexion.query(
      "SELECT * FROM usuarios WHERE id_usuario = ?",
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
      "DELETE FROM usuarios WHERE id_usuario = ?",
      [id]
    );

    if (result.affectedRows === 1) {
      return NextResponse.json(
        { message: "Registro eliminado correctamente." },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: "Usuario no encontrado." },
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
