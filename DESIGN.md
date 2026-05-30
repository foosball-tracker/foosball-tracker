---
version: alpha
name: Foosball Tracker
description: Design system for the Foosball Tracker app, built on Tailwind CSS v4 and DaisyUI 5 with the winter (light) and dim (dark) themes.
colors:
  primary: "#0069FF"
  primary-content: "#CEE4FF"
  secondary: "#463AA2"
  secondary-content: "#D5D7EE"
  accent: "#C148AC"
  accent-content: "#0E020B"
  neutral: "#021431"
  neutral-content: "#C5CBD2"
  base-100: "#FFFFFF"
  base-200: "#F2F7FE"
  base-300: "#E3E9F4"
  base-content: "#394E6A"
  info: "#94E7FB"
  success: "#81CFD1"
  warning: "#EFD7BC"
  error: "#E58B8B"
typography:
  body-md:
    fontFamily: system-ui, -apple-system, sans-serif
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: system-ui, -apple-system, sans-serif
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.5
  headline-lg:
    fontFamily: system-ui, -apple-system, sans-serif
    fontSize: 1.5rem
    fontWeight: 700
    lineHeight: 1.3
  headline-md:
    fontFamily: system-ui, -apple-system, sans-serif
    fontSize: 1.25rem
    fontWeight: 700
    lineHeight: 1.3
  headline-sm:
    fontFamily: system-ui, -apple-system, sans-serif
    fontSize: 1.125rem
    fontWeight: 700
    lineHeight: 1.4
  label-md:
    fontFamily: system-ui, -apple-system, sans-serif
    fontSize: 1rem
    fontWeight: 600
    lineHeight: 1.5
  label-sm:
    fontFamily: system-ui, -apple-system, sans-serif
    fontSize: 0.875rem
    fontWeight: 600
    lineHeight: 1.5
rounded:
  sm: 0.25rem
  md: 0.5rem
  lg: 1rem
  full: 9999px
spacing:
  xs: 0.25rem
  sm: 0.5rem
  md: 1rem
  lg: 1.5rem
  xl: 2rem
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-content}"
    rounded: "{rounded.md}"
  button-soft-error:
    backgroundColor: "{colors.base-100}"
    textColor: "{colors.error}"
    rounded: "{rounded.md}"
  button-ghost:
    backgroundColor: "{colors.base-100}"
    textColor: "{colors.base-content}"
    rounded: "{rounded.md}"
  button-outline:
    backgroundColor: "{colors.base-100}"
    textColor: "{colors.base-content}"
    rounded: "{rounded.md}"
  card:
    backgroundColor: "{colors.base-100}"
    rounded: "{rounded.lg}"
  navbar:
    backgroundColor: "{colors.base-100}"
  input:
    backgroundColor: "{colors.base-100}"
    rounded: "{rounded.md}"
  modal:
    backgroundColor: "{colors.base-100}"
    rounded: "{rounded.lg}"
  alert-info:
    backgroundColor: "{colors.info}"
    textColor: "{colors.base-content}"
    rounded: "{rounded.lg}"
  alert-success:
    backgroundColor: "{colors.success}"
    textColor: "{colors.base-content}"
    rounded: "{rounded.lg}"
  alert-warning:
    backgroundColor: "{colors.warning}"
    textColor: "{colors.base-content}"
    rounded: "{rounded.lg}"
  alert-error:
    backgroundColor: "{colors.error}"
    textColor: "{colors.base-content}"
    rounded: "{rounded.lg}"
  status-neutral:
    backgroundColor: "{colors.neutral}"
  status-warning:
    backgroundColor: "{colors.warning}"
  page-background:
    backgroundColor: "{colors.base-200}"
  border-default:
    backgroundColor: "{colors.base-300}"
---

# Design System: Foosball Tracker

## 1. Overview

**Creative North Star: "The Scoreboard with Memory"**

Foosball Tracker is a SolidJS single-page application for tracking foosball matches, scores, players, and teams. The visual identity is entirely derived from DaisyUI 5 component classes and Tailwind CSS v4 utility classes. No custom fonts, custom color palettes, or bespoke CSS exist beyond what DaisyUI and Tailwind provide. The system font stack (`system-ui, -apple-system, sans-serif`) carries every surface: headings, buttons, labels, body, and data.

The app uses two built-in DaisyUI themes: **winter** (light, the default) and **dim** (dark, activated via `prefers-color-scheme: dark` or toggled manually). All colours are semantic DaisyUI tokens (`primary`, `base-100`, `error`, etc.), so they adapt automatically when the theme changes. Hard-coded Tailwind colour names (e.g. `bg-red-500`) are forbidden to maintain theme compatibility.

The layout is a full-height flex column: sticky navbar at top (`bg-base-100/95` with `backdrop-blur`), optional warning banner, scrollable content area (`bg-base-200`). Content containers use `max-w-3xl` (48rem) for readability. Responsive breakpoints follow Tailwind's mobile-first prefixes: `sm` (640px) scales buttons and introduces horizontal layouts, `lg` (1024px) replaces the hamburger menu with desktop navigation.

**Key Characteristics:**

- Zero custom CSS. Every visual decision lives in DaisyUI classes or Tailwind utilities.
- Semantic colour tokens only. No hard-coded hex in component code.
- Both themes are first-class. Every UI change must work in winter and dim.
- Consistency over surprise. Same button shape, same card structure, same form vocabulary on every screen.
- Touch-friendly. Responsive button sizing (`btn-sm sm:btn-md`) and minimum widths for one-handed use.

**The Semantic Colour Rule.** Every colour in component code is a DaisyUI semantic token (`bg-primary`, `text-base-content`, `btn-error`). Hard-coded Tailwind colour names (`bg-blue-500`, `text-gray-800`) are prohibited. They will not adapt to theme changes and will produce unreadable text on dark backgrounds.

## 2. Colors

The palette is provided by DaisyUI's winter (light) and dim (dark) themes. The hex values in the frontmatter represent the winter theme; the dim theme provides equivalent semantic tokens with darker base surfaces and lighter accent colours.

### Primary

- **Electric Blue** (`#0069FF`): Main interactive elements. Primary buttons (Start Game, Create Player), active navigation links, positive score increment buttons (`btn-circle btn-primary`). The primary colour is the single strongest visual signal in the interface; its rarity on any given screen is what makes actionable elements findable.

### Secondary

- **Deep Indigo** (`#463AA2`): Secondary brand accent. Used sparingly for supplementary UI elements. Currently not standardised in component usage.

### Tertiary

- **Orchid Pink** (`#C148AC`): Tertiary highlight colour for special emphasis. Currently not standardised in component usage.

### Neutral

- **Midnight Navy** (`#021431`): Dark, desaturated tone for non-interactive backgrounds and the black team status indicator (`status-neutral`).
- **Cool Slate** (`#C5CBD2`): Text on neutral backgrounds.
- **Pure White** (`#FFFFFF`, `base-100`): Card and navbar background surface.
- **Ice Blue** (`#F2F7FE`, `base-200`): Page background, creating subtle elevation below cards.
- **Pale Steel** (`#E3E9F4`, `base-300`): Borders and subtle elevation separators.
- **Slate Blue** (`#394E6A`, `base-content`): Default text colour on all base surfaces.

### Status

- **Sky Cyan** (`#94E7FB`, `info`): Informational messages and alerts.
- **Soft Teal** (`#81CFD1`, `success`): Success confirmations.
- **Warm Sand** (`#EFD7BC`, `warning`): Caution messages and the yellow team status indicator (`status-warning`).
- **Soft Rose** (`#E58B8B`, `error`): Error messages, destructive actions, delete buttons.

### Named Rules

**The Semantic Colour Rule.** Every colour in component code is a DaisyUI semantic token. Hard-coded Tailwind colour names are prohibited. See Overview.

**The Team Colour Rule.** The game board distinguishes teams using DaisyUI status indicators: yellow team uses `status-warning` (amber dot), black team uses `status-neutral` (dark dot). These map to the DaisyUI `warning` and `neutral` semantic colours and adapt to both themes. No other colours are used to identify teams.

### Dark Theme

When the dim theme is active, base surfaces shift to dark blue-grey tones (`#2A303C`, `#242933`, `#20252E`), and the primary colour becomes a bright green (`#9FE88D`). All semantic tokens remain consistent; only the underlying values change.

## 3. Typography

**Display Font:** System sans-serif stack (`system-ui, -apple-system, sans-serif`).
**Body Font:** System sans-serif stack (same family).
**Mono Font:** Not standardised. Code snippets use browser default monospace.

**Character:** Functional and neutral. The system font stack is intentional: it disappears into the task. No custom web fonts are loaded. Typography hierarchy is conveyed through weight (400 vs 600 vs 700) and size, not through font family contrast.

### Hierarchy

- **Headline LG** (700, 1.5rem / 24px, 1.3 line-height): Card titles via `card-title text-2xl`. The largest heading on any screen.
- **Headline MD** (700, 1.25rem / 20px, 1.3 line-height): Section headings, modal titles (`text-lg font-semibold`).
- **Headline SM** (700, 1.125rem / 18px, 1.4 line-height): Sub-section headings, confirm dialog titles.
- **Body MD** (400, 1rem / 16px, 1.5 line-height): Default body text, form inputs, alert messages.
- **Body SM** (400, 0.875rem / 14px, 1.5 line-height): Secondary text, navbar brand on mobile, truncated email in login state.
- **Label MD** (600, 1rem / 16px, 1.5 line-height): Fieldset legends, bold labels.
- **Label SM** (600, 0.875rem / 14px, 1.5 line-height): Small labels, badge text.

### Score Display

The scoreboard uses `text-9xl font-bold` (8rem / 128px) for score numerals. This is the single largest text element in the app and must be legible at arm's length from the foosball table.

### Named Rules

**The System Font Rule.** No custom web fonts. The system font stack is the entire typography system. Do not load Google Fonts, Adobe Fonts, or any external font resource.

**The Scale Ratio Rule.** Typography hierarchy uses a tight scale ratio (1.125-1.25 between steps). Do not introduce sizes outside the established scale. The gap between body-md (1rem) and headline-lg (1.5rem) is the maximum jump on any screen.

## 4. Elevation

Flat by default. The system conveys depth through surface colour layering (`base-100` cards on `base-200` page background) and subtle shadows that respond to state. The DaisyUI winter and dim themes both set `--depth: 0`, so components do not receive the 3D depth effect.

### Shadow Vocabulary

- **Card shadow** (`shadow-sm`): Subtle elevation for cards above the page background. Applied to all content containers.
- **Navbar shadow** (`shadow-sm` + `backdrop-blur`): Frosted glass effect separating the sticky navbar from scrolling content.
- **Dropdown shadow** (`shadow-lg`): Floating menu content in the mobile hamburger dropdown.
- **Modal shadow** (`shadow-xl`): Prominent overlay elevation for confirmation dialogs. The backdrop uses `bg-black/50` for dimming.

### Named Rules

**The Flat-By-Default Rule.** Surfaces are flat at rest. Shadows appear only as a response to state: cards have `shadow-sm` to separate from the page background, modals have `shadow-xl` to float above the overlay, dropdowns have `shadow-lg` to indicate they are temporary. No decorative shadows. No shadows on buttons.

**The Backdrop Rule.** The navbar uses `backdrop-blur` for visual separation during scroll. Do not remove it. Modals use `bg-black/50` for overlay dimming. No glassmorphism, no frosted glass cards, no decorative blur outside these two cases.

## 5. Components

### Buttons

Tactile and consistent. All buttons use DaisyUI's `btn` component with responsive sizing (`btn-sm sm:btn-md`) for touch-friendly mobile layouts.

- **Shape:** Rounded rectangle (0.5rem radius, `--radius-field`). Circular variant (`btn-circle`) for score increment/decrement.
- **Primary action:** `btn btn-primary`. Start Game, Create Player, Create New Player, Create New Team. The primary colour fills the background.
- **Destructive action:** `btn btn-soft btn-error`. Reset Game, Delete. Soft error background with error-coloured text.
- **Secondary/Cancel:** `btn btn-ghost`. Cancel, Close, Dismiss. Transparent background, text only.
- **Outline:** `btn btn-outline`. Sign in. Transparent background with visible border.
- **Score increment:** `btn btn-circle btn-primary`. The + button on the scoreboard.
- **Score decrement:** `btn btn-circle btn-soft`. The - button on the scoreboard.
- **Minimum widths:** `min-w-24`, `min-w-28`, `min-w-40` ensure consistent sizing across button groups.

### Cards

Content containers with consistent structure. Every content section uses the card component.

- **Shape:** Rounded corners (1rem radius, `--radius-box`).
- **Background:** `bg-base-100` with `card-border border-base-300`.
- **Shadow:** `shadow-sm` for subtle elevation.
- **Internal padding:** `card-body` provides consistent spacing.
- **Title:** `card-title text-2xl` for the heading.
- **Actions:** `card-actions justify-end gap-2` for button groups at the bottom.
- **Max width:** `max-w-3xl` (48rem) for readability on wide screens.

### Forms

Standard DaisyUI form controls with fieldset grouping.

- **Fieldsets:** `fieldset` with `fieldset-legend` for labelled input groups. Every input has a legend.
- **Text inputs:** `input input-bordered w-full`. Full width, visible border.
- **Selects:** `select select-bordered` via the shared `Select` component (`src/components/shared/Select.tsx`).
- **Number inputs:** `input` with `type="number"`.
- **Disabled state:** Inputs accept `disabled` attribute during async operations.

### Alerts

Status messages using DaisyUI alert component.

- **Error:** `alert alert-error`. Form validation failures, delete failures.
- **Success:** `alert alert-success`. Player created successfully.
- **Warning:** `alert alert-warning`. Configuration warnings (Supabase not configured). Uses `rounded-none` for full-width banner.
- **Info:** `alert alert-info`. Informational messages.

### Modals

Confirmation dialogs for destructive actions.

- **Standard modal:** DaisyUI `modal` with `modal-box` and `modal-action`. Triggered via `dialog.showModal()`.
- **Custom positioned modal:** `fixed inset-0 z-50` with `bg-black/50` backdrop for delete confirmations. Contains `bg-base-100 border-base-300 rounded-lg` content box.
- **Backdrop:** `bg-black/50` for overlay dimming. No glassmorphism.

### Tables

Data tables built with `@tanstack/solid-table` and custom DaisyUI-styled primitives.

- **Components:** `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell` in `src/components/shared/table/`.
- **Wrapper:** `DataTable` component (`src/components/shared/table/DataTable.tsx`) handles core row model.
- **Empty state:** "No results." centred text in a tall cell (`h-24 text-center`).

### Navigation

Responsive navigation adapting to screen size.

- **Desktop (lg+):** Horizontal `menu menu-horizontal` inside `navbar-center`. Links: Players, Teams.
- **Mobile (<lg):** Hamburger `dropdown` with `menu menu-sm` inside a `details/summary` element.
- **Active state:** `menu-active` class applied via SolidJS Router's `activeClass` prop.
- **Brand:** `btn btn-ghost` with truncated text, scaling from `text-sm` on mobile to `text-xl` on desktop.

### Theme Switch

A `swap swap-rotate` toggle with sun/moon SVG icons. Persists preference to `localStorage` under the `theme` key. Respects `prefers-color-scheme: dark` on first visit.

### Loading States

- **Full-page:** `loading loading-spinner loading-xl` centred in the content area.
- **Inline button:** `Spinner` component (`src/components/shared/Spinner.tsx`) during async operations. Replaces button text via `Show`/`fallback`.

### Badges

`badge badge-sm badge-outline` for timestamp labels in the goal history timeline.

### Status Indicators

`status status-lg` dots to identify team colours on the scoreboard. `status-warning` for yellow team, `status-neutral` for black team.

### Signature Component: ScoreBoard

The scoreboard is the app's primary interface. Two `TeamScore` components sit side by side (`flex items-center justify-center gap-4`), separated by a bold colon (`text-3xl font-bold`). Each team shows a status dot, team name (line-clamped to 2 lines), the score in `text-9xl font-bold`, and + / - score buttons. The elapsed time displays above in `text-xl` centred text.

## 6. Do's and Don'ts

### Do:

- **Do** use DaisyUI semantic colour tokens (`bg-primary`, `text-base-content`) for every colour in component code.
- **Do** use responsive button sizing (`btn-sm sm:btn-md`) for touch-friendly mobile layouts.
- **Do** wrap content sections in `card` components with `card-body` for consistent padding, borders, and elevation.
- **Do** use `alert` components for all user-facing status messages (error, success, warning, info).
- **Do** test both the winter (light) and dim (dark) themes when making any UI change.
- **Do** use `fieldset` and `fieldset-legend` for form field labelling.
- **Do** keep maximum content width at `max-w-3xl` (48rem) for readability.
- **Do** use the system font stack. No custom web fonts.
- **Do** use `backdrop-blur` on the navbar for visual separation during scroll.
- **Do** use minimum widths (`min-w-24`, `min-w-28`, `min-w-40`) on buttons for consistent sizing.

### Don't:

- **Don't** use hard-coded Tailwind colour names (`bg-blue-500`, `text-gray-800`). They will not adapt to theme changes and will produce unreadable text on dark backgrounds.
- **Don't** add custom CSS when DaisyUI component classes or Tailwind utilities suffice. The goal is zero custom CSS.
- **Don't** introduce new border-radius values outside the theme's `--radius-field` (0.5rem) and `--radius-box` (1rem).
- **Don't** load custom web fonts. The system font stack is intentional and the entire typography system.
- **Don't** remove the `backdrop-blur` from the navbar. It provides visual separation during scroll.
- **Don't** bypass the `card` component for content sections. It ensures consistent padding, borders, and elevation.
- **Don't** use glassmorphism, frosted glass cards, or decorative blur outside the navbar backdrop and modal overlay.
- **Don't** use gradient text (`background-clip: text` with gradient background). Decorative, never meaningful.
- **Don't** use side-stripe borders (`border-left` or `border-right` greater than 1px as a colored accent on cards, list items, or alerts).
- **Don't** add decorative motion that doesn't convey state. Motion conveys state change, feedback, loading, and reveal. Nothing else.
- **Don't** use gamification cliches: XP bars, streak counters, achievement unlocks, "level up" copy.
- **Don't** use arcade-themed or "retro game" styling. The app is a scoreboard with memory, not an arcade cabinet.
