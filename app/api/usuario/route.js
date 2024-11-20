import { NextResponse } from "next/server";
import { myConexion } from "@/libs/mysql";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";

export async function GET() {
  try {
    const [result] = await myConexion.query("SELECT * FROM usuarios");
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
    const {
      nombre,
      apellido,
      email,
      contraseña,
      foto_perfil,
      id_rol = 4,
      id_estado_usuario = 4,
    } = await request.json();

    // Convertir la primera letra de cada palabra en mayúscula
    const formatName = (str) =>
      str.replace(/\b\w/g, (char) => char.toUpperCase());
    const nombreFormatted = formatName(nombre);
    const apellidoFormatted = formatName(apellido);

    // Función para sanitizar cadenas
    const sanitizeString = (str) => {
      // Eliminar caracteres no alfanuméricos y múltiples espacios
      return str
        .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s]/g, "") // Eliminar símbolos no deseados
        .replace(/\s+/g, " ") // Reemplazar múltiples espacios con uno solo
        .trim(); // Eliminar espacios al principio y al final
    };

    const nombreSanado = sanitizeString(nombreFormatted);
    const apellidoSanado = sanitizeString(apellidoFormatted);

    // Cifrado / Hasheo de contraseña
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    const [result] = await myConexion.query(
      "INSERT INTO usuarios (nombre,apellido,email,contraseña,foto_perfil,id_rol,id_estado_usuario) VALUES (?,?,?,?,?,?,?)",
      [
        nombreSanado,
        apellidoSanado,
        email,
        hashedPassword,
        foto_perfil,
        id_rol,
        id_estado_usuario,
      ]
    );

    // Generar token para confirmar correo (puede ser un JWT o un token único)
    const confirmationToken = generateConfirmationToken(email);

    // Guardar el token en la base de datos (opcional para rastrear confirmaciones)
    await myConexion.query(
      "UPDATE usuarios SET token_confirmacion = ? WHERE id_usuario = ?",
      [confirmationToken, result.insertId]
    );

    // Configurar transporte de correo con Nodemailer
    const transporter = nodemailer.createTransport({
      service: "Gmail", // o tu servicio de correo
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Configurar contenido del correo
    const mailOptions = {
      from: "pampastravel@pampastravel.com",
      to: email,
      subject: "Confirma tu cuenta",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
          <div style="text-align: center;">
            <img src="https://img.freepik.com/vector-premium/pajaro-colorido-cola-color-arco-iris_1187092-24135.jpg?semt=ais_hybrid" alt="Pampas Travel" style="width: 150px; margin-bottom: 20px;">
          </div>
          <h1 style="color: #333;">¡Gracias por registrarte!</h1>
          <p style="color: #555; font-size: 16px;">
            Estamos encantados de tenerte a bordo. Por favor, confirma tu cuenta haciendo clic en el siguiente enlace:
          </p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${process.env.BASE_URL}/confirmar-cuenta?token=${confirmationToken}" style="background-color: #007bff; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Confirmar cuenta</a>
          </div>
          <p style="color: #555; font-size: 14px;">
            Si no solicitaste esta confirmación, puedes ignorar este correo.
          </p>
          <footer style="text-align: center; margin-top: 20px; color: #aaa; font-size: 12px;">
            &copy; 2024 Pampas Travel. Todos los derechos reservados.
          </footer>
        </div>
      `,
    };

    // Enviar correo
    await transporter.sendMail(mailOptions);

    const [rows] = await myConexion.query(
      "SELECT * FROM usuarios WHERE id_usuario = ?",
      [result.insertId]
    );
    const nuevoUsuario = rows[0];

    return NextResponse.json({
      id: result.insertId,
      nombre,
      apellido,
      email,
      contraseña,
      foto_perfil,
      id_rol,
      id_estado_usuario,
      fecha_registro: nuevoUsuario.fecha_registro,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: error.status }
    );
  }
}

// Generar un token único (puedes usar JWT para más seguridad)
function generateConfirmationToken(email) {
  return Buffer.from(email + Date.now()).toString("base64");
}
