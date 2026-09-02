import styles from "./Skeleton.module.css";

type BoneProps = {
  w?: string | number;
  h?: string | number;
  round?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

/* Anchos fijos y no aleatorios: el esqueleto se prerrenderiza y debe ser
   idéntico en servidor y cliente. */
const CELL_WIDTHS = ["64%", "42%", "78%", "36%", "56%", "70%", "48%", "62%"];
const LINE_WIDTHS = ["96%", "88%", "92%", "70%", "94%", "82%", "60%"];

const range = (n: number) => Array.from({ length: n }, (_, i) => i);
const cellWidth = (row: number, col: number) => CELL_WIDTHS[(row * 3 + col) % CELL_WIDTHS.length];

export function Bone({ w, h, round, className, style }: BoneProps) {
  const classes = [styles.bone, round && styles.round, className].filter(Boolean).join(" ");
  return <span className={classes} style={{ width: w, height: h, ...style }} />;
}

function Root({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={styles.root} role="status" aria-label={label} aria-busy="true">
      <div aria-hidden="true">{children}</div>
    </div>
  );
}

export function TableBones({
  columns,
  rows,
  select = false,
  thumb = false,
}: {
  columns: number;
  rows: number;
  select?: boolean;
  thumb?: boolean;
}) {
  const cols = range(columns);
  return (
    <div className={styles.scroller}>
      <table className={styles.table}>
        <thead>
          <tr>
            {select && (
              <th className={styles.th}>
                <Bone className={styles.check} />
              </th>
            )}
            {cols.map((col) => (
              <th key={col} className={styles.th}>
                <Bone h="0.6rem" w={col === 0 ? "5rem" : "3.5rem"} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {range(rows).map((row) => (
            <tr key={row} className={styles.tr}>
              {select && (
                <td className={styles.td}>
                  <span className={styles.cell}>
                    <Bone className={styles.check} />
                  </span>
                </td>
              )}
              {cols.map((col) => (
                <td key={col} className={styles.td}>
                  <span className={styles.cell}>
                    {thumb && col === 0 && <Bone className={styles.thumb} />}
                    <Bone h="0.85rem" w={cellWidth(row, col)} />
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Pagination() {
  return (
    <div className={styles.pagination}>
      <Bone className={styles.perPage} />
      <div className={styles.pages}>
        {range(4).map((i) => (
          <Bone key={i} className={styles.pageButton} />
        ))}
      </div>
    </div>
  );
}

type ListProps = {
  title?: "wide" | "compact";
  titleWidth?: string;
  action?: boolean;
  back?: boolean;
  filters?: number;
  tabs?: number;
  columns: number;
  rows?: number;
  select?: boolean;
  thumb?: boolean;
  pagination?: boolean;
};

export function ListSkeleton({
  title = "wide",
  titleWidth = "10rem",
  action = true,
  back = false,
  filters = 0,
  tabs = 0,
  columns,
  rows = 8,
  select = true,
  thumb = false,
  pagination = true,
}: ListProps) {
  const wide = title === "wide";
  return (
    <Root label="Loading">
      {back && <Bone className={styles.back} />}
      <div className={styles.head} data-size={title}>
        <div className={styles.titleGroup}>
          <Bone w={titleWidth} h={wide ? "2.4rem" : "1.6rem"} />
          <Bone w="1.1rem" h="1.1rem" round />
        </div>
        {action && <Bone w="9rem" h={wide ? "2.75rem" : "2.5rem"} />}
      </div>

      <div className={styles.container} data-gap={title}>
        <div className={styles.toolbar}>
          <Bone className={styles.search} />
          {filters > 0 && (
            <div className={styles.filters}>
              {range(filters).map((i) => (
                <Bone key={i} className={styles.filter} />
              ))}
            </div>
          )}
        </div>
        {tabs > 0 && (
          <div className={styles.tabs}>
            {range(tabs).map((i) => (
              <Bone key={i} className={styles.tab} w={i === 0 ? "3.6rem" : undefined} />
            ))}
          </div>
        )}
        <TableBones columns={columns} rows={rows} select={select} thumb={thumb} />
      </div>

      {pagination && <Pagination />}
    </Root>
  );
}

function BarsPanel({ rows }: { rows: number }) {
  return (
    <div className={styles.panel}>
      <Bone w="11rem" h="0.75rem" />
      <div className={styles.bars}>
        {range(rows).map((i) => (
          <div key={i} className={styles.barRow}>
            <Bone h="0.7rem" />
            <Bone h="0.55rem" w={CELL_WIDTHS[i % CELL_WIDTHS.length]} />
            <Bone h="0.7rem" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ListPanel({ rows }: { rows: number }) {
  return (
    <div className={styles.panel}>
      <Bone w="9rem" h="0.75rem" />
      <Bone w="60%" h="0.7rem" />
      <div>
        {range(rows).map((i) => (
          <div key={i} className={styles.listRow}>
            <Bone w={CELL_WIDTHS[i % CELL_WIDTHS.length]} h="0.85rem" />
            <Bone w="2rem" h="1.2rem" />
          </div>
        ))}
      </div>
    </div>
  );
}

function Stats({ count }: { count: number }) {
  return (
    <div className={styles.stats}>
      {range(count).map((i) => (
        <div key={i} className={styles.stat}>
          <Bone w="3rem" h="1.6rem" />
          <Bone w="7rem" h="0.7rem" />
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <Root label="Loading dashboard">
      <div className={styles.stack}>
        <Bone w="11rem" h="2.4rem" />
        <Stats count={5} />
        <div className={styles.columns}>
          <BarsPanel rows={8} />
          <BarsPanel rows={5} />
        </div>
        <div className={styles.panel}>
          <Bone w="13rem" h="0.75rem" />
          <TableBones columns={5} rows={5} />
        </div>
        <div className={styles.columns}>
          <ListPanel rows={4} />
          <ListPanel rows={4} />
        </div>
      </div>
    </Root>
  );
}

function EditorBar({ ghosts, backWidth = "6rem" }: { ghosts: number; backWidth?: string }) {
  return (
    <div className={styles.bar}>
      <div className={styles.barGroup}>
        <Bone w={backWidth} h="1rem" />
        <Bone w="4.5rem" h="1.4rem" />
      </div>
      <div className={styles.barGroup}>
        {range(ghosts).map((i) => (
          <Bone key={i} w="6.5rem" h="2.5rem" />
        ))}
        <Bone w="7rem" h="2.5rem" />
      </div>
    </div>
  );
}

function SidePanel({ fields }: { fields: number }) {
  return (
    <div className={styles.panel}>
      <Bone w="5rem" h="0.65rem" />
      {range(fields).map((i) => (
        <Bone key={i} h="2.5rem" w={i === fields - 1 && fields > 1 ? "80%" : undefined} />
      ))}
    </div>
  );
}

export function EditorSkeleton({ ghosts = 2, main = "prose" }: { ghosts?: number; main?: "prose" | "form" }) {
  return (
    <Root label="Loading editor">
      <EditorBar ghosts={ghosts} />
      <div className={styles.editorColumns}>
        <div className={styles.main}>
          <Bone w="70%" h="2.4rem" style={{ marginBottom: "0.5rem" }} />
          {main === "prose" ? (
            <div className={styles.lines}>
              {range(10).map((i) => (
                <Bone key={i} h="0.85rem" w={LINE_WIDTHS[i % LINE_WIDTHS.length]} />
              ))}
            </div>
          ) : (
            range(4).map((i) => (
              <div key={i} className={styles.field}>
                <Bone w="6rem" h="0.65rem" />
                <Bone h={i === 0 ? "6rem" : "2.75rem"} />
              </div>
            ))
          )}
        </div>
        <div className={styles.side}>
          <SidePanel fields={2} />
          <SidePanel fields={1} />
          <SidePanel fields={2} />
        </div>
      </div>
    </Root>
  );
}

export function DetailSkeleton() {
  return (
    <Root label="Loading application">
      <EditorBar ghosts={1} backWidth="8rem" />
      <div className={styles.editorColumns}>
        <div className={styles.main}>
          <div className={styles.cardMain}>
            <Bone w="3.25rem" h="3.25rem" />
            <div className={styles.lines}>
              <Bone w="5rem" h="0.65rem" />
              <Bone w="14rem" h="1.7rem" />
              <div className={styles.row}>
                {range(3).map((i) => (
                  <Bone key={i} w="8rem" h="1.8rem" />
                ))}
              </div>
            </div>
          </div>
          <div className={styles.panel}>
            <Bone w="6rem" h="0.65rem" />
            <Bone w="55%" h="1rem" />
            <Bone w="35%" h="0.75rem" />
          </div>
          <Stats count={4} />
          <div className={styles.panel}>
            <Bone w="5rem" h="0.65rem" />
            <div className={styles.lines}>
              {range(4).map((i) => (
                <Bone key={i} h="0.85rem" w={LINE_WIDTHS[i % LINE_WIDTHS.length]} />
              ))}
            </div>
          </div>
          <div className={styles.panel}>
            <div className={styles.row} style={{ justifyContent: "space-between" }}>
              <Bone w="12rem" h="0.9rem" />
              <Bone w="10rem" h="2.25rem" />
            </div>
            <Bone h="22rem" />
          </div>
        </div>
        <div className={styles.side}>
          <SidePanel fields={1} />
          <div className={styles.panel}>
            <Bone w="5rem" h="0.65rem" />
            <div className={styles.lines}>
              {range(3).map((i) => (
                <Bone key={i} h="0.8rem" w={LINE_WIDTHS[(i + 2) % LINE_WIDTHS.length]} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Root>
  );
}

export function ReportSkeleton() {
  return (
    <Root label="Loading report">
      <div className={styles.stack}>
        <Bone w="8rem" h="1rem" />
        <div className={styles.head}>
          <div className={styles.lines}>
            <Bone w="5rem" h="0.65rem" />
            <Bone w="18rem" h="1.9rem" />
            <Bone w="12rem" h="0.8rem" />
          </div>
          <Bone w="8rem" h="2.5rem" />
        </div>
        <Stats count={4} />
        <div className={styles.columns}>
          <BarsPanel rows={6} />
          <BarsPanel rows={4} />
        </div>
        <div className={styles.panel}>
          <Bone w="10rem" h="0.75rem" />
          <TableBones columns={5} rows={6} />
        </div>
      </div>
    </Root>
  );
}

export function ReviewSkeleton() {
  return (
    <Root label="Loading talent pool">
      <div className={styles.stack} data-gap="tight">
        <Bone w="8rem" h="1rem" />
        <div className={styles.lines}>
          <Bone w="6rem" h="0.65rem" />
          <Bone w="20rem" h="1.9rem" />
          <Bone w="60%" h="0.8rem" />
        </div>
        <div className={styles.cards}>
          {range(4).map((i) => (
            <div key={i} className={styles.card}>
              <div className={styles.cardMain}>
                <Bone w="2.6rem" h="2.6rem" />
                <div className={styles.lines}>
                  <Bone w="55%" h="1rem" />
                  <Bone w="40%" h="0.75rem" />
                </div>
              </div>
              <div className={styles.row}>
                {range(3).map((j) => (
                  <Bone key={j} w="5rem" h="1.4rem" />
                ))}
              </div>
              <div className={styles.lines}>
                <Bone h="0.8rem" w="90%" />
                <Bone h="0.8rem" w="70%" />
              </div>
              <div className={styles.row}>
                <Bone w="6rem" h="2.25rem" />
                <Bone w="5rem" h="2.25rem" />
                <Bone w="5rem" h="2.25rem" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Root>
  );
}
