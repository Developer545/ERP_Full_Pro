import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AuthService } from "@/modules/auth/auth.service";
import { loginSchema } from "@/modules/auth/auth.schema";
import { handleApiError } from "@/lib/errors/error-handler";
import { getCookieOptions, COOKIE_NAMES } from "@/lib/auth/tokens";
import { ZodError } from "zod";

/**
 * POST /api/auth/login
 * Autentica un usuario y establece cookies JWT httpOnly.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validar inputs con Zod
    const data = loginSchema.parse(body);

    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || undefined;
    const { user, tokens } = await AuthService.login(data, ip);

    // Establecer cookies httpOnly
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAMES.ACCESS_TOKEN, tokens.accessToken, getCookieOptions("access"));
    cookieStore.set(COOKIE_NAMES.REFRESH_TOKEN, tokens.refreshToken, getCookieOptions("refresh"));

    return NextResponse.json({ data: { user } }, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Datos invalidos", details: error.flatten() } },
        { status: 422 }
      );
    }
    return handleApiError(error);
  }
}
