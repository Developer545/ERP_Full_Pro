"use client";

import { useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Tabs,
  Card,
  Tag,
  Typography,
  Skeleton,
  Alert,
} from "antd";
import { SaveOutlined, SettingOutlined, FileTextOutlined } from "@ant-design/icons";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  updateConfiguracionSchema,
  type UpdateConfiguracionDto,
} from "@/modules/configuracion/configuracion.schema";
import { useConfiguracion, useUpdateConfiguracion } from "@/hooks/queries/use-configuracion";
import { PageHeader } from "@/components/ui/PageHeader";

const { Text } = Typography;

const PLAN_COLORS: Record<string, string> = {
  FREE: "default",
  BASIC: "blue",
  PRO: "purple",
  ENTERPRISE: "gold",
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "green",
  TRIAL: "orange",
  SUSPENDED: "red",
  CANCELLED: "red",
  PENDING_DELETION: "red",
};

/**
 * Componente de Configuracion del Tenant.
 * Muestra dos tabs: Empresa (info basica) y DTE (datos fiscales El Salvador).
 */
export function ConfiguracionClient() {
  const { data: config, isLoading } = useConfiguracion();
  const updateMutation = useUpdateConfiguracion();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateConfiguracionDto>({
    resolver: zodResolver(updateConfiguracionSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      logo: "",
      dte: {
        nit: "",
        nrc: "",
        actividadEconomica: "",
        codActividad: "",
        direccionFiscal: "",
        ambiente: "00",
      },
    },
  });

  // Rellenar formulario con datos existentes
  useEffect(() => {
    if (config) {
      const settings = (config.settings as Record<string, unknown>) ?? {};
      const dte = (config.dteConfig as Record<string, unknown>) ?? {};
      reset({
        name: config.name ?? "",
        email: (settings.email as string) ?? "",
        phone: (settings.phone as string) ?? "",
        address: (settings.address as string) ?? "",
        logo: (settings.logo as string) ?? "",
        dte: {
          nit: (dte.nit as string) ?? "",
          nrc: (dte.nrc as string) ?? "",
          actividadEconomica: (dte.actividadEconomica as string) ?? "",
          codActividad: (dte.codActividad as string) ?? "",
          direccionFiscal: (dte.direccionFiscal as string) ?? "",
          ambiente: (dte.ambiente as "00" | "01") ?? "00",
        },
      });
    }
  }, [config, reset]);

  const onSubmit = (data: UpdateConfiguracionDto) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Configuracion" subtitle="Datos de tu empresa" />
        <Card><Skeleton active paragraph={{ rows: 8 }} /></Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Configuracion"
        subtitle="Datos de tu empresa y configuracion del sistema"
        actions={
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={updateMutation.isPending}
            disabled={!isDirty}
            onClick={handleSubmit(onSubmit)}
          >
            Guardar Cambios
          </Button>
        }
      />

      {/* Info del plan */}
      <Card size="small" style={{ marginBottom: 16, borderRadius: 10 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>Plan: </Text>
            <Tag color={PLAN_COLORS[config?.plan ?? "FREE"]}>{config?.plan ?? "FREE"}</Tag>
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>Estado: </Text>
            <Tag color={STATUS_COLORS[config?.status ?? "TRIAL"]}>{config?.status ?? "TRIAL"}</Tag>
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>Slug: </Text>
            <Text code>{config?.slug}</Text>
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>Limite usuarios: </Text>
            <Text strong>{config?.maxUsers}</Text>
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>Limite productos: </Text>
            <Text strong>{config?.maxProducts}</Text>
          </div>
        </div>
      </Card>

      <Card style={{ borderRadius: 10 }}>
        <Tabs
          items={[
            {
              key: "empresa",
              label: (
                <span>
                  <SettingOutlined /> Empresa
                </span>
              ),
              children: (
                <Form layout="vertical" component="div">
                  {/* Nombre de la empresa */}
                  <Form.Item
                    label="Nombre de la Empresa"
                    validateStatus={errors.name ? "error" : ""}
                    help={errors.name?.message}
                  >
                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => (
                        <Input {...field} placeholder="Nombre comercial de la empresa" maxLength={200} />
                      )}
                    />
                  </Form.Item>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {/* Email */}
                    <Form.Item
                      label="Email de contacto"
                      validateStatus={errors.email ? "error" : ""}
                      help={errors.email?.message}
                    >
                      <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                          <Input {...field} value={field.value ?? ""} type="email" placeholder="contacto@empresa.com" />
                        )}
                      />
                    </Form.Item>

                    {/* Telefono */}
                    <Form.Item label="Telefono">
                      <Controller
                        name="phone"
                        control={control}
                        render={({ field }) => (
                          <Input {...field} value={field.value ?? ""} placeholder="2222-0000" />
                        )}
                      />
                    </Form.Item>
                  </div>

                  {/* Direccion */}
                  <Form.Item label="Direccion">
                    <Controller
                      name="address"
                      control={control}
                      render={({ field }) => (
                        <Input.TextArea
                          {...field}
                          value={field.value ?? ""}
                          rows={2}
                          placeholder="Direccion de la empresa"
                          maxLength={500}
                        />
                      )}
                    />
                  </Form.Item>

                  {/* Logo */}
                  <Form.Item
                    label="URL del Logo"
                    validateStatus={errors.logo ? "error" : ""}
                    help={errors.logo?.message}
                  >
                    <Controller
                      name="logo"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          placeholder="https://res.cloudinary.com/..."
                        />
                      )}
                    />
                  </Form.Item>
                </Form>
              ),
            },
            {
              key: "dte",
              label: (
                <span>
                  <FileTextOutlined /> Facturacion DTE
                </span>
              ),
              children: (
                <Form layout="vertical" component="div">
                  <Alert
                    type="info"
                    showIcon
                    message="Datos para Facturacion Electronica (DTE El Salvador)"
                    description="Estos datos se usaran en los comprobantes electronicos enviados al Ministerio de Hacienda."
                    style={{ marginBottom: 16 }}
                  />

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {/* NIT */}
                    <Form.Item label="NIT del Emisor">
                      <Controller
                        name="dte.nit"
                        control={control}
                        render={({ field }) => (
                          <Input {...field} value={field.value ?? ""} placeholder="0000-000000-000-0" />
                        )}
                      />
                    </Form.Item>

                    {/* NRC */}
                    <Form.Item label="NRC">
                      <Controller
                        name="dte.nrc"
                        control={control}
                        render={({ field }) => (
                          <Input {...field} value={field.value ?? ""} placeholder="000000-0" />
                        )}
                      />
                    </Form.Item>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 8 }}>
                    {/* Actividad Economica */}
                    <Form.Item label="Actividad Economica">
                      <Controller
                        name="dte.actividadEconomica"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            value={field.value ?? ""}
                            placeholder="Comercio al por menor"
                            maxLength={200}
                          />
                        )}
                      />
                    </Form.Item>

                    {/* Codigo Actividad */}
                    <Form.Item label="Codigo Actividad">
                      <Controller
                        name="dte.codActividad"
                        control={control}
                        render={({ field }) => (
                          <Input {...field} value={field.value ?? ""} placeholder="47110" maxLength={10} />
                        )}
                      />
                    </Form.Item>
                  </div>

                  {/* Direccion Fiscal */}
                  <Form.Item label="Direccion Fiscal">
                    <Controller
                      name="dte.direccionFiscal"
                      control={control}
                      render={({ field }) => (
                        <Input.TextArea
                          {...field}
                          value={field.value ?? ""}
                          rows={2}
                          placeholder="Direccion registrada en Hacienda"
                          maxLength={500}
                        />
                      )}
                    />
                  </Form.Item>
                </Form>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
