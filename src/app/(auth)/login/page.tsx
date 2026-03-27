import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Iniciar Sesion",
};

export default function LoginPage() {
  return <LoginForm />;
}
