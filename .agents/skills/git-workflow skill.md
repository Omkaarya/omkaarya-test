---
name: pepulux-git-workflow
description: >
  Git branching, commit, and PR workflow for Pepulux. Activate whenever working with GitHub,
  creating branches, writing commit messages, opening pull requests, or managing releases.
  Covers: GitFlow branching strategy, conventional commits, PR standards, code review rules,
  and release tagging. Always follow this workflow — no exceptions.
---

# Pepulux — Git Workflow Skill

---

## 1. Branch Strategy — GitFlow

```
main          ← Production code only. Protected. Never commit directly.
develop       ← Integration branch. All features merge here first.
feature/*     ← Individual features: feature/donations-module
fix/*         ← Bug fixes: fix/receipt-number-duplicate
hotfix/*      ← Production emergency fixes only: hotfix/login-broken
release/*     ← Release preparation: release/v1.2.0
```

### Branch Naming
```
feature/[module]-[short-description]
  feature/donations-create-endpoint
  feature/devotees-search-filter
  feature/omakaarya-pos-receipt-print

fix/[module]-[short-description]
  fix/donations-tenant-scope-missing
  fix/devotees-empty-state-not-showing

hotfix/[description]
  hotfix/login-jwt-expiry-crash
```

---

## 2. Conventional Commits

Every commit message follows this format:
```
<type>(<scope>): <short description>

[optional body — explain WHY, not WHAT]

[optional footer — BREAKING CHANGE or issue reference]
```

**Types:**
| Type | When to Use |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no logic change |
| `refactor` | Code restructure, no feature/fix |
| `test` | Adding or fixing tests |
| `chore` | Build, CI, dependencies |
| `perf` | Performance improvement |

**Scopes (Pepulux-specific):**
`donations`, `devotees`, `events`, `pos`, `inventory`, `auth`, `tenants`, `ui`, `db`, `ci`, `api`

**Examples:**
```
feat(donations): add receipt PDF generation

fix(devotees): scope search query to current tenant

fix(auth): return 401 when JWT is expired, not 500

docs(api): add donation endpoint documentation

test(donations): add unit tests for receipt number generation

chore(ci): add staging deployment to GitHub Actions pipeline
```

**Rules:**
- Subject line: max 72 characters, lowercase, no period at end
- Body: explain why the change was made, not what (the diff shows what)
- One logical change per commit — do not bundle unrelated changes

---

## 3. Pull Request Standards

### PR Size
- Max ~400 lines changed per PR
- Large features = multiple sequential PRs, each building on the last
- If a PR is growing past 400 lines, stop and split it

### PR Title
Follows conventional commit format:
```
feat(donations): add paginated list endpoint with tenant filtering
fix(ui): match donation form layout to Figma exactly
```

### PR Description Template
```markdown
## What
[One paragraph: what was built or fixed]

## Why
[One paragraph: why this was needed]

## How to Test
1. [Step 1]
2. [Step 2]
Expected: [what should happen]

## Figma Reference
[Link to Figma screen this implements — for UI PRs]

## Checklist
- [ ] Matches Figma design (UI changes)
- [ ] tenantId scoped in all queries (OmKaarya)
- [ ] No secrets in code
- [ ] Unit tests written and passing
- [ ] Self-reviewed — read every line before opening PR
```

### PR Rules
- **No self-merge** — every PR needs at least one reviewer
- **Review within 24 hours** — PRs must not sit waiting
- **All CI checks must pass** before merge — no exceptions
- **Resolve all review comments** before merge — not dismiss, resolve
- **Delete branch after merge** — keep the repo clean

---

## 4. Code Review Standards

### As the Reviewer
- Review within 24 hours of PR assignment
- Check: logic correctness, security (tenant scope, no secrets), test coverage, Figma fidelity (UI)
- Comment specifically — "this query is missing tenantId" not "looks wrong"
- Approve only when genuinely satisfied — not as a formality

### As the Author
- Self-review before opening — read every changed line
- Respond to every comment — either fix it or explain why not
- Do not dismiss review comments — resolve them

---

## 5. Release Tagging

```
v[major].[minor].[patch]

v1.0.0  ← First production release
v1.1.0  ← New feature added
v1.1.1  ← Bug fix
v2.0.0  ← Breaking change
```

**Release process:**
```bash
# Create release branch from develop
git checkout -b release/v1.2.0 develop

# Final testing and fixes on release branch
# Update CHANGELOG.md and version numbers

# Merge to main
git checkout main
git merge release/v1.2.0
git tag -a v1.2.0 -m "Release v1.2.0 — [brief description]"
git push origin main --tags

# Back-merge to develop
git checkout develop
git merge release/v1.2.0
```

---

## 6. Commit Checklist Before Every Push

- [ ] No secrets, API keys, or passwords in any file
- [ ] `git diff` reviewed — nothing unintentional included
- [ ] Tests passing locally
- [ ] Commit message follows conventional commits format
- [ ] Branch is up to date with `develop` (rebase if behind)
