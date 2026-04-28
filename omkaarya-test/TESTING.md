# TESTING.md — Omkaarya Platform Test Strategy

## Philosophy

- **Unit tests**: Cover core temple logic—Donation calculators, Seva price modifiers, and RBAC permission guards.
- **Integration tests**: Cover API routes (e.g., `/api/temple-admin/pos`) with a dedicated PostgreSQL test container.
- **E2E tests**: Cover critical user journeys (Devotee Onboarding, POS Checkout, Seva Booking).
- **Design Integrity**: All UI components must pass "Pixel-Perfect" visual checks for alignment and padding.

---

## Test Structure

```
tests/
├── unit/
│   ├── lib/
│   │   ├── seva-calculator.test.ts
│   │   ├── devotee-id-generator.test.ts
│   │   └── rbac-permission.test.ts
│   └── components/
│       ├── input-atom.test.tsx
│       └── status-badge.test.tsx
├── integration/
│   └── api/
│       ├── devotees.test.ts
│       ├── inventory.test.ts
│       ├── pos-sessions.test.ts
│       └── transactions.test.ts
└── e2e/
    └── playwright/
        ├── auth.spec.ts
        ├── pos-checkout.spec.ts
        ├── inventory-transfer.spec.ts
        └── seva-booking.spec.ts
```

---

## Unit Test Examples

### Seva Price Calculator

```typescript
// tests/unit/lib/seva-calculator.test.ts
import { calculateTotalSevaPrice } from "@/lib/helpers/calculator";

describe("calculateTotalSevaPrice", () => {
  it("calculates base price plus dakshina and materials", () => {
    const result = calculateTotalSevaPrice({
      basePrice: 501,
      dakshina: 100,
      materialCost: 50,
    });
    expect(result.total).toBe(651);
  });
});
```

### RBAC Permission Guard

```typescript
// tests/unit/lib/permission.test.ts
import { hasTemplePermission } from "@/lib/helpers/permission";

const priestPermissions = ["seva.read", "seva.execute", "inventory.read"];

describe("hasTemplePermission", () => {
  it("allows priest to execute sevas", () => {
    expect(hasTemplePermission(priestPermissions, "seva", "execute")).toBe(true);
  });

  it("denies priest access to financial reports", () => {
    expect(hasTemplePermission(priestPermissions, "finance.reports", "read")).toBe(false);
  });
});
```

---

## Integration Test Examples

### Devotee Management API

```typescript
// tests/integration/api/devotees.test.ts
import { GET, POST } from "@/app/api/temple-admin/devotees/route";
import { prisma } from "@/lib/db";

describe("POST /api/temple-admin/devotees", () => {
  it("creates a new devotee with a unique temple-specific ID", async () => {
    // ... logic to verify tenant isolation and ID generation
  });
});
```

---

## Running Tests

```bash
# Run unit & integration tests
npm test

# Run E2E tests (Playwright)
npx playwright test

# Check UI coverage & Visual Regression
npm run test:visual
```
