import { NextResponse } from "next/server";
import { myConexion } from "@/libs/mysql";

export async function GET() {
  try {
    const [result] = await myConexion.query("SELECT * FROM roles_permisos");
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
    const { id_rol, id_permiso } = await request.json();

    await myConexion.query(
      "INSERT INTO roles_permisos (id_rol, id_permiso) VALUES (?,?)",
      [id_rol, id_permiso]
    );

    return NextResponse.json({
      id_rol,
      id_permiso,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: error.status }
    );
  }
}

export async function DELETE(request) {
  try {
    const { id_rol, id_permiso } = await request.json();

    if (!id_rol || !id_permiso) {
      return NextResponse.json(
        { message: "Se requieren id_rol y id_permiso." },
        { status: 400 }
      );
    }

    const [result] = await myConexion.query(
      "DELETE FROM roles_permisos WHERE id_rol = ? AND id_permiso = ?",
      [id_rol, id_permiso]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        {
          message: "La relación entre el rol y el permiso no existe.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Permiso eliminado del rol correctamente.",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
