"use client";

import { useEffect } from "react";
import { Form, Input, DatePicker, Button, InputNumber, Select, Row, Col, Typography, Space, Divider } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;

interface Cuenta {
  id: string;
  codigo: string;
  nombre: string;
}

interface Props {
  form: ReturnType<typeof Form.useForm>[0];
  cuentas: Cuenta[];
  initialValues?: Record<string, unknown>;
}

export function AsientoForm({ form, cuentas, initialValues }: Props) {
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        fecha: initialValues.fecha ? dayjs(initialValues.fecha as string) : dayjs(),
      });
    } else {
      form.setFieldsValue({ fecha: dayjs() });
    }
  }, [form, initialValues]);

  const cuentaOptions = cuentas.map((c) => ({
    value: c.id,
    label: `${c.codigo} — ${c.nombre}`,
    key: c.id,
  }));

  return (
    <Form form={form} layout="vertical" size="small">
      <Row gutter={12}>
        <Col span={8}>
          <Form.Item name="fecha" label="Fecha" rules={[{ required: true }]}>
            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>
        </Col>
        <Col span={16}>
          <Form.Item name="concepto" label="Concepto" rules={[{ required: true }]}>
            <Input placeholder="Descripción del asiento" maxLength={500} />
          </Form.Item>
        </Col>
      </Row>

      <Divider plain>
        <Text type="secondary" style={{ fontSize: 12 }}>Líneas del asiento</Text>
      </Divider>

      <Form.List name="lines" rules={[{
        validator: async (_, lines) => {
          if (!lines || lines.length < 2) throw new Error("Mínimo 2 líneas");
          const debe  = lines.reduce((s: number, l: { debe?: number }) => s + (l?.debe ?? 0), 0);
          const haber = lines.reduce((s: number, l: { haber?: number }) => s + (l?.haber ?? 0), 0);
          if (Math.abs(debe - haber) > 0.01) throw new Error(`No cuadra: Debe ${debe.toFixed(2)} ≠ Haber ${haber.toFixed(2)}`);
        },
      }]}>
        {(fields, { add, remove }, { errors }) => (
          <>
            {/* Encabezado columnas */}
            <Row gutter={8} style={{ marginBottom: 4 }}>
              <Col flex="1"><Text type="secondary" style={{ fontSize: 11 }}>Cuenta</Text></Col>
              <Col style={{ width: 120 }}><Text type="secondary" style={{ fontSize: 11 }}>Descripción</Text></Col>
              <Col style={{ width: 110 }}><Text type="secondary" style={{ fontSize: 11 }}>Debe</Text></Col>
              <Col style={{ width: 110 }}><Text type="secondary" style={{ fontSize: 11 }}>Haber</Text></Col>
              <Col style={{ width: 32 }} />
            </Row>

            {fields.map(({ key, name }) => (
              <Row key={key} gutter={8} align="middle" style={{ marginBottom: 4 }}>
                <Col flex="1">
                  <Form.Item name={[name, "accountId"]} noStyle rules={[{ required: true }]}>
                    <Select
                      showSearch
                      optionFilterProp="label"
                      options={cuentaOptions}
                      placeholder="Seleccionar cuenta"
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
                <Col style={{ width: 120 }}>
                  <Form.Item name={[name, "descripcion"]} noStyle>
                    <Input placeholder="Detalle" maxLength={200} />
                  </Form.Item>
                </Col>
                <Col style={{ width: 110 }}>
                  <Form.Item name={[name, "debe"]} noStyle initialValue={0}>
                    <InputNumber min={0} precision={2} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col style={{ width: 110 }}>
                  <Form.Item name={[name, "haber"]} noStyle initialValue={0}>
                    <InputNumber min={0} precision={2} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col style={{ width: 32 }}>
                  <Button
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => remove(name)}
                  />
                </Col>
              </Row>
            ))}

            <Space style={{ marginTop: 8 }}>
              <Button
                size="small"
                icon={<PlusOutlined />}
                onClick={() => add({ debe: 0, haber: 0 })}
              >
                Agregar línea
              </Button>
            </Space>
            <Form.ErrorList errors={errors} />
          </>
        )}
      </Form.List>
    </Form>
  );
}
