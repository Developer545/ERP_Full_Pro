"use client";

import { useEffect } from "react";
import { Form, Input, Select, InputNumber, Switch, Row, Col } from "antd";
import type { TipoCuenta, NaturalezaCuenta } from "@prisma/client";

const TIPOS: { value: TipoCuenta; label: string }[] = [
  { value: "ACTIVO",         label: "Activo" },
  { value: "PASIVO",         label: "Pasivo" },
  { value: "CAPITAL",        label: "Capital" },
  { value: "PATRIMONIO",     label: "Patrimonio" },
  { value: "INGRESO",        label: "Ingreso" },
  { value: "COSTO",          label: "Costo" },
  { value: "GASTO",          label: "Gasto" },
  { value: "CIERRE",         label: "Cierre" },
  { value: "ORDEN_DEUDORA",  label: "Orden Deudora" },
  { value: "ORDEN_ACREEDORA",label: "Orden Acreedora" },
];

const NATURALEZA_BY_TIPO: Record<TipoCuenta, NaturalezaCuenta> = {
  ACTIVO:          "DEUDORA",
  COSTO:           "DEUDORA",
  GASTO:           "DEUDORA",
  ORDEN_DEUDORA:   "DEUDORA",
  PASIVO:          "ACREEDORA",
  CAPITAL:         "ACREEDORA",
  PATRIMONIO:      "ACREEDORA",
  INGRESO:         "ACREEDORA",
  CIERRE:          "ACREEDORA",
  ORDEN_ACREEDORA: "ACREEDORA",
};

interface Props {
  form: ReturnType<typeof Form.useForm>[0];
  cuentas: Array<{ id: string; codigo: string; nombre: string }>;
  initialValues?: Record<string, unknown>;
}

export function CuentaForm({ form, cuentas, initialValues }: Props) {
  useEffect(() => {
    if (initialValues) form.setFieldsValue(initialValues);
  }, [form, initialValues]);

  return (
    <Form form={form} layout="vertical" size="small">
      <Row gutter={12}>
        <Col span={8}>
          <Form.Item name="codigo" label="Código" rules={[{ required: true }]}>
            <Input placeholder="1.1.1.01" maxLength={20} />
          </Form.Item>
        </Col>
        <Col span={16}>
          <Form.Item name="nombre" label="Nombre" rules={[{ required: true }]}>
            <Input placeholder="Caja General" maxLength={200} />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={8}>
          <Form.Item name="tipo" label="Tipo" rules={[{ required: true }]}>
            <Select
              options={TIPOS}
              onChange={(val: TipoCuenta) =>
                form.setFieldValue("naturaleza", NATURALEZA_BY_TIPO[val])
              }
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="naturaleza" label="Naturaleza" rules={[{ required: true }]}>
            <Select
              options={[
                { value: "DEUDORA", label: "Deudora (Débito aumenta)" },
                { value: "ACREEDORA", label: "Acreedora (Crédito aumenta)" },
              ]}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="nivel" label="Nivel" rules={[{ required: true }]}>
            <InputNumber min={1} max={6} style={{ width: "100%" }} />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item name="parentId" label="Cuenta padre (opcional)">
        <Select
          allowClear
          showSearch
          placeholder="Seleccionar cuenta padre"
          optionFilterProp="label"
          options={cuentas.map((c) => ({
            value: c.id,
            label: `${c.codigo} — ${c.nombre}`,
          }))}
        />
      </Form.Item>
      <Row gutter={12} align="middle">
        <Col span={12}>
          <Form.Item name="permiteMovimiento" label="Permite movimiento" valuePropName="checked">
            <Switch checkedChildren="Sí" unCheckedChildren="No" defaultChecked />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item name="notas" label="Notas">
        <Input.TextArea rows={2} maxLength={500} />
      </Form.Item>
    </Form>
  );
}
