# design-md skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A Claude Code skill that turns a website URL into a getdesign.md-style `DESIGN.md` with extra Motion and 3D sections.

**Architecture:** Two in-page extractor scripts (`extract.js`, `motion.js`) run through Playwright MCP `browser_evaluate`. `SKILL.md` drives the browser flow and holds the output template. Claude writes the file, then lints it with `@google/design.md`.

**Tech Stack:** Plain browser JavaScript (no imports), Playwright MCP, `npx @google/design.md` 0.4.x linter.

**Spec:** `docs/2026-10-05-design-md-skill-design.md`

## Global Constraints

- Skill dir: `~/.claude/skills/design-md/`. Not a git repo: no commit steps.
- Each `.js` file is exactly one arrow function `() => {...}`, no imports, returns plain JSON.
- Output section order: Overview, Colors, Typography, Layout, Elevation & Depth, Shapes, Components, Do's and Don'ts, Responsive Behavior, Motion & Interaction, 3D & Media, Iteration Guide, Known Gaps.
- Front matter: `version: alpha`, `name`, `description`, `colors`, `typography`, `rounded`, `spacing`, `components`. No `motion:` group.
- No invented values. Missing data goes to Known Gaps.
- `motion.js` runs only after scroll screenshots.

## Review Focus

1. Cross-origin stylesheets (most real sites use a CDN): `cssRules` throws; scripts must skip, not crash. Fixture links one cross-origin sheet.
2. Canvas with an existing WebGL context: probe must report `webgl`, not create a second context. Fixture creates a WebGL canvas.
3. Page with zero motion: `motion.js` returns empty arrays, not errors. Checked on `example.com`.
4. Huge DOMs (10k+ nodes): scripts cap element scans at 4000.
5. Lint fails because `npx` is missing or offline: skill reports and continues, does not loop.

---

### Task 1: motion.js + fixture test

**Files:**
- Create: `motion.js`
- Create: `test/fixture.html`

**Interfaces:**
- Produces: `motion.js` returns `{ transitions, animations, keyframes, reducedMotion, scroll, libraries, media3d }`, where `transitions`: `[value, count][]`; `animations`: `{el, name, duration, easing, iterations}[]`; `keyframes`: `{name, css}[]`; `reducedMotion`: boolean; `scroll`: `{behavior, snap, sticky}`; `libraries`: `{name, evidence}[]`; `media3d`: `{canvases: {w,h,top,left,context,hero}[], spline, modelViewer, videos: {w,h,muted,loop}[], preserve3d}`.

- [ ] **Step 1: Write fixture** `test/fixture.html` with: a button with `transition: background-color .2s ease`, a `@keyframes spin` rule used by one element, a `prefers-reduced-motion` media rule, `scroll-behavior: smooth`, a sticky header, a 600x400 WebGL canvas at top, an autoplay muted looping `<video>`, `window.gsap = {}` stub, one `[data-aos]` element, one cross-origin stylesheet link.
- [ ] **Step 2: Run** `motion.js` against the fixture (before it exists the evaluate fails). Expected: FAIL.
- [ ] **Step 3: Write `motion.js`** per the spec's motion.js section.
- [ ] **Step 4: Run again with an assert wrapper** that checks: `transitions` contains `0.2s`; `animations[0].name === 'spin'`; `keyframes` has `spin`; `reducedMotion === true`; `scroll.behavior === 'smooth'`; `scroll.sticky >= 1`; `libraries` names include `GSAP` and `AOS`; `media3d.canvases[0].context` is `webgl` or `webgl2`; `media3d.videos.length === 1`. Expected: all true.
- [ ] **Step 5: Run on `https://example.com`.** Expected: no throw, empty arrays.

### Task 2: SKILL.md rewrite

**Files:**
- Modify: `SKILL.md` (full rewrite)

**Interfaces:**
- Consumes: `extract.js` output (existing), `motion.js` output (Task 1).

- [ ] **Step 1:** Rewrite `SKILL.md`: front matter (name, description with trigger phrases), usage, the 8-step flow from the spec, writing rules, error handling, and a full output template with YAML front matter and the 13 sections.
- [ ] **Step 2:** Re-test `extract.js` CSS variable fix on `linear.app`: expected `cssVariables` non-empty or the site truly has none at `:root`.

### Task 3: End-to-end run + lint

- [ ] **Step 1:** Run the skill on `linear.app`, write output to scratchpad `linear-DESIGN.md`.
- [ ] **Step 2:** `npx -y @google/design.md lint <file>`. Expected: 0 errors.
- [ ] **Step 3:** Run `motion.js` on a 3D-heavy site (`spline.design`). Expected: at least one canvas with WebGL, at least one library.
