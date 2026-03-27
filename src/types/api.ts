/**
 * Tipos globales para respuestas de API.
 * Todas las API routes deben retornar estos tipos.
 */

/** Respuesta exitosa con un solo item */
export interface ApiResponse<T> {
  data: T;
}

/** Respuesta exitosa con lista paginada */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/** Metadata de paginacion */
export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Respuesta de error estandarizada */
export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/** Parametros comunes de paginacion en query string */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/** Resultado de operacion (crear, editar, eliminar) */
export interface MutationResponse<T = void> {
  data?: T;
  message: string;
}
