/**
 * Error tipado para toda la aplicacion.
 * Usar en lugar de `throw new Error()` para control preciso del status HTTP.
 *
 * @example
 * throw new AppError("PRODUCT_NOT_FOUND", "Producto no encontrado", 404);
 * throw new AppError("SKU_DUPLICATE", `SKU ${sku} ya existe`, 409);
 * throw new AppError("INSUFFICIENT_STOCK", "Stock insuficiente", 422, { available: 5 });
 */
export class AppError extends Error {
  constructor(
    /** Codigo de error en UPPER_SNAKE_CASE para el cliente */
    public readonly code: string,
    /** Mensaje legible por el usuario (en espanol) */
    message: string,
    /** Status HTTP a retornar */
    public readonly statusCode: number = 400,
    /** Datos adicionales para debugging o el cliente */
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "AppError";

    // Capturar stack trace correctamente en V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

/**
 * Codigos de error estandar para reusar en toda la app
 */
export const ErrorCodes = {
  // Auth
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  TOKEN_INVALID: "TOKEN_INVALID",
  // Validacion
  VALIDATION_ERROR: "VALIDATION_ERROR",
  REQUIRED_FIELD: "REQUIRED_FIELD",
  // Recursos
  NOT_FOUND: "NOT_FOUND",
  DUPLICATE: "DUPLICATE",
  // Negocio
  INSUFFICIENT_STOCK: "INSUFFICIENT_STOCK",
  INVOICE_ALREADY_CANCELLED: "INVOICE_ALREADY_CANCELLED",
  PLAN_LIMIT_EXCEEDED: "PLAN_LIMIT_EXCEEDED",
  // Sistema
  INTERNAL: "INTERNAL",
  DATABASE_ERROR: "DATABASE_ERROR",
  EXTERNAL_SERVICE_ERROR: "EXTERNAL_SERVICE_ERROR",
} as const;
