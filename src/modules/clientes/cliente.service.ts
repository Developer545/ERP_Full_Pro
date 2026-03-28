import { AppError, ErrorCodes } from "@/lib/errors/app-error";
import { cached, invalidateCachePrefix } from "@/lib/cache/cache";
import { clienteKeys } from "@/lib/cache/keys";
import { getCurrentTenantId } from "@/lib/tenant/context";
import { ClienteRepository } from "./cliente.repository";
import type { CreateClienteDto, UpdateClienteDto, FilterClienteDto } from "./cliente.schema";

/**
 * Servicio de Clientes — logica de negocio y validaciones.
 */
export const ClienteService = {
  /**
   * Lista paginada de clientes con cache.
   */
  async list(filters: FilterClienteDto) {
    const tenantId = getCurrentTenantId();
    const paramsKey = JSON.stringify(filters);
    return cached(
      clienteKeys.list(tenantId, paramsKey),
      () => ClienteRepository.findMany(filters),
      300 // 5 minutos
    );
  },

  /**
   * Obtiene un cliente por ID.
   */
  async getById(id: string) {
    const tenantId = getCurrentTenantId();
    return cached(
      clienteKeys.detail(tenantId, id),
      async () => {
        const cliente = await ClienteRepository.findById(id);
        if (!cliente) {
          throw new AppError(ErrorCodes.NOT_FOUND, "Cliente no encontrado", 404);
        }
        return cliente;
      },
      300
    );
  },

  /**
   * Crea un nuevo cliente.
   */
  async create(data: CreateClienteDto) {
    const cliente = await ClienteRepository.create(data);
    await this._invalidateCache();
    return cliente;
  },

  /**
   * Actualiza un cliente existente.
   */
  async update(id: string, data: UpdateClienteDto) {
    await this.getById(id);
    const cliente = await ClienteRepository.update(id, data);
    await this._invalidateCache();
    return cliente;
  },

  /**
   * Elimina un cliente (soft delete).
   */
  async delete(id: string) {
    await this.getById(id);
    await ClienteRepository.delete(id);
    await this._invalidateCache();
  },

  /** Invalida todo el cache de clientes del tenant */
  async _invalidateCache() {
    const tenantId = getCurrentTenantId();
    await invalidateCachePrefix(clienteKeys.prefix(tenantId));
  },
};
