"use client";

import { useEffect, useState } from "react";
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Table,
  Typography,
  Divider,
  Space,
  DatePicker,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createCompraSchema,
  type CreateCompraSchemaDto,
} from "@/modules/compras/compras.schema";
import { CURRENCY, IVA_RATE } from "@/config/constants";
import dayjs from "dayjs";

const { Text } = Typography;

// ─── Tipos locales ────────────────────────────────────────────────────────────

interface ProveedorOption {
  id: string;
  name: string;
  nit?: string | null;
}

interface CompraTotales {
  subtotal: number;
  iva: number;
  total: number;
}

interface CompraFormProps {
  defaultValues?: Partial<CreateCompraSchemaDto>;
  formId?: string;
  onSubmit: (data: CreateCompraSchemaDto) => void;
}

// ─── Hook: fetch de proveedores activos ───────────────────────────────────────

function useProveedoresActivos() {
  const [proveedores, setProveedores] = useState<ProveedorOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("/api/v1/proveedores?isActive=true&pageSize=200")
      .then((r) => r.json())
      .then((json) => setProveedores(json.data ?? []))
      .catch(() => setProveedores([]))
      .finally(() => setLoading(false));
  }, []);

  return { proveedores, loading };
}

// ─── Calculo de totales ───────────────────────────────────────────────────────

function calcularTotalesOC(items: CreateCompraSchemaDto["items"]): CompraTotales {
  let subtotalBase = 0;
  let ivaTotal = 0;

  for (const item of items) {
    const taxRate = item.taxRate ?? IVA_RATE;
    const lineaSubtotal = item.unitCost * item.quantity - (item.discount ?? 0);
    const lineaIva = Math.max(0, lineaSubtotal) * taxRate;
    subtotalBase += Math.max(0, lineaSubtotal);
    ivaTotal += lineaIva;
  }

  const subtotal = Math.round(subtotalBase * 100) / 100;
  const iva = Math.round(ivaTotal * 100) / 100;
  const total = Math.round((subtotalBase + ivaTotal) * 100) / 100;

  return { subtotal, iva, total };
}

// ─── Componente ───────────────────────────────────────────────────────────────

/**
 * Formulario de Orden de Compra — crear con tabla dinamica de items.
 */
export function CompraForm({
  defaultValues,
  formId = "compra-form",
  onSubmit,
}: CompraFormProps) {
  const { proveedores, loading: loadingProveedores } = useProveedoresActivos();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CreateCompraSchemaDto>({
    resolver: zodResolver(createCompraSchema),
    defaultValues: {
      supplierId: undefined,
      reference: "",
      fechaEsperada: undefined,
      notes: "",
      items: [
        {
          description: "",
          quantity: 1,
          unitCost: 0,
          discount: 0,
          taxRate: IVA_RATE,
          subtotal: 0,
          ivaAmount: 0,
          total: 0,
        },
      ],
      ...defaultValues,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  // Observar cambios para totales en tiempo real
  const watchedItems = watch("items");
  const totales = calcularTotalesOC(watchedItems ?? []);

  useEffect(() => {
    reset({
      supplierId: undefined,
      reference: "",
      fechaEsperada: undefined,
      notes: "",
      items: [
        {
          description: "",
          quantity: 1,
          unitCost: 0,
          discount: 0,
          taxRate: IVA_RATE,
          subtotal: 0,
          ivaAmount: 0,
          total: 0,
        },
      ],
      ...defaultValues,
    });
  }, [defaultValues, reset]);

  const handleAddItem = () => {
    append({
      description: "",
      quantity: 1,
      unitCost: 0,
      discount: 0,
      taxRate: IVA_RATE,
      subtotal: 0,
      ivaAmount: 0,
      total: 0,
      quantityReceived: 0,
    });
  };

  // Columnas de la tabla de items
  const itemColumns = [
    {
      title: "Descripcion",
      key: "description",
      render: (_: unknown, __: unknown, index: number) => (
        <Form.Item
          style={{ margin: 0 }}
          validateStatus={errors.items?.[index]?.description ? "error" : ""}
          help={errors.items?.[index]?.description?.message}
        >
          <Controller
            name={`items.${index}.description`}
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="Descripcion del producto/servicio"
                size="small"
              />
            )}
          />
        </Form.Item>
      ),
    },
    {
      title: "Cantidad",
      key: "quantity",
      width: 100,
      render: (_: unknown, __: unknown, index: number) => (
        <Form.Item
          style={{ margin: 0 }}
          validateStatus={errors.items?.[index]?.quantity ? "error" : ""}
        >
          <Controller
            name={`items.${index}.quantity`}
            control={control}
            render={({ field }) => (
              <InputNumber
                {...field}
                min={0.01}
                step={1}
                precision={2}
                size="small"
                style={{ width: "100%" }}
              />
            )}
          />
        </Form.Item>
      ),
    },
    {
      title: "Costo Unit.",
      key: "unitCost",
      width: 120,
      render: (_: unknown, __: unknown, index: number) => (
        <Form.Item
          style={{ margin: 0 }}
          validateStatus={errors.items?.[index]?.unitCost ? "error" : ""}
        >
          <Controller
            name={`items.${index}.unitCost`}
            control={control}
            render={({ field }) => (
              <InputNumber
                {...field}
                min={0}
                step={0.01}
                precision={2}
                prefix={CURRENCY.SYMBOL}
                size="small"
                style={{ width: "100%" }}
              />
            )}
          />
        </Form.Item>
      ),
    },
    {
      title: "Desc.",
      key: "discount",
      width: 100,
      render: (_: unknown, __: unknown, index: number) => (
        <Form.Item style={{ margin: 0 }}>
          <Controller
            name={`items.${index}.discount`}
            control={control}
            render={({ field }) => (
              <InputNumber
                {...field}
                min={0}
                step={0.01}
                precision={2}
                prefix={CURRENCY.SYMBOL}
                size="small"
                style={{ width: "100%" }}
              />
            )}
          />
        </Form.Item>
      ),
    },
    {
      title: "IVA %",
      key: "taxRate",
      width: 80,
      render: (_: unknown, __: unknown, index: number) => {
        const item = watchedItems?.[index];
        const taxRate = item?.taxRate ?? IVA_RATE;
        return (
          <Text type="secondary" style={{ fontSize: 12 }}>
            {(taxRate * 100).toFixed(0)}%
          </Text>
        );
      },
    },
    {
      title: "Total",
      key: "total",
      width: 110,
      align: "right" as const,
      render: (_: unknown, __: unknown, index: number) => {
        const item = watchedItems?.[index];
        if (!item) return null;
        const taxRate = item.taxRate ?? IVA_RATE;
        const lineSubtotal = item.unitCost * item.quantity - (item.discount ?? 0);
        const lineTotal = Math.max(0, lineSubtotal) * (1 + taxRate);
        return (
          <Text strong style={{ fontSize: 12 }}>
            {CURRENCY.SYMBOL}
            {Math.max(0, lineTotal).toFixed(2)}
          </Text>
        );
      },
    },
    {
      title: "",
      key: "remove",
      width: 40,
      render: (_: unknown, __: unknown, index: number) => (
        <Button
          size="small"
          danger
          type="text"
          icon={<DeleteOutlined />}
          onClick={() => remove(index)}
          disabled={fields.length === 1}
        />
      ),
    },
  ];

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)}>
      <Form layout="vertical" component="div" size="small">
        {/* Fila 1: Proveedor + Referencia + Fecha Esperada */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 8 }}>
          {/* Proveedor */}
          <Form.Item
            label="Proveedor"
            required
            validateStatus={errors.supplierId ? "error" : ""}
            help={errors.supplierId?.message}
          >
            <Controller
              name="supplierId"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  showSearch
                  loading={loadingProveedores}
                  placeholder="Seleccionar proveedor"
                  optionFilterProp="label"
                  options={proveedores.map((p) => ({
                    value: p.id,
                    label: p.nit ? `${p.name} — NIT: ${p.nit}` : p.name,
                  }))}
                />
              )}
            />
          </Form.Item>

          {/* Referencia */}
          <Form.Item
            label="Referencia"
            validateStatus={errors.reference ? "error" : ""}
            help={errors.reference?.message}
          >
            <Controller
              name="reference"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder="No. factura proveedor"
                />
              )}
            />
          </Form.Item>

          {/* Fecha Esperada */}
          <Form.Item
            label="Fecha Esperada"
            validateStatus={errors.fechaEsperada ? "error" : ""}
          >
            <Controller
              name="fechaEsperada"
              control={control}
              render={({ field }) => (
                <DatePicker
                  style={{ width: "100%" }}
                  placeholder="Fecha de entrega"
                  format="DD/MM/YYYY"
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(date) =>
                    field.onChange(date ? date.format("YYYY-MM-DD") : null)
                  }
                />
              )}
            />
          </Form.Item>
        </div>

        {/* Tabla de Items */}
        <Divider titlePlacement="start" style={{ margin: "8px 0" }}>
          Items de la orden
        </Divider>

        {errors.items?.root && (
          <Text type="danger" style={{ fontSize: 12, display: "block", marginBottom: 8 }}>
            {errors.items.root.message}
          </Text>
        )}

        <Table
          dataSource={fields.map((f, i) => ({ ...f, _index: i }))}
          columns={itemColumns}
          rowKey="id"
          pagination={false}
          size="small"
          style={{ marginBottom: 8 }}
          scroll={{ x: 700 }}
        />

        <Button
          type="dashed"
          onClick={handleAddItem}
          icon={<PlusOutlined />}
          style={{ width: "100%", marginBottom: 16 }}
          size="small"
        >
          Agregar Item
        </Button>

        {/* Notas */}
        <Form.Item
          label="Notas"
          validateStatus={errors.notes ? "error" : ""}
          help={errors.notes?.message}
        >
          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <Input.TextArea
                {...field}
                value={field.value ?? ""}
                rows={2}
                placeholder="Observaciones opcionales..."
                maxLength={1000}
              />
            )}
          />
        </Form.Item>

        {/* Resumen de totales */}
        <Divider style={{ margin: "8px 0" }} />
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 24,
            paddingRight: 8,
          }}
        >
          <Space direction="vertical" size={2} style={{ textAlign: "right" }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Subtotal (sin IVA):&nbsp;
              <Text strong>
                {CURRENCY.SYMBOL}
                {totales.subtotal.toFixed(2)}
              </Text>
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              IVA (13%):&nbsp;
              <Text strong>
                {CURRENCY.SYMBOL}
                {totales.iva.toFixed(2)}
              </Text>
            </Text>
            <Text style={{ fontSize: 15 }}>
              Total:&nbsp;
              <Text strong style={{ fontSize: 16, color: "#52c41a" }}>
                {CURRENCY.SYMBOL}
                {totales.total.toFixed(2)}
              </Text>
            </Text>
          </Space>
        </div>
      </Form>
    </form>
  );
}
