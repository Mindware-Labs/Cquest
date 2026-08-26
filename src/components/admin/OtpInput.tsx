"use client";

import { useRef } from "react";
import styles from "./OtpInput.module.css";

const LENGTH = 6;
const SLOTS = Array.from({ length: LENGTH }, (_, i) => i);

type Props = {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
};

function onlyDigits(text: string): string {
  return text.replace(/\D/g, "");
}

export default function OtpInput({
  value,
  onChange,
  onComplete,
  disabled,
  invalid,
  describedBy,
}: Props) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const focusSlot = (index: number) => {
    refs.current[Math.min(Math.max(index, 0), LENGTH - 1)]?.focus();
  };

  const commit = (next: string) => {
    onChange(next);
    if (next.length === LENGTH) onComplete?.(next);
  };

  const handleInput = (index: number, raw: string) => {
    const digits = onlyDigits(raw);
    if (!digits) return;

    // Un teclado móvil puede entregar varios dígitos de golpe.
    const next = (value.slice(0, index) + digits + value.slice(index + digits.length))
      .slice(0, LENGTH);
    commit(next);
    focusSlot(index + digits.length);
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      if (value[index]) {
        commit(value.slice(0, index) + value.slice(index + 1));
        return;
      }
      commit(value.slice(0, index - 1) + value.slice(index));
      focusSlot(index - 1);
      return;
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusSlot(index - 1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusSlot(index + 1);
    }
  };

  const handlePaste = (index: number, event: React.ClipboardEvent<HTMLInputElement>) => {
    const digits = onlyDigits(event.clipboardData.getData("text"));
    if (!digits) return;
    event.preventDefault();
    const next = (value.slice(0, index) + digits).slice(0, LENGTH);
    commit(next);
    focusSlot(next.length);
  };

  return (
    <div className={styles.group} data-invalid={invalid} role="group" aria-label="Código de seis dígitos">
      {SLOTS.map((index) => (
        <input
          key={index}
          ref={(node) => {
            refs.current[index] = node;
          }}
          className={styles.slot}
          type="text"
          inputMode="numeric"
          // Solo en la primera: iOS ofrece el código del SMS/correo una vez, no seis.
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={LENGTH}
          value={value[index] ?? ""}
          onChange={(event) => handleInput(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={(event) => handlePaste(index, event)}
          onFocus={(event) => event.target.select()}
          disabled={disabled}
          aria-label={`Dígito ${index + 1} de ${LENGTH}`}
          aria-invalid={invalid}
          aria-describedby={describedBy}
        />
      ))}
    </div>
  );
}
