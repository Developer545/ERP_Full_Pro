"use client";

import { useEffect } from "react";
import { Form, Input } from "antd";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProveedorSchema, type CreateProveedorDto } from "@/modules/proveedores/proveedor.schema";

interface ProveedorFormProps {
  defaultValues?: Partial<CreateProveedorDto>;
  formId?: string;
  onSubmit: (data: CreateProveedorDto) => void;
}

/**
 * Formulario de Proveedor — crear y editar.
 */
export function ProveedorForm({ defaultValues, formId = "proveedor-form", onSubmit }: ProveedorFormProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateProveedorDto>({
    resolver: zodResolver(createProveedorSchema),
    defaultValues: {
      name: "",
      contactName: "",
      email: "",
      phone: "",
      address: "",
      nit: "",
      nrc: "",
      paymentDays: 0,
      notes: "",
      ...defaultValues,
    },
  });

  useEffect(() => {
    reset({
      name: "",
      contactName: "",
      email: "",
      phone: "",
      address: "",
      nit: "",
      nrc: "",
      paymentDays: 0,
      notes: "",
      ...defaultValues,
    });
  }, [defaultValues, reset]);

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)}>
      <Form layout="vertical" component="div">
        {/* Nombre */}
        <Form.Item
          label="Nombre de la Empresa"
          required
          validateStatus={errors.name ? "error" : ""}
          help={errors.name?.message}
        >
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="Nombre del proveedor" maxLength={200} />
            )}
          />
        </Form.Item>

        {/* Nombre Contacto */}
        <Form.Item label="Nombre de Contacto">
          <Controller
            name="contactName"
            control={control}
            render={({ field }) => (
              <Input {...field} value={field.value ?? ""} placeholder="Persona de contacto" maxLength={200} />
            )}
          />
        </Form.Item>

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
                <Input {...field} value={field.value ?? ""} type="email" placeholder="correo@proveedor.com" />
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
              <Input {...field} value={field.value ?? ""} placeholder="Direccion del proveedor" />
            )}
          />
        </Form.Item>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {/* NIT */}
          <Form.Item label="NIT">
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
