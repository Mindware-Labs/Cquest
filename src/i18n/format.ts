// Dictionary values must stay plain, JSON-serializable data — the root
// layout resolves the dictionary server-side and hands it to I18nProvider
// (a Client Component) as a prop, and React's RSC boundary can't serialize
// function values across that hop. Parameterized strings live as
// `{placeholder}` templates instead, resolved at the call site with this.
export function format(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}
