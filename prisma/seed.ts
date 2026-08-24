import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { slugify } from "../src/lib/slug";

// Las 4 líneas de negocio del Requirements Document v1.1 (AGENTS.md). Categoria es tabla y no enum para que sumar una línea sea una fila, no un despliegue.
const INITIAL_CATEGORIES = ["Call Center", "BPO", "Sistemas", "General"];

async function main() {
  const result = await prisma.category.createMany({
    data: INITIAL_CATEGORIES.map((name) => ({ name, slug: slugify(name) })),
    skipDuplicates: true,
  });
  console.log(`Categorías nuevas creadas: ${result.count} (las que ya existían quedaron intactas).`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
