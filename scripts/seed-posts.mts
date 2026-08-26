/* Siembra artículos de muestra para ver el blog con volumen.
   Uso: npm run seed:posts [-- --reset]

   Cliente y render propios en vez de los de src/: aquellos van marcados
   "server-only" y exigen la condición react-server, con la que BlockNote no
   carga fuera de Next. El HTML sale del mismo ServerBlockNoteEditor que usa el
   panel, y republicar desde el editor lo regenera y lo sanea igual que siempre. */
import { ServerBlockNoteEditor } from "@blocknote/server-util";
import { put, del } from "@vercel/blob";
import { eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import sharp from "sharp";
import { category, post } from "../src/db/schema/blog";
import { user } from "../src/db/schema/auth";

const db = drizzle(new Pool({ connectionString: process.env.DATABASE_URL }));

type Para = { h2: string } | { p: string } | { ul: string[] } | { quote: string };

type Seed = {
  slug: string;
  title: string;
  categorySlug: "call-center" | "operations" | "systems-development";
  excerpt: string;
  coverAlt: string;
  daysAgo: number;
  ink: string;
  glow: string;
  body: Para[];
};

const SEEDS: Seed[] = [
  {
    slug: "what-a-twenty-second-answer-time-costs",
    title: "What a 20-second answer time actually costs",
    categorySlug: "call-center",
    excerpt:
      "Every service level is a staffing bill in disguise. Here is the arithmetic we walk clients through before anyone signs a number.",
    coverAlt: "Curva de nivel de servicio sobre fondo petróleo",
    daysAgo: 3,
    ink: "#0a1116",
    glow: "#74c3d5",
    body: [
      {
        p: "Clients almost never ask for an answer time. They ask for “good service” and then discover, three months in, that the number in the contract is what decides whether the queue feels calm or frantic. So we put the arithmetic on the table first.",
      },
      { h2: "The number is a staffing decision" },
      {
        p: "Answering 80% of calls in 20 seconds is not twice the work of answering 80% in 40. Queueing behaves badly near the top: the last few points of service level cost more agents than all the points below them combined. On a 40-seat campaign, moving from 30 to 20 seconds has cost us between four and seven additional seats depending on how spiky the arrival pattern is.",
      },
      { h2: "What we ask before quoting one" },
      {
        ul: [
          "How does volume move across the day, and how sharp is the morning peak?",
          "What share of contacts are genuinely urgent for the caller?",
          "What happens commercially when someone waits two minutes — a complaint, or a lost sale?",
          "Is there a channel that could absorb the overflow without hurting the experience?",
        ],
      },
      {
        p: "The third question is the one that changes the answer most often. When a wait costs a sale, a tight service level pays for itself. When it costs a little patience, the same money buys better resolution on first contact, which the caller notices more.",
      },
      {
        quote:
          "A service level nobody can explain in one sentence is a service level nobody will defend at renewal.",
      },
      { h2: "Where we land" },
      {
        p: "Most campaigns we run settle between 80/20 and 80/30, with a hard ceiling on abandonment rather than a heroic average. It is easier to hold, cheaper to staff, and it survives the weeks when volume does not read the forecast.",
      },
    ],
  },
  {
    slug: "the-collections-script-we-stopped-using",
    title: "The collections script we stopped using",
    categorySlug: "call-center",
    excerpt:
      "Recovery went up when we stopped optimising the opening line and started fixing what happened after the debtor said no.",
    coverAlt: "Trama de líneas ascendentes en verde sobre fondo oscuro",
    daysAgo: 11,
    ink: "#101a10",
    glow: "#6aaa00",
    body: [
      {
        p: "For years the collections script opened with the balance. It is the obvious move: state the amount, state the due date, ask for payment. It also ended a large share of calls in the first fifteen seconds.",
      },
      { h2: "What the recordings showed" },
      {
        p: "We pulled two weeks of calls and marked the moment each one turned. It was almost never the opening. It was the second objection — the point where the debtor explained why they could not pay and the agent had nothing to offer except the same balance again.",
      },
      {
        ul: [
          "Openings changed outcome in under 6% of calls.",
          "Having a second option ready changed outcome in 31%.",
          "Calls where the agent restated the balance twice recovered less than calls that ended politely.",
        ],
      },
      { h2: "The rewrite" },
      {
        p: "The new script is shorter at the top and much longer underneath. Agents lead with the reason for the call, then move straight to what is possible: a date, a split, a partial. The balance is still stated, once, and it is stated as context rather than as pressure.",
      },
      {
        p: "Recovery on the portfolio rose in the first full month and, more usefully, complaints fell. Compliance liked the change before finance did, which is not the usual order.",
      },
    ],
  },
  {
    slug: "back-office-throughput-is-a-queue-problem",
    title: "Back office throughput is a queue problem, not a headcount problem",
    categorySlug: "operations",
    excerpt:
      "Adding people to a backlog that arrives in bursts buys less than rearranging who touches the work and when.",
    coverAlt: "Bloques escalonados en petróleo representando una cola de trabajo",
    daysAgo: 19,
    ink: "#0d1620",
    glow: "#3f738d",
    body: [
      {
        p: "The request arrives in the same shape every time: the backlog is growing, can we add four people. Sometimes the answer is yes. More often the backlog is not a capacity problem at all — it is a problem of when the work arrives and who is allowed to finish it.",
      },
      { h2: "Three questions before headcount" },
      {
        ul: [
          "What share of items need a decision from outside the team?",
          "How many times does a single item change hands before it is done?",
          "Does the queue arrive evenly, or in a wave after a batch job?",
        ],
      },
      {
        p: "On one document-processing queue, the average item was touched by three people and waited longer between hands than it spent being worked. Cutting that to one owner per item did more for throughput than the extra staff the client had budgeted.",
      },
      { h2: "When headcount is the honest answer" },
      {
        p: "Sometimes the arrival rate genuinely exceeds what the team can absorb, and no amount of rearranging fixes it. We say so. But we say it after the queue has been measured, not before, because a team hired against a broken process inherits the process.",
      },
      {
        quote: "A backlog is a symptom. Staffing it without reading it is how you make it permanent.",
      },
    ],
  },
  {
    slug: "how-we-size-an-sla-before-we-sign-it",
    title: "How we size an SLA before we sign it",
    categorySlug: "operations",
    excerpt:
      "Every commitment we make in a contract has to survive a bad Monday. This is the exercise we run to find out whether it will.",
    coverAlt: "Rejilla de medición en gris y celeste sobre fondo claro",
    daysAgo: 27,
    ink: "#141c22",
    glow: "#9fd3e0",
    body: [
      {
        p: "An SLA is a promise about the worst day, not the average one. Averages are comfortable and almost useless: a team can hit 95% for a month and still fail the client twice, on the two days that mattered.",
      },
      { h2: "The bad Monday test" },
      {
        p: "We take the client's own volume history, find the worst day in the last twelve months, and staff the proposed SLA against that day rather than the mean. If the commitment only holds on ordinary weeks, it is not a commitment — it is an average with a penalty clause attached.",
      },
      { h2: "What goes in the contract" },
      {
        ul: [
          "The measurement window, stated in the client's timezone and ours.",
          "What counts as an exception, agreed in advance and in writing.",
          "The review cadence, and who owns the number on each side.",
          "What happens the first month the number is missed, before anyone is angry.",
        ],
      },
      {
        p: "That last line matters more than the penalty. Most SLA disputes are not about the miss; they are about nobody having agreed what a miss means while everyone was still friendly.",
      },
    ],
  },
  {
    slug: "the-dashboard-nobody-opened",
    title: "The dashboard nobody opened",
    categorySlug: "systems-development",
    excerpt:
      "We built a supervisor dashboard with eleven charts. Usage data said the team looked at two of them, so we rebuilt it around those.",
    coverAlt: "Formas de gráficos superpuestas en celeste sobre fondo oscuro",
    daysAgo: 34,
    ink: "#0a1116",
    glow: "#74c3d5",
    body: [
      {
        p: "The brief asked for visibility, so we delivered visibility: eleven charts, filters on everything, a date range that went back two years. Six weeks later we added usage tracking, mostly out of curiosity.",
      },
      { h2: "What supervisors actually opened" },
      {
        p: "Two panels accounted for nearly all of the time on the page: who is available right now, and which items are about to breach. Everything else was opened once, during training, and never again.",
      },
      {
        quote: "Nobody wants a dashboard. They want the two decisions the dashboard was hiding.",
      },
      { h2: "The second version" },
      {
        ul: [
          "One screen, no filters, readable from across the floor.",
          "The breach list first, sorted by how little time is left.",
          "Everything else moved behind a link, still there for the monthly review.",
        ],
      },
      {
        p: "The rebuild took less time than the original and shipped with a tenth of the surface area. The monthly report still needs the other nine charts — it just does not need them on the wall at nine in the morning.",
      },
    ],
  },
  {
    slug: "automating-the-parts-of-onboarding-that-never-varied",
    title: "Automating the parts of onboarding that never varied",
    categorySlug: "systems-development",
    excerpt:
      "Not every step deserves a robot. We mapped a client onboarding flow and automated only the steps that had never once needed judgment.",
    coverAlt: "Diagrama de pasos conectados en verde y petróleo",
    daysAgo: 46,
    ink: "#101a10",
    glow: "#6aaa00",
    body: [
      {
        p: "Automation projects fail in a predictable way: someone automates the interesting step, the one with the exceptions, and spends the next year maintaining the exceptions. So we started from the other end.",
      },
      { h2: "Mapping first" },
      {
        p: "We sat with the onboarding team for four days and wrote down every step, then marked each one with how often it had required a human decision in the previous quarter. Eleven of nineteen steps had never required one.",
      },
      { h2: "What we automated" },
      {
        ul: [
          "Document collection and format validation.",
          "Duplicate checks against the existing customer base.",
          "The welcome sequence, including the follow-up nobody had time to send.",
          "Handoff to the account team, with the file already complete.",
        ],
      },
      {
        p: "The eight remaining steps stayed manual on purpose. They are where the judgment lives, and they are now the only thing the team spends its morning on. Average time to activate fell by a bit under half; the more visible change is that nothing sits waiting overnight for someone to press a button.",
      },
    ],
  },
  {
    slug: "our-best-agent-had-the-worst-handle-time",
    title: "Our best agent had the worst handle time",
    categorySlug: "call-center",
    excerpt:
      "Ranking a floor by average handle time rewards the agents who end calls, not the ones who end problems.",
    coverAlt: "Barras desiguales en celeste sobre fondo petróleo",
    daysAgo: 54,
    ink: "#0d1620",
    glow: "#74c3d5",
    body: [
      {
        p: "She was last on the handle-time board four months running. She was also first on resolution, first on satisfaction, and the person other agents transferred to when a call had gone wrong. On paper the operation was paying her to be slow.",
      },
      { h2: "What the metric was measuring" },
      {
        p: "Average handle time counts the minutes on the call. It does not count the callback three days later, the escalation, or the second agent who has to start over. Once we added repeat contacts to the same view, her numbers inverted: the calls she took did not come back.",
      },
      {
        ul: [
          "Her calls were 22% longer than the floor average.",
          "They generated 61% fewer repeat contacts within seven days.",
          "Net minutes per resolved issue were the lowest on the team.",
        ],
      },
      {
        quote: "A short call that solves nothing is not efficiency. It is the cost, moved to next week.",
      },
      { h2: "What we changed" },
      {
        p: "Handle time is still on the dashboard, because a call that runs long for no reason is real. It just no longer sits alone. Any target on it now travels with a repeat-contact rate, and no agent is coached on one without the other.",
      },
    ],
  },
  {
    slug: "the-exception-queue-nobody-owned",
    title: "The exception queue nobody owned",
    categorySlug: "operations",
    excerpt:
      "Every process has a pile of items that did not fit the rules. Whoever owns that pile decides how good the process actually is.",
    coverAlt: "Bloques desalineados en gris y petróleo",
    daysAgo: 61,
    ink: "#141c22",
    glow: "#3f738d",
    body: [
      {
        p: "The main queue was healthy: items in, items out, service level held. Next to it sat a folder called Pending Review that had been growing for eleven months, because it belonged to everyone and therefore to no one.",
      },
      { h2: "Exceptions are a measurement, not a nuisance" },
      {
        p: "We read the pile before we worked it. Four rule gaps accounted for most of it, and each one was a decision nobody had made when the process was designed. The queue was not a backlog of work; it was a backlog of unmade decisions.",
      },
      { h2: "How we run it now" },
      {
        ul: [
          "One named owner, with the authority to decide, not just to sort.",
          "A weekly read of what landed there and why.",
          "Any pattern that appears three times becomes a rule in the main flow.",
          "The exception rate goes on the same report as the service level.",
        ],
      },
      {
        p: "The pile still exists and always will. It is now under three hundred items instead of several thousand, and its size tells us something useful about the process each week.",
      },
    ],
  },
  {
    slug: "we-shipped-the-same-integration-twice",
    title: "We shipped the same integration twice",
    categorySlug: "systems-development",
    excerpt:
      "Two teams built the same connector six weeks apart. What that cost us, and the cheap habit that stopped it happening again.",
    coverAlt: "Dos trazados paralelos en verde sobre fondo oscuro",
    daysAgo: 69,
    ink: "#101a10",
    glow: "#6aaa00",
    body: [
      {
        p: "The second one was better written. That was the only consolation available when we realised two teams had spent six weeks each connecting the same client system, neither aware of the other.",
      },
      { h2: "How it happened" },
      {
        p: "Nobody hid anything. The work was requested by two departments, scoped in two conversations, and named two different things. Searching for either name found nothing, because the other team had used the other name.",
      },
      { h2: "The habit that fixed it" },
      {
        p: "No process, no committee. Before any integration work is scoped, someone writes one line in a shared index: the external system, the direction of the data, and who is asking. It takes a minute and it is searchable by the name of the system rather than the name of the project.",
      },
      {
        p: "It has caught two overlaps since, both in the first week, when the answer is still a conversation instead of six weeks of work.",
      },
    ],
  },
];

/* Portadas generadas, no fotos de archivo: el objetivo es ver la rejilla con
   piezas distinguibles entre sí, y una foto ajena en la base confunde después. */
function coverSvg({ ink, glow }: Seed, index: number): string {
  const tilt = -18 + index * 7;
  const cx = 20 + ((index * 23) % 60);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${ink}"/>
      <stop offset="1" stop-color="${glow}" stop-opacity="0.55"/>
    </linearGradient>
    <radialGradient id="halo" cx="${cx}%" cy="22%" r="62%">
      <stop offset="0" stop-color="${glow}" stop-opacity="0.85"/>
      <stop offset="1" stop-color="${glow}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1600" height="1000" fill="url(#bg)"/>
  <rect width="1600" height="1000" fill="url(#halo)"/>
  <g transform="rotate(${tilt} 800 500)" fill="none" stroke="#ffffff" stroke-opacity="0.16">
    ${Array.from({ length: 9 }, (_, i) => `<line x1="-400" y1="${120 * i}" x2="2000" y2="${120 * i}" stroke-width="1"/>`).join("")}
  </g>
  <g fill="none" stroke="${glow}" stroke-opacity="0.5" stroke-width="2">
    <circle cx="${cx * 16}" cy="${260 + index * 40}" r="${180 + index * 26}"/>
    <circle cx="${cx * 16}" cy="${260 + index * 40}" r="${300 + index * 26}"/>
  </g>
  <rect x="0" y="0" width="1600" height="1000" fill="${ink}" opacity="0.18"/>
</svg>`;
}

function blocks(body: Para[]) {
  return body.map((item, i) => {
    const id = `seed-${i}-${Math.abs(JSON.stringify(item).length * 7919 + i)}`;
    const base = { textColor: "default", backgroundColor: "default", textAlignment: "left" };

    if ("h2" in item) {
      return {
        id,
        type: "heading",
        props: { ...base, level: 2, isToggleable: false },
        content: [{ type: "text", text: item.h2, styles: {} }],
        children: [],
      };
    }
    if ("quote" in item) {
      return {
        id,
        type: "quote",
        props: base,
        content: [{ type: "text", text: item.quote, styles: { italic: true } }],
        children: [],
      };
    }
    if ("ul" in item) {
      return {
        id,
        type: "bulletListItem",
        props: base,
        content: [{ type: "text", text: item.ul[0], styles: {} }],
        children: item.ul.slice(1).map((text, j) => ({
          id: `${id}-${j}`,
          type: "bulletListItem",
          props: base,
          content: [{ type: "text", text, styles: {} }],
          children: [],
        })),
      };
    }
    return {
      id,
      type: "paragraph",
      props: base,
      content: [{ type: "text", text: item.p, styles: {} }],
      children: [],
    };
  });
}

/* Las listas anidan mal si se anuncian como hijas: BlockNote las quiere planas. */
function flatten(list: ReturnType<typeof blocks>) {
  return list.flatMap((block) =>
    block.type === "bulletListItem" && block.children.length > 0
      ? [{ ...block, children: [] }, ...block.children]
      : [block],
  );
}

const WORDS_PER_MINUTE = 200;

function minutesOf(body: Para[]): number {
  const text = body
    .map((item) => ("h2" in item ? item.h2 : "p" in item ? item.p : "quote" in item ? item.quote : item.ul.join(" ")))
    .join(" ");
  return Math.max(1, Math.ceil(text.split(/\s+/).filter(Boolean).length / WORDS_PER_MINUTE));
}

async function main() {
  const editor = ServerBlockNoteEditor.create();
  const reset = process.argv.includes("--reset");
  const slugs = SEEDS.map((seed) => seed.slug);

  if (reset) {
    const old = await db
      .select({ url: post.coverUrl })
      .from(post)
      .where(inArray(post.slug, slugs));
    for (const row of old) {
      if (row.url) await del(row.url).catch(() => {});
    }
    await db.delete(post).where(inArray(post.slug, slugs));
    console.log(`Borrados ${old.length} artículos sembrados.`);
  }

  const categories = await db.select({ id: category.id, slug: category.slug }).from(category);
  const byCategory = new Map(categories.map((row) => [row.slug, row.id]));

  const [author] = await db.select({ id: user.id }).from(user).limit(1);
  if (!author) throw new Error("No hay usuario: corre primero npm run seed:admin.");

  for (const seed of SEEDS) {
    const existing = await db
      .select({ id: post.id })
      .from(post)
      .where(eq(post.slug, seed.slug))
      .limit(1);
    if (existing.length > 0) {
      console.log(`· ${seed.slug} ya existe, lo salto.`);
      continue;
    }

    const categoryId = byCategory.get(seed.categorySlug);
    if (!categoryId) throw new Error(`Falta la categoría ${seed.categorySlug}.`);

    const png = await sharp(Buffer.from(coverSvg(seed, SEEDS.indexOf(seed)))).png().toBuffer();
    const blob = await put(`blog/seed-${seed.slug}.png`, png, {
      access: "public",
      contentType: "image/png",
    });

    const content = flatten(blocks(seed.body));
    const publishedAt = new Date(Date.now() - seed.daysAgo * 86_400_000);

    await db.insert(post).values({
      slug: seed.slug,
      title: seed.title,
      excerpt: seed.excerpt,
      categoryId,
      coverUrl: blob.url,
      coverAlt: seed.coverAlt,
      coverPathname: blob.pathname,
      content,
      contentHtml: await editor.blocksToHTMLLossy(content as never),
      status: "published",
      readingMinutes: minutesOf(seed.body),
      authorId: author.id,
      publishedAt,
    });

    console.log(`✓ ${seed.title}`);
  }

  console.log("\nListo. Para deshacerlo: npm run seed:posts -- --reset");
  process.exit(0);
}

main().catch((error) => {
  console.error("Falló el seed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
