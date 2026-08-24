"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import type { CategoryActionState } from "@/lib/categories";
import { Button } from "@/components/admin/ui/Button";
import { Drawer } from "@/components/admin/ui/Drawer";
import { Input } from "@/components/admin/ui/Field";
import { IconPlus } from "@/components/admin/ui/icons";
import { useToast } from "@/components/admin/ui/Toast";

type Action = (state: CategoryActionState, formData: FormData) => Promise<CategoryActionState>;

// Cajón en vez de columna fija de 18rem: crear categorías es de las acciones menos frecuentes del panel y no justifica ese ancho permanente.
export default function CategoryCreateDrawer({
  action,
  // tile: casilla punteada al final de la grilla, exactamente donde el ojo terminó de recorrer la lista; con cero categorías resuelve el estado vacío sin componente aparte.
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

  // A mano en vez de useActionState + efecto: evita distinguir "error null porque nadie envió" de "error null porque salió bien" con una bandera extra. Si falla, el cajón queda abierto con lo escrito.
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
            {/* El atributo form une este botón (en el pie) con el formulario del cuerpo: el control de guardar queda siempre a la vista aunque haya que desplazarse. */}
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
          {/* Opcional y no obligatorio: exigirlo sería un peaje en inglés para quien sólo publica en español. Vacío usa el nombre de arriba. */}
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
