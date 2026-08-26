import "server-only";
import { AsyncLocalStorage } from "node:async_hooks";

/* Better Auth solo expone el tipo de OTP ("forget-password"), no el motivo.
   El alta de usuario y el olvido de contraseña usan el mismo endpoint pero
   distinta plantilla, así que el motivo viaja por contexto de petición. */
export type OtpPurpose = "welcome" | "reset";

const store = new AsyncLocalStorage<OtpPurpose>();

export function withOtpPurpose<T>(purpose: OtpPurpose, fn: () => Promise<T>): Promise<T> {
  return store.run(purpose, fn);
}

export function currentOtpPurpose(): OtpPurpose {
  return store.getStore() ?? "reset";
}
