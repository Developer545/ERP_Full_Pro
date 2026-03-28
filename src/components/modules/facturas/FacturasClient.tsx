"use client";

import { useState } from "react";
import {
  Button,
  Tag,
  Tooltip,
  Space,
  Typography,
  Select,
  DatePicker,
  Modal,
  Descriptions,
  Divider,
} from "antd";
import {
  PlusOutlined,
  StopOutlined,
  EyeOutlined,
  CodeOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { FormModal } from "@/components/ui/FormModal";
import { ConfirmDelete } from "@/components/ui/ConfirmDelete";
import { PageHeader } from "@/components/ui/PageHeader";
import { FacturaForm } from "./FacturaForm";
import {
  useFacturas,
  useCreateFactura,
  useCancelFactura,
  useFacturaDTE,
  FACTURAS_KEY,
} from "@/hooks/queries/use-facturas";
import { useQueryClient } from "@tanstack/react-query";
import { CURRENCY } from "@/config/constants";

const { Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

// ─── Tipos locales ────────────────────────────────────────────────────────────

interface FacturaRow {
  id: string;
  correlativo: string;
  tipoDoc: "CCF" | "CF" | "NC" | "ND";
  status: "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "CANCELLED";
  paymentMethod: string;
  total: number | string;
  ivaDebito: number | string;
  subtotal: number | string;
  descuento: number | string;
  createdAt: string;
  customer?: {
    id: string;
    name: string;
    docType?: string;
    docNumber?: string | null;
  } | null;
  _count?: { items: number };
}

// ─── Mapas de presentacion ───────────────────────────────────────────────────

const TIPO_DOC_COLOR: Record<string, string> = {
  CCF: "blue",
  CF: "green",
  NC: "orange",
  ND: "purple",
};

const STATUS_COLOR: Record<string, string> = {
  DRAFT: "default",
  SENT: "blue",
  ACCEPTED: "green",
  REJECTED: "red",
  CANCELLED: "gray",
};

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Borrador",
  SENT: "Enviado",
  ACCEPTED: "Aceptado",
  REJECTED: "Rechazado",
  CANCELLED: "Cancelado",
};

const TIPO_DOC_LABEL: Record<string, string> = {
  CCF: "Cred. Fiscal",
  CF: "Cons. Final",
  NC: "Nota Crédito",
  ND: "Nota Débito",
};

const METODO_PAGO_LABEL: Record<string, string> = {
  CASH: "Efectivo",
  CARD: "Tarjeta",
  TRANSFER: "Transferencia",
  CHECK: "Cheque",
  CREDIT: "Crédito",
  MIXED: "Mixto",
};

// ─── Componente DTE Viewer ────────────────────────────────────────────────────

function DTEViewer({ facturaId, onClose }: { facturaId: string; onClose: () => void }) {
  const { data, isLoading } = useFacturaDTE(facturaId);

  return (
    <Modal
      title="JSON DTE — Ministerio de Hacienda"
      open
      onCancel={onClose}
      footer={
        <Button type="primary" onClick={onClose}>
          Cerrar
        </Button>
      }
      width={800}
    >
      {isLoading ? (
        <Text>Cargando DTE...</Text>
      ) : (
        <>
          <Paragraph type="secondary" style={{ marginBottom: 8, fontSize: 12 }}>
            {data?.meta?.nota}
          </Paragraph>
          <pre
            style={{
              background: "#1e1e1e",
              color: "#d4d4d4",
              padding: 16,
              borderRadius: 8,
              overflow: "auto",
              maxHeight: 500,
              fontSize: 12,
            }}
          >
            {JSON.stringify(data?.data, null, 2)}
          </pre>
        </>
      )}
    </Modal>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

/**
 * Componente principal del modulo de Facturas DTE.
 */
export function FacturasClient() {
  const qc = useQueryClient();

  // ── Paginacion y filtros ──
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [tipoDocFilter, setTipoDocFilter] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);

  // ── Modales ──
  const [createOpen, setCreateOpen] = useState(false);
  const [cancelItem, setCancelItem] = useState<FacturaRow | null>(null);
  const [dteItem, setDteItem] = useState<FacturaRow | null>(null);
  const [detailItem, setDetailItem] = useState<FacturaRow | null>(null);

  // ── Queries ──
  const { data, isLoading, refetch } = useFacturas({
    search,
    status: statusFilter,
    tipoDoc: tipoDocFilter,
    from: dateRange?.[0],
    to: dateRange?.[1],
    page,
    pageSize,
  });

  const createMutation = useCreateFactura();
  const cancelMutation = useCancelFactura();

  const items: FacturaRow[] = data?.data ?? [];
  const total: number = data?.meta?.total ?? 0;

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const formatCurrency = (val: number | string) =>
    `${CURRENCY.SYMBOL}${Number(val).toFixed(2)}`;

  const canCancel = (row: FacturaRow) =>
    row.status === "DRAFT" || row.status === "SENT";

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleCreate = (formData: unknown) => {
    createMutation.mutate(formData, {
      onSuccess: () => {
        setCreateOpen(false);
        qc.invalidateQueries({ queryKey: [FACTURAS_KEY] });
      },
    });
  };

  const handleCancel = () => {
    if (!cancelItem) return;
    cancelMutation.mutate(cancelItem.id, {
      onSuccess: () => setCancelItem(null),
    });
  };

  // ─── Columnas ─────────────────────────────────────────────────────────────

  const columns: DataTableColumn<FacturaRow>[] = [
    {
      title: "Correlativo",
      key: "correlativo",
      width: 160,
      render: (_: unknown, row) => (
        <Space size={4}>
          <Tag color={TIPO_DOC_COLOR[row.tipoDoc] ?? "default"} style={{ margin: 0 }}>
            {row.tipoDoc}
          </Tag>
          <Text code style={{ fontSize: 11 }}>
            {row.correlativo}
          </Text>
        </Space>
      ),
    },
    {
      title: "Cliente",
      key: "customer",
      ellipsis: true,
      render: (_: unknown, row) =>
        row.customer ? (
          <div>
            <Text strong style={{ display: "block", lineHeight: 1.2 }}>
              {row.customer.name}
            </Text>
            {row.customer.docNumber && (
              <Text type="secondary" style={{ fontSize: 11 }}>
                {row.customer.docType}: {row.customer.docNumber}
              </Text>
            )}
          </div>
        ) : (
          <Text type="secondary">Consumidor Final</Text>
        ),
    },
    {
      title: "Fecha",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 100,
      render: (date: string) => (
        <Text style={{ fontSize: 12 }}>
          {new Date(date).toLocaleDateString("es-SV")}
        </Text>
      ),
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      width: 100,
      align: "right",
      render: (total: number) => (
        <Text strong style={{ color: "#52c41a" }}>
          {formatCurrency(total)}
        </Text>
      ),
    },
    {
      title: "IVA",
      dataIndex: "ivaDebito",
      key: "ivaDebito",
      width: 90,
      align: "right",
      render: (iva: number) => (
        <Text type="secondary">{formatCurrency(iva)}</Text>
      ),
    },
    {
      title: "Estado",
      dataIndex: "status",
      key: "status",
      width: 110,
      align: "center",
      render: (status: string) => (
        <Tag color={STATUS_COLOR[status] ?? "default"}>
          {STATUS_LABEL[status] ?? status}
        </Tag>
      ),
    },
    {
      title: "Pago",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      width: 100,
      align: "center",
      render: (method: string) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {METODO_PAGO_LABEL[method] ?? method}
        </Text>
      ),
    },
    {
      title: "Acciones",
      key: "actions",
      width: 120,
      align: "center",
      fixed: "right",
      render: (_: unknown, row) => (
        <Space size="small">
          <Tooltip title="Ver detalle">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => setDetailItem(row)}
            />
          </Tooltip>
          <Tooltip title="Ver DTE JSON">
            <Button
              size="small"
              icon={<CodeOutlined />}
              onClick={() => setDteItem(row)}
            />
          </Tooltip>
          {canCancel(row) && (
            <Tooltip title="Cancelar factura">
              <Button
                size="small"
                danger
                icon={<StopOutlined />}
                onClick={() => setCancelItem(row)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div>
      <PageHeader
        title="Facturas"
        subtitle="Facturación electrónica DTE — Ministerio de Hacienda El Salvador"
        actions={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateOpen(true)}
          >
            Nueva Factura
          </Button>
        }
      />

      <DataTable<FacturaRow>
        columns={columns}
        dataSource={items}
        rowKey="id"
        total={total}
        page={page}
        pageSize={pageSize}
        loading={isLoading}
        onPageChange={(p, ps) => {
          setPage(p);
          setPageSize(ps);
        }}
        onSearch={(v) => {
          setSearch(v);
          setPage(1);
        }}
        onRefresh={() => refetch()}
        searchPlaceholder="Buscar por correlativo, cliente..."
        emptyText="No hay facturas registradas"
        filterSlot={
          <Space size="small" wrap>
            <Select
              placeholder="Tipo Doc"
              allowClear
              style={{ width: 140 }}
              value={tipoDocFilter}
              onChange={(v) => {
                setTipoDocFilter(v);
                setPage(1);
              }}
              options={[
                { value: "CCF", label: "CCF — Crédito Fiscal" },
                { value: "CF", label: "CF — Cons. Final" },
                { value: "NC", label: "NC — Nota Crédito" },
                { value: "ND", label: "ND — Nota Débito" },
              ]}
            />
            <Select
              placeholder="Estado"
              allowClear
              style={{ width: 130 }}
              value={statusFilter}
              onChange={(v) => {
                setStatusFilter(v);
                setPage(1);
              }}
              options={[
                { value: "DRAFT", label: "Borrador" },
                { value: "SENT", label: "Enviado" },
                { value: "ACCEPTED", label: "Aceptado" },
                { value: "REJECTED", label: "Rechazado" },
                { value: "CANCELLED", label: "Cancelado" },
              ]}
            />
            <RangePicker
              size="small"
              placeholder={["Desde", "Hasta"]}
              format="YYYY-MM-DD"
              onChange={(dates) => {
                if (dates && dates[0] && dates[1]) {
                  setDateRange([
                    dates[0].format("YYYY-MM-DD"),
                    dates[1].format("YYYY-MM-DD"),
                  ]);
                } else {
                  setDateRange(null);
                }
                setPage(1);
              }}
            />
          </Space>
        }
        scrollX={1100}
      />

      {/* Modal Crear Factura */}
      <FormModal
        title="Nueva Factura"
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={() => {
          const form = document.getElementById("factura-form") as HTMLFormElement;
          form?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
        }}
        loading={createMutation.isPending}
        okText="Crear Factura"
        width={900}
      >
        <FacturaForm onSubmit={handleCreate} />
      </FormModal>

      {/* Modal Detalle Factura */}
      {detailItem && (
        <Modal
          title={`Factura ${detailItem.correlativo} — ${TIPO_DOC_LABEL[detailItem.tipoDoc]}`}
          open
          onCancel={() => setDetailItem(null)}
          footer={
            <Button onClick={() => setDetailItem(null)}>Cerrar</Button>
          }
          width={600}
        >
          <Descriptions column={2} size="small" bordered>
            <Descriptions.Item label="Tipo Doc">
              <Tag color={TIPO_DOC_COLOR[detailItem.tipoDoc]}>{detailItem.tipoDoc}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Estado">
              <Tag color={STATUS_COLOR[detailItem.status]}>
                {STATUS_LABEL[detailItem.status]}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Correlativo">{detailItem.correlativo}</Descriptions.Item>
            <Descriptions.Item label="Fecha">
              {new Date(detailItem.createdAt).toLocaleDateString("es-SV")}
            </Descriptions.Item>
            <Descriptions.Item label="Cliente" span={2}>
              {detailItem.customer?.name ?? "Consumidor Final"}
            </Descriptions.Item>
            <Descriptions.Item label="Metodo Pago">
              {METODO_PAGO_LABEL[detailItem.paymentMethod] ?? detailItem.paymentMethod}
            </Descriptions.Item>
            <Descriptions.Item label="Items">{detailItem._count?.items ?? "—"}</Descriptions.Item>
            <Descriptions.Item label="Subtotal" span={2}>
              {formatCurrency(detailItem.subtotal)}
            </Descriptions.Item>
            <Descriptions.Item label="IVA (13%)">
              {formatCurrency(detailItem.ivaDebito)}
            </Descriptions.Item>
            <Descriptions.Item label="Total">
              <Text strong style={{ color: "#52c41a" }}>
                {formatCurrency(detailItem.total)}
              </Text>
            </Descriptions.Item>
          </Descriptions>
        </Modal>
      )}

      {/* Modal DTE JSON */}
      {dteItem && (
        <DTEViewer
          facturaId={dteItem.id}
          onClose={() => setDteItem(null)}
        />
      )}

      {/* Modal Cancelar */}
      <ConfirmDelete
        open={!!cancelItem}
        name={`la factura ${cancelItem?.correlativo}`}
        entityType="factura"
        onConfirm={handleCancel}
        onCancel={() => setCancelItem(null)}
        loading={cancelMutation.isPending}
        message="Esta accion cancelara la factura de forma permanente. Si ya fue enviada al MH, debera emitir una Nota de Credito."
      />
    </div>
  );
}
