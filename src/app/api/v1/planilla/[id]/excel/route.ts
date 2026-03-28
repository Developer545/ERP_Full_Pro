import ExcelJS from "exceljs";
import { withApi } from "@/lib/api/with-api";
import { handleApiError } from "@/lib/errors/error-handler";
import { PlanillaService } from "@/modules/planilla/planilla.service";

const MESES = [
  "", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function fmt(val: number | string | unknown): number {
  return Math.round(Number(val) * 100) / 100;
}

/**
 * GET /api/v1/planilla/[id]/excel
 * Genera y descarga el Excel de una planilla con todos los detalles de empleados.
 */
export const GET = withApi(async (_req, { tenant, params }) => {
  try {
    const planilla = await PlanillaService.getById(params.id);

    const wb = new ExcelJS.Workbook();
    wb.creator = "ERP Full Pro — Speeddan System";
    wb.created = new Date();

    // ── Hoja principal ────────────────────────────────────────────────────────
    const ws = wb.addWorksheet("Planilla", {
      pageSetup: { paperSize: 9, orientation: "landscape", fitToPage: true },
    });

    // Colores de la paleta
    const ORANGE = "FFF47920";
    const DARK   = "FF1F1F1F";
    const HEADER_BG = "FFFFFBF5";
    const LIGHT_GRAY = "FFF5F5F5";

    // ── Encabezado empresa / periodo ─────────────────────────────────────────
    ws.mergeCells("A1:R1");
    const titleCell = ws.getCell("A1");
    titleCell.value = `PLANILLA DE SUELDOS Y SALARIOS — ${tenant.name}`;
    titleCell.font = { bold: true, size: 14, color: { argb: DARK } };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: ORANGE } };
    ws.getRow(1).height = 28;

    ws.mergeCells("A2:R2");
    const periodoCell = ws.getCell("A2");
    periodoCell.value = `Periodo: ${MESES[planilla.mes]} ${planilla.anio}  |  Estado: ${planilla.estado}  |  Empleados: ${planilla.empleadosCount}`;
    periodoCell.font = { size: 11, color: { argb: "FF555555" } };
    periodoCell.alignment = { horizontal: "center", vertical: "middle" };
    periodoCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: HEADER_BG } };
    ws.getRow(2).height = 22;

    ws.addRow([]); // Fila vacia separadora

    // ── Cabecera de columnas ──────────────────────────────────────────────────
    const headers = [
      "N°", "Nombre", "Cargo", "DUI",
      "Sal. Base", "Dias Trab.", "H. Extra", "Bonos", "Comisiones", "Otros Ing.", "Total Bruto",
      "ISSS Emp.", "AFP Emp.", "ISR (Renta)", "Otros Desc.", "Total Desc.",
      "Neto Pagar",
      "Costo Patronal",
    ];

    const headerRow = ws.addRow(headers);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, size: 10, color: { argb: "FFFFFFFF" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: DARK } };
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      cell.border = {
        top:    { style: "thin", color: { argb: "FF444444" } },
        bottom: { style: "thin", color: { argb: "FF444444" } },
        left:   { style: "thin", color: { argb: "FF444444" } },
        right:  { style: "thin", color: { argb: "FF444444" } },
      };
    });
    ws.getRow(4).height = 36;

    // ── Filas de detalle ──────────────────────────────────────────────────────
    const detalles = planilla.detalles ?? [];
    let rowIndex = 5;

    for (let i = 0; i < detalles.length; i++) {
      const d = detalles[i];
      const costoPatronal = fmt(d.issPatronal) + fmt(d.afpPatronal) + fmt(d.insaforp);
      const isOdd = i % 2 === 0;

      const row = ws.addRow([
        i + 1,
        `${d.employee.firstName} ${d.employee.lastName}`,
        d.employee.cargo,
        d.employee.dui ?? "",
        fmt(d.salarioBase),
        d.diasTrabajados,
        fmt(d.horasExtra),
        fmt(d.bonos),
        fmt(d.comisiones),
        fmt(d.otrosIngresos),
        fmt(d.totalBruto),
        fmt(d.descuentoISS),
        fmt(d.descuentoAFP),
        fmt(d.descuentoRenta),
        fmt(d.otrasDeduciones),
        fmt(d.totalDescuentos),
        fmt(d.salarioNeto),
        Math.round(costoPatronal * 100) / 100,
      ]);

      const bgColor = isOdd ? HEADER_BG : "FFFFFFFF";
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
        cell.alignment = { vertical: "middle", horizontal: colNumber <= 4 ? "left" : "right" };
        cell.font = { size: 10 };
        cell.border = {
          bottom: { style: "hair", color: { argb: "FFE0E0E0" } },
          right:  { style: "hair", color: { argb: "FFE0E0E0" } },
        };
      });

      // Neto en verde
      const netoCell = row.getCell(17);
      netoCell.font = { bold: true, size: 10, color: { argb: "FF16A34A" } };

      // Total descuentos en rojo
      const descCell = row.getCell(16);
      descCell.font = { size: 10, color: { argb: "FFDC2626" } };

      row.height = 20;
      rowIndex++;
    }

    // ── Fila de totales ───────────────────────────────────────────────────────
    const totalesRow = ws.addRow([
      "", "TOTALES", "", "",
      fmt(planilla.totalBruto),   // salario base sum — usamos totalBruto como referencia
      "", "", "", "", "",
      fmt(planilla.totalBruto),
      fmt(planilla.totalISS),
      fmt(planilla.totalAFP),
      fmt(planilla.totalRenta),
      "",
      fmt(planilla.totalDescuentos),
      fmt(planilla.totalNeto),
      Math.round((fmt(planilla.totalISSPatronal) + fmt(planilla.totalAFPPatronal) + fmt(planilla.totalINSAFORP)) * 100) / 100,
    ]);

    totalesRow.eachCell({ includeEmpty: true }, (cell) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE6F0FF" } };
      cell.font = { bold: true, size: 10 };
      cell.alignment = { horizontal: "right", vertical: "middle" };
      cell.border = {
        top:    { style: "medium", color: { argb: "FF1677FF" } },
        bottom: { style: "medium", color: { argb: "FF1677FF" } },
      };
    });
    totalesRow.getCell(2).alignment = { horizontal: "left", vertical: "middle" };
    totalesRow.height = 22;

    // ── Anchos de columna ─────────────────────────────────────────────────────
    ws.columns = [
      { width: 5 },   // N°
      { width: 26 },  // Nombre
      { width: 18 },  // Cargo
      { width: 12 },  // DUI
      { width: 12 },  // Sal. Base
      { width: 10 },  // Dias
      { width: 10 },  // H. Extra
      { width: 10 },  // Bonos
      { width: 12 },  // Comisiones
      { width: 12 },  // Otros Ing.
      { width: 12 },  // Total Bruto
      { width: 11 },  // ISSS Emp.
      { width: 11 },  // AFP Emp.
      { width: 12 },  // ISR
      { width: 12 },  // Otros Desc.
      { width: 12 },  // Total Desc.
      { width: 13 },  // Neto Pagar
      { width: 14 },  // Costo Patronal
    ];

    // Formato moneda en columnas numericas
    const currencyCols = [5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
    for (let row = 5; row <= rowIndex + 1; row++) {
      for (const col of currencyCols) {
        ws.getRow(row).getCell(col).numFmt = '"$"#,##0.00';
      }
    }

    // ── Hoja de resumen patronal ──────────────────────────────────────────────
    const wsSummary = wb.addWorksheet("Resumen Patronal");

    wsSummary.mergeCells("A1:D1");
    const summTitle = wsSummary.getCell("A1");
    summTitle.value = `RESUMEN PATRONAL — ${MESES[planilla.mes]} ${planilla.anio}`;
    summTitle.font = { bold: true, size: 12 };
    summTitle.fill = { type: "pattern", pattern: "solid", fgColor: { argb: ORANGE } };
    summTitle.alignment = { horizontal: "center", vertical: "middle" };
    wsSummary.getRow(1).height = 26;

    wsSummary.addRow([]);

    const summData = [
      ["Concepto",                 "Empleado",                             "Patronal",                               "Total"],
      ["ISSS",                     fmt(planilla.totalISS),                  fmt(planilla.totalISSPatronal),            fmt(planilla.totalISS) + fmt(planilla.totalISSPatronal)],
      ["AFP",                      fmt(planilla.totalAFP),                  fmt(planilla.totalAFPPatronal),            fmt(planilla.totalAFP) + fmt(planilla.totalAFPPatronal)],
      ["INSAFORP",                 0,                                       fmt(planilla.totalINSAFORP),               fmt(planilla.totalINSAFORP)],
      ["ISR (Renta)",              fmt(planilla.totalRenta),                0,                                        fmt(planilla.totalRenta)],
      ["Total Bruto Devengado",    fmt(planilla.totalBruto),                "",                                       ""],
      ["Total Neto a Pagar",       fmt(planilla.totalNeto),                 "",                                       ""],
      ["Total Costo Empresa",      "",                                      fmt(planilla.totalISSPatronal) + fmt(planilla.totalAFPPatronal) + fmt(planilla.totalINSAFORP) + fmt(planilla.totalNeto), ""],
    ];

    summData.forEach((rowData, ri) => {
      const r = wsSummary.addRow(rowData);
      r.eachCell({ includeEmpty: true }, (cell) => {
        if (ri === 0) {
          cell.font = { bold: true, size: 10, color: { argb: "FFFFFFFF" } };
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: DARK } };
        } else {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: ri % 2 === 0 ? HEADER_BG : "FFFFFFFF" } };
          cell.numFmt = '"$"#,##0.00';
        }
        cell.alignment = { vertical: "middle", horizontal: ri === 0 ? "center" : "right" };
        cell.border = {
          top:    { style: "hair" as const },
          bottom: { style: "hair" as const },
          left:   { style: "hair" as const },
          right:  { style: "hair" as const },
        };
      });
      if (ri === 0) r.getCell(1).alignment = { horizontal: "left", vertical: "middle" };
      else r.getCell(1).alignment = { horizontal: "left", vertical: "middle" };
      r.height = 20;
    });

    wsSummary.columns = [
      { width: 28 },
      { width: 16 },
      { width: 16 },
      { width: 16 },
    ];

    // ── Generar buffer y respuesta ────────────────────────────────────────────
    const buffer = await wb.xlsx.writeBuffer();
    const filename = `planilla-${planilla.anio}-${String(planilla.mes).padStart(2, "0")}.xlsx`;

    return new Response(new Uint8Array(buffer as ArrayBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String((buffer as ArrayBuffer).byteLength),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
});
