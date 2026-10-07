---
name: design-md
description: Generate a DESIGN.md design-system file from any website URL (getdesign.md / Google @google/design.md format, plus Motion and 3D sections) so AI coding agents can build UI that matches the site. Trigger on "/design-md <url>", "make a DESIGN.md for <site>", "extract the design system from <url>", "copy the design of <url>".
---

# DESIGN.md from URL

Input: a URL. Optional second argument: output path (default `./DESIGN.md`).

Uses Playwright MCP (`mcp__plugin_playwright_playwright__*`). Load the browser tools in one ToolSearch call first.

## Running the scripts

`extract.js`, `motion.js` and `stack.js` sit next to this file. To run one: Read it, drop the leading comment lines, and pass the remaining arrow function as the `function` argument of `browser_evaluate`. All return JSON. `stack.js` is async (it fetches scripts), which `browser_evaluate` supports.

## Flow

1. **Open.** `browser_navigate` to the URL. `browser_resize` to 1440x900. If a cookie banner covers content, click its accept/close button. If you see a captcha or a "blocked" page, stop. Tell the user and write nothing.
2. **Wait for intro animations.** Wait 3s, then take a screenshot. If the hero looks blank, blurred or half-faded, it is still revealing: wait 2s and take it again. Record the reveal (blur-in, fade-up, stagger) for Motion & Interaction. Run nothing until the hero is fully visible, because values read mid-animation are wrong.
   **Tokens.** Run `extract.js`. Keep the result.
3. **Look.** Take screenshots at desktop width:
   - top of the page
   - middle: `browser_evaluate` `() => scrollTo(0, document.body.scrollHeight / 2)`, wait 800ms
   - bottom: same with `scrollHeight`, wait 800ms

   Note what moves, fades or reveals as you scroll.
4. **Motion.** Run `motion.js` now, after scrolling, so lazy 3D canvases already exist.
   **Stack.** Scroll the whole page first (steps of about 900px, 150ms apart; on one-screen sites use wheel events) so lazy chunks load, then run `stack.js`. It checks page globals, the DOM, loaded resources, CSS, and the text of every loaded script (inline and lazy chunks), and returns:
   - `stack`: libraries by category, each with evidence: **framework/platform** (Next, Nuxt, Astro, SvelteKit, Gatsby, Remix, React, Vue, Angular, Svelte, Framer, Webflow, Wix, Squarespace, Shopify, WordPress, Lovable), **ui-kit/icons** (Tailwind, Radix/shadcn, Headless UI, MUI, Chakra, Mantine, Ant, Bootstrap, Sonner, Lucide, Font Awesome, Phosphor), **3d** (Three.js, React Three Fiber, drei, postprocessing, OGL, Babylon, PlayCanvas, A-Frame, regl, twgl, curtains.js, Spline, model-viewer, COBE, Unicorn Studio, Vanta, raw WebGL), **2d** (PixiJS, p5, Paper, Konva, tsParticles, Rive, Lottie), **animation** (GSAP + Flip/Draggable/MorphSVG/DrawSVG/MotionPath/CustomEase, Framer Motion, anime.js, React Spring, Velocity, Popmotion, AutoAnimate, Theatre.js), **scroll** (ScrollTrigger, ScrollSmoother, Observer, Lenis, Locomotive, smooth-scrollbar, AOS, ScrollReveal, Rellax, CSS scroll-driven), **text** (SplitText, SplitType, Splitting, Typed, ScrambleText), **slider** (Swiper, Splide, Embla, Keen, Glide, Flickity, Slick), **page-transition** (Barba, Swup, Taxi, Highway, View Transitions), **audio** (Howler, Tone), **physics** (Matter, cannon-es, Rapier).
   - `note`: set when WebGL runs without a general 3D engine, meaning hand-written WebGL.
   - `components`: counts of accordion, tabs, dialog, menu, tooltip, carousel, marquee, form, video, iframe, animated SVG, custom cursor, preloader and theme toggle.
   - `shaders` (GLSL source), `scrollTriggers` (trigger/start/end/scrub/pin), `tweens` (GSAP to/from with ease, duration, stagger), `motionProps` (Framer Motion initial/animate/whileInView), `threeObjects` (geometries, materials, loaders, passes used), `assets` (models, HDRs, Rive, Spline, Lottie, video, audio), and `scripts.failed`.

   How to use it:
   - Trust evidence from globals, DOM and resources most. Treat a match found only inside a framework runtime file (e.g. React or Next internals) with care, and confirm it against what the screenshots show.
   - Read the shaders and say in plain words what they do (bend, flare, flutter, rounded-corner SDF, noise, particles, globe). Put the engine, one or two key GLSL lines at most, and the scroll wiring in **3D & Media** and **Scroll Behavior**. Never copy whole shaders into DESIGN.md.
   - Turn `tweens` and `scrollTriggers` into concrete motion specs (for example, "headings split into letters that rise from blur(7px), 0.7s, stagger 0.017s, power2.out, when the top hits 70% of the viewport").
   - If `scripts.failed` is high, cross-origin scripts blocked `fetch`; list that in Known Gaps.
5. **Hover states.** Hover the primary CTA, one card and one nav link with `browser_hover`. After each hover, run `browser_evaluate` on that element (pass it as `target`) with `(el) => { const s = getComputedStyle(el); return { bg: s.backgroundColor, color: s.color, border: s.borderColor, shadow: s.boxShadow, transform: s.transform, opacity: s.opacity }; }`. Compare with the resting values from `extract.js`. Each difference becomes a `-hover` component variant.
6. **Mobile.** `browser_resize` to 390x844, scroll to top, wait 3s (intro animations replay), take one screenshot. Note how the nav collapses and how the type scale and grids change.
7. **More pages.** From the main nav, pick up to 3 internal links (prefer pricing, product/features, docs/blog). For each one, navigate, take one screenshot and run `extract.js`. Use them to find extra components (pricing cards, tabs, tables, FAQ, forms).
8. **Write** the output file with the template below.
9. **Lint.** Run `npx -y @google/design.md lint <path>`. Fix every error. Warnings about `Responsive Behavior`, `Motion & Interaction`, `3D & Media`, `Iteration Guide` or `Known Gaps` are expected (custom sections). Orphaned-token warnings are fine. If `npx` prints nothing (happens in Git Bash on Windows), install it into a temp folder and run it directly: `npm i --no-save @google/design.md` then `node node_modules/@google/design.md/dist/index.js lint <path>`. If there is no Node or no network, say so once and skip this step.
10. **Finish.** `browser_close`. Tell the user the file path, the 3-5 signature traits you found, and the Known Gaps.

### Unusual sites
- **One-screen sites** (`document.body.scrollHeight` equals the viewport height): scrolling is taken over by the page. Move the mouse to the center and use wheel events (`page.mouse.wheel`) instead of `scrollTo`, and take screenshots after each few wheel steps.
- **Hover fails because a canvas covers the page**: hover by mouse position, then read the element under the cursor with `document.elementsFromPoint(x, y)`, skipping `CANVAS`. If computed styles do not change, the effect is drawn in WebGL or JS; record it in Known Gaps.
- **White UI text on a light background** means `mix-blend-mode: difference`. Check `getComputedStyle(el).mixBlendMode` and record the color as it looks on screen (255 − background) plus the blend mode.
- **Preloaders**: if the first screenshot shows only a logo or name, record it as a component, then wait longer (8s or more, mobile included).
- **Onboarding modals or object-based navigation** (rooms, TVs, desktops): capture the modal as a component, step through it, then open at least one "room" and extract it as a sub-theme.
- **Theme toggles**: `page.emulateMedia({ colorScheme: 'dark' })` shows the dark theme; read the `prefers-color-scheme` or `[data-theme]` CSS variables. If a toggle button times out, click it by `[aria-label="..."]` with `{ force: true }`, or read the `[data-theme="light"]` rule straight from the stylesheets.
- **Duplicated letters in button text** ("GGeett  iinn") mean a per-letter text-roll hover effect: record it under Hover & Focus States.
- **Template leftovers** (for example unused shadcn variables like `--primary: 229 84% 39%`): ignore CSS variables that the screenshots do not show.

If a `browser_evaluate` call throws, wait 2s and retry once. If it fails again, continue without that data and record it in Known Gaps.

## Writing rules

- Every hex, size, weight, radius, shadow, duration and easing comes from the extracted data. Never invent values. If a value is missing, leave it out and list it under Known Gaps.
- Collapse near-duplicates into a clean scale. For example, spacing `7px 8px 9px` becomes `8px`. Ignore colors used fewer than 3 times unless they are clearly an accent.
- Color tokens use semantic names: `primary`, `on-primary`, `primary-hover`, `ink`, `ink-muted`, `ink-subtle`, `canvas`, `surface-1..n`, `hairline`, `semantic-success|warning|error`. Use `inverse-*` for a flipped light/dark section.
- Typography tokens: `display-xl/lg/md`, `headline`, `subhead`, `body-lg`, `body`, `body-sm`, `caption`, `button`, `eyebrow`, `mono`. Turn pixel line heights into unitless ratios (64px on 64px becomes `1.0`).
- In `components:`, use token references such as `"{colors.primary}"` and `"{typography.button}"`. Put each state in its own key (`button-primary`, `button-primary-hover`). Allowed properties: `backgroundColor`, `textColor`, `typography`, `rounded`, `padding`, `size`, `height`, `width`.
- See-through colors (`#ffffff @0.08` in the extract output): for component `backgroundColor`, flatten onto the canvas color into an opaque hex (channel = canvas + alpha × (color − canvas)), otherwise the linter's contrast check misfires. Borders may stay see-through as 8-digit hex (`#ffffff14`).
- In prose, cite tokens as `` `{colors.primary}` `` (#5e6ad2) so the reader sees both the name and the value.
- Base Overview, Do's and Don'ts, and Motion descriptions on what the screenshots show. Be concrete ("hairline borders instead of shadows"), not generic ("clean and modern").
- 3D: describe what the scene is, where it sits, how big it is, the engine (from `libraries`) and how it reacts (scroll, cursor, idle loop). Never try to download models or shaders.
- Motion values (durations, easings, keyframes) go in prose only. The spec has no `motion:` token group.

## Template

`examples/linear.app-DESIGN.md` is a finished, lint-clean output. Read it once to see the expected level of detail.

```markdown
---
version: alpha
name: <Site>-design-analysis
description: "<One dense paragraph: canvas color, ink, single accent, display type and tracking, card treatment, signature motif. Hex values inline.>"

colors:
  primary: "#..."
  on-primary: "#..."
  primary-hover: "#..."
  ink: "#..."
  ink-muted: "#..."
  canvas: "#..."
  surface-1: "#..."
  hairline: "#..."

typography:
  display-xl:
    fontFamily: <Font>
    fontSize: 64px
    fontWeight: 510
    lineHeight: 1.0
    letterSpacing: -1.4px
  body:
    fontFamily: <Font>
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  button:
    fontFamily: <Font>
    fontSize: 14px
    fontWeight: 510
    lineHeight: 1.0

rounded:
  sm: 4px
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
  section: 96px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 8px 14px
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  feature-card:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: 24px
  top-nav:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    height: 64px
---

## Overview

<2-4 paragraphs: mood, density, personality, page rhythm, what makes it recognisable.>

**Key Characteristics:**
- ...

## Colors

> Source pages: <list of pages visited>

### Brand & Accent
- **<Descriptive name>** ({colors.primary}): <role>
### Surface
### Text
### Semantic

## Typography

### Font Family
### Hierarchy
| Token | Size | Weight | Line height | Tracking | Use |
|-------|------|--------|-------------|----------|-----|
### Principles
### Note on Font Substitutes
<Open-source fallback if the font is proprietary.>

## Layout

### Spacing System
### Grid & Container
<Max width, columns, gutters.>
### Whitespace Philosophy

## Elevation & Depth

| Level | Treatment | Use |
|-------|-----------|-----|
<Shadows from extract.js, or how hierarchy works without them (surface ladder, hairlines).>
### Decorative Depth

## Shapes

### Border Radius Scale
### Photography & Illustration Geometry

## Components

### Buttons
**`button-primary`**: <description using token refs, plus its hover state>
### Cards & Containers
### Inputs & Forms
### Navigation
### Footer
### <Other site-specific components>

## Do's and Don'ts

### Do
- ...
### Don't
- ...

## Responsive Behavior

### Breakpoints
| Name | Width | Key changes |
|------|-------|-------------|
### Touch Targets
### Collapsing Strategy
### Image Behavior

## Motion & Interaction

### Timing & Easing
| Use | Property | Duration | Easing |
|-----|----------|----------|--------|
<From motion.js transitions, ranked by use.>
### Hover & Focus States
<From the hover diffs: what changes and how fast.>
### Scroll Behavior
<Smooth scroll, snap, sticky elements, scroll reveals seen in the screenshots, libraries (Lenis, GSAP ScrollTrigger, AOS).>
### Ambient Animation
<Looping keyframes: name, what they animate, duration.>
### Reduced Motion
<Does the site have a prefers-reduced-motion rule? Recommended fallback.>

## 3D & Media

<If none: "No 3D or video. Depth comes from <X>." Otherwise, one entry per scene or video:>
- **<Scene name>**: <engine>, <position and size>, <what it shows>, <how it reacts>. Rebuild with <engine/approach>; static fallback: <poster image / gradient>.

## Tech Stack

| Layer | Used | Evidence |
|-------|------|----------|
<One row per stack.js category that has hits: framework/platform, UI kit, 3D, 2D, animation, scroll, text, slider, page transition, audio. Evidence = global, DOM marker or file.>

**How the signature effects are built:**
- **<Effect name>**: <library + technique in 1-3 sentences, with exact config values (ease, duration, stagger, scrub) and key shader idea if any>.

**Rebuild recipe:** <the smallest set of libraries to recreate the look, e.g. "Next.js + Tailwind + GSAP (ScrollTrigger, SplitText) + Lenis + Three.js">.

## Iteration Guide

1. Focus on ONE component at a time and reference it by its `components:` token name.
2. ...
<5-8 site-specific rules, e.g. "Treat <accent> as scarce".>
N. Run `npx @google/design.md lint DESIGN.md` after edits.

## Known Gaps

- <Values not found, proprietary fonts, cross-origin CSS not readable, no light mode, 3D internals not extracted, etc.>
```
