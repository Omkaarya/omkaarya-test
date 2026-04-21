# OmKaarya — Deployment Guidelines
# Updated after every release. Read before deploying anything.

---

## Environments

| Environment | Frontend | Backend | When |
|---|---|---|---|
| Development | `localhost:3000` | `localhost:3001` | Local dev |
| Preview | Vercel auto-deploy | — | Every PR to `main` |
| Production | `omkaarya-test.vercel.app` | — | Manual trigger after QA sign-off |

---

## Frontend Deployment (Vercel)

Vercel auto-deploys on push to `main`. Production deployments require:
1. QA sign-off confirmed
2. No Hindu festival blackout date conflict
3. Founder approval
4. Smoke test on Preview URL before promoting to Production

```bash
# Manual production deploy (Vercel CLI)
cd omkaarya-test
vercel --prod
```

---

## Backend Deployment

[To be updated when backend hosting is confirmed]

---

## Pre-Deployment Checklist

- [ ] QA signed off — all acceptance criteria pass
- [ ] No critical or high bugs open
- [ ] Release notes written
- [ ] Rollback plan documented
- [ ] Not a Hindu festival blackout date
- [ ] Founder confirmed go-ahead
- [ ] Environment variables verified in target environment

---

## Post-Deployment Checklist

- [ ] Smoke test on production — login, core flow
- [ ] Monitor error rates for 48 hours
- [ ] Release notes published
- [ ] Task files moved to `tasks/completed/`

---

## Blackout Dates (No Production Deployments)

3 days before, during, and 3 days after:
- Thai Pongal (January)
- Maha Shivaratri (Feb/March)
- Tamil/Sinhala New Year (April 13–14) ← **Critical**
- Thaipusam (January/February)
- Navaratri (September/October)
- Diwali (October/November) ← **Critical**
- Karthigai Deepam (November/December)

---

## Rollback Procedure

### Frontend (Vercel)
1. Go to Vercel dashboard → Deployments
2. Find the last stable deployment
3. Click "..." → "Promote to Production"
4. Verify rollback on production URL
5. Log incident in `.docs/sprints/`

---

*Last updated: [Date] — [Who updated it] — [What changed]*
