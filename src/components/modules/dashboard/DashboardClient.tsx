"use client";

import { useMemo } from "react";
import { Typography, Card, Table, Tag, Row, Col } from "antd";
import {
  DollarOutlined,
  FileTextOutlined,
  TeamOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { KPICards, type KPIItem } from "@/components/ui/KPICards";
import { useDashboardKPIs } from "@/hooks/queries/use-dashboard";
import { useAuth } from "@/hooks/use-auth";
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

/** Nombres de dias de la semana en espanol */
const DIAS_SEMANA = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];

/** Nombres de meses en espanol */
const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

/** Genera datos de ejemplo para la grafica de ventas de los ultimos 7 dias */
function generarDatosEjemplo(): { dia: string; ventas: number }[] {
  const hoy = new Date();
  return Array.from({ length: 7 }).map((_, i) => {
    const fecha = new Date(hoy);
    fecha.setDate(hoy.getDate() - (6 - i));
    return {
      dia: DIAS_SEMANA[fecha.getDay()],
      ventas: Math.floor(Math.random() * 4000) + 500,
    };
  });
}

/**
 * Dashboard Client — muestra KPIs reales y ultimas facturas.
 */
export function DashboardClient() {
  const { data: kpis, isLoading } = useDashboardKPIs();
  const { user } = useAuth();

  const formatCurrency = (val: number) =>
    `${CURRENCY.SYMBOL}${val.toLocaleString("es-SV", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  /** Saludo dinamico segun la hora */
  const saludo = useMemo(() => {
    const hora = new Date().getHours();
    if (hora >= 5 && hora < 12) return "Buenos dias";
    if (hora >= 12 && hora < 19) return "Buenas tardes";
    return "Buenas noches";
  }, []);

  /** Fecha actual formateada en espanol */
  const fechaFormateada = useMemo(() => {
    const ahora = new Date();
    const diaSemana = DIAS_SEMANA[ahora.getDay()];
    const dia = ahora.getDate();
    const mes = MESES[ahora.getMonth()];
    const anio = ahora.getFullYear();
    const diasCompletos: Record<string, string> = {
      Dom: "Domingo", Lun: "Lunes", Mar: "Martes", Mie: "Miercoles",
      Jue: "Jueves", Vie: "Viernes", Sab: "Sabado",
    };
    return `${diasCompletos[diaSemana]}, ${dia} de ${mes} de ${anio}`;
  }, []);

  /** Datos para la grafica de ventas — usa facturas reales si hay, sino ejemplo */
  const datosGrafica = useMemo(() => {
    if (kpis?.ultimasFacturas && kpis.ultimasFacturas.length > 0) {
      // Agrupar facturas por dia de la ultima semana
      const hoy = new Date();
      const mapa: Record<string, number> = {};
      for (let i = 6; i >= 0; i--) {
        const fecha = new Date(hoy);
        fecha.setDate(hoy.getDate() - i);
        const key = DIAS_SEMANA[fecha.getDay()];
        mapa[key] = 0;
      }
      for (const factura of kpis.ultimasFacturas) {
        const fecha = new Date((factura as { createdAt: string }).createdAt);
        const diffDias = Math.floor((hoy.getTime() - fecha.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDias >= 0 && diffDias <= 6) {
          const key = DIAS_SEMANA[fecha.getDay()];
          if (key in mapa) {
            mapa[key] += Number((factura as { total: number }).total ?? 0);
          }
        }
      }
      return Object.entries(mapa).map(([dia, ventas]) => ({ dia, ventas }));
    }
    return generarDatosEjemplo();
  }, [kpis?.ultimasFacturas]);

  const kpiItems: KPIItem[] = [
    {
      title: "Ventas del Mes",
      value: isLoading ? "..." : formatCurrency(kpis?.ventasMes ?? 0),
      icon: <DollarOutlined style={{ color: "#1677ff" }} />,
      iconBg: "#e6f4ff",
      change: kpis ? calcChange(kpis.ventasMes, kpis.ventasMesAnterior) : undefined,
      changeLabel: "vs mes anterior",
      color: "#1677ff",
    },
    {
      title: "Facturas del Mes",
      value: isLoading ? "..." : kpis?.facturasMes ?? 0,
      icon: <FileTextOutlined style={{ color: "#52c41a" }} />,
      iconBg: "#f6ffed",
      change: kpis ? calcChange(kpis.facturasMes, kpis.facturasMesAnterior) : undefined,
      changeLabel: "vs mes anterior",
      color: "#52c41a",
    },
    {
      title: "Clientes Activos",
      value: isLoading ? "..." : kpis?.clientesActivos ?? 0,
      icon: <TeamOutlined style={{ color: "#fa8c16" }} />,
      iconBg: "#fff7e6",
      color: "#fa8c16",
    },
    {
      title: "Productos en Stock",
      value: isLoading ? "..." : kpis?.productosStock ?? 0,
      icon: <ShoppingOutlined style={{ color: "#722ed1" }} />,
      iconBg: "#f9f0ff",
      color: "#722ed1",
    },
  ];

  const nombreCorto = user?.name?.split(" ")[0] ?? "Usuario";

  return (
    <div>
      {/* Saludo y fecha */}
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>
          {saludo}, {nombreCorto}
        </Title>
        <Text type="secondary" style={{ fontSize: 13 }}>{fechaFormateada}</Text>
      </div>

      {/* KPI Cards */}
      <div style={{ marginBottom: 24 }}>
        <KPICards items={kpiItems} loading={isLoading} />
      </div>

      {/* Grafica de ventas ultimos 7 dias */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24}>
          <Card
            size="small"
            title="Ventas ultimos 7 dias"
            style={{ borderRadius: 10 }}
          >
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart
                data={datosGrafica}
                margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1677ff" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#1677ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis
                  dataKey="dia"
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) =>
                    v >= 1000 ? `${CURRENCY.SYMBOL}${(v / 1000).toFixed(1)}k` : `${CURRENCY.SYMBOL}${v}`
                  }
                />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), "Ventas"]}
                  contentStyle={{ borderRadius: 8, fontSize: 12 }}
                />
                <Area
                  type="monotone"
                  dataKey="ventas"
                  stroke="#1677ff"
                  strokeWidth={2}
                  fill="url(#salesGradient)"
                  dot={{ r: 3, fill: "#1677ff", strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

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
                scroll={{ x: "max-content" }}
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
