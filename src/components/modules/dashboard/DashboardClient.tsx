"use client";

import { Typography, Card, Table, Tag, Row, Col } from "antd";
import {
  DollarOutlined,
  FileTextOutlined,
  TeamOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import { KPICards, type KPIItem } from "@/components/ui/KPICards";
import { useDashboardKPIs } from "@/hooks/queries/use-dashboard";
import { CURRENCY } from "@/config/constants";

const { Title, Text } = Typography;

/** Calcula el cambio porcentual entre dos periodos */
function calcChange(current: number, previous: number): number | undefined {
  if (previous === 0) return undefined;
  return Math.round(((current - previous) / previous) * 100 * 10) / 10;
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "default",
  SENT: "blue",
  ACCEPTED: "green",
  REJECTED: "red",
  CANCELLED: "volcano",
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Borrador",
  SENT: "Enviado",
  ACCEPTED: "Aceptado",
  REJECTED: "Rechazado",
  CANCELLED: "Anulado",
};

/**
 * Dashboard Client — muestra KPIs reales y ultimas facturas.
 */
export function DashboardClient() {
  const { data: kpis, isLoading } = useDashboardKPIs();

  const formatCurrency = (val: number) =>
    `${CURRENCY.SYMBOL}${val.toLocaleString("es-SV", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const kpiItems: KPIItem[] = [
    {
      title: "Ventas del Mes",
      value: isLoading ? "..." : formatCurrency(kpis?.ventasMes ?? 0),
      icon: <DollarOutlined style={{ color: "#1677ff" }} />,
      iconBg: "#e6f4ff",
      change: kpis ? calcChange(kpis.ventasMes, kpis.ventasMesAnterior) : undefined,
      changeLabel: "vs mes anterior",
    },
    {
      title: "Facturas del Mes",
      value: isLoading ? "..." : kpis?.facturasMes ?? 0,
      icon: <FileTextOutlined style={{ color: "#52c41a" }} />,
      iconBg: "#f6ffed",
      change: kpis ? calcChange(kpis.facturasMes, kpis.facturasMesAnterior) : undefined,
      changeLabel: "vs mes anterior",
    },
    {
      title: "Clientes Activos",
      value: isLoading ? "..." : kpis?.clientesActivos ?? 0,
      icon: <TeamOutlined style={{ color: "#fa8c16" }} />,
      iconBg: "#fff7e6",
    },
    {
      title: "Productos en Stock",
      value: isLoading ? "..." : kpis?.productosStock ?? 0,
      icon: <ShoppingOutlined style={{ color: "#722ed1" }} />,
      iconBg: "#f9f0ff",
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>
          Dashboard
        </Title>
        <Text type="secondary">Resumen general de tu negocio</Text>
      </div>

      {/* KPI Cards */}
      <div style={{ marginBottom: 24 }}>
        <KPICards items={kpiItems} loading={isLoading} />
      </div>

      {/* Ultimas facturas */}
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card
            size="small"
            title="Ultimas Facturas"
            style={{ borderRadius: 10 }}
          >
            {kpis?.ultimasFacturas && kpis.ultimasFacturas.length > 0 ? (
              <Table
                size="small"
                dataSource={kpis.ultimasFacturas}
                rowKey="id"
                pagination={false}
                columns={[
                  {
                    title: "Correlativo",
                    dataIndex: "correlativo",
                    key: "correlativo",
                    width: 120,
                    render: (v: string, row: Record<string, unknown>) => (
                      <Text code style={{ fontSize: 11 }}>
                        {String(row.tipoDoc ?? "")}-{v}
                      </Text>
                    ),
                  },
                  {
                    title: "Cliente",
                    key: "customer",
                    render: (_: unknown, row: { customer?: { name: string } | null }) => (
                      <Text>{row.customer?.name ?? "Consumidor Final"}</Text>
                    ),
                  },
                  {
                    title: "Total",
                    dataIndex: "total",
                    key: "total",
                    align: "right" as const,
                    render: (total: number) => (
                      <Text strong style={{ color: "#52c41a" }}>
                        {formatCurrency(Number(total))}
                      </Text>
                    ),
                  },
                  {
                    title: "Estado",
                    dataIndex: "status",
                    key: "status",
                    render: (status: string) => (
                      <Tag color={STATUS_COLORS[status] ?? "default"}>
                        {STATUS_LABELS[status] ?? status}
                      </Tag>
                    ),
                  },
                  {
                    title: "Fecha",
                    dataIndex: "createdAt",
                    key: "createdAt",
                    render: (date: string) =>
                      new Date(date).toLocaleDateString("es-SV", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }),
                  },
                ]}
              />
            ) : (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <Text type="secondary">
                  {isLoading ? "Cargando..." : "No hay facturas registradas aun"}
                </Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
