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
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { toast } from "sonner";

const { Title, Text } = Typography;

interface LoginFields {
  email: string;
  password: string;
}

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form] = Form.useForm<LoginFields>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectTo = searchParams.get("from") || null;

  async function handleSubmit(values: LoginFields) {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error?.message || "Error al iniciar sesion");
        return;
      }

      toast.success(`Bienvenido, ${json.data.user.name}`);

      // Redirigir al dashboard del tenant
      const destination =
        redirectTo || `/${json.data.user.tenantSlug}/dashboard`;
      router.push(destination);
      router.refresh();
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
        maxWidth: 420,
        borderRadius: 16,
        boxShadow: "0 25px 50px rgba(0,0,0,0.4)",
        background: "rgba(22, 27, 34, 0.95)",
        border: "1px solid rgba(48, 54, 61, 0.8)",
      }}
      styles={{ body: { padding: "40px 36px" } }}
    >
      {/* Logo + Titulo */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: "linear-gradient(135deg, #1677ff, #4096ff)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
            boxShadow: "0 8px 24px rgba(22, 119, 255, 0.3)",
          }}
        >
          <ThunderboltOutlined style={{ fontSize: 28, color: "#fff" }} />
        </div>
        <Title level={3} style={{ color: "#fff", margin: 0, fontWeight: 700 }}>
          ERP Full Pro
        </Title>
        <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 13 }}>
          Inicia sesion en tu cuenta
        </Text>
      </div>

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

      {/* Formulario */}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
        size="large"
      >
        <Form.Item
          name="email"
          label={<Text style={{ color: "rgba(255,255,255,0.7)" }}>Correo electronico</Text>}
          rules={[
            { required: true, message: "Ingresa tu correo" },
            { type: "email", message: "Correo no valido" },
          ]}
        >
          <Input
            prefix={<UserOutlined style={{ color: "rgba(255,255,255,0.3)" }} />}
            placeholder="usuario@empresa.com"
            autoComplete="email"
            style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)", color: "#fff" }}
          />
        </Form.Item>

        <Form.Item
          name="password"
          label={<Text style={{ color: "rgba(255,255,255,0.7)" }}>Contraseña</Text>}
          rules={[{ required: true, message: "Ingresa tu contraseña" }]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: "rgba(255,255,255,0.3)" }} />}
            placeholder="••••••••"
            autoComplete="current-password"
            style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)", color: "#fff" }}
          />
        </Form.Item>

        <div style={{ textAlign: "right", marginTop: -8, marginBottom: 20 }}>
          <Link
            href="/forgot-password"
            style={{ color: "#4096ff", fontSize: 13 }}
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <Form.Item style={{ marginBottom: 0 }}>
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
              background: "linear-gradient(135deg, #1677ff, #4096ff)",
              border: "none",
              boxShadow: "0 4px 12px rgba(22, 119, 255, 0.3)",
            }}
          >
            {loading ? "Iniciando sesion..." : "Iniciar Sesion"}
          </Button>
        </Form.Item>
      </Form>

      <Divider style={{ borderColor: "rgba(255,255,255,0.1)", margin: "24px 0" }}>
        <Text style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>
          ¿No tienes cuenta?
        </Text>
      </Divider>

      <Space style={{ width: "100%", justifyContent: "center" }}>
        <Link href="/register">
          <Button
            type="default"
            style={{
              borderColor: "rgba(255,255,255,0.15)",
              color: "rgba(255,255,255,0.7)",
              background: "transparent",
              borderRadius: 8,
            }}
          >
            Crear cuenta nueva
          </Button>
        </Link>
      </Space>

      {/* Footer */}
      <div style={{ textAlign: "center", marginTop: 28 }}>
        <Text style={{ color: "rgba(255,255,255,0.2)", fontSize: 11 }}>
          ERP Full Pro © 2026 · Speeddan System
        </Text>
      </div>
    </Card>
  );
}

// Suspense boundary necesario para useSearchParams en Next.js
export function LoginForm() {
  return (
    <Suspense fallback={null}>
      <LoginFormInner />
    </Suspense>
  );
}
