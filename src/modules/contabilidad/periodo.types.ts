import type { EstadoPeriodo } from "@prisma/client";

export interface PeriodoFiltros {
  anio?: number;
  estado?: EstadoPeriodo;
  page?: number;
  pageSize?: number;
}

export interface CreatePeriodoInput {
  anio: number;
  mes: number; // 1-12
}

export interface UpdatePeriodoInput {
  nombre?: string;
}
