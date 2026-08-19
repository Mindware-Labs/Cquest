import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentAdminId } from "@/lib/auth";
import { blockArraySchema, type Block } from "@/lib/blocks";
import type { Locale } from "@/i18n/config";

export type StarterTemplate = {
  id: string;
  name: Record<Locale, string>;
  blocks: Block[];
};

/* Catálogo fijo, estilo los archivos de datos de SERVICES — vive en código,
   no en base de datos. Los bloques de tipo "image" quedan con src/alt vacíos
   a propósito: no hay ninguna imagen real que darles hasta que el admin suba
   una desde el editor. */
export const STARTER_TEMPLATES: StarterTemplate[] = [
  {
    id: "case-study",
    name: { es: "Estudio de caso", en: "Case study" },
    blocks: [
      {
        id: "case-study-heading",
        type: "heading",
        text: "Cómo ayudamos a [cliente] a lograr [resultado]",
        level: "h2",
        weight: "medium",
        align: "left",
        spacingTop: "none",
        spacingBottom: "md",
      },
      {
        id: "case-study-lead",
        type: "paragraph",
        text: "Un resumen corto del reto del cliente y del resultado alcanzado, en una o dos frases.",
        variant: "lead",
        align: "left",
        spacingTop: "none",
        spacingBottom: "lg",
      },
      {
        id: "case-study-cover",
        type: "image",
        src: "",
        alt: "",
        display: "full",
        spacingTop: "none",
        spacingBottom: "lg",
      },
      {
        id: "case-study-results-heading",
        type: "heading",
        text: "Resultados",
        level: "h2",
        weight: "medium",
        align: "left",
        spacingTop: "lg",
        spacingBottom: "sm",
      },
      {
        id: "case-study-results-list",
        type: "list",
        items: ["Primer resultado medible", "Segundo resultado medible", "Tercer resultado medible"],
        ordered: false,
        markerStyle: "check",
        spacingTop: "none",
        spacingBottom: "lg",
      },
      {
        id: "case-study-quote",
        type: "quote",
        text: "Una cita textual del cliente sobre el impacto del proyecto.",
        attributionName: "Nombre del contacto",
        attributionRole: "Cargo, Empresa",
        style: "bordered",
        spacingTop: "none",
        spacingBottom: "lg",
      },
      {
        id: "case-study-cta",
        type: "cta",
        heading: "¿Quieres resultados así en tu operación?",
        buttonLabel: "Solicitar cotización",
        href: "/quote",
        hrefKind: "internal",
        style: "primary",
        spacingTop: "lg",
        spacingBottom: "none",
      },
    ],
  },
  {
    id: "service-announcement",
    name: { es: "Anuncio de servicio", en: "Service announcement" },
    blocks: [
      {
        id: "announcement-heading",
        type: "heading",
        text: "Título del anuncio",
        level: "h2",
        weight: "medium",
        align: "left",
        spacingTop: "none",
        spacingBottom: "md",
      },
      {
        id: "announcement-paragraph",
        type: "paragraph",
        text: "Descripción corta de la novedad o el servicio que se está anunciando.",
        variant: "lead",
        align: "left",
        spacingTop: "none",
        spacingBottom: "lg",
      },
      {
        id: "announcement-cover",
        type: "image",
        src: "",
        alt: "",
        display: "full",
        spacingTop: "none",
        spacingBottom: "lg",
      },
      {
        id: "announcement-columns",
        type: "columns",
        columnCount: 2,
        columns: [
          [
            {
              id: "announcement-col-1-heading",
              type: "heading",
              text: "Primer beneficio",
              level: "h3",
              weight: "medium",
              align: "left",
              spacingTop: "none",
              spacingBottom: "sm",
            },
            {
              id: "announcement-col-1-paragraph",
              type: "paragraph",
              text: "Explicación breve del primer beneficio.",
              variant: "body",
              align: "left",
              spacingTop: "none",
              spacingBottom: "none",
            },
          ],
          [
            {
              id: "announcement-col-2-heading",
              type: "heading",
              text: "Segundo beneficio",
              level: "h3",
              weight: "medium",
              align: "left",
              spacingTop: "none",
              spacingBottom: "sm",
            },
            {
              id: "announcement-col-2-paragraph",
              type: "paragraph",
              text: "Explicación breve del segundo beneficio.",
              variant: "body",
              align: "left",
              spacingTop: "none",
              spacingBottom: "none",
            },
          ],
        ],
        spacingTop: "none",
        spacingBottom: "lg",
      },
      {
        id: "announcement-cta",
        type: "cta",
        heading: "Habla con nuestro equipo",
        buttonLabel: "Solicitar cotización",
        href: "/quote",
        hrefKind: "internal",
        style: "primary",
        spacingTop: "lg",
        spacingBottom: "none",
      },
    ],
  },
  {
    id: "industry-insights",
    name: { es: "Contenido educativo", en: "Industry insights" },
    blocks: [
      {
        id: "insights-heading",
        type: "heading",
        text: "Título del artículo",
        level: "h2",
        weight: "medium",
        align: "left",
        spacingTop: "none",
        spacingBottom: "md",
      },
      {
        id: "insights-paragraph",
        type: "paragraph",
        text: "Introducción al tema que se va a desarrollar en el artículo.",
        variant: "lead",
        align: "left",
        spacingTop: "none",
        spacingBottom: "lg",
      },
      {
        id: "insights-list",
        type: "list",
        items: ["Primer punto clave", "Segundo punto clave", "Tercer punto clave"],
        ordered: true,
        markerStyle: "bullet",
        spacingTop: "none",
        spacingBottom: "lg",
      },
      {
        id: "insights-table",
        type: "table",
        headers: ["Antes", "Después"],
        rows: [["Situación inicial", "Situación mejorada"]],
        striped: true,
        spacingTop: "none",
        spacingBottom: "lg",
      },
      {
        id: "insights-image",
        type: "image",
        src: "",
        alt: "",
        display: "inset",
        spacingTop: "none",
        spacingBottom: "lg",
      },
      {
        id: "insights-divider",
        type: "divider",
        style: "line",
        spacingTop: "none",
        spacingBottom: "lg",
      },
      {
        id: "insights-closing-paragraph",
        type: "paragraph",
        text: "Cierre o conclusión del artículo.",
        variant: "body",
        align: "left",
        spacingTop: "none",
        spacingBottom: "lg",
      },
      {
        id: "insights-cta",
        type: "cta",
        heading: "¿Quieres profundizar en este tema?",
        buttonLabel: "Contáctanos",
        href: "/quote",
        hrefKind: "internal",
        style: "secondary",
        spacingTop: "lg",
        spacingBottom: "none",
      },
    ],
  },
  {
    id: "blank",
    name: { es: "En blanco", en: "Blank" },
    blocks: [
      {
        id: "blank-paragraph",
        type: "paragraph",
        text: "Empieza a escribir aquí.",
        variant: "body",
        align: "left",
        spacingTop: "none",
        spacingBottom: "none",
      },
    ],
  },
];

export type TemplateActionState = { error: string | null };

const nameSchema = z
  .string()
  .trim()
  .min(2, "El nombre debe tener al menos 2 caracteres.")
  .max(60, "El nombre no puede superar 60 caracteres.");

function isForeignKeyConstraintError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003";
}

/** Plantillas guardadas por los admins — lectura simple, sin pasar por Server Action. */
export async function getTemplates() {
  return prisma.template.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: { select: { id: true, name: true } } },
  });
}

export async function createTemplateFromBlocks(
  _prevState: TemplateActionState,
  formData: FormData,
): Promise<TemplateActionState> {
  "use server";

  const authorId = await getCurrentAdminId();

  const parsedName = nameSchema.safeParse(formData.get("name"));
  if (!parsedName.success) {
    return { error: parsedName.error.issues[0].message };
  }

  const rawBlocks = formData.get("blocks");
  if (typeof rawBlocks !== "string") {
    return { error: "Faltan los bloques de la plantilla." };
  }

  let parsedBlocksJson: unknown;
  try {
    parsedBlocksJson = JSON.parse(rawBlocks);
  } catch {
    return { error: "Los bloques de la plantilla no son un JSON válido." };
  }

  const parsedBlocks = blockArraySchema.safeParse(parsedBlocksJson);
  if (!parsedBlocks.success) {
    return { error: parsedBlocks.error.issues[0].message };
  }

  try {
    await prisma.template.create({
      data: { name: parsedName.data, blocks: parsedBlocks.data, authorId },
    });
  } catch (error) {
    if (isForeignKeyConstraintError(error)) {
      return { error: "El autor de la plantilla no existe." };
    }
    throw error;
  }

  return { error: null };
}

export async function deleteTemplate(
  _prevState: TemplateActionState,
  formData: FormData,
): Promise<TemplateActionState> {
  "use server";

  await getCurrentAdminId();

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) {
    return { error: "Plantilla inválida." };
  }

  await prisma.template.delete({ where: { id } });
  return { error: null };
}
