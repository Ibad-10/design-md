---
version: alpha
name: Linear-design-analysis
description: "A near-black product canvas (#08090a) with charcoal panels (#0f1011), light gray ink (#f7f8f8) and a three-step gray text ladder (#d0d6e0, #8a8f98, #62666d). Display type is Inter Variable at the unusual weight 510 with tight negative tracking (-1.4px at 64px). The only chromatic UI accent is lavender (#5e6ad2); the main CTA is a light-gray pill (#e5e5e6) that brightens to white on hover. Borders are 8% white hairlines, not shadows. Pills (9999px) for nav and buttons, 8-12px for panels. Motion is fast and quiet: 100-160ms color and filter transitions on an ease-out-quad curve, a blur-in hero reveal, and pixel-grid dot animations in product illustrations."

colors:
  primary: "#5e6ad2"
  on-primary: "#ffffff"
  cta: "#e5e5e6"
  cta-hover: "#ffffff"
  on-cta: "#08090a"
  ink: "#f7f8f8"
  ink-muted: "#d0d6e0"
  ink-subtle: "#8a8f98"
  ink-tertiary: "#62666d"
  canvas: "#08090a"
  surface-1: "#0f1011"
  surface-2: "#161718"
  surface-hover: "#1c1d1e"
  hairline: "#ffffff14"
  hairline-strong: "#ffffff1f"
  hairline-solid: "#23252a"
  highlight: "#e4f222"
  semantic-success: "#27a644"
  semantic-error: "#f34e52"
  label-pink: "#f79ce0"
  label-orange: "#f7bf8b"
  label-yellow: "#ffdf9f"
  label-teal: "#83dcdc"
  label-blue: "#8fa6ff"

typography:
  display-xl:
    fontFamily: Inter Variable
    fontSize: 72px
    fontWeight: 510
    lineHeight: 1.0
    letterSpacing: -1.58px
  display-lg:
    fontFamily: Inter Variable
    fontSize: 64px
    fontWeight: 510
    lineHeight: 1.0
    letterSpacing: -1.408px
  display-md:
    fontFamily: Inter Variable
    fontSize: 48px
    fontWeight: 510
    lineHeight: 1.0
    letterSpacing: -1.056px
  headline:
    fontFamily: Inter Variable
    fontSize: 24px
    fontWeight: 590
    lineHeight: 1.33
  subhead:
    fontFamily: Inter Variable
    fontSize: 20px
    fontWeight: 590
    lineHeight: 1.33
    letterSpacing: -0.24px
  body-lg:
    fontFamily: Inter Variable
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: Inter Variable
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: -0.165px
  body-sm:
    fontFamily: Inter Variable
    fontSize: 14px
    fontWeight: 510
    lineHeight: 1.5
  caption:
    fontFamily: Inter Variable
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.5
  button:
    fontFamily: Inter Variable
    fontSize: 16px
    fontWeight: 510
    lineHeight: 1.0
  mono:
    fontFamily: Berkeley Mono
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.67
    letterSpacing: -0.182px

rounded:
  xs: 4px
  sm: 6px
  md: 8px
  lg: 12px
  pill: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px

components:
  button-primary:
    backgroundColor: "{colors.cta}"
    textColor: "{colors.on-cta}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: 0px 20px
    height: 44px
  button-primary-hover:
    backgroundColor: "{colors.cta-hover}"
  button-secondary:
    backgroundColor: "{colors.surface-hover}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: 0px 20px
    height: 44px
  nav-link:
    textColor: "{colors.ink-subtle}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: 0px 12px
    height: 32px
  nav-link-hover:
    backgroundColor: "{colors.surface-hover}"
    textColor: "{colors.ink}"
  panel:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: 12px
  issue-card:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: 11px
  code-chip:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink-muted}"
    typography: "{typography.mono}"
    rounded: "{rounded.xs}"
  top-nav:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    height: 72px
---

## Overview

Linear's marketing site is a dark frame for its own product. The canvas `{colors.canvas}` (#08090a) is almost black. The hero is a short, very large headline over one line of muted body copy, followed by a full-width, high-fidelity mock of the app (sidebar, issue view, activity feed) in `{colors.surface-1}` panels. The chrome is minimal so the product UI does the talking.

Hierarchy comes from a gray text ladder, not from color. Headlines are `{colors.ink}` (#f7f8f8); section headings drop to `{colors.ink-subtle}` (#8a8f98) for a two-tone "statement, then muted continuation" effect; metadata is `{colors.ink-tertiary}` (#62666d). Chromatic color appears only inside product illustrations (status icons, labels) and as the lavender `{colors.primary}`.

The type is Inter Variable at weight 510 (between regular and medium) with tight negative tracking. It reads precise and engineered rather than bold.

**Key Characteristics:**
- Near-black canvas with a charcoal surface ladder (#08090a, #0f1011, #161718).
- Two-tone headings: white statement plus gray continuation.
- Inter Variable 510 for display, 590 for small headings: non-standard weights are part of the look.
- Light-gray pill CTA (`{colors.cta}`), not a colored one.
- 8% white hairlines instead of drop shadows.
- Pills for nav and buttons, 6-12px corners for panels and cards.
- Fast, quiet motion: 100-160ms transitions, blur-in reveals.

## Colors

> Source pages: linear.app (home), linear.app/pricing.

### Brand & Accent
- **Lavender** ({colors.primary}): brand accent. Used on small, intentional areas: brand moments, highlights in pricing, focus.
- **Signal Lime** ({colors.highlight}): rare highlight inside product illustrations.

### Surface
- **Canvas** ({colors.canvas}): page background (#08090a).
- **Surface 1** ({colors.surface-1}): app panels and large containers (#0f1011). By area, the most used background.
- **Surface 2** ({colors.surface-2}): nested cards inside panels (#161718).
- **Surface Hover** ({colors.surface-hover}): 8% white wash for hovered nav links and the secondary button.
- **Hairline** ({colors.hairline}): default 1px border, 8% white. **Hairline Strong** ({colors.hairline-strong}) is 12% white. **Hairline Solid** ({colors.hairline-solid}, #23252a) is used where an opaque border is needed.

### Text
- **Ink** ({colors.ink}): headlines, primary text.
- **Ink Muted** ({colors.ink-muted}): card titles, sub-headings (#d0d6e0).
- **Ink Subtle** ({colors.ink-subtle}): body copy, nav links, second half of headings (#8a8f98). The most used text color.
- **Ink Tertiary** ({colors.ink-tertiary}): timestamps and metadata (#62666d).

### Semantic
- **Success** ({colors.semantic-success}) and **Error** ({colors.semantic-error}) appear as tinted backgrounds (7-10% opacity), not solid fills.
- Product label colors (pink, orange, yellow, teal, blue) appear only as text inside product mocks.

## Typography

### Font Family
- Primary: **Inter Variable**, fallback `"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`.
- Mono: **Berkeley Mono**, fallback `ui-monospace, "SF Mono", Menlo, monospace`.

### Hierarchy
| Token | Size | Weight | Line height | Tracking | Use |
|-------|------|--------|-------------|----------|-----|
| display-xl | 72px | 510 | 1.0 | -1.58px (est.) | pricing hero statement |
| display-lg | 64px | 510 | 1.0 | -1.408px | home hero h1 |
| display-md | 48px | 510 | 1.0 | -1.056px | section headings (h2) |
| headline | 24px | 590 | 1.33 | — | pricing plan names |
| subhead | 20px | 590 | 1.33 | -0.24px | card titles (h3) |
| body-lg | 16px | 400 | 1.5 | — | lists, footer |
| body | 15px | 400 | 1.6 | -0.165px | paragraphs |
| body-sm | 14px | 510 | 1.5 | — | inline links |
| caption | 13px | 400 | 1.5 | — | nav links |
| button | 16px | 510 | 1.0 | — | large pill buttons |
| mono | 12px | 400 | 1.67 | -0.182px | code chips |

### Principles
- Tracking is about -2.2% of font size at display sizes (-1.408px at 64px, -1.056px at 48px) and goes to 0 for 16px and below.
- Display line height is 1.0. Text is set solid.
- Use 510 and 590 weights. Avoid 700.

### Note on Font Substitutes
Inter Variable is free (Google Fonts / rsms.me). Berkeley Mono is commercial; JetBrains Mono or Geist Mono are acceptable substitutes.

## Layout

### Spacing System
Base unit 4px. Most used values: 8px, 6px, 4px, 32px, 12px. Scale: 4, 8, 12, 16, 24, 32. Section gaps are large (not captured as tokens; see Known Gaps).

### Grid & Container
Content aligns to a wide container of about 1300px (hero copy and app mock share the left edge at about 77px on a 1440px viewport). The app mock spans the full container.

### Whitespace Philosophy
Generous space around the hero headline; dense, realistic UI inside the product mock. The contrast between airy marketing and dense product is intentional.

## Elevation & Depth

| Level | Treatment | Use |
|-------|-----------|-----|
| 0 | `{colors.canvas}` | page |
| 1 | `{colors.surface-1}` + 1px `{colors.hairline}` | panels, app mock |
| 2 | `{colors.surface-2}` + 1px 6% white border | nested cards |
| Inset edge | `rgba(255,255,255,0.08) 0 0 0 0.5px inset` | crisp inner edge on panels |
| Inner shade | `rgba(0,0,0,0.2) 0 0 12px 0 inset` | recessed areas |
| Float | `rgba(0,0,0,0.25) 0 2px 32px 0` | floating menus |

### Decorative Depth
Depth comes from stacking surfaces plus hairlines. The CTA uses a five-layer, very soft shadow stack (max 8% black) that is nearly invisible.

## Shapes

### Border Radius Scale
- `{rounded.pill}` 9999px: nav links, buttons, toggles, avatars (most used radius).
- `{rounded.lg}` 12px: large panels. `12px 12px 0 0` for panels attached to an edge.
- `{rounded.md}` 8px / 9px: cards in the product mock.
- `{rounded.sm}` 6px and `{rounded.xs}` 4px: small cards, chips.

### Photography & Illustration Geometry
No photography on the home page. Illustrations are product UI mocks and pixel-grid dot animations.

## Components

### Buttons
**`button-primary`**: light-gray pill (`{colors.cta}` #e5e5e6), dark text `{colors.on-cta}`, 44px high, 20px side padding, `{typography.button}`. Hover: background goes to pure white (`button-primary-hover`). The nav version ("Sign up") is smaller and uses the same colors.
**`button-secondary`**: 5-8% white wash, `{colors.ink}` text, same pill shape, with a layered inset highlight (`rgba(255,255,255,0.03) 0 0 0 1px inset, rgba(255,255,255,0.04) 0 1px 0 inset`).

### Cards & Containers
**`panel`**: `{colors.surface-1}`, 1px hairline, 9-12px corners.
**`issue-card`**: `{colors.surface-2}`, 6% white border, 6px corners, 11px padding.
**Pricing cards**: no background, separated by space and hairlines, 32px side padding, plan name in `{typography.headline}`.

### Inputs & Forms
Not visible on the inspected pages (see Known Gaps).

### Navigation
**`top-nav`**: 72px high, canvas background, hairline bottom border. Logo left; centered link group; "Log in" text link and "Sign up" pill right. **`nav-link`**: `{typography.caption}` in `{colors.ink-subtle}`, pill-shaped hit area 32px high. Hover: 8% white pill wash and text goes to `{colors.ink}`.

### Footer
Dense multi-column link list, `{typography.body-lg}`, on canvas.

### Code Chip
**`code-chip`**: inline mono text in a `{colors.surface-2}` chip with a hairline border, e.g. `vehicle_state` in issue descriptions.

## Do's and Don'ts

### Do
- Use the gray ladder for hierarchy before reaching for color.
- Split headlines into a white statement and a gray continuation.
- Use 8% white hairlines to separate surfaces.
- Keep CTAs as light-gray pills on dark.
- Show real-looking product UI as the main visual.

### Don't
- Don't use drop shadows to lift cards.
- Don't use saturated color for large areas. Accents stay small.
- Don't use bold (700) weights or positive tracking on headings.
- Don't mix pill buttons with square buttons.
- Don't use slow or bouncy motion.

## Responsive Behavior

### Breakpoints
| Name | Width | Key changes |
|------|-------|-------------|
| sm | 600-640px | single column |
| md | 768px | nav links collapse |
| lg | 1024px | multi-column grids return |
| xl | 1280px | full container width |

### Touch Targets
Pills are 32px high in the desktop nav and 44px for main buttons. On mobile, "Sign up" stays a pill of about 32px.

### Collapsing Strategy
At 390px: the nav keeps the logo, "Log in", the "Sign up" pill and a hamburger icon. The hero headline wraps to 4 lines at a smaller size. The product mock is cropped rather than scaled.

### Image Behavior
The product mock stays at high fidelity and is cropped at the viewport edge on small screens.

## Motion & Interaction

### Timing & Easing
| Use | Property | Duration | Easing |
|-----|----------|----------|--------|
| Text and link color | color | 100ms | cubic-bezier(0.25, 0.46, 0.45, 0.94) |
| Blur and reveal | filter | 160ms | cubic-bezier(0.25, 0.46, 0.45, 0.94) |
| Small movement | transform | 160ms | cubic-bezier(0.25, 0.46, 0.45, 0.94) |
| Background washes | background | 400ms | ease-out |
| Large panel movement | transform, stroke | 700ms | cubic-bezier(0.32, 0.72, 0, 1) |

The house curve is cubic-bezier(0.25, 0.46, 0.45, 0.94) (ease-out-quad). Large movements use a strong ease-out, cubic-bezier(0.32, 0.72, 0, 1).

### Hover & Focus States
- Nav link: text #8a8f98 to #f7f8f8 and an 8% white pill appears, 100ms.
- Primary CTA: background #e5e5e6 to #ffffff; shadow and transform unchanged.

### Scroll Behavior
- Native scroll (no smooth-scroll library).
- Hero headline, subcopy and product mock reveal from blur to sharp on load (about 1.5-3s total).
- A horizontal scroll-snap row (`x mandatory`) carries a carousel section.

### Ambient Animation
- Logo marquee: 30s linear infinite horizontal scroll.
- Pixel-grid dot illustrations: three animation families (`upDown` 2.8s, `pong` 1.6s, `agent` 3.2s), each about 50 dots, `steps(1)` opacity changes between 0.3 and 1. They read as LED-matrix animations.
- Cursor blink: 1.25s ease.
- Agent label sweep: 2s linear shimmer across a label.

### Reduced Motion
The site has `prefers-reduced-motion` rules. When rebuilding, stop the marquee and dot grids and show content without the blur-in.

## 3D & Media

No WebGL, video or 3D scenes. Depth comes from the surface ladder and hairlines. Two elements use CSS `perspective` / `preserve-3d` for subtle tilt in illustrations.

## Iteration Guide

1. Focus on ONE component at a time and reference it by its `components:` token name.
2. Start every surface on `{colors.canvas}` and lift with `{colors.surface-1}`, then `{colors.surface-2}`.
3. Use `{typography.display-lg}` or `{typography.display-md}` with ink, plus a gray continuation, for section openers.
4. Keep `{colors.primary}` scarce: brand moments and focus only.
5. All transitions 100-160ms on cubic-bezier(0.25, 0.46, 0.45, 0.94) unless the element moves a large distance.
6. Lead each section with a product UI mock, not an illustration.
7. Run `npx @google/design.md lint DESIGN.md` after edits.

## Known Gaps

- `display-xl` tracking is estimated from the 64px ratio (only size and weight were extracted on /pricing).
- Section vertical spacing (gaps between page sections) was not captured as a token.
- Inputs and form styles were not visible on the inspected pages.
- Focus ring style was not captured (hover only).
- Lavender `{colors.primary}` usage was found by area, not by element: confirm where it appears before relying on it.
- Light mode is not documented; the marketing site does not show one.
- Berkeley Mono is a commercial font.
