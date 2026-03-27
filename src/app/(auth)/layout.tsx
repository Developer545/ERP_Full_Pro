import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Acceso",
};

/**
 * Layout para rutas de autenticacion (login, register, forgot-password).
 * Centra el contenido verticalmente sin sidebar ni header.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0d1117 0%, #161b22 50%, #1a2332 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      {children}
    </main>
  );
}
