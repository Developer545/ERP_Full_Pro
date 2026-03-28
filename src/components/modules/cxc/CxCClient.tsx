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
} from "antd";
import {
  DollarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { KPICards } from "@/components/ui/KPICards";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  useCxC,
  useCxCResumen,
  useRegistrarPago,
} from "@/hooks/queries/use-cxc";
import { useClientes } from "@/hooks/queries/use-clientes";
import { CURRENCY } from "@/config/constants";
import dayjs from "dayjs";

const { Text } = Typography;
const { RangePicker } = DatePicker;

/** Labels y colores para cada status de CxC */
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

interface CxCRow {
  id: string;
  customer: { id: string; name: string; docNumber?: string | null };
  invoice?: { id: string; correlativo: string; tipoDoc: string } | null;
  amount: number | string;
  paid: number | string;
  balance: number | string;
  dueDate: string;
  status: string;
  notes?: string | null;
  createdAt: string;
}

/**
 * Componente principal del modulo de Cuentas por Cobrar (CxC).
 */
export function CxCClient() {
  // ─── Estado de filtros ────────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [customerFilter, setCustomerFilter] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<[string, string] | undefined>();

  // ─── Estado modal pago ────────────────────────────────────────────────────
  const [pagoOpen, setPagoOpen] = useState(false);
  const [cxcSeleccionada, setCxcSeleccionada] = useState<CxCRow | null>(null);
  const [pagoForm] = Form.useForm();

  // ─── Datos ────────────────────────────────────────────────────────────────
  const { data: cxcData, isLoading, refetch } = useCxC({
    status: statusFilter,
    customerId: customerFilter,
    from: dateRange?.[0],
    to: dateRange?.[1],
    page,
    pageSize,
  });

  const { data: resumen, isLoading: resumenLoading } = useCxCResumen();
  const { data: clientesData } = useClientes({ pageSize: 200 });
  const registrarPagoMutation = useRegistrarPago();

  const items: CxCRow[] = cxcData?.data ?? [];
  const total: number = cxcData?.meta?.total ?? 0;
  const clientes = clientesData?.data ?? [];

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const formatCurrency = (val: number | string) =>
    `${CURRENCY.SYMBOL}${Number(val).toFixed(2)}`;

  const isVencido = (row: CxCRow) =>
    row.status !== "PAID" &&
    row.status !== "CANCELLED" &&
    dayjs(row.dueDate).isBefore(dayjs(), "day");

  // ─── Handler pago ─────────────────────────────────────────────────────────

  const abrirModalPago = (row: CxCRow) => {
    setCxcSeleccionada(row);
    pagoForm.resetFields();
    setPagoOpen(true);
  };

  const handlePago = async () => {
    if (!cxcSeleccionada) return;
    try {
      const values = await pagoForm.validateFields();
      registrarPagoMutation.mutate(
        { id: cxcSeleccionada.id, data: values },
        {
          onSuccess: () => {
            setPagoOpen(false);
            setCxcSeleccionada(null);
          },
        }
      );
    } catch {
      // Validacion fallo
    }
  };

  // ─── KPI Cards ────────────────────────────────────────────────────────────

  const kpiItems = [
    {
      title: "Pendiente Total",
      value: formatCurrency(resumen?.pending ?? 0),
      icon: <ClockCircleOutlined style={{ color: "#1677ff" }} />,
      iconBg: "#e6f4ff",
    },
    {
      title: "Vencido",
      value: formatCurrency(resumen?.overdue ?? 0),
      icon: <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />,
      iconBg: "#fff2f0",
    },
    {
      title: "Cobrado este Mes",
      value: formatCurrency(resumen?.paidThisMonth ?? 0),
      icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
      iconBg: "#f6ffed",
    },
  ];

  // ─── Columnas ─────────────────────────────────────────────────────────────

  const columns: DataTableColumn<CxCRow>[] = [
    {
      title: "Cliente",
      key: "customer",
      ellipsis: true,
      render: (_: unknown, row) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ fontSize: 13 }}>
            {row.customer.name}
          </Text>
          {row.customer.docNumber && (
            <Text type="secondary" style={{ fontSize: 11 }}>
              {row.customer.docNumber}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: "Factura",
      key: "invoice",
      width: 130,
      render: (_: unknown, row) =>
        row.invoice ? (
          <Text code style={{ fontSize: 11 }}>
            {row.invoice.tipoDoc}-{row.invoice.correlativo}
          </Text>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: "Monto",
      dataIndex: "amount",
      key: "amount",
      width: 100,
      align: "right",
      render: (amount: number) => (
        <Text strong>{formatCurrency(amount)}</Text>
      ),
    },
    {
      title: "Pagado",
      dataIndex: "paid",
      key: "paid",
      width: 100,
      align: "right",
      render: (paid: number) => (
        <Text style={{ color: "#52c41a" }}>{formatCurrency(paid)}</Text>
      ),
    },
    {
      title: "Saldo",
      dataIndex: "balance",
      key: "balance",
      width: 100,
      align: "right",
      render: (balance: number) => (
        <Text strong style={{ color: Number(balance) > 0 ? "#ff4d4f" : "#52c41a" }}>
          {formatCurrency(balance)}
        </Text>
      ),
    },
    {
      title: "Vencimiento",
      dataIndex: "dueDate",
      key: "dueDate",
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
      width: 110,
      align: "center",
      fixed: "right",
      render: (_: unknown, row) => (
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
      ),
    },
  ];

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div>
      <PageHeader
        title="Cuentas por Cobrar"
        subtitle="Seguimiento de creditos y cobros pendientes"
      />

      {/* KPI Cards */}
      <div style={{ marginBottom: 24 }}>
        <KPICards
          items={kpiItems}
          loading={resumenLoading}
          cols={{ xs: 24, sm: 12, lg: 8 }}
        />
      </div>

      {/* Tabla principal */}
      <DataTable<CxCRow>
        columns={columns}
        dataSource={items}
        rowKey="id"
        total={total}
        page={page}
        pageSize={pageSize}
        loading={isLoading}
        onPageChange={(p, ps) => { setPage(p); setPageSize(ps); }}
        onRefresh={() => refetch()}
        searchPlaceholder="Buscar cliente o factura..."
        emptyText="No hay cuentas por cobrar registradas"
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
              placeholder="Cliente"
              allowClear
              showSearch
              style={{ width: 200 }}
              value={customerFilter}
              onChange={(v) => { setCustomerFilter(v); setPage(1); }}
              filterOption={(input, option) =>
                (option?.label as string)
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={clientes.map((c: { id: string; name: string }) => ({
                value: c.id,
                label: c.name,
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
        scrollX={1000}
      />

      {/* Modal Registrar Pago */}
      <Modal
        title={`Registrar Pago — ${cxcSeleccionada?.customer.name ?? ""}`}
        open={pagoOpen}
        onOk={handlePago}
        onCancel={() => {
          setPagoOpen(false);
          setCxcSeleccionada(null);
          pagoForm.resetFields();
        }}
        confirmLoading={registrarPagoMutation.isPending}
        okText="Registrar Pago"
        cancelText="Cancelar"
        width={460}
        destroyOnClose
      >
        {cxcSeleccionada && (
          <div style={{ marginBottom: 16 }}>
            <Space direction="vertical" size={2}>
              <Text type="secondary">
                Saldo pendiente:{" "}
                <Text strong style={{ color: "#ff4d4f" }}>
                  {formatCurrency(cxcSeleccionada.balance)}
                </Text>
              </Text>
              <Text type="secondary">
                Vencimiento:{" "}
                <Text>{dayjs(cxcSeleccionada.dueDate).format("DD/MM/YYYY")}</Text>
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
                max: cxcSeleccionada ? Number(cxcSeleccionada.balance) : undefined,
                message: `El monto debe ser entre $0.01 y ${formatCurrency(cxcSeleccionada?.balance ?? 0)}`,
              },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={0.01}
              max={Number(cxcSeleccionada?.balance ?? 0)}
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
            <Input
              placeholder="Opcional"
              maxLength={100}
            />
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
    </div>
  );
}
