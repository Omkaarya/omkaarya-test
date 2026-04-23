---
name: pepulux-testing
description: >
  Testing skill for Pepulux. Activate whenever writing unit tests, integration tests, E2E tests,
  or setting up testing infrastructure for OmKaarya or PepulHire. Covers: Jest for NestJS backend,
  React Testing Library for Next.js frontend, Playwright for E2E, test naming conventions, mocking
  patterns, and the 80% coverage requirement. Always read this before writing any test code.
---

# Pepulux — Testing Skill
## Stack: Jest · React Testing Library · Playwright

---

## 1. Testing Pyramid

```
         /\
        /E2E\          ← Playwright — critical user flows only (5–10 tests)
       /------\
      /  Integ  \      ← Jest — API endpoints, service + DB interactions
     /------------\
    /   Unit Tests  \  ← Jest / RTL — all business logic, components (80%+ coverage)
   /________________\
```

**Rule:** Most tests are unit tests. Integration tests cover API contracts. E2E covers only the most critical user paths — never try to E2E everything.

---

## 2. Backend Testing — NestJS + Jest

### 2.1 Unit Test — Service
```ts
// donations.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { DonationsService } from './donations.service';
import { PrismaService } from '../../prisma/prisma.service';

// Mock PrismaService — never use real DB in unit tests
const mockPrismaService = {
  donation: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  devotee: {
    update: jest.fn(),
  },
  $transaction: jest.fn((fn) => fn(mockPrismaService)), // Execute callback immediately
};

describe('DonationsService', () => {
  let service: DonationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DonationsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<DonationsService>(DonationsService);
    jest.clearAllMocks(); // Reset between tests
  });

  describe('findAll', () => {
    it('should always scope query to tenantId', async () => {
      const tenantId = 'tenant-123';
      mockPrismaService.donation.findMany.mockResolvedValue([]);
      mockPrismaService.donation.count.mockResolvedValue(0);

      await service.findAll(tenantId, { page: 1, limit: 10 });

      expect(mockPrismaService.donation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ tenantId }), // Critical: tenant scope verified
        })
      );
    });

    it('should exclude soft-deleted records', async () => {
      const tenantId = 'tenant-123';
      mockPrismaService.donation.findMany.mockResolvedValue([]);
      mockPrismaService.donation.count.mockResolvedValue(0);

      await service.findAll(tenantId, { page: 1, limit: 10 });

      expect(mockPrismaService.donation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ deletedAt: null }),
        })
      );
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException when donation not found in tenant', async () => {
      mockPrismaService.donation.findFirst.mockResolvedValue(null);

      await expect(service.findOne('wrong-id', 'tenant-123'))
        .rejects.toThrow(NotFoundException);
    });

    it('should not return donation from different tenant', async () => {
      mockPrismaService.donation.findFirst.mockResolvedValue(null);

      await service.findOne('donation-id', 'tenant-456').catch(() => {});

      expect(mockPrismaService.donation.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: 'donation-id',
            tenantId: 'tenant-456', // Both conditions
          }),
        })
      );
    });
  });
});
```

### 2.2 Integration Test — Controller + Service
```ts
// donations.controller.integration.spec.ts
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

describe('DonationsController (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    // Set up app with real module but mocked Prisma
    app = await createTestApp();
  });

  it('GET /api/v1/omakaarya/donations should return 401 without JWT', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/omakaarya/donations')
      .expect(401);

    expect(res.body.is_success).toBe(false);
  });

  it('GET /api/v1/omakaarya/donations should return paginated results', async () => {
    const token = generateTestJwt({ tenantId: 'tenant-123' });

    const res = await request(app.getHttpServer())
      .get('/api/v1/omakaarya/donations')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.is_success).toBe(true);
    expect(res.body.result).toHaveProperty('data');
    expect(res.body.result).toHaveProperty('total');
  });
});
```

---

## 3. Frontend Testing — React Testing Library

```tsx
// DonationForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DonationForm } from './DonationForm';

describe('DonationForm', () => {
  it('shows validation error when amount is empty', async () => {
    render(<DonationForm onSubmit={jest.fn()} />);

    // Click submit without filling amount
    await userEvent.click(screen.getByRole('button', { name: /record donation/i }));

    expect(await screen.findByText('Amount must be at least 1')).toBeInTheDocument();
  });

  it('calls onSubmit with correct data when form is valid', async () => {
    const onSubmit = jest.fn();
    render(<DonationForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText(/amount/i), '500');
    await userEvent.selectOptions(screen.getByLabelText(/method/i), 'CASH');
    await userEvent.click(screen.getByRole('button', { name: /record donation/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 500, method: 'CASH' })
      );
    });
  });

  it('shows loading state while submitting', async () => {
    const onSubmit = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
    render(<DonationForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText(/amount/i), '500');
    await userEvent.click(screen.getByRole('button', { name: /record donation/i }));

    expect(screen.getByRole('button', { name: /recording/i })).toBeDisabled();
  });
});
```

### RTL Query Priority (use in this order)
1. `getByRole` — best: matches accessible name
2. `getByLabelText` — for form inputs with labels
3. `getByText` — for non-interactive text
4. `getByTestId` — last resort only, when no semantic query works

**Never query by class name or element type.** Tests should work like a user would.

---

## 4. E2E Testing — Playwright (Critical Paths Only)

```ts
// e2e/donations/record-donation.spec.ts
import { test, expect } from '@playwright/test';
import { loginAsStaff, selectDevotee } from '../helpers';

test.describe('Record Donation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStaff(page);
    await page.goto('/omakaarya/donations/new');
  });

  test('staff can record a cash donation and receive a receipt', async ({ page }) => {
    // Search and select devotee
    await selectDevotee(page, 'Ramesh Kumar');

    // Enter donation details
    await page.getByLabel('Amount (LKR)').fill('1000');
    await page.getByRole('combobox', { name: 'Payment Method' }).selectOption('CASH');

    // Submit
    await page.getByRole('button', { name: 'Record Donation' }).click();

    // Verify receipt is shown
    await expect(page.getByText(/receipt generated/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/MKT-2026-/)).toBeVisible(); // Receipt number format
  });
});
```

**E2E tests cover only:**
- Login / session
- Record donation → receipt generated
- End-of-day POS reconciliation
- Critical report generation (daily collection)

---

## 5. Test File Naming

```
# Unit tests — same directory as the file being tested
donations.service.ts          → donations.service.spec.ts
DonationForm.tsx              → DonationForm.test.tsx
receipt.utils.ts              → receipt.utils.spec.ts

# Integration tests
donations.controller.integration.spec.ts

# E2E tests
e2e/donations/record-donation.spec.ts
e2e/auth/login.spec.ts
```

---

## 6. What to Test vs What Not to Test

| Test This | Don't Test This |
|---|---|
| Business logic in services | Third-party library internals |
| Tenant scope enforcement (always) | Prisma query builders (trust the ORM) |
| Validation logic | Simple getters/setters with no logic |
| All error states (404, 403, 401) | Framework boilerplate |
| Form validation and submission | CSS styling |
| Component states: loading, error, empty | Implementation details (private methods) |
| Receipt number generation | Next.js routing behaviour |

---

## 7. Coverage Requirement

- **80% minimum** on all new code — measured in CI, blocks merge if not met
- 100% coverage is not the goal — meaningful tests of real logic is the goal
- A test that just asserts `toBeTruthy()` does not count — write real assertions

```json
// jest.config.ts — coverage thresholds enforced
{
  "coverageThreshold": {
    "global": {
      "branches": 80,
      "functions": 80,
      "lines": 80,
      "statements": 80
    }
  }
}
```

---

## Quality Gates — Tests Complete When

- [ ] Unit tests written for all service methods
- [ ] Unit tests written for all components with logic
- [ ] Tenant scope enforcement tested explicitly (OmKaarya)
- [ ] All error states tested (404, 401, 403, 422)
- [ ] 80%+ coverage — confirmed by CI report
- [ ] Integration tests cover all new API endpoints
- [ ] E2E tests updated if a critical user flow changed
- [ ] Theme validation passes: Dark mode/Light mode toggles render using semantic design tokens (no glaring white backgrounds in dark mode)
- [ ] UI Component checks: Rounded corners (`border-radius`) properly clip inner content (`overflow: hidden`) per Figma specs
- [ ] All tests passing in CI before PR merge
