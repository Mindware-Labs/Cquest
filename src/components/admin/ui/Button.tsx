import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";
import clsx from "clsx";

/* Los botones del panel, en un solo lugar.

   Cuatro variantes y dos tamaños. No hay una quinta: cada variante existe
   porque responde a una pregunta distinta —¿qué hago acá? ¿qué más puedo
   hacer? ¿qué hay disponible? ¿qué destruye algo?— y agregar una sexta sin
   pregunta nueva es lo que convierte un sistema en una paleta.

   `solid` va una sola vez por pantalla. Si hay dos acciones sólidas
   compitiendo, ninguna de las dos es la principal. */

export type ButtonVariant = "solid" | "outline" | "ghost" | "danger";
export type ButtonSize = "md" | "sm";

type Common = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /* Icono al principio. Va antes del texto y nunca solo: para eso está
     IconButton, que además exige el nombre accesible. */
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

/* Un enlace que se ve como botón. Existe separado y no como una prop `href` del
   botón porque son dos elementos distintos para el navegador y para el lector
   de pantalla: uno navega, el otro ejecuta. Un <button> que navega rompe abrir
   en pestaña nueva; un <a> que ejecuta no responde a la barra espaciadora. */
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

/* Botón de sólo icono.

   `label` es obligatorio por tipo, no por convención: un botón sin texto no
   tiene nombre accesible, y "lo agregamos después" es como se llega a una
   fila de cinco iconos que un lector de pantalla anuncia como "botón, botón,
   botón". Se usa como aria-label y como tooltip nativo a la vez — quien ve la
   pantalla y quien la escucha reciben exactamente lo mismo. */

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
