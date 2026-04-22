# Design System Reference
## Pepulux Design System — Omkaarya Implementation

| Field | Details |
|-------|---------|
| **Document version** | 2.0 |
| **Date** | 22 April 2026 |
| **Design System** | Pepulux DS |
| **Status** | Living document |

---

## 1. Brand Identity

| Element | Value |
|---------|-------|
| **Product** | Omkaarya |
| **Platform** | Pepulux |
| **Tagline** | Temple Management SaaS |
| **Logo mark** | "P" in orange rounded square |

---

## 2. Color System

### 2.1 Brand Colors (CSS Custom Properties)

```css
:root {
  /* Brand */
  --brand-primary:       #FF6B35;   /* Orange — CTAs, active states, highlights */
  --brand-primary-hover: #e85e2a;   /* Orange dark — hover states */
  --brand-primary-light: #fff4ef;   /* Orange tint — selected row backgrounds */
  --brand-primary-border:#ffd5c4;   /* Orange pale — selected borders */
}
```

### 2.2 Neutrals (Tailwind Zinc Scale)

| Token | Hex | Usage |
|-------|-----|-------|
| `zinc-50` | `#fafafa` | Table header background, hover |
| `zinc-100` | `#f4f4f5` | Row dividers, skeleton loaders |
| `zinc-200` | `#e4e4e7` | Borders, input borders |
| `zinc-300` | `#d4d4d8` | Toggle track (off), disabled |
| `zinc-400` | `#a1a1aa` | Muted text, icons |
| `zinc-500` | `#71717a` | Secondary text, labels |
| `zinc-600` | `#52525b` | Subtext |
| `zinc-700` | `#3f3f46` | Dark mode borders |
| `zinc-800` | `#27272a` | Dark mode surfaces |
| `zinc-900` | `#18181b` | Primary text, sidebar bg |
| `zinc-950` | `#09090b` | Deepest dark |

### 2.3 Semantic Colors

| Purpose | Light Mode | Dark Mode | Usage |
|---------|-----------|-----------|-------|
| Success | `emerald-500` (#10b981) | `emerald-400` | Active toggles, enabled states, checkmarks |
| Error | `red-600` (#dc2626) | `red-400` | Delete actions, error states |
| Warning | `amber-600` (#d97706) | `amber-400` | Warning banners, immutable field notices |
| Info | `blue-600` (#2563eb) | `blue-300` | Info banners, module key pills |

### 2.4 Status Badge Colors

| Status | Background | Text | Context |
|--------|-----------|------|---------|
| Active | `emerald-100` | `emerald-800` | Subscription active, feature active |
| Pending | `amber-100` | `amber-800` | Subscription pending verification |
| Expired | `red-100` | `red-800` | Subscription expired |
| Cancelled | `zinc-100` | `zinc-500` | Subscription cancelled |
| Inactive | `zinc-100` | `zinc-500` | Feature deactivated |

### 2.5 Pill Colors (Feature Registry)

| Type | Background | Text | Usage |
|------|-----------|------|-------|
| Module | `blue-50` | `blue-700` | Module key identifier |
| Number | `amber-50` | `amber-700` | Limit type: number |
| Boolean | `purple-50` | `purple-700` | Limit type: boolean |
| None | `zinc-100` | `zinc-500` | Limit type: none |

---

## 3. Typography

### 3.1 Font Family
```css
font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
```

**Weights loaded:** 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold), 800 (ExtraBold)

### 3.2 Type Scale

| Element | Size | Weight | Tracking | Usage |
|---------|------|--------|----------|-------|
| Page title | 18–24px | 700–800 | -0.02em | Main page headings |
| Section heading | 14–16px | 700 | normal | Card titles, section headers |
| Body text | 12–14px | 400–500 | normal | Paragraph text, table cells |
| Labels | 10–11px | 600–700 | 0.05em (uppercase) | Form labels, table headers |
| Monospace | 10–12px | 400 | normal | Feature keys, module keys, code |
| Hint text | 10px | 400 | normal | Descriptions, subtitles |

### 3.3 Monospace Font
```css
font-family: ui-monospace, 'SF Mono', 'Cascadia Code', monospace;
```
Used for: Feature keys, module keys, code references.

---

## 4. Spacing System

Based on Tailwind's spacing scale (1 unit = 4px):

| Token | px | Usage |
|-------|-----|-------|
| `gap-1` | 4px | Tight icon gaps |
| `gap-1.5` | 6px | Button icon gaps |
| `gap-2` | 8px | Standard element gaps |
| `gap-3` | 12px | Card gaps, form field gaps |
| `gap-4` | 16px | Section spacing |
| `p-4` | 16px | Card padding |
| `p-5` | 20px | Panel padding |
| `p-6` | 24px | Page content padding |
| `mb-3` | 12px | Component bottom margin |
| `mb-4` | 16px | Section bottom margin |
| `mb-5` | 20px | Page header bottom margin |

---

## 5. Component Specifications

### 5.1 Buttons

| Variant | Background | Text | Border | Radius | Padding |
|---------|-----------|------|--------|--------|---------|
| Primary | `--brand-primary` | white | none | 8px | 8px 14px |
| Primary (hover) | `--brand-primary-hover` | white | none | 8px | 8px 14px |
| Secondary | white | `zinc-600` | 1px `zinc-200` | 8px | 8px 14px |
| Secondary (hover) | white | `--brand-primary` | 1px `--brand-primary` | 8px | 8px 14px |
| Ghost | transparent | `zinc-500` | 1px `zinc-200` | 6px | 4px 9px |
| Ghost (hover) | transparent | `--brand-primary` | 1px `--brand-primary` | 6px | 4px 9px |
| Danger Ghost | transparent | `zinc-500` | 1px `zinc-200` | 6px | 4px 9px |
| Danger Ghost (hover) | transparent | `red-500` | 1px `red-400` | 6px | 4px 9px |

**Font:** 11–12px, font-weight 600

### 5.2 Toggle Switch

```
Track:  width 32px, height 18px, border-radius 18px
Thumb:  width 14px, height 14px, border-radius 50%, white
OFF:    track = zinc-300, thumb at left (2px offset)
ON:     track = emerald-500, thumb at right (translateX 14px)
```

### 5.3 Cards

```
Background: white (dark: zinc-900)
Border:     1px solid zinc-200 (dark: zinc-800)
Radius:     12px (rounded-xl)
Padding:    16px
Shadow:     shadow-sm (content cards), none (stat cards)
```

### 5.4 Tables / Registry

```
Container:  rounded-xl, border, overflow-hidden, background white
Header:     bg-zinc-50, border-bottom, uppercase labels 10px
Rows:       border-bottom zinc-100, hover bg-zinc-50
Expanded:   bg-[#fff4ef], border-color [#ffd5c4]
L2 indent:  3px orange stripe (opacity 0.25) + 6px dot (#ffd5c4)
```

### 5.5 Form Inputs

```
Height:     ~36px (py-2, text-xs)
Border:     1px solid zinc-200, radius 7–8px
Focus:      border-color var(--brand-primary)
Read-only:  bg-zinc-50, text-zinc-400, cursor-not-allowed
Monospace:  font-family monospace (for key fields)
```

### 5.6 Modals / Panels

```
Add Feature Panel:
  Border:  2px solid var(--brand-primary)
  Radius:  12px
  Padding: 20px
  Close:   X button, top-right

Banner (Info):
  Background:  blue-50 (dark: blue-950/30)
  Border:      1px solid blue-200
  Icon:        Info circle, blue
  Text:        12px, blue-800, leading-relaxed
```

### 5.7 Toast Notifications

```
Position:   fixed, bottom 20px, right 20px
Background: zinc-900 (dark: zinc-100)
Text:       white (dark: zinc-900), 12px, font-weight 500
Radius:     12px
Padding:    10px 16px
Animation:  fade-in + slide-up, 2.4s auto-dismiss
```

---

## 6. Iconography

### Icon Set: Lucide React

| Icon | Usage |
|------|-------|
| `Plus` | Add/create actions |
| `Search` | Search inputs |
| `ChevronDown` | Expanded module, dropdown |
| `ChevronRight` | Collapsed module |
| `Check` | Feature included checkmark |
| `X` | Close modal/panel |
| `Trash2` | Delete actions |
| `Info` | Info banners |
| `Pencil` | Edit actions |
| `ToggleLeft/Right` | Active/inactive status |
| `AlertTriangle` | Warning banners |

**Standard sizes:** 14px (inline), 16px (buttons), 20px (table actions)

---

## 7. Responsive Breakpoints

| Breakpoint | Width | Behaviour |
|-----------|-------|-----------|
| Mobile | < 640px | Single column, collapsed sidebar |
| Tablet | 640–1024px | 2-column grids, compact cards |
| Desktop | 1024–1440px | Full layout, 3-column grids |
| Widescreen | > 1440px | Max-width container, centered |

### Container Max Width
```css
max-width: min(100rem, calc(100vw - 2rem));
```

---

## 8. Animation & Transitions

| Element | Property | Duration | Easing |
|---------|----------|----------|--------|
| Button hover | background, border-color | 120ms | ease |
| Toggle switch | transform, background | 150ms | ease |
| Row hover | background-color | 100ms | ease |
| Toast appear | opacity, transform | 200ms | ease |
| Panel expand | height (display toggle) | instant | — |

---

## 9. Dark Mode Support

All components support dark mode via Tailwind's `dark:` prefix. Key mappings:

| Light | Dark |
|-------|------|
| `bg-white` | `bg-zinc-900` |
| `border-zinc-200` | `border-zinc-800` |
| `text-zinc-900` | `text-zinc-50` |
| `text-zinc-500` | `text-zinc-400` |
| `bg-zinc-50` | `bg-zinc-800/50` |
| `bg-blue-50` | `bg-blue-950/30` |
| `bg-amber-50` | `bg-amber-950/40` |
