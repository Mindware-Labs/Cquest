import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";
import clsx from "clsx";

// Cuatro variantes, no una quinta sin razón: agregar una sin pregunta nueva convierte el sistema en paleta. "solid" va una sola vez por pantalla.

export type ButtonVariant = "solid" | "outline" | "ghost" | "danger";
export type ButtonSize = "md" | "sm";

type Common = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  // Nunca solo: para eso está IconButton, que exige el nombre accesible.
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
};

function shared({ variant = "outline", size = "md", className }: Omit<Common, "children">) {
  return {
    className: clsx("cq-btn", className),
    "data-variant": variant,
    "data-size": size,
  } as const;
}

export function Button({
  variant,
  size,
  icon,
  className,
  children,
  type = "button",
  ...props
}: Common & Omit<ComponentProps<"button">, "className" | "children" | "type"> & {
    type?: "button" | "submit" | "reset";
  }) {
  return (
    <button type={type} {...shared({ variant, size, className })} {...props}>
      {icon}
      {children}
    </button>
  );
}

// Separado de Button (no una prop href) porque un <button> que navega rompe abrir en pestaña nueva, y un <a> que ejecuta no responde a la barra espaciadora.
export function LinkButton({
  variant,
  size,
  icon,
  className,
  children,
  ...props
}: Common & Omit<ComponentProps<typeof Link>, "className" | "children">) {
  return (
    <Link {...shared({ variant, size, className })} {...props}>
      {icon}
      {children}
    </Link>
  );
}

// label obligatorio por tipo, no por convención: un botón sin texto no tiene nombre accesible. Se usa como aria-label y tooltip a la vez.

type IconOnly = {
  label: string;
  icon: ReactNode;
  size?: ButtonSize;
  tone?: "default" | "danger";
  className?: string;
};

export function IconButton({
  label,
  icon,
  size = "md",
  tone = "default",
  className,
  type = "button",
  ...props
}: IconOnly &
  Omit<ComponentProps<"button">, "className" | "children" | "type"> & {
    type?: "button" | "submit" | "reset";
  }) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      data-size={size}
      data-tone={tone}
      className={clsx("cq-icon-btn", className)}
      {...props}
    >
      {icon}
    </button>
  );
}

export function IconLinkButton({
  label,
  icon,
  size = "md",
  tone = "default",
  className,
  ...props
}: IconOnly & Omit<ComponentProps<typeof Link>, "className" | "children">) {
  return (
    <Link
      aria-label={label}
      title={label}
      data-size={size}
      data-tone={tone}
      className={clsx("cq-icon-btn", className)}
      {...props}
    >
      {icon}
    </Link>
  );
}
