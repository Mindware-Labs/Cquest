import { notFound } from "next/navigation";

// Without this, an unmatched path like /en/foo never reaches
// [lang]/not-found.tsx: this project's root layout lives at [lang]/layout.tsx
// (a top-level dynamic segment — see node_modules/next/dist/docs/.../
// not-found.md's note on why that "makes composing a consistent 404 page
// harder"), so a URL with no literal route file under [lang] fails to match
// anything at all and falls through to Next's bare built-in 404 instead of
// this app's themed one. This catch-all gives every such path something to
// match — [lang] resolves normally, then notFound() immediately hands off to
// the sibling not-found.tsx, with the full I18nProvider/Navbar/font stack
// already mounted around it.
export default function CatchAll() {
  notFound();
}
