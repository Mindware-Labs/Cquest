"use client";

import { useEffect } from "react";

export default function RecaptchaBadge() {
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.recaptcha = "on";
    return () => {
      delete root.dataset.recaptcha;
    };
  }, []);

  return null;
}
