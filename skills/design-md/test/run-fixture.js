// Self-check for motion.js and stack.js. Needs: `python -m http.server 8766` in the skill folder.
// Paste this file's function as the `code` of Playwright MCP browser_run_code_unsafe. Expect allPass: true.
async (page) => {
  await page.goto('http://localhost:8766/test/fixture.html');
  await page.evaluate(() => scrollTo(0, 1000));
  await page.waitForTimeout(500);
  const src = await (await fetch('http://localhost:8766/motion.js')).text();
  const r = await page.evaluate(`(${src.replace(/^\/\/.*\n/, '')})()`);
  const stackSrc = await (await fetch('http://localhost:8766/stack.js')).text();
  const st = await page.evaluate(`(${stackSrc.replace(/^(\/\/.*\n)+/, '')})()`);
  const checks = {
    transition: r.transitions.some(([k]) => k.includes('0.2s')),
    bezier: r.transitions.some(([k]) => k === 'transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)'),
    bezierPairing: r.transitions.some(([k]) => k === 'opacity 0.3s ease'),
    kfDedupe: r.keyframes.find((k) => k.name === 'dot-1')?.variants === 2,
    spin: r.animations[0]?.name === 'spin',
    keyframes: r.keyframes.some((k) => k.name === 'spin'),
    reduced: r.reducedMotion === true,
    smooth: r.scroll.behavior === 'smooth',
    sticky: r.scroll.sticky >= 1,
    gsap: !!st.stack.animation?.GSAP,
    aos: !!st.stack.scroll?.AOS,
    webgl: /webgl/.test(r.media3d.canvases[0]?.context),
    video: r.media3d.videos.length === 1,
    preserve3d: r.media3d.preserve3d >= 1,
  };
  return { allPass: Object.values(checks).every(Boolean), checks };
}
