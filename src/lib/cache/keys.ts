/**
 * Namespaces de cache por modulo.
 * Usar SIEMPRE estas funciones en lugar de strings hardcodeados.
 * Patron: t:{tenantId}:{modulo}:{identificador}
 */

/** Dashboard y KPIs */
export const dashboardKeys = {
  kpis: (tenantId: string) => `t:${tenantId}:dashboard:kpis`,
  salesChart: (tenantId: string, period: string) =>
    `t:${tenantId}:dashboard:sales:${period}`,
};

/** Productos */
export const productoKeys = {
  list: (tenantId: string, params: string) =>
    `t:${tenantId}:productos:list:${params}`,
  detail: (tenantId: string, id: string) =>
    `t:${tenantId}:productos:${id}`,
  catalog: (tenantId: string) => `t:${tenantId}:productos:catalog`,
  prefix: (tenantId: string) => `t:${tenantId}:productos:`,
};

/** Clientes */
export const clienteKeys = {
  list: (tenantId: string, params: string) =>
    `t:${tenantId}:clientes:list:${params}`,
  detail: (tenantId: string, id: string) =>
    `t:${tenantId}:clientes:${id}`,
  prefix: (tenantId: string) => `t:${tenantId}:clientes:`,
};

/** Proveedores */
export const proveedorKeys = {
  list: (tenantId: string, params: string) =>
    `t:${tenantId}:proveedores:list:${params}`,
  prefix: (tenantId: string) => `t:${tenantId}:proveedores:`,
};

/** Configuracion del tenant (cambia poco, TTL largo) */
export const tenantKeys = {
  settings: (tenantId: string) => `t:${tenantId}:settings`,
  features: (tenantId: string) => `t:${tenantId}:features`,
};

/** Categorias (cambian muy poco, TTL muy largo) */
export const categoriaKeys = {
  list: (tenantId: string) => `t:${tenantId}:categorias:list`,
  prefix: (tenantId: string) => `t:${tenantId}:categorias:`,
};

/** Facturas */
export const facturaKeys = {
  list: (tenantId: string, params: string) =>
    `t:${tenantId}:facturas:list:${params}`,
  detail: (tenantId: string, id: string) =>
    `t:${tenantId}:facturas:${id}`,
  resumenMes: (tenantId: string) => `t:${tenantId}:facturas:resumen-mes`,
  prefix: (tenantId: string) => `t:${tenantId}:facturas:`,
};

/** Inventario / Kardex */
export const inventarioKeys = {
  movimientos: (tenantId: string, params: string) =>
    `t:${tenantId}:inventario:list:${params}`,
  stock: (tenantId: string) => `t:${tenantId}:inventario:stock`,
  kardex: (tenantId: string, productId: string) =>
    `t:${tenantId}:inventario:kardex:${productId}`,
  prefix: (tenantId: string) => `t:${tenantId}:inventario:`,
};

/** Cuentas por Cobrar (CxC) */
export const cxcKeys = {
  list: (tenantId: string, params: string) =>
    `t:${tenantId}:cxc:list:${params}`,
  detail: (tenantId: string, id: string) => `t:${tenantId}:cxc:${id}`,
  resumen: (tenantId: string) => `t:${tenantId}:cxc:resumen`,
  prefix: (tenantId: string) => `t:${tenantId}:cxc:`,
};

/** Permisos de usuario */
export const authKeys = {
  userPermissions: (userId: string) => `user:${userId}:permissions`,
  userSession: (userId: string) => `user:${userId}:session`,
};
