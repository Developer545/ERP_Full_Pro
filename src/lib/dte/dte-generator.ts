/**
 * Generador de JSON DTE — Ministerio de Hacienda El Salvador
 *
 * Implementa la estructura del documento tributario electronico (DTE)
 * segun el esquema publicado por el MH de El Salvador.
 *
 * Tipos soportados:
 *   - CF  (01) Factura Consumidor Final
 *   - CCF (03) Comprobante de Credito Fiscal
 *   - NC  (05) Nota de Credito
 *   - ND  (06) Nota de Debito
 *
 * Estado: preparado para integracion con certificado digital del emisor.
 * Cuando se tenga el certificado, solo se necesita enviar el JSON a la API del MH.
 *
 * @see https://www.dtes.sv/home — Portal DTE El Salvador
 */

import type { FacturaCompleta, TenantDTEConfig } from "@/modules/facturas/factura.types";

// ─── Tipos DTE ────────────────────────────────────────────────────────────────

/** Documento DTE completo listo para enviar al MH */
export interface DTEDocument {
  nit: string;
  activo: boolean;
  passwordPri: string;
  dteJson: DTEJson;
}

interface DTEIdentificacion {
  version: number;
  ambiente: "00" | "01";
  tipoDte: string;
  numeroControl: string;
  codigoGeneracion: string;
  tipoModelo: number;
  tipoOperacion: number;
  tipoContingencia: null;
  motivoContin: null;
  fecEmi: string;
  horEmi: string;
  tipoMoneda: "USD";
}

interface DTEDireccion {
  departamento: string;
  municipio: string;
  complemento: string;
}

interface DTEEmisor {
  nit: string;
  nrc: string;
  nombre: string;
  codActividad: string;
  descActividad: string;
  nombreComercial: string | null;
  tipoEstablec: string;
  direccion: DTEDireccion;
  telefono: string | null;
  correo: string;
}

interface DTEReceptorCF {
  tipoDocumento: string;
  numDocumento: string;
  nombre: string;
  correo: string | null;
  telefono: string | null;
  direccion: null;
}

interface DTEReceptorCCF {
  nit: string;
  nrc: string | null;
  nombre: string;
  codActividad: string | null;
  descActividad: string | null;
  nombreComercial: string | null;
  direccion: DTEDireccion | null;
  telefono: string | null;
  correo: string | null;
}

interface DTEItem {
  numItem: number;
  tipoItem: number;
  numeroDocumento: null;
  cantidad: number;
  codigo: string | null;
  codTributo: null;
  uniMedida: number;
  descripcion: string;
  precioUni: number;
  montoDescu: number;
  ventaNoSuj: number;
  ventaExenta: number;
  ventaGravada: number;
  tributos: string[];
  psv: number;
  noGravado: number;
  ivaItem: number;
}

interface DTETributo {
  codigo: string;
  descripcion: string;
  valor: number;
}

interface DTEPago {
  codigo: string;
  montoPago: number;
  referencia: string | null;
  plazo: string | null;
  periodo: number | null;
}

interface DTEResumen {
  totalNoSuj: number;
  totalExenta: number;
  totalGravada: number;
  subTotalVentas: number;
  descuNoSuj: number;
  descuExenta: number;
  descuGravada: number;
  porcentajeDescuento: number;
  totalDescu: number;
  tributos: DTETributo[];
  subTotal: number;
  ivaRete1: number;
  reteRenta: number;
  montoTotalOperacion: number;
  totalNoGravado: number;
  totalPagar: number;
  totalLetras: string;
  totalIva: number;
  saldoFavor: number;
  condicionOperacion: number;
  pagos: DTEPago[];
  numPagoElectronico: null;
}

interface DTEJson {
  identificacion: DTEIdentificacion;
  emisor: DTEEmisor;
  receptor: DTEReceptorCF | DTEReceptorCCF;
  cuerpoDocumento: DTEItem[];
  resumen: DTEResumen;
  extension: null;
  apendice: null;
}

// ─── Mapas de constantes MH ───────────────────────────────────────────────────

/** Codigo tipoDte por tipo de documento */
const TIPO_DTE_CODIGO: Record<string, string> = {
  CF: "01",
  CCF: "03",
  NC: "05",
  ND: "06",
  FE: "11",
  FSE: "14",
};

/** Codigos de metodo de pago segun catalogo MH */
const METODO_PAGO_CODIGO: Record<string, string> = {
  CASH: "01",     // Efectivo
  CARD: "02",     // Tarjeta debito/credito
  TRANSFER: "03", // Transferencia bancaria
  CHECK: "04",    // Cheque
  CREDIT: "07",   // A credito
  MIXED: "99",    // Otro
};

/** Codigo de tributo IVA segun catalogo MH */
const TRIBUTO_IVA = "20";
const IVA_DESC = "Impuesto al Valor Agregado 13%";

// ─── Funciones auxiliares ─────────────────────────────────────────────────────

/**
 * Convierte un numero a palabras en espanol para el campo totalLetras del DTE.
 * Soporta hasta 999,999,999.99 (suficiente para facturas de ERP).
 *
 * @example numberToWords(10.00) → "DIEZ 00/100 DOLARES"
 * @example numberToWords(1234.50) → "UN MIL DOSCIENTOS TREINTA Y CUATRO 50/100 DOLARES"
 */
export function numberToWords(n: number): string {
  const centavos = Math.round((n % 1) * 100);
  const entero = Math.floor(n);
  const palabras = _enteroALetras(entero);
  const centStr = String(centavos).padStart(2, "0");
  return `${palabras.toUpperCase()} ${centStr}/100 DOLARES`;
}

/** Convierte la parte entera a letras */
function _enteroALetras(n: number): string {
  if (n === 0) return "CERO";
  if (n < 0) return `MENOS ${_enteroALetras(-n)}`;

  const UNIDADES = [
    "", "UN", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE",
    "DIEZ", "ONCE", "DOCE", "TRECE", "CATORCE", "QUINCE", "DIECISEIS",
    "DIECISIETE", "DIECIOCHO", "DIECINUEVE", "VEINTE",
  ];

  const DECENAS = [
    "", "", "VEINTI", "TREINTA", "CUARENTA", "CINCUENTA",
    "SESENTA", "SETENTA", "OCHENTA", "NOVENTA",
  ];

  const CENTENAS = [
    "", "CIEN", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS", "QUINIENTOS",
    "SEISCIENTOS", "SETECIENTOS", "OCHOCIENTOS", "NOVECIENTOS",
  ];

  if (n <= 20) return UNIDADES[n];

  if (n < 30) {
    const resto = n - 20;
    return resto === 0 ? "VEINTE" : `VEINTI${UNIDADES[resto]}`;
  }

  if (n < 100) {
    const decena = Math.floor(n / 10);
    const unidad = n % 10;
    if (unidad === 0) return DECENAS[decena];
    return `${DECENAS[decena]} Y ${UNIDADES[unidad]}`;
  }

  if (n === 100) return "CIEN";

  if (n < 1000) {
    const centena = Math.floor(n / 100);
    const resto = n % 100;
    const centenaStr = centena === 1 ? "CIENTO" : CENTENAS[centena];
    if (resto === 0) return centenaStr;
    return `${centenaStr} ${_enteroALetras(resto)}`;
  }

  if (n < 2000) {
    const resto = n % 1000;
    if (resto === 0) return "UN MIL";
    return `UN MIL ${_enteroALetras(resto)}`;
  }

  if (n < 1_000_000) {
    const miles = Math.floor(n / 1000);
    const resto = n % 1000;
    const milesStr = `${_enteroALetras(miles)} MIL`;
    if (resto === 0) return milesStr;
    return `${milesStr} ${_enteroALetras(resto)}`;
  }

  if (n < 2_000_000) {
    const resto = n % 1_000_000;
    if (resto === 0) return "UN MILLON";
    return `UN MILLON ${_enteroALetras(resto)}`;
  }

  if (n < 1_000_000_000) {
    const millones = Math.floor(n / 1_000_000);
    const resto = n % 1_000_000;
    const millonesStr = `${_enteroALetras(millones)} MILLONES`;
    if (resto === 0) return millonesStr;
    return `${millonesStr} ${_enteroALetras(resto)}`;
  }

  return String(n); // fallback para numeros muy grandes
}

/**
 * Formatea el numero de control DTE segun el formato del MH.
 * Formato: DTE-{tipoDte}-{codEstablecimiento}-{correlativo15dig}
 *
 * @example formatNumeroControl(1, "01", "M0010204003") → "DTE-01-M0010204003-000000000000001"
 */
export function formatNumeroControl(
  correlativo: number,
  tipoDte: string,
  codEstablecimiento: string
): string {
  const corr = String(correlativo).padStart(15, "0");
  return `DTE-${tipoDte}-${codEstablecimiento}-${corr}`;
}

/**
 * Mapea el metodo de pago interno al codigo del catalogo MH.
 */
export function mapPaymentMethod(method: string): string {
  return METODO_PAGO_CODIGO[method] ?? "99";
}

/**
 * Formatea una fecha a "YYYY-MM-DD" para el DTE.
 */
function formatFecha(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Formatea una hora a "HH:MM:SS" para el DTE.
 */
function formatHora(date: Date): string {
  return date.toISOString().split("T")[1].split(".")[0];
}

/**
 * Redondea un numero a 2 decimales para evitar errores de precision flotante.
 */
function r2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ─── Generador principal ──────────────────────────────────────────────────────

/**
 * Genera el JSON DTE completo listo para enviar al Ministerio de Hacienda.
 *
 * @param factura - Factura completa con items y datos del cliente
 * @param tenant  - Configuracion DTE del emisor (NIT, NRC, direccion, etc.)
 * @returns DTEDocument listo para firmar y enviar a la API del MH
 *
 * @example
 * const dteJson = generateDTEJson(factura, tenant.dteConfig);
 * // Enviar a: POST https://api.dtes.mh.gob.sv/fesv/recepciondte
 */
export function generateDTEJson(
  factura: FacturaCompleta,
  tenant: TenantDTEConfig
): DTEDocument {
  const tipoDte = TIPO_DTE_CODIGO[factura.tipoDoc] ?? "01";
  const ahora = new Date(factura.createdAt);
  const correlativoNum = parseInt(factura.correlativo, 10) || 1;

  // ── Identificacion ──────────────────────────────────────────────────────────
  const identificacion: DTEIdentificacion = {
    version: 1,
    ambiente: tenant.ambiente ?? "00",
    tipoDte,
    numeroControl: formatNumeroControl(
      correlativoNum,
      tipoDte,
      tenant.codigoEstablecimiento
    ),
    codigoGeneracion: factura.codigoGeneracion,
    tipoModelo: 1,      // 1 = modelo de facturacion previo
    tipoOperacion: 1,   // 1 = transmision normal
    tipoContingencia: null,
    motivoContin: null,
    fecEmi: formatFecha(ahora),
    horEmi: formatHora(ahora),
    tipoMoneda: "USD",
  };

  // ── Emisor ──────────────────────────────────────────────────────────────────
  const emisor: DTEEmisor = {
    nit: tenant.nit,
    nrc: tenant.nrc,
    nombre: tenant.nombre,
    codActividad: tenant.codActividad,
    descActividad: tenant.descActividad,
    nombreComercial: tenant.nombreComercial ?? null,
    tipoEstablec: tenant.tipoEstablec ?? "01",
    direccion: {
      departamento: tenant.direccion.departamento,
      municipio: tenant.direccion.municipio,
      complemento: tenant.direccion.complemento,
    },
    telefono: tenant.telefono ?? null,
    correo: tenant.correo,
  };

  // ── Receptor ────────────────────────────────────────────────────────────────
  const receptor = _buildReceptor(factura);

  // ── Cuerpo del documento (items) ────────────────────────────────────────────
  const cuerpoDocumento: DTEItem[] = factura.items.map((item, idx) => {
    const taxRate = item.taxRate ?? 0.13;
    // Precio sin IVA (base gravada por unidad)
    const precioSinIva = r2(item.unitPrice / (1 + taxRate));
    const ventaGravada = r2(precioSinIva * item.quantity - item.discount);
    const ivaItem = r2(ventaGravada * taxRate);

    return {
      numItem: idx + 1,
      tipoItem: 1,        // 1 = Bien, 2 = Servicio, 3 = Ambos, 4 = Otro
      numeroDocumento: null,
      cantidad: item.quantity,
      codigo: null,       // Codigo interno del producto (opcional)
      codTributo: null,
      uniMedida: 59,      // 59 = Unidad segun catalogo MH
      descripcion: item.description,
      precioUni: r2(precioSinIva),
      montoDescu: r2(item.discount),
      ventaNoSuj: 0,
      ventaExenta: 0,
      ventaGravada: Math.max(0, ventaGravada),
      tributos: [TRIBUTO_IVA],
      psv: 0,
      noGravado: 0,
      ivaItem: Math.max(0, ivaItem),
    };
  });

  // ── Calcular totales del resumen ────────────────────────────────────────────
  const totalGravada = r2(
    cuerpoDocumento.reduce((acc, item) => acc + item.ventaGravada, 0)
  );
  const totalIva = r2(
    cuerpoDocumento.reduce((acc, item) => acc + item.ivaItem, 0)
  );
  const totalDescu = r2(
    cuerpoDocumento.reduce((acc, item) => acc + item.montoDescu, 0)
  );
  const montoTotal = r2(totalGravada + totalIva - (factura.descuento ?? 0));

  // Condicion de operacion: 1=contado, 2=credito, 3=otro
  const condicionOperacion =
    factura.paymentMethod === "CREDIT" ? 2 : 1;

  const resumen: DTEResumen = {
    totalNoSuj: 0,
    totalExenta: 0,
    totalGravada,
    subTotalVentas: totalGravada,
    descuNoSuj: 0,
    descuExenta: 0,
    descuGravada: r2(factura.descuento ?? 0),
    porcentajeDescuento: 0,
    totalDescu,
    tributos: [
      {
        codigo: TRIBUTO_IVA,
        descripcion: IVA_DESC,
        valor: totalIva,
      },
    ],
    subTotal: totalGravada,
    ivaRete1: 0,
    reteRenta: 0,
    montoTotalOperacion: montoTotal,
    totalNoGravado: 0,
    totalPagar: montoTotal,
    totalLetras: numberToWords(montoTotal),
    totalIva,
    saldoFavor: 0,
    condicionOperacion,
    pagos: [
      {
        codigo: mapPaymentMethod(factura.paymentMethod),
        montoPago: montoTotal,
        referencia: null,
        plazo: condicionOperacion === 2 ? "30" : null,
        periodo: condicionOperacion === 2 ? 30 : null,
      },
    ],
    numPagoElectronico: null,
  };

  return {
    nit: tenant.nit,
    activo: true,
    passwordPri: tenant.passwordPri,
    dteJson: {
      identificacion,
      emisor,
      receptor,
      cuerpoDocumento,
      resumen,
      extension: null,
      apendice: null,
    },
  };
}

// ─── Helpers privados ─────────────────────────────────────────────────────────

/**
 * Construye el objeto receptor segun el tipo de documento:
 * - CF: Consumidor Final (tipoDocumento 13 = DUI)
 * - CCF: Credito Fiscal (requiere NIT del cliente)
 */
function _buildReceptor(
  factura: FacturaCompleta
): DTEReceptorCF | DTEReceptorCCF {
  const cliente = factura.customer;

  // CCF — requiere datos fiscales del receptor
  if (factura.tipoDoc === "CCF") {
    return {
      nit: cliente?.nit ?? "0000-000000-000-0",
      nrc: cliente?.nrc ?? null,
      nombre: cliente?.name ?? "CONSUMIDOR FINAL",
      codActividad: null,
      descActividad: null,
      nombreComercial: null,
      direccion: cliente?.address
        ? {
            departamento: "06",
            municipio: "14",
            complemento: cliente.address,
          }
        : null,
      telefono: cliente?.phone ?? null,
      correo: cliente?.email ?? null,
    } as DTEReceptorCCF;
  }

  // CF / NC / ND — Consumidor Final
  return {
    tipoDocumento: _mapDocType(cliente?.docType),
    numDocumento: cliente?.docNumber ?? "00000000-0",
    nombre: cliente?.name ?? "CONSUMIDOR FINAL",
    correo: cliente?.email ?? null,
    telefono: cliente?.phone ?? null,
    direccion: null,
  } as DTEReceptorCF;
}

/**
 * Mapea el tipo de documento interno al codigo del catalogo MH.
 * 13 = DUI, 37 = NIT, 03 = Pasaporte, 36 = NRC, 00 = Otro
 */
function _mapDocType(docType?: string): string {
  const mapa: Record<string, string> = {
    DUI: "13",
    NIT: "37",
    PASAPORTE: "03",
    NRC: "36",
    OTRO: "00",
  };
  return mapa[docType ?? "DUI"] ?? "13";
}
