"use client";

import { useState } from "react";
import {
  Button,
  Tag,
  Tooltip,
  Space,
  Typography,
  Select,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { FormModal } from "@/components/ui/FormModal";
import { ConfirmDelete } from "@/components/ui/ConfirmDelete";
import { PageHeader } from "@/components/ui/PageHeader";
import { KPICards } from "@/components/ui/KPICards";
import { EmpleadoForm } from "./EmpleadoForm";
import {
  useEmpleados,
  useCreateEmpleado,
  useUpdateEmpleado,
  useDeleteEmpleado,
} from "@/hooks/queries/use-empleados";
import type { EmpleadoRow } from "@/modules/empleados/empleado.types";
import type { CreateEmpleadoDto } from "@/modules/empleados/empleado.schema";
import type { EmpleadoFormValues } from "./EmpleadoForm";
import { CURRENCY } from "@/config/constants";

const { Text } = Typography;

// ─── Estado colors ────────────────────────────────────────────────────────────

const ESTADO_COLORS: Record<string, string> = {
  ACTIVO: "green",
  INACTIVO: "red",
  LICENCIA: "orange",
  SUSPENDIDO: "volcano",
};

const ESTADO_LABELS: Record<string, string> = {
  ACTIVO: "Activo",
  INACTIVO: "Inactivo",
  LICENCIA: "Licencia",
  SUSPENDIDO: "Suspendido",
};

const ESTADO_OPTIONS = [
  { value: "ACTIVO", label: "Activo" },
  { value: "INACTIVO", label: "Inactivo" },
  { value: "LICENCIA", label: "En Licencia" },
  { value: "SUSPENDIDO", label: "Suspendido" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  return `${CURRENCY.SYMBOL}${value.toLocaleString("es-SV", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value: string): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("es-SV", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return value;
  }
}

/**
 * Componente principal del modulo de Empleados.
 */
export function EmpleadosClient() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<string | undefined>();

  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<EmpleadoRow | null>(null);
  const [deleteItem, setDeleteItem] = useState<EmpleadoRow | null>(null);

  const { data, isLoading } = useEmpleados({
    search,
    estado: estadoFilter,
    page,
    pageSize,
  });

  const createMutation = useCreateEmpleado();
  const updateMutation = useUpdateEmpleado();
  const deleteMutation = useDeleteEmpleado();

  const items: EmpleadoRow[] = data?.data ?? [];
  const total: number = data?.meta?.total ?? 0;

  // ─── KPI Calculations ──────────────────────────────────────────────────────

  const activos = items.filter((e) => e.estado === "ACTIVO").length;
  const planillaMensual = items
    .filter((e) => e.estado === "ACTIVO")
    .reduce((sum, e) => sum + (Number(e.salarioBase) || 0), 0);
  const salarioPromedio = activos > 0 ? planillaMensual / activos : 0;

  const kpiItems = [
    {
      title: "Total Empleados",
      value: total,
      icon: <TeamOutlined style={{ color: "#1677ff" }} />,
      iconBg: "#e6f4ff",
      color: "#1677ff",
    },
    {
      title: "Activos",
      value: activos,
      icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
      iconBg: "rgba(82,196,26,0.1)",
      color: "#52c41a",
    },
    {
      title: "Planilla Est. Mensual",
      value: formatCurrency(planillaMensual),
      icon: <DollarOutlined style={{ color: "#d97706" }} />,
      iconBg: "rgba(217,119,6,0.1)",
      color: "#d97706",
      description: "Suma salarios activos",
    },
    {
      title: "Salario Promedio",
      value: formatCurrency(salarioPromedio),
      icon: <BarChartOutlined style={{ color: "#7c3aed" }} />,
      iconBg: "rgba(124,58,237,0.1)",
      color: "#7c3aed",
      description: "Promedio empleados activos",
    },
  ];

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleCreate = (formData: EmpleadoFormValues) => {
    createMutation.mutate(formData as CreateEmpleadoDto, {
      onSuccess: () => setCreateOpen(false),
    });
  };

  const handleUpdate = (formData: EmpleadoFormValues) => {
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

  const columns: DataTableColumn<EmpleadoRow>[] = [
    {
      title: "Nombre",
      key: "nombre",
      ellipsis: true,
      render: (_: unknown, row: EmpleadoRow) => (
        <Text strong>{`${row.firstName} ${row.lastName}`}</Text>
      ),
    },
    {
      title: "DUI",
      dataIndex: "dui",
      key: "dui",
      width: 120,
      render: (dui: string | null) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {dui ?? "—"}
        </Text>
      ),
    },
    {
      title: "Cargo",
      dataIndex: "cargo",
      key: "cargo",
      ellipsis: true,
      render: (cargo: string) => <Text>{cargo}</Text>,
    },
    {
      title: "Departamento",
      dataIndex: "departamento",
      key: "departamento",
      ellipsis: true,
      render: (dep: string | null) => (
        <Text type="secondary">{dep ?? "—"}</Text>
      ),
    },
    {
      title: "Salario",
      dataIndex: "salarioBase",
      key: "salarioBase",
      width: 110,
      align: "right",
      render: (salario: number) => (
        <Text style={{ fontVariantNumeric: "tabular-nums" }}>
          {formatCurrency(Number(salario))}
        </Text>
      ),
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      width: 100,
      align: "center",
      render: (estado: string) => (
        <Tag color={ESTADO_COLORS[estado] ?? "default"}>
          {ESTADO_LABELS[estado] ?? estado}
        </Tag>
      ),
    },
    {
      title: "F. Ingreso",
      dataIndex: "fechaIngreso",
      key: "fechaIngreso",
      width: 105,
      render: (fecha: string) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {formatDate(fecha)}
        </Text>
      ),
    },
    {
      title: "Acciones",
      key: "actions",
      width: 90,
      align: "center",
      fixed: "right",
      render: (_: unknown, row: EmpleadoRow) => (
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
        title="Empleados"
        subtitle="Gestion del personal de la empresa"
        actions={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateOpen(true)}
          >
            Nuevo Empleado
          </Button>
        }
      />

      {/* KPI Cards */}
      <div style={{ marginBottom: 16 }}>
        <KPICards items={kpiItems} loading={isLoading} />
      </div>

      <DataTable<EmpleadoRow>
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
        onRefresh={() => {
          // react-query refetch via invalidation
        }}
        searchPlaceholder="Buscar por nombre, cargo o DUI..."
        emptyText="No hay empleados registrados"
        filterSlot={
          <Select
            placeholder="Estado"
            allowClear
            style={{ width: 130 }}
            value={estadoFilter}
            onChange={(v) => {
              setEstadoFilter(v);
              setPage(1);
            }}
            options={ESTADO_OPTIONS}
          />
        }
        scrollX={1000}
      />

      {/* Modal Crear */}
      <FormModal
        title="Nuevo Empleado"
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={() => {
          const form = document.getElementById("empleado-form") as HTMLFormElement;
          form?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
        }}
        loading={createMutation.isPending}
        okText="Crear Empleado"
        width={700}
      >
        <EmpleadoForm onSubmit={handleCreate} />
      </FormModal>

      {/* Modal Editar */}
      <FormModal
        title="Editar Empleado"
        open={!!editItem}
        onClose={() => setEditItem(null)}
        onSubmit={() => {
          const form = document.getElementById("empleado-form") as HTMLFormElement;
          form?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
        }}
        loading={updateMutation.isPending}
        okText="Guardar Cambios"
        width={700}
      >
        <EmpleadoForm
          isEdit
          defaultValues={{
            firstName: editItem?.firstName ?? "",
            lastName: editItem?.lastName ?? "",
            dui: editItem?.dui ?? "",
            nit: editItem?.nit ?? "",
            nss: editItem?.nss ?? "",
            nup: editItem?.nup ?? "",
            email: editItem?.email ?? "",
            phone: editItem?.phone ?? "",
            address: editItem?.address ?? "",
            birthDate: editItem?.birthDate
              ? editItem.birthDate.split("T")[0]
              : "",
            gender: (editItem?.gender as "M" | "F" | null | undefined) ?? undefined,
            cargo: editItem?.cargo ?? "",
            departamento: editItem?.departamento ?? "",
            fechaIngreso: editItem?.fechaIngreso
              ? editItem.fechaIngreso.split("T")[0]
              : "",
            tipoContrato: (editItem?.tipoContrato as CreateEmpleadoDto["tipoContrato"]) ?? "INDEFINIDO",
            estado: editItem?.estado,
            salarioBase: Number(editItem?.salarioBase) || 0,
            tipoAFP: (editItem?.tipoAFP as CreateEmpleadoDto["tipoAFP"]) ?? "CONFÍA",
            exentoISS: editItem?.exentoISS ?? false,
            exentoAFP: editItem?.exentoAFP ?? false,
            exentoRenta: editItem?.exentoRenta ?? false,
            notes: editItem?.notes ?? "",
          }}
          onSubmit={handleUpdate}
        />
      </FormModal>

      {/* Modal Eliminar */}
      <ConfirmDelete
        open={!!deleteItem}
        name={deleteItem ? `${deleteItem.firstName} ${deleteItem.lastName}` : undefined}
        entityType="empleado"
        onConfirm={handleDelete}
        onCancel={() => setDeleteItem(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
