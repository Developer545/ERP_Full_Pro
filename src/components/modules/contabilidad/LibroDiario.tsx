"use client";

import { useState } from "react";
import { Card, DatePicker, Button, Table, Typography, Tag, Space, Statistic, Row, Col } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useAsientos } from "@/hooks/queries/use-asientos";

const { Title, Text } = Typography;

export function LibroDiario() {
  const now = dayjs();
  const [desde, setDesde] = useState(now.startOf("month").format("YYYY-MM-DD"));
  const [hasta, setHasta] = useState(now.endOf("month").format("YYYY-MM-DD"));
  const [query, setQuery] = useState({ desde, hasta });

  const { data, isLoading } = useAsientos({
    desde: query.desde,
    hasta: query.hasta,
    estado: "PUBLICADO",
    pageSize: 500,
  });

  const asientos = data?.data ?? [];
  const totalDebe  = asientos.reduce((s: number, a: Record<string, unknown>) => s + Number(a.totalDebe), 0);
  const totalHaber = asientos.reduce((s: number, a: Record<string, unknown>) => s + Number(a.totalHaber), 0);

  const columns = [
    {
      title: "N°",
      dataIndex: "numero",
      key: "numero",
      width: 70,
    },
    {
      title: "Fecha",
      dataIndex: "fecha",
      key: "fecha",
      width: 110,
      render: (v: string) => dayjs(v).format("DD/MM/YYYY"),
    },
    {
      title: "Concepto",
      dataIndex: "concepto",
      key: "concepto",
    },
    {
      title: "Líneas",
      dataIndex: "lines",
      key: "lines",
      render: (lines: Array<{ account: { codigo: string; nombre: string }; debe: number; haber: number; descripcion?: string }>) => (
        <div style={{ fontSize: 12 }}>
          {lines?.map((l, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
              <Text style={{ fontSize: 11 }}>{l.account?.codigo} — {l.account?.nombre}</Text>
              <Space size={16}>
                <Text style={{ fontSize: 11, color: "#1677ff", minWidth: 80, textAlign: "right" }}>
                  {Number(l.debe) > 0 ? `$${Number(l.debe).toFixed(2)}` : ""}
                </Text>
                <Text style={{ fontSize: 11, color: "#52c41a", minWidth: 80, textAlign: "right" }}>
                  {Number(l.haber) > 0 ? `$${Number(l.haber).toFixed(2)}` : ""}
                </Text>
              </Space>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Debe",
      dataIndex: "totalDebe",
      key: "totalDebe",
      width: 120,
      align: "right" as const,
      render: (v: number) => <Text style={{ color: "#1677ff" }}>${Number(v).toFixed(2)}</Text>,
    },
    {
      title: "Haber",
      dataIndex: "totalHaber",
      key: "totalHaber",
      width: 120,
      align: "right" as const,
      render: (v: number) => <Text style={{ color: "#52c41a" }}>${Number(v).toFixed(2)}</Text>,
    },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small" bordered={false} style={{ borderRadius: 10 }}>
            <Statistic title="Total Debe" value={totalDebe} prefix="$" precision={2} valueStyle={{ color: "#1677ff" }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" bordered={false} style={{ borderRadius: 10 }}>
            <Statistic title="Total Haber" value={totalHaber} prefix="$" precision={2} valueStyle={{ color: "#52c41a" }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" bordered={false} style={{ borderRadius: 10 }}>
            <Statistic title="Asientos" value={asientos.length} valueStyle={{ color: "#595959" }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" bordered={false} style={{ borderRadius: 10, background: Math.abs(totalDebe - totalHaber) < 0.01 ? "#f6ffed" : "#fff2f0" }}>
            <Statistic
              title="Balance"
              value={Math.abs(totalDebe - totalHaber)}
              prefix="$"
              precision={2}
              valueStyle={{ color: Math.abs(totalDebe - totalHaber) < 0.01 ? "#52c41a" : "#ff4d4f" }}
            />
          </Card>
        </Col>
      </Row>

      <Card size="small" bordered={false} style={{ borderRadius: 10 }}>
        <Space style={{ marginBottom: 12 }}>
          <Title level={5} style={{ margin: 0 }}>Libro Diario General</Title>
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
            onClick={() => setQuery({ desde, hasta })}
          >
            Consultar
          </Button>
        </Space>

        <Table
          size="small"
          columns={columns}
          dataSource={asientos}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 50, showSizeChanger: false }}
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={4}>
                  <Text strong>TOTALES</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4} align="right">
                  <Text strong style={{ color: "#1677ff" }}>${totalDebe.toFixed(2)}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={5} align="right">
                  <Text strong style={{ color: "#52c41a" }}>${totalHaber.toFixed(2)}</Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </Card>
    </div>
  );
}
