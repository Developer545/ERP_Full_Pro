import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AuthService } from "@/modules/auth/auth.service";
import { COOKIE_NAMES } from "@/lib/auth/tokens";

/**
 * POST /api/auth/logout
 * Invalida la sesion del usuario y limpia las cookies.
 */
export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(COOKIE_NAMES.REFRESH_TOKEN)?.value;

  // Invalidar sesion en BD (ignorar errores — siempre limpiar cookies)
  await AuthService.logout(refreshToken).catch(() => {});

  // Limpiar ambas cookies
  const clearOptions = { maxAge: 0, path: "/" };
  cookieStore.set(COOKIE_NAMES.ACCESS_TOKEN, "", clearOptions);
  cookieStore.set(COOKIE_NAMES.REFRESH_TOKEN, "", clearOptions);

  return NextResponse.json({ data: { ok: true } });
}
