"use client";

import { useEffect } from "react";
import { Form, Input, InputNumber, Select, Checkbox, Row, Col, DatePicker } from "antd";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  UserOutlined,
  IdcardOutlined,
  DollarOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  createEmpleadoSchema,
  TIPOS_CONTRATO,
  TIPOS_AFP,
  ESTADOS_EMPLEADO,
} from "@/modules/empleados/empleado.schema";
import { z } from "zod";
import { FormSection } from "@/components/ui/FormSection";

// ─── Labels ──────────────────────────────────────────────────────────────────

const CONTRATO_LABELS: Record<string, string> = {
  INDEFINIDO: "Indefinido",
  PLAZO_FIJO: "Plazo Fijo",
  TEMPORAL: "Temporal",
  HONORARIOS: "Honorarios",
};

const ESTADO_LABELS: Record<string, string> = {
  ACTIVO: "Activo",
  INACTIVO: "Inactivo",
  LICENCIA: "En Licencia",
  SUSPENDIDO: "Suspendido",
};

const GENERO_OPTIONS = [
  { value: "M", label: "Masculino" },
  { value: "F", label: "Femenino" },
];

/** Schema extendido para el formulario (incluye estado para edicion) */
export const empleadoFormSchema = createEmpleadoSchema.extend({
  estado: z.enum(ESTADOS_EMPLEADO).optional(),
});
export type EmpleadoFormValues = z.infer<typeof empleadoFormSchema>;

// ─── Props ────────────────────────────────────────────────────────────────────

interface EmpleadoFormProps {
  defaultValues?: Partial<EmpleadoFormValues>;
  formId?: string;
  isEdit?: boolean;
  onSubmit: (data: EmpleadoFormValues) => void;
}

// ─── Defaults ────────────────────────────────────────────────────────────────

const emptyDefaults: EmpleadoFormValues = {
  firstName: "",
  lastName: "",
  dui: "",
  nit: "",
  nss: "",
  nup: "",
  email: "",
  phone: "",
  address: "",
  birthDate: "",
  gender: undefined,
  cargo: "",
  departamento: "",
  fechaIngreso: "",
  tipoContrato: "INDEFINIDO",
  salarioBase: 0,
  tipoAFP: "CONFÍA",
  exentoISS: false,
  exentoAFP: false,
  exentoRenta: false,
  notes: "",
};

/**
 * Formulario de Empleado — crear y editar.
 */
export function EmpleadoForm({
  defaultValues,
  formId = "empleado-form",
  isEdit = false,
  onSubmit,
}: EmpleadoFormProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmpleadoFormValues>({
    resolver: zodResolver(empleadoFormSchema),
    defaultValues: { ...emptyDefaults, ...defaultValues },
  });

  useEffect(() => {
    reset({ ...emptyDefaults, ...defaultValues });
  }, [defaultValues, reset]);

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)}>
      <Form layout="vertical" component="div">

        {/* Seccion: Datos Personales */}
        <FormSection title="Datos Personales" icon={<UserOutlined />} color="green">
          <Row gutter={8}>
            {/* Nombre */}
            <Col xs={24} sm={12}>
              <Form.Item
                label="Nombre"
                required
                validateStatus={errors.firstName ? "error" : ""}
                help={errors.firstName?.message}
              >
                <Controller
                  name="firstName"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} placeholder="Nombre(s)" maxLength={100} />
                  )}
                />
              </Form.Item>
            </Col>

            {/* Apellido */}
            <Col xs={24} sm={12}>
              <Form.Item
                label="Apellido"
                required
                validateStatus={errors.lastName ? "error" : ""}
                help={errors.lastName?.message}
              >
                <Controller
                  name="lastName"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} placeholder="Apellido(s)" maxLength={100} />
                  )}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={8}>
            {/* DUI */}
            <Col xs={24} sm={12}>
              <Form.Item label="DUI">
                <Controller
                  name="dui"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} value={field.value ?? ""} placeholder="00000000-0" maxLength={20} />
                  )}
                />
              </Form.Item>
            </Col>

            {/* NIT */}
            <Col xs={24} sm={12}>
              <Form.Item label="NIT">
                <Controller
                  name="nit"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} value={field.value ?? ""} placeholder="0000-000000-000-0" maxLength={20} />
                  )}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={8}>
            {/* Genero */}
            <Col xs={24} sm={12}>
              <Form.Item label="Genero">
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      value={field.value ?? undefined}
                      allowClear
                      placeholder="Seleccionar..."
                      options={GENERO_OPTIONS}
                    />
                  )}
                />
              </Form.Item>
            </Col>

            {/* Fecha Nacimiento */}
            <Col xs={24} sm={12}>
              <Form.Item label="Fecha de Nacimiento">
                <Controller
                  name="birthDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      style={{ width: "100%" }}
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(date) =>
                        field.onChange(date ? date.format("YYYY-MM-DD") : "")
                      }
                      format="DD/MM/YYYY"
                      placeholder="dd/mm/aaaa"
                    />
                  )}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={8}>
            {/* Email */}
            <Col xs={24} sm={12}>
              <Form.Item
                label="Email"
                validateStatus={errors.email ? "error" : ""}
                help={errors.email?.message}
              >
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      type="email"
                      placeholder="correo@empresa.com"
                    />
                  )}
                />
              </Form.Item>
            </Col>

            {/* Telefono */}
            <Col xs={24} sm={12}>
              <Form.Item label="Telefono">
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} value={field.value ?? ""} placeholder="7000-0000" maxLength={20} />
                  )}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Direccion */}
          <Form.Item label="Direccion">
            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <Input {...field} value={field.value ?? ""} placeholder="Direccion del empleado" maxLength={500} />
              )}
            />
          </Form.Item>
        </FormSection>

        {/* Seccion: Datos Laborales */}
        <FormSection title="Datos Laborales" icon={<IdcardOutlined />} color="blue">
          <Row gutter={8}>
            {/* Cargo */}
            <Col xs={24} sm={12}>
              <Form.Item
                label="Cargo"
                required
                validateStatus={errors.cargo ? "error" : ""}
                help={errors.cargo?.message}
              >
                <Controller
                  name="cargo"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} placeholder="Ej: Vendedor, Contador..." maxLength={100} />
                  )}
                />
              </Form.Item>
            </Col>

            {/* Departamento */}
            <Col xs={24} sm={12}>
              <Form.Item label="Departamento">
                <Controller
                  name="departamento"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} value={field.value ?? ""} placeholder="Ej: Ventas, Contabilidad..." maxLength={100} />
                  )}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={8}>
            {/* Fecha de Ingreso */}
            <Col xs={24} sm={12}>
              <Form.Item
                label="Fecha de Ingreso"
                required
                validateStatus={errors.fechaIngreso ? "error" : ""}
                help={errors.fechaIngreso?.message}
              >
                <Controller
                  name="fechaIngreso"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      style={{ width: "100%" }}
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(date) =>
                        field.onChange(date ? date.format("YYYY-MM-DD") : "")
                      }
                      format="DD/MM/YYYY"
                      placeholder="dd/mm/aaaa"
                    />
                  )}
                />
              </Form.Item>
            </Col>

            {/* Tipo de Contrato */}
            <Col xs={24} sm={12}>
              <Form.Item label="Tipo de Contrato">
                <Controller
                  name="tipoContrato"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={TIPOS_CONTRATO.map((t) => ({
                        value: t,
                        label: CONTRATO_LABELS[t],
                      }))}
                    />
                  )}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Estado (solo en edicion) */}
          {isEdit && (
            <Row gutter={8}>
              <Col xs={24} sm={12}>
                <Form.Item label="Estado">
                  <Controller
                    name="estado"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        value={field.value ?? "ACTIVO"}
                        options={ESTADOS_EMPLEADO.map((e) => ({
                          value: e,
                          label: ESTADO_LABELS[e],
                        }))}
                      />
                    )}
                  />
                </Form.Item>
              </Col>
            </Row>
          )}

          <Row gutter={8}>
            {/* NSS */}
            <Col xs={24} sm={12}>
              <Form.Item label="NSS (ISSS)">
                <Controller
                  name="nss"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} value={field.value ?? ""} placeholder="Numero Seguro Social" maxLength={20} />
                  )}
                />
              </Form.Item>
            </Col>

            {/* NUP */}
            <Col xs={24} sm={12}>
              <Form.Item label="NUP (AFP)">
                <Controller
                  name="nup"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} value={field.value ?? ""} placeholder="Numero Unico Previsional" maxLength={20} />
                  )}
                />
              </Form.Item>
            </Col>
          </Row>
        </FormSection>

        {/* Seccion: Remuneracion */}
        <FormSection title="Remuneracion" icon={<DollarOutlined />} color="orange">
          <Row gutter={8}>
            {/* Salario Base */}
            <Col xs={24} sm={12}>
              <Form.Item
                label="Salario Base ($)"
                required
                validateStatus={errors.salarioBase ? "error" : ""}
                help={errors.salarioBase?.message}
              >
                <Controller
                  name="salarioBase"
                  control={control}
                  render={({ field }) => (
                    <InputNumber
                      {...field}
                      min={0.01}
                      step={0.01}
                      precision={2}
                      prefix="$"
                      style={{ width: "100%" }}
                      placeholder="0.00"
                    />
                  )}
                />
              </Form.Item>
            </Col>

            {/* Tipo AFP */}
            <Col xs={24} sm={12}>
              <Form.Item label="AFP">
                <Controller
                  name="tipoAFP"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={TIPOS_AFP.map((t) => ({ value: t, label: t }))}
                    />
                  )}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Exenciones */}
          <Row gutter={8}>
            <Col xs={24} sm={8}>
              <Form.Item style={{ marginBottom: 0 }}>
                <Controller
                  name="exentoISS"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value ?? false}
                      onChange={(e) => field.onChange(e.target.checked)}
                    >
                      Exento ISSS
                    </Checkbox>
                  )}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={8}>
              <Form.Item style={{ marginBottom: 0 }}>
                <Controller
                  name="exentoAFP"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value ?? false}
                      onChange={(e) => field.onChange(e.target.checked)}
                    >
                      Exento AFP
                    </Checkbox>
                  )}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={8}>
              <Form.Item style={{ marginBottom: 0 }}>
                <Controller
                  name="exentoRenta"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value ?? false}
                      onChange={(e) => field.onChange(e.target.checked)}
                    >
                      Exento Renta
                    </Checkbox>
                  )}
                />
              </Form.Item>
            </Col>
          </Row>
        </FormSection>

        {/* Seccion: Notas */}
        <FormSection title="Notas" icon={<FileTextOutlined />} color="purple">
          <Form.Item label="Notas" style={{ marginBottom: 0 }}>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <Input.TextArea
                  {...field}
                  value={field.value ?? ""}
                  rows={3}
                  placeholder="Observaciones adicionales..."
                  maxLength={1000}
                />
              )}
            />
          </Form.Item>
        </FormSection>

      </Form>
    </form>
  );
}
