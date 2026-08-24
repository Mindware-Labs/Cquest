"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition, type FormEvent } from "react";
import type { PostActionState } from "@/lib/posts";
import { Button } from "@/components/admin/ui/Button";
import { Drawer, DrawerSection } from "@/components/admin/ui/Drawer";
import { Input, Select, Textarea } from "@/components/admin/ui/Field";
import { IconPlus } from "@/components/admin/ui/icons";
import { useToast } from "@/components/admin/ui/Toast";

// "Nuevo artículo" abre el mismo cajón que edita la ficha, no el editor entero: primero se identifica y guarda el artículo (existe en la base desde el minuto uno), y recién ahí se abre el editor — a diferencia de PostMetaDrawer, no muestra estado, no lleva expectedUpdatedAt, y guardar navega al editor en vez de solo cerrar.

type Action = (state: PostActionState, formData: FormData) => Promise<PostActionState>;

export default function PostCreateDrawer({
  categories,
  action,
  // Cadena y no un trigger JSX: lo montan Server Components y una función no cruza esa frontera.
  label = "Nuevo artículo",
}: {
  categories: ReadonlyArray<{ id: number; name: string }>;
  action: Action;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const { notify } = useToast();

  // Envío manual y no useActionState + efecto: así el cajón se cierra solo si la creación funcionó, y si falla queda abierto con lo escrito.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await action({ error: null }, formData);

      if (result.error) {
        setError(result.error);
        return;
      }

      setError(null);
      setOpen(false);
      formRef.current?.reset();
      notify({ message: "Artículo creado. Ahora el contenido.", tone: "success" });

      // Navega al editor del artículo recién creado: todavía no tiene portada ni bloques, y sin ellos no se puede publicar.
      if (result.id) router.push(`/admin/posts/${result.id}/edit`);
    });
  }

  return (
    <>
      <Button variant="solid" icon={<IconPlus size={15} />} onClick={() => setOpen(true)}>
        {label}
      </Button>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Nuevo artículo"
        description="La portada y los bloques se cargan después, en el editor."
        // "lg" igual que el cajón de ficha: seis campos, dos de ellos áreas de texto de varias líneas.
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" form="post-create" variant="solid" disabled={isPending}>
              {isPending ? "Creando…" : "Crear y escribir"}
            </Button>
          </>
        }
      >
        <form id="post-create" ref={formRef} onSubmit={handleSubmit}>
          <DrawerSection title="Identificación" divided={false}>
            <div className="grid gap-4">
              <Input
                id="new-post-title"
                name="title"
                label="Título"
                required
                maxLength={120}
                autoFocus
                placeholder="Por ejemplo: Cómo medimos la calidad de una llamada"
                error={error ?? undefined}
              />
              <Input
                id="new-post-slug"
                name="slug"
                label="Identificador de URL"
                hint="Opcional. Vacío se genera solo a partir del título."
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Select
                  id="new-post-category"
                  name="categoryId"
                  label="Categoría"
                  defaultValue={categories[0] ? String(categories[0].id) : undefined}
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
                <Select id="new-post-locale" name="locale" label="Idioma" defaultValue="es">
                  <option value="es">Español</option>
                  <option value="en">Inglés</option>
                </Select>
              </div>
            </div>
          </DrawerSection>

          <DrawerSection
            title="Buscadores y listado"
            description="Con los campos de buscador vacíos se usan el título y el extracto."
          >
            <div className="grid gap-4">
              <Textarea
                id="new-post-excerpt"
                name="excerpt"
                label="Extracto"
                required
                rows={3}
                maxLength={300}
                hint="Es el resumen que se ve en el listado del blog."
              />
              <Input
                id="new-post-seo-title"
                name="seoTitle"
                label="Título para buscadores"
                maxLength={70}
              />
              <Textarea
                id="new-post-seo-description"
                name="seoDescription"
                label="Descripción para buscadores"
                rows={2}
                maxLength={160}
              />
            </div>
          </DrawerSection>
        </form>
      </Drawer>
    </>
  );
}
