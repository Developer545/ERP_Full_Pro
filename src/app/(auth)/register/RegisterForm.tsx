"use client";

import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Divider,
  Alert,
  Space,
  Steps,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  ShopOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const { Title, Text } = Typography;

interface RegisterFields {
  companyName: string;
  ownerName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const inputStyle = {
  background: "rgba(255,255,255,0.05)",
  borderColor: "rgba(255,255,255,0.1)",
  color: "#fff",
};

const labelStyle = { color: "rgba(255,255,255,0.7)" };

export function RegisterForm() {
  const router = useRouter();
  const [form] = Form.useForm<RegisterFields>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(0);

  async function handleSubmit(values: RegisterFields) {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: values.companyName,
          ownerName: values.ownerName,
          email: values.email,
          password: values.password,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error?.message || "Error al crear la cuenta");
        return;
      }

      toast.success("Cuenta creada exitosamente. Redirigiendo...");
      setTimeout(() => {
        router.push(`/${json.data.tenantSlug}/dashboard`);
        router.refresh();
      }, 1000);
    } catch {
      setError("Error de conexion. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card
      style={{
        width: "100%",
        maxWidth: 480,
        borderRadius: 16,
        boxShadow: "0 25px 50px rgba(0,0,0,0.4)",
        background: "rgba(22, 27, 34, 0.95)",
        border: "1px solid rgba(48, 54, 61, 0.8)",
      }}
      styles={{ body: { padding: "40px 36px" } }}
    >
      {/* Logo + Titulo */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: "linear-gradient(135deg, #1677ff, #4096ff)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 14,
            boxShadow: "0 8px 24px rgba(22, 119, 255, 0.3)",
          }}
        >
          <ThunderboltOutlined style={{ fontSize: 28, color: "#fff" }} />
        </div>
        <Title level={3} style={{ color: "#fff", margin: 0, fontWeight: 700 }}>
          Crear Cuenta
        </Title>
        <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 13 }}>
          14 dias de prueba gratis, sin tarjeta de credito
        </Text>
      </div>

      {/* Pasos */}
      <Steps
        current={step}
        size="small"
        style={{ marginBottom: 28 }}
        items={[
          { title: <Text style={{ color: step >= 0 ? "#1677ff" : "rgba(255,255,255,0.3)", fontSize: 12 }}>Empresa</Text> },
          { title: <Text style={{ color: step >= 1 ? "#1677ff" : "rgba(255,255,255,0.3)", fontSize: 12 }}>Cuenta</Text> },
        ]}
      />

      {/* Error */}
      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          style={{ marginBottom: 20, borderRadius: 8 }}
          closable
          onClose={() => setError(null)}
        />
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
        size="large"
      >
        {/* PASO 1: Datos de empresa */}
        {step === 0 && (
          <>
            <Form.Item
              name="companyName"
              label={<Text style={labelStyle}>Nombre de la empresa</Text>}
              rules={[{ required: true, message: "Ingresa el nombre de tu empresa" }]}
            >
              <Input
                prefix={<ShopOutlined style={{ color: "rgba(255,255,255,0.3)" }} />}
                placeholder="Mi Empresa S.A. de C.V."
                style={inputStyle}
              />
            </Form.Item>

            <Form.Item
              name="ownerName"
              label={<Text style={labelStyle}>Tu nombre completo</Text>}
              rules={[{ required: true, message: "Ingresa tu nombre" }]}
            >
              <Input
                prefix={<UserOutlined style={{ color: "rgba(255,255,255,0.3)" }} />}
                placeholder="Juan Carlos Lopez"
                style={inputStyle}
              />
            </Form.Item>

            <Button
              type="primary"
              block
              size="large"
              style={{ height: 46, borderRadius: 10, fontWeight: 600 }}
              onClick={async () => {
                try {
                  await form.validateFields(["companyName", "ownerName"]);
                  setStep(1);
                } catch {}
              }}
            >
              Continuar →
            </Button>
          </>
        )}

        {/* PASO 2: Credenciales */}
        {step === 1 && (
          <>
            <Form.Item
              name="email"
              label={<Text style={labelStyle}>Correo electronico</Text>}
              rules={[
                { required: true, message: "Ingresa tu correo" },
                { type: "email", message: "Correo no valido" },
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: "rgba(255,255,255,0.3)" }} />}
                placeholder="admin@miempresa.com"
                autoComplete="email"
                style={inputStyle}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={<Text style={labelStyle}>Contraseña</Text>}
              rules={[
                { required: true, message: "Ingresa una contraseña" },
                { min: 8, message: "Minimo 8 caracteres" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: "rgba(255,255,255,0.3)" }} />}
                placeholder="Minimo 8 caracteres"
                autoComplete="new-password"
                style={inputStyle}
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label={<Text style={labelStyle}>Confirmar contraseña</Text>}
              dependencies={["password"]}
              rules={[
                { required: true, message: "Confirma tu contraseña" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject("Las contraseñas no coinciden");
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: "rgba(255,255,255,0.3)" }} />}
                placeholder="Repite la contraseña"
                autoComplete="new-password"
                style={inputStyle}
              />
            </Form.Item>

            <Space style={{ width: "100%" }} direction="vertical">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
                style={{
                  height: 46,
                  borderRadius: 10,
                  fontWeight: 600,
                  background: "linear-gradient(135deg, #52c41a, #73d13d)",
                  border: "none",
                }}
              >
                {loading ? "Creando cuenta..." : "Crear Cuenta Gratis"}
              </Button>
              <Button
                type="text"
                block
                onClick={() => setStep(0)}
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                ← Volver
              </Button>
            </Space>
          </>
        )}
      </Form>

      <Divider style={{ borderColor: "rgba(255,255,255,0.1)", margin: "20px 0" }} />

      <div style={{ textAlign: "center" }}>
        <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 13 }}>
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" style={{ color: "#4096ff" }}>
            Iniciar sesion
          </Link>
        </Text>
      </div>
    </Card>
  );
}
