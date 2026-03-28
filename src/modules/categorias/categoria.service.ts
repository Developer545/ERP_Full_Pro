import { AppError, ErrorCodes } from "@/lib/errors/app-error";
import { cached, invalidateCachePrefix } from "@/lib/cache/cache";
import { categoriaKeys } from "@/lib/cache/keys";
import { getCurrentTenantId } from "@/lib/tenant/context";
import { CategoriaRepository } from "./categoria.repository";
import type { CreateCategoriaDto, UpdateCategoriaDto, FilterCategoriaDto } from "./categoria.schema";

/**
 * Servicio de Categorias — logica de negocio y validaciones.
 */
export const CategoriaService = {
  /**
   * Lista paginada de categorias con cache.
   */
  async list(filters: FilterCategoriaDto) {
    const tenantId = getCurrentTenantId();
    const cacheKey = categoriaKeys.list(tenantId);
    // Cache solo para listados sin filtros dinamicos complejos
    if (!filters.search) {
      return cached(
        cacheKey + `:p${filters.page}:ps${filters.pageSize}:a${filters.isActive ?? "all"}`,
        () => CategoriaRepository.findMany(filters),
        1800 // 30 minutos — categorias cambian poco
      );
    }
    return CategoriaRepository.findMany(filters);
  },

  /**
   * Obtiene una categoria por ID.
   */
  async getById(id: string) {
    const categoria = await CategoriaRepository.findById(id);
    if (!categoria) {
      throw new AppError(ErrorCodes.NOT_FOUND, "Categoria no encontrada", 404);
    }
    return categoria;
  },

  /**
   * Crea una nueva categoria validando unicidad del nombre.
   */
  async create(data: CreateCategoriaDto) {
    // Verificar que no exista otra categoria con el mismo nombre
    const existing = await CategoriaRepository.findByName(data.name);
    if (existing) {
      throw new AppError(
        ErrorCodes.DUPLICATE,
        `Ya existe una categoria con el nombre "${data.name}"`,
        409
      );
    }

    const categoria = await CategoriaRepository.create(data);
    await this._invalidateCache();
    return categoria;
  },

  /**
   * Actualiza una categoria existente.
   */
  async update(id: string, data: UpdateCategoriaDto) {
    // Verificar que existe
    await this.getById(id);

    // Verificar unicidad del nombre si se esta cambiando
    if (data.name) {
      const existing = await CategoriaRepository.findByName(data.name);
      if (existing && existing.id !== id) {
        throw new AppError(
          ErrorCodes.DUPLICATE,
          `Ya existe una categoria con el nombre "${data.name}"`,
          409
        );
      }
    }

    const categoria = await CategoriaRepository.update(id, data);
    await this._invalidateCache();
    return categoria;
  },

  /**
   * Elimina una categoria (soft delete).
   */
  async delete(id: string) {
    const categoria = await this.getById(id);

    // Verificar que no tenga productos activos
    const productCount = (categoria as { _count?: { products: number } })._count?.products ?? 0;
    if (productCount > 0) {
      throw new AppError(
        "CATEGORIA_HAS_PRODUCTS",
        `No se puede eliminar la categoria "${categoria.name}" porque tiene ${productCount} productos asociados`,
        422
      );
    }

    await CategoriaRepository.delete(id);
    await this._invalidateCache();
  },

  /**
   * Lista activa para selects.
   */
  async listActive() {
    const tenantId = getCurrentTenantId();
    return cached(
      categoriaKeys.list(tenantId) + ":active",
      () => CategoriaRepository.findAllActive(),
      1800
    );
  },

  /** Invalida todo el cache de categorias del tenant */
  async _invalidateCache() {
    const tenantId = getCurrentTenantId();
    await invalidateCachePrefix(categoriaKeys.prefix(tenantId));
  },
};
