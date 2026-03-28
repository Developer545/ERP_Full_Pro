"use client";

import { useEffect } from "react";
import { Form, Input, Select } from "antd";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUsuarioSchema, type CreateUsuarioDto, USER_ROLES } from "@/modules/usuarios/usuario.schema";

interface UsuarioFormProps {
  defaultValues?: Partial<CreateUsuarioDto>;
  formId?: string;
  onSubmit: (data: CreateUsuarioDto) => void;
  /** Si es true, oculta el campo email (modo edicion no cambia email facilmente) */
  isEdit?: boolean;
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  MANAGER: "Gerente",
  SELLER: "Vendedor",
  ACCOUNTANT: "Contador",
  VIEWER: "Solo lectura",
};

/**
 * Formulario de Usuario — crear y editar.
 */
export function UsuarioForm({ defaultValues, formId = "usuario-form", onSubmit, isEdit = false }: UsuarioFormProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUsuarioDto>({
    resolver: zodResolver(createUsuarioSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "SELLER",
      ...defaultValues,
    },
  });

  useEffect(() => {
    reset({
      name: "",
      email: "",
      role: "SELLER",
      ...defaultValues,
    });
  }, [defaultValues, reset]);

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)}>
      <Form layout="vertical" component="div">
        {/* Nombre */}
        <Form.Item
          label="Nombre completo"
          required
          validateStatus={errors.name ? "error" : ""}
          help={errors.name?.message}
        >
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="Nombre y apellido" maxLength={200} />
            )}
          />
        </Form.Item>

        {/* Email */}
        {!isEdit && (
          <Form.Item
            label="Email"
            required
            validateStatus={errors.email ? "error" : ""}
            help={errors.email?.message}
          >
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input {...field} type="email" placeholder="correo@empresa.com" />
              )}
            />
          </Form.Item>
        )}

        {/* Rol */}
        <Form.Item
          label="Rol"
          required
          validateStatus={errors.role ? "error" : ""}
          help={errors.role?.message}
        >
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                options={USER_ROLES.map((r) => ({
                  value: r,
                  label: ROLE_LABELS[r] ?? r,
                }))}
              />
            )}
          />
        </Form.Item>

        {/* Nota sobre contrasena temporal */}
        {!isEdit && (
          <div
            style={{
              background: "#e6f4ff",
              borderRadius: 6,
              padding: "8px 12px",
              fontSize: 12,
              color: "#1677ff",
            }}
          >
            Se generara una contrasena temporal automaticamente. La contrasena se mostrara
            una sola vez al crear el usuario.
          </div>
        )}
      </Form>
    </form>
  );
}
