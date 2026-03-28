import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { handleApiError } from "@/lib/errors/error-handler";
import { AppError } from "@/lib/errors/app-error";
import { FacturaService } from "@/modules/facturas/factura.service";
import { generateDTEJson } from "@/lib/dte/dte-generator";
import type { TenantDTEConfig, FacturaCompleta } from "@/modules/facturas/factura.types";

/**
 * GET /api/v1/facturas/[id]/dte
 * Retorna el JSON DTE formateado segun el esquema del Ministerio de Hacienda.
 * Preparado para cuando se tenga el certificado digital del emisor.
 */
export const GET = withApi(async (_req, { user, tenant, params }) => {
  try {
    const factura = await FacturaService.getById(params.id);

    // Obtener configuracion DTE del tenant desde el campo JSON dteConfig
    const rawDteConfig = (tenant as unknown as { dteConfig?: unknown }).dteConfig;

    if (!rawDteConfig) {
      throw new AppError(
        "DTE_CONFIG_MISSING",
        "El tenant no tiene configuracion DTE. Completa la configuracion en Ajustes > Facturacion Electronica.",
        422
      );
    }

    const dteConfig = rawDteConfig as TenantDTEConfig;

    // Construir objeto FacturaCompleta tipado
    const facturaCompleta: FacturaCompleta = {
      id: factura.id,
      tipoDoc: factura.tipoDoc as FacturaCompleta["tipoDoc"],
      correlativo: factura.correlativo,
      codigoGeneracion: factura.codigoGeneracion,
      selloRecibido: factura.selloRecibido,
      subtotal: Number(factura.subtotal),
      descuento: Number(factura.descuento),
      ivaDebito: Number(factura.ivaDebito),
      total: Number(factura.total),
      status: factura.status,
      paymentMethod: factura.paymentMethod,
      notes: factura.notes,
      createdAt: factura.createdAt,
      customer: factura.customer
        ? {
            id: factura.customer.id,
            name: factura.customer.name,
            docType: factura.customer.docType,
            docNumber: factura.customer.docNumber,
            email: factura.customer.email,
            phone: factura.customer.phone,
            address: factura.customer.address,
            nit: factura.customer.nit,
            nrc: factura.customer.nrc,
            actividadEconomica: factura.customer.actividadEconomica,
          }
        : null,
      items: factura.items.map((item) => ({
        id: item.id,
        description: item.description,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        discount: Number(item.discount),
        taxRate: Number(item.taxRate),
        subtotal: Number(item.subtotal),
        ivaAmount: Number(item.ivaAmount),
        total: Number(item.total),
        productId: item.productId,
      })),
    };

    const dteJson = generateDTEJson(facturaCompleta, dteConfig);

    return NextResponse.json({
      data: dteJson,
      meta: {
        facturaId: factura.id,
        correlativo: factura.correlativo,
        tipoDoc: factura.tipoDoc,
        codigoGeneracion: factura.codigoGeneracion,
        nota: "JSON listo para enviar a la API del Ministerio de Hacienda de El Salvador.",
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
});
