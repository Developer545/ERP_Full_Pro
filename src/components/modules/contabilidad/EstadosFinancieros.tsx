"use client";

import { useState } from "react";
import { Card, DatePicker, Button, Table, Typography, Space, Row, Col, Statistic, Tabs } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useSaldosCuentas } from "@/hooks/queries/use-asientos";

const { Title, Text } = Typography;

type SaldoCuenta = {
  codigo: string;
  nombre: string;
  tipo: string;
  naturaleza: string;
  debe: number;
  haber: number;
};

function calcSaldo(c: SaldoCuenta): number {
  return c.naturaleza === "DEUDORA" ? c.debe - c.haber : c.haber - c.debe;
}

function SaldosTable({ items, tipo }: { items: SaldoCuenta[]; tipo: string }) {
  const filtered = items.filter((c) => c.tipo === tipo);
  const total = filtered.reduce((s, c) => s + calcSaldo(c), 0);

  const columns = [
    { title: "Código", dataIndex: "codigo", key: "codigo", width: 120 },
    { title: "Cuenta", dataIndex: "nombre", key: "nombre" },
    {
      title: "Saldo",
      key: "saldo",
      width: 140,
      align: "right" as const,
      render: (_: unknown, r: SaldoCuenta) => (
        <Text style={{ color: calcSaldo(r) >= 0 ? "#1677ff" : "#ff4d4f" }}>
          ${calcSaldo(r).toFixed(2)}
        </Text>
      ),
    },
  ];

  return (
    <>
      <Table
        size="small"
        columns={columns}
        dataSource={filtered}
        rowKey="codigo"
        pagination={false}
        summary={() => (
          <Table.Summary>
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={2}><Text strong>Total</Text></Table.Summary.Cell>
              <Table.Summary.Cell index={2} align="right">
                <Text strong style={{ color: total >= 0 ? "#1677ff" : "#ff4d4f" }}>${total.toFixed(2)}</Text>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          </Table.Summary>
        )}
      />
    </>
  );
}

export function EstadosFinancieros() {
  const now = dayjs();
  const [desde, setDesde] = useState(now.startOf("year").format("YYYY-MM-DD"));
  const [hasta, setHasta] = useState(now.format("YYYY-MM-DD"));
  const [query, setQuery] = useState({ desde, hasta });

  const { data: saldos = [], isLoading } = useSaldosCuentas(query.desde, query.hasta);

  // Calculos para KPIs
  const totalActivo   = saldos.filter(c => c.tipo === "ACTIVO").reduce((s, c) => s + calcSaldo(c), 0);
  const totalPasivo   = saldos.filter(c => c.tipo === "PASIVO").reduce((s, c) => s + calcSaldo(c), 0);
  const totalCapital  = saldos.filter(c => c.tipo === "CAPITAL").reduce((s, c) => s + calcSaldo(c), 0);
  const totalIngreso  = saldos.filter(c => c.tipo === "INGRESO").reduce((s, c) => s + calcSaldo(c), 0);
  const totalCosto    = saldos.filter(c => c.tipo === "COSTO").reduce((s, c) => s + calcSaldo(c), 0);
  const totalGasto    = saldos.filter(c => c.tipo === "GASTO").reduce((s, c) => s + calcSaldo(c), 0);
  const utilidad      = totalIngreso - totalCosto - totalGasto;

  const tabItems = [
    {
      key: "balance",
      label: "Balance General",
      children: (
        <Row gutter={16}>
          <Col span={8}>
            <Title level={5}>Activos</Title>
            <SaldosTable items={saldos} tipo="ACTIVO" />
          </Col>
          <Col span={8}>
            <Title level={5}>Pasivos</Title>
            <SaldosTable items={saldos} tipo="PASIVO" />
          </Col>
          <Col span={8}>
            <Title level={5}>Capital</Title>
            <SaldosTable items={saldos} tipo="CAPITAL" />
            <Card size="small" style={{ marginTop: 8, background: "#f6ffed", borderRadius: 8 }}>
              <Text strong>Activo = ${totalActivo.toFixed(2)}</Text><br />
              <Text strong>Pasivo + Capital = ${(totalPasivo + totalCapital).toFixed(2)}</Text><br />
              <Text strong style={{ color: Math.abs(totalActivo - totalPasivo - totalCapital) < 0.01 ? "#52c41a" : "#ff4d4f" }}>
                Diferencia: ${Math.abs(totalActivo - totalPasivo - totalCapital).toFixed(2)}
              </Text>
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: "resultados",
      label: "Estado de Resultados",
      children: (
        <Row gutter={16}>
          <Col span={8}>
            <Title level={5}>Ingresos</Title>
            <SaldosTable items={saldos} tipo="INGRESO" />
          </Col>
          <Col span={8}>
            <Title level={5}>Costos</Title>
            <SaldosTable items={saldos} tipo="COSTO" />
          </Col>
          <Col span={8}>
            <Title level={5}>Gastos</Title>
            <SaldosTable items={saldos} tipo="GASTO" />
            <Card size="small" style={{ marginTop: 8, background: utilidad >= 0 ? "#f6ffed" : "#fff2f0", borderRadius: 8 }}>
              <Statistic
                title="Utilidad / Pérdida del período"
                value={Math.abs(utilidad)}
                prefix={utilidad >= 0 ? "+" : "-"}
                suffix="$"
                precision={2}
                valueStyle={{ color: utilidad >= 0 ? "#52c41a" : "#ff4d4f" }}
              />
            </Card>
          </Col>
        </Row>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        {[
          { title: "Total Activo",  value: totalActivo,  color: "#1677ff" },
          { title: "Total Pasivo",  value: totalPasivo,  color: "#ff4d4f" },
          { title: "Capital",       value: totalCapital, color: "#722ed1" },
          { title: "Utilidad",      value: utilidad,     color: utilidad >= 0 ? "#52c41a" : "#ff4d4f" },
        ].map((k) => (
          <Col span={6} key={k.title}>
            <Card size="small" bordered={false} style={{ borderRadius: 10 }}>
              <Statistic title={k.title} value={Math.abs(k.value)} prefix="$" precision={2} valueStyle={{ color: k.color }} />
            </Card>
          </Col>
        ))}
      </Row>

      <Card size="small" bordered={false} style={{ borderRadius: 10 }}>
        <Space style={{ marginBottom: 16 }}>
          <DatePicker.RangePicker
            size="small"
            format="DD/MM/YYYY"
            value={[dayjs(desde), dayjs(hasta)]}
            onChange={(dates) => {
              if (dates) {
                setDesde(dates[0]!.format("YYYY-MM-DD"));
                setHasta(dates[1]!.format("YYYY-MM-DD"));
              }
            }}
          />
          <Button
            size="small"
            type="primary"
            icon={<SearchOutlined />}
            loading={isLoading}
            onClick={() => setQuery({ desde, hasta })}
          >
            Generar
          </Button>
        </Space>

        <Tabs items={tabItems} />
      </Card>
    </div>
  );
}
