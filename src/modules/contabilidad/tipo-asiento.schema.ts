import { z } from "zod";

export const createTipoAsientoSchema = z.object({
  nombre: z.string().min(1).max(50),
  color: z.string().max(20).optional().default("blue"),
});

export type CreateTipoAsientoDto = z.infer<typeof createTipoAsientoSchema>;
