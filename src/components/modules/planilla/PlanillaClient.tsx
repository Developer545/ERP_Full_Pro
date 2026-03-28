"use client";

import { useState } from "react";
import {
  Button,
  Tag,
  Tooltip,
  Space,
  Typography,
  Modal,
  Drawer,
  Table,
  Form,
  Select,
  InputNumber,
  Row,
  Col,
  Statistic,
  Card,
  Checkbox,
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  TeamOutlined,
  DollarOutlined,
  FileTextOutlined,
  BankOutlined,
  CalendarOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { PageHeader } from "@/components/ui/PageHeader";
import { KPICards, type KPIItem } from "@/components/ui/KPICards";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { ConfirmDelete } from "@/components/ui/ConfirmDelete";
import { FormSection } from "@/components/ui/FormSection";
import {
  usePlanillas,
  usePlanilla,
  useGenerarPlanilla,
  useCerrarPlanilla,
  useDeletePlanilla,
  useDescargarExcelPlanilla,
} from "@/hooks/queries/use-planilla";
import { CURRENCY } from "@/config/constants";
import { PALETTE, ICON_BG } from "@/config/palette";

const { Text } = Typography;

// ─── Tipos locales ────────────────────────────────────────────────────────────

interface PlanillaDetalleRow {
  id: string;
  planillaId: string;
  employeeId: string;
  employee: {
    firstName: string;
    lastName: string;
    cargo: string;
    dui?: string | null;
  };
  salarioBase: number | string;
  diasTrabajados: number;
  horasExtra: number | string;
  bonos: number | string;
  comisiones: number | string;
  otrosIngresos: number | string;
  totalBruto: number | string;
  descuentoISS: number | string;
  descuentoAFP: number | string;
  descuentoRenta: number | string;
  otrasDeduciones: number | string;
  totalDescuentos: number | string;
  salarioNeto: number | string;
  issPatronal: number | string;
  afpPatronal: number | string;
  insaforp: number | string;
}

interface PlanillaRow {
  id: string;
  tenantId: string;
  periodo: string;
  mes: number;
  anio: number;
  estado: "BORRADOR" | "CERRADA" | "PAGADA";
  empleadosCount: number;
  totalBruto: number | string;
  totalISS: number | string;
  totalAFP: number | string;
  totalRenta: number | string;
  totalDescuentos: number | string;
  totalNeto: number | string;
  totalISSPatronal: number | string;
  totalAFPPatronal: number | string;
  totalINSAFORP: number | string;
  createdAt: string;
  detalles?: PlanillaDetalleRow[];
}

// ─── Mapas de presentacion ───────────────────────────────────────────────────

const ESTADO_COLOR: Record<string, string> = {
  BORRADOR: "orange",
  CERRADA:  "green",
  PAGADA:   "blue",
};

const ESTADO_LABEL: Record<string, string> = {
  BORRADOR: "Borrador",
  CERRADA:  "Cerrada",
  PAGADA:   "Pagada",
};

const MESES = [
  { value: 1,  label: "Enero" },
  { value: 2,  label: "Febrero" },
  { value: 3,  label: "Marzo" },
  { value: 4,  label: "Abril" },
  { value: 5,  label: "Mayo" },
  { value: 6,  label: "Junio" },
  { value: 7,  label: "Julio" },
  { value: 8,  label: "Agosto" },
  { value: 9,  label: "Septiembre" },
  { value: 10, label: "Octubre" },
  { value: 11, label: "Noviembre" },
  { value: 12, label: "Diciembre" },
];

function getNombreMes(mes: number): string {
  return MESES.find((m) => m.value === mes)?.label ?? String(mes);
}

function formatCurrency(val: number | string): string {
  const num = Number(val);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: CURRENCY.CODE,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(isNaN(num) ? 0 : num);
}

// ─── Componente principal ─────────────────────────────────────────────────────

interface PlanillaClientProps {
  tenantSlug?: string;
}

/**
 * Componente principal del modulo de Planilla SV.
 * Incluye KPIs, tabla de planillas, modal de generacion y drawer de detalle.
 */
export function PlanillaClient({ tenantSlug: _tenantSlug }: PlanillaClientProps = {}) {
  // ── Estado modales ──
  const [generarOpen, setGenerarOpen]     = useState(false);
  const [deleteItem, setDeleteItem]       = useState<PlanillaRow | null>(null);
  const [detailId, setDetailId]           = useState<string | null>(null);
  const [cerrarItem, setCerrarItem]       = useState<PlanillaRow | null>(null);
  const [todosEmpleados, setTodosEmpleados] = useState(true);

  // ── Form generar ──
  const [form] = Form.useForm();

  // ── Queries ──
  const { data: planillasResponse, isLoading } = usePlanillas();
  const { data: planillaDetalle, isLoading: loadingDetalle } = usePlanilla(detailId);

  const generarMutation      = useGenerarPlanilla();
  const cerrarMutation       = useCerrarPlanilla();
  const deleteMutation       = useDeletePlanilla();
  const excelMutation        = useDescargarExcelPlanilla();

  const items: PlanillaRow[] = planillasResponse?.data ?? [];

  // ─── KPIs ────────────────────────────────────────────────────────────────

  const ultimaPlanilla = items[0] ?? null;
  const costoPatronal = ultimaPlanilla
    ? Number(ultimaPlanilla.totalISSPatronal) +
      Number(ultimaPlanilla.totalAFPPatronal) +
      Number(ultimaPlanilla.totalINSAFORP)
    : 0;

  const kpiItems: KPIItem[] = [
    {
      title: "Total Planillas",
      value: items.length,
      icon: <FileTextOutlined style={{ color: ICON_BG.info.color }} />,
      iconBg: ICON_BG.info.bg,
    },
    {
      title: "Neto Ultimo Periodo",
      value: ultimaPlanilla ? formatCurrency(ultimaPlanilla.totalNeto) : formatCurrency(0),
      icon: <DollarOutlined style={{ color: ICON_BG.success.color }} />,
      iconBg: ICON_BG.success.bg,
      description: ultimaPlanilla
        ? `${getNombreMes(ultimaPlanilla.mes)} ${ultimaPlanilla.anio}`
        : "Sin datos",
    },
    {
      title: "Costo Patronal",
      value: formatCurrency(costoPatronal),
      icon: <BankOutlined style={{ color: ICON_BG.orange.color }} />,
      iconBg: ICON_BG.orange.bg,
      description: ultimaPlanilla
        ? `ISSS + AFP + INSAFORP — ${getNombreMes(ultimaPlanilla.mes)} ${ultimaPlanilla.anio}`
        : "ISSS patronal + AFP + INSAFORP",
    },
    {
      title: "Empleados Procesados",
      value: ultimaPlanilla?.empleadosCount ?? 0,
      icon: <TeamOutlined style={{ color: ICON_BG.purple.color }} />,
      iconBg: ICON_BG.purple.bg,
      description: ultimaPlanilla
        ? `${getNombreMes(ultimaPlanilla.mes)} ${ultimaPlanilla.anio}`
        : "Sin datos",
    },
  ];

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleGenerar = () => {
    form.validateFields().then((values) => {
      generarMutation.mutate(
        { mes: values.mes, anio: values.anio },
        {
          onSuccess: () => {
            setGenerarOpen(false);
            form.resetFields();
            setTodosEmpleados(true);
          },
        }
      );
    });
  };

  const handleCerrar = () => {
    if (!cerrarItem) return;
    cerrarMutation.mutate(cerrarItem.id, {
      onSuccess: () => setCerrarItem(null),
    });
  };

  const handleDelete = () => {
    if (!deleteItem) return;
    deleteMutation.mutate(deleteItem.id, {
      onSuccess: () => setDeleteItem(null),
    });
  };

  const handleDescargarExcel = (row: PlanillaRow) => {
    excelMutation.mutate({ id: row.id, periodo: row.periodo });
  };

  // ─── Columnas tabla principal ──────────────────────────────────────────────

  const columns: DataTableColumn<PlanillaRow>[] = [
    {
      title: "Periodo",
      key: "periodo",
      width: 160,
      render: (_: unknown, row) => (
        <Space size={4}>
          <CalendarOutlined style={{ color: PALETTE.textSecondary }} />
          <Text strong>
            {getNombreMes(row.mes)} {row.anio}
          </Text>
        </Space>
      ),
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      width: 110,
      align: "center",
      render: (estado: string) => (
        <Tag color={ESTADO_COLOR[estado] ?? "default"}>
          {ESTADO_LABEL[estado] ?? estado}
        </Tag>
      ),
    },
    {
      title: "Empleados",
      dataIndex: "empleadosCount",
      key: "empleadosCount",
      width: 100,
      align: "center",
      render: (v: number) => <Text>{v}</Text>,
    },
    {
      title: "Total Devengado",
      dataIndex: "totalBruto",
      key: "totalBruto",
      width: 140,
      align: "right",
      render: (v: number) => <Text>{formatCurrency(v)}</Text>,
    },
    {
      title: "Total Descuentos",
      dataIndex: "totalDescuentos",
      key: "totalDescuentos",
      width: 140,
      align: "right",
      render: (v: number) => (
        <Text style={{ color: PALETTE.error }}>{formatCurrency(v)}</Text>
      ),
    },
    {
      title: "Neto a Pagar",
      dataIndex: "totalNeto",
      key: "totalNeto",
      width: 140,
      align: "right",
      render: (v: number) => (
        <Text strong style={{ color: PALETTE.success }}>
          {formatCurrency(v)}
        </Text>
      ),
    },
    {
      title: "Costo Patronal",
      key: "costoPatronal",
      width: 130,
      align: "right",
      render: (_: unknown, row) => {
        const total =
          Number(row.totalISSPatronal) +
          Number(row.totalAFPPatronal) +
          Number(row.totalINSAFORP);
        return <Text style={{ color: PALETTE.warning }}>{formatCurrency(total)}</Text>;
      },
    },
    {
      title: "Acciones",
      key: "actions",
      width: 150,
      align: "center",
      fixed: "right",
      render: (_: unknown, row) => (
        <Space size="small">
          <Tooltip title="Ver detalle">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => setDetailId(row.id)}
            />
          </Tooltip>
          <Tooltip title="Descargar Excel">
            <Button
              size="small"
              icon={<DownloadOutlined />}
              loading={excelMutation.isPending}
              onClick={() => handleDescargarExcel(row)}
            />
          </Tooltip>
          {row.estado === "BORRADOR" && (
            <Tooltip title="Cerrar planilla">
              <Button
                size="small"
                type="primary"
                ghost
                icon={<CheckCircleOutlined />}
                onClick={() => setCerrarItem(row)}
              />
            </Tooltip>
          )}
          {row.estado === "BORRADOR" && (
            <Tooltip title="Eliminar planilla">
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => setDeleteItem(row)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  // ─── Columnas drawer detalle ───────────────────────────────────────────────

  const detalleColumns = [
    {
      title: "Empleado",
      key: "empleado",
      width: 180,
      ellipsis: true,
      render: (_: unknown, row: PlanillaDetalleRow) => (
        <div>
          <Text strong style={{ display: "block", lineHeight: 1.3, fontSize: 12 }}>
            {row.employee.firstName} {row.employee.lastName}
          </Text>
          {row.employee.dui && (
            <Text type="secondary" style={{ fontSize: 10 }}>
              DUI: {row.employee.dui}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: "Cargo",
      key: "cargo",
      width: 130,
      ellipsis: true,
      render: (_: unknown, row: PlanillaDetalleRow) => (
        <Text style={{ fontSize: 11 }}>{row.employee.cargo}</Text>
      ),
    },
    {
      title: "Sal. Base",
      dataIndex: "salarioBase",
      key: "salarioBase",
      width: 100,
      align: "right" as const,
      render: (v: number) => (
        <Text style={{ fontSize: 11 }}>{formatCurrency(v)}</Text>
      ),
    },
    {
      title: "ISSS",
      dataIndex: "descuentoISS",
      key: "descuentoISS",
      width: 85,
      align: "right" as const,
      render: (v: number) => (
        <Text type="secondary" style={{ fontSize: 11 }}>
          {formatCurrency(v)}
        </Text>
      ),
    },
    {
      title: "AFP",
      dataIndex: "descuentoAFP",
      key: "descuentoAFP",
      width: 85,
      align: "right" as const,
      render: (v: number) => (
        <Text type="secondary" style={{ fontSize: 11 }}>
          {formatCurrency(v)}
        </Text>
      ),
    },
    {
      title: "ISR",
      dataIndex: "descuentoRenta",
      key: "descuentoRenta",
      width: 85,
      align: "right" as const,
      render: (v: number) => (
        <Text type="secondary" style={{ fontSize: 11 }}>
          {formatCurrency(v)}
        </Text>
      ),
    },
    {
      title: "Otros Desc.",
      dataIndex: "otrasDeduciones",
      key: "otrasDeduciones",
      width: 95,
      align: "right" as const,
      render: (v: number) => (
        <Text type="secondary" style={{ fontSize: 11 }}>
          {formatCurrency(v)}
        </Text>
      ),
    },
    {
      title: "Total Desc.",
      dataIndex: "totalDescuentos",
      key: "totalDescuentos",
      width: 100,
      align: "right" as const,
      render: (v: number) => (
        <Text style={{ fontSize: 11, color: PALETTE.error }}>
          {formatCurrency(v)}
        </Text>
      ),
    },
    {
      title: "Neto Pagar",
      dataIndex: "salarioNeto",
      key: "salarioNeto",
      width: 110,
      align: "right" as const,
      render: (v: number) => (
        <Text strong style={{ color: PALETTE.success }}>
          {formatCurrency(v)}
        </Text>
      ),
    },
    {
      title: "Costo Patronal",
      key: "costoPatronal",
      width: 115,
      align: "right" as const,
      render: (_: unknown, row: PlanillaDetalleRow) => {
        const total =
          Number(row.issPatronal) +
          Number(row.afpPatronal) +
          Number(row.insaforp);
        return (
          <Text style={{ fontSize: 11, color: PALETTE.warning }}>
            {formatCurrency(total)}
          </Text>
        );
      },
    },
    {
      title: "Boleta",
      key: "boleta",
      width: 65,
      align: "center" as const,
      render: (_: unknown, row: PlanillaDetalleRow) => (
        <Tooltip title="Descargar boleta PDF">
          <Button
            size="small"
            type="link"
            icon={<FileTextOutlined />}
            onClick={() => {
              if (detailId) {
                window.open(
                  `/api/v1/planilla/${detailId}/boleta/${row.employeeId}`,
                  "_blank"
                );
              }
            }}
          />
        </Tooltip>
      ),
    },
  ];

  // ─── Totales del drawer ────────────────────────────────────────────────────

  const detalles: PlanillaDetalleRow[] = planillaDetalle?.detalles ?? [];

  const totalBrutoDetalle      = detalles.reduce((a, d) => a + Number(d.totalBruto),      0);
  const totalDescuentosDetalle = detalles.reduce((a, d) => a + Number(d.totalDescuentos), 0);
  const totalNetoDetalle       = detalles.reduce((a, d) => a + Number(d.salarioNeto),     0);
  const totalPatronalDetalle   = detalles.reduce(
    (a, d) => a + Number(d.issPatronal) + Number(d.afpPatronal) + Number(d.insaforp),
    0
  );

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div>
      <PageHeader
        title="Planilla"
        subtitle="Planilla de sueldos y salarios El Salvador — ISSS, AFP, Renta, INSAFORP"
        actions={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setGenerarOpen(true)}
          >
            Generar Planilla
          </Button>
        }
      />

      {/* KPIs */}
      <div style={{ marginBottom: 16 }}>
        <KPICards items={kpiItems} loading={isLoading} />
      </div>

      {/* Tabla de planillas */}
      <DataTable<PlanillaRow>
        columns={columns}
        dataSource={items}
        rowKey="id"
        total={items.length}
        page={1}
        pageSize={items.length || 20}
        loading={isLoading}
        onPageChange={() => {}}
        onRefresh={() => {}}
        searchPlaceholder="Buscar por periodo..."
        emptyText="No hay planillas generadas"
        scrollX={1100}
      />

      {/* ── Modal Generar Planilla ─────────────────────────────────────────── */}
      <Modal
        title="Generar Nueva Planilla"
        open={generarOpen}
        onCancel={() => {
          setGenerarOpen(false);
          form.resetFields();
          setTodosEmpleados(true);
        }}
        onOk={handleGenerar}
        okText="Generar Planilla"
        cancelText="Cancelar"
        confirmLoading={generarMutation.isPending}
        width={500}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ anio: new Date().getFullYear() }}
          style={{ marginTop: 16 }}
        >
          <FormSection
            title="Periodo"
            icon={<CalendarOutlined />}
            color="blue"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Mes"
                  name="mes"
                  rules={[{ required: true, message: "Seleccione el mes" }]}
                >
                  <Select
                    placeholder="Seleccione el mes"
                    options={MESES}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                    }
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Año"
                  name="anio"
                  rules={[{ required: true, message: "Ingrese el año" }]}
                >
                  <InputNumber
                    min={2020}
                    max={2099}
                    style={{ width: "100%" }}
                    placeholder="Ej: 2026"
                  />
                </Form.Item>
              </Col>
            </Row>
          </FormSection>

          <FormSection
            title="Empleados"
            icon={<TeamOutlined />}
            color="green"
          >
            <Checkbox
              checked={todosEmpleados}
              onChange={(e) => setTodosEmpleados(e.target.checked)}
              style={{ marginBottom: 8 }}
            >
              Incluir todos los empleados activos
            </Checkbox>
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Se aplicaran automaticamente las deducciones de ley: ISSS (3%, tope $1,000),
                AFP (7.25%) e ISR segun tabla progresiva El Salvador 2024.
              </Text>
            </div>
          </FormSection>
        </Form>
      </Modal>

      {/* ── Drawer Detalle Planilla ────────────────────────────────────────── */}
      <Drawer
        title={
          planillaDetalle
            ? `Detalle Planilla — ${getNombreMes(planillaDetalle.mes)} ${planillaDetalle.anio}`
            : "Detalle Planilla"
        }
        open={!!detailId}
        onClose={() => setDetailId(null)}
        width={1200}
        extra={
          planillaDetalle ? (
            <Button
              icon={<DownloadOutlined />}
              loading={excelMutation.isPending}
              onClick={() =>
                planillaDetalle &&
                excelMutation.mutate({
                  id: planillaDetalle.id,
                  periodo: planillaDetalle.periodo,
                })
              }
            >
              Descargar Excel
            </Button>
          ) : null
        }
      >
        {/* Resumen en cards */}
        {planillaDetalle && (
          <Row gutter={12} style={{ marginBottom: 16 }}>
            {[
              {
                label: "Total Devengado",
                value: totalBrutoDetalle,
                color: PALETTE.info,
              },
              {
                label: "Total Descuentos",
                value: totalDescuentosDetalle,
                color: PALETTE.error,
              },
              {
                label: "Neto a Pagar",
                value: totalNetoDetalle,
                color: PALETTE.success,
              },
              {
                label: "Costo Patronal",
                value: totalPatronalDetalle,
                color: PALETTE.warning,
              },
            ].map(({ label, value, color }) => (
              <Col key={label} xs={24} sm={12} md={6}>
                <Card
                  size="small"
                  style={{
                    borderRadius: 8,
                    borderTop: `3px solid ${color}`,
                  }}
                >
                  <Statistic
                    title={
                      <Text style={{ fontSize: 11, color: PALETTE.textSecondary }}>
                        {label}
                      </Text>
                    }
                    value={formatCurrency(value)}
                    valueStyle={{ fontSize: 16, fontWeight: 600, color }}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* Tabla de empleados */}
        <Table<PlanillaDetalleRow>
          dataSource={detalles}
          columns={detalleColumns}
          rowKey="id"
          size="small"
          loading={loadingDetalle}
          pagination={false}
          scroll={{ x: 1050 }}
          locale={{ emptyText: "Sin detalles de empleados" }}
          summary={() =>
            detalles.length > 0 ? (
              <Table.Summary.Row
                style={{ background: PALETTE.infoLight, fontWeight: 600 }}
              >
                <Table.Summary.Cell index={0} colSpan={2}>
                  <Text strong style={{ fontSize: 11 }}>
                    Totales ({detalles.length} empleados)
                  </Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2} align="right">
                  {/* Sal. Base — skip */}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3} align="right">
                  {/* ISSS */}
                  <Text style={{ fontSize: 11, color: PALETTE.textSecondary }}>
                    {formatCurrency(detalles.reduce((a, d) => a + Number(d.descuentoISS), 0))}
                  </Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4} align="right">
                  <Text style={{ fontSize: 11, color: PALETTE.textSecondary }}>
                    {formatCurrency(detalles.reduce((a, d) => a + Number(d.descuentoAFP), 0))}
                  </Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={5} align="right">
                  <Text style={{ fontSize: 11, color: PALETTE.textSecondary }}>
                    {formatCurrency(detalles.reduce((a, d) => a + Number(d.descuentoRenta), 0))}
                  </Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={6} align="right">
                  <Text style={{ fontSize: 11, color: PALETTE.textSecondary }}>
                    {formatCurrency(detalles.reduce((a, d) => a + Number(d.otrasDeduciones), 0))}
                  </Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={7} align="right">
                  <Text strong style={{ fontSize: 11, color: PALETTE.error }}>
                    {formatCurrency(totalDescuentosDetalle)}
                  </Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={8} align="right">
                  <Text strong style={{ fontSize: 11, color: PALETTE.success }}>
                    {formatCurrency(totalNetoDetalle)}
                  </Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={9} align="right">
                  <Text strong style={{ fontSize: 11, color: PALETTE.warning }}>
                    {formatCurrency(totalPatronalDetalle)}
                  </Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={10} />
              </Table.Summary.Row>
            ) : null
          }
        />
      </Drawer>

      {/* ── Modal Confirmar Cerrar ─────────────────────────────────────────── */}
      <Modal
        title="Cerrar Planilla"
        open={!!cerrarItem}
        onCancel={() => setCerrarItem(null)}
        onOk={handleCerrar}
        okText="Confirmar Cierre"
        cancelText="Cancelar"
        confirmLoading={cerrarMutation.isPending}
      >
        <Text>
          ¿Confirma el cierre de la planilla de{" "}
          <Text strong>
            {cerrarItem
              ? `${getNombreMes(cerrarItem.mes)} ${cerrarItem.anio}`
              : ""}
          </Text>
          ? Una vez cerrada no podra ser modificada ni eliminada.
        </Text>
      </Modal>

      {/* ── Modal Eliminar Planilla ────────────────────────────────────────── */}
      <ConfirmDelete
        open={!!deleteItem}
        name={`la planilla de ${
          deleteItem
            ? `${getNombreMes(deleteItem.mes)} ${deleteItem.anio}`
            : ""
        }`}
        entityType="planilla"
        onConfirm={handleDelete}
        onCancel={() => setDeleteItem(null)}
        loading={deleteMutation.isPending}
        message="Esta accion eliminara la planilla permanentemente. Solo aplica a planillas en estado Borrador."
      />
    </div>
  );
}
