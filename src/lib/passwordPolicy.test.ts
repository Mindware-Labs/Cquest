import { describe, expect, it } from "vitest";
import {
  passwordMeetsPolicy,
  passwordRuleStatus,
  newPasswordSchema,
  PASSWORD_MIN_LENGTH,
  PASSWORD_RULES,
} from "./passwordPolicy";

describe("passwordRuleStatus", () => {
  it("marca las tres reglas como no cumplidas en una contraseña vacía", () => {
    const status = passwordRuleStatus("");
    expect(status).toEqual({ length: false, uppercase: false, number: false });
  });

  it("evalúa cada regla de forma independiente", () => {
    expect(passwordRuleStatus("short1A")).toMatchObject({ length: false, uppercase: true, number: true });
    expect(passwordRuleStatus("longenough")).toMatchObject({ length: true, uppercase: false, number: false });
    expect(passwordRuleStatus("Longenough")).toMatchObject({ length: true, uppercase: true, number: false });
  });

  it("cumple las tres con una contraseña válida", () => {
    expect(passwordRuleStatus("Centerquest1")).toEqual({ length: true, uppercase: true, number: true });
  });
});

describe("passwordMeetsPolicy", () => {
  it("exige exactamente las tres reglas pedidas, ninguna de más", () => {
    expect(passwordMeetsPolicy("Centerquest1")).toBe(true);
    /* Sin símbolo especial exigido — no es una de las tres reglas pedidas. */
    expect(passwordMeetsPolicy("Aaaaaaa1")).toBe(true);
  });

  it("rechaza si falta cualquiera de las tres", () => {
    expect(passwordMeetsPolicy("short1A")).toBe(false); // < 8 caracteres
    expect(passwordMeetsPolicy("longenough1")).toBe(false); // sin mayúscula
    expect(passwordMeetsPolicy("Longenough")).toBe(false); // sin número
  });
});

describe("newPasswordSchema", () => {
  it("acepta una contraseña que cumple las tres reglas", () => {
    expect(newPasswordSchema.safeParse("Centerquest1").success).toBe(true);
  });

  it("rechaza y explica cuál regla falta", () => {
    const result = newPasswordSchema.safeParse("short1a");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain(String(PASSWORD_MIN_LENGTH));
    }
  });
});

describe("PASSWORD_RULES", () => {
  it("expone exactamente las tres reglas, en orden estable", () => {
    expect(PASSWORD_RULES.map((rule) => rule.id)).toEqual(["length", "uppercase", "number"]);
  });
});
