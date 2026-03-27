import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { AppError } from "./app-error";
import { logger } from "@/lib/logger";

/**
 * Handler centralizado para errores en API routes.
 * Convierte cualquier tipo de error en una respuesta JSON consistente.
 *
 * @example
 * export async function GET(req: Request) {
 *   try {
 *     // ...logica
 *   } catch (error) {
 *     return handleApiError(error);
 *   }
 * }
 */
export function handleApiError(error: unknown): NextResponse {
  // Error de negocio (esperado)
  if (error instanceof AppError) {
    if (error.statusCode >= 500) {
      logger.error({ err: error, code: error.code }, "AppError 5xx");
    }
    return NextResponse.json(
      { error: { code: error.code, message: error.message, details: error.details } },
      { status: error.statusCode }
    );
  }

  // Error de validacion Zod
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Los datos enviados no son validos",
          details: error.flatten(),
        },
      },
      { status: 422 }
    );
  }

  // Errores de Prisma
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Violacion de unique constraint
    if (error.code === "P2002") {
      const fields = (error.meta?.target as string[])?.join(", ") || "campo";
      return NextResponse.json(
        { error: { code: "DUPLICATE", message: `El ${fields} ya existe` } },
        { status: 409 }
      );
    }
    // Registro no encontrado
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Registro no encontrado" } },
        { status: 404 }
      );
    }
    logger.error({ err: error, prismaCode: error.code }, "Prisma known error");
    return NextResponse.json(
      { error: { code: "DATABASE_ERROR", message: "Error en la base de datos" } },
      { status: 500 }
    );
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    logger.error({ err: error }, "Prisma validation error");
    return NextResponse.json(
      { error: { code: "DATABASE_ERROR", message: "Error de validacion en BD" } },
      { status: 500 }
    );
  }

  // Error desconocido — no exponer detalles al cliente
  logger.error({ err: error }, "Unhandled error in API route");
  return NextResponse.json(
    { error: { code: "INTERNAL", message: "Error interno del servidor" } },
    { status: 500 }
  );
}
