import bcryptjs from "bcryptjs";

const SALT_ROUNDS = 12;

/** Hashea una contraseña con bcrypt */
export async function hashPassword(password: string): Promise<string> {
  return bcryptjs.hash(password, SALT_ROUNDS);
}

/** Verifica una contraseña contra su hash */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcryptjs.compare(password, hash);
}

/** Verifica que una contraseña cumple los requisitos minimos */
export function validatePasswordStrength(password: string): {
  valid: boolean;
  message?: string;
} {
  if (password.length < 8) {
    return { valid: false, message: "La contraseña debe tener al menos 8 caracteres" };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "Debe contener al menos una letra mayuscula" };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "Debe contener al menos un numero" };
  }
  return { valid: true };
}
