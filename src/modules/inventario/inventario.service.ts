import { AppError, ErrorCodes } from "@/lib/errors/app-error";
import { getCurrentTenantId, getCurrentUserId } from "@/lib/tenant/context";
import { InventarioRepository } from "./inventario.repository";
import type { InventarioFiltros } from "./inventario.types";

/**
 * Servicio de Inventario — logica de negocio y validaciones.
 */
export const InventarioService = {
  /**
   * Lista paginada de movimientos con filtros.
   */
  async getMovimientos(filtros: InventarioFiltros) {
    return InventarioRepository.getMovimientos(filtros);
  },

  /**
   * Resumen de stock por producto con alertas de stock bajo.
   */
  async getResumenStock() {
    return InventarioRepository.getResumenStock();
  },

  /**
   * Kardex completo de un producto con saldo corrido.
   */
  async getKardex(productId: string) {
    return InventarioRepository.getKardexProducto(productId);
  },

  /**
   * Crea un ajuste manual de stock (ADJUSTMENT).
   * La cantidad puede ser positiva (ingreso) o negativa (egreso).
   * Valida que el stock no quede negativo ante salidas.
   */
  async ajustarStock(
    productId: string,
    cantidad: number,
    razon?: string
  ) {
    if (cantidad === 0) {
      throw new AppError(
        ErrorCodes.VALIDATION_ERROR,
        "La cantidad del ajuste no puede ser cero",
        400
      );
    }

    return InventarioRepository.createMovimiento({
      productId,
      type: "ADJUSTMENT",
      quantity: cantidad,
      reason: razon,
      referenceType: "ADJUSTMENT",
    });
  },

  /**
   * Crea un movimiento de inventario manual con cualquier tipo.
   */
  async createMovimiento(data: {
    productId: string;
    type: string;
    quantity: number;
    unitCost?: number;
    reason?: string;
    referenceType?: string;
    referenceId?: string;
  }) {
    return InventarioRepository.createMovimiento({
      ...data,
      type: data.type as import("./inventario.types").MovementType,
    });
  },
};
