/* Lo que un artículo necesita para publicarse, en un solo sitio: el servidor
   valida con esto y el editor decide con esto si el botón está bloqueado. Si
   cada lado llevara su lista, el botón acabaría habilitado para algo que el
   servidor rechaza, o al revés. */

export type PublishDraft = {
  title: string;
  excerpt: string;
  categoryId: string | null;
  coverUrl: string | null;
  coverAlt: string | null;
};

export type PublishRule = {
  field: keyof PublishDraft;
  /* `message` va bajo el campo del formulario; `need` se lee detrás de un
     "Falta…", así que va en minúscula y sin punto. */
  message: string;
  need: string;
  ok: (draft: PublishDraft) => boolean;
};

export const PUBLISH_RULES: PublishRule[] = [
  {
    field: "title",
    message: "El título necesita al menos 3 caracteres.",
    need: "el título",
    ok: (draft) => draft.title.trim().length >= 3,
  },
  {
    field: "excerpt",
    message: "El extracto necesita al menos 20 caracteres.",
    need: "el extracto (mínimo 20 caracteres)",
    ok: (draft) => draft.excerpt.trim().length >= 20,
  },
  {
    field: "categoryId",
    message: "Elige una categoría antes de publicar.",
    need: "la categoría",
    ok: (draft) => Boolean(draft.categoryId),
  },
  /* La portada es opcional. El texto alternativo solo se exige cuando hay
     imagen: sin ella no describe nada, y exigirlo bloquearía un artículo que
     no lleva portada a propósito. */
  {
    field: "coverAlt",
    message: "La portada necesita texto alternativo.",
    need: "el texto alternativo de la portada",
    ok: (draft) => !draft.coverUrl || (draft.coverAlt ?? "").trim().length >= 3,
  },
];

export function missingToPublish(draft: PublishDraft): PublishRule[] {
  return PUBLISH_RULES.filter((rule) => !rule.ok(draft));
}
