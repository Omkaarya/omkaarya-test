# Pepulux Design System — Tokens
## The single design system used across all Pepulux products.
## Source: Figma Variables Export · Light Mode + Dark Mode

---

## How This Design System Works

This is the **Pepulux Design System** — built once, used across every product Pepulux builds.

### The One Rule for New Products

Every product uses this exact system — colours, typography, spacing, radius, shadows — unchanged.

**The only thing that changes per product is the brand colour.**

Brand colour lives in `_Primitives → Colors/Brand` in Figma. Swap those values and every component, button, badge, focus ring, and semantic token that references the brand scale automatically updates. Nothing else changes.

| Product | Brand Colour | Notes |
|---|---|---|
| **OmKaarya** | `#FF4800` | Saffron-orange — Hindu temple culture |
| **PepulHire** | TBD | Set in Primitives when product is branded |
| Future products | TBD | Always set in Primitives — never override in components |

### What Never Changes Across Products
- Font: **Plus Jakarta Sans**
- All gray scale values
- All semantic tokens (text, background, border, foreground)
- Spacing scale
- Border radius scale
- Shadow tokens
- Typography scale
- Container and width tokens

---

## Brand Colour Scale — Swap Here for Each Product

In Figma: `_Primitives → Colors/Brand`
In code: `tailwind.config.ts → theme.extend.colors.brand`

**Current product: OmKaarya**

| Token | Hex | Usage |
|---|---|---|
| `brand-50` | `#FFF0EF` | Brand backgrounds, subtle tints |
| `brand-100` | `#FFE1DF` | Brand secondary backgrounds |
| `brand-200` | `#FFBFBA` | Brand text on dark, on-brand secondary |
| `brand-300` | `#FF9F95` | Button icons on brand |
| `brand-400` | `#FF7764` | Brand accents |
| `brand-500` | `#FF4800` | **Primary brand — buttons, links, focus rings** |
| `brand-600` | `#CA3700` | Brand hover state, brand borders |
| `brand-700` | `#9B2800` | Brand text secondary |
| `brand-800` | `#6B1900` | Brand text hover |
| `brand-900` | `#420C00` | Darkest brand |

> To use this system for a new product: replace only the 10 hex values above in `_Primitives`. Every semantic token, component, and screen updates automatically.

---

## Typography — Same Across All Products

**Font Family:** Plus Jakarta Sans (display + body — both)

### Loading the Font

```ts
// omkaarya-test/app/layout.tsx
import { Plus_Jakarta_Sans } from 'next/font/google';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={plusJakartaSans.variable}>
      <body>{children}</body>
    </html>
  );
}
```

### Localisation Fallback Stack (Tamil + Sinhala — future)
When OmKaarya adds Tamil or Sinhala language support, Plus Jakarta Sans covers Latin only. Use this fallback stack:

```css
font-family: 'Plus Jakarta Sans', 'Noto Sans Tamil', 'Noto Sans Sinhala', sans-serif;
```

Load `Noto Sans Tamil` and `Noto Sans Sinhala` from Google Fonts at that point. They are designed to pair with Latin fonts visually without conflict.

### Font Weights
| Token | Value | Usage |
|---|---|---|
| `regular` | 400 | Body text |
| `medium` | 500 | Labels, buttons |
| `semibold` | 600 | Subheadings, emphasis |
| `bold` | 700 | Headings |

### Font Sizes + Line Heights
| Token | Size | Line Height | Usage |
|---|---|---|---|
| `text-xs` | 12px | 18px | Captions, labels, helper text |
| `text-sm` | 14px | 20px | Secondary body, form labels |
| `text-md` | 16px | 24px | **Primary body text** |
| `text-lg` | 18px | 28px | Large body |
| `text-xl` | 20px | 30px | Small headings |
| `display-xs` | 24px | 32px | Card headings |
| `display-sm` | 30px | 38px | Section headings |
| `display-md` | 36px | 44px | Page headings |
| `display-lg` | 48px | 60px | Large display |
| `display-xl` | 60px | 72px | Hero headings |
| `display-2xl` | 72px | 90px | Largest display |

---

## Semantic Colour Tokens — Same Across All Products

These tokens reference `brand-*` values. They update automatically when the brand scale is swapped.

### Text
| Token | Light Mode Hex | Usage |
|---|---|---|
| `text-primary` | `#181D27` | Primary body text, headings |
| `text-secondary` | `#414651` | Secondary text, labels |
| `text-tertiary` | `#535862` | Captions, helper text |
| `text-quaternary` | `#717680` | Placeholder, subtle text |
| `text-white` | `#FFFFFF` | Text on dark backgrounds |
| `text-disabled` | `#717680` | Disabled state |
| `text-placeholder` | `#717680` | Input placeholder |
| `text-brand-primary` | `brand-500` | Brand-coloured text / links |
| `text-brand-secondary` | `brand-700` | Secondary brand text |
| `text-error-primary` | `#D92D20` | Error messages |
| `text-warning-primary` | `#DC6803` | Warning messages |
| `text-success-primary` | `#079455` | Success messages |

### Backgrounds
| Token | Light Mode Hex | Usage |
|---|---|---|
| `bg-primary` | `#FDFDFD` | Page background |
| `bg-secondary` | `#FAFAFA` | Sidebar, secondary surfaces |
| `bg-tertiary` | `#F5F5F5` | Table rows, subtle fills |
| `bg-quaternary` | `#E9EAEB` | Dividers |
| `bg-disabled` | `#F5F5F5` | Disabled inputs |
| `bg-overlay` | `#0A0D12` | Modal overlays |
| `bg-brand-primary` | `brand-50` | Brand-tinted backgrounds |
| `bg-brand-secondary` | `brand-100` | Stronger brand backgrounds |
| `bg-brand-solid` | `brand-500` | **Primary button background** |
| `bg-brand-solid-hover` | `brand-600` | **Primary button hover** |
| `bg-error-primary` | `#FEF3F2` | Error alert backgrounds |
| `bg-error-solid` | `#D92D20` | Error fills |
| `bg-warning-primary` | `#FFFAEB` | Warning backgrounds |
| `bg-success-primary` | `#ECFDF3` | Success backgrounds |

### Borders
| Token | Light Mode Hex | Usage |
|---|---|---|
| `border-primary` | `#D5D7DA` | Default input borders, cards |
| `border-secondary` | `#E9EAEB` | Subtle dividers |
| `border-disabled` | `#D5D7DA` | Disabled inputs |
| `border-brand` | `brand-500` | Focused inputs, active state |
| `border-brand-alt` | `brand-600` | Alternative brand border |
| `border-error` | `#F04438` | Error input borders |

### Foreground (Icons + UI Elements)
| Token | Light Mode Hex | Usage |
|---|---|---|
| `fg-primary` | `#181D27` | Primary icons |
| `fg-secondary` | `#414651` | Secondary icons |
| `fg-tertiary` | `#535862` | Tertiary icons |
| `fg-quaternary` | `#A4A7AE` | Subtle icons |
| `fg-disabled` | `#A4A7AE` | Disabled icons |
| `fg-brand-primary` | `brand-500` | Brand icons |
| `fg-error-primary` | `#D92D20` | Error icons |
| `fg-success-primary` | `#079455` | Success icons |

### Focus Rings
| Token | Light Mode Hex | Usage |
|---|---|---|
| `focus-ring` | `brand-500` | Default keyboard focus |
| `focus-ring-error` | `#F04438` | Error state focus |
| `focus-ring-success` | `#17B26A` | Success state focus |

---

## Gray Scale — Same Across All Products

| Token | Hex |
|---|---|
| Gray 25 | `#FDFDFD` |
| Gray 50 | `#FAFAFA` |
| Gray 100 | `#F5F5F5` |
| Gray 200 | `#E9EAEB` |
| Gray 300 | `#D5D7DA` |
| Gray 400 | `#A4A7AE` |
| Gray 500 | `#717680` |
| Gray 600 | `#535862` |
| Gray 700 | `#414651` |
| Gray 800 | `#252B37` |
| Gray 900 | `#181D27` |
| Gray 950 | `#0A0D12` |

---

## Spacing Scale — Same Across All Products

| Token | Value |
|---|---|
| `spacing-none` | 0px |
| `spacing-xxs` | 2px |
| `spacing-xs` | 4px |
| `spacing-sm` | 6px |
| `spacing-md` | 8px |
| `spacing-lg` | 12px |
| `spacing-xl` | 16px |
| `spacing-2xl` | 20px |
| `spacing-3xl` | 24px |
| `spacing-4xl` | 32px |
| `spacing-5xl` | 40px |
| `spacing-6xl` | 48px |
| `spacing-7xl` | 64px |
| `spacing-8xl` | 80px |
| `spacing-9xl` | 96px |
| `spacing-10xl` | 128px |
| `spacing-11xl` | 160px |

---

## Border Radius — Same Across All Products

| Token | Value | Usage |
|---|---|---|
| `radius-none` | 0px | Square elements |
| `radius-xxs` | 2px | Subtle rounding |
| `radius-xs` | 4px | Badges, chips |
| `radius-sm` | 6px | Small buttons, inputs |
| `radius-md` | 8px | **Default — buttons, cards, inputs** |
| `radius-lg` | 10px | Larger buttons |
| `radius-xl` | 12px | Cards, modals |
| `radius-2xl` | 16px | Large cards |
| `radius-3xl` | 20px | Panels |
| `radius-4xl` | 24px | Large panels |
| `radius-full` | 9999px | Pills, avatars |

---

## Container & Width Tokens — Same Across All Products

| Token | Value | Usage |
|---|---|---|
| `container-padding-mobile` | 16px | Page padding on mobile |
| `container-padding-desktop` | 32px | Page padding on desktop |
| `container-max-width` | 1280px | Max content width |
| `paragraph-max-width` | 720px | Readable text width |

---

## Tailwind Config — Per Product (Only Brand Colours Change)

```ts
// tailwind.config.ts
// To use for a new product: replace only the brand colour values below.
// Everything else stays identical across all Pepulux products.

import type { Config } from 'tailwindcss';

const brandColors = {
  // ← SWAP THESE FOR EACH PRODUCT (from Primitives in Figma)
  50: '#FFF0EF',   // OmKaarya
  100: '#FFE1DF',
  200: '#FFBFBA',
  300: '#FF9F95',
  400: '#FF7764',
  500: '#FF4800',  // PRIMARY
  600: '#CA3700',  // HOVER
  700: '#9B2800',
  800: '#6B1900',
  900: '#420C00',
};

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        brand: brandColors,
        gray: {
          25: '#FDFDFD',
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E9EAEB',
          300: '#D5D7DA',
          400: '#A4A7AE',
          500: '#717680',
          600: '#535862',
          700: '#414651',
          800: '#252B37',
          900: '#181D27',
          950: '#0A0D12',
        },
        error: {
          50: '#FEF3F2',
          100: '#FEE4E2',
          500: '#F04438',
          600: '#D92D20',
          700: '#B42318',
        },
        warning: {
          50: '#FFFAEB',
          500: '#F79009',
          600: '#DC6803',
        },
        success: {
          50: '#ECFDF3',
          500: '#17B26A',
          600: '#079455',
        },
      },
      borderRadius: {
        'none': '0px',
        'xxs': '2px',
        'xs': '4px',
        'sm': '6px',
        'DEFAULT': '8px',
        'md': '8px',
        'lg': '10px',
        'xl': '12px',
        '2xl': '16px',
        '3xl': '20px',
        '4xl': '24px',
        'full': '9999px',
      },
      fontSize: {
        'xs':          ['12px', { lineHeight: '18px' }],
        'sm':          ['14px', { lineHeight: '20px' }],
        'md':          ['16px', { lineHeight: '24px' }],
        'lg':          ['18px', { lineHeight: '28px' }],
        'xl':          ['20px', { lineHeight: '30px' }],
        'display-xs': ['24px', { lineHeight: '32px' }],
        'display-sm': ['30px', { lineHeight: '38px' }],
        'display-md': ['36px', { lineHeight: '44px' }],
        'display-lg': ['48px', { lineHeight: '60px' }],
        'display-xl': ['60px', { lineHeight: '72px' }],
        'display-2xl':['72px', { lineHeight: '90px' }],
      },
      maxWidth: {
        'container': '1280px',
        'prose': '720px',
      },
    },
  },
  plugins: [],
} satisfies Config;
```

---

## globals.css — Per Product (Only Brand Variable Changes)

```css
/* app/globals.css */
/* To use for a new product: replace only the --color-brand-* values. */

:root {
  /* Brand — swap per product */
  --color-brand-50:  #FFF0EF;
  --color-brand-100: #FFE1DF;
  --color-brand-200: #FFBFBA;
  --color-brand-300: #FF9F95;
  --color-brand-400: #FF7764;
  --color-brand-500: #FF4800;  /* PRIMARY */
  --color-brand-600: #CA3700;  /* HOVER */
  --color-brand-700: #9B2800;
  --color-brand-800: #6B1900;
  --color-brand-900: #420C00;

  /* Gray — never changes */
  --color-gray-25:  #FDFDFD;
  --color-gray-50:  #FAFAFA;
  --color-gray-100: #F5F5F5;
  --color-gray-200: #E9EAEB;
  --color-gray-300: #D5D7DA;
  --color-gray-400: #A4A7AE;
  --color-gray-500: #717680;
  --color-gray-600: #535862;
  --color-gray-700: #414651;
  --color-gray-800: #252B37;
  --color-gray-900: #181D27;
  --color-gray-950: #0A0D12;

  /* Semantic — never changes (references brand vars above) */
  --color-bg-primary:        var(--color-gray-25);
  --color-bg-secondary:      var(--color-gray-50);
  --color-bg-tertiary:       var(--color-gray-100);
  --color-bg-brand:          var(--color-brand-500);
  --color-bg-brand-hover:    var(--color-brand-600);
  --color-bg-brand-subtle:   var(--color-brand-50);
  --color-text-primary:      var(--color-gray-900);
  --color-text-secondary:    var(--color-gray-700);
  --color-text-tertiary:     var(--color-gray-600);
  --color-text-muted:        var(--color-gray-500);
  --color-text-brand:        var(--color-brand-500);
  --color-border:            var(--color-gray-300);
  --color-border-subtle:     var(--color-gray-200);
  --color-border-brand:      var(--color-brand-500);
  --color-focus-ring:        var(--color-brand-500);

  /* Status — never changes */
  --color-error:        #D92D20;
  --color-error-bg:     #FEF3F2;
  --color-warning:      #DC6803;
  --color-warning-bg:   #FFFAEB;
  --color-success:      #079455;
  --color-success-bg:   #ECFDF3;

  /* Font — never changes */
  --font-sans: 'Plus Jakarta Sans', sans-serif;
}
```

---

## Component Token Reference — Same Across All Products

### Buttons
| State | Background | Text | Border |
|---|---|---|---|
| Default | `brand-500` | `#FFFFFF` | — |
| Hover | `brand-600` | `#FFFFFF` | — |
| Disabled | `#F5F5F5` | `#A4A7AE` | `#D5D7DA` |
| Focus ring | — | — | `brand-500` 4px |

### Inputs
| State | Background | Border | Text |
|---|---|---|---|
| Default | `#FDFDFD` | `#D5D7DA` | `#181D27` |
| Focus | `#FDFDFD` | `brand-500` | `#181D27` |
| Error | `#FDFDFD` | `#F04438` | `#181D27` |
| Disabled | `#F5F5F5` | `#D5D7DA` | `#717680` |
| Placeholder | — | — | `#717680` |

### Badges
| Type | Background | Text | Border |
|---|---|---|---|
| Gray | `#FAFAFA` | `#414651` | `#E9EAEB` |
| Brand | `brand-50` | `brand-700` | `brand-200` |
| Error | `#FEF3F2` | `#B42318` | `#FECDCA` |
| Warning | `#FFFAEB` | `#B54708` | `#FEDF89` |
| Success | `#ECFDF3` | `#067647` | `#ABEFC6` |

---

## Rules — For Every Agent and Developer

1. **Never hardcode a hex value in any component** — always use a token
2. **The brand scale is the only thing that differs between products** — swap it in `_Primitives` / `tailwind.config.ts` only
3. **Font is always Plus Jakarta Sans** — no exceptions
4. **Default border-radius is `radius-md` (8px)** for all interactive elements
5. **Gray scale, spacing, radius, typography are frozen** — do not modify per product
6. **This system is owned by Pepulux** — it grows as new components are built, never replaced

---

*Pepulux Design System · Built by Pepulux · Used across OmKaarya, PepulHire, and all future products*
*Source: Figma Variables — Primitives, Light mode, Dark mode, Typography, Spacing, Radius, Containers, Widths*
*Last updated: April 2026*
