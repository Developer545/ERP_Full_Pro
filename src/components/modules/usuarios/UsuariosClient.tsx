"use client";

import { useState } from "react";
import {
  Button,
  Tag,
  Tooltip,
  Space,
  Typography,
  Modal,
  Alert,
  Input,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SafetyOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { FormModal } from "@/components/ui/FormModal";
import { ConfirmDelete } from "@/components/ui/ConfirmDelete";
import { PageHeader } from "@/components/ui/PageHeader";
import { UsuarioForm } from "./UsuarioForm";
import {
  useUsuarios,
  useCreateUsuario,
  useUpdateUsuario,
  useDeleteUsuario,
} from "@/hooks/queries/use-usuarios";
import type { CreateUsuarioDto } from "@/modules/usuarios/usuario.schema";

const { Text } = Typography;

interface UsuarioRow {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
}

/** Colores por rol */
const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: "magenta",
  ADMIN: "red",
  MANAGER: "blue",
  SELLER: "green",
  ACCOUNTANT: "purple",
  VIEWER: "default",
};

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  MANAGER: "Gerente",
  SELLER: "Vendedor",
  ACCOUNTANT: "Contador",
  VIEWER: "Lectura",
};

/**
 * Componente principal del modulo de Usuarios.
 */
export function UsuariosClient() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<UsuarioRow | null>(null);
  const [deleteItem, setDeleteItem] = useState<UsuarioRow | null>(null);

  // Estado para mostrar la contrasena temporal
  const [tempPasswordModal, setTempPasswordModal] = useState<{
    open: boolean;
    name: string;
    email: string;
    password: string;
  } | null>(null);

  const { data, isLoading, refetch } = useUsuarios({ search, page, pageSize });
  const createMutation = useCreateUsuario();
  const updateMutation = useUpdateUsuario();
  const deleteMutation = useDeleteUsuario();

  const items: UsuarioRow[] = data?.data ?? [];
  const total: number = data?.meta?.total ?? 0;

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleCreate = (formData: CreateUsuarioDto) => {
    createMutation.mutate(formData, {
      onSuccess: (result) => {
        setCreateOpen(false);
        // Mostrar contrasena temporal en modal
        setTempPasswordModal({
          open: true,
          name: result.usuario.name,
          email: result.usuario.email,
          password: result.tempPassword,
        });
      },
    });
  };

  const handleUpdate = (formData: CreateUsuarioDto) => {
    if (!editItem) return;
    updateMutation.mutate(
      { id: editItem.id, data: { name: formData.name, role: formData.role } },
      { onSuccess: () => setEditItem(null) }
    );
  };

  const handleDelete = () => {
    if (!deleteItem) return;
    deleteMutation.mutate(deleteItem.id, {
      onSuccess: () => setDeleteItem(null),
    });
  };

  const copyPassword = (pwd: string) => {
    navigator.clipboard.writeText(pwd);
    toast.success("Contrasena copiada al portapapeles");
  };

  // ─── Columnas ──────────────────────────────────────────────────────────────

  const columns: DataTableColumn<UsuarioRow>[] = [
    {
      title: "Nombre",
      dataIndex: "name",
      key: "name",
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      ellipsis: true,
      render: (email: string) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {email}
        </Text>
      ),
    },
    {
      title: "Rol",
      dataIndex: "role",
      key: "role",
      width: 110,
      render: (role: string) => (
        <Tag color={ROLE_COLORS[role] ?? "default"}>
          {ROLE_LABELS[role] ?? role}
        </Tag>
      ),
    },
    {
      title: "2FA",
      dataIndex: "twoFactorEnabled",
      key: "twoFactor",
      width: 70,
      align: "center",
      render: (enabled: boolean) =>
        enabled ? (
          <Tooltip title="2FA activo">
            <SafetyOutlined style={{ color: "#52c41a", fontSize: 16 }} />
          </Tooltip>
        ) : (
          <Tooltip title="2FA no activo">
            <SafetyOutlined style={{ color: "#d9d9d9", fontSize: 16 }} />
          </Tooltip>
        ),
    },
    {
      title: "Ultimo Acceso",
      dataIndex: "lastLoginAt",
      key: "lastLoginAt",
      width: 140,
      render: (date: string | null) =>
        date
          ? new Date(date).toLocaleString("es-SV", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })
          : <Text type="secondary">Nunca</Text>,
    },
    {
      title: "Estado",
      dataIndex: "isActive",
      key: "isActive",
      width: 90,
      align: "center",
      render: (active: boolean) =>
        active ? (
          <Tag icon={<CheckCircleOutlined />} color="green">Activo</Tag>
        ) : (
          <Tag icon={<CloseCircleOutlined />} color="red">Inactivo</Tag>
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
        title="Usuarios"
        subtitle="Gestion de usuarios y permisos del sistema"
        actions={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateOpen(true)}
          >
            Nuevo Usuario
          </Button>
        }
      />

      <DataTable<UsuarioRow>
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
        searchPlaceholder="Buscar por nombre o email..."
        emptyText="No hay usuarios registrados"
        scrollX={800}
      />

      {/* Modal Crear */}
      <FormModal
        title="Nuevo Usuario"
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={() => {
          const form = document.getElementById("usuario-form") as HTMLFormElement;
          form?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
        }}
        loading={createMutation.isPending}
        okText="Crear Usuario"
        width={480}
      >
        <UsuarioForm onSubmit={handleCreate} />
      </FormModal>

      {/* Modal Editar */}
      <FormModal
        title="Editar Usuario"
        open={!!editItem}
        onClose={() => setEditItem(null)}
        onSubmit={() => {
          const form = document.getElementById("usuario-form") as HTMLFormElement;
          form?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
        }}
        loading={updateMutation.isPending}
        okText="Guardar Cambios"
        width={480}
      >
        <UsuarioForm
          isEdit
          defaultValues={{
            name: editItem?.name ?? "",
            email: editItem?.email ?? "",
            role: (editItem?.role as CreateUsuarioDto["role"]) ?? "SELLER",
          }}
          onSubmit={handleUpdate}
        />
      </FormModal>

      {/* Modal Eliminar */}
      <ConfirmDelete
        open={!!deleteItem}
        name={deleteItem?.name}
        entityType="usuario"
        onConfirm={handleDelete}
        onCancel={() => setDeleteItem(null)}
        loading={deleteMutation.isPending}
        message={`¿Deseas eliminar al usuario "${deleteItem?.name}"? El usuario perdera acceso al sistema.`}
      />

      {/* Modal Contrasena Temporal */}
      <Modal
        title="Usuario creado exitosamente"
        open={!!tempPasswordModal?.open}
        onCancel={() => setTempPasswordModal(null)}
        footer={
          <Button type="primary" onClick={() => setTempPasswordModal(null)}>
            Entendido
          </Button>
        }
        width={440}
      >
        {tempPasswordModal && (
          <div>
            <Alert
              type="warning"
              showIcon
              message="Guarda esta contrasena"
              description="Esta contrasena temporal solo se mostrara una vez. Comparte con el usuario de forma segura."
              style={{ marginBottom: 16 }}
            />
            <p>
              <Text strong>Usuario: </Text>
              <Text>{tempPasswordModal.name} ({tempPasswordModal.email})</Text>
            </p>
            <p>
              <Text strong>Contrasena temporal: </Text>
            </p>
            <Input.Password
              value={tempPasswordModal.password}
              readOnly
              addonAfter={
                <Tooltip title="Copiar">
                  <CopyOutlined
                    style={{ cursor: "pointer" }}
                    onClick={() => copyPassword(tempPasswordModal.password)}
                  />
                </Tooltip>
              }
              style={{ fontSize: 16, letterSpacing: 2 }}
            />
            <p style={{ marginTop: 12, fontSize: 12, color: "#888" }}>
              El usuario debera cambiar esta contrasena en su primer inicio de sesion.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
