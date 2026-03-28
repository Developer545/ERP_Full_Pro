"use client";

import { useState } from "react";
import {
  Tag,
  Space,
  Typography,
  Select,
  Button,
  Modal,
  Form,
  InputNumber,
  Input,
  DatePicker,
  Popconfirm,
  ColorPicker,
  Row,
  Col,
  Statistic,
  Card,
  Divider,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  WalletOutlined,
  RiseOutlined,
  TagOutlined,
  AppstoreAddOutlined,
} from "@ant-design/icons";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { KPICards } from "@/components/ui/KPICards";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  useGastos,
  useGastosResumen,
  useGastosCategorias,
  useCreateGasto,
  useUpdateGasto,
  useDeleteGasto,
  useCreateCategoriaGasto,
} from "@/hooks/queries/use-gastos";
import { CURRENCY } from "@/config/constants";
import dayjs from "dayjs";
import type { GastoRow } from "@/modules/gastos/gastos.types";
import type { CreateGastoInput } from "@/modules/gastos/gastos.types";

const { Text } = Typography;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

const PAYMENT_LABELS: Record<string, string> = {
  CASH: "Efectivo",
  CARD: "Tarjeta",
  TRANSFER: "Transferencia",
  CHECK: "Cheque",
  CREDIT: "Crédito",
  MIXED: "Mixto",
};

const PAYMENT_COLORS: Record<string, string> = {
  CASH: "green",
  CARD: "blue",
  TRANSFER: "cyan",
  CHECK: "gold",
  CREDIT: "orange",
  MIXED: "purple",
};

export function GastosClient() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [paymentMethod, setPaymentMethod] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<[string, string] | undefined>();

  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<GastoRow | null>(null);
  const [catModalOpen, setCatModalOpen] = useState(false);

  const [form] = Form.useForm();
  const [catForm] = Form.useForm();

  const filtros = {
    search,
    categoryId,
    paymentMethod,
    from: dateRange?.[0],
    to: dateRange?.[1],
    page,
    pageSize,
  };

  const { data, isLoading } = useGastos(filtros);
  const { data: resumen } = useGastosResumen();
  const { data: categorias = [] } = useGastosCategorias();

  const createMutation = useCreateGasto();
  const updateMutation = useUpdateGasto();
  const deleteMutation = useDeleteGasto();
  const createCatMutation = useCreateCategoriaGasto();

  const items: GastoRow[] = data?.data ?? [];
  const total: number = data?.meta?.total ?? 0;

  const fmt = (v: number) =>
    `${CURRENCY.SYMBOL}${Number(v).toLocaleString("es-SV", { minimumFractionDigits: 2 })}`;

  // ─── Submit gasto ───────────────────────────────────────────────────────

  const handleSubmit = async (values: Record<string, unknown>) => {
    const payload: CreateGastoInput = {
      descripcion: values.descripcion as string,
      monto: values.monto as number,
      paymentMethod: values.paymentMethod as string,
      fecha: (values.fecha as ReturnType<typeof dayjs>).format("YYYY-MM-DD"),
      categoryId: values.categoryId as string | undefined,
      reference: values.reference as string | undefined,
      notes: values.notes as string | undefined,
    };

    if (editItem) {
      updateMutation.mutate(
        { id: editItem.id, data: payload },
        {
          onSuccess: () => {
            form.resetFields();
            setEditItem(null);
          },
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          form.resetFields();
          setCreateOpen(false);
        },
      });
    }
  };

  const handleEdit = (row: GastoRow) => {
    setEditItem(row);
    form.setFieldsValue({
      ...row,
      fecha: dayjs(row.fecha),
      categoryId: row.category?.id,
    });
    setCreateOpen(true);
  };

  const handleCreateCategoria = (values: { name: string; color?: string }) => {
    createCatMutation.mutate(
      { name: values.name, color: values.color },
      {
        onSuccess: () => {
          catForm.resetFields();
          setCatModalOpen(false);
        },
      }
    );
  };

  // ─── Columnas ───────────────────────────────────────────────────────────

  const columns: DataTableColumn<GastoRow>[] = [
    {
      title: "Fecha",
      dataIndex: "fecha",
      width: 100,
      render: (v: string) => dayjs(v).format("DD/MM/YYYY"),
    },
    {
      title: "Descripción",
      dataIndex: "descripcion",
      render: (v: string, row: GastoRow) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ fontSize: 13 }}>{v}</Text>
          {row.reference && (
            <Text type="secondary" style={{ fontSize: 11 }}>Ref: {row.reference}</Text>
          )}
        </Space>
      ),
    },
    {
      title: "Categoría",
      dataIndex: "category",
      width: 140,
      render: (_: unknown, row: GastoRow) =>
        row.category ? (
          <Tag color={row.category.color ?? "default"} style={{ fontSize: 11 }}>
            {row.category.name}
          </Tag>
        ) : (
          <Text type="secondary" style={{ fontSize: 11 }}>Sin categoría</Text>
        ),
    },
    {
      title: "Método",
      dataIndex: "paymentMethod",
      width: 120,
      render: (v: string) => (
        <Tag color={PAYMENT_COLORS[v] ?? "default"}>
          {PAYMENT_LABELS[v] ?? v}
        </Tag>
      ),
    },
    {
      title: "Monto",
      dataIndex: "monto",
      width: 110,
      align: "right" as const,
      render: (v: number) => (
        <Text strong style={{ color: "#cf1322" }}>{fmt(v)}</Text>
      ),
    },
    {
      title: "",
      key: "actions",
      width: 80,
      render: (_: unknown, row: GastoRow) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(row)}
          />
          <Popconfirm
            title="¿Eliminar este gasto?"
            onConfirm={() => deleteMutation.mutate(row.id)}
            okText="Sí"
            cancelText="No"
          >
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              loading={deleteMutation.isPending}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // ─── KPIs ────────────────────────────────────────────────────────────────

  const kpiItems = [
    {
      title: "Gasto del Mes",
      value: fmt(resumen?.totalMes ?? 0),
      icon: <WalletOutlined style={{ color: "#cf1322" }} />,
      iconBg: "#fff1f0",
      color: "#cf1322",
    },
    {
      title: "Mayor Gasto",
      value: resumen?.gastoMayor ? fmt(resumen.gastoMayor.monto) : fmt(0),
      icon: <RiseOutlined style={{ color: "#fa8c16" }} />,
      iconBg: "#fff7e6",
      color: "#fa8c16",
      description: resumen?.gastoMayor?.descripcion,
    },
    {
      title: "Categorías",
      value: resumen?.porCategoria?.length ?? 0,
      icon: <TagOutlined style={{ color: "#1677ff" }} />,
      iconBg: "#e6f4ff",
      color: "#1677ff",
    },
    {
      title: "Registros",
      value: total,
      icon: <AppstoreAddOutlined style={{ color: "#52c41a" }} />,
      iconBg: "#f6ffed",
      color: "#52c41a",
    },
  ];

  return (
    <div>
      <PageHeader
        title="Gastos"
        subtitle="Control de egresos y gastos operativos"
        actions={
          <Space>
            <Button icon={<TagOutlined />} onClick={() => setCatModalOpen(true)}>
              Categorías
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => { setEditItem(null); form.resetFields(); setCreateOpen(true); }}
            >
              Nuevo Gasto
            </Button>
          </Space>
        }
      />

      {/* KPIs */}
      <div style={{ marginBottom: 20 }}>
        <KPICards items={kpiItems} />
      </div>

      {/* Resumen por categoría */}
      {resumen?.porCategoria?.length > 0 && (
        <Card size="small" style={{ marginBottom: 16, borderRadius: 10 }}>
          <Row gutter={16}>
            {resumen.porCategoria.slice(0, 5).map((cat: { categoryId: string | null; categoryName: string; color?: string | null; total: number }) => (
              <Col key={cat.categoryId ?? "sin"} flex="auto">
                <Statistic
                  title={
                    <Tag color={cat.color ?? "default"} style={{ fontSize: 11 }}>
                      {cat.categoryName}
                    </Tag>
                  }
                  value={cat.total}
                  prefix={CURRENCY.SYMBOL}
                  precision={2}
                  valueStyle={{ fontSize: 14, color: "#cf1322" }}
                />
              </Col>
            ))}
          </Row>
        </Card>
      )}

      {/* Filtros */}
      <div style={{ marginBottom: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Input.Search
          placeholder="Buscar descripción..."
          allowClear
          style={{ width: 220 }}
          onSearch={setSearch}
          onChange={(e) => !e.target.value && setSearch("")}
        />
        <Select
          placeholder="Categoría"
          allowClear
          style={{ width: 160 }}
          onChange={setCategoryId}
          options={categorias.map((c: { id: string; name: string }) => ({ value: c.id, label: c.name }))}
        />
        <Select
          placeholder="Método de pago"
          allowClear
          style={{ width: 160 }}
          onChange={setPaymentMethod}
          options={Object.entries(PAYMENT_LABELS).map(([v, l]) => ({ value: v, label: l }))}
        />
        <RangePicker
          style={{ width: 240 }}
          format="DD/MM/YYYY"
          onChange={(_, strs) =>
            setDateRange(strs[0] && strs[1] ? [strs[0], strs[1]] : undefined)
          }
        />
      </div>

      <DataTable
        columns={columns}
        dataSource={items}
        loading={isLoading}
        rowKey="id"
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={(p: number, ps: number) => { setPage(p); setPageSize(ps); }}
      />

      {/* Modal crear/editar gasto */}
      <Modal
        title={editItem ? "Editar Gasto" : "Nuevo Gasto"}
        open={createOpen}
        onCancel={() => { setCreateOpen(false); setEditItem(null); form.resetFields(); }}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        width={520}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={12}>
            <Col span={16}>
              <Form.Item
                name="descripcion"
                label="Descripción"
                rules={[{ required: true, message: "Requerido" }]}
              >
                <Input placeholder="Ej: Pago servicios internet" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="fecha"
                label="Fecha"
                rules={[{ required: true, message: "Requerido" }]}
                initialValue={dayjs()}
              >
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="monto"
                label="Monto"
                rules={[{ required: true, message: "Requerido" }]}
              >
                <InputNumber
                  prefix={CURRENCY.SYMBOL}
                  min={0.01}
                  precision={2}
                  style={{ width: "100%" }}
                  placeholder="0.00"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="paymentMethod"
                label="Método de pago"
                rules={[{ required: true, message: "Requerido" }]}
                initialValue="CASH"
              >
                <Select options={Object.entries(PAYMENT_LABELS).map(([v, l]) => ({ value: v, label: l }))} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="categoryId" label="Categoría">
                <Select
                  allowClear
                  placeholder="Sin categoría"
                  showSearch
                  optionFilterProp="label"
                  options={categorias.map((c: { id: string; name: string }) => ({ value: c.id, label: c.name }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="reference" label="Referencia / N° comprobante">
                <Input placeholder="Opcional" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="notes" label="Notas">
            <TextArea rows={2} placeholder="Observaciones adicionales..." maxLength={500} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal categorías */}
      <Modal
        title="Categorías de Gastos"
        open={catModalOpen}
        onCancel={() => setCatModalOpen(false)}
        footer={null}
        width={420}
      >
        <Form form={catForm} layout="inline" onFinish={handleCreateCategoria} style={{ marginBottom: 16 }}>
          <Form.Item name="name" rules={[{ required: true, message: "Requerido" }]}>
            <Input placeholder="Nombre de categoría" />
          </Form.Item>
          <Form.Item name="color" initialValue="#1677ff">
            <ColorPicker format="hex" size="small" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<PlusOutlined />}
              loading={createCatMutation.isPending}
            >
              Agregar
            </Button>
          </Form.Item>
        </Form>
        <Divider style={{ margin: "8px 0" }} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {categorias.map((c: { id: string; name: string; color?: string | null }) => (
            <Tag key={c.id} color={c.color ?? "default"} style={{ fontSize: 12 }}>
              {c.name}
            </Tag>
          ))}
          {categorias.length === 0 && (
            <Text type="secondary">No hay categorías creadas aún.</Text>
          )}
        </div>
      </Modal>
    </div>
  );
}
