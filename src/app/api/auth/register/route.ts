import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AuthService } from "@/modules/auth/auth.service";
import { registerSchema } from "@/modules/auth/auth.schema";
import { handleApiError } from "@/lib/errors/error-handler";
import { getCookieOptions, COOKIE_NAMES } from "@/lib/auth/tokens";
import { ZodError } from "zod";

/**
 * POST /api/auth/register
 * Crea un nuevo tenant + usuario admin y establece cookies JWT.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const data = registerSchema.parse(body);

    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || undefined;
    const { user, tenantSlug, tokens } = await AuthService.register(data, ip);

    // Establecer cookies httpOnly
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAMES.ACCESS_TOKEN, tokens.accessToken, getCookieOptions("access"));
    cookieStore.set(COOKIE_NAMES.REFRESH_TOKEN, tokens.refreshToken, getCookieOptions("refresh"));

    return NextResponse.json(
      { data: { user, tenantSlug } },
      { status: 201 }
    );
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
