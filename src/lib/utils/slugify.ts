/**
 * Convierte un string a slug URL-safe.
 * Usado para generar el slug del tenant desde el nombre de la empresa.
 * @example slugify("Mi Empresa S.A.") => "mi-empresa-sa"
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quitar tildes
    .replace(/[^a-z0-9\s-]/g, "")   // solo alfanumerico
    .trim()
    .replace(/\s+/g, "-")            // espacios a guiones
    .replace(/-+/g, "-")             // guiones multiples
    .slice(0, 40);                   // max 40 chars
}

/** Genera un slug unico agregando sufijo numerico si ya existe */
export function slugifyUnique(text: string, suffix?: number): string {
  const base = slugify(text);
  return suffix ? `${base}-${suffix}` : base;
}
