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
  Table,
  InputNumber,
  Form,
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  StopOutlined,
  ShoppingCartOutlined,
  ClockCircleOutlined,
  CheckOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { FormModal } from "@/components/ui/FormModal";
import { ConfirmDelete } from "@/components/ui/ConfirmDelete";
import { PageHeader } from "@/components/ui/PageHeader";
import { KPICards, type KPIItem } from "@/components/ui/KPICards";
import { CompraForm } from "./CompraForm";
import {
  useCompras,
  useCreateCompra,
  useRecibirCompra,
  useCancelCompra,
  COMPRAS_KEY,
} from "@/hooks/queries/use-compras";
import { useQueryClient } from "@tanstack/react-query";
import { CURRENCY } from "@/config/constants";

const { Text } = Typography;
const { RangePicker } = DatePicker;

// ─── Tipos locales ────────────────────────────────────────────────────────────

interface CompraItem {
  id: string;
  description: string;
  quantity: number;
  unitCost: number;
  discount: number;
  taxRate: number;
  subtotal: number;
  ivaAmount: number;
  total: number;
  quantityReceived: number;
  productId?: string | null;
}

interface CompraRow {
  id: string;
  numero: string;
  reference?: string | null;
  status: "DRAFT" | "SENT" | "PARTIAL" | "RECEIVED" | "CANCELLED";
  subtotal: number | string;
  descuento: number | string;
  iva: number | string;
  total: number | string;
  fechaOrden: string;
  fechaEsperada?: string | null;
  fechaRecibida?: string | null;
  notes?: string | null;
  supplier?: {
    id: string;
    name: string;
    nit?: string | null;
    email?: string | null;
  } | null;
  _count?: { items: number };
  items?: CompraItem[];
}

// ─── Mapas de presentacion ───────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  DRAFT: "default",
  SENT: "blue",
  PARTIAL: "orange",
  RECEIVED: "green",
  CANCELLED: "volcano",
};

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Borrador",
  SENT: "Enviada",
  PARTIAL: "Parcial",
  RECEIVED: "Recibida",
  CANCELLED: "Cancelada",
};

// ─── Componente: Modal Recibir Mercaderia ─────────────────────────────────────

interface RecibirModalProps {
  oc: CompraRow;
  onClose: () => void;
}

function RecibirModal({ oc, onClose }: RecibirModalProps) {
  const recibirMutation = useRecibirCompra();
  const qc = useQueryClient();

  // Estado para cantidades a recibir por item
  const [cantidades, setCantidades] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    if (oc.items) {
      for (const item of oc.items) {
        const pendiente = Number(item.quantity) - Number(item.quantityReceived);
        init[item.id] = Math.max(0, pendiente);
      }
    }
    return init;
  });

  const handleRecibir = () => {
    const items = Object.entries(cantidades)
      .filter(([, qty]) => qty > 0)
      .map(([itemId, quantityReceived]) => ({ itemId, quantityReceived }));

    if (items.length === 0) return;

    recibirMutation.mutate(
      { id: oc.id, items },
      {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: [COMPRAS_KEY] });
          onClose();
        },
      }
    );
  };

  const columns = [
    {
      title: "Descripcion",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Ordenado",
      dataIndex: "quantity",
      key: "quantity",
      width: 90,
      align: "right" as const,
      render: (v: number) => Number(v).toFixed(2),
    },
    {
      title: "Recibido",
      dataIndex: "quantityReceived",
      key: "quantityReceived",
      width: 90,
      align: "right" as const,
      render: (v: number) => Number(v).toFixed(2),
    },
    {
      title: "Pendiente",
      key: "pendiente",
      width: 90,
      align: "right" as const,
      render: (_: unknown, row: CompraItem) => {
        const pendiente = Number(row.quantity) - Number(row.quantityReceived);
        return (
          <Text type={pendiente > 0 ? "warning" : "secondary"}>
            {Math.max(0, pendiente).toFixed(2)}
          </Text>
        );
      },
    },
    {
      title: "A Recibir Ahora",
      key: "recibirAhora",
      width: 130,
      render: (_: unknown, row: CompraItem) => {
        const pendiente = Number(row.quantity) - Number(row.quantityReceived);
        if (pendiente <= 0) {
          return <Text type="secondary">Completo</Text>;
        }
        return (
          <InputNumber
            size="small"
            min={0}
            max={pendiente}
            step={1}
            precision={2}
            value={cantidades[row.id] ?? 0}
            onChange={(v) =>
              setCantidades((prev) => ({ ...prev, [row.id]: v ?? 0 }))
            }
            style={{ width: "100%" }}
          />
        );
      },
    },
  ];

  return (
    <Modal
      title={`Recibir Mercaderia — ${oc.numero}`}
      open
      onCancel={onClose}
      width={750}
      footer={
        <Space>
          <Button onClick={onClose}>Cancelar</Button>
          <Button
            type="primary"
            icon={<CheckOutlined />}
            loading={recibirMutation.isPending}
            onClick={handleRecibir}
          >
            Confirmar Recepcion
          </Button>
        </Space>
      }
    >
      <Text type="secondary" style={{ display: "block", marginBottom: 12, fontSize: 12 }}>
        Proveedor: <Text strong>{oc.supplier?.name}</Text>
      </Text>
      <Table
        dataSource={oc.items ?? []}
        columns={columns}
        rowKey="id"
        pagination={false}
        size="small"
      />
    </Modal>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

/**
 * Componente principal del modulo de Compras (Ordenes de Compra).
 */
export function ComprasClient() {
  const qc = useQueryClient();

  // ── Paginacion y filtros ──
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);

  // ── Modales ──
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<CompraRow | null>(null);
  const [detailItem, setDetailItem] = useState<CompraRow | null>(null);
  const [recibirItem, setRecibirItem] = useState<CompraRow | null>(null);

  // ── Queries ──
  const { data, isLoading, refetch } = useCompras({
    search,
    status: statusFilter,
    from: dateRange?.[0],
    to: dateRange?.[1],
    page,
    pageSize,
  });

  const createMutation = useCreateCompra();
  const cancelMutation = useCancelCompra();

  const items: CompraRow[] = data?.data ?? [];
  const total: number = data?.meta?.total ?? 0;

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const formatCurrency = (val: number | string) =>
    `${CURRENCY.SYMBOL}${Number(val).toFixed(2)}`;

  const formatDate = (date?: string | null) =>
    date ? dayjs(date).format("DD/MM/YYYY") : "—";

  const canDelete = (row: CompraRow) => row.status === "DRAFT";

  const canRecibir = (row: CompraRow) =>
    row.status === "DRAFT" || row.status === "SENT" || row.status === "PARTIAL";

  // ─── KPIs (calculados desde los datos paginados como aproximacion) ─────────

  const kpiItems: KPIItem[] = [
    {
      title: "Total OC",
      value: data?.meta?.total ?? 0,
      icon: <ShoppingCartOutlined style={{ color: "#1677ff" }} />,
      iconBg: "#e6f4ff",
    },
    {
      title: "Pendientes",
      value: items.filter((i) =>
        ["DRAFT", "SENT", "PARTIAL"].includes(i.status)
      ).length,
      icon: <ClockCircleOutlined style={{ color: "#fa8c16" }} />,
      iconBg: "#fff7e6",
      description: "En esta pagina",
    },
    {
      title: "Recibidas",
      value: items.filter((i) => i.status === "RECEIVED").length,
      icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
      iconBg: "#f6ffed",
      description: "En esta pagina",
    },
    {
      title: "Monto Pendiente",
      value: formatCurrency(
        items
          .filter((i) => ["DRAFT", "SENT", "PARTIAL"].includes(i.status))
          .reduce((acc, i) => acc + Number(i.total), 0)
      ),
      icon: <DollarOutlined style={{ color: "#722ed1" }} />,
      iconBg: "#f9f0ff",
      description: "En esta pagina",
    },
  ];

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleCreate = (formData: unknown) => {
    createMutation.mutate(formData, {
      onSuccess: () => {
        setCreateOpen(false);
        qc.invalidateQueries({ queryKey: [COMPRAS_KEY] });
      },
    });
  };

  const handleDelete = () => {
    if (!deleteItem) return;
    cancelMutation.mutate(deleteItem.id, {
      onSuccess: () => setDeleteItem(null),
    });
  };

  // ─── Columnas ─────────────────────────────────────────────────────────────

  const columns: DataTableColumn<CompraRow>[] = [
    {
      title: "N° OC",
      key: "numero",
      width: 140,
      render: (_: unknown, row) => (
        <Text code style={{ fontSize: 12 }}>
          {row.numero}
        </Text>
      ),
    },
    {
      title: "Proveedor",
      key: "supplier",
      ellipsis: true,
      render: (_: unknown, row) =>
        row.supplier ? (
          <div>
            <Text strong style={{ display: "block", lineHeight: 1.2 }}>
              {row.supplier.name}
            </Text>
            {row.supplier.nit && (
              <Text type="secondary" style={{ fontSize: 11 }}>
                NIT: {row.supplier.nit}
              </Text>
            )}
          </div>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: "Fecha OC",
      dataIndex: "fechaOrden",
      key: "fechaOrden",
      width: 100,
      render: (date: string) => (
        <Text style={{ fontSize: 12 }}>{formatDate(date)}</Text>
      ),
    },
    {
      title: "F. Esperada",
      dataIndex: "fechaEsperada",
      key: "fechaEsperada",
      width: 100,
      render: (date?: string | null) => (
        <Text style={{ fontSize: 12 }} type={date ? undefined : "secondary"}>
          {formatDate(date)}
        </Text>
      ),
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      width: 110,
      align: "right",
      render: (total: number) => (
        <Text strong style={{ color: "#52c41a" }}>
          {formatCurrency(total)}
        </Text>
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
      title: "Acciones",
      key: "actions",
      width: 130,
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
          {canRecibir(row) && (
            <Tooltip title="Recibir mercaderia">
              <Button
                size="small"
                type="primary"
                ghost
                icon={<CheckCircleOutlined />}
                onClick={async () => {
                  // Cargar detalle con items antes de abrir el modal
                  const res = await fetch(`/api/v1/compras/${row.id}`);
                  const json = await res.json();
                  setRecibirItem(json.data ?? row);
                }}
              />
            </Tooltip>
          )}
          {canDelete(row) && (
            <Tooltip title="Eliminar OC">
              <Button
                size="small"
                danger
                icon={<StopOutlined />}
                onClick={() => setDeleteItem(row)}
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
        title="Compras"
        subtitle="Ordenes de compra a proveedores — control de recepcion e inventario"
        actions={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateOpen(true)}
          >
            Nueva OC
          </Button>
        }
      />

      {/* KPIs */}
      <div style={{ marginBottom: 16 }}>
        <KPICards items={kpiItems} loading={isLoading} />
      </div>

      <DataTable<CompraRow>
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
        searchPlaceholder="Buscar por N° OC, proveedor, referencia..."
        emptyText="No hay ordenes de compra registradas"
        filterSlot={
          <Space size="small" wrap>
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
                { value: "SENT", label: "Enviada" },
                { value: "PARTIAL", label: "Parcial" },
                { value: "RECEIVED", label: "Recibida" },
                { value: "CANCELLED", label: "Cancelada" },
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

      {/* Modal Crear OC */}
      <FormModal
        title="Nueva Orden de Compra"
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={() => {
          const form = document.getElementById("compra-form") as HTMLFormElement;
          form?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
        }}
        loading={createMutation.isPending}
        okText="Crear Orden de Compra"
        width={900}
      >
        <CompraForm onSubmit={handleCreate} />
      </FormModal>

      {/* Drawer Detalle OC */}
      {detailItem && (
        <Modal
          title={`OC ${detailItem.numero} — ${detailItem.supplier?.name ?? "—"}`}
          open
          onCancel={() => setDetailItem(null)}
          footer={<Button onClick={() => setDetailItem(null)}>Cerrar</Button>}
          width={650}
        >
          <Descriptions column={2} size="small" bordered>
            <Descriptions.Item label="N° OC">
              <Text code>{detailItem.numero}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Estado">
              <Tag color={STATUS_COLOR[detailItem.status]}>
                {STATUS_LABEL[detailItem.status]}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Proveedor" span={2}>
              {detailItem.supplier?.name ?? "—"}
            </Descriptions.Item>
            {detailItem.reference && (
              <Descriptions.Item label="Referencia" span={2}>
                {detailItem.reference}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Fecha OC">
              {formatDate(detailItem.fechaOrden)}
            </Descriptions.Item>
            <Descriptions.Item label="Fecha Esperada">
              {formatDate(detailItem.fechaEsperada)}
            </Descriptions.Item>
            {detailItem.fechaRecibida && (
              <Descriptions.Item label="Fecha Recibida" span={2}>
                {formatDate(detailItem.fechaRecibida)}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Subtotal">
              {formatCurrency(detailItem.subtotal)}
            </Descriptions.Item>
            <Descriptions.Item label="IVA (13%)">
              {formatCurrency(detailItem.iva)}
            </Descriptions.Item>
            <Descriptions.Item label="Total" span={2}>
              <Text strong style={{ color: "#52c41a" }}>
                {formatCurrency(detailItem.total)}
              </Text>
            </Descriptions.Item>
            {detailItem.notes && (
              <Descriptions.Item label="Notas" span={2}>
                {detailItem.notes}
              </Descriptions.Item>
            )}
          </Descriptions>

          {detailItem._count && (
            <>
              <Divider style={{ margin: "12px 0" }} />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {detailItem._count.items} item(s) en esta orden
              </Text>
            </>
          )}
        </Modal>
      )}

      {/* Modal Recibir Mercaderia */}
      {recibirItem && (
        <RecibirModal
          oc={recibirItem}
          onClose={() => setRecibirItem(null)}
        />
      )}

      {/* Modal Eliminar OC */}
      <ConfirmDelete
        open={!!deleteItem}
        name={`la orden ${deleteItem?.numero}`}
        entityType="orden de compra"
        onConfirm={handleDelete}
        onCancel={() => setDeleteItem(null)}
        loading={cancelMutation.isPending}
        message="Esta accion eliminara la orden de compra de forma permanente (solo aplica a borradores)."
      />
    </div>
  );
}
