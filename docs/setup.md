# trino. — setup (cómo se arma)

> Canónico baseline. Verificado contra `package.json`, `README.md`,
> `src/config/env.ts`, `vercel.json`. Solo documentación.

## Requisitos

- Node (el que pida `pnpm-workspace.yaml` / CI) + **pnpm 11.25.0**
  (`packageManager` en `package.json`).
- Cuentas: Supabase, Upstash Redis, Resend, MercadoPago. Las claves se
  copian desde el vault de hosting — **nunca commitear `.env`/`.env.local`**
  (están en `.gitignore`).

## Instalación

```bash
pnpm install
```

## Variables de entorno

Requeridas (lista completa y validación Zod fail-closed al boot en
`src/config/env.ts`): Supabase URL / anon / service-role, Upstash Redis
REST, Resend / MercadoPago, `CRON_SECRET`. Copiar desde el vault a `.env`
y `.env.local` locales.

## Comandos

```bash
pnpm dev          # next dev
pnpm build        # next build
pnpm start        # next start
pnpm typecheck    # tsc --noEmit
pnpm lint         # eslint .
pnpm format       # prettier --write .
pnpm test         # vitest run (con TEMP=E:/temp en Windows — ver nota)
pnpm test:e2e     # playwright test
pnpm test:coverage# vitest run --coverage
pnpm lhci:assert  # lhci autorun --assert (gate de performance)
pnpm gen:types    # regenera src/types/database.types.ts desde Supabase local
```

> Quirk Windows: `pnpm test` fuerza `TEMP=E:/temp` porque vitest +
> playwright fallan con paths con espacios (`C:\Users\Pc Living`). No
> quitar sin correr la suite completa en CI. (Fuente: `README.md`,
> scripts `test*` en `package.json`.)

## Flujo de cambio (changesets)

```bash
pnpm changeset   # declarar el cambio
pnpm version     # versiona
pnpm release     # publica
```

No editar `CHANGELOG.md` a mano. Hooks Husky + lint-staged corren
eslint --fix y prettier en cada commit (`package.json`, `.husky/`).

## Deploy

Deploy en **Vercel** (`vercel.json`). Dominios `santisima-trinidad.com.ar`
(primario) + `.com` (global). Detalle paso a paso en `docs/DEPLOY.md`;
runbook de incidentes en `docs/reports/incident-runbook.md`.

## Verificación rápida post-setup

```bash
pnpm typecheck && pnpm lint && pnpm test
```

Todo verde = baseline sano. Si algo falla, ver `docs/DEPLOY.md` y
`ARCHITECTURE.md` antes de tocar código.
