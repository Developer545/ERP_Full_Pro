"use client";

import { useState } from "react";
import { Button, Tag, Tooltip, Space, Typography } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { FormModal } from "@/components/ui/FormModal";
import { ConfirmDelete } from "@/components/ui/ConfirmDelete";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProveedorForm } from "./ProveedorForm";
import {
  useProveedores,
  useCreateProveedor,
  useUpdateProveedor,
  useDeleteProveedor,
} from "@/hooks/queries/use-proveedores";
import type { CreateProveedorDto } from "@/modules/proveedores/proveedor.schema";

const { Text } = Typography;

interface ProveedorRow {
  id: string;
  name: string;
  contactName?: string | null;
  email?: string | null;
  phone?: string | null;
  nit?: string | null;
  nrc?: string | null;
  address?: string | null;
  paymentDays: number;
  notes?: string | null;
  isActive: boolean;
  createdAt: string;
}

/**
 * Componente principal del modulo de Proveedores.
 */
export function ProveedoresClient() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<ProveedorRow | null>(null);
  const [deleteItem, setDeleteItem] = useState<ProveedorRow | null>(null);

  const { data, isLoading, refetch } = useProveedores({ search, page, pageSize });
  const createMutation = useCreateProveedor();
  const updateMutation = useUpdateProveedor();
  const deleteMutation = useDeleteProveedor();

  const items: ProveedorRow[] = data?.data ?? [];
  const total: number = data?.meta?.total ?? 0;

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleCreate = (formData: CreateProveedorDto) => {
    createMutation.mutate(formData, {
      onSuccess: () => setCreateOpen(false),
    });
  };

  const handleUpdate = (formData: CreateProveedorDto) => {
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

  const columns: DataTableColumn<ProveedorRow>[] = [
    {
      title: "Nombre",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: "Contacto",
      dataIndex: "contactName",
      key: "contactName",
      ellipsis: true,
      render: (contact: string | null) => (
        <Text type="secondary">{contact ?? "—"}</Text>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      ellipsis: true,
      render: (email: string | null) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {email ?? "—"}
        </Text>
      ),
    },
    {
      title: "Telefono",
      dataIndex: "phone",
      key: "phone",
      width: 110,
      render: (phone: string | null) => (
        <Text type="secondary">{phone ?? "—"}</Text>
      ),
    },
    {
      title: "NIT",
      dataIndex: "nit",
      key: "nit",
      width: 130,
      render: (nit: string | null) => (
        <Text type="secondary" style={{ fontSize: 11 }}>
          {nit ?? "—"}
        </Text>
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
        title="Proveedores"
        subtitle="Gestion de proveedores y contactos comerciales"
        actions={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateOpen(true)}
          >
            Nuevo Proveedor
          </Button>
        }
      />

      <DataTable<ProveedorRow>
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
        searchPlaceholder="Buscar por nombre, contacto o NIT..."
        emptyText="No hay proveedores registrados"
        scrollX={850}
      />

      {/* Modal Crear */}
      <FormModal
        title="Nuevo Proveedor"
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={() => {
          const form = document.getElementById("proveedor-form") as HTMLFormElement;
          form?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
        }}
        loading={createMutation.isPending}
        okText="Crear Proveedor"
        width={580}
      >
        <ProveedorForm onSubmit={handleCreate} />
      </FormModal>

      {/* Modal Editar */}
      <FormModal
        title="Editar Proveedor"
        open={!!editItem}
        onClose={() => setEditItem(null)}
        onSubmit={() => {
          const form = document.getElementById("proveedor-form") as HTMLFormElement;
          form?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
        }}
        loading={updateMutation.isPending}
        okText="Guardar Cambios"
        width={580}
      >
        <ProveedorForm
          defaultValues={{
            name: editItem?.name ?? "",
            contactName: editItem?.contactName ?? "",
            email: editItem?.email ?? "",
            phone: editItem?.phone ?? "",
            address: editItem?.address ?? "",
            nit: editItem?.nit ?? "",
            nrc: editItem?.nrc ?? "",
            notes: editItem?.notes ?? "",
          }}
          onSubmit={handleUpdate}
        />
      </FormModal>

      {/* Modal Eliminar */}
      <ConfirmDelete
        open={!!deleteItem}
        name={deleteItem?.name}
        entityType="proveedor"
        onConfirm={handleDelete}
        onCancel={() => setDeleteItem(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
