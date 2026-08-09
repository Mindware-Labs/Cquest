"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Locale } from "./config";
import type { Dictionary } from "./dictionaries/types";

type I18nContextValue = { dict: Dictionary; lang: Locale };

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ dict, lang, children }: I18nContextValue & { children: ReactNode }) {
  return <I18nContext.Provider value={{ dict, lang }}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used within an I18nProvider");
  return value;
}
