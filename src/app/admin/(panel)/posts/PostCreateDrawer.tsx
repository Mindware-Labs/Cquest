"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition, type FormEvent } from "react";
import type { PostActionState } from "@/lib/posts";
import { Button } from "@/components/admin/ui/Button";
import { Drawer, DrawerSection } from "@/components/admin/ui/Drawer";
import { Input, Select, Textarea } from "@/components/admin/ui/Field";
import { IconPlus } from "@/components/admin/ui/icons";
import { useToast } from "@/components/admin/ui/Toast";

/* «Nuevo artículo» abre el MISMO cajón que edita la ficha, no el editor entero.

   Antes el botón cargaba el editor de bloques en blanco: lienzo, paleta,
   propiedades y previa, todo montado para escribir un título. Y ahí adentro los
   campos de la ficha son un panel lateral entre otras cinco cosas, así que el
   primer paso real —cómo se llama, de qué categoría es, qué resume— quedaba
   escondido detrás de la herramienta más pesada del panel.

   El orden que impone este cajón es el del trabajo: primero se identifica el
   artículo, se guarda, y RECIÉN AHÍ se abre el editor a escribirlo. De paso el
   artículo existe en la base desde el minuto uno, así que lo que se escriba
   después se guarda sobre una fila que ya está, no sobre un formulario que
   puede perderse al cerrar la pestaña.

   Es literalmente el formulario de PostMetaDrawer con tres diferencias, y las
   tres salen de que acá todavía no hay artículo:

   - No muestra la insignia de estado. Nace borrador; no hay estado que informar.
   - No lleva la guarda de concurrencia (`expectedUpdatedAt`): no hay versión
     anterior que alguien pueda estar pisando.
   - No enlaza al editor — LLEVA al editor. Guardar es lo que crea el artículo,
     así que la salida natural es seguir escribiéndolo.

   Lo que sí comparte es lo que importa: los mismos seis campos, el mismo
   esquema del servidor (`postMetaSchema`) y el mismo comportamiento al fallar
   —el cajón se queda abierto con lo escrito—. */

type Action = (state: PostActionState, formData: FormData) => Promise<PostActionState>;

export default function PostCreateDrawer({
  categories,
  action,
  /* El texto del botón que lo abre. Es una cadena y no un `trigger` que
     devuelva JSX: este componente lo montan Server Components, y una función no
     cruza esa frontera. Con dos usos que sólo difieren en el rótulo —el
     encabezado y el estado vacío de la tabla— una cadena alcanza. */
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

  /* El envío se maneja a mano y no con `useActionState` + un efecto: así el
     cajón se cierra únicamente cuando la creación funcionó, y si falla se queda
     abierto con lo escrito. Misma decisión que los otros dos cajones del panel. */
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

      /* Al editor del artículo recién creado. Es el paso siguiente y no una
         cortesía: el artículo todavía no tiene ni portada ni bloques, y sin los
         dos no se puede publicar. Dejarlo en la tabla obligaría a buscarlo
         entre las demás filas para seguir donde se estaba. */
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
        /* `lg`, igual que el cajón de ficha: son seis campos y dos de ellos son
           áreas de texto de varias líneas. */
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
