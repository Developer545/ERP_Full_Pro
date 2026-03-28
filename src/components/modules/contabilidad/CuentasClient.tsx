"use client";

import { useState } from "react";
import { Button, Modal, Form, Tag, Space, Select, message, Tooltip } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { DataTable } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { CuentaForm } from "./CuentaForm";
import {
  useCuentas,
  useCreateCuenta,
  useUpdateCuenta,
  useDeleteCuenta,
} from "@/hooks/queries/use-cuentas";
import type { CuentaFiltros } from "@/modules/contabilidad/cuenta.types";

const TIPO_COLOR: Record<string, string> = {
  ACTIVO:  "blue",
  PASIVO:  "red",
  CAPITAL: "purple",
  INGRESO: "green",
  COSTO:   "orange",
  GASTO:   "volcano",
};

const TIPO_LABEL: Record<string, string> = {
  ACTIVO: "Activo", PASIVO: "Pasivo", CAPITAL: "Capital",
  INGRESO: "Ingreso", COSTO: "Costo", GASTO: "Gasto",
};

export function CuentasClient() {
  const [filtros, setFiltros] = useState<CuentaFiltros>({ pageSize: 200 });
  const [modal, setModal] = useState<{ open: boolean; editing?: Record<string, unknown> }>({ open: false });
  const [form] = Form.useForm();

  const { data, isLoading } = useCuentas(filtros);
  const createMutation = useCreateCuenta();
  const updateMutation = useUpdateCuenta();
  const deleteMutation = useDeleteCuenta();

  const items: Array<{ id: string; codigo: string; nombre: string; [k: string]: unknown }> = data?.data ?? [];

  const openNew = () => {
    form.resetFields();
    form.setFieldsValue({ permiteMovimiento: true, nivel: 1 });
    setModal({ open: true });
  };

  const openEdit = (record: Record<string, unknown>) => {
    form.resetFields();
    setModal({ open: true, editing: record });
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (modal.editing) {
        await updateMutation.mutateAsync({ id: modal.editing.id as string, data: values });
        message.success("Cuenta actualizada");
      } else {
        await createMutation.mutateAsync(values);
        message.success("Cuenta creada");
      }
      setModal({ open: false });
    } catch {
      // Zod/form errors handled by antd
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      message.success("Cuenta eliminada");
    } catch (e: unknown) {
      message.error(e instanceof Error ? e.message : "Error al eliminar");
    }
  };

  const columns = [
    { title: "Código", dataIndex: "codigo", key: "codigo", width: 120 },
    { title: "Nombre", dataIndex: "nombre", key: "nombre" },
    {
      title: "Tipo",
      dataIndex: "tipo",
      key: "tipo",
      width: 100,
      render: (v: string) => <Tag color={TIPO_COLOR[v]}>{TIPO_LABEL[v]}</Tag>,
    },
    {
      title: "Naturaleza",
      dataIndex: "naturaleza",
      key: "naturaleza",
      width: 110,
      render: (v: string) => <Tag color={v === "DEUDORA" ? "cyan" : "magenta"}>{v === "DEUDORA" ? "Deudora" : "Acreedora"}</Tag>,
    },
    {
      title: "Nivel",
      dataIndex: "nivel",
      key: "nivel",
      width: 60,
      align: "center" as const,
    },
    {
      title: "Movimiento",
      dataIndex: "permiteMovimiento",
      key: "permiteMovimiento",
      width: 110,
      align: "center" as const,
      render: (v: boolean) => <Tag color={v ? "green" : "default"}>{v ? "Sí" : "Solo agrupadora"}</Tag>,
    },
    {
      title: "",
      key: "acciones",
      width: 80,
      render: (_: unknown, record: Record<string, unknown>) => (
        <Space size={4}>
          <Tooltip title="Editar">
            <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          </Tooltip>
          <Tooltip title="Eliminar">
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.id as string)}
              loading={deleteMutation.isPending}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Catálogo de Cuentas"
        extra={
          <Space>
            <Select
              allowClear
              placeholder="Filtrar por tipo"
              style={{ width: 160 }}
              options={Object.entries(TIPO_LABEL).map(([v, l]) => ({ value: v, label: l }))}
              onChange={(v) => setFiltros((f) => ({ ...f, tipo: v }))}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={openNew}>
              Nueva cuenta
            </Button>
          </Space>
        }
      />

      <DataTable
        columns={columns}
        dataSource={items}
        rowKey="id"
        loading={isLoading}
        searchPlaceholder="Buscar por código o nombre..."
        onSearch={(v) => setFiltros((f) => ({ ...f, search: v }))}
        total={data?.meta?.total ?? 0}
        pageSize={filtros.pageSize ?? 200}
      />

      <Modal
        title={modal.editing ? "Editar cuenta" : "Nueva cuenta"}
        open={modal.open}
        onOk={handleOk}
        onCancel={() => setModal({ open: false })}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        width={620}
        destroyOnClose
      >
        <CuentaForm form={form} cuentas={items} initialValues={modal.editing} />
      </Modal>
    </>
  );
}
