"use client";

import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";

const LENGTH = 6;

/* Seis casillas controladas por el padre — sin estado propio, `value` manda.
   Sube automáticamente al escribir un dígito, baja con backspace en una
   casilla vacía, reparte un código pegado de una sola vez entre las seis.
   Completar las seis NO envía nada por su cuenta — el verificado lo dispara
   quien usa el código, con el botón, no el componente solo. */
export default function OtpInput({
  value,
  onChange,
  invalid,
  disabled,
  autoFocus,
}: {
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: LENGTH }, (_, index) => value[index] ?? "");

  function commit(next: string[]) {
    onChange(next.join(""));
  }

  function handleChange(index: number, raw: string) {
    const digit = raw.replace(/\D/g, "").slice(-1);
    const next = digits.slice();
    next[index] = digit;
    commit(next);
    if (digit && index < LENGTH - 1) inputRefs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(index: number, event: ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;
    event.preventDefault();

    const chars = pasted.slice(0, LENGTH - index).split("");
    const next = digits.slice();
    chars.forEach((char, offset) => {
      next[index + offset] = char;
    });
    commit(next);

    const nextEmpty = next.findIndex((digit) => !digit);
    inputRefs.current[nextEmpty === -1 ? LENGTH - 1 : nextEmpty]?.focus();
  }

  return (
    <div
      role="group"
      aria-label="Código de verificación de 6 dígitos"
      data-invalid={invalid ? "true" : undefined}
      className="cq-otp-group"
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={digit}
          disabled={disabled}
          autoFocus={autoFocus && index === 0}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={(event) => handlePaste(index, event)}
          aria-label={`Dígito ${index + 1} de ${LENGTH}`}
          className="cq-input cq-login-input cq-otp-box"
        />
      ))}
    </div>
  );
}
