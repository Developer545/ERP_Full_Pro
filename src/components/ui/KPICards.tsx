"use client";

import type { ReactNode } from "react";
import { Row, Col, Card, Typography, Skeleton } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";

const { Text, Title } = Typography;

export interface KPIItem {
  /** Titulo de la metrica */
  title: string;
  /** Valor principal (string para flexibilidad: "$1,234", "45%", "120") */
  value: string | number;
  /** Icono React */
  icon: ReactNode;
  /** Color de fondo del icono */
  iconBg?: string;
  /** Cambio porcentual vs periodo anterior (positivo = verde, negativo = rojo) */
  change?: number;
  /** Etiqueta del cambio (ej: "vs mes anterior") */
  changeLabel?: string;
  /** Tooltip o descripcion adicional */
  description?: string;
}

interface KPICardsProps {
  /** Array de metricas a mostrar */
  items: KPIItem[];
  /** Cargando datos */
  loading?: boolean;
  /** Columnas por breakpoint (default: xs=24 sm=12 lg=6) */
  cols?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

/**
 * Componente de tarjetas KPI para dashboards y cabeceras de modulos.
 *
 * Muestra metricas clave con icono, valor, y cambio porcentual.
 * Responsive por defecto (4 columnas en desktop, 2 en tablet, 1 en mobile).
 *
 * @example
 * <KPICards
 *   items={[
 *     { title: "Ventas", value: "$12,340", icon: <DollarOutlined />, change: 12.5 },
 *     { title: "Clientes", value: "340", icon: <TeamOutlined />, change: -3.2 },
 *   ]}
 *   loading={isLoading}
 * />
 */
export function KPICards({
  items,
  loading = false,
  cols = { xs: 24, sm: 12, lg: 6 },
}: KPICardsProps) {
  if (loading) {
    return (
      <Row gutter={[16, 16]}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Col key={i} {...cols}>
            <Card size="small" style={{ borderRadius: 10 }}>
              <Skeleton active paragraph={{ rows: 2 }} />
            </Card>
          </Col>
        ))}
      </Row>
    );
  }

  return (
    <Row gutter={[16, 16]}>
      {items.map((item) => (
        <Col key={item.title} {...cols}>
          <Card
            size="small"
            style={{ borderRadius: 10 }}
            styles={{ body: { padding: 20 } }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {/* Icono */}
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 12,
                  background: item.iconBg ?? "#e6f4ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  fontSize: 24,
                }}
              >
                {item.icon}
              </div>

              {/* Datos */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <Text
                  type="secondary"
                  style={{ fontSize: 12, display: "block" }}
                >
                  {item.title}
                </Text>

                <Title
                  level={4}
                  style={{ margin: "2px 0", lineHeight: 1.2 }}
                >
                  {item.value}
                </Title>

                {item.change !== undefined && (
                  <Text
                    style={{
                      fontSize: 11,
                      color: item.change >= 0 ? "#52c41a" : "#ff4d4f",
                    }}
                  >
                    {item.change >= 0 ? (
                      <ArrowUpOutlined />
                    ) : (
                      <ArrowDownOutlined />
                    )}{" "}
                    {Math.abs(item.change)}%{" "}
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {item.changeLabel ?? "vs anterior"}
                    </Text>
                  </Text>
                )}
              </div>
            </div>

            {item.description && (
              <Text
                type="secondary"
                style={{ fontSize: 11, marginTop: 8, display: "block" }}
              >
                {item.description}
              </Text>
            )}
          </Card>
        </Col>
      ))}
    </Row>
  );
}
