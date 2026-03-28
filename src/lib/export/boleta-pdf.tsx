import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { APP_NAME } from "@/config/constants";

// ─── Estilos ─────────────────────────────────────────────────────────────────

const PRIMARY = "#ea580c";
const GRAY_LIGHT = "#f5f5f5";
const GRAY_MED = "#e0e0e0";
const GRAY_DARK = "#555555";
const BLACK = "#222222";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: BLACK,
    paddingTop: 32,
    paddingBottom: 40,
    paddingHorizontal: 36,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: PRIMARY,
  },
  headerLeft: {
    flexDirection: "column",
    gap: 2,
  },
  appName: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: PRIMARY,
  },
  empresa: {
    fontSize: 10,
    color: GRAY_DARK,
  },
  headerRight: {
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 3,
  },
  boletaTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: PRIMARY,
    textTransform: "uppercase",
  },
  periodoText: {
    fontSize: 9,
    color: GRAY_DARK,
  },

  // Seccion empleado
  sectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    backgroundColor: PRIMARY,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 0,
    textTransform: "uppercase",
  },
  empleadoBox: {
    backgroundColor: GRAY_LIGHT,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: GRAY_MED,
  },
  empleadoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  empleadoField: {
    width: "48%",
    flexDirection: "row",
    gap: 4,
  },
  fieldLabel: {
    fontSize: 8,
    color: GRAY_DARK,
    fontFamily: "Helvetica-Bold",
  },
  fieldValue: {
    fontSize: 8,
    color: BLACK,
  },

  // Tablas devengos / deducciones
  tablesRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  tableWrapper: {
    flex: 1,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: PRIMARY,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tableHeaderText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: GRAY_MED,
  },
  tableRowAlt: {
    backgroundColor: GRAY_LIGHT,
  },
  tableRowLabel: {
    fontSize: 8,
    color: BLACK,
  },
  tableRowValue: {
    fontSize: 8,
    color: BLACK,
    fontFamily: "Helvetica-Bold",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#222222",
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 1,
  },
  totalRowLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    textTransform: "uppercase",
  },
  totalRowValue: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
  },

  // Caja neto
  netoBox: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
    borderRadius: 3,
  },
  netoLabel: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    textTransform: "uppercase",
  },
  netoValue: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
  },

  // Footer
  footer: {
    marginTop: "auto",
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: GRAY_MED,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  footerNote: {
    fontSize: 7,
    color: GRAY_DARK,
    maxWidth: "55%",
  },
  firmaBox: {
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
  },
  firmaLine: {
    width: 160,
    borderBottomWidth: 1,
    borderBottomColor: BLACK,
  },
  firmaLabel: {
    fontSize: 7,
    color: GRAY_DARK,
  },
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(value: number): string {
  return `$${value.toFixed(2)}`;
}

function monthName(mes: number): string {
  const MESES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];
  return MESES[mes - 1] ?? String(mes);
}

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface BoletaPDFData {
  /** Nombre de la empresa */
  empresaNombre: string;

  // Periodo
  mes: number;   // 1-12
  anio: number;

  // Empleado
  empleadoNombre: string;
  dui?: string | null;
  cargo: string;
  fechaIngreso: string; // ya formateada: "01/01/2022"

  // Devengos
  salarioBase: number;
  horasExtra: number;
  bonos: number;
  comisiones: number;
  otrosIngresos: number;
  totalBruto: number;

  // Deducciones
  descuentoISS: number;
  descuentoAFP: number;
  descuentoRenta: number;
  otrasDeduciones: number;
  totalDescuentos: number;

  // Neto
  salarioNeto: number;
}

// ─── Componente PDF ───────────────────────────────────────────────────────────

interface BoletaPDFProps {
  data: BoletaPDFData;
}

/**
 * Componente React PDF para boleta de pago de planilla.
 * Se renderiza del lado del servidor con @react-pdf/renderer.
 */
export function BoletaPDF({ data }: BoletaPDFProps) {
  const periodo = `${monthName(data.mes)} ${data.anio}`;

  const devengos: Array<{ label: string; value: number }> = [
    { label: "Salario base", value: data.salarioBase },
    { label: "Horas extra", value: data.horasExtra },
    { label: "Bonos", value: data.bonos },
    { label: "Comisiones", value: data.comisiones },
    { label: "Otros ingresos", value: data.otrosIngresos },
  ];

  const deducciones: Array<{ label: string; value: number }> = [
    { label: "ISSS (3%)", value: data.descuentoISS },
    { label: "AFP (7.25%)", value: data.descuentoAFP },
    { label: "ISR / Renta", value: data.descuentoRenta },
    { label: "Otras deducciones", value: data.otrasDeduciones },
  ];

  return (
    <Document
      title={`Boleta de Pago — ${data.empleadoNombre} — ${periodo}`}
      author={data.empresaNombre}
      creator={APP_NAME}
    >
      <Page size="A4" style={styles.page}>

        {/* ─── Header ─── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.appName}>{data.empresaNombre}</Text>
            <Text style={styles.empresa}>Sistema ERP Full Pro</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.boletaTitle}>Boleta de Pago</Text>
            <Text style={styles.periodoText}>Periodo: {periodo}</Text>
          </View>
        </View>

        {/* ─── Datos empleado ─── */}
        <Text style={styles.sectionTitle}>Datos del Empleado</Text>
        <View style={styles.empleadoBox}>
          <View style={styles.empleadoGrid}>
            <View style={styles.empleadoField}>
              <Text style={styles.fieldLabel}>Nombre:</Text>
              <Text style={styles.fieldValue}>{data.empleadoNombre}</Text>
            </View>
            <View style={styles.empleadoField}>
              <Text style={styles.fieldLabel}>DUI:</Text>
              <Text style={styles.fieldValue}>{data.dui ?? "—"}</Text>
            </View>
            <View style={styles.empleadoField}>
              <Text style={styles.fieldLabel}>Cargo:</Text>
              <Text style={styles.fieldValue}>{data.cargo}</Text>
            </View>
            <View style={styles.empleadoField}>
              <Text style={styles.fieldLabel}>Fecha de Ingreso:</Text>
              <Text style={styles.fieldValue}>{data.fechaIngreso}</Text>
            </View>
          </View>
        </View>

        {/* ─── Tablas devengos y deducciones ─── */}
        <View style={styles.tablesRow}>

          {/* Devengos */}
          <View style={styles.tableWrapper}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>Concepto (Devengos)</Text>
              <Text style={styles.tableHeaderText}>Monto</Text>
            </View>
            {devengos.map((item, i) => (
              <View
                key={item.label}
                style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}
              >
                <Text style={styles.tableRowLabel}>{item.label}</Text>
                <Text style={styles.tableRowValue}>{fmt(item.value)}</Text>
              </View>
            ))}
            <View style={styles.totalRow}>
              <Text style={styles.totalRowLabel}>Total Bruto</Text>
              <Text style={styles.totalRowValue}>{fmt(data.totalBruto)}</Text>
            </View>
          </View>

          {/* Deducciones */}
          <View style={styles.tableWrapper}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>Concepto (Deducciones)</Text>
              <Text style={styles.tableHeaderText}>Monto</Text>
            </View>
            {deducciones.map((item, i) => (
              <View
                key={item.label}
                style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}
              >
                <Text style={styles.tableRowLabel}>{item.label}</Text>
                <Text style={styles.tableRowValue}>{fmt(item.value)}</Text>
              </View>
            ))}
            <View style={styles.totalRow}>
              <Text style={styles.totalRowLabel}>Total Descuentos</Text>
              <Text style={styles.totalRowValue}>{fmt(data.totalDescuentos)}</Text>
            </View>
          </View>

        </View>

        {/* ─── Salario neto ─── */}
        <View style={styles.netoBox}>
          <Text style={styles.netoLabel}>Salario Neto a Recibir</Text>
          <Text style={styles.netoValue}>{fmt(data.salarioNeto)}</Text>
        </View>

        {/* ─── Footer ─── */}
        <View style={styles.footer}>
          <Text style={styles.footerNote}>
            Este documento es un comprobante oficial de pago correspondiente al
            periodo {periodo}. Conserve este documento para sus registros.
          </Text>
          <View style={styles.firmaBox}>
            <View style={styles.firmaLine} />
            <Text style={styles.firmaLabel}>Firma del Empleado</Text>
          </View>
        </View>

      </Page>
    </Document>
  );
}
