import { describe, expect, it } from "vitest";
import {
  BACKOFF_SECONDS,
  blockSeconds,
  blockedMessage,
  FREE_ATTEMPTS,
  isStale,
  loginKeys,
  MAX_BLOCK_SECONDS,
  WINDOW_SECONDS,
} from "./loginPolicy";

// Un error acá no lanza nada: sólo deja pasar más intentos de los que debería, en silencio.

describe("blockSeconds", () => {
  it("no cobra nada dentro de los intentos gratis", () => {
    for (let failures = 1; failures <= FREE_ATTEMPTS.ip; failures += 1) {
      expect(blockSeconds("ip", failures)).toBeNull();
    }
    // El límite es el último intento gratis, no el primero cobrado.
    expect(blockSeconds("ip", FREE_ATTEMPTS.ip + 1)).toBe(BACKOFF_SECONDS[0]);
  });

  it("escala con la insistencia", () => {
    const waits = [1, 2, 3, 4].map((over) => blockSeconds("ip", FREE_ATTEMPTS.ip + over));
    expect(waits).toEqual([60, 120, 300, 900]);
  });

  it("se estanca en el techo en vez de crecer sin fin", () => {
    // Sin tope, un bot corriendo un fin de semana produciría un bloqueo de años sobre una IP que mañana es de otra persona.
    expect(blockSeconds("ip", 100)).toBe(MAX_BLOCK_SECONDS.ip);
    expect(blockSeconds("ip", 1000)).toBe(MAX_BLOCK_SECONDS.ip);
  });

  it("es más blando con el email que con la IP", () => {
    // Bloquear por email deja que cualquiera saque de servicio a un admin real tipeando su dirección a propósito.
    expect(FREE_ATTEMPTS.email).toBeGreaterThan(FREE_ATTEMPTS.ip);
    expect(MAX_BLOCK_SECONDS.email).toBeLessThan(MAX_BLOCK_SECONDS.ip);
    expect(blockSeconds("email", 1000)).toBe(MAX_BLOCK_SECONDS.email);
  });

  it("nunca devuelve una espera negativa ni cero", () => {
    for (const scope of ["ip", "email"] as const) {
      for (let failures = 0; failures < 40; failures += 1) {
        const seconds = blockSeconds(scope, failures);
        if (seconds !== null) expect(seconds).toBeGreaterThan(0);
      }
    }
  });
});

describe("loginKeys", () => {
  it("normaliza el email a minúsculas", () => {
    // Sin esto, "Admin@x.com" y "admin@x.com" serían dos contadores distintos.
    const [, email] = loginKeys("1.2.3.4", "  Admin@X.com  ");
    expect(email.key).toBe("email:admin@x.com");
  });

  it("separa los dos espacios de nombres", () => {
    const [ip, email] = loginKeys("1.2.3.4", "a@b.com");
    expect(ip.scope).toBe("ip");
    expect(email.scope).toBe("email");
    expect(ip.key).not.toBe(email.key);
  });

  it("no confunde una IP con un email que se le parezca", () => {
    // Las claves llevan prefijo justamente para esto: sin él se podría colisionar el contador de otro.
    const [ip] = loginKeys("email:a@b.com", "a@b.com");
    const [, email] = loginKeys("1.2.3.4", "a@b.com");
    expect(ip.key).not.toBe(email.key);
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

describe("blockedMessage", () => {
  it("dice cuánto falta", () => {
    // Esconderlo no le quita nada al atacante (mide el tiempo igual) y deja al admin sin saber si esperar o irse.
    expect(blockedMessage(900)).toContain("15");
  });

  it("nunca revela si el bloqueo fue por IP o por email", () => {
    // Distinguirlos confirmaría que esa dirección existe en el sistema.
    for (const seconds of [60, 300, 3600]) {
      const message = blockedMessage(seconds).toLowerCase();
      expect(message).not.toContain("ip");
      expect(message).not.toContain("email");
      expect(message).not.toContain("cuenta");
    }
  });
});
