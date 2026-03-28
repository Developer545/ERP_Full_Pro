"use client";
import type { ReactNode } from "react";
import { Card, Typography, Space } from "antd";

const { Text } = Typography;

type SectionColor = "green" | "blue" | "orange" | "purple" | "red";

const COLOR_MAP: Record<SectionColor, { border: string; text: string; bg: string }> = {
  green:  { border: "#059669", text: "#059669", bg: "rgba(5,150,105,0.03)" },
  blue:   { border: "#2563eb", text: "#2563eb", bg: "rgba(37,99,235,0.03)" },
  orange: { border: "#d97706", text: "#d97706", bg: "rgba(217,119,6,0.03)" },
  purple: { border: "#7c3aed", text: "#7c3aed", bg: "rgba(124,58,237,0.03)" },
  red:    { border: "#dc2626", text: "#dc2626", bg: "rgba(220,38,38,0.03)" },
};

interface FormSectionProps {
  /** Titulo de la seccion */
  title: string;
  /** Icono opcional (elemento React, ej: <UserOutlined />) */
  icon?: ReactNode;
  /** Color del acento lateral */
  color?: SectionColor;
  /** Contenido (campos del formulario) */
  children: ReactNode;
}

/**
 * Agrupa campos de formulario en una seccion visual con acento de color.
 * Implementado 100% con Ant Design — sin clases CSS custom.
 *
 * @example
 * <FormSection title="Datos personales" icon={<UserOutlined />} color="green">
 *   <Form.Item label="Nombre">...</Form.Item>
 *   <Form.Item label="Email">...</Form.Item>
 * </FormSection>
 */
export function FormSection({ title, icon, color = "green", children }: FormSectionProps) {
  const c = COLOR_MAP[color];
  return (
    <Card
      size="small"
      style={{
        marginBottom: 16,
        borderLeft: `3px solid ${c.border}`,
        borderRadius: 8,
        background: c.bg,
        border: `1px solid ${c.border}22`,
        borderLeftColor: c.border,
        borderLeftWidth: 3,
      }}
      styles={{ body: { padding: "12px 16px" } }}
    >
      <Space style={{ marginBottom: 10 }}>
        {icon && <span style={{ color: c.text, display: "flex" }}>{icon}</span>}
        <Text strong style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", color: c.text }}>
          {title}
        </Text>
      </Space>
      {children}
    </Card>
  );
}
