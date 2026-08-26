import "server-only";
import { AsyncLocalStorage } from "node:async_hooks";

// Better Auth expone el tipo de OTP, no el motivo: alta y olvido comparten endpoint.
export type OtpPurpose = "welcome" | "reset";

const store = new AsyncLocalStorage<OtpPurpose>();

export function withOtpPurpose<T>(purpose: OtpPurpose, fn: () => Promise<T>): Promise<T> {
  return store.run(purpose, fn);
}

export function currentOtpPurpose(): OtpPurpose {
  return store.getStore() ?? "reset";
}
