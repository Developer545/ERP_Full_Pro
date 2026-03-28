"use client";

import { useEffect } from "react";
import { Form, Input, Select } from "antd";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClienteSchema, type CreateClienteDto, DOC_TYPES } from "@/modules/clientes/cliente.schema";

interface ClienteFormProps {
  defaultValues?: Partial<CreateClienteDto>;
  formId?: string;
  onSubmit: (data: CreateClienteDto) => void;
}

const DOC_LABELS: Record<string, string> = {
  DUI: "DUI",
  NIT: "NIT",
  PASAPORTE: "Pasaporte",
  NRC: "NRC",
  OTRO: "Otro",
};

/**
 * Formulario de Cliente — crear y editar.
 */
export function ClienteForm({ defaultValues, formId = "cliente-form", onSubmit }: ClienteFormProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateClienteDto>({
    resolver: zodResolver(createClienteSchema),
    defaultValues: {
      name: "",
      docType: "DUI",
      docNumber: "",
      email: "",
      phone: "",
      address: "",
      nit: "",
      nrc: "",
      actividadEconomica: "",
      creditLimit: 0,
      creditDays: 0,
      notes: "",
      ...defaultValues,
    },
  });

  useEffect(() => {
    reset({
      name: "",
      docType: "DUI",
      docNumber: "",
      email: "",
      phone: "",
      address: "",
      nit: "",
      nrc: "",
      actividadEconomica: "",
      creditLimit: 0,
      creditDays: 0,
      notes: "",
      ...defaultValues,
    });
  }, [defaultValues, reset]);

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)}>
      <Form layout="vertical" component="div">
        {/* Nombre */}
        <Form.Item
          label="Nombre"
          required
          validateStatus={errors.name ? "error" : ""}
          help={errors.name?.message}
        >
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="Nombre completo o razon social" maxLength={200} />
            )}
          />
        </Form.Item>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 8 }}>
          {/* Tipo de Documento */}
          <Form.Item label="Tipo Documento">
            <Controller
              name="docType"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={DOC_TYPES.map((t) => ({ value: t, label: DOC_LABELS[t] }))}
                />
              )}
            />
          </Form.Item>

          {/* Numero de Documento */}
          <Form.Item
            label="Numero Documento"
            validateStatus={errors.docNumber ? "error" : ""}
            help={errors.docNumber?.message}
          >
            <Controller
              name="docNumber"
              control={control}
              render={({ field }) => (
                <Input {...field} value={field.value ?? ""} placeholder="00000000-0" />
              )}
            />
          </Form.Item>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {/* Email */}
          <Form.Item
            label="Email"
            validateStatus={errors.email ? "error" : ""}
            help={errors.email?.message}
          >
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input {...field} value={field.value ?? ""} type="email" placeholder="correo@empresa.com" />
              )}
            />
          </Form.Item>

          {/* Telefono */}
          <Form.Item label="Telefono">
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <Input {...field} value={field.value ?? ""} placeholder="7000-0000" />
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
              <Input {...field} value={field.value ?? ""} placeholder="Direccion del cliente" />
            )}
          />
        </Form.Item>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {/* NIT */}
          <Form.Item label="NIT (para CCF)">
            <Controller
              name="nit"
              control={control}
              render={({ field }) => (
                <Input {...field} value={field.value ?? ""} placeholder="0000-000000-000-0" />
              )}
            />
          </Form.Item>

          {/* NRC */}
          <Form.Item label="NRC">
            <Controller
              name="nrc"
              control={control}
              render={({ field }) => (
                <Input {...field} value={field.value ?? ""} placeholder="000000-0" />
              )}
            />
          </Form.Item>
        </div>

        {/* Notas */}
        <Form.Item label="Notas">
          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <Input.TextArea
                {...field}
                value={field.value ?? ""}
                rows={2}
                placeholder="Notas adicionales..."
                maxLength={1000}
              />
            )}
          />
        </Form.Item>
      </Form>
    </form>
  );
}
