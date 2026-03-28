import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { handleApiError } from "@/lib/errors/error-handler";
import { CuentaService } from "@/modules/contabilidad/cuenta.service";
import ExcelJS from "exceljs";

/** POST — importar desde JSON directo (array de cuentas) */
export const POST = withApi(async (req) => {
  try {
    const contentType = req.headers.get("content-type") ?? "";

    // Modo A: multipart/form-data (archivo Excel)
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json(
          { error: { code: "ARCHIVO_REQUERIDO", message: "Se requiere un archivo Excel" } },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const wb = new ExcelJS.Workbook();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await wb.xlsx.load(Buffer.from(arrayBuffer) as any);
      const ws = wb.worksheets[0];

      const rows: Array<Record<string, unknown>> = [];
      const headers: string[] = [];

      ws.eachRow((row, rowIndex) => {
        if (rowIndex === 1) {
          row.eachCell((cell) => headers.push(String(cell.value ?? "").toLowerCase().trim()));
          return;
        }
        const obj: Record<string, unknown> = {};
        row.eachCell((cell, colIndex) => {
          obj[headers[colIndex - 1]] = cell.value;
        });
        rows.push(obj);
      });

      const mapped = rows.map((r) => ({
        codigo: String(r.codigo ?? ""),
        nombre: String(r.nombre ?? ""),
        tipo: String(r.tipo ?? ""),
        naturaleza: String(r.naturaleza ?? ""),
        nivel: Number(r.nivel ?? 1),
        permiteMovimiento: String(r.permitir_movimiento ?? r.permitemoviimiento ?? r.movimiento ?? "SI").toUpperCase() !== "NO",
      }));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const resultado = await CuentaService.importarCatalogo(mapped as any[]);
      return NextResponse.json({ data: resultado });
    }

    // Modo B: JSON directo
    const body = await req.json();
    const { rows } = body as { rows: unknown[] };
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { error: { code: "FILAS_REQUERIDAS", message: "Se requiere un array de cuentas a importar" } },
        { status: 400 }
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resultado = await CuentaService.importarCatalogo(rows as any[]);
    return NextResponse.json({ data: resultado });
  } catch (error) {
    return handleApiError(error);
  }
});

/** GET — descargar plantilla Excel */
export const GET = withApi(async () => {
  try {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Cuentas");

    ws.columns = [
      { header: "codigo", key: "codigo", width: 15 },
      { header: "nombre", key: "nombre", width: 40 },
      { header: "tipo", key: "tipo", width: 15 },
      { header: "naturaleza", key: "naturaleza", width: 15 },
      { header: "nivel", key: "nivel", width: 8 },
      { header: "movimiento", key: "movimiento", width: 15 },
    ];

    // Fila de ejemplo
    ws.addRow({ codigo: "110101", nombre: "Caja General", tipo: "ACTIVO", naturaleza: "DEUDORA", nivel: 4, movimiento: "SI" });
    ws.addRow({ codigo: "210101", nombre: "Proveedores Nacionales", tipo: "PASIVO", naturaleza: "ACREEDORA", nivel: 4, movimiento: "SI" });

    // Nota de tipos válidos
    ws.addRow({});
    ws.addRow({ codigo: "Tipos válidos:", nombre: "ACTIVO | PASIVO | CAPITAL | INGRESO | COSTO | GASTO" });
    ws.addRow({ codigo: "Naturaleza:", nombre: "DEUDORA | ACREEDORA" });
    ws.addRow({ codigo: "Movimiento:", nombre: "SI = acepta asientos, NO = solo agrupadora" });

    const buffer = await wb.xlsx.writeBuffer();

    return new Response(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="plantilla_catalogo_cuentas.xlsx"',
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
});
