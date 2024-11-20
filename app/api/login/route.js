import { SignJWT } from "jose"; // Importa SignJWT desde jose
import bcrypt from "bcrypt";
import { myConexion } from "@/libs/mysql";

export async function POST(request) {
  try {
    const { email, contraseña } = await request.json();

    const [rows] = await myConexion.query(
      "SELECT * FROM usuarios WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: "Usuario no encontrado" }), {
        status: 404,
      });
    }

    const usuario = rows[0];

    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(contraseña, usuario.contraseña);
    if (!passwordMatch) {
      return new Response(JSON.stringify({ error: "Contraseña incorrecta" }), {
        status: 401,
      });
    }

    // Generar token JWT usando jose
    const secret = new TextEncoder().encode(process.env.JWT_SECRET); // Codifica el secreto
    const token = await new SignJWT({
      id: usuario.id_usuario,
      email: usuario.email,
      rol: usuario.id_rol,
    })
      .setProtectedHeader({ alg: "HS256" }) // Usa el algoritmo HS256
      .setExpirationTime("1h") // Expiración del token
      .sign(secret); // Firma el token con el secreto codificado

    return new Response(
      JSON.stringify({ message: "Inicio de sesión exitoso", token }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500 }
    );
  }
}
