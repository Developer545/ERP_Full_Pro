import { SignJWT, jwtVerify } from "jose";
import { AppError, ErrorCodes } from "@/lib/errors/app-error";
import type { TokenPayload } from "@/types/auth";

/** Convierte el JWT_SECRET string a clave criptografica */
function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET no configurado");
  return new TextEncoder().encode(secret);
}

const ACCESS_TTL = process.env.JWT_ACCESS_TTL || "15m";
const REFRESH_TTL = process.env.JWT_REFRESH_TTL || "7d";

/**
 * Genera par de tokens: access (corto) + refresh (largo).
 * Access token: 15 min — para autenticar requests.
 * Refresh token: 7 dias — para renovar el access token.
 */
export async function generateTokenPair(
  payload: Omit<TokenPayload, "type" | "jti">
): Promise<{ accessToken: string; refreshToken: string }> {
  const secret = getSecret();

  const accessToken = await new SignJWT({ ...payload, type: "access" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TTL)
    .sign(secret);

  const refreshToken = await new SignJWT({
    sub: payload.sub,
    type: "refresh",
    jti: crypto.randomUUID(), // ID unico para invalidacion
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TTL)
    .sign(secret);

  return { accessToken, refreshToken };
}

/**
 * Verifica y decodifica un token JWT.
 * @throws AppError si el token es invalido o ha expirado
 */
export async function verifyToken(token: string): Promise<TokenPayload> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as TokenPayload;
  } catch (error: unknown) {
    const isExpired =
      error instanceof Error && error.message.includes("exp");
    throw new AppError(
      isExpired ? ErrorCodes.TOKEN_EXPIRED : ErrorCodes.TOKEN_INVALID,
      isExpired ? "La sesion ha expirado" : "Token invalido",
      401
    );
  }
}

/** Nombres de las cookies JWT */
export const COOKIE_NAMES = {
  ACCESS_TOKEN: "erp_access",
  REFRESH_TOKEN: "erp_refresh",
} as const;

/** Opciones de cookie para produccion y desarrollo */
export function getCookieOptions(type: "access" | "refresh") {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: (isProduction ? "strict" : "lax") as "strict" | "lax",
    path: "/",
    maxAge:
      type === "access"
        ? 15 * 60 // 15 minutos
        : 7 * 24 * 60 * 60, // 7 dias
  };
}
