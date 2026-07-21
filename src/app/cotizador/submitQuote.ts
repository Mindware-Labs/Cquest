import type { QuoteSubmission } from "./data";

/* ── SEAM · Phase 4 — the one place the quote form "sends" ──
   Every mount of the wizard (the /cotizador page AND the embedded #contact
   sections on each service page) funnels its submission through here, so wiring
   the real integration is a one-file change.

   Today it is UI-only: it sends nothing and stores nothing. To go live, replace
   the body with a call to the email Server Function
   (e.g. `await sendQuoteEmail(submission)`), let it throw on failure — callers
   already catch and let the prospect retry — and drop the placeholder delay.
   Per the agreed scope there is no database or CRM. */
export async function submitQuote(submission: QuoteSubmission): Promise<void> {
  void submission;
  // Placeholder latency so the button's "Sending…" state is visible; remove
  // once a real request replaces it.
  await new Promise((resolve) => setTimeout(resolve, 650));
}
