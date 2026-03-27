import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

/**
 * Middleware de Next.js — se ejecuta en el EDGE antes de cada request.
 *
 * Responsabilidades:
 * 1. Proteger rutas del dashboard (requieren JWT valido)
 * 2. Redirigir al login si no hay sesion
 * 3. Redirigir al dashboard si ya hay sesion y accede a /login
 */

const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password"];
const AUTH_ROUTES = ["/login", "/register"];

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignorar rutas de API, archivos estaticos, etc.
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("erp_access")?.value;
  const isPublicRoute = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));

  // Verificar token si existe
  let isAuthenticated = false;
  let tenantSlug = "";

  if (accessToken) {
    try {
      const secret = getSecret();
      if (secret) {
        const { payload } = await jwtVerify(accessToken, secret);
        isAuthenticated = true;
        tenantSlug = (payload as { tenantSlug?: string }).tenantSlug || "";
      }
    } catch {
      // Token invalido o expirado — tratar como no autenticado
    }
  }

  // Si esta autenticado y accede a login/register → redirigir al dashboard
  if (isAuthenticated && isAuthRoute && tenantSlug) {
    return NextResponse.redirect(
      new URL(`/${tenantSlug}/dashboard`, request.url)
    );
  }

  // Si no esta autenticado y accede a ruta protegida → redirigir al login
  if (!isAuthenticated && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
