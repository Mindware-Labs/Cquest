import { blockArraySchema } from "@/lib/blocks";
import { STARTER_TEMPLATES, getTemplates } from "@/lib/templates";
import type { TemplateChoice } from "@/components/admin/editor/TemplatePicker";

// Une los dos orígenes de plantilla (las 4 fijas en código y las guardadas en Template) para no duplicar la lista en cada page.tsx.
export async function getTemplateChoices(lang: "es" | "en" = "es"): Promise<TemplateChoice[]> {
  const saved = await getTemplates();

  const starters: TemplateChoice[] = STARTER_TEMPLATES.map((template) => ({
    key: `starter:${template.id}`,
    name: template.name[lang],
    blocks: template.blocks,
    origin: "starter",
  }));

  // Una plantilla guardada con una versión vieja del schema se descarta en vez de romper la pantalla.
  const savedChoices: TemplateChoice[] = saved.flatMap((template) => {
    const parsed = blockArraySchema.safeParse(template.blocks);
    if (!parsed.success) return [];
    return [
      {
        key: `saved:${template.id}`,
        name: template.name,
        blocks: parsed.data,
        origin: "saved" as const,
        authorName: template.author.name,
      },
    ];
  });

  return [...starters, ...savedChoices];
}
