import { NextResponse } from "next/server";
import { jwtVerify } from "jose"; // Importa la función jwtVerify de jose

export async function middleware(req) {
  const token = req.cookies.get("token")?.value || req.headers["authorization"];

  if (!token) {
    console.log("No token encontrado, redirigiendo a login...");
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  try {
    // Utiliza la función jwtVerify de la librería jose para verificar el token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET); // Codifica el secreto
    await jwtVerify(token, secret); // Verifica el token con el secreto

    return NextResponse.next();
  } catch (err) {
    console.log("Error al verificar el token:", err);
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*"], // Protege todas las rutas bajo /dashboard
};
