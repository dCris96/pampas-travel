import { myConexion } from "@/libs/mysql";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import { format } from "date-fns";

export async function POST(req) {
  const { email } = await req.json();

  try {
    // Verificar si el usuario existe
    const [users] = await myConexion.query(
      "SELECT * FROM usuarios WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Generar un token de restablecimiento de contraseña
    const token = bcrypt.hashSync(Date.now().toString(), 10);
    const tokenExpires = Date.now() + 3600000; // Token válido por 1 hora
    // Formatear la fecha en formato compatible con MySQL
    const formattedTokenExpires = format(tokenExpires, "yyyy-MM-dd HH:mm:ss");

    console.log(formattedTokenExpires);

    // Actualizar el token y su fecha de expiración en la base de datos
    try {
      await myConexion.query(
        "UPDATE usuarios SET reset_password_token = ?, reset_password_expires = ? WHERE email = ?",
        [token, formattedTokenExpires, email]
      );
      console.log("Actualización exitosa");
    } catch (error) {
      console.error("Error al actualizar la base de datos:", error);
      throw error;
    }

    // Configurar el transporte de correo
    const transporter = nodemailer.createTransport({
      service: "Gmail", // o tu servicio de correo
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Enviar el correo electrónico con el token
    const mailOptions = {
      from: "pampastravelperu@gmail.com",
      to: email,
      subject: "Restablecimiento de Contraseña",
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
          <div style="text-align: center;">
            <img src="https://img.freepik.com/vector-premium/pajaro-colorido-cola-color-arco-iris_1187092-24135.jpg?semt=ais_hybrid" alt="Pampas Travel" style="width: 150px; margin-bottom: 20px;">
          </div>
          <h1 style="color: #333;">¡Restablecer tu contraseña!</h1>
          <p style="color: #555; font-size: 16px;">
            Haz clic en el siguiente enlace para restablecer tu contraseña: \n\nhttp://${process.env.BASE_URL}/auth/reset-password?token=${token}\n\n
          </p>
          <p style="color: #555; font-size: 14px;">
            Si no has solicitado este cambio, por favor ignora este correo.
          </p>
        </div>
        `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: "Correo de restablecimiento enviado" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error al enviar el correo de restablecimiento" },
      { status: 500 }
    );
  }
}
