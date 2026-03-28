import { z } from "zod";

/** Schema de login */
export const loginSchema = z.object({
  email: z
    .string({ required_error: "El correo es requerido" })
    .email("Correo electronico no valido")
    .toLowerCase()
    .trim(),
  password: z
    .string({ required_error: "La contraseña es requerida" })
    .min(1, "La contraseña es requerida"),
});

/** Schema de registro de nuevo tenant + admin */
export const registerSchema = z.object({
  companyName: z
    .string({ required_error: "El nombre de la empresa es requerido" })
    .min(2, "Minimo 2 caracteres")
    .max(100, "Maximo 100 caracteres")
    .trim(),
  ownerName: z
    .string({ required_error: "El nombre es requerido" })
    .min(2, "Minimo 2 caracteres")
    .max(100, "Maximo 100 caracteres")
    .trim(),
  email: z
    .string({ required_error: "El correo es requerido" })
    .email("Correo electronico no valido")
    .toLowerCase()
    .trim(),
  password: z
    .string({ required_error: "La contraseña es requerida" })
    .min(8, "Minimo 8 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una mayuscula")
    .regex(/[0-9]/, "Debe contener al menos un numero"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
