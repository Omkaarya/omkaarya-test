---
name: pepulux-nextjs-frontend
description: >
  Frontend engineering skill for Pepulux. Activate whenever building UI screens, components,
  pages, layouts, or any frontend code for OmKaarya or PepulHire using Next.js, TypeScript,
  and Tailwind CSS. Covers: component architecture, routing, server vs client components,
  caching strategy, Tailwind design token usage, form handling, state management, API
  integration, accessibility, and performance. Always read this before writing any frontend code.
---

# Pepulux — Next.js Frontend Engineering Skill
## Stack: Next.js · TypeScript · Tailwind CSS

---

## 0. Before Writing Any Code

1. Read `.docs/README.md` — confirm the Next.js version in use
2. Read `.docs/design-system/` — all visual values come from tokens, never hardcoded
3. Open the Figma design for the screen being built — match it exactly
4. Confirm the working directory with the founder

---

## 1. Project Structure

```
src/
├── app/                          ← Next.js App Router (all routes live here)
│   ├── (auth)/                   ← Auth group: login, register
│   ├── (dashboard)/              ← Authenticated app: all product screens
│   │   ├── layout.tsx            ← DashboardLayout — owns padding, sidebar, header
│   │   ├── [module]/             ← Module route (e.g. donations/, devotees/)
│   │   │   ├── page.tsx          ← Module list/main view
│   │   │   └── [id]/page.tsx     ← Module detail view
│   └── globals.css               ← Global styles only (no component styles here)
├── components/
│   ├── base/                     ← Atoms: Button, Input, Badge, Modal, etc.
│   ├── common/                   ← Molecules: DataTable, EmptyState, PageHeader
│   └── [module]/                 ← Module-specific components
├── lib/
│   ├── api/                      ← API client functions (typed)
│   ├── hooks/                    ← Custom React hooks
│   ├── utils/                    ← Pure utility functions
│   └── validators/               ← Zod schemas for all form validation
├── types/                        ← Shared TypeScript types and interfaces
├── constants/                    ← App-wide constants (routes, config)
└── styles/
    └── tokens.css                ← Design token CSS variables
```

---

## 2. Server vs Client Components — The Most Important Decision

**Default: Server Component.** Only add `'use client'` when you genuinely need it.

| Use Server Component | Use Client Component |
|---|---|
| Fetching data | User interactions (onClick, onChange) |
| Reading from DB/API | useState or useEffect |
| Static or SEO content | Browser APIs (localStorage, window) |
| No interactivity | Real-time updates |

```tsx
// Server Component (default — no directive needed)
export default async function DevoteesPage() {
  const devotees = await getDevotees(); // Direct async call — no useEffect
  return <DevoteeTable data={devotees} />;
}

// Client Component — only when needed
'use client';
export function DonationForm() {
  const [amount, setAmount] = useState('');
  // ...
}
```

**Rule:** If a component only needs data and renders HTML, it is a Server Component.

---

## 3. Routing — App Router Conventions

```
app/
├── (dashboard)/
│   ├── omakaarya/
│   │   ├── donations/
│   │   │   ├── page.tsx           ← /omakaarya/donations
│   │   │   ├── [id]/page.tsx      ← /omakaarya/donations/123
│   │   │   └── new/page.tsx       ← /omakaarya/donations/new
│   │   └── devotees/
│   │       └── page.tsx           ← /omakaarya/devotees
```

- Route groups `(group)` — organise without affecting URL
- Dynamic routes `[id]` — always typed: `{ params: { id: string } }`
- Layouts `layout.tsx` — define once, inherited by all child routes
- Loading states `loading.tsx` — automatic Suspense boundary
- Error states `error.tsx` — automatic error boundary

---

## 4. Data Fetching Patterns

### Server Component (preferred for initial data)
```tsx
// app/(dashboard)/omakaarya/donations/page.tsx
export default async function DonationsPage() {
  const donations = await getDonations(); // Server-side, no loading state needed
  return <DonationTable donations={donations} />;
}
```

### API Route Handler (for mutations and client-triggered fetches)
```ts
// app/api/donations/route.ts
export async function GET(request: Request) {
  // Validate auth, fetch data, return response
}

export async function POST(request: Request) {
  // Validate body, create record, return response
}
```

### Client-side data with React Query (for real-time or interactive data)
```tsx
'use client';
const { data, isLoading, error } = useQuery({
  queryKey: ['donations', filters],
  queryFn: () => fetchDonations(filters),
});
```

**Never use `useEffect` + `fetch` for data fetching.** Use React Query for client-side data.

---

## 5. Caching Strategy (Next.js — Always Ask Before Setting Cache Lifetime)

Next.js 15+ caches aggressively. Know what to cache and for how long.

```tsx
// Static — cached indefinitely (rebuild to refresh)
export const revalidate = false;

// Time-based revalidation — ask founder which value to use
export const revalidate = 60;   // 1 minute
export const revalidate = 300;  // 5 minutes
export const revalidate = 3600; // 1 hour

// Dynamic — never cached (for auth-sensitive or real-time data)
export const dynamic = 'force-dynamic';
```

**Rule: Before setting a cache lifetime on any component or route, present the options to the founder and ask for confirmation. Do not decide cache lifetime unilaterally.**

For OmKaarya financial data and devotee records — use `force-dynamic`. These must always be fresh.

---

## 6. Tailwind CSS — Design Token Usage

**Never use raw Tailwind classes for colour, spacing, or typography if a design token exists.**

Extend Tailwind config with Pepulux design tokens:

```ts
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        'primary-hover': 'var(--color-primary-hover)',
        secondary: 'var(--color-secondary)',
        surface: 'var(--color-surface)',
        border: 'var(--color-border)',
        error: 'var(--color-error)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        'text-primary': 'var(--color-text-primary)',
        'text-muted': 'var(--color-text-muted)',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
      },
      spacing: {
        // Only extend if design system defines custom spacing tokens
      },
    },
  },
};
```

**Right way:**
```tsx
<button className="bg-primary hover:bg-primary-hover text-white">
```

**Wrong way:**
```tsx
<button className="bg-blue-600 hover:bg-blue-700 text-white">
// Never hardcode Tailwind colour classes — always use tokens
```

---

## 7. Component Rules

### 7.1 Page Layout — Never Add Local Padding
```tsx
// ✅ Correct — DashboardLayout owns the padding
export default function DonationsPage() {
  return (
    <div className="w-full">  {/* w-full, never max-w-[...] */}
      <PageHeader title="Donations" />
      <DonationTable />
    </div>
  );
}

// ❌ Wrong — never apply padding to page root
export default function DonationsPage() {
  return (
    <div className="p-8 max-w-7xl">
```

### 7.2 Button Hierarchy
```tsx
// Primary — ONE per page, the main action
<Button variant="primary" onClick={handleSubmit}>Record Donation</Button>

// Secondary — all other actions
<Button variant="secondary" onClick={handleExport}>Export</Button>

// Destructive — delete/remove — always with confirmation
<Button variant="destructive" onClick={() => setShowConfirm(true)}>Delete</Button>
```

### 7.3 Confirmation for Destructive Actions
```tsx
// Always use PopConfirm — never browser alert()
import { PopConfirm } from '@/components/base/PopConfirm';

<PopConfirm
  title="Delete Devotee Record"
  description="This action cannot be undone. All devotee data will be permanently removed."
  onConfirm={handleDelete}
  onCancel={() => {}}
>
  <Button variant="destructive">Delete</Button>
</PopConfirm>
```

### 7.4 Table Loading State
```tsx
// ✅ Always use TLoader — never build ad-hoc skeletons
import { TLoader } from '@/components/base/Table';

<TBody>
  {isLoading ? (
    <TLoader columns={5} rows={10} />
  ) : (
    data.map(row => <TableRow key={row.id} data={row} />)
  )}
</TBody>
```

### 7.5 Empty State
```tsx
// ✅ Always use EmptyState — never ad-hoc "no records" text
import { EmptyState } from '@/components/base/EmptyState';

{data.length === 0 && (
  <EmptyState
    title="No donations recorded"
    description="Record the first donation to get started."
    action={{ label: 'Record Donation', onClick: handleNew }}
  />
)}
```

### 7.6 File Size Limit
- Component file > 300 lines → split into sub-components
- Extract: modals, forms, table rows, toolbars, sidebars
- Each sub-component in its own file, same directory, imported back into parent

---

## 8. TypeScript Standards

```ts
// Always type component props explicitly
interface DonationCardProps {
  donation: Donation;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

// Never use 'any' — use 'unknown' then narrow it
// ❌ const data: any = response.json();
// ✅ const data: unknown = response.json();

// Use type for unions, interface for objects
type DonationStatus = 'pending' | 'completed' | 'failed';

interface Donation {
  id: string;
  amount: number;
  status: DonationStatus;
  devoteeId: string;
  templeId: string; // Multi-tenancy — always present
  createdAt: Date;
}

// Shared types live in src/types/ — never duplicate type definitions
```

---

## 9. Form Handling — Zod + React Hook Form

```tsx
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const donationSchema = z.object({
  amount: z.number().min(1, 'Amount must be at least 1'),
  devoteeId: z.string().min(1, 'Devotee is required'),
  method: z.enum(['cash', 'card', 'upi']),
  notes: z.string().optional(),
});

type DonationFormData = z.infer<typeof donationSchema>;

export function DonationForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<DonationFormData>({
    resolver: zodResolver(donationSchema),
  });

  // Validation errors display below the field — never in a toast
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="amount">Amount (LKR) *</label>
        <input id="amount" type="number" {...register('amount', { valueAsNumber: true })} />
        {errors.amount && <p className="text-error text-sm mt-1">{errors.amount.message}</p>}
      </div>
      <Button type="submit" variant="primary" disabled={isSubmitting}>
        {isSubmitting ? 'Recording...' : 'Record Donation'}
      </Button>
    </form>
  );
}
```

---

## 10. API Integration Pattern

```ts
// lib/api/donations.ts — typed API functions
import { Donation, DonationCreateInput, ApiResponse, PaginatedResponse } from '@/types';

export async function getDonations(params: {
  page?: number;
  limit?: number;
  search?: string;
  templeId: string;
}): Promise<PaginatedResponse<Donation>> {
  const res = await fetch(`/api/donations?${new URLSearchParams(params as any)}`);
  if (!res.ok) throw new Error('Failed to fetch donations');
  return res.json();
}

export async function createDonation(data: DonationCreateInput): Promise<Donation> {
  const res = await fetch('/api/donations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create donation');
  return res.json();
}
```

---

## 11. Accessibility Checklist (Every Component)

- [ ] All interactive elements reachable by keyboard (Tab, Enter, Space)
- [ ] Visible focus ring on all focusable elements
- [ ] All images have `alt` attribute
- [ ] All form inputs have associated `<label>` (via `htmlFor` + `id`)
- [ ] Error messages linked to inputs via `aria-describedby`
- [ ] Icon-only buttons have `aria-label`
- [ ] Colour contrast ≥ 4.5:1 for text, ≥ 3:1 for UI elements
- [ ] No information conveyed by colour alone

---

## 12. Performance Rules

- Images: always use `next/image` — never raw `<img>`
- Fonts: always use `next/font` — never load from external CDN
- Icons: import individually — never import entire icon libraries
- Large components: use `dynamic()` with `{ ssr: false }` for client-heavy components
- Bundle: run `next build` and check bundle sizes before every release

---

## 13. Multi-Tenancy on the Frontend (OmKaarya)

- The logged-in temple's name and ID must be visible in the header at all times
- Temple ID is stored in the authenticated session — never in localStorage
- Every API call includes the tenant context (from session, not from URL params)
- Never display data across tenants — temple selector (if exists) requires a full session switch

---

## Quality Gates — Frontend Build Complete When

- [ ] Matches Figma design exactly — verified side by side
- [ ] All component states built: default, hover, loading, error, empty, success
- [ ] TypeScript — zero `any` types, zero type errors
- [ ] Mobile, tablet, desktop breakpoints all tested
- [ ] Accessibility checklist passed
- [ ] No hardcoded colour or spacing values — all tokens
- [ ] All form validation working with Zod
- [ ] No console errors or warnings
- [ ] `next build` passes with no errors
