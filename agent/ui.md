---
trigger: always_on
---

# OmKaarya — UI/UX Engineering Rules
# Applies to every screen in `omkaarya-test/` (Next.js frontend).

---

## 0. Non-Negotiable Starting Point

**Figma is the source of truth. Always.**

When any UI task is assigned — whether a new screen, a component, or a bug fix — the Figma design is read first. No exceptions. Building UI without a Figma reference requires explicit founder confirmation.

---

## 1. Working Directory for All UI Work

```
omkaarya-test/          ← All frontend work lives here
├── app/
│   ├── super-admin/    ← Super admin portal screens
│   ├── temple-admin/   ← Temple admin portal screens
│   ├── login/          ← Auth screens
│   └── registration/   ← Temple onboarding screens
├── app/components/     ← Shared components
└── lib/                ← Utilities
```

---

## 2. Portal Design Rules

### Super Admin Portal (`/super-admin`)
- Users: Pepulux internal team
- Tone: operational, data-dense, efficient
- Primary actions: temple activation, onboarding management, system oversight
- Design: professional dashboard — clear data tables, status indicators, action controls

### Temple Admin Portal (`/temple-admin`)
- Users: temple administrators, treasurers, staff — may not be tech-savvy
- Tone: clear, accessible, welcoming, culturally respectful
- Primary actions: donations, devotee lookup, event management, reports
- Design: clarity over density — larger touch targets, clear labels, simple navigation
- **The logged-in temple name must always be visible in the header**

---

## 3. Design System — Source of Truth

Design tokens are in `.docs/design-system/tokens.md`.

**Rules:**
- Use CSS variables or Tailwind config extensions for all colour, spacing, and typography values
- Never use raw Tailwind colour classes (`bg-blue-600`) — use token-mapped classes (`bg-primary`)
- Never hardcode hex values in components
- If a design token doesn't exist for what you need — flag it, don't invent it

---

## 4. Component Organisation

```
app/components/               ← Shared across portals
├── base/                     ← Atoms: Button, Input, Badge, Modal, Select, Checkbox
├── common/                   ← Molecules: DataTable, EmptyState, PageHeader, TLoader
├── super-admin/              ← Super-admin-specific components
└── temple-admin/             ← Temple-admin-specific components
```

**Base components must be built once and reused everywhere.** Never build an inline one-off version of Button, Input, or Modal.

---

## 5. Component Rules (Matching Existing Codebase Patterns)

### Page Layout
- Page root containers use `w-full` — never constrained `max-w-[...]`
- Padding is controlled by the layout wrapper — never add `p-8` to a page root
- Follow the same layout pattern already established in `super-admin/` and `temple-admin/`

### Buttons
- **Primary**: one per page, the main action
- **Secondary**: all supporting actions
- **Destructive**: delete/remove — always red, always with a confirmation dialog
- Study existing button usage in `app/components/` before adding new variants

### Confirmation Dialogs
- Every destructive action (delete, deactivate, revoke) shows a confirmation dialog
- Dialog must state what will be deleted and that it cannot be undone
- Never use `window.confirm()` — use the shared confirmation component

### Tables
- Loading state: use the shared `TLoader` component — never build ad-hoc skeletons
- Empty state: use the shared `EmptyState` component — never ad-hoc "no records" text
- Columns: consistent, predictable widths — no layout shifts on data load

### Forms
- Labels above inputs — never placeholder-only
- Validation messages below the field — not in a toast
- Required fields marked consistently
- Loading state while submitting — button shows loading, is disabled

### Server Actions (existing pattern — `app/actions/`)
- Auth logic → `auth.ts`
- Onboarding logic → `onboarding.ts`
- Temple CRUD → `temples.ts`
- New domain actions → create a new file: `[domain].ts`
- Never put server action logic inline in page components

---

## 6. When a Figma Screen Is Shared — Exact Process

1. **Analyse** — identify colours, typography, spacing, components, states used
2. **Map to tokens** — find each value in the design system token file
3. **Identify components** — which exist in `app/components/`? Which are new?
4. **Flag new patterns** — anything not in the design system needs flagging before build
5. **Build** — implement matching Figma exactly, using existing components and tokens
6. **Compare** — review built output against Figma side-by-side, fix every deviation
7. **Document** — if a new component was built, add it to `.docs/design-system/`

The output must be **indistinguishable from the Figma design.**

---

## 7. All States — Every Component Must Handle These

| State | Required |
|---|---|
| Default | Always |
| Hover | All interactive elements |
| Focus | All interactive elements (keyboard nav) |
| Loading | All async operations |
| Disabled | All form inputs and buttons when applicable |
| Error | All forms and data fetches |
| Empty | All lists and tables |
| Success | Form submissions |

Never ship a component without all applicable states built.

---

## 8. Accessibility (WCAG AA Minimum)

- Colour contrast: 4.5:1 for body text, 3:1 for UI elements
- All interactive elements reachable by keyboard (Tab, Enter, Space)
- All inputs have associated `<label>` elements
- Icon-only buttons have `aria-label`
- No information conveyed by colour alone

---

## 9. Responsive Breakpoints

| Breakpoint | Size | Notes |
|---|---|---|
| Mobile | < 768px | Temple staff using phones at counter |
| Tablet | 768px–1024px | Temple office tablets |
| Desktop | > 1024px | Primary workspace |

Mobile first. Always. Test all three breakpoints before marking UI complete.

---

## 10. File Size Rule

Component file > 300 lines → split into sub-components. Extract modals, forms, table rows, toolbars into separate files in the same directory, import them back.