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
  /** Color de acento para el borde superior de la card */
  color?: string;
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
 *     { title: "Ventas", value: "$12,340", icon: <DollarOutlined />, change: 12.5, color: "#1677ff" },
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
            <Card
              size="small"
              style={{
                borderRadius: 12,
                border: "none",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              <Skeleton active paragraph={{ rows: 2 }} />
            </Card>
          </Col>
        ))}
      </Row>
    );
  }

  return (
    <Row gutter={[16, 16]}>
      {items.map((item) => {
        const isPositive = (item.change ?? 0) >= 0;
        const changeColor = isPositive ? "var(--color-success)" : "var(--color-error)";
        const changeBg = isPositive ? "rgba(82,196,26,0.1)" : "rgba(255,77,79,0.1)";

        return (
          <Col key={item.title} {...cols}>
            <Card
              size="small"
              style={{
                borderRadius: 12,
                border: "none",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                borderTop: item.color ? `3px solid ${item.color}` : undefined,
              }}
              styles={{ body: { padding: "16px 20px" } }}
            >
              {/* Header: titulo + icono */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {item.title}
                </Text>
                {/* Icono en circulo */}
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: item.iconBg ?? "#e6f4ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontSize: 18,
                  }}
                >
                  {item.icon}
                </div>
              </div>

              {/* Valor principal */}
              <Title
                level={3}
                style={{ margin: "0 0 8px 0", fontSize: 28, fontWeight: 700, lineHeight: 1 }}
              >
                {item.value}
              </Title>

              {/* Indicador de cambio */}
              {item.change !== undefined && (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 3,
                      background: changeBg,
                      color: changeColor,
                      borderRadius: 20,
                      padding: "2px 8px",
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    {isPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                    {Math.abs(item.change)}%
                  </span>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {item.changeLabel ?? "vs anterior"}
                  </Text>
                </div>
              )}

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
        );
      })}
    </Row>
  );
}
