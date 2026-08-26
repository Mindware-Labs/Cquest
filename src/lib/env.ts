import "server-only";

/* Falla al arrancar y no en la primera petición: una variable de auth ausente
   en producción es un incidente, no un caso a degradar en silencio. */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Falta la variable de entorno ${name}`);
  return value;
}

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}
