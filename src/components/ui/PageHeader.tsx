"use client";

import type { ReactNode } from "react";
import { Typography, Space, Divider } from "antd";

const { Title, Text } = Typography;

interface PageHeaderProps {
  /** Titulo principal de la pagina */
  title: string;
  /** Subtitulo o descripcion */
  subtitle?: string;
  /** Acciones a la derecha (botones "Nuevo", "Exportar", etc.) */
  actions?: ReactNode;
  /** Extra info o filtros debajo del titulo */
  extra?: ReactNode;
  /** Mostrar divisor inferior */
  divider?: boolean;
}

/**
 * Header estandar de pagina para todos los modulos del ERP.
 *
 * Estructura:
 * ┌─────────────────────────────────────────┐
 * │ | Titulo           [actions]            │
 * │   Subtitulo                             │
 * │ [extra]                                 │
 * ├─────────────────────────────────────────┤ (divider opcional)
 * └─────────────────────────────────────────┘
 *
 * @example
 * <PageHeader
 *   title="Productos"
 *   subtitle="Gestion de catalogo de productos"
 *   actions={
 *     <Button type="primary" icon={<PlusOutlined />} onClick={onNew}>
 *       Nuevo Producto
 *     </Button>
 *   }
 * />
 */
export function PageHeader({
  title,
  subtitle,
  actions,
  extra,
  divider = true,
}: PageHeaderProps) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: extra ? 12 : 0,
        }}
      >
        {/* Titulo con acento izquierdo */}
        <div
          style={{
            borderLeft: "3px solid #1677ff",
            paddingLeft: 12,
          }}
        >
          <Title level={4} style={{ margin: 0, lineHeight: 1.3 }}>
            {title}
          </Title>
          {subtitle && (
            <Text type="secondary" style={{ fontSize: 13 }}>
              {subtitle}
            </Text>
          )}
        </div>

        {actions && (
          <Space wrap>
            {actions}
          </Space>
        )}
      </div>

      {extra && <div style={{ marginTop: 8 }}>{extra}</div>}

      {divider && <Divider style={{ margin: "12px 0 0 0" }} />}
    </div>
  );
}
