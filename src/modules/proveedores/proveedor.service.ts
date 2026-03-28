import { AppError, ErrorCodes } from "@/lib/errors/app-error";
import { cached, invalidateCachePrefix } from "@/lib/cache/cache";
import { proveedorKeys } from "@/lib/cache/keys";
import { getCurrentTenantId } from "@/lib/tenant/context";
import { ProveedorRepository } from "./proveedor.repository";
import type { CreateProveedorDto, UpdateProveedorDto, FilterProveedorDto } from "./proveedor.schema";

/**
 * Servicio de Proveedores — logica de negocio y validaciones.
 */
export const ProveedorService = {
  /**
   * Lista paginada de proveedores con cache.
   */
  async list(filters: FilterProveedorDto) {
    const tenantId = getCurrentTenantId();
    const paramsKey = JSON.stringify(filters);
    return cached(
      proveedorKeys.list(tenantId, paramsKey),
      () => ProveedorRepository.findMany(filters),
      300 // 5 minutos
    );
  },

  /**
   * Obtiene un proveedor por ID.
   */
  async getById(id: string) {
    const proveedor = await ProveedorRepository.findById(id);
    if (!proveedor) {
      throw new AppError(ErrorCodes.NOT_FOUND, "Proveedor no encontrado", 404);
    }
    return proveedor;
  },

  /**
   * Crea un nuevo proveedor.
   */
  async create(data: CreateProveedorDto) {
    const proveedor = await ProveedorRepository.create(data);
    await this._invalidateCache();
    return proveedor;
  },

  /**
   * Actualiza un proveedor existente.
   */
  async update(id: string, data: UpdateProveedorDto) {
    await this.getById(id);
    const proveedor = await ProveedorRepository.update(id, data);
    await this._invalidateCache();
    return proveedor;
  },

  /**
   * Elimina un proveedor (soft delete).
   */
  async delete(id: string) {
    await this.getById(id);
    await ProveedorRepository.delete(id);
    await this._invalidateCache();
  },

  /** Invalida todo el cache de proveedores del tenant */
  async _invalidateCache() {
    const tenantId = getCurrentTenantId();
    await invalidateCachePrefix(proveedorKeys.prefix(tenantId));
  },
};
