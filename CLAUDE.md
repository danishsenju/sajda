# SAJDA — Claude Code Master File

> Muslim community & mosque management SaaS platform. Malaysian market, global vision.

## Product in One Line

SAJDA connects Muslims to their masjid and deen — mosque management + jemaah community platform with Islamic tools that create daily habits.

## Core Stack

- **Frontend**: Next.js 14 (App Router), Tailwind CSS, PWA-first
- **Backend**: Supabase (Postgres + RLS + Realtime + Storage)
- **Payments**: Billplz (FPX + Malaysian e-wallets)
- **Deploy**: Vercel
- **Auth**: Supabase Auth (email + Google SSO)

## Architecture Rules

- PWA-first. No React Native until 50 paying mosques hit.
- Monorepo structure kept clean for future RN expansion.
- All DB access via Supabase RLS — never bypass.
- i18n: Malay (primary), English (secondary). Arabic for Islamic content only.
- Pricing: Surau RM49/mo | Kariah RM149/mo | Komuniti RM349/mo
- Sadaqah: 100% passes through to mosque. Platform NEVER takes % of sadaqah. Billplz fee absorbed by mosque tier. This is a core brand promise.

## Invoking Roles

Load a role file when starting a task:

- Architecture / backend logic → `@roles/senior-dev`
- UI / component work → `@roles/ui-designer`
- Database schema / migrations → `@roles/db-architect`
- Feature planning / user stories → `@roles/product-manager`
- Bug hunting / edge cases → `@roles/qa-engineer`
- Deployment / env / infra → `@roles/devops`
- Islamic content accuracy → `@roles/islamic-consultant`
- Growth / retention mechanics → `@roles/growth-hacker`
- Icon generation / AI image prompts → `@roles/prompt-engineer`

## Loading Context

Load when needed — do NOT preload all:

- DB schema → `@context/schema`
- Design tokens → `@context/design-system`
- API specs → `@context/api-contracts`
- Business rules → `@context/business-rules`
- Project status → `@STATUS` (only when asked)

## Absolute DO NOTs

- Never expose Supabase service role key client-side
- Never skip RLS policies on new tables
- Never hardcode Malaysian-specific logic without a config flag (global vision)
- Never remove PWA manifest or service worker without discussion
- Never commit .env files
