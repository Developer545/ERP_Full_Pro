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
 *
 * NOTA: Los parametros no llevan tipo explicito — Prisma 7 infiere correctamente
 * los genericos de $allModels. Anotaciones manuales causan conflicto de tipos.
 */
const MODELS_WITHOUT_SOFT_DELETE = ["AuditLog", "Session"];

export const softDeleteExtension = Prisma.defineExtension({
  name: "soft-delete",
  query: {
    $allModels: {
      async findMany({ args, query, model }) {
        if (!MODELS_WITHOUT_SOFT_DELETE.includes(model)) {
          args.where = {
            ...args.where,
            deletedAt: null,
          } as typeof args.where;
        }
        return query(args);
      },

      async findFirst({ args, query, model }) {
        if (!MODELS_WITHOUT_SOFT_DELETE.includes(model)) {
          args.where = {
            ...args.where,
            deletedAt: null,
          } as typeof args.where;
        }
        return query(args);
      },

      async findUnique({ args, query, model }) {
        if (!MODELS_WITHOUT_SOFT_DELETE.includes(model)) {
          // Convertir findUnique en findFirst para poder filtrar deletedAt
          const { where, ...rest } = args;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return (query as any)({
            where: { ...where, deletedAt: null },
            ...rest,
          });
        }
        return query(args);
      },

      // Interceptar delete y convertirlo en update con soft delete
      async delete({ args, model, query: _query }) {
        if (!MODELS_WITHOUT_SOFT_DELETE.includes(model)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return (_query as any)({
            ...args,
            data: { deletedAt: new Date(), isActive: false },
          });
        }
        return _query(args);
      },
    },
  },
});
