import { getCurrentTenantId, getCurrentUserId } from "@/lib/tenant/context";
import { POSRepository } from "./pos.repository";
import type { PosVentaDto } from "./pos.schema";
import type { POSVentaResult } from "./pos.types";

/**
 * Servicio POS — logica de negocio del Punto de Venta.
 * Orquesta el repositorio y calcula valores derivados (vuelto, etc.).
 */
export const POSService = {
  /**
   * Busca productos activos con stock disponible para el catalogo del POS.
   * Se usa en el buscador en tiempo real (debounce en el cliente).
   */
  async buscarProductos(search?: string) {
    const tenantId = getCurrentTenantId();
    return POSRepository.getProductosPOS(tenantId, search);
  },

  /**
   * Procesa una venta completa desde el POS.
   * Valida stock, crea factura, descuenta inventario y registra movimientos.
   * Retorna la factura creada y el vuelto al cliente.
   */
  async procesarVenta(data: PosVentaDto): Promise<POSVentaResult> {
    const tenantId = getCurrentTenantId();
    const userId = getCurrentUserId();

    // Ejecutar transaccion en repositorio
    const invoice = await POSRepository.procesarVenta(tenantId, userId, data);

    // Calcular vuelto solo para pagos en efectivo
    let change = 0;
    if (data.paymentMethod === "CASH" && data.amountReceived !== undefined) {
      change = Math.max(0, data.amountReceived - Number(invoice.total));
    }

    return {
      invoice: {
        id: invoice.id,
        correlativo: invoice.correlativo,
        tipoDoc: invoice.tipoDoc,
        total: Number(invoice.total),
      },
      change: parseFloat(change.toFixed(2)),
    };
  },

  /**
   * Obtiene las ultimas ventas del dia para el historial del POS.
   * Util para mostrar en el panel lateral o al abrir caja.
   */
  async getLastVentas(limit = 10) {
    const tenantId = getCurrentTenantId();
    return POSRepository.getLastVentas(tenantId, limit);
  },
};
