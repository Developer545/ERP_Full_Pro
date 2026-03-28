"use client";

import { useState } from "react";
import {
  Button, Modal, Form, Tag, Space, Select, message, Tooltip, Popconfirm,
  Upload, Alert, Typography,
} from "antd";
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  UploadOutlined, DownloadOutlined,
} from "@ant-design/icons";
import { DataTable } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { CuentaForm } from "./CuentaForm";
import {
  useCuentas,
  useCreateCuenta,
  useUpdateCuenta,
  useDeleteCuenta,
  useImportarCuentas,
  useImportarCatalogoEstandar,
} from "@/hooks/queries/use-cuentas";
import type { CuentaFiltros } from "@/modules/contabilidad/cuenta.types";

const { Text } = Typography;

const TIPO_COLOR: Record<string, string> = {
  ACTIVO: "blue", PASIVO: "red", CAPITAL: "purple", PATRIMONIO: "purple",
  INGRESO: "green", COSTO: "orange", GASTO: "volcano",
  CIERRE: "default", ORDEN_DEUDORA: "cyan", ORDEN_ACREEDORA: "magenta",
};

const TIPO_LABEL: Record<string, string> = {
  ACTIVO: "Activo", PASIVO: "Pasivo", CAPITAL: "Capital", PATRIMONIO: "Patrimonio",
  INGRESO: "Ingreso", COSTO: "Costo", GASTO: "Gasto",
  CIERRE: "Cierre", ORDEN_DEUDORA: "Orden Deudora", ORDEN_ACREEDORA: "Orden Acreedora",
};

export function CuentasClient() {
  const [filtros, setFiltros] = useState<CuentaFiltros>({ pageSize: 200 });
  const [modal, setModal] = useState<{ open: boolean; editing?: Record<string, unknown> }>({ open: false });
  const [importModal, setImportModal] = useState(false);
  const [importErrors, setImportErrors] = useState<Array<{ fila: number; codigo: string; error: string }>>([]);
  const [form] = Form.useForm();

  const { data, isLoading } = useCuentas(filtros);
  const createMutation = useCreateCuenta();
  const updateMutation = useUpdateCuenta();
  const deleteMutation = useDeleteCuenta();
  const importarMut = useImportarCuentas();
  const estandarMut = useImportarCatalogoEstandar();

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
      // form errors handled by antd
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

  const handleImportarEstandar = async () => {
    try {
      const res = await estandarMut.mutateAsync();
      message.success(`Catálogo importado: ${res.data.importadas} cuentas`);
    } catch (e: unknown) {
      message.error(e instanceof Error ? e.message : "Error al importar catálogo estándar");
    }
  };

  const handleArchivoExcel = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await importarMut.mutateAsync(formData as unknown as unknown[]);
      const { data: res } = result;
      if (res.errores.length > 0) {
        setImportErrors(res.errores);
        message.warning(`Importadas: ${res.importadas} | Con errores: ${res.errores.length}`);
      } else {
        message.success(`${res.importadas} cuentas importadas correctamente`);
        setImportModal(false);
      }
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : "Error al procesar el archivo");
    }
    return false;
  };

  const handleDescargarPlantilla = () => {
    window.open("/api/v1/cuentas/importar", "_blank");
  };

  const columns = [
    { title: "Código", dataIndex: "codigo", key: "codigo", width: 120 },
    { title: "Nombre", dataIndex: "nombre", key: "nombre" },
    {
      title: "Tipo",
      dataIndex: "tipo",
      key: "tipo",
      width: 110,
      render: (v: string) => <Tag color={TIPO_COLOR[v] ?? "default"}>{TIPO_LABEL[v] ?? v}</Tag>,
    },
    {
      title: "Naturaleza",
      dataIndex: "naturaleza",
      key: "naturaleza",
      width: 110,
      render: (v: string) => <Tag color={v === "DEUDORA" ? "cyan" : "magenta"}>{v === "DEUDORA" ? "Deudora" : "Acreedora"}</Tag>,
    },
    { title: "Nivel", dataIndex: "nivel", key: "nivel", width: 60, align: "center" as const },
    {
      title: "Movimiento",
      dataIndex: "permiteMovimiento",
      key: "permiteMovimiento",
      width: 120,
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
          <Popconfirm title="¿Eliminar esta cuenta?" onConfirm={() => handleDelete(record.id as string)}>
            <Tooltip title="Eliminar">
              <Button size="small" danger icon={<DeleteOutlined />} loading={deleteMutation.isPending} />
            </Tooltip>
          </Popconfirm>
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
            <Button icon={<UploadOutlined />} onClick={() => { setImportErrors([]); setImportModal(true); }}>
              Importar Excel
            </Button>
            <Popconfirm
              title="¿Importar catálogo estándar PYMES El Salvador?"
              description="Se importarán ~100 cuentas preconfiguradas. Solo funciona si el catálogo está vacío."
              onConfirm={handleImportarEstandar}
              okText="Importar"
            >
              <Button loading={estandarMut.isPending}>Catálogo Estándar SV</Button>
            </Popconfirm>
            <Button type="primary" icon={<PlusOutlined />} onClick={openNew}>Nueva cuenta</Button>
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

      <Modal
        title="Importar catálogo desde Excel"
        open={importModal}
        footer={null}
        onCancel={() => setImportModal(false)}
        width={560}
        destroyOnClose
      >
        <Space direction="vertical" style={{ width: "100%" }} size={12}>
          <Button icon={<DownloadOutlined />} onClick={handleDescargarPlantilla} block>
            Descargar plantilla Excel
          </Button>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Columnas: <strong>codigo, nombre, tipo, naturaleza, nivel, permiteMovimiento</strong>
            <br />Tipos: ACTIVO, PASIVO, CAPITAL, INGRESO, COSTO, GASTO
            <br />Naturaleza: DEUDORA o ACREEDORA | permiteMovimiento: SI o NO
          </Text>
          <Upload
            accept=".xlsx,.xls"
            showUploadList={false}
            beforeUpload={(file) => { handleArchivoExcel(file as unknown as File); return false; }}
          >
            <Button icon={<UploadOutlined />} loading={importarMut.isPending} block type="primary">
              Seleccionar archivo Excel
            </Button>
          </Upload>
          {importErrors.length > 0 && (
            <Alert
              type="warning"
              message={`${importErrors.length} filas con errores`}
              description={
                <ul style={{ margin: 0, paddingLeft: 16, fontSize: 11 }}>
                  {importErrors.slice(0, 10).map((e, i) => (
                    <li key={i}>Fila {e.fila} ({e.codigo}): {e.error}</li>
                  ))}
                  {importErrors.length > 10 && <li>...y {importErrors.length - 10} más</li>}
                </ul>
              }
              showIcon
            />
          )}
        </Space>
      </Modal>
    </>
  );
}
