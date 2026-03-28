"use client";

import { useState } from "react";
import { Button, Tag, Badge, Tooltip, Space, Typography } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { FormModal } from "@/components/ui/FormModal";
import { ConfirmDelete } from "@/components/ui/ConfirmDelete";
import { PageHeader } from "@/components/ui/PageHeader";
import { CategoriaForm } from "./CategoriaForm";
import {
  useCategorias,
  useCreateCategoria,
  useUpdateCategoria,
  useDeleteCategoria,
} from "@/hooks/queries/use-categorias";
import type { CreateCategoriaDto } from "@/modules/categorias/categoria.schema";

const { Text } = Typography;

interface CategoriaRow {
  id: string;
  name: string;
  color?: string | null;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  _count?: { products: number };
}

/**
 * Componente principal del modulo de Categorias.
 * Gestiona la tabla, modal de crear/editar y modal de confirmacion de borrado.
 */
export function CategoriasClient() {
  // Estado de paginacion y filtros
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");

  // Estado de modales
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<CategoriaRow | null>(null);
  const [deleteItem, setDeleteItem] = useState<CategoriaRow | null>(null);

  // Datos
  const { data, isLoading, refetch } = useCategorias({ search, page, pageSize });
  const createMutation = useCreateCategoria();
  const updateMutation = useUpdateCategoria();
  const deleteMutation = useDeleteCategoria();

  const items: CategoriaRow[] = data?.data ?? [];
  const total: number = data?.meta?.total ?? 0;

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleCreate = (formData: CreateCategoriaDto) => {
    createMutation.mutate(formData, {
      onSuccess: () => setCreateOpen(false),
    });
  };

  const handleUpdate = (formData: CreateCategoriaDto) => {
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

  const columns: DataTableColumn<CategoriaRow>[] = [
    {
      title: "Nombre",
      dataIndex: "name",
      key: "name",
      render: (name: string, row) => (
        <Space>
          <span
            style={{
              display: "inline-block",
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: row.color ?? "#1677ff",
              flexShrink: 0,
            }}
          />
          <Text strong>{name}</Text>
        </Space>
      ),
    },
    {
      title: "Color",
      dataIndex: "color",
      key: "color",
      width: 100,
      render: (color: string | null) => (
        <Tag
          color={color ?? "#1677ff"}
          style={{ color: "#fff", borderColor: "transparent" }}
        >
          {color ?? "#1677ff"}
        </Tag>
      ),
    },
    {
      title: "Descripcion",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (desc: string | null) =>
        desc ? (
          <Text type="secondary" style={{ fontSize: 12 }}>
            {desc}
          </Text>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: "Productos",
      key: "products",
      width: 90,
      align: "center",
      render: (_: unknown, row) => (
        <Badge count={row._count?.products ?? 0} showZero style={{ backgroundColor: "#52c41a" }} />
      ),
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
      title: "Creado",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 110,
      render: (date: string) =>
        new Date(date).toLocaleDateString("es-SV", { day: "2-digit", month: "short", year: "numeric" }),
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
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => setEditItem(row)}
            />
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
        title="Categorias"
        subtitle="Organiza tus productos por categorias"
        actions={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateOpen(true)}
          >
            Nueva Categoria
          </Button>
        }
      />

      <DataTable<CategoriaRow>
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
        searchPlaceholder="Buscar por nombre..."
        emptyText="No hay categorias registradas"
      />

      {/* Modal Crear */}
      <FormModal
        title="Nueva Categoria"
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={() => {
          const form = document.getElementById("categoria-form") as HTMLFormElement;
          form?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
        }}
        loading={createMutation.isPending}
        okText="Crear Categoria"
        width={480}
      >
        <CategoriaForm onSubmit={handleCreate} />
      </FormModal>

      {/* Modal Editar */}
      <FormModal
        title="Editar Categoria"
        open={!!editItem}
        onClose={() => setEditItem(null)}
        onSubmit={() => {
          const form = document.getElementById("categoria-form") as HTMLFormElement;
          form?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
        }}
        loading={updateMutation.isPending}
        okText="Guardar Cambios"
        width={480}
      >
        <CategoriaForm
          defaultValues={{
            name: editItem?.name ?? "",
            description: editItem?.description ?? "",
            color: editItem?.color ?? "#1677ff",
          }}
          onSubmit={handleUpdate}
        />
      </FormModal>

      {/* Modal Eliminar */}
      <ConfirmDelete
        open={!!deleteItem}
        name={deleteItem?.name}
        entityType="categoria"
        onConfirm={handleDelete}
        onCancel={() => setDeleteItem(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
