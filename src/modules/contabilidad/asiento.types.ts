import type { EstadoAsiento, OrigenAsiento } from "@prisma/client";

export interface AsientoFiltros {
  search?: string;
  estado?: EstadoAsiento;
  desde?: string;
  hasta?: string;
  origen?: OrigenAsiento;
  periodoId?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateLineaInput {
  accountId: string;
  descripcion?: string | null;
  debe: number;
  haber: number;
  orden?: number;
}

export interface CreateAsientoInput {
  fecha: string;
  concepto: string;
  tipo?: string;
  periodoId?: string | null;
  origen?: OrigenAsiento;
  origenId?: string | null;
  lines: CreateLineaInput[];
}

export type UpdateAsientoInput = Partial<Omit<CreateAsientoInput, "origen" | "origenId">>;
