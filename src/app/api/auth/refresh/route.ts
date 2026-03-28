import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AuthService } from "@/modules/auth/auth.service";
import { handleApiError } from "@/lib/errors/error-handler";
import { getCookieOptions, COOKIE_NAMES } from "@/lib/auth/tokens";
import { AppError, ErrorCodes } from "@/lib/errors/app-error";

/**
 * POST /api/auth/refresh
 * Rota el refresh token y emite un nuevo par de tokens.
 * El cliente debe llamar este endpoint cuando reciba 401 en cualquier API.
 */
export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get(COOKIE_NAMES.REFRESH_TOKEN)?.value;

    if (!refreshToken) {
      throw new AppError(ErrorCodes.UNAUTHORIZED, "No hay sesion activa", 401);
    }

    const { tokens } = await AuthService.refresh(refreshToken);

    // Rotar cookies
    cookieStore.set(COOKIE_NAMES.ACCESS_TOKEN, tokens.accessToken, getCookieOptions("access"));
    cookieStore.set(COOKIE_NAMES.REFRESH_TOKEN, tokens.refreshToken, getCookieOptions("refresh"));

    return NextResponse.json({ data: { ok: true } });
  } catch (error) {
    return handleApiError(error);
  }
}
