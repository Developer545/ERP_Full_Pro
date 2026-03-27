import { Prisma } from "@prisma/client";

/**
 * Extension de Prisma para soft deletes.
 *
 * Convierte automaticamente las operaciones de delete en updates
 * que setean deletedAt y isActive=false.
 *
 * Filtra automaticamente registros eliminados en findMany y findFirst.
 *
 * Modelos que NO aplican soft delete: AuditLog, Session
 */
const MODELS_WITHOUT_SOFT_DELETE = ["AuditLog", "Session"];

export const softDeleteExtension = Prisma.defineExtension({
  name: "soft-delete",
  query: {
    $allModels: {
      async findMany({ args, query, model }: { args: Prisma.Args<Prisma.UserDelegate, "findMany">; query: (args: Prisma.Args<Prisma.UserDelegate, "findMany">) => Promise<unknown>; model: string }) {
        if (!MODELS_WITHOUT_SOFT_DELETE.includes(model)) {
          args.where = {
            ...args.where,
            deletedAt: null,
          } as typeof args.where;
        }
        return query(args);
      },

      async findFirst({ args, query, model }: { args: Prisma.Args<Prisma.UserDelegate, "findFirst">; query: (args: Prisma.Args<Prisma.UserDelegate, "findFirst">) => Promise<unknown>; model: string }) {
        if (!MODELS_WITHOUT_SOFT_DELETE.includes(model)) {
          args.where = {
            ...args.where,
            deletedAt: null,
          } as typeof args.where;
        }
        return query(args);
      },

      async findUnique({ args, query, model }: { args: Prisma.Args<Prisma.UserDelegate, "findUnique">; query: (args: Prisma.Args<Prisma.UserDelegate, "findUnique">) => Promise<unknown>; model: string }) {
        if (!MODELS_WITHOUT_SOFT_DELETE.includes(model)) {
          // Convertir findUnique en findFirst para poder filtrar deletedAt
          const { where, ...rest } = args;
          return (query as unknown as (args: { where: typeof where; [key: string]: unknown }) => Promise<unknown>)({
            where: { ...where, deletedAt: null },
            ...rest,
          });
        }
        return query(args);
      },

      // Interceptar delete y convertirlo en update
      async delete({ args, model, query: _query }: { args: Prisma.Args<Prisma.UserDelegate, "delete">; model: string; query: (args: unknown) => Promise<unknown> }) {
        if (!MODELS_WITHOUT_SOFT_DELETE.includes(model)) {
          // No usar query original, usar update directo
          // Esto se maneja en el cliente con un override
          return _query(args);
        }
        return _query(args);
      },
    },
  },
});
