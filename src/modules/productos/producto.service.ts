import { AppError, ErrorCodes } from "@/lib/errors/app-error";
import { cached, invalidateCachePrefix } from "@/lib/cache/cache";
import { productoKeys } from "@/lib/cache/keys";
import { getCurrentTenantId } from "@/lib/tenant/context";
import { prisma } from "@/lib/prisma/client";
import { ProductoRepository } from "./producto.repository";
import type { CreateProductoDto, UpdateProductoDto, FilterProductoDto } from "./producto.schema";

/**
 * Genera un SKU unico basado en nombre y timestamp.
 */
function generateSku(name: string): string {
  const prefix = name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 4)
    .padEnd(4, "X");
  const suffix = Date.now().toString(36).toUpperCase().slice(-4);
  return `${prefix}-${suffix}`;
}

/**
 * Servicio de Productos — logica de negocio y validaciones.
 */
export const ProductoService = {
  /**
   * Lista paginada de productos con cache.
   */
  async list(filters: FilterProductoDto) {
    const tenantId = getCurrentTenantId();
    const paramsKey = JSON.stringify(filters);
    return cached(
      productoKeys.list(tenantId, paramsKey),
      () => ProductoRepository.findMany(filters),
      60 // 1 minuto — stock cambia frecuentemente
    );
  },

  /**
   * Obtiene un producto por ID.
   */
  async getById(id: string) {
    const tenantId = getCurrentTenantId();
    return cached(
      productoKeys.detail(tenantId, id),
      async () => {
        const producto = await ProductoRepository.findById(id);
        if (!producto) {
          throw new AppError(ErrorCodes.NOT_FOUND, "Producto no encontrado", 404);
        }
        return producto;
      },
      300
    );
  },

  /**
   * Crea un nuevo producto validando SKU unico y limites del plan.
   */
  async create(data: CreateProductoDto) {
    const tenantId = getCurrentTenantId();

    // Verificar limite del plan
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    const currentCount = await ProductoRepository.count();
    if (tenant && currentCount >= tenant.maxProducts) {
      throw new AppError(
        ErrorCodes.PLAN_LIMIT_EXCEEDED,
        `Tu plan permite un maximo de ${tenant.maxProducts} productos. Actualiza tu plan para agregar mas.`,
        403
      );
    }

    // Generar o validar SKU
    let sku = data.sku?.trim();
    if (!sku) {
      // Auto-generar SKU unico
      let attempts = 0;
      do {
        sku = generateSku(data.name);
        const existing = await ProductoRepository.findBySku(sku);
        if (!existing) break;
        attempts++;
      } while (attempts < 5);
    } else {
      // Verificar que el SKU no este duplicado
      const existing = await ProductoRepository.findBySku(sku);
      if (existing) {
        throw new AppError(
          ErrorCodes.DUPLICATE,
          `El SKU "${sku}" ya esta en uso`,
          409
        );
      }
    }

    const producto = await ProductoRepository.create({ ...data, sku });
    await this._invalidateCache();
    return producto;
  },

  /**
   * Actualiza un producto existente.
   */
  async update(id: string, data: UpdateProductoDto) {
    // Verificar que existe
    await this.getById(id);

    // Verificar unicidad del SKU si se esta cambiando
    if (data.sku) {
      const existing = await ProductoRepository.findBySku(data.sku);
      if (existing && existing.id !== id) {
        throw new AppError(
          ErrorCodes.DUPLICATE,
          `El SKU "${data.sku}" ya esta en uso`,
          409
        );
      }
    }

    const producto = await ProductoRepository.update(id, data);
    await this._invalidateCache();
    return producto;
  },

  /**
   * Elimina un producto (soft delete).
   */
  async delete(id: string) {
    await this.getById(id);
    await ProductoRepository.delete(id);
    await this._invalidateCache();
  },

  /**
   * Catalogo de productos activos para POS/selects.
   */
  async getCatalog() {
    const tenantId = getCurrentTenantId();
    return cached(
      productoKeys.catalog(tenantId),
      () => ProductoRepository.findCatalog(),
      60
    );
  },

  /** Invalida todo el cache de productos del tenant */
  async _invalidateCache() {
    const tenantId = getCurrentTenantId();
    await invalidateCachePrefix(productoKeys.prefix(tenantId));
  },
};
