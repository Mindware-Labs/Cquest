"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import type { CategoryActionState } from "@/lib/categories";
import { Button } from "@/components/admin/ui/Button";
import { Drawer } from "@/components/admin/ui/Drawer";
import { Input } from "@/components/admin/ui/Field";
import { IconPlus } from "@/components/admin/ui/icons";
import { useToast } from "@/components/admin/ui/Toast";

type Action = (state: CategoryActionState, formData: FormData) => Promise<CategoryActionState>;

/* El alta de categorías se mudó a un cajón.

   Antes era una columna fija de 18rem al costado de la lista. Crear una
   categoría es de las acciones MENOS frecuentes del panel —se hacen tres o
   cuatro y no se tocan más—, y esa columna se llevaba un quinto del ancho de la
   pantalla todo el tiempo para eso. Ahora la lista usa el ancho completo y el
   formulario aparece cuando se lo pide. */
export default function CategoryCreateDrawer({
  action,
  /* `tile` lo dibuja como la última casilla de la grilla, en filete punteado.
     Es el patrón de "agregar" que no ocupa un lugar propio en la pantalla: vive
     donde van las categorías, después de la última, así que la acción está
     exactamente donde el ojo terminó de recorrer la lista.

     Además resuelve el estado vacío sin un componente aparte: con cero
     categorías, la grilla es esta sola casilla y ya dice qué hacer. */
  tile = false,
}: {
  action: Action;
  tile?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const { notify } = useToast();

  /* El envío se maneja a mano en vez de con `useActionState` + un efecto que
     mire el resultado. La diferencia no es de estilo: con el efecto, cerrar el
     cajón era un setState disparado por un render, y hay que distinguir "error
     null porque nadie envió nada" de "error null porque salió bien" con una
     bandera extra. Acá el resultado se lee donde se produce, y el cajón se
     cierra únicamente cuando la creación funcionó.

     Si falla, el cajón se queda abierto con lo escrito: cerrar y perder lo
     tipeado es la forma más rápida de que alguien abandone el formulario. */
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
      notify({ message: "Categoría creada.", tone: "success" });
    });
  }

  return (
    <>
      {tile ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="cq-add-tile"
        >
          <IconPlus size={18} aria-hidden="true" />
          <span className="cq-title">Nueva categoría</span>
          <span className="cq-meta">Se usa para agrupar artículos en el blog</span>
        </button>
      ) : (
        <Button variant="solid" icon={<IconPlus size={15} />} onClick={() => setOpen(true)}>
          Nueva categoría
        </Button>
      )}

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Nueva categoría"
        description="El identificador de URL se genera solo a partir del nombre."
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            {/* El botón vive en el pie del cajón pero envía el formulario del
                cuerpo: los une el atributo `form`, que es lo que permite tener
                el control de guardar siempre a la vista aunque el formulario
                crezca y haya que desplazarse. */}
            <Button type="submit" form="category-create" variant="solid" disabled={isPending}>
              {isPending ? "Creando…" : "Crear categoría"}
            </Button>
          </>
        }
      >
        <form id="category-create" ref={formRef} onSubmit={handleSubmit} className="grid gap-4">
          <Input
            id="new-category"
            name="name"
            label="Nombre"
            required
            maxLength={60}
            autoFocus
            placeholder="Por ejemplo: Operaciones"
            hint="Es el nombre que se ve en el blog público, arriba del título del artículo."
            error={error ?? undefined}
          />
          {/* El nombre en inglés, OPCIONAL.
              ---------------------------------------------------------------
              El blog está partido por idioma —un artículo vive en uno solo— pero
              la categoría era una fila con un solo nombre, así que /en/blog
              mostraba «Operaciones» en la miga y en el filtro de un artículo
              escrito en inglés.

              Opcional y no obligatorio: hacerlo obligatorio sería un peaje en
              inglés para quien sólo publica en español. Vacío usa el nombre de
              arriba, que es feo pero legible. */}
          <Input
            id="new-category-en"
            name="nameEn"
            label="Nombre en inglés"
            maxLength={60}
            placeholder="Por ejemplo: Operations"
            hint="Opcional. Si se deja vacío, el blog en inglés muestra el nombre de arriba."
          />
        </form>
      </Drawer>
    </>
  );
}
