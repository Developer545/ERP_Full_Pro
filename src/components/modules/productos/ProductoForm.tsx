"use client";

import { useEffect } from "react";
import { Form, Input, InputNumber, Select } from "antd";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProductoSchema, type CreateProductoDto, UNIDADES } from "@/modules/productos/producto.schema";
import { useCategoriasActivas } from "@/hooks/queries/use-categorias";

interface ProductoFormProps {
  defaultValues?: Partial<CreateProductoDto>;
  formId?: string;
  onSubmit: (data: CreateProductoDto) => void;
}

/**
 * Formulario de Producto — crear y editar.
 */
export function ProductoForm({ defaultValues, formId = "producto-form", onSubmit }: ProductoFormProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateProductoDto>({
    resolver: zodResolver(createProductoSchema),
    defaultValues: {
      name: "",
      sku: "",
      description: "",
      price: 0,
      cost: 0,
      stock: 0,
      minStock: 0,
      unit: "Unidad",
      categoryId: undefined,
      taxRate: 0.13,
      trackStock: true,
      ...defaultValues,
    },
  });

  const { data: categorias } = useCategoriasActivas();

  useEffect(() => {
    reset({
      name: "",
      sku: "",
      description: "",
      price: 0,
      cost: 0,
      stock: 0,
      minStock: 0,
      unit: "Unidad",
      categoryId: undefined,
      taxRate: 0.13,
      trackStock: true,
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
              <Input {...field} placeholder="Nombre del producto" maxLength={200} />
            )}
          />
        </Form.Item>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {/* SKU */}
          <Form.Item
            label="SKU (auto si vacio)"
            validateStatus={errors.sku ? "error" : ""}
            help={errors.sku?.message}
          >
            <Controller
              name="sku"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder="AUTO-XXXX"
                  maxLength={50}
                />
              )}
            />
          </Form.Item>

          {/* Categoria */}
          <Form.Item
            label="Categoria"
            validateStatus={errors.categoryId ? "error" : ""}
            help={errors.categoryId?.message}
          >
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder="Seleccionar categoria"
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  options={categorias?.map((c) => ({
                    value: c.id,
                    label: c.name,
                  }))}
                />
              )}
            />
          </Form.Item>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {/* Precio */}
          <Form.Item
            label="Precio de Venta ($)"
            required
            validateStatus={errors.price ? "error" : ""}
            help={errors.price?.message}
          >
            <Controller
              name="price"
              control={control}
              render={({ field }) => (
                <InputNumber
                  {...field}
                  min={0}
                  step={0.01}
                  precision={2}
                  prefix="$"
                  style={{ width: "100%" }}
                  placeholder="0.00"
                />
              )}
            />
          </Form.Item>

          {/* Costo */}
          <Form.Item
            label="Costo de Compra ($)"
            validateStatus={errors.cost ? "error" : ""}
            help={errors.cost?.message}
          >
            <Controller
              name="cost"
              control={control}
              render={({ field }) => (
                <InputNumber
                  {...field}
                  min={0}
                  step={0.01}
                  precision={2}
                  prefix="$"
                  style={{ width: "100%" }}
                  placeholder="0.00"
                />
              )}
            />
          </Form.Item>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {/* Stock */}
          <Form.Item
            label="Stock Inicial"
            validateStatus={errors.stock ? "error" : ""}
            help={errors.stock?.message}
          >
            <Controller
              name="stock"
              control={control}
              render={({ field }) => (
                <InputNumber {...field} min={0} step={1} style={{ width: "100%" }} />
              )}
            />
          </Form.Item>

          {/* Stock Minimo */}
          <Form.Item
            label="Stock Minimo"
            validateStatus={errors.minStock ? "error" : ""}
            help={errors.minStock?.message}
          >
            <Controller
              name="minStock"
              control={control}
              render={({ field }) => (
                <InputNumber {...field} min={0} step={1} style={{ width: "100%" }} />
              )}
            />
          </Form.Item>

          {/* Unidad */}
          <Form.Item
            label="Unidad"
            validateStatus={errors.unit ? "error" : ""}
            help={errors.unit?.message}
          >
            <Controller
              name="unit"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={UNIDADES.map((u) => ({ value: u, label: u }))}
                />
              )}
            />
          </Form.Item>
        </div>

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
                rows={2}
                placeholder="Descripcion opcional del producto..."
                maxLength={1000}
                showCount
              />
            )}
          />
        </Form.Item>
      </Form>
    </form>
  );
}
