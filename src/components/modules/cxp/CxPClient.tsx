"use client";

import { useState } from "react";
import {
  Tag,
  Space,
  Typography,
  Select,
  Button,
  Modal,
  Form,
  InputNumber,
  Input,
  Tooltip,
  DatePicker,
  Drawer,
  Table,
  Popconfirm,
} from "antd";
import {
  DollarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CalendarOutlined,
  EyeOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { KPICards } from "@/components/ui/KPICards";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  useCxP,
  useCxPById,
  useCxPResumen,
  useCreateCxP,
  useRegistrarPagoCxP,
  useDeleteCxP,
} from "@/hooks/queries/use-cxp";
import { useProveedores } from "@/hooks/queries/use-proveedores";
import { CURRENCY } from "@/config/constants";
import dayjs from "dayjs";
import type { CxPRow } from "@/modules/cxp/cxp.types";

const { Text } = Typography;
const { RangePicker } = DatePicker;

/** Labels y colores para cada status de CxP */
const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  PARTIAL: "Parcial",
  PAID: "Pagado",
  OVERDUE: "Vencido",
  CANCELLED: "Cancelado",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "blue",
  PARTIAL: "orange",
  PAID: "green",
  OVERDUE: "red",
  CANCELLED: "default",
};

/** Labels para metodos de pago */
const PAYMENT_METHOD_OPTIONS = [
  { value: "CASH", label: "Efectivo" },
  { value: "CARD", label: "Tarjeta" },
  { value: "TRANSFER", label: "Transferencia" },
  { value: "CHECK", label: "Cheque" },
  { value: "CREDIT", label: "Credito" },
  { value: "MIXED", label: "Mixto" },
];

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: "Efectivo",
  CARD: "Tarjeta",
  TRANSFER: "Transferencia",
  CHECK: "Cheque",
  CREDIT: "Credito",
  MIXED: "Mixto",
};

/**
 * Componente principal del modulo de Cuentas por Pagar (CxP).
 */
export function CxPClient() {
  // ─── Estado de filtros ────────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [supplierFilter, setSupplierFilter] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<[string, string] | undefined>();

  // ─── Estado modales ───────────────────────────────────────────────────────
  const [pagoOpen, setPagoOpen] = useState(false);
  const [nuevaCxPOpen, setNuevaCxPOpen] = useState(false);
  const [detalleOpen, setDetalleOpen] = useState(false);
  const [cxpSeleccionada, setCxpSeleccionada] = useState<CxPRow | null>(null);
  const [cxpDetalleId, setCxpDetalleId] = useState<string | null>(null);

  const [pagoForm] = Form.useForm();
  const [nuevaCxPForm] = Form.useForm();

  // ─── Datos ────────────────────────────────────────────────────────────────
  const { data: cxpData, isLoading, refetch } = useCxP({
    status: statusFilter,
    supplierId: supplierFilter,
    from: dateRange?.[0],
    to: dateRange?.[1],
    page,
    pageSize,
  });

  const { data: resumen, isLoading: resumenLoading } = useCxPResumen();
  const { data: proveedoresData } = useProveedores({ pageSize: 200 });
  const { data: cxpDetalle } = useCxPById(cxpDetalleId);

  const registrarPagoMutation = useRegistrarPagoCxP();
  const createCxPMutation = useCreateCxP();
  const deleteCxPMutation = useDeleteCxP();

  const items: CxPRow[] = cxpData?.data ?? [];
  const total: number = cxpData?.meta?.total ?? 0;
  const proveedores = proveedoresData?.data ?? [];

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const formatCurrency = (val: number | string) =>
    `${CURRENCY.SYMBOL}${Number(val).toFixed(2)}`;

  const isVencido = (row: CxPRow) =>
    row.status !== "PAID" &&
    row.status !== "CANCELLED" &&
    dayjs(row.fechaVencimiento).isBefore(dayjs(), "day");

  // ─── Handlers pago ────────────────────────────────────────────────────────

  const abrirModalPago = (row: CxPRow) => {
    setCxpSeleccionada(row);
    pagoForm.resetFields();
    setPagoOpen(true);
  };

  const handlePago = async () => {
    if (!cxpSeleccionada) return;
    try {
      const values = await pagoForm.validateFields();
      registrarPagoMutation.mutate(
        { id: cxpSeleccionada.id, data: values },
        {
          onSuccess: () => {
            setPagoOpen(false);
            setCxpSeleccionada(null);
          },
        }
      );
    } catch {
      // Validacion fallo
    }
  };

  // ─── Handler nueva CxP ────────────────────────────────────────────────────

  const handleCrearCxP = async () => {
    try {
      const values = await nuevaCxPForm.validateFields();
      const data = {
        ...values,
        fechaEmision: values.fechaEmision
          ? dayjs(values.fechaEmision).toISOString()
          : undefined,
        fechaVencimiento: dayjs(values.fechaVencimiento).toISOString(),
      };
      createCxPMutation.mutate(data, {
        onSuccess: () => {
          setNuevaCxPOpen(false);
          nuevaCxPForm.resetFields();
        },
      });
    } catch {
      // Validacion fallo
    }
  };

  // ─── Handler ver detalle ──────────────────────────────────────────────────

  const abrirDetalle = (row: CxPRow) => {
    setCxpDetalleId(row.id);
    setDetalleOpen(true);
  };

  // ─── KPI Cards ────────────────────────────────────────────────────────────

  const kpiItems = [
    {
      title: "Total Pendiente",
      value: formatCurrency(resumen?.totalPendiente ?? 0),
      icon: <ClockCircleOutlined style={{ color: "#1677ff" }} />,
      iconBg: "#e6f4ff",
    },
    {
      title: "Vencidas",
      value: formatCurrency(resumen?.totalVencido ?? 0),
      icon: <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />,
      iconBg: "#fff2f0",
    },
    {
      title: "Pagado este Mes",
      value: formatCurrency(resumen?.pagosEsteMes ?? 0),
      icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
      iconBg: "#f6ffed",
    },
    {
      title: "Proximas a Vencer (7 dias)",
      value: String(resumen?.cantidadPendiente ?? 0),
      icon: <CalendarOutlined style={{ color: "#fa8c16" }} />,
      iconBg: "#fff7e6",
    },
  ];

  // ─── Columnas ─────────────────────────────────────────────────────────────

  const columns: DataTableColumn<CxPRow>[] = [
    {
      title: "Proveedor",
      key: "supplier",
      ellipsis: true,
      render: (_: unknown, row) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ fontSize: 13 }}>
            {row.supplier.name}
          </Text>
          {row.supplier.nit && (
            <Text type="secondary" style={{ fontSize: 11 }}>
              NIT: {row.supplier.nit}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: "Documento",
      dataIndex: "documento",
      key: "documento",
      width: 140,
      render: (documento: string) => (
        <Text code style={{ fontSize: 11 }}>
          {documento}
        </Text>
      ),
    },
    {
      title: "Descripcion",
      dataIndex: "descripcion",
      key: "descripcion",
      ellipsis: true,
      render: (desc: string | null) => (
        <Text type={desc ? undefined : "secondary"}>{desc ?? "—"}</Text>
      ),
    },
    {
      title: "Monto Total",
      dataIndex: "montoTotal",
      key: "montoTotal",
      width: 110,
      align: "right",
      render: (montoTotal: number) => (
        <Text strong>{formatCurrency(montoTotal)}</Text>
      ),
    },
    {
      title: "Pagado",
      dataIndex: "montoPagado",
      key: "montoPagado",
      width: 100,
      align: "right",
      render: (montoPagado: number) => (
        <Text style={{ color: "#52c41a" }}>{formatCurrency(montoPagado)}</Text>
      ),
    },
    {
      title: "Pendiente",
      dataIndex: "montoPendiente",
      key: "montoPendiente",
      width: 100,
      align: "right",
      render: (montoPendiente: number) => (
        <Text strong style={{ color: Number(montoPendiente) > 0 ? "#ff4d4f" : "#52c41a" }}>
          {formatCurrency(montoPendiente)}
        </Text>
      ),
    },
    {
      title: "Vencimiento",
      dataIndex: "fechaVencimiento",
      key: "fechaVencimiento",
      width: 120,
      render: (date: string, row) => {
        const vencido = isVencido(row);
        return (
          <Text style={{ color: vencido ? "#ff4d4f" : undefined }}>
            {dayjs(date).format("DD/MM/YYYY")}
          </Text>
        );
      },
    },
    {
      title: "Estado",
      dataIndex: "status",
      key: "status",
      width: 100,
      align: "center",
      render: (status: string) => (
        <Tag color={STATUS_COLORS[status] ?? "default"}>
          {STATUS_LABELS[status] ?? status}
        </Tag>
      ),
    },
    {
      title: "Acciones",
      key: "actions",
      width: 140,
      align: "center",
      fixed: "right",
      render: (_: unknown, row) => (
        <Space size={4}>
          <Tooltip title="Ver Pagos">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => abrirDetalle(row)}
            />
          </Tooltip>
          <Tooltip title="Registrar Pago">
            <Button
              size="small"
              type="primary"
              icon={<DollarOutlined />}
              disabled={row.status === "PAID" || row.status === "CANCELLED"}
              onClick={() => abrirModalPago(row)}
            >
              Pagar
            </Button>
          </Tooltip>
          <Tooltip title="Eliminar">
            <Popconfirm
              title="Eliminar cuenta"
              description="¿Seguro que deseas eliminar esta cuenta por pagar?"
              onConfirm={() => deleteCxPMutation.mutate(row.id)}
              okText="Eliminar"
              cancelText="Cancelar"
              okButtonProps={{ danger: true }}
            >
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                disabled={row.status === "PAID" || row.status === "PARTIAL"}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // ─── Columnas pagos del drawer ────────────────────────────────────────────

  const pagosColumns = [
    {
      title: "Fecha",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Monto",
      dataIndex: "amount",
      key: "amount",
      width: 100,
      align: "right" as const,
      render: (amount: number) => (
        <Text strong style={{ color: "#52c41a" }}>
          {formatCurrency(amount)}
        </Text>
      ),
    },
    {
      title: "Metodo",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      width: 110,
      render: (method: string) => PAYMENT_METHOD_LABELS[method] ?? method,
    },
    {
      title: "Referencia",
      dataIndex: "reference",
      key: "reference",
      render: (ref: string | null) => ref ?? "—",
    },
  ];

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div>
      <PageHeader
        title="Cuentas por Pagar"
        subtitle="Seguimiento de obligaciones de pago con proveedores"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setNuevaCxPOpen(true)}
          >
            Nueva Cuenta
          </Button>
        }
      />

      {/* KPI Cards */}
      <div style={{ marginBottom: 24 }}>
        <KPICards
          items={kpiItems}
          loading={resumenLoading}
          cols={{ xs: 24, sm: 12, lg: 6 }}
        />
      </div>

      {/* Tabla principal */}
      <DataTable<CxPRow>
        columns={columns}
        dataSource={items}
        rowKey="id"
        total={total}
        page={page}
        pageSize={pageSize}
        loading={isLoading}
        onPageChange={(p, ps) => { setPage(p); setPageSize(ps); }}
        onRefresh={() => refetch()}
        searchPlaceholder="Buscar proveedor o documento..."
        emptyText="No hay cuentas por pagar registradas"
        filterSlot={
          <Space wrap>
            <Select
              placeholder="Estado"
              allowClear
              style={{ width: 130 }}
              value={statusFilter}
              onChange={(v) => { setStatusFilter(v); setPage(1); }}
              options={Object.entries(STATUS_LABELS).map(([k, v]) => ({
                value: k,
                label: v,
              }))}
            />
            <Select
              placeholder="Proveedor"
              allowClear
              showSearch
              style={{ width: 220 }}
              value={supplierFilter}
              onChange={(v) => { setSupplierFilter(v); setPage(1); }}
              filterOption={(input, option) =>
                (option?.label as string)
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={proveedores.map((p: { id: string; name: string }) => ({
                value: p.id,
                label: p.name,
              }))}
            />
            <RangePicker
              format="DD/MM/YYYY"
              placeholder={["Desde", "Hasta"]}
              onChange={(_, dateStrings) => {
                if (dateStrings[0] && dateStrings[1]) {
                  setDateRange([dateStrings[0], dateStrings[1]]);
                } else {
                  setDateRange(undefined);
                }
                setPage(1);
              }}
            />
          </Space>
        }
        scrollX={1200}
      />

      {/* Modal Registrar Pago */}
      <Modal
        title={`Registrar Pago — ${cxpSeleccionada?.supplier.name ?? ""}`}
        open={pagoOpen}
        onOk={handlePago}
        onCancel={() => {
          setPagoOpen(false);
          setCxpSeleccionada(null);
          pagoForm.resetFields();
        }}
        confirmLoading={registrarPagoMutation.isPending}
        okText="Registrar Pago"
        cancelText="Cancelar"
        width={460}
        destroyOnClose
      >
        {cxpSeleccionada && (
          <div style={{ marginBottom: 16 }}>
            <Space direction="vertical" size={2}>
              <Text type="secondary">
                Documento:{" "}
                <Text strong>{cxpSeleccionada.documento}</Text>
              </Text>
              <Text type="secondary">
                Saldo pendiente:{" "}
                <Text strong style={{ color: "#ff4d4f" }}>
                  {formatCurrency(cxpSeleccionada.montoPendiente)}
                </Text>
              </Text>
              <Text type="secondary">
                Vencimiento:{" "}
                <Text>{dayjs(cxpSeleccionada.fechaVencimiento).format("DD/MM/YYYY")}</Text>
              </Text>
            </Space>
          </div>
        )}

        <Form form={pagoForm} layout="vertical">
          <Form.Item
            name="amount"
            label="Monto a pagar"
            rules={[
              { required: true, message: "Ingresa el monto" },
              {
                type: "number",
                min: 0.01,
                max: cxpSeleccionada ? Number(cxpSeleccionada.montoPendiente) : undefined,
                message: `El monto debe ser entre $0.01 y ${formatCurrency(cxpSeleccionada?.montoPendiente ?? 0)}`,
              },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={0.01}
              max={Number(cxpSeleccionada?.montoPendiente ?? 0)}
              precision={2}
              prefix="$"
              placeholder="0.00"
            />
          </Form.Item>

          <Form.Item
            name="paymentMethod"
            label="Metodo de pago"
            rules={[{ required: true, message: "Selecciona el metodo de pago" }]}
            initialValue="CASH"
          >
            <Select options={PAYMENT_METHOD_OPTIONS} />
          </Form.Item>

          <Form.Item name="reference" label="Referencia (N. cheque, transferencia, etc.)">
            <Input placeholder="Opcional" maxLength={100} />
          </Form.Item>

          <Form.Item name="notes" label="Notas">
            <Input.TextArea
              rows={2}
              placeholder="Notas adicionales (opcional)"
              maxLength={500}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Nueva Cuenta por Pagar */}
      <Modal
        title="Nueva Cuenta por Pagar"
        open={nuevaCxPOpen}
        onOk={handleCrearCxP}
        onCancel={() => {
          setNuevaCxPOpen(false);
          nuevaCxPForm.resetFields();
        }}
        confirmLoading={createCxPMutation.isPending}
        okText="Crear Cuenta"
        cancelText="Cancelar"
        width={560}
        destroyOnClose
      >
        <Form form={nuevaCxPForm} layout="vertical">
          <Form.Item
            name="supplierId"
            label="Proveedor"
            rules={[{ required: true, message: "Selecciona el proveedor" }]}
          >
            <Select
              showSearch
              placeholder="Seleccionar proveedor"
              filterOption={(input, option) =>
                (option?.label as string)
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={proveedores.map((p: { id: string; name: string }) => ({
                value: p.id,
                label: p.name,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="documento"
            label="Documento (N. factura del proveedor)"
            rules={[{ required: true, message: "Ingresa el numero de documento" }]}
          >
            <Input placeholder="Ej: FAC-001234" maxLength={100} />
          </Form.Item>

          <Form.Item name="descripcion" label="Descripcion">
            <Input.TextArea rows={2} placeholder="Descripcion del gasto (opcional)" maxLength={500} />
          </Form.Item>

          <Form.Item
            name="montoTotal"
            label="Monto Total"
            rules={[
              { required: true, message: "Ingresa el monto total" },
              { type: "number", min: 0.01, message: "El monto debe ser mayor a 0" },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={0.01}
              precision={2}
              prefix="$"
              placeholder="0.00"
            />
          </Form.Item>

          <Space style={{ width: "100%" }} size={12}>
            <Form.Item
              name="fechaEmision"
              label="Fecha de Emision"
              style={{ flex: 1 }}
            >
              <DatePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                placeholder="Fecha factura"
              />
            </Form.Item>

            <Form.Item
              name="fechaVencimiento"
              label="Fecha de Vencimiento"
              style={{ flex: 1 }}
              rules={[{ required: true, message: "Ingresa la fecha de vencimiento" }]}
            >
              <DatePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                placeholder="Fecha vencimiento"
              />
            </Form.Item>
          </Space>

          <Form.Item name="notes" label="Notas">
            <Input.TextArea rows={2} placeholder="Notas adicionales (opcional)" maxLength={500} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Drawer Detalle / Historial de Pagos */}
      <Drawer
        title={
          cxpDetalle
            ? `Pagos — ${cxpDetalle.supplier?.name ?? ""}`
            : "Historial de Pagos"
        }
        open={detalleOpen}
        onClose={() => {
          setDetalleOpen(false);
          setCxpDetalleId(null);
        }}
        width={560}
      >
        {cxpDetalle && (
          <>
            <Space direction="vertical" size={4} style={{ marginBottom: 16 }}>
              <Text type="secondary">
                Documento: <Text strong>{cxpDetalle.documento}</Text>
              </Text>
              <Text type="secondary">
                Monto Total:{" "}
                <Text strong>{formatCurrency(cxpDetalle.montoTotal)}</Text>
              </Text>
              <Text type="secondary">
                Pagado:{" "}
                <Text strong style={{ color: "#52c41a" }}>
                  {formatCurrency(cxpDetalle.montoPagado)}
                </Text>
              </Text>
              <Text type="secondary">
                Pendiente:{" "}
                <Text strong style={{ color: "#ff4d4f" }}>
                  {formatCurrency(cxpDetalle.montoPendiente)}
                </Text>
              </Text>
              <Text type="secondary">
                Estado:{" "}
                <Tag color={STATUS_COLORS[cxpDetalle.status] ?? "default"}>
                  {STATUS_LABELS[cxpDetalle.status] ?? cxpDetalle.status}
                </Tag>
              </Text>
            </Space>

            <Text strong style={{ display: "block", marginBottom: 8 }}>
              Historial de Pagos
            </Text>

            <Table
              size="small"
              dataSource={cxpDetalle.payments ?? []}
              columns={pagosColumns}
              rowKey="id"
              pagination={false}
              locale={{ emptyText: "Sin pagos registrados" }}
            />
          </>
        )}
      </Drawer>
    </div>
  );
}
