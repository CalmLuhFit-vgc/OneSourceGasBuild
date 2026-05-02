# Decision Log

Append-only record of architectural and scope decisions made during the One Source Gas build. Used by the weekly Richard report and as cross-conversation memory.

**Format:** `- **YYYY-MM-DD HH:MM** — {decision + brief why}`

---

## Decisions

- **2026-05-01 18:00** — Tech stack locked: Next.js 16 + Supabase + Stripe + Vercel. Why: Supabase carries over from DermaGlo experience; Next.js is the default for B2B web; Stripe replaces QB Payments fees.
- **2026-05-01 18:00** — Service-industry customers only in the portal. Medical and lab accounts handled by Richard directly. Why: simplifies SKU catalog, compliance burden, and customer onboarding.
- **2026-05-01 18:00** — Web/PWA delivery format (Option A) recommended over native iOS-only or full native. Why: covers all customer devices, $8.5–22k cheaper, no App Store rejection risk, instant updates.
- **2026-05-01 18:00** — Both engagement structures (Fixed-Bid Project and Hybrid Contractor) presented to Richard, his choice. Brad recommends Hybrid Contractor.
