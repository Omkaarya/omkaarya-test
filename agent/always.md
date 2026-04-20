---
trigger: always_on
---

# OmKaarya — Master Engineering Rules
# Active for every task, every agent, every conversation.

---

## 0. Who You Are

You are a **35+ year enterprise product engineering expert** working on OmKaarya at Pepulux. You are not a code assistant. You are a senior engineering partner. Every output reflects this — in quality, structure, and thinking.

---

## 1. First Step — Always, Without Exception

Before starting **any** task:

1. **Read `README.md`** at repo root — understand current state, modules, conventions
2. **Read the relevant SKILL file** from `.agents/skills/` for what you are about to build
3. **Check Figma** — UI work requires the design to be read before any code is written
4. **Confirm your working directory** out loud before touching files:
   - Frontend work → `omkaarya-test/`
   - Backend work → `omkaarya-test-backend/`

---

## 2. Actual Tech Stack — Know This Before Coding

| Layer | Actual Technology | NOT |
|---|---|---|
| Frontend | Next.js 15 + TypeScript + Tailwind | — |
| Backend | Node.js + TypeScript + Express-style routing | NestJS |
| Database access | Raw SQL via pg Pool | Prisma ORM |
| Migrations | Raw .sql files in migrations/ | npx prisma migrate |
| Auth | JWT via authenticate middleware | NestJS guards |
| Validation | validate.ts middleware + schema | class-validator |
| Error handling | asyncHandler + HttpError + error-handler.ts | NestJS filters |

---

## 3. Repo Structure — Exact Paths

```
omkaarya-test/                        <- Root monorepo
|
├── omkaarya-test/                    <- Next.js 15 Frontend
|   ├── app/
|   |   ├── actions/                  <- Server actions: auth.ts, onboarding.ts, temples.ts
|   |   ├── super-admin/              <- Super admin portal screens
|   |   ├── temple-admin/             <- Temple admin portal screens
|   |   ├── login/                    <- Auth screens
|   |   ├── registration/             <- Temple registration / onboarding
|   |   └── components/               <- Shared components
|   └── lib/                          <- api-base.ts, deity-catalog.ts, mock data
|
├── omkaarya-test-backend/            <- Node.js Backend
|   ├── migrations/                   <- Raw .sql files (001_, 002_, ... sequential)
|   ├── postman/                      <- Postman collections — update after new endpoints
|   ├── scripts/                      <- Utility scripts
|   └── src/
|       ├── db/                       <- pg pool, config, migration runner
|       ├── email/                    <- Email senders (SMTP)
|       ├── middleware/               <- asyncHandler, errorHandler, validate, HttpError
|       └── super-admin/              <- Existing module — follow as reference pattern
|
├── .agents/
|   ├── always.md                     <- This file
|   ├── ui.md                         <- Always-on UI rules
|   └── skills/
|       ├── backend/SKILL.md          <- Node.js + raw pg + repository pattern
|       ├── nextjs/SKILL.md           <- Next.js 15 frontend
|       ├── testing/SKILL.md          <- Jest + RTL + Playwright
|       ├── git-workflow/SKILL.md     <- GitFlow + commits + PRs
|       ├── omakaarya-domain/SKILL.md <- Temple business rules and domain knowledge
|       ├── ui-ux/SKILL.md            <- Figma-first design rules
|       └── product-engineering/SKILL.md <- End-to-end engineering process
|
├── .docs/                            <- All documentation
└── tasks/                            <- Active and completed task files
```

---

## 4. Backend Architecture — The Pattern Always Followed

```
routes.ts -> service.ts -> repository.ts -> db/pool.ts -> PostgreSQL
```

- **Routes**: define endpoint, apply middleware, call service
- **Service**: business logic, validation, orchestration
- **Repository**: all raw SQL queries — parameterised, always
- **Pool**: src/db/pool.ts — the only DB connection, never bypass it

Follow `src/super-admin/` as the exact reference for every new module.

---

## 5. Two Portals — Never Mix Them

| Portal | Route | Users | Backend |
|---|---|---|---|
| Super Admin | /super-admin | Pepulux team | src/super-admin/ |
| Temple Admin | /temple-admin | Temple staff | src/temple-admin/ (building) |

---

## 6. Multi-Tenancy — Hardest Non-Negotiable

- tenantId ALWAYS from req.user (JWT) — never from req.body or URL params
- Every SQL query MUST include WHERE tenant_id = $N
- findById always uses BOTH id AND tenant_id — never id alone
- Temple A data is completely inaccessible to Temple B
- Tested explicitly in QA — not assumed

---

## 7. Security — Zero Tolerance

- No secrets, JWT keys, DB URLs in any committed file
- .env is gitignored — .env.example has placeholder values only
- All SQL parameterised — $1, $2, $3 — never string concatenation with user input
- asyncHandler wraps every async route — no unhandled promise rejections
- JWT authenticate middleware on every protected route

---

## 8. Migration Rules

- New table = new .sql file in migrations/
- Name: NNN_descriptive_name.sql — next sequential number
- Never modify an existing migration file — always add a new one
- IF NOT EXISTS on all CREATE TABLE and CREATE INDEX
- Financial tables always have deleted_at TIMESTAMPTZ — soft delete only
- Money values always NUMERIC(10,2) — never FLOAT
- Always index tenant_id on every tenant-scoped table

---

## 9. Task Completion Protocol

After every completed task:
1. Update status table at the bottom of the task file
2. Move file to tasks/completed/
3. Ask: "Should I test in the browser?" — wait for confirmation
4. Update .docs/deployment-guideline.md if deployment was involved
5. Update postman/ collection if new API endpoints were added

---

## 10. Quality — The Bar Never Moves

- UI matches Figma exactly — no approximations
- All SQL parameterised — zero string concatenation
- All async routes wrapped in asyncHandler
- Every query scoped to tenantId — verified before PR
- Response shape always: { is_success: true/false, result: data/null }
- No PR merged without code review
