# design-md

A Claude Code skill that turns any website into a `DESIGN.md` file.

Give it a URL. It opens the site in a real browser, measures the design, and writes a design-system file that an AI coding agent can follow to build UI that looks and moves like that site.

```
/design-md https://linear.app
```

The output uses the [`@google/design.md`](https://www.npmjs.com/package/@google/design.md) format (the same format as getdesign.md), plus extra sections the standard format does not have: **Motion & Interaction**, **3D & Media** and **Tech Stack**.

See a full example: [`skills/design-md/examples/linear.app-DESIGN.md`](skills/design-md/examples/linear.app-DESIGN.md).

---

## Why

Telling an AI "make it look like Stripe" gives you a guess. A `DESIGN.md` gives it the real numbers: exact hex colors, font sizes, weights, letter spacing, radii, spacing scale, shadows, hover states, transition timings, easing curves, scroll effects and the libraries the site uses. Drop the file into your project and the agent builds against it.

## What you get

A single `DESIGN.md` with:

- **YAML front matter** with design tokens: `colors`, `typography`, `rounded`, `spacing`, `components` (including `-hover` variants). Components reference tokens, e.g. `"{colors.primary}"`.
- **Overview**: the mood, density and signature traits of the site.
- **Colors, Typography, Layout, Elevation & Depth, Shapes, Components**: each token explained with its role.
- **Do's and Don'ts**: concrete rules taken from what the site actually does.
- **Responsive Behavior**: breakpoints and how the layout changes on mobile.
- **Motion & Interaction**: transition durations and easings, hover diffs, scroll reveals, looping animations, reduced-motion support.
- **3D & Media**: WebGL canvases, Spline/model-viewer scenes, autoplay video, what they show and how they react.
- **Tech Stack**: detected framework, UI kit, animation, scroll, 3D, slider and page-transition libraries, with evidence, plus a short "rebuild recipe".
- **Iteration Guide** and **Known Gaps**: how to use the file, and what could not be measured.

Every value comes from the live page. Nothing is invented. Anything missing is listed under Known Gaps.

## Requirements

- [Claude Code](https://claude.com/claude-code)
- The **Playwright MCP** server, which the skill uses to drive the browser. Install it as a plugin (`/plugin` and search for `playwright`) or add it with:
  ```
  claude mcp add playwright npx @playwright/mcp@latest
  ```
- **Node.js** (optional), used to lint the output with `npx @google/design.md lint`. Without Node the skill skips the lint step.

## Install

### Option 1: as a plugin (recommended)

Inside Claude Code:

```
/plugin marketplace add Ibad-10/design-md
/plugin install design-md@design-md
```

Restart Claude Code if the skill does not show up.

### Option 2: as a plain skill

Copy the skill folder into your personal skills directory:

```bash
git clone https://github.com/Ibad-10/design-md.git
cp -r design-md/skills/design-md ~/.claude/skills/design-md
```

On Windows (PowerShell):

```powershell
git clone https://github.com/Ibad-10/design-md.git
Copy-Item -Recurse design-md\skills\design-md "$env:USERPROFILE\.claude\skills\design-md"
```

To use it in one project only, copy it to `<project>/.claude/skills/design-md` instead.

## Usage

Any of these works:

```
/design-md https://stripe.com
/design-md https://stripe.com ./docs/DESIGN.md
make a DESIGN.md for vercel.com
extract the design system from https://linear.app
copy the design of https://framer.com
```

The second argument is the output path. The default is `./DESIGN.md`.

(When installed as a plugin, the command may appear as `/design-md:design-md`. Plain language works either way.)

Then point your agent at the file, for example: *"Build a pricing page using DESIGN.md. Use only its tokens."*

## How it works

The skill is a set of instructions (`SKILL.md`) plus three small JavaScript functions that Claude runs inside the page through Playwright's `browser_evaluate`.

```
skills/design-md/
  SKILL.md        the step-by-step flow, writing rules and the output template
  extract.js      static design tokens
  motion.js       transitions, animations, scroll and 3D/media
  stack.js        front-end stack and effect detection
  examples/       a finished, lint-clean DESIGN.md (linear.app)
  test/           a fixture page and a self-check for motion.js and stack.js
  docs/           the original design spec and implementation plan
```

### The flow

1. **Open** the URL at 1440x900. Close cookie banners. If a captcha or block page appears, stop and write nothing.
2. **Wait for intro animations** to finish so values are not read mid-fade. Then run `extract.js`.
3. **Look**: screenshots at the top, middle and bottom of the page. Note what moves or reveals on scroll.
4. **Motion and stack**: scroll the whole page so lazy content loads, then run `motion.js` and `stack.js`.
5. **Hover states**: hover the main button, a card and a nav link. Compare computed styles before and after. Each difference becomes a `-hover` component.
6. **Mobile**: resize to 390x844 and take a screenshot to see how nav, type and grids collapse.
7. **More pages**: visit up to 3 pages from the main nav (pricing, product, docs or blog) to find more components such as pricing cards, tabs, tables and FAQs.
8. **Write** `DESIGN.md` from the template in `SKILL.md`.
9. **Lint** with `npx -y @google/design.md lint` and fix every error.
10. **Report** the file path, the 3-5 signature traits and the known gaps.

`SKILL.md` also covers unusual sites: one-screen sites that hijack scrolling, canvases that block hover, `mix-blend-mode: difference` text, preloaders, onboarding modals, dark/light theme toggles and per-letter text-roll hovers.

### The extractor scripts

Each script is one arrow function with no imports that returns plain JSON.

**`extract.js`** reads up to 4000 visible elements and returns:
- colors ranked by use (text, background weighted by area, borders), as hex, with alpha where present
- fonts, and type styles for `h1`-`h4`, `p`, `a`, `li`, `small`, `code`, nav links and footer
- border radii, box shadows and spacing values ranked by frequency
- sample buttons, inputs, cards and nav bars with their computed styles
- `:root` CSS variables and media-query breakpoints

**`motion.js`** returns:
- the most used `transition` values (property, duration, easing)
- running CSS animations and `@keyframes` rules (numbered duplicates merged)
- whether a `prefers-reduced-motion` rule exists
- `scroll-behavior`, scroll snap and sticky element count
- canvases with their context type (`webgl2`, `webgl`, `2d`), size and position, plus Spline, model-viewer, autoplay video and CSS 3D usage

**`stack.js`** (async) detects about 100 libraries by checking page globals, DOM markers, loaded resource URLs, CSS, and the source text of every loaded script, lazy chunks included. Categories: framework/platform, UI kit and icons, 3D, 2D, animation, scroll, text, slider, page transition, audio and physics. It also pulls out:
- GLSL shader source, which Claude describes in plain words (never copied in full)
- GSAP `scrollTrigger` configs and tweens (ease, duration, stagger)
- Framer Motion props (`initial`, `animate`, `whileInView`)
- Three.js geometries, materials, loaders and passes
- 3D models, HDRs, Rive, Lottie, video and audio assets
- counts of UI patterns: accordions, tabs, dialogs, carousels, marquees, custom cursors, preloaders, theme toggles

Claude then turns this raw data into concrete specs, for example: *"headings split into letters that rise from blur(7px), 0.7s, stagger 0.017s, power2.out, when the top hits 70% of the viewport."*

## Testing the scripts

`test/fixture.html` is a small page with known transitions, keyframes, a sticky header, a WebGL canvas, a video, a GSAP stub and an AOS element.

1. In `skills/design-md`, start a server: `python -m http.server 8766`
2. In Claude Code, ask Claude to run `test/run-fixture.js` with the Playwright `browser_run_code_unsafe` tool.
3. Expect `allPass: true`.

## Limits

- Sites that block headless browsers or show a captcha cannot be read.
- Cross-origin stylesheets and scripts cannot always be read, so some CSS variables, keyframes or libraries may be missed. These are listed under Known Gaps.
- Effects drawn in WebGL or JS (not CSS) are described from screenshots, not measured.
- Proprietary fonts are named, with an open-source substitute suggested.
- The file describes a design. Respect the original site's brand and copyright when you use it.

## License

MIT. See [LICENSE](LICENSE).
