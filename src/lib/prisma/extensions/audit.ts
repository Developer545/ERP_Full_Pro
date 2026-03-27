import { Prisma } from "@prisma/client";

/**
 * Extension de Prisma para audit trail automatico.
 * Inyecta createdBy y updatedBy desde el contexto de AsyncLocalStorage.
 * Si no hay contexto activo (seeds, migraciones), los campos quedan null.
 */
export const auditExtension = Prisma.defineExtension({
  name: "audit",
  query: {
    $allModels: {
      async create({ args, query }: { args: Prisma.Args<Prisma.UserDelegate, "create">; query: (args: Prisma.Args<Prisma.UserDelegate, "create">) => Promise<unknown> }) {
        try {
          const { getCurrentUserId } = await import("@/lib/tenant/context");
          const userId = getCurrentUserId();
          if (userId && args.data) {
            (args.data as Record<string, unknown>).createdBy = userId;
          }
        } catch {
          // Sin contexto (seed, migration) — no inyectar userId
        }
        return query(args);
      },

      async update({ args, query }: { args: Prisma.Args<Prisma.UserDelegate, "update">; query: (args: Prisma.Args<Prisma.UserDelegate, "update">) => Promise<unknown> }) {
        try {
          const { getCurrentUserId } = await import("@/lib/tenant/context");
          const userId = getCurrentUserId();
          if (userId && args.data) {
            (args.data as Record<string, unknown>).updatedBy = userId;
          }
        } catch {
          // Sin contexto — no inyectar
        }
        return query(args);
      },
    },
  },
});
