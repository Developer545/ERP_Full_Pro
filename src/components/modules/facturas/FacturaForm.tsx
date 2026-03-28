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
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createFacturaSchema,
  type CreateFacturaDto,
} from "@/modules/facturas/factura.schema";
import { CURRENCY, IVA_RATE } from "@/config/constants";

const { Text } = Typography;

// ─── Constantes de dominio ────────────────────────────────────────────────────

const TIPOS_DOC_OPTIONS = [
  { value: "CCF", label: "CCF — Crédito Fiscal" },
  { value: "CF", label: "CF — Consumidor Final" },
  { value: "NC", label: "NC — Nota de Crédito" },
  { value: "ND", label: "ND — Nota de Débito" },
];

const METODOS_PAGO_OPTIONS = [
  { value: "CASH", label: "Efectivo" },
  { value: "CARD", label: "Tarjeta" },
  { value: "TRANSFER", label: "Transferencia" },
  { value: "CHECK", label: "Cheque" },
  { value: "CREDIT", label: "Crédito (CxC)" },
  { value: "MIXED", label: "Mixto" },
];

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface ClienteOption {
  id: string;
  name: string;
  docType?: string | null;
  docNumber?: string | null;
}

interface FacturaTotales {
  subtotal: number;
  iva: number;
  total: number;
}

interface FacturaFormProps {
  defaultValues?: Partial<CreateFacturaDto>;
  formId?: string;
  onSubmit: (data: CreateFacturaDto) => void;
}

// ─── Hook: fetch de clientes activos ─────────────────────────────────────────

function useClientesActivos() {
  const [clientes, setClientes] = useState<ClienteOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("/api/v1/clientes?isActive=true&pageSize=200")
      .then((r) => r.json())
      .then((json) => setClientes(json.data ?? []))
      .catch(() => setClientes([]))
      .finally(() => setLoading(false));
  }, []);

  return { clientes, loading };
}

// ─── Calculo de totales ───────────────────────────────────────────────────────

function calcularTotales(
  items: CreateFacturaDto["items"],
  descuentoGlobal: number
): FacturaTotales {
  let subtotalBase = 0;
  let ivaTotal = 0;

  for (const item of items) {
    const taxRate = item.taxRate ?? IVA_RATE;
    const baseGravada = item.unitPrice / (1 + taxRate);
    const lineaSubtotal = baseGravada * item.quantity - (item.discount ?? 0);
    const lineaIva = Math.max(0, lineaSubtotal) * taxRate;
    subtotalBase += Math.max(0, lineaSubtotal);
    ivaTotal += lineaIva;
  }

  const subtotal = Math.round(subtotalBase * 100) / 100;
  const iva = Math.round(ivaTotal * 100) / 100;
  const total =
    Math.round((subtotalBase + ivaTotal - (descuentoGlobal ?? 0)) * 100) / 100;

  return { subtotal, iva, total };
}

// ─── Componente ───────────────────────────────────────────────────────────────

/**
 * Formulario de Factura DTE — crear con tabla dinamica de items.
 */
export function FacturaForm({
  defaultValues,
  formId = "factura-form",
  onSubmit,
}: FacturaFormProps) {
  const { clientes, loading: loadingClientes } = useClientesActivos();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CreateFacturaDto>({
    resolver: zodResolver(createFacturaSchema),
    defaultValues: {
      tipoDoc: "CF",
      paymentMethod: "CASH",
      customerId: undefined,
      discount: 0,
      notes: "",
      items: [
        {
          description: "",
          quantity: 1,
          unitPrice: 0,
          discount: 0,
          taxRate: IVA_RATE,
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
  const watchedDiscount = watch("discount") ?? 0;

  const totales = calcularTotales(watchedItems ?? [], watchedDiscount);

  useEffect(() => {
    reset({
      tipoDoc: "CF",
      paymentMethod: "CASH",
      customerId: undefined,
      discount: 0,
      notes: "",
      items: [
        {
          description: "",
          quantity: 1,
          unitPrice: 0,
          discount: 0,
          taxRate: IVA_RATE,
        },
      ],
      ...defaultValues,
    });
  }, [defaultValues, reset]);

  const handleAddItem = () => {
    append({
      description: "",
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      taxRate: IVA_RATE,
    });
  };

  // Columnas de la tabla de items
  const itemColumns = [
    {
      title: "Descripción",
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
                placeholder="Descripción del producto/servicio"
                size="small"
              />
            )}
          />
        </Form.Item>
      ),
    },
    {
      title: "Cant.",
      key: "quantity",
      width: 90,
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
      title: "Precio Unit.",
      key: "unitPrice",
      width: 120,
      render: (_: unknown, __: unknown, index: number) => (
        <Form.Item
          style={{ margin: 0 }}
          validateStatus={errors.items?.[index]?.unitPrice ? "error" : ""}
        >
          <Controller
            name={`items.${index}.unitPrice`}
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
      width: 90,
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
      width: 100,
      align: "right" as const,
      render: (_: unknown, __: unknown, index: number) => {
        const item = watchedItems?.[index];
        if (!item) return null;
        const taxRate = item.taxRate ?? IVA_RATE;
        const lineTotal =
          item.unitPrice * item.quantity - (item.discount ?? 0);
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
        {/* Fila 1: Tipo Doc + Cliente + Método de Pago */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr", gap: 8 }}>
          {/* Tipo Documento */}
          <Form.Item
            label="Tipo Documento"
            required
            validateStatus={errors.tipoDoc ? "error" : ""}
            help={errors.tipoDoc?.message}
          >
            <Controller
              name="tipoDoc"
              control={control}
              render={({ field }) => (
                <Select {...field} options={TIPOS_DOC_OPTIONS} />
              )}
            />
          </Form.Item>

          {/* Cliente */}
          <Form.Item
            label="Cliente"
            validateStatus={errors.customerId ? "error" : ""}
            help={errors.customerId?.message}
          >
            <Controller
              name="customerId"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  allowClear
                  showSearch
                  loading={loadingClientes}
                  placeholder="Consumidor Final (opcional)"
                  optionFilterProp="label"
                  options={clientes.map((c) => ({
                    value: c.id,
                    label: c.docNumber
                      ? `${c.name} — ${c.docType}: ${c.docNumber}`
                      : c.name,
                  }))}
                />
              )}
            />
          </Form.Item>

          {/* Método de Pago */}
          <Form.Item
            label="Método de Pago"
            required
            validateStatus={errors.paymentMethod ? "error" : ""}
            help={errors.paymentMethod?.message}
          >
            <Controller
              name="paymentMethod"
              control={control}
              render={({ field }) => (
                <Select {...field} options={METODOS_PAGO_OPTIONS} />
              )}
            />
          </Form.Item>
        </div>

        {/* Tabla de Items */}
        <Divider titlePlacement="start" style={{ margin: "8px 0" }}>
          Items de la factura
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

        {/* Descuento global + Notas */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 8 }}>
          <Form.Item
            label="Descuento Global ($)"
            validateStatus={errors.discount ? "error" : ""}
            help={errors.discount?.message}
          >
            <Controller
              name="discount"
              control={control}
              render={({ field }) => (
                <InputNumber
                  {...field}
                  min={0}
                  step={0.01}
                  precision={2}
                  prefix={CURRENCY.SYMBOL}
                  style={{ width: "100%" }}
                />
              )}
            />
          </Form.Item>

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
        </div>

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
            {watchedDiscount > 0 && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                Descuento:&nbsp;
                <Text strong type="danger">
                  -{CURRENCY.SYMBOL}
                  {Number(watchedDiscount).toFixed(2)}
                </Text>
              </Text>
            )}
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
