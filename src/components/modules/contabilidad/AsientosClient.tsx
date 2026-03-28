"use client";

import { useState } from "react";
import { Button, Modal, Form, Tag, Space, Tooltip, Popconfirm, message, Select, DatePicker } from "antd";
import { PlusOutlined, CheckCircleOutlined, StopOutlined, EyeOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { DataTable } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { AsientoForm } from "./AsientoForm";
import {
  useAsientos,
  useCreateAsiento,
  useUpdateAsiento,
  usePublicarAsiento,
  useAnularAsiento,
} from "@/hooks/queries/use-asientos";
import { useCuentas } from "@/hooks/queries/use-cuentas";
import { usePeriodos } from "@/hooks/queries/use-periodos";
import { useTiposAsiento } from "@/hooks/queries/use-tipos-asiento";
import type { AsientoFiltros } from "@/modules/contabilidad/asiento.types";

const ESTADO_COLOR: Record<string, string> = {
  BORRADOR: "gold", PUBLICADO: "green", ANULADO: "red",
};
const ESTADO_LABEL: Record<string, string> = {
  BORRADOR: "Borrador", PUBLICADO: "Publicado", ANULADO: "Anulado",
};

export function AsientosClient() {
  const [filtros, setFiltros] = useState<AsientoFiltros>({ pageSize: 20, page: 1 });
  const [modal, setModal] = useState<{ open: boolean; editing?: Record<string, unknown> }>({ open: false });
  const [form] = Form.useForm();

  const { data, isLoading } = useAsientos(filtros);
  const { data: cuentasData } = useCuentas({ soloMovimiento: true, pageSize: 500 });
  const { data: periodosData } = usePeriodos({ estado: "ABIERTO", pageSize: 100 });
  const { data: tiposData } = useTiposAsiento();

  const cuentas = cuentasData?.data ?? [];
  const periodos: Array<{ id: string; nombre: string }> = periodosData?.data ?? [];
  const tipos: Array<{ id: string; nombre: string; color: string }> = tiposData?.data ?? [];

  const createMutation = useCreateAsiento();
  const updateMutation = useUpdateAsiento();
  const publicarMut = usePublicarAsiento();
  const anularMut = useAnularAsiento();

  const items: Array<Record<string, unknown>> = data?.data ?? [];

  const openNew = () => {
    form.resetFields();
    form.setFieldsValue({
      tipo: "DIARIO",
      lines: [{ debe: 0, haber: 0 }, { debe: 0, haber: 0 }],
    });
    setModal({ open: true });
  };

  const openEdit = (record: Record<string, unknown>) => {
    form.resetFields();
    setModal({ open: true, editing: record });
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        fecha: values.fecha ? dayjs(values.fecha).format("YYYY-MM-DD") : undefined,
      };
      if (modal.editing) {
        await updateMutation.mutateAsync({ id: modal.editing.id as string, data: payload });
        message.success("Asiento actualizado");
      } else {
        await createMutation.mutateAsync(payload);
        message.success("Asiento creado");
      }
      setModal({ open: false });
    } catch {
      // handled by antd form
    }
  };

  const columns = [
    { title: "N°", dataIndex: "numero", key: "numero", width: 70 },
    {
      title: "Fecha",
      dataIndex: "fecha",
      key: "fecha",
      width: 110,
      render: (v: string) => dayjs(v).format("DD/MM/YYYY"),
    },
    {
      title: "Tipo",
      dataIndex: "tipo",
      key: "tipo",
      width: 90,
      render: (v: string) => {
        const t = tipos.find((t) => t.nombre === v);
        return <Tag color={t?.color ?? "blue"}>{v}</Tag>;
      },
    },
    { title: "Concepto", dataIndex: "concepto", key: "concepto" },
    {
      title: "Debe",
      dataIndex: "totalDebe",
      key: "totalDebe",
      width: 120,
      align: "right" as const,
      render: (v: number) => `$${Number(v).toFixed(2)}`,
    },
    {
      title: "Haber",
      dataIndex: "totalHaber",
      key: "totalHaber",
      width: 120,
      align: "right" as const,
      render: (v: number) => `$${Number(v).toFixed(2)}`,
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      width: 110,
      render: (v: string) => <Tag color={ESTADO_COLOR[v]}>{ESTADO_LABEL[v]}</Tag>,
    },
    {
      title: "",
      key: "acciones",
      width: 120,
      render: (_: unknown, record: Record<string, unknown>) => (
        <Space size={4}>
          {record.estado === "BORRADOR" && (
            <>
              <Tooltip title="Editar">
                <Button size="small" icon={<EyeOutlined />} onClick={() => openEdit(record)} />
              </Tooltip>
              <Popconfirm
                title="¿Publicar este asiento? No se podrá editar después."
                onConfirm={() => publicarMut.mutate(record.id as string, {
                  onSuccess: () => message.success("Asiento publicado"),
                  onError: (e) => message.error(e.message),
                })}
              >
                <Tooltip title="Publicar">
                  <Button size="small" type="primary" icon={<CheckCircleOutlined />} />
                </Tooltip>
              </Popconfirm>
            </>
          )}
          {record.estado === "PUBLICADO" && (
            <Popconfirm
              title="¿Anular este asiento?"
              onConfirm={() => anularMut.mutate(record.id as string, {
                onSuccess: () => message.success("Asiento anulado"),
                onError: (e) => message.error(e.message),
              })}
            >
              <Tooltip title="Anular">
                <Button size="small" danger icon={<StopOutlined />} />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Asientos Contables"
        extra={
          <Space>
            <Select
              allowClear
              placeholder="Estado"
              style={{ width: 130 }}
              options={Object.entries(ESTADO_LABEL).map(([v, l]) => ({ value: v, label: l }))}
              onChange={(v) => setFiltros((f) => ({ ...f, estado: v, page: 1 }))}
            />
            <Select
              allowClear
              placeholder="Período"
              style={{ width: 160 }}
              options={periodos.map((p) => ({ value: p.id, label: p.nombre }))}
              onChange={(v) => setFiltros((f) => ({ ...f, periodoId: v, page: 1 }))}
            />
            <DatePicker.RangePicker
              size="small"
              format="DD/MM/YYYY"
              onChange={(dates) =>
                setFiltros((f) => ({
                  ...f,
                  desde: dates?.[0]?.format("YYYY-MM-DD"),
                  hasta: dates?.[1]?.format("YYYY-MM-DD"),
                  page: 1,
                }))
              }
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={openNew}>Nuevo asiento</Button>
          </Space>
        }
      />

      <DataTable
        columns={columns}
        dataSource={items}
        rowKey="id"
        loading={isLoading}
        searchPlaceholder="Buscar por concepto..."
        onSearch={(v) => setFiltros((f) => ({ ...f, search: v, page: 1 }))}
        total={data?.meta?.total ?? 0}
        pageSize={filtros.pageSize ?? 20}
        page={filtros.page ?? 1}
        onPageChange={(p) => setFiltros((f) => ({ ...f, page: p }))}
      />

      <Modal
        title={modal.editing ? "Editar asiento" : "Nuevo asiento"}
        open={modal.open}
        onOk={handleOk}
        onCancel={() => setModal({ open: false })}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        width={860}
        destroyOnClose
      >
        <AsientoForm
          form={form}
          cuentas={cuentas}
          periodos={periodos}
          tipos={tipos}
          initialValues={modal.editing}
        />
      </Modal>
    </>
  );
}
