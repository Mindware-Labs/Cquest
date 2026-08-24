import { describe, expect, it } from "vitest";
import {
  BACKOFF_SECONDS,
  blockSeconds,
  FREE_ATTEMPTS,
  isStale,
  MAX_BLOCK_SECONDS,
  resetBlockedMessage,
  resetRequestKeys,
  resetVerifyKeys,
  WINDOW_SECONDS,
} from "./resetPolicy";

/* Estos números son A PROPÓSITO distintos de los de loginPolicy.ts (5/10, no
   8/3): fijarlos acá es lo que hace que un import accidental de las
   constantes de login rompa este test en vez de aplicarse en silencio a
   tráfico de reset. */
describe("umbrales propios, no los de login", () => {
  it("son los de reset, no los de login", () => {
    expect(FREE_ATTEMPTS).toEqual({ ip: 8, email: 3 });
  });
});

describe("blockSeconds", () => {
  it("no cobra nada dentro de los pedidos gratis", () => {
    for (let attempts = 1; attempts <= FREE_ATTEMPTS.ip; attempts += 1) {
      expect(blockSeconds("ip", attempts)).toBeNull();
    }
    expect(blockSeconds("ip", FREE_ATTEMPTS.ip + 1)).toBe(BACKOFF_SECONDS[0]);
  });

  it("es más estricto con el email que con la IP", () => {
    /* Cada pedido que encuentra una cuenta real manda un correo — el límite
       por email tiene que frenar el "email-bombing" antes que el de IP. */
    expect(FREE_ATTEMPTS.email).toBeLessThan(FREE_ATTEMPTS.ip);
    expect(MAX_BLOCK_SECONDS.email).toBeLessThan(MAX_BLOCK_SECONDS.ip);
    expect(blockSeconds("email", 1000)).toBe(MAX_BLOCK_SECONDS.email);
  });

  it("nunca devuelve una espera negativa ni cero", () => {
    for (const scope of ["ip", "email"] as const) {
      for (let attempts = 0; attempts < 40; attempts += 1) {
        const seconds = blockSeconds(scope, attempts);
        if (seconds !== null) expect(seconds).toBeGreaterThan(0);
      }
    }
  });
});

describe("resetRequestKeys", () => {
  it("normaliza el email a minúsculas", () => {
    const [, email] = resetRequestKeys("1.2.3.4", "  Admin@X.com  ");
    expect(email.key).toBe("resetreq:email:admin@x.com");
  });

  it("separa los dos espacios de nombres", () => {
    const [ip, email] = resetRequestKeys("1.2.3.4", "a@b.com");
    expect(ip.scope).toBe("ip");
    expect(email.scope).toBe("email");
    expect(ip.key).not.toBe(email.key);
  });

  it("nunca colisiona con las claves de login ni de verificación", () => {
    /* "ip:1.2.3.4" (login) vs "resetreq:ip:1.2.3.4" (reset): prefijos
       distintos, filas distintas en la misma tabla. */
    const [ip] = resetRequestKeys("1.2.3.4", "a@b.com");
    expect(ip.key).not.toBe("ip:1.2.3.4");
    expect(ip.key.startsWith("resetreq:")).toBe(true);
  });
});

describe("resetVerifyKeys", () => {
  it("es sólo por IP, un único elemento", () => {
    const keys = resetVerifyKeys("1.2.3.4");
    expect(keys).toHaveLength(1);
    expect(keys[0].scope).toBe("ip");
    expect(keys[0].key).toBe("resetverify:ip:1.2.3.4");
  });
});

describe("isStale", () => {
  const now = new Date("2026-08-23T12:00:00Z");

  it("olvida la racha después de la ventana", () => {
    const old = new Date(now.getTime() - (WINDOW_SECONDS + 1) * 1000);
    expect(isStale(old, now)).toBe(true);
  });

  it("mantiene la racha dentro de la ventana", () => {
    const recent = new Date(now.getTime() - (WINDOW_SECONDS - 1) * 1000);
    expect(isStale(recent, now)).toBe(false);
  });
});

describe("resetBlockedMessage", () => {
  it("dice cuánto falta", () => {
    expect(resetBlockedMessage(900)).toContain("15");
  });

  it("nunca habla de intentos fallidos ni de cuentas", () => {
    /* No es un fallo —cada pedido "funciona" desde afuera— y decir "cuenta"
       o distinguir IP de email confirmaría que esa dirección existe. */
    for (const seconds of [60, 300, 3600]) {
      const message = resetBlockedMessage(seconds).toLowerCase();
      expect(message).not.toContain("ip");
      expect(message).not.toContain("email");
      expect(message).not.toContain("cuenta");
      expect(message).not.toContain("fallid");
    }
  });
});
