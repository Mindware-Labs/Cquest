import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { PostStatus, PostLocale } from "../src/generated/prisma/client";

// Artículos de prueba (npx tsx prisma/seed-demo-posts.ts [--clean]); el prefijo evita borrar artículos reales.
const DEMO_PREFIX = "demo-";

// Portadas ya existentes en /public: evita subir a Blob imágenes de andamiaje que luego habría que limpiar.
const COVERS = [
  { url: "/bpo-services/bpo-floor.jpeg", alt: "Piso de operaciones de Center Quest durante un turno." },
  { url: "/hero-callcenter.jpg", alt: "Puesto de trabajo con headset y teclado en el piso de call center." },
  { url: "/bpo-services/bpo-floor2.jpg", alt: "Agentes de Center Quest en sus estaciones de trabajo." },
  { url: "/rig-hut/system-011-redacted.png", alt: "Pantalla de un sistema interno desarrollado por Center Quest." },
  { url: "/bpo-services/bpo-floor3.jpeg", alt: "Vista general del piso de BPO de Center Quest." },
  { url: "/rig-hut/system-013-redacted.png", alt: "Tablero de métricas de una operación en curso." },
];

type Demo = {
  slug: string;
  title: string;
  excerpt: string;
  categorySlug: string;
  /* Días hacia atrás desde hoy. Escalonados para que el orden del listado
     (publishedAt desc) sea estable y no dependa del momento del seed. */
  daysAgo: number;
  body: string[];
};

const POSTS: Demo[] = [
  {
    slug: "tiempo-medio-resolucion-operacion-salud",
    title: "Cómo bajamos 40% el tiempo medio de resolución en una operación de salud",
    excerpt:
      "Una aseguradora nos pidió acortar las llamadas. Terminamos cambiando el orden en que el agente ve la información, y el tiempo bajó solo.",
    categorySlug: "call-center",
    daysAgo: 3,
    body: [
      "El pedido inicial era simple: acortar el tiempo medio de resolución. La primera lectura de cualquiera es empujar al agente a hablar más rápido, y esa lectura casi siempre está mal.",
      "Grabamos dos semanas de llamadas y medimos dónde se iba el tiempo de verdad. No estaba en la conversación: estaba en los silencios mientras el agente saltaba entre tres pantallas para juntar los datos del afiliado.",
      "Reordenamos la vista para que lo que se pregunta primero esté arriba y a la izquierda. El tiempo medio bajó 40% en seis semanas, sin tocar el guion ni pedirle a nadie que apurara.",
    ],
  },
  {
    slug: "tres-capas-qa-campana-cobranzas",
    title: "Tres capas de QA que sostienen una campaña de cobranzas",
    excerpt:
      "En cobranzas, un error de tono no es una queja: es un riesgo regulatorio. Así revisamos las llamadas sin frenar la operación.",
    categorySlug: "call-center",
    daysAgo: 11,
    body: [
      "Una campaña de cobranzas se juega en el tono. La diferencia entre una gestión firme y una que expone a la empresa está en cómo se dice, no en qué se dice.",
      "La primera capa es automática y escucha el 100% de las llamadas buscando palabras y patrones que nunca deberían aparecer. No juzga la calidad: levanta la mano.",
      "La segunda es humana y muestreada, sobre las llamadas que la primera marcó más las que salen al azar. La tercera es la calibración semanal, donde el equipo de QA escucha junto y discute los casos donde no se pusieron de acuerdo.",
    ],
  },
  {
    slug: "que-medimos-cuando-decimos-satisfaccion",
    title: "Qué medimos realmente cuando decimos «satisfacción del cliente»",
    excerpt:
      "NPS, CSAT y CES miden tres cosas distintas y se usan como si fueran la misma. Cuál sirve para qué, con ejemplos de operaciones reales.",
    categorySlug: "bpo",
    daysAgo: 19,
    body: [
      "Casi todos los tableros que heredamos tienen un número grande arriba que dice «satisfacción». Casi ninguno explica de qué pregunta salió, y esa pregunta cambia por completo lo que el número significa.",
      "El NPS mide intención de recomendar y sirve para leer la relación con la marca a lo largo del tiempo. El CSAT mide una interacción puntual. El CES mide cuánto esfuerzo le costó al cliente resolver su problema.",
      "Si querés saber si tu operación funciona, el CES es el que más rápido te lo dice. El NPS es el que más lento se mueve, y por eso es el peor indicador para evaluar un cambio que hiciste la semana pasada.",
    ],
  },
  {
    slug: "crm-propio-para-operaciones",
    title: "El CRM que construimos porque ninguno del mercado servía",
    excerpt:
      "Cinco licencias evaluadas, ninguna encajaba con cómo trabaja realmente el equipo. Lo que aprendimos construyéndolo desde cero.",
    categorySlug: "sistemas",
    daysAgo: 28,
    body: [
      "Antes de escribir una línea probamos cinco CRMs del mercado. Todos podían hacer lo que el cliente pedía; ninguno lo hacía en el orden en que el equipo ya trabajaba.",
      "Adoptar cualquiera de ellos significaba pedirle a cuarenta personas que cambiaran su forma de trabajar para acomodarse a la herramienta. Ese costo nunca aparece en la comparativa de precios y siempre es el más caro.",
      "Construirlo tomó once semanas. La decisión no fue técnica: fue aceptar que la herramienta se adapta a la operación y no al revés.",
    ],
  },
  {
    slug: "turnos-nocturnos-sin-rotacion",
    title: "Turnos nocturnos sin rotación: lo que aprendimos en dos años",
    excerpt:
      "El turno de la madrugada es donde toda operación pierde gente. Estas son las cuatro cosas que nos funcionaron, y la que no.",
    categorySlug: "bpo",
    daysAgo: 40,
    body: [
      "La rotación en el turno nocturno era del doble que en el diurno. Probamos cuatro cosas a lo largo de dos años y medimos cada una por separado.",
      "Las que funcionaron: transporte puerta a puerta, comida caliente en el sitio, supervisión propia del turno en vez de prestada del diurno, y horarios fijos en lugar de rotativos.",
      "La que no funcionó fue el diferencial salarial por sí solo. Pagando más y sin cambiar nada más, la gente se quedaba dos meses más y se iba igual.",
    ],
  },
  {
    slug: "onboarding-72-horas",
    title: "Onboarding en 72 horas: el guion completo",
    excerpt:
      "De la firma del contrato al primer uso real del servicio. Qué pasa en cada una de las tres jornadas y por qué ese orden.",
    categorySlug: "general",
    daysAgo: 55,
    body: [
      "El momento de mayor riesgo de una cuenta nueva no es la venta: son los primeros tres días. Si el cliente no usa el servicio en ese plazo, la probabilidad de que lo use después cae a la mitad.",
      "El primer día es de datos y accesos, y no lo hace el cliente: lo hacemos nosotros con lo que ya nos dio. El segundo es la sesión guiada, con su información real cargada y no con un ejemplo genérico.",
      "El tercero es el seguimiento, y es el que más se saltea. Una llamada corta a las 72 horas para preguntar qué no está funcionando cambia la curva de adopción más que cualquier material de capacitación.",
    ],
  },
];

function blocks(paragraphs: string[], slug: string) {
  return paragraphs.map((text, index) => ({
    id: `${slug}-p${index}`,
    type: "paragraph" as const,
    text,
    variant: index === 0 ? ("lead" as const) : ("body" as const),
    align: "left" as const,
    spacingTop: "md" as const,
    spacingBottom: "md" as const,
  }));
}

function daysAgoDate(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

async function clean() {
  const { count } = await prisma.post.deleteMany({
    where: { slug: { startsWith: DEMO_PREFIX } },
  });
  console.log(`Artículos de prueba borrados: ${count}.`);
}

async function seed() {
  /* Cualquier admin sirve: estos artículos no se atribuyen a nadie en el sitio
     público, pero el modelo exige un autor. */
  const author = await prisma.adminUser.findFirst({ select: { id: true } });
  if (!author) {
    throw new Error("No hay ningún AdminUser en la base. Corré prisma/create-admin.ts primero.");
  }

  const categories = await prisma.category.findMany({ select: { id: true, slug: true } });
  const byCategorySlug = new Map(categories.map((c) => [c.slug, c.id]));

  for (const [index, post] of POSTS.entries()) {
    const categoryId = byCategorySlug.get(post.categorySlug);
    if (!categoryId) {
      console.warn(`Saltado "${post.title}": no existe la categoría "${post.categorySlug}".`);
      continue;
    }

    const cover = COVERS[index % COVERS.length];
    const slug = `${DEMO_PREFIX}${post.slug}`;
    const publishedAt = daysAgoDate(post.daysAgo);

    const data = {
      title: post.title,
      excerpt: post.excerpt,
      content: blocks(post.body, slug),
      coverImageUrl: cover.url,
      coverImageAlt: cover.alt,
      categoryId,
      authorId: author.id,
      locale: PostLocale.es,
      status: PostStatus.PUBLISHED,
      publishedAt,
    };

    /* upsert y no create: correr el script dos veces no debe reventar por slug
       duplicado ni dejar la base con dos copias de cada artículo. */
    await prisma.post.upsert({ where: { slug }, update: data, create: { ...data, slug } });
    console.log(`✓ ${slug}`);
  }

  console.log(`\n${POSTS.length} artículos de prueba listos. Para borrarlos:`);
  console.log("  npx tsx prisma/seed-demo-posts.ts --clean");
}

const run = process.argv.includes("--clean") ? clean : seed;

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
