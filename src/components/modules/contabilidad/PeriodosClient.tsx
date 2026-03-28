"use client";

import { useState } from "react";
import {
  Button, Modal, Form, InputNumber, Select, Space, Tag, Tooltip,
  Popconfirm, message, Row, Col, Card, Statistic,
} from "antd";
import {
  PlusOutlined, LockOutlined, UnlockOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { DataTable } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  usePeriodos,
  useCreatePeriodo,
  useCerrarPeriodo,
  useReabrirPeriodo,
} from "@/hooks/queries/use-periodos";

const MESES = [
  { value: 1, label: "Enero" }, { value: 2, label: "Febrero" }, { value: 3, label: "Marzo" },
  { value: 4, label: "Abril" }, { value: 5, label: "Mayo" }, { value: 6, label: "Junio" },
  { value: 7, label: "Julio" }, { value: 8, label: "Agosto" }, { value: 9, label: "Septiembre" },
  { value: 10, label: "Octubre" }, { value: 11, label: "Noviembre" }, { value: 12, label: "Diciembre" },
];

export function PeriodosClient() {
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const anioActual = dayjs().year();

  const { data, isLoading } = usePeriodos({ pageSize: 100 });
  const createMut = useCreatePeriodo();
  const cerrarMut = useCerrarPeriodo();
  const reabrirMut = useReabrirPeriodo();

  const items: Array<Record<string, unknown>> = data?.data ?? [];

  const abiertos = items.filter((p) => p.estado === "ABIERTO").length;
  const cerrados = items.filter((p) => p.estado === "CERRADO").length;

  const handleCrear = async () => {
    try {
      const values = await form.validateFields();
      await createMut.mutateAsync(values);
      message.success("Período creado");
      setModalOpen(false);
      form.resetFields();
    } catch (e: unknown) {
      if (e instanceof Error) message.error(e.message);
    }
  };

  const handleCerrar = async (id: string) => {
    try {
      await cerrarMut.mutateAsync(id);
      message.success("Período cerrado");
    } catch (e: unknown) {
      message.error(e instanceof Error ? e.message : "Error al cerrar período");
    }
  };

  const handleReabrir = async (id: string) => {
    try {
      await reabrirMut.mutateAsync(id);
      message.success("Período reabierto");
    } catch (e: unknown) {
      message.error(e instanceof Error ? e.message : "Error al reabrir período");
    }
  };

  const columns = [
    { title: "Período", dataIndex: "nombre", key: "nombre", width: 160 },
    {
      title: "Fecha Inicio",
      dataIndex: "fechaInicio",
      key: "fechaInicio",
      width: 130,
      render: (v: string) => dayjs(v).format("DD/MM/YYYY"),
    },
    {
      title: "Fecha Fin",
      dataIndex: "fechaFin",
      key: "fechaFin",
      width: 130,
      render: (v: string) => dayjs(v).format("DD/MM/YYYY"),
    },
    {
      title: "Asientos",
      key: "asientos",
      width: 100,
      align: "center" as const,
      render: (_: unknown, r: Record<string, unknown>) => {
        const count = (r._count as Record<string, number>)?.entries ?? 0;
        return count;
      },
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      width: 110,
      render: (v: string) => (
        <Tag color={v === "ABIERTO" ? "green" : "red"} icon={v === "ABIERTO" ? <UnlockOutlined /> : <LockOutlined />}>
          {v === "ABIERTO" ? "Abierto" : "Cerrado"}
        </Tag>
      ),
    },
    {
      title: "",
      key: "acciones",
      width: 90,
      render: (_: unknown, record: Record<string, unknown>) => (
        <Space size={4}>
          {record.estado === "ABIERTO" ? (
            <Popconfirm
              title="¿Cerrar este período?"
              description="No podrás crear nuevos asientos en este período una vez cerrado."
              onConfirm={() => handleCerrar(record.id as string)}
              okText="Cerrar"
              okButtonProps={{ danger: true }}
            >
              <Tooltip title="Cerrar período">
                <Button size="small" danger icon={<LockOutlined />} loading={cerrarMut.isPending} />
              </Tooltip>
            </Popconfirm>
          ) : (
            <Popconfirm
              title="¿Reabrir este período?"
              onConfirm={() => handleReabrir(record.id as string)}
            >
              <Tooltip title="Reabrir período">
                <Button size="small" type="default" icon={<UnlockOutlined />} loading={reabrirMut.isPending} />
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
        title="Períodos Contables"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            Nuevo período
          </Button>
        }
      />

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card size="small" bordered={false} style={{ borderRadius: 10 }}>
            <Statistic title="Total períodos" value={items.length} />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small" bordered={false} style={{ borderRadius: 10 }}>
            <Statistic title="Abiertos" value={abiertos} valueStyle={{ color: "#52c41a" }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small" bordered={false} style={{ borderRadius: 10 }}>
            <Statistic title="Cerrados" value={cerrados} valueStyle={{ color: "#ff4d4f" }} />
          </Card>
        </Col>
      </Row>

      <DataTable
        columns={columns}
        dataSource={items}
        rowKey="id"
        loading={isLoading}
        total={data?.meta?.total ?? 0}
        pageSize={100}
      />

      <Modal
        title="Nuevo período contable"
        open={modalOpen}
        onOk={handleCrear}
        onCancel={() => setModalOpen(false)}
        confirmLoading={createMut.isPending}
        destroyOnClose
      >
        <Form form={form} layout="vertical" initialValues={{ anio: anioActual, mes: dayjs().month() + 1 }}>
          <Form.Item
            name="anio"
            label="Año"
            rules={[{ required: true, message: "El año es requerido" }]}
          >
            <InputNumber min={2000} max={2100} style={{ width: "100%" }} placeholder="2026" />
          </Form.Item>
          <Form.Item
            name="mes"
            label="Mes"
            rules={[{ required: true, message: "El mes es requerido" }]}
          >
            <Select options={MESES} placeholder="Selecciona el mes" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
