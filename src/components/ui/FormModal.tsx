"use client";

import type { ReactNode } from "react";
import { Modal, Form, Button, Space } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import type { ModalProps } from "antd";

interface FormModalProps extends Omit<ModalProps, "onOk" | "footer"> {
  title: string;
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  loading?: boolean;
  okText?: string;
  cancelText?: string;
  children: ReactNode;
  width?: number;
}

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
      styles={{
        header: {
          borderBottom: "1px solid #f0f0f0",
          paddingBottom: 12,
          marginBottom: 20,
        },
        body: {
          maxHeight: "70vh",
          overflowY: "auto",
          paddingRight: 4,
        },
        footer: {
          borderTop: "1px solid #f0f0f0",
          paddingTop: 12,
          marginTop: 8,
        },
      }}
      footer={
        <Space>
          <Button
            onClick={onClose}
            disabled={loading}
            icon={<CloseOutlined />}
          >
            {cancelText}
          </Button>
          <Button
            type="primary"
            onClick={onSubmit}
            loading={loading}
            icon={<CheckOutlined />}
          >
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
