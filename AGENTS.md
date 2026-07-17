<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Company Content (Center Quest)

Source copy for the website. Use this as the source of truth for text content when building pages — do not invent or rephrase unless asked. This reflects the **Requirements Document v1.1 (July 2026)** — the site is being rebuilt as Center Quest's primary commercial tool.

> Brand palette, typography and visual identity live in `DISENIO.md`. Design tokens are already wired in `src/app/globals.css`.

### Positioning

Center Quest is a Dominican operations partner built around **three business lines**: **Call Center**, **BPO** (Business Process Outsourcing), and **Systems Development** for operations. The site's job is to attract new clients across these three lines — transmitting trust and professionalism, showing real evidence of our work (case studies, client logos, team size and quality), and letting an interested visitor contact us or request a quote in under a minute.

Primary market: República Dominicana, plus US clients (bilingual ES/EN is a later phase).

### Sectors We Specialize In

- Health
- Banking and Finance
- Retail & E-Commerce
- Telecommunications
- Tourism and Hospitality

### Business Lines (Services)

The **Services** area has three subpages, one per business line.

**1. Call Center** — inbound & outbound contact-center operations, presented as individual services (each with its own icon, short description and client benefit):

- **Customer service** — inbound support across phone, email, chat and social.
- **Sales** — outbound campaigns, telesales, and lead generation & closing.
- **Collections** — portfolio recovery and collections with professional, compliant protocols.
- **Surveys** — satisfaction studies, market polls and NPS measurement.
- **Onboarding** — welcome, activation and early follow-up for the client's new customers.

**2. BPO (Business Process Outsourcing)** — the repeatable work behind an operation: back office, data processing, and omnichannel support, run accurately at volume under clear SLAs.

**3. Systems Development** — custom software for operations: CRMs, dashboards, and operations automation shaped around how the client actually works.

### Site Map (pages)

- **Home** — core value message, short video/animation, scroll-animated metrics, client logos, prominent "Request a quote" CTA.
- **Services** — three subpages: Call Center, BPO, Systems Development.
- **Case studies** — portfolio filterable by service (Call Center / BPO / Systems), measurable results, client testimonials and logos.
- **About us** — history, mission, team figures (employees, years of experience), real facility/team photos, certifications.
- **Quote / Contact** — step-by-step smart quote form plus direct contact (phone, WhatsApp, email, map).

### Key interactive features (from requirements)

- **Animated metrics** on Home (count-up on scroll): interactions handled per year, active employees/agents, active clients, years of experience, systems delivered. Values must be editable from config/admin without touching code.
- **Smart step-by-step quote form**: Step 1 service → Step 2 service-specific questions → Step 3 contact details → on-screen confirmation + auto-email to prospect + internal sales notification; data persisted to DB/CRM.
- **Case studies**: filterable gallery, per-case challenge → solution → numeric results, logo/testimonial carousel, admin-editable without developers.
- **Floating WhatsApp button** on every page; live chat / basic chatbot for off-hours leads.

### Non-functional requirements

Responsive (mobile-first, >60% traffic is mobile), load < 3s, images WebP + lazy-loaded, SEO (per-page titles/descriptions, clean URLs, sitemap, structured data, Analytics + Search Console), SSL, spam protection (reCAPTCHA), accessibility (adequate contrast, alt text), admin-editable content. SEO target queries: "call center República Dominicana", "servicios BPO", "desarrollo de sistemas para operaciones".
