# OmKaarya — Design System Tokens
# Source of truth for all visual values. Updated from Figma.
# Share the Figma file link to populate this file with actual token values.

---

## Status: Awaiting Figma Export

This file will be populated once the Figma design system link is shared.

It will contain:
- Colour tokens (primary, secondary, semantic, neutral scale)
- Typography scale (font family, sizes, weights, line heights)
- Spacing scale (base grid, spacing tokens)
- Border radius tokens
- Shadow tokens
- Component-specific tokens

---

## Tailwind Config Extension (to be filled)

```ts
// omkaarya-test/tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        // Will be populated from Figma tokens
        primary: 'var(--color-primary)',
        'primary-hover': 'var(--color-primary-hover)',
        secondary: 'var(--color-secondary)',
        surface: 'var(--color-surface)',
        border: 'var(--color-border)',
        error: 'var(--color-error)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
      },
    },
  },
};
```

---

## Components in System

| Component | Location | Status |
|---|---|---|
| Button | `app/components/base/Button.tsx` | [status] |
| Input | `app/components/base/Input.tsx` | [status] |
| Modal | `app/components/base/Modal.tsx` | [status] |
| DataTable | `app/components/common/DataTable.tsx` | [status] |
| EmptyState | `app/components/common/EmptyState.tsx` | [status] |
| TLoader | `app/components/common/TLoader.tsx` | [status] |
| PageHeader | `app/components/common/PageHeader.tsx` | [status] |

*Share Figma file URL to update this with real token values.*
