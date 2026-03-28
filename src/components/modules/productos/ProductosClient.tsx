"use client";

import { useState } from "react";
import { Button, Tag, Badge, Tooltip, Space, Typography, Select } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, WarningOutlined } from "@ant-design/icons";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { FormModal } from "@/components/ui/FormModal";
import { ConfirmDelete } from "@/components/ui/ConfirmDelete";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProductoForm } from "./ProductoForm";
import {
  useProductos,
  useCreateProducto,
  useUpdateProducto,
  useDeleteProducto,
} from "@/hooks/queries/use-productos";
import { useCategoriasActivas } from "@/hooks/queries/use-categorias";
import type { CreateProductoDto } from "@/modules/productos/producto.schema";
import { CURRENCY } from "@/config/constants";

const { Text } = Typography;

interface ProductoRow {
  id: string;
  name: string;
  sku?: string | null;
  price: number | string;
  cost: number | string;
  stock: number | string;
  minStock: number | string;
  unit: string;
  isActive: boolean;
  createdAt: string;
  category?: { id: string; name: string; color?: string | null } | null;
}

/**
 * Componente principal del modulo de Productos.
 */
export function ProductosClient() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();

  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<ProductoRow | null>(null);
  const [deleteItem, setDeleteItem] = useState<ProductoRow | null>(null);

  const { data, isLoading, refetch } = useProductos({
    search,
    categoryId: categoryFilter,
    page,
    pageSize,
  });
  const { data: categorias } = useCategoriasActivas();

  const createMutation = useCreateProducto();
  const updateMutation = useUpdateProducto();
  const deleteMutation = useDeleteProducto();

  const items: ProductoRow[] = data?.data ?? [];
  const total: number = data?.meta?.total ?? 0;

  // ─── Helpers ───────────────────────────────────────────────────────────────

  const formatCurrency = (val: number | string) =>
    `${CURRENCY.SYMBOL}${Number(val).toFixed(2)}`;

  const isLowStock = (row: ProductoRow) =>
    Number(row.stock) < Number(row.minStock);

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleCreate = (formData: CreateProductoDto) => {
    createMutation.mutate(formData, {
      onSuccess: () => setCreateOpen(false),
    });
  };

  const handleUpdate = (formData: CreateProductoDto) => {
    if (!editItem) return;
    updateMutation.mutate(
      { id: editItem.id, data: formData },
      { onSuccess: () => setEditItem(null) }
    );
  };

  const handleDelete = () => {
    if (!deleteItem) return;
    deleteMutation.mutate(deleteItem.id, {
      onSuccess: () => setDeleteItem(null),
    });
  };

  // ─── Columnas ──────────────────────────────────────────────────────────────

  const columns: DataTableColumn<ProductoRow>[] = [
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
      title: "Nombre",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: "Categoria",
      key: "category",
      width: 120,
      render: (_: unknown, row) =>
        row.category ? (
          <Tag color={row.category.color ?? "default"}>{row.category.name}</Tag>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: "Precio",
      dataIndex: "price",
      key: "price",
      width: 90,
      align: "right",
      render: (price: number) => (
        <Text strong style={{ color: "#52c41a" }}>
          {formatCurrency(price)}
        </Text>
      ),
    },
    {
      title: "Costo",
      dataIndex: "cost",
      key: "cost",
      width: 90,
      align: "right",
      render: (cost: number) => (
        <Text type="secondary">{formatCurrency(cost)}</Text>
      ),
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
      width: 90,
      align: "center",
      render: (stock: number, row) => {
        const low = isLowStock(row);
        return (
          <Space size="small">
            {low && (
              <Tooltip title={`Stock minimo: ${row.minStock}`}>
                <WarningOutlined style={{ color: "#ff4d4f" }} />
              </Tooltip>
            )}
            <Badge
              count={Number(stock)}
              showZero
              style={{ backgroundColor: low ? "#ff4d4f" : "#52c41a" }}
            />
          </Space>
        );
      },
    },
    {
      title: "Unidad",
      dataIndex: "unit",
      key: "unit",
      width: 80,
      render: (unit: string) => <Text type="secondary">{unit}</Text>,
    },
    {
      title: "Estado",
      dataIndex: "isActive",
      key: "isActive",
      width: 90,
      align: "center",
      render: (active: boolean) => (
        <Tag color={active ? "green" : "red"}>{active ? "Activo" : "Inactivo"}</Tag>
      ),
    },
    {
      title: "Acciones",
      key: "actions",
      width: 90,
      align: "center",
      fixed: "right",
      render: (_: unknown, row) => (
        <Space size="small">
          <Tooltip title="Editar">
            <Button size="small" icon={<EditOutlined />} onClick={() => setEditItem(row)} />
          </Tooltip>
          <Tooltip title="Eliminar">
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => setDeleteItem(row)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div>
      <PageHeader
        title="Productos"
        subtitle="Catalogo de productos e inventario"
        actions={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateOpen(true)}
          >
            Nuevo Producto
          </Button>
        }
      />

      <DataTable<ProductoRow>
        columns={columns}
        dataSource={items}
        rowKey="id"
        total={total}
        page={page}
        pageSize={pageSize}
        loading={isLoading}
        onPageChange={(p, ps) => { setPage(p); setPageSize(ps); }}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        onRefresh={() => refetch()}
        searchPlaceholder="Buscar por nombre o SKU..."
        emptyText="No hay productos registrados"
        filterSlot={
          <Select
            placeholder="Categoria"
            allowClear
            style={{ width: 160 }}
            value={categoryFilter}
            onChange={(v) => { setCategoryFilter(v); setPage(1); }}
            options={categorias?.map((c) => ({ value: c.id, label: c.name }))}
          />
        }
        scrollX={900}
      />

      {/* Modal Crear */}
      <FormModal
        title="Nuevo Producto"
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={() => {
          const form = document.getElementById("producto-form") as HTMLFormElement;
          form?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
        }}
        loading={createMutation.isPending}
        okText="Crear Producto"
        width={600}
      >
        <ProductoForm onSubmit={handleCreate} />
      </FormModal>

      {/* Modal Editar */}
      <FormModal
        title="Editar Producto"
        open={!!editItem}
        onClose={() => setEditItem(null)}
        onSubmit={() => {
          const form = document.getElementById("producto-form") as HTMLFormElement;
          form?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
        }}
        loading={updateMutation.isPending}
        okText="Guardar Cambios"
        width={600}
      >
        <ProductoForm
          defaultValues={{
            name: editItem?.name ?? "",
            sku: editItem?.sku ?? "",
            price: Number(editItem?.price ?? 0),
            cost: Number(editItem?.cost ?? 0),
            stock: Number(editItem?.stock ?? 0),
            minStock: Number(editItem?.minStock ?? 0),
            unit: editItem?.unit ?? "Unidad",
            categoryId: editItem?.category?.id ?? undefined,
          }}
          onSubmit={handleUpdate}
        />
      </FormModal>

      {/* Modal Eliminar */}
      <ConfirmDelete
        open={!!deleteItem}
        name={deleteItem?.name}
        entityType="producto"
        onConfirm={handleDelete}
        onCancel={() => setDeleteItem(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
