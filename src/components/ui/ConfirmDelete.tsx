"use client";

import { Modal, Typography } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface ConfirmDeleteProps {
  /** Modal abierto */
  open: boolean;
  /** Nombre del registro a eliminar (para mostrar en el mensaje) */
  name?: string;
  /** Tipo de entidad (ej: "producto", "cliente", "empleado") */
  entityType?: string;
  /** Callback al confirmar */
  onConfirm: () => void;
  /** Callback al cancelar */
  onCancel: () => void;
  /** Procesando la eliminacion */
  loading?: boolean;
  /** Mensaje custom (sobreescribe el mensaje default) */
  message?: string;
}

/**
 * Modal de confirmacion para eliminar registros.
 *
 * Muestra un warning con el nombre del registro a eliminar.
 * La eliminacion es un soft delete (registra deletedAt, no borra fisicamente).
 *
 * @example
 * <ConfirmDelete
 *   open={deleteModal}
 *   name={selectedProduct?.name}
 *   entityType="producto"
 *   onConfirm={handleDelete}
 *   onCancel={() => setDeleteModal(false)}
 *   loading={isDeleting}
 * />
 */
export function ConfirmDelete({
  open,
  name,
  entityType = "registro",
  onConfirm,
  onCancel,
  loading = false,
  message,
}: ConfirmDeleteProps) {
  const displayMessage =
    message ??
    (name
      ? `¿Deseas eliminar ${entityType === "registro" ? "el" : "el/la"} ${entityType} "${name}"? Esta accion no se puede deshacer.`
      : `¿Deseas eliminar este ${entityType}? Esta accion no se puede deshacer.`);

  return (
    <Modal
      title={
        <span>
          <ExclamationCircleOutlined
            style={{ color: "#ff4d4f", marginRight: 8 }}
          />
          Confirmar eliminacion
        </span>
      }
      open={open}
      onOk={onConfirm}
      onCancel={onCancel}
      okText="Si, eliminar"
      cancelText="Cancelar"
      okButtonProps={{ danger: true, loading }}
      cancelButtonProps={{ disabled: loading }}
      maskClosable={!loading}
      closable={!loading}
      width={420}
    >
      <Text>{displayMessage}</Text>
    </Modal>
  );
}
