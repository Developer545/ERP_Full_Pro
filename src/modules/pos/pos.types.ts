/**
 * Tipos TypeScript para el modulo POS (Punto de Venta).
 */

/** Item del carrito de venta */
export interface CartItem {
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;      // Precio con IVA incluido
  discount: number;       // Porcentaje de descuento (0-100)
  taxRate: number;        // Tasa de impuesto (0.13 = 13%)
  subtotal: number;       // Subtotal sin IVA
  ivaAmount: number;      // Monto IVA
  total: number;          // Total con IVA
}

/** Producto para mostrar en el catalogo del POS */
export interface ProductoPOS {
  id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  price: number;          // Precio con IVA incluido
  cost: number;
  taxRate: number;
  stock: number;
  unit: string;
  image: string | null;
  trackStock: boolean;
  category: {
    id: string;
    name: string;
    color: string | null;
  } | null;
}

/** Datos de la venta a procesar */
export interface POSVenta {
  customerId?: string;
  tipoDoc: "CCF" | "CF";
  items: CartItem[];
  paymentMethod: "CASH" | "CARD" | "TRANSFER" | "MIXED";
  amountReceived?: number; // Para calcular vuelto (solo efectivo)
  notes?: string;
}

/** Resultado de procesar una venta en el POS */
export interface POSVentaResult {
  invoice: {
    id: string;
    correlativo: string;
    tipoDoc: string;
    total: number;
  };
  change: number; // Vuelto al cliente
}

/** Resumen de las ultimas ventas del dia */
export interface UltimaVenta {
  id: string;
  correlativo: string;
  tipoDoc: string;
  total: number;
  createdAt: string;
  customer: {
    id: string;
    name: string;
  } | null;
}
