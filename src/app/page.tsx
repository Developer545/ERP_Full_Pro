import { redirect } from "next/navigation";

/**
 * Ruta raiz — redirige al login
 * Si el usuario ya tiene sesion, el middleware lo redirige al dashboard
 */
export default function HomePage() {
  redirect("/login");
}
