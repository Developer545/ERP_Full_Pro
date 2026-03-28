"use client";

import { useState } from "react";
import { Button, Tag, Tooltip, Space, Typography, Select } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { FormModal } from "@/components/ui/FormModal";
import { ConfirmDelete } from "@/components/ui/ConfirmDelete";
import { PageHeader } from "@/components/ui/PageHeader";
import { ClienteForm } from "./ClienteForm";
import {
  useClientes,
  useCreateCliente,
  useUpdateCliente,
  useDeleteCliente,
} from "@/hooks/queries/use-clientes";
import type { CreateClienteDto } from "@/modules/clientes/cliente.schema";

const { Text } = Typography;

interface ClienteRow {
  id: string;
  name: string;
  docType: string;
  docNumber?: string | null;
  email?: string | null;
  phone?: string | null;
  nit?: string | null;
  nrc?: string | null;
  address?: string | null;
  actividadEconomica?: string | null;
  creditLimit: number;
  creditDays: number;
  notes?: string | null;
  isActive: boolean;
  createdAt: string;
}

const DOC_TYPE_COLORS: Record<string, string> = {
  DUI: "blue",
  NIT: "purple",
  PASAPORTE: "orange",
  NRC: "cyan",
  OTRO: "default",
};

/**
 * Componente principal del modulo de Clientes.
 */
export function ClientesClient() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [docTypeFilter, setDocTypeFilter] = useState<string | undefined>();

  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<ClienteRow | null>(null);
  const [deleteItem, setDeleteItem] = useState<ClienteRow | null>(null);

  const { data, isLoading, refetch } = useClientes({
    search,
    docType: docTypeFilter as CreateClienteDto["docType"],
    page,
    pageSize,
  });

  const createMutation = useCreateCliente();
  const updateMutation = useUpdateCliente();
  const deleteMutation = useDeleteCliente();

  const items: ClienteRow[] = data?.data ?? [];
  const total: number = data?.meta?.total ?? 0;

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleCreate = (formData: CreateClienteDto) => {
    createMutation.mutate(formData, {
      onSuccess: () => setCreateOpen(false),
    });
  };

  const handleUpdate = (formData: CreateClienteDto) => {
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

  const columns: DataTableColumn<ClienteRow>[] = [
    {
      title: "Nombre",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: "Tipo Doc.",
      dataIndex: "docType",
      key: "docType",
      width: 90,
      render: (type: string) => (
        <Tag color={DOC_TYPE_COLORS[type] ?? "default"}>{type}</Tag>
      ),
    },
    {
      title: "Documento",
      dataIndex: "docNumber",
      key: "docNumber",
      width: 130,
      render: (doc: string | null) => (
        <Text type="secondary">{doc ?? "—"}</Text>
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
        title="Clientes"
        subtitle="Gestion de cartera de clientes"
        actions={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateOpen(true)}
          >
            Nuevo Cliente
          </Button>
        }
      />

      <DataTable<ClienteRow>
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
        searchPlaceholder="Buscar por nombre, email o documento..."
        emptyText="No hay clientes registrados"
        filterSlot={
          <Select
            placeholder="Tipo Doc."
            allowClear
            style={{ width: 110 }}
            value={docTypeFilter}
            onChange={(v) => { setDocTypeFilter(v); setPage(1); }}
            options={[
              { value: "DUI", label: "DUI" },
              { value: "NIT", label: "NIT" },
              { value: "PASAPORTE", label: "Pasaporte" },
              { value: "NRC", label: "NRC" },
              { value: "OTRO", label: "Otro" },
            ]}
          />
        }
        scrollX={950}
      />

      {/* Modal Crear */}
      <FormModal
        title="Nuevo Cliente"
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={() => {
          const form = document.getElementById("cliente-form") as HTMLFormElement;
          form?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
        }}
        loading={createMutation.isPending}
        okText="Crear Cliente"
        width={580}
      >
        <ClienteForm onSubmit={handleCreate} />
      </FormModal>

      {/* Modal Editar */}
      <FormModal
        title="Editar Cliente"
        open={!!editItem}
        onClose={() => setEditItem(null)}
        onSubmit={() => {
          const form = document.getElementById("cliente-form") as HTMLFormElement;
          form?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
        }}
        loading={updateMutation.isPending}
        okText="Guardar Cambios"
        width={580}
      >
        <ClienteForm
          defaultValues={{
            name: editItem?.name ?? "",
            docType: (editItem?.docType as CreateClienteDto["docType"]) ?? "DUI",
            docNumber: editItem?.docNumber ?? "",
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
        entityType="cliente"
        onConfirm={handleDelete}
        onCancel={() => setDeleteItem(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
