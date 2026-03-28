import type { PrismaClient } from "@prisma/client";

/**
 * Catálogo de cuentas de EJEMPLO para demo/onboarding.
 * Cada tenant sube su propio catálogo real.
 * Solo se aplica si el tenant no tiene cuentas aún.
 */
export async function seedCatalogoEjemplo(prisma: PrismaClient, tenantId: string) {
  const existentes = await prisma.accountChart.count({ where: { tenantId } });
  if (existentes > 0) return; // No sobreescribir

  // Estructura plana: [codigo, nombre, tipo, naturaleza, nivel, parentCodigo|null]
  const cuentas: [string, string, "ACTIVO"|"PASIVO"|"CAPITAL"|"INGRESO"|"COSTO"|"GASTO", "DEUDORA"|"ACREEDORA", number, string|null, boolean][] = [
    // ACTIVO
    ["1",       "ACTIVO",                       "ACTIVO",  "DEUDORA",   1, null,  false],
    ["1.1",     "Activo Corriente",              "ACTIVO",  "DEUDORA",   2, "1",   false],
    ["1.1.1",   "Efectivo y Equivalentes",       "ACTIVO",  "DEUDORA",   3, "1.1", false],
    ["1.1.1.01","Caja General",                  "ACTIVO",  "DEUDORA",   4, "1.1.1", true],
    ["1.1.1.02","Caja Chica",                    "ACTIVO",  "DEUDORA",   4, "1.1.1", true],
    ["1.1.1.03","Banco Cuenta Corriente",        "ACTIVO",  "DEUDORA",   4, "1.1.1", true],
    ["1.1.2",   "Cuentas por Cobrar",            "ACTIVO",  "DEUDORA",   3, "1.1", false],
    ["1.1.2.01","Clientes",                      "ACTIVO",  "DEUDORA",   4, "1.1.2", true],
    ["1.1.2.02","Anticipos a Proveedores",       "ACTIVO",  "DEUDORA",   4, "1.1.2", true],
    ["1.1.3",   "Inventarios",                   "ACTIVO",  "DEUDORA",   3, "1.1", false],
    ["1.1.3.01","Mercadería",                    "ACTIVO",  "DEUDORA",   4, "1.1.3", true],
    ["1.2",     "Activo No Corriente",           "ACTIVO",  "DEUDORA",   2, "1",   false],
    ["1.2.1",   "Propiedad, Planta y Equipo",    "ACTIVO",  "DEUDORA",   3, "1.2", false],
    ["1.2.1.01","Mobiliario y Equipo",           "ACTIVO",  "DEUDORA",   4, "1.2.1", true],
    ["1.2.1.02","Equipo de Cómputo",             "ACTIVO",  "DEUDORA",   4, "1.2.1", true],
    ["1.2.1.99","Depreciación Acumulada",        "ACTIVO",  "ACREEDORA", 4, "1.2.1", true],

    // PASIVO
    ["2",       "PASIVO",                        "PASIVO",  "ACREEDORA", 1, null,  false],
    ["2.1",     "Pasivo Corriente",              "PASIVO",  "ACREEDORA", 2, "2",   false],
    ["2.1.1",   "Cuentas por Pagar",             "PASIVO",  "ACREEDORA", 3, "2.1", false],
    ["2.1.1.01","Proveedores",                   "PASIVO",  "ACREEDORA", 4, "2.1.1", true],
    ["2.1.1.02","Acreedores Varios",             "PASIVO",  "ACREEDORA", 4, "2.1.1", true],
    ["2.1.2",   "Retenciones y Descuentos",      "PASIVO",  "ACREEDORA", 3, "2.1", false],
    ["2.1.2.01","ISSS por Pagar (Laboral)",      "PASIVO",  "ACREEDORA", 4, "2.1.2", true],
    ["2.1.2.02","AFP por Pagar (Laboral)",       "PASIVO",  "ACREEDORA", 4, "2.1.2", true],
    ["2.1.2.03","Renta por Pagar (ISR)",         "PASIVO",  "ACREEDORA", 4, "2.1.2", true],
    ["2.1.2.04","ISSS Patronal por Pagar",       "PASIVO",  "ACREEDORA", 4, "2.1.2", true],
    ["2.1.2.05","AFP Patronal por Pagar",        "PASIVO",  "ACREEDORA", 4, "2.1.2", true],
    ["2.1.2.06","INSAFORP por Pagar",            "PASIVO",  "ACREEDORA", 4, "2.1.2", true],
    ["2.1.3",   "IVA",                           "PASIVO",  "ACREEDORA", 3, "2.1", false],
    ["2.1.3.01","IVA Débito Fiscal",             "PASIVO",  "ACREEDORA", 4, "2.1.3", true],
    ["2.1.3.02","IVA Crédito Fiscal",            "ACTIVO",  "DEUDORA",   4, "2.1.3", true],

    // CAPITAL
    ["3",       "CAPITAL",                       "CAPITAL", "ACREEDORA", 1, null,  false],
    ["3.1",     "Capital Social",                "CAPITAL", "ACREEDORA", 2, "3",   false],
    ["3.1.1.01","Capital Aportado",              "CAPITAL", "ACREEDORA", 4, "3.1", true],
    ["3.2",     "Utilidades",                    "CAPITAL", "ACREEDORA", 2, "3",   false],
    ["3.2.1.01","Utilidad del Ejercicio Ant.",   "CAPITAL", "ACREEDORA", 4, "3.2", true],
    ["3.2.1.02","Utilidad del Período",          "CAPITAL", "ACREEDORA", 4, "3.2", true],

    // INGRESOS
    ["4",       "INGRESOS",                      "INGRESO", "ACREEDORA", 1, null,  false],
    ["4.1",     "Ingresos por Ventas",           "INGRESO", "ACREEDORA", 2, "4",   false],
    ["4.1.1.01","Ventas de Mercadería",          "INGRESO", "ACREEDORA", 4, "4.1", true],
    ["4.1.1.02","Ventas de Servicios",           "INGRESO", "ACREEDORA", 4, "4.1", true],
    ["4.2",     "Otros Ingresos",                "INGRESO", "ACREEDORA", 2, "4",   false],
    ["4.2.1.01","Ingresos Financieros",          "INGRESO", "ACREEDORA", 4, "4.2", true],

    // COSTOS
    ["5",       "COSTOS",                        "COSTO",   "DEUDORA",   1, null,  false],
    ["5.1",     "Costo de Ventas",               "COSTO",   "DEUDORA",   2, "5",   false],
    ["5.1.1.01","Costo de Mercadería Vendida",   "COSTO",   "DEUDORA",   4, "5.1", true],

    // GASTOS
    ["6",       "GASTOS",                        "GASTO",   "DEUDORA",   1, null,  false],
    ["6.1",     "Gastos de Operación",           "GASTO",   "DEUDORA",   2, "6",   false],
    ["6.1.1",   "Gastos de Personal",            "GASTO",   "DEUDORA",   3, "6.1", false],
    ["6.1.1.01","Sueldos y Salarios",            "GASTO",   "DEUDORA",   4, "6.1.1", true],
    ["6.1.1.02","Cuota Patronal ISSS",           "GASTO",   "DEUDORA",   4, "6.1.1", true],
    ["6.1.1.03","Cuota Patronal AFP",            "GASTO",   "DEUDORA",   4, "6.1.1", true],
    ["6.1.1.04","INSAFORP",                      "GASTO",   "DEUDORA",   4, "6.1.1", true],
    ["6.1.1.05","Aguinaldo",                     "GASTO",   "DEUDORA",   4, "6.1.1", true],
    ["6.1.2",   "Gastos Generales",              "GASTO",   "DEUDORA",   3, "6.1", false],
    ["6.1.2.01","Alquiler",                      "GASTO",   "DEUDORA",   4, "6.1.2", true],
    ["6.1.2.02","Servicios Básicos",             "GASTO",   "DEUDORA",   4, "6.1.2", true],
    ["6.1.2.03","Papelería y Útiles",            "GASTO",   "DEUDORA",   4, "6.1.2", true],
    ["6.1.2.04","Depreciaciones",                "GASTO",   "DEUDORA",   4, "6.1.2", true],
    ["6.2",     "Gastos Financieros",            "GASTO",   "DEUDORA",   2, "6",   false],
    ["6.2.1.01","Comisiones Bancarias",          "GASTO",   "DEUDORA",   4, "6.2", true],
    ["6.2.1.02","Intereses sobre Préstamos",     "GASTO",   "DEUDORA",   4, "6.2", true],
  ];

  // Mapa código → id para resolver relaciones padre
  const idPorCodigo = new Map<string, string>();

  for (const [codigo, nombre, tipo, naturaleza, nivel, parentCodigo, permiteMovimiento] of cuentas) {
    const parentId = parentCodigo ? (idPorCodigo.get(parentCodigo) ?? null) : null;

    const cuenta = await prisma.accountChart.create({
      data: {
        tenantId,
        codigo,
        nombre,
        tipo,
        naturaleza,
        nivel,
        parentId,
        permiteMovimiento,
        isActive: true,
      },
      select: { id: true, codigo: true },
    });

    idPorCodigo.set(cuenta.codigo, cuenta.id);
  }

  console.log(`  ✓ Catálogo de cuentas ejemplo: ${cuentas.length} cuentas creadas para tenant ${tenantId}`);
}
