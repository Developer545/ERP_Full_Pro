"use client";

import { useState } from "react";
import {
  Button,
  Card,
  Col,
  Row,
  Statistic,
  Table,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { DownloadOutlined, GiftOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/ui/PageHeader";
import { useAguinaldo } from "@/hooks/queries/use-aguinaldo";
import type { AguinaldoEmpleado } from "@/modules/aguinaldo/aguinaldo.types";

const { Text } = Typography;

function fmtUSD(value: number): string {
  return `$${value.toFixed(2)}`;
}

function fmtFecha(fecha: Date | string): string {
  const d = new Date(fecha);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

const columns: ColumnsType<AguinaldoEmpleado> = [
  {
    title: "Empleado",
    dataIndex: "nombre",
    key: "nombre",
    sorter: (a, b) => a.nombre.localeCompare(b.nombre),
    render: (nombre: string) => <Text strong>{nombre}</Text>,
  },
  {
    title: "Cargo",
    dataIndex: "cargo",
    key: "cargo",
  },
  {
    title: "Salario Base",
    dataIndex: "salarioBase",
    key: "salarioBase",
    align: "right",
    render: (v: number) => fmtUSD(v),
    sorter: (a, b) => a.salarioBase - b.salarioBase,
  },
  {
    title: "Fecha Ingreso",
    dataIndex: "fechaIngreso",
    key: "fechaIngreso",
    render: (v: Date) => fmtFecha(v),
  },
  {
    title: "Años Servicio",
    dataIndex: "aniosServicio",
    key: "aniosServicio",
    align: "center",
    sorter: (a, b) => a.aniosServicio - b.aniosServicio,
    render: (v: number) => `${v} año${v !== 1 ? "s" : ""}`,
  },
  {
    title: "Días",
    dataIndex: "diasAguinaldo",
    key: "diasAguinaldo",
    align: "center",
    render: (v: number) => (
      <Text strong style={{ color: "#ea580c" }}>
        {v}
      </Text>
    ),
  },
  {
    title: "Monto Aguinaldo",
    dataIndex: "montoAguinaldo",
    key: "montoAguinaldo",
    align: "right",
    sorter: (a, b) => a.montoAguinaldo - b.montoAguinaldo,
    render: (v: number) => (
      <Text strong style={{ color: "#16a34a" }}>
        {fmtUSD(v)}
      </Text>
    ),
  },
];

/**
 * Componente principal del modulo de Aguinaldo.
 * Muestra el total a pagar y la tabla detallada por empleado.
 */
export function AguinaldoClient() {
  const anioActual = new Date().getFullYear();
  const [anio] = useState(anioActual);

  const { data, isLoading } = useAguinaldo(anio);

  const total = data?.total ?? 0;
  const empleados = data?.empleados ?? [];
  const cantEmpleados = empleados.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <PageHeader
        title="Aguinaldo"
        subtitle={`Cálculo según Código de Trabajo SV — Año ${anio}`}
        extra={
          <Button
            icon={<DownloadOutlined />}
            disabled
            title="Exportar — próximamente"
          >
            Exportar Excel
          </Button>
        }
      />

      {/* KPIs */}
      <Row gutter={16}>
        <Col xs={24} sm={12} md={8}>
          <Card size="small" style={{ borderRadius: 10 }}>
            <Statistic
              title="Total Aguinaldo a Pagar"
              value={total}
              precision={2}
              prefix="$"
              valueStyle={{ color: "#ea580c", fontWeight: 700, fontSize: 22 }}
              suffix="USD"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card size="small" style={{ borderRadius: 10 }}>
            <Statistic
              title="Empleados con Derecho"
              value={cantEmpleados}
              prefix={<GiftOutlined style={{ marginRight: 4 }} />}
              valueStyle={{ color: "#1677ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card size="small" style={{ borderRadius: 10 }}>
            <Statistic
              title="Promedio por Empleado"
              value={cantEmpleados > 0 ? total / cantEmpleados : 0}
              precision={2}
              prefix="$"
              valueStyle={{ color: "#16a34a" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabla */}
      <Card size="small" style={{ borderRadius: 10 }} bodyStyle={{ padding: 0 }}>
        <Table<AguinaldoEmpleado>
          size="small"
          columns={columns}
          dataSource={empleados}
          rowKey="empleadoId"
          loading={isLoading}
          pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (t) => `${t} empleados` }}
          summary={() => (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={6}>
                <Text strong>TOTAL</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1} align="right">
                <Text strong style={{ color: "#ea580c" }}>
                  {fmtUSD(total)}
                </Text>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          )}
        />
      </Card>
    </div>
  );
}
