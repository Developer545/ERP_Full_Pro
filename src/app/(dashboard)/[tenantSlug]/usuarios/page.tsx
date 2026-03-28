import type { Metadata } from "next";
import { UsuariosClient } from "@/components/modules/usuarios/UsuariosClient";

export const metadata: Metadata = {
  title: "Usuarios | ERP Full Pro",
};

/**
 * Pagina de Usuarios — Server Component.
 * Solo accesible para ADMIN (la API ya restringe el acceso).
 * Renderiza el Client Component que maneja toda la interactividad.
 */
export default function UsuariosPage() {
  return <UsuariosClient />;
}
