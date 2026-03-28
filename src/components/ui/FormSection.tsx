"use client";
import type { ReactNode } from "react";
import { Divider, Typography, Space } from "antd";

const { Text } = Typography;

type SectionColor = "green" | "blue" | "orange" | "purple" | "red" | "default";

const COLOR_MAP: Record<SectionColor, string> = {
  green:   "#059669",
  blue:    "#2563eb",
  orange:  "#d97706",
  purple:  "#7c3aed",
  red:     "#dc2626",
  default: "rgba(0,0,0,0.45)",
};

interface FormSectionProps {
  /** Titulo de la seccion */
  title: string;
  /** Icono opcional */
  icon?: ReactNode;
  /** Color del titulo e icono */
  color?: SectionColor;
  /** Contenido (campos del formulario) */
  children: ReactNode;
}

/**
 * Separador de secciones para formularios.
 * Usa Divider de Ant Design — sin fondos de color, solo linea y texto sutil.
 *
 * @example
 * <FormSection title="Datos personales" icon={<UserOutlined />} color="green">
 *   <Form.Item label="Nombre">...</Form.Item>
 * </FormSection>
 */
export function FormSection({ title, icon, color = "default", children }: FormSectionProps) {
  const textColor = COLOR_MAP[color];

  return (
    <div style={{ marginBottom: 8 }}>
      <Divider style={{ margin: "0 0 16px 0", borderColor: "rgba(0,0,0,0.08)" }}>
        <Space size={5}>
          {icon && (
            <span style={{ color: textColor, fontSize: 13, display: "flex", alignItems: "center" }}>
              {icon}
            </span>
          )}
          <Text style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: textColor }}>
            {title}
          </Text>
        </Space>
      </Divider>
      {children}
    </div>
  );
}
