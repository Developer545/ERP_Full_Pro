"use client";

import { useState } from "react";
import {
  Tabs,
  Tag,
  Badge,
  Space,
  Typography,
  Select,
  Button,
  Modal,
  Form,
  InputNumber,
  Input,
  Tooltip,
} from "antd";
import {
  InboxOutlined,
  WarningOutlined,
  PlusOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  useMovimientos,
  useResumenStock,
  useKardex,
  useAjustarStock,
} from "@/hooks/queries/use-inventario";
import type { StockResumen, MovementType } from "@/modules/inventario/inventario.types";
import dayjs from "dayjs";

const { Text } = Typography;

/** Colores por tipo de movimiento */
const MOVEMENT_COLORS: Record<string, string> = {
  ENTRY: "green",
  EXIT: "red",
  ADJUSTMENT: "blue",
  TRANSFER: "orange",
  INITIAL: "purple",
  RETURN: "cyan",
};

/** Labels en espanol para tipos de movimiento */
const MOVEMENT_LABELS: Record<string, string> = {
  ENTRY: "Entrada",
  EXIT: "Salida",
  ADJUSTMENT: "Ajuste",
  TRANSFER: "Transferencia",
  INITIAL: "Stock Inicial",
  RETURN: "Devolucion",
};

interface MovimientoRow {
  id: string;
  createdAt: string;
  type: string;
  quantity: number | string;
  unitCost: number | string;
  previousStock: number | string;
  newStock: number | string;
  reason?: string | null;
  referenceType?: string | null;
  product: { id: string; name: string; sku?: string | null; unit: string };
}

/**
 * Componente principal del modulo de Inventario / Kardex.
 */
export function InventarioClient() {
  // ─── Estado de tabs y filtros ─────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("stock");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [typeFilter, setTypeFilter] = useState<string | undefined>();
  const [kardexProductId, setKardexProductId] = useState<string | null>(null);

  // ─── Estado modal ajuste ──────────────────────────────────────────────────
  const [ajusteOpen, setAjusteOpen] = useState(false);
  const [ajusteForm] = Form.useForm();

  // ─── Datos ────────────────────────────────────────────────────────────────
  const { data: stockData, isLoading: stockLoading } = useResumenStock();
  const { data: movData, isLoading: movLoading } = useMovimientos({
    type: typeFilter,
    page,
    pageSize,
  });
  const { data: kardexData, isLoading: kardexLoading } = useKardex(kardexProductId);

  const ajustarMutation = useAjustarStock();

  const stockItems: StockResumen[] = stockData ?? [];
  const movItems: MovimientoRow[] = movData?.data ?? [];
  const movTotal: number = movData?.meta?.total ?? 0;
  const kardexItems = kardexData ?? [];

  // Opciones de productos para el select del kardex
  const productOptions = stockItems.map((p) => ({
    value: p.productId,
    label: `${p.name}${p.sku ? ` (${p.sku})` : ""}`,
  }));

  // ─── Handler ajuste ───────────────────────────────────────────────────────
  const handleAjuste = async () => {
    try {
      const values = await ajusteForm.validateFields();
      const { productId, type, quantity, reason } = values;

      // Para EXIT y ADJUSTMENT negativo, usamos delta negativo
      const delta =
        type === "EXIT" ? -Math.abs(quantity) : Math.abs(quantity);

      ajustarMutation.mutate(
        { productId, type, quantity: delta, reason },
        {
          onSuccess: () => {
            setAjusteOpen(false);
            ajusteForm.resetFields();
          },
        }
      );
    } catch {
      // Validacion fallo — antd muestra los errores
    }
  };

  // ─── Columnas Resumen Stock ───────────────────────────────────────────────
  const stockColumns: DataTableColumn<StockResumen>[] = [
    {
      title: "Producto",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
      width: 110,
      render: (sku: string | null) => (
        <Text code style={{ fontSize: 11 }}>
          {sku ?? "—"}
        </Text>
      ),
    },
    {
      title: "Stock Actual",
      dataIndex: "stock",
      key: "stock",
      width: 120,
      align: "center",
      render: (stock: number, row) => (
        <Badge
          count={stock}
          showZero
          overflowCount={999999}
          style={{ backgroundColor: row.isLow ? "#ff4d4f" : "#52c41a" }}
        />
      ),
    },
    {
      title: "Stock Minimo",
      dataIndex: "minStock",
      key: "minStock",
      width: 120,
      align: "center",
      render: (minStock: number) => (
        <Text type="secondary">{minStock}</Text>
      ),
    },
    {
      title: "Estado",
      key: "estado",
      width: 100,
      align: "center",
      render: (_: unknown, row) =>
        row.isLow ? (
          <Tag
            color="red"
            icon={<WarningOutlined />}
          >
            BAJO
          </Tag>
        ) : (
          <Tag color="green">OK</Tag>
        ),
    },
  ];

  // ─── Columnas Kardex ──────────────────────────────────────────────────────
  const kardexColumns: DataTableColumn<Record<string, unknown>>[] = [
    {
      title: "#",
      dataIndex: "index",
      key: "index",
      width: 50,
      align: "center",
      render: (idx: number) => (
        <Text type="secondary" style={{ fontSize: 11 }}>
          {idx}
        </Text>
      ),
    },
    {
      title: "Fecha",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (date: string) => (
        <Text style={{ fontSize: 12 }}>
          {dayjs(date).format("DD/MM/YYYY HH:mm")}
        </Text>
      ),
    },
    {
      title: "Tipo",
      dataIndex: "type",
      key: "type",
      width: 120,
      render: (type: string) => (
        <Tag color={MOVEMENT_COLORS[type] ?? "default"}>
          {MOVEMENT_LABELS[type] ?? type}
        </Tag>
      ),
    },
    {
      title: "Cantidad",
      dataIndex: "quantity",
      key: "quantity",
      width: 90,
      align: "right",
      render: (qty: number) => (
        <Text strong>{Number(qty).toFixed(3)}</Text>
      ),
    },
    {
      title: "Costo Unit.",
      dataIndex: "unitCost",
      key: "unitCost",
      width: 100,
      align: "right",
      render: (cost: number) => (
        <Text type="secondary">${Number(cost).toFixed(2)}</Text>
      ),
    },
    {
      title: "Saldo",
      dataIndex: "saldo",
      key: "saldo",
      width: 100,
      align: "right",
      render: (saldo: number) => (
        <Text strong style={{ color: "#1677ff" }}>
          {Number(saldo).toFixed(3)}
        </Text>
      ),
    },
    {
      title: "Motivo",
      dataIndex: "reason",
      key: "reason",
      ellipsis: true,
      render: (reason: string | null) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {reason ?? "—"}
        </Text>
      ),
    },
  ];

  // ─── Columnas Movimientos ─────────────────────────────────────────────────
  const movColumns: DataTableColumn<MovimientoRow>[] = [
    {
      title: "Fecha",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (date: string) => (
        <Text style={{ fontSize: 12 }}>
          {dayjs(date).format("DD/MM/YYYY HH:mm")}
        </Text>
      ),
    },
    {
      title: "Producto",
      key: "product",
      ellipsis: true,
      render: (_: unknown, row) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ fontSize: 13 }}>
            {row.product.name}
          </Text>
          {row.product.sku && (
            <Text code style={{ fontSize: 10 }}>
              {row.product.sku}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: "Tipo",
      dataIndex: "type",
      key: "type",
      width: 120,
      render: (type: string) => (
        <Tag color={MOVEMENT_COLORS[type] ?? "default"}>
          {MOVEMENT_LABELS[type] ?? type}
        </Tag>
      ),
    },
    {
      title: "Cantidad",
      dataIndex: "quantity",
      key: "quantity",
      width: 90,
      align: "right",
      render: (qty: number) => (
        <Text strong>{Number(qty).toFixed(3)}</Text>
      ),
    },
    {
      title: "Saldo",
      dataIndex: "newStock",
      key: "newStock",
      width: 90,
      align: "right",
      render: (stock: number) => (
        <Text strong style={{ color: "#1677ff" }}>
          {Number(stock).toFixed(3)}
        </Text>
      ),
    },
    {
      title: "Motivo",
      dataIndex: "reason",
      key: "reason",
      ellipsis: true,
      render: (reason: string | null) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {reason ?? "—"}
        </Text>
      ),
    },
  ];

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div>
      <PageHeader
        title="Inventario"
        subtitle="Control de stock y kardex de productos"
        actions={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setAjusteOpen(true)}
          >
            Ajuste de Stock
          </Button>
        }
      />

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: "stock",
            label: (
              <span>
                <InboxOutlined /> Resumen de Stock
              </span>
            ),
            children: (
              <DataTable<StockResumen>
                columns={stockColumns}
                dataSource={stockItems}
                rowKey="productId"
                total={stockItems.length}
                page={1}
                pageSize={stockItems.length || 20}
                loading={stockLoading}
                onPageChange={() => {}}
                onRefresh={() => {}}
                searchPlaceholder="Buscar producto..."
                emptyText="No hay productos con control de stock"
                scrollX={700}
              />
            ),
          },
          {
            key: "kardex",
            label: (
              <span>
                <SwapOutlined /> Kardex / Movimientos
              </span>
            ),
            children: (
              <div>
                {/* Selector de producto para kardex */}
                <div style={{ marginBottom: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <Select
                    placeholder="Seleccionar producto para ver kardex"
                    style={{ width: 320 }}
                    showSearch
                    allowClear
                    filterOption={(input, option) =>
                      (option?.label as string)
                        ?.toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    options={productOptions}
                    value={kardexProductId}
                    onChange={(v) => setKardexProductId(v ?? null)}
                  />

                  <Select
                    placeholder="Tipo de movimiento"
                    allowClear
                    style={{ width: 180 }}
                    value={typeFilter}
                    onChange={(v) => { setTypeFilter(v); setPage(1); }}
                    options={Object.entries(MOVEMENT_LABELS).map(([k, v]) => ({
                      value: k,
                      label: v,
                    }))}
                  />
                </div>

                {/* Kardex del producto seleccionado */}
                {kardexProductId ? (
                  <DataTable<Record<string, unknown>>
                    columns={kardexColumns}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    dataSource={kardexItems as any[]}
                    rowKey="id"
                    total={kardexItems.length}
                    page={1}
                    pageSize={kardexItems.length || 20}
                    loading={kardexLoading}
                    onPageChange={() => {}}
                    onRefresh={() => {}}
                    emptyText="Sin movimientos para este producto"
                    scrollX={800}
                  />
                ) : (
                  /* Lista general de movimientos cuando no hay producto seleccionado */
                  <DataTable<MovimientoRow>
                    columns={movColumns}
                    dataSource={movItems}
                    rowKey="id"
                    total={movTotal}
                    page={page}
                    pageSize={pageSize}
                    loading={movLoading}
                    onPageChange={(p, ps) => { setPage(p); setPageSize(ps); }}
                    onRefresh={() => {}}
                    emptyText="No hay movimientos de inventario"
                    scrollX={800}
                  />
                )}
              </div>
            ),
          },
        ]}
      />

      {/* Modal Ajuste de Stock */}
      <Modal
        title="Ajuste de Stock"
        open={ajusteOpen}
        onOk={handleAjuste}
        onCancel={() => {
          setAjusteOpen(false);
          ajusteForm.resetFields();
        }}
        confirmLoading={ajustarMutation.isPending}
        okText="Registrar Movimiento"
        cancelText="Cancelar"
        width={480}
        destroyOnClose
      >
        <Form form={ajusteForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="productId"
            label="Producto"
            rules={[{ required: true, message: "Selecciona un producto" }]}
          >
            <Select
              showSearch
              placeholder="Seleccionar producto"
              filterOption={(input, option) =>
                (option?.label as string)
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={productOptions}
            />
          </Form.Item>

          <Form.Item
            name="type"
            label="Tipo de movimiento"
            rules={[{ required: true, message: "Selecciona el tipo" }]}
            initialValue="ADJUSTMENT"
          >
            <Select
              options={[
                { value: "ENTRY", label: "Entrada (suma stock)" },
                { value: "EXIT", label: "Salida (resta stock)" },
                { value: "ADJUSTMENT", label: "Ajuste manual" },
                { value: "INITIAL", label: "Stock Inicial" },
                { value: "RETURN", label: "Devolucion" },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Cantidad"
            rules={[
              { required: true, message: "Ingresa la cantidad" },
              { type: "number", min: 0.001, message: "La cantidad debe ser mayor a 0" },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={0.001}
              precision={3}
              placeholder="0.000"
            />
          </Form.Item>

          <Form.Item name="reason" label="Motivo / Descripcion">
            <Input.TextArea
              rows={2}
              placeholder="Descripcion del ajuste (opcional)"
              maxLength={500}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
