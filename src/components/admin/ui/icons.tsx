import type { SVGProps } from "react";

/* Set de iconos dibujado para el panel. No hay librería de iconos en el
   proyecto y los glifos unicode (↑ ↓ ✕) que se usaban antes heredan la métrica
   de la fuente: se ven de distinto tamaño y grosor según el navegador.
   Todos comparten grilla de 24, trazo de 1.6 y remates redondeados, así que
   cualquier combinación de iconos se lee como un solo sistema. */

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Icon({ size = 18, children, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export function IconHome(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 10.5 12 4l8 6.5" />
      <path d="M6 9.8V20h12V9.8" />
      <path d="M10 20v-5h4v5" />
    </Icon>
  );
}

export function IconArticles(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="4" y="3.5" width="16" height="17" rx="1.5" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </Icon>
  );
}

export function IconTemplates(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3.5" y="4" width="17" height="16" rx="1.5" />
      <path d="M3.5 9h17M9.5 9v11" />
    </Icon>
  );
}

export function IconCategories(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 7h11M4 12h16M4 17h8" />
      <circle cx="18.5" cy="7" r="1.6" />
      <circle cx="15.5" cy="17" r="1.6" />
    </Icon>
  );
}

export function IconPlus(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 5v14M5 12h14" />
    </Icon>
  );
}

export function IconPencil(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3Z" />
      <path d="M14.5 7.5 16.5 9.5" />
    </Icon>
  );
}

export function IconTrash(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4.5 7h15" />
      <path d="M9.5 7V5.5A1.5 1.5 0 0 1 11 4h2a1.5 1.5 0 0 1 1.5 1.5V7" />
      <path d="M6.5 7v12A1.5 1.5 0 0 0 8 20.5h8a1.5 1.5 0 0 0 1.5-1.5V7" />
      <path d="M10.5 11v5.5M13.5 11v5.5" />
    </Icon>
  );
}

export function IconEye(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M2.8 12S6.6 5.8 12 5.8 21.2 12 21.2 12 17.4 18.2 12 18.2 2.8 12 2.8 12Z" />
      <circle cx="12" cy="12" r="2.7" />
    </Icon>
  );
}

export function IconEyeOff(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 4.5 20 19.5" />
      <path d="M9.6 6.3A9.4 9.4 0 0 1 12 6c5.4 0 9.2 6 9.2 6a17 17 0 0 1-3.1 3.7" />
      <path d="M15.1 15.4A9 9 0 0 1 12 18c-5.4 0-9.2-6-9.2-6a17.2 17.2 0 0 1 4-4.3" />
      <path d="M10.2 10.4a2.7 2.7 0 0 0 3.5 3.6" />
    </Icon>
  );
}

/* Panel lateral: el rectángulo de la pantalla con la columna del riel marcada.
   Es la convención que ya usan editores y paneles para "plegar la barra", y se
   entiende sin leer nada — una flecha sola no dice QUÉ se pliega. */
export function IconPanelLeft(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M9.5 4v16" />
    </Icon>
  );
}

export function IconDots(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="5.5" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="18.5" r="1.1" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function IconMail(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </Icon>
  );
}

export function IconLock(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="4.5" y="10.5" width="15" height="9.5" rx="2" />
      <path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7" />
    </Icon>
  );
}

export function IconArrowRight(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4.5 12h15" />
      <path d="m13.5 6 6 6-6 6" />
    </Icon>
  );
}

/* Espejo exacto de IconArrowRight: mismo trazo, mismo largo de asta, misma
   apertura de punta. Un icono de volver dibujado a ojo se nota al lado del de
   avanzar. */
export function IconArrowLeft(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M19.5 12h-15" />
      <path d="m10.5 6-6 6 6 6" />
    </Icon>
  );
}

export function IconArrowUp(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 19V5" />
      <path d="M6.5 10.5 12 5l5.5 5.5" />
    </Icon>
  );
}

export function IconArrowDown(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 5v14" />
      <path d="M6.5 13.5 12 19l5.5-5.5" />
    </Icon>
  );
}

export function IconClose(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 6 18 18M18 6 6 18" />
    </Icon>
  );
}

export function IconSearch(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m15.8 15.8 4 4" />
    </Icon>
  );
}

export function IconChevronDown(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m6.5 9.5 5.5 5.5 5.5-5.5" />
    </Icon>
  );
}

export function IconCapsLock(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 4.5 5 12h3.5v4h7v-4H19L12 4.5Z" />
      <path d="M8.5 19.5h7" />
    </Icon>
  );
}

export function IconMenu(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Icon>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 12.5 9.5 17 19 7.5" />
    </Icon>
  );
}

export function IconExternal(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M14 4h6v6" />
      <path d="M20 4 11 13" />
      <path d="M18.5 14.5V19a1.5 1.5 0 0 1-1.5 1.5H5.5A1.5 1.5 0 0 1 4 19V7.5A1.5 1.5 0 0 1 5.5 6H10" />
    </Icon>
  );
}

export function IconLogout(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M14 4.5H6.5A1.5 1.5 0 0 0 5 6v12a1.5 1.5 0 0 0 1.5 1.5H14" />
      <path d="M17 8.5 20.5 12 17 15.5" />
      <path d="M20 12H10" />
    </Icon>
  );
}

export function IconWarning(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 4.5 21 19.5H3L12 4.5Z" />
      <path d="M12 10v4.2" />
      <circle cx="12" cy="17" r=".6" fill="currentColor" stroke="none" />
    </Icon>
  );
}

/* Reintentar. Va en el estado de error, que es el único lugar donde una acción
   del panel se repite tal cual. */
export function IconRetry(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M20 12a8 8 0 1 1-2.6-5.9" />
      <path d="M20 4v4.5h-4.5" />
    </Icon>
  );
}

export function IconSpinner({ size = 18, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
      className="animate-spin"
      {...props}
    >
      <path d="M12 3.5a8.5 8.5 0 1 0 8.5 8.5" />
    </svg>
  );
}
