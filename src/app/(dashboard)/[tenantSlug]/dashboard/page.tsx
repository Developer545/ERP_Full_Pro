import type { Metadata } from "next";
import { Typography, Row, Col, Card } from "antd";
import {
  DashboardOutlined,
  ShoppingOutlined,
  TeamOutlined,
  DollarOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

export const metadata: Metadata = {
  title: "Dashboard | ERP Full Pro",
};

/**
 * Dashboard principal — pagina de inicio del ERP.
 * Fase 0: placeholder con estructura base.
 * Fase 1: KPIs reales desde BD (ventas, clientes, stock, etc.)
 */
export default function DashboardPage() {
  const kpis = [
    {
      title: "Ventas del Mes",
      value: "$0.00",
      icon: <DollarOutlined style={{ fontSize: 28, color: "#1677ff" }} />,
      color: "#e6f4ff",
      change: "—",
    },
    {
      title: "Facturas Emitidas",
      value: "0",
      icon: <ShoppingOutlined style={{ fontSize: 28, color: "#52c41a" }} />,
      color: "#f6ffed",
      change: "—",
    },
    {
      title: "Clientes Activos",
      value: "0",
      icon: <TeamOutlined style={{ fontSize: 28, color: "#fa8c16" }} />,
      color: "#fff7e6",
      change: "—",
    },
    {
      title: "Productos en Stock",
      value: "0",
      icon: <DashboardOutlined style={{ fontSize: 28, color: "#722ed1" }} />,
      color: "#f9f0ff",
      change: "—",
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>
          Dashboard
        </Title>
        <Text type="secondary">
          Resumen general de tu negocio
        </Text>
      </div>

      {/* KPI Cards — Fase 1: conectar con datos reales */}
      <Row gutter={[16, 16]}>
        {kpis.map((kpi) => (
          <Col key={kpi.title} xs={24} sm={12} lg={6}>
            <Card
              size="small"
              style={{ borderRadius: 10 }}
              styles={{ body: { padding: 20 } }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 12,
                    background: kpi.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {kpi.icon}
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {kpi.title}
                  </Text>
                  <div>
                    <Text strong style={{ fontSize: 22 }}>
                      {kpi.value}
                    </Text>
                  </div>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    vs mes anterior: {kpi.change}
                  </Text>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Placeholder para graficas — Fase 1 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card
            size="small"
            title="Ventas de los ultimos 30 dias"
            style={{ borderRadius: 10 }}
            styles={{ body: { height: 240, display: "flex", alignItems: "center", justifyContent: "center" } }}
          >
            <Text type="secondary">Grafica disponible en Fase 1</Text>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            size="small"
            title="Ultimas transacciones"
            style={{ borderRadius: 10 }}
            styles={{ body: { height: 240, display: "flex", alignItems: "center", justifyContent: "center" } }}
          >
            <Text type="secondary">Datos disponibles en Fase 1</Text>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
