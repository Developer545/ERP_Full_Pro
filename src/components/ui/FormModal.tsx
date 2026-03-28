"use client";

import type { ReactNode } from "react";
import { Modal, Form, Button, Space } from "antd";
import type { ModalProps } from "antd";

interface FormModalProps extends Omit<ModalProps, "onOk" | "footer"> {
  /** Titulo del modal */
  title: string;
  /** Modal abierto */
  open: boolean;
  /** Callback al cerrar */
  onClose: () => void;
  /** Callback al hacer submit del formulario */
  onSubmit: () => void;
  /** Cargando (procesando submit) */
  loading?: boolean;
  /** Texto del boton de confirmar */
  okText?: string;
  /** Texto del boton de cancelar */
  cancelText?: string;
  /** Contenido del formulario */
  children: ReactNode;
  /** Ancho del modal */
  width?: number;
}

/**
 * Modal generico para formularios del ERP.
 *
 * Caracteristicas:
 * - Footer con botones Cancelar / Guardar
 * - Loading state en boton de guardar
 * - Cierre al presionar Cancelar o la X
 * - Destruye el contenido al cerrar (limpia el estado del form)
 *
 * Uso tipico:
 * El componente padre maneja el formulario (react-hook-form),
 * y pasa onSubmit={handleSubmit(onValid)}.
 *
 * @example
 * <FormModal
 *   title="Nuevo Producto"
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   onSubmit={handleSubmit(onValid)}
 *   loading={isCreating}
 * >
 *   <Form layout="vertical">
 *     <Form.Item label="Nombre">
 *       <Controller name="name" control={control} render={...} />
 *     </Form.Item>
 *   </Form>
 * </FormModal>
 */
export function FormModal({
  title,
  open,
  onClose,
  onSubmit,
  loading = false,
  okText = "Guardar",
  cancelText = "Cancelar",
  children,
  width = 520,
  ...modalProps
}: FormModalProps) {
  return (
    <Modal
      title={title}
      open={open}
      onCancel={onClose}
      width={width}
      destroyOnClose
      maskClosable={!loading}
      closable={!loading}
      footer={
        <Space>
          <Button onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button type="primary" onClick={onSubmit} loading={loading}>
            {okText}
          </Button>
        </Space>
      }
      {...modalProps}
    >
      <Form.Provider>{children}</Form.Provider>
    </Modal>
  );
}
