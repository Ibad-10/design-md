# design-md skill: design spec

Date: 2026-10-05
Status: approved in chat, pending written review

## Goal

A personal Claude Code skill. The user gives it a website URL. It writes a `DESIGN.md` that an AI coding agent can use to build UI that matches that site. The output matches the format used by getdesign.md (the Google `@google/design.md` spec, version `alpha`), plus two extra sections for motion and 3D that getdesign.md does not have.

## Non-goals

- No web app, CLI or catalog. Personal use inside Claude Code only.
- No `preview.html` / `preview-dark.html`.
- No recording (GIF / frame strips) of animations. Possible later.
- No extraction of 3D models, shaders or Lottie JSON. Describe them only.

## User interface

The user types either:

```
/design-md https://stripe.com
/design-md https://stripe.com ./docs/DESIGN.md
```

or plain language: "make a DESIGN.md for stripe.com". Default output path is `./DESIGN.md` in the current working directory.

## Files

```
~/.claude/skills/design-md/
  SKILL.md      instructions + output template
  extract.js    static tokens (exists; keep)
  motion.js     motion, interaction, libraries, 3D/media (new)
  docs/         this spec and the plan
```

Each `.js` file is one arrow function `() => {...}` with no imports. The skill passes the file content to Playwright `browser_evaluate`. Each returns plain JSON.

## extract.js (exists)

Returns: page bg/text/font, colors ranked by use (text, background by area, border), fonts, per-tag typography (h1-h4, p, a, li, small, code, nav a, footer), radius, shadows, spacing, sampled buttons / inputs / cards / nav, `:root` CSS variables, media-query breakpoints.

## motion.js (new)

Returns:

- `transitions`: top 10 `transition` values (property + duration + easing) across visible elements, with counts.
- `animations`: elements with `animation-name` not `none`: selector hint, name, duration, easing, iteration count. Max 15.
- `keyframes`: `@keyframes` rules from same-origin stylesheets, name + compact CSS text. Max 10, each cut to 400 chars. Cross-origin sheets skipped.
- `reducedMotion`: true if any `@media (prefers-reduced-motion...)` rule exists.
- `scroll`: `scroll-behavior` on `html`, any `scroll-snap-type`, `position: sticky` element count.
- `libraries`: detected from page globals (`gsap`, `ScrollTrigger`, `THREE`, `lottie`, `bodymovin`, `Lenis`, `AOS`, `Swiper`, `anime`, `Motion`), script `src` URLs, and DOM markers (`[data-framer-name]`, `[data-aos]`, `lottie-player`, `dotlottie-player`). Each entry: name + evidence string.
- `media3d`: each `<canvas>` (size, page position, `webgl`/`webgl2`/`2d`/unknown context, whether it covers the hero), `<spline-viewer>`, `<model-viewer>`, `<video>` with `autoplay` (size, muted, loop), elements with `transform-style: preserve-3d` or `perspective` set (count).

Context detection: probe `getContext('webgl2')`, then `'webgl'`, then `'2d'`. A canvas that already has a context returns it for the same type and `null` for other types, so the probe is safe for canvases the page has set up. A canvas with no context gets a new one, which can break a page that sets it up later. So the skill runs `motion.js` only after the scroll screenshots, when lazy canvases are already set up.

## Skill flow (SKILL.md)

1. Open URL with Playwright MCP. Resize 1440x900. Dismiss cookie banner if it blocks content.
2. Run `extract.js` via `browser_evaluate`.
3. Screenshots: top, middle and bottom of page at desktop width (scroll with `window.scrollTo`, wait 800ms for scroll animations).
4. Run `motion.js` (after scrolling, so lazy canvases exist). Then hover states: hover the primary CTA, one card and one nav link with `browser_hover`. After each hover, read computed styles of that element (bg, color, border, shadow, transform). Compare with resting values. Then resize 390x844 and take one mobile screenshot.
5. Extra pages: pick up to 3 links from the main nav (prefer pricing, product/features, docs/blog). For each, navigate and run `extract.js` only. Use them to find more components.
6. Write `DESIGN.md` using the template (below).
7. Lint: `npx -y @google/design.md lint <path>`. Fix errors. Warnings about unknown sections are fine. If `npx` fails (no network / no Node), say so and skip.
8. Close browser. Tell the user the path and list what is in Known Gaps.

## Output format

YAML front matter, then markdown sections in this order:

1. Overview
2. Colors
3. Typography
4. Layout
5. Elevation & Depth
6. Shapes
7. Components
8. Do's and Don'ts
9. Responsive Behavior
10. Motion & Interaction (new)
11. 3D & Media (new)
12. Iteration Guide
13. Known Gaps

Sections 1-8 follow the Google spec order. 9, 12, 13 match getdesign.md. 10 and 11 are allowed by the spec rule "unknown section heading: preserve, do not error".

Front matter keys: `version: alpha`, `name`, `description` (one dense paragraph), `colors`, `typography`, `rounded`, `spacing`, `components`. Motion values stay in prose: a `motion:` token group is not in the spec.

Rules for writing:

- Every hex, size, radius, shadow, duration, easing comes from extracted data. No invented values.
- Semantic token names (`primary`, `ink`, `canvas`, `surface-1`, `hairline`, `display-xl`, `body`, `button`).
- Components use token references (`"{colors.primary}"`) and include hover/pressed variants as separate keys when hover data exists.
- Prose cites tokens as `` `{colors.primary}` `` (#hex).
- Near-duplicate values collapse into a clean scale.
- Anything not found goes in Known Gaps (proprietary fonts, no light mode, cross-origin CSS, 3D internals).

## Error handling

- Site blocks the headless browser or shows a captcha: stop, tell the user, write nothing.
- `browser_evaluate` throws: retry once after 2s wait; if it fails again, continue with the data you have and note it in Known Gaps.
- No extra pages found: homepage only, note it.

## Testing

- Manual: run the skill on 2 sites with different styles: `linear.app` (dark, minimal motion) and one heavy-motion/3D site (e.g. `spline.design` or `lusion.co`). Check:
  - `motion.js` returns JSON without throwing on both.
  - The 3D site reports a canvas with WebGL and at least one library.
  - The output passes `npx @google/design.md lint` with no errors.
