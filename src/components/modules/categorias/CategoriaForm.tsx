"use client";

import { useEffect } from "react";
import { Form, Input } from "antd";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCategoriaSchema, type CreateCategoriaDto } from "@/modules/categorias/categoria.schema";

interface CategoriaFormProps {
  /** Valores iniciales para modo edicion */
  defaultValues?: Partial<CreateCategoriaDto>;
  /** Ref del formulario para submit externo */
  formId?: string;
  /** Callback al enviar el formulario con datos validos */
  onSubmit: (data: CreateCategoriaDto) => void;
}

/**
 * Formulario de Categoria — crear y editar.
 * Compatible con FormModal a traves de onSubmit externo.
 */
export function CategoriaForm({ defaultValues, formId = "categoria-form", onSubmit }: CategoriaFormProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCategoriaDto>({
    resolver: zodResolver(createCategoriaSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "#1677ff",
      ...defaultValues,
    },
  });

  // Reset al cambiar defaultValues (edicion)
  useEffect(() => {
    reset({
      name: "",
      description: "",
      color: "#1677ff",
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
              <Input {...field} placeholder="Ej: Electronicos, Ropa, Alimentos..." maxLength={100} />
            )}
          />
        </Form.Item>

        {/* Color */}
        <Form.Item
          label="Color"
          validateStatus={errors.color ? "error" : ""}
          help={errors.color?.message}
        >
          <Controller
            name="color"
            control={control}
            render={({ field }) => (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="color"
                  value={field.value ?? "#1677ff"}
                  onChange={(e) => field.onChange(e.target.value)}
                  style={{
                    width: 40,
                    height: 32,
                    padding: 2,
                    borderRadius: 6,
                    border: "1px solid #d9d9d9",
                    cursor: "pointer",
                  }}
                />
                <Input
                  {...field}
                  value={field.value ?? "#1677ff"}
                  placeholder="#1677ff"
                  maxLength={7}
                  style={{ flex: 1 }}
                />
              </div>
            )}
          />
        </Form.Item>

        {/* Descripcion */}
        <Form.Item
          label="Descripcion"
          validateStatus={errors.description ? "error" : ""}
          help={errors.description?.message}
        >
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Input.TextArea
                {...field}
                value={field.value ?? ""}
                rows={3}
                placeholder="Descripcion opcional de la categoria..."
                maxLength={500}
                showCount
              />
            )}
          />
        </Form.Item>
      </Form>
    </form>
  );
}
