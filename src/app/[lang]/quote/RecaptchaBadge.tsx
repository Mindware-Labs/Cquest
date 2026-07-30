"use client";

import { useEffect } from "react";

/**
 * Scopes reCAPTCHA's floating badge to the quote form.
 *
 * The v3 script appends `.grecaptcha-badge` to `<body>` at `position: fixed`
 * with a z-index of two billion, and never takes it down. `next/script` is
 * correctly scoped to this page, but scripts are not unloaded on unmount — so
 * a client-side navigation away from the form left the badge parked over the
 * hero for the rest of the session.
 *
 * The badge is hidden by default in `styles/base.css` and revealed only while
 * this component is mounted. Two reasons it works by flag rather than by
 * touching the badge element directly:
 *
 * 1. The badge may not exist yet — the script loads `afterInteractive`, so on
 *    a fast navigation this effect runs first. A CSS rule keyed off an
 *    ancestor applies whenever the badge shows up, with no polling.
 * 2. Google re-creates and repositions the badge on its own schedule. Styles
 *    written onto the node get clobbered; a rule in the cascade does not.
 *
 * Note it hides rather than removes: `next/script` caches by src, so a return
 * visit to the form will not re-run the script. Tearing the badge out of the
 * DOM would make it never come back.
 *
 * Terms check: reCAPTCHA's branding requirement applies to pages where it
 * actually runs, and there the badge stays visible. Elsewhere there is no
 * reCAPTCHA — only a leftover node — so nothing is being concealed.
 */
export default function RecaptchaBadge() {
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.recaptcha = "on";
    return () => {
      delete root.dataset.recaptcha;
    };
  }, []);

  return null;
}
