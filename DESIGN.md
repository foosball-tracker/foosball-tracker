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

## Overview

Foosball Tracker is a SolidJS single-page application for tracking foosball (table football) matches, scores, players, and teams. The visual identity is entirely derived from DaisyUI 5 component classes and Tailwind CSS v4 utility classes. No custom fonts, custom color palettes, or bespoke CSS are used beyond what DaisyUI and Tailwind provide.

The app uses two built-in DaisyUI themes:

- **winter** (light) — the default theme, active when no dark-mode preference is detected.
- **dim** (dark) — activated automatically via `prefers-color-scheme: dark` or toggled manually with the theme switch.

All colours are semantic DaisyUI tokens (`primary`, `base-100`, `error`, etc.), so they adapt automatically when the theme changes. Hard-coded Tailwind colour names (e.g. `bg-red-500`) are avoided to maintain theme compatibility.

## Colors

The colour palette is provided by DaisyUI's winter and dim themes. The hex values below represent the winter (light) theme; the dim (dark) theme provides equivalent semantic tokens with darker base surfaces and lighter accent colours.

### Semantic Roles

- **primary** — Main interactive elements: primary buttons, active navigation links, positive score actions.
- **secondary** — Secondary brand accent, used sparingly for supplementary UI elements.
- **accent** — Tertiary highlight colour for special emphasis.
- **neutral** — Dark, desaturated tone for non-interactive backgrounds and team status indicators (black team).
- **base-100 / base-200 / base-300** — Page surfaces and elevation layers. `base-100` is the card and navbar background, `base-200` is the page background, `base-300` is used for borders and subtle elevation.
- **base-content** — Default text colour on all base surfaces.
- **info / success / warning / error** — Status and feedback colours used in alerts, badges, and destructive actions.

### Team Colours

The game board distinguishes teams using DaisyUI status indicators:

- **Yellow team** — `status-warning` (amber/yellow dot).
- **Black team** — `status-neutral` (dark dot).

These map to the DaisyUI `warning` and `neutral` semantic colours and adapt to both themes.

### Dark Theme

When the dim theme is active, base surfaces shift to dark blue-grey tones (`#2A303C`, `#242933`, `#20252E`), and the primary colour becomes a bright green (`#9FE88D`). All semantic tokens remain consistent; only the underlying values change.

## Typography

The app uses the system font stack provided by Tailwind CSS (`system-ui, -apple-system, sans-serif`). No custom web fonts are loaded.

### Scale

| Token       | Size     | Weight | Usage                                  |
| ----------- | -------- | ------ | -------------------------------------- |
| headline-lg | 1.5rem   | 700    | Card titles (`card-title text-2xl`)    |
| headline-md | 1.25rem  | 700    | Section headings, modal titles         |
| headline-sm | 1.125rem | 700    | Sub-section headings, confirm dialogs  |
| body-md     | 1rem     | 400    | Default body text, form inputs         |
| body-sm     | 0.875rem | 400    | Secondary text, navbar brand on mobile |
| label-md    | 1rem     | 600    | Fieldset legends, bold labels          |
| label-sm    | 0.875rem | 600    | Small labels, badge text               |

### Score Display

The scoreboard uses `text-9xl font-bold` for the score numerals, providing a large, high-contrast display of the current game score.

## Layout

### Page Structure

The app follows a full-height flex column layout:

1. **Navbar** — Sticky top bar with `navbar` component, `bg-base-100/95` with backdrop blur.
2. **Banner** — Optional warning banner (e.g. Supabase not configured).
3. **Content** — Scrollable main area with `bg-base-200`.

### Responsive Breakpoints

The app uses Tailwind's mobile-first responsive prefixes:

- **Default** — Mobile layout (single column, compact spacing).
- **sm (640px)** — Buttons scale from `btn-sm` to `btn-md`, horizontal layouts appear.
- **md (768px)** — Larger text, wider gaps.
- **lg (1024px)** — Desktop navigation replaces the mobile hamburger menu.

### Spacing

Content areas use `px-4 py-2` padding. Cards use `card-body` internal padding. Action groups use `gap-2` for consistent spacing between buttons.

### Max Widths

Cards and content containers use `max-w-3xl` (48rem) to maintain readability on wide screens.

## Elevation & Depth

Elevation is achieved through DaisyUI's shadow utilities and surface colour layering:

- **Cards** — `shadow-sm` for subtle elevation above the `base-200` page background.
- **Modals** — `shadow-xl` for prominent overlay elevation.
- **Navbar** — `shadow-sm` with `backdrop-blur` for a frosted glass effect.
- **Dropdowns** — `shadow-lg` for floating menu content.

The DaisyUI winter and dim themes both set `--depth: 0`, so components do not receive the 3D depth effect by default.

## Shapes

Border radius follows DaisyUI's theme tokens:

| Token | Value   | Usage                                                |
| ----- | ------- | ---------------------------------------------------- |
| sm    | 0.25rem | Currently not standardised                           |
| md    | 0.5rem  | Fields: buttons, inputs, selects (`--radius-field`)  |
| lg    | 1rem    | Boxes: cards, modals, alerts (`--radius-box`)        |
| full  | 9999px  | Circular buttons (`btn-circle`), status dots, badges |

Selector components (checkboxes, toggles, badges) use `--radius-selector: 1rem`.

## Components

### Buttons

Buttons use DaisyUI's `btn` component with the following patterns:

- **Primary action** — `btn btn-primary` (e.g. Start Game, Create Player).
- **Destructive action** — `btn btn-soft btn-error` (e.g. Reset Game, Delete).
- **Secondary/Cancel** — `btn btn-ghost` (e.g. Cancel, Close).
- **Outline** — `btn btn-outline` (e.g. Sign in).
- **Score increment** — `btn btn-circle btn-primary` (+ button).
- **Score decrement** — `btn btn-circle btn-soft` (- button).

Responsive sizing: `btn-sm sm:btn-md` on most action buttons. Minimum widths (`min-w-24`, `min-w-28`, `min-w-40`) ensure consistent button sizing.

### Cards

Content sections use `card card-border border-base-300 bg-base-100 shadow-sm` with `card-body` for internal layout. Card titles use `card-title text-2xl`.

### Forms

- **Fieldsets** — `fieldset` with `fieldset-legend` for labelled input groups.
- **Text inputs** — `input input-bordered w-full`.
- **Selects** — `select select-bordered` via the shared `Select` component.
- **Number inputs** — `input` with type number.

### Alerts

Status messages use DaisyUI alerts:

- `alert alert-error` — Error messages (form validation, delete failures).
- `alert alert-success` — Success confirmations.
- `alert alert-warning` — Configuration warnings (e.g. Supabase not configured).
- `alert alert-info` — Informational messages.

### Modals

Confirmation dialogs use DaisyUI's `modal` with `modal-box` and `modal-action`. The backdrop uses `bg-black/50` for overlay dimming. Delete confirmations use a custom positioned modal with `fixed inset-0 z-50`.

### Tables

Data tables use `@tanstack/solid-table` with a custom `DataTable` component wrapping DaisyUI-styled `Table`, `TableHeader`, `TableBody`, `TableRow`, and `TableCell` primitives.

### Navigation

- **Desktop** — Horizontal `menu menu-horizontal` inside `navbar-center`.
- **Mobile** — Hamburger `dropdown` with `menu menu-sm` inside a `details/summary` element.
- **Active state** — `menu-active` class applied via SolidJS Router's `activeClass`.

### Theme Switch

A `swap swap-rotate` toggle with sun/moon SVG icons. Persists preference to `localStorage`.

### Loading States

`loading loading-spinner loading-xl` for full-page spinners. Inline button spinners use the `Spinner` component during async operations.

### Badges

`badge badge-sm badge-outline` for timestamp labels in the goal history timeline.

### Status Indicators

`status status-lg` dots to identify team colours on the scoreboard (`status-warning` for yellow, `status-neutral` for black).

## Do's and Don'ts

### Do

- Use DaisyUI semantic colour tokens (`bg-primary`, `text-base-content`) for all colours.
- Use responsive button sizing (`btn-sm sm:btn-md`) for touch-friendly mobile layouts.
- Wrap content sections in `card` components with `card-body`.
- Use `alert` components for all user-facing status messages.
- Test both the winter (light) and dim (dark) themes when making UI changes.
- Use `fieldset` and `fieldset-legend` for form field labelling.
- Keep maximum content width at `max-w-3xl` for readability.

### Don't

- Don't use hard-coded Tailwind colour names (e.g. `bg-blue-500`, `text-gray-800`); they won't adapt to theme changes.
- Don't add custom CSS when DaisyUI component classes or Tailwind utilities suffice.
- Don't introduce new border-radius values outside the theme's `--radius-field` (0.5rem) and `--radius-box` (1rem).
- Don't load custom web fonts; the system font stack is intentional.
- Don't remove the `backdrop-blur` from the navbar; it provides visual separation during scroll.
- Don't bypass the `card` component for content sections; it ensures consistent padding, borders, and elevation.
