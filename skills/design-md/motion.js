// Runs in the page (Playwright browser_evaluate) AFTER scrolling. Returns CSS motion, scroll and canvas/media as JSON. Libraries: see stack.js.
() => {
  const hint = (el) => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/)[0] : '');
  const els = [...document.querySelectorAll('body *')].slice(0, 4000);

  const trans = {}, animations = [], seenAnim = {};
  let sticky = 0, snap = null, preserve3d = 0;
  for (const el of els) {
    const s = getComputedStyle(el);
    if (s.display === 'none') continue;
    if (s.transitionDuration.split(',').some((d) => parseFloat(d) > 0)) {
      const props = s.transitionProperty.split(','), durs = s.transitionDuration.split(','), eases = s.transitionTimingFunction.split(/,(?![^(]*\))/);
      props.forEach((p, i) => {
        const d = durs[i % durs.length].trim();
        if (parseFloat(d) > 0) { const k = `${p.trim()} ${d} ${eases[i % eases.length].trim()}`; trans[k] = (trans[k] || 0) + 1; }
      });
    }
    if (s.animationName !== 'none') {
      const key = s.animationName.replace(/\d+/g, '#');
      if (seenAnim[key]) seenAnim[key].count++;
      else if (animations.length < 15) animations.push(seenAnim[key] = { el: hint(el), name: s.animationName, duration: s.animationDuration, easing: s.animationTimingFunction, iterations: s.animationIterationCount, count: 1 });
    }
    if (s.position === 'sticky') sticky++;
    if (s.scrollSnapType !== 'none' && !snap) snap = `${hint(el)}: ${s.scrollSnapType}`;
    if (s.transformStyle === 'preserve-3d' || s.perspective !== 'none') preserve3d++;
  }

  const keyframes = [], seenKf = {};
  let reducedMotion = false;
  const walk = (rules) => {
    for (const r of rules) {
      if (r.type === CSSRule.KEYFRAMES_RULE) {
        const key = r.name.replace(/\d+/g, '#'); // grid-dot-0-1-upDown and grid-dot-2-3-upDown are one animation
        if (seenKf[key]) seenKf[key].variants++;
        else if (keyframes.length < 10) keyframes.push(seenKf[key] = { name: r.name, variants: 1, css: r.cssText.replace(/\s+/g, ' ').slice(0, 400) });
      }
      if (r.media && /prefers-reduced-motion/.test(r.media.mediaText)) reducedMotion = true;
      if (r.cssRules) walk(r.cssRules);
    }
  };
  for (const sheet of document.styleSheets) { try { walk(sheet.cssRules); } catch { /* cross-origin */ } }

  // Probe is safe for canvases the page already set up; runs after scroll so lazy canvases exist.
  const ctxOf = (c) => { for (const t of ['webgl2', 'webgl', '2d']) { try { if (c.getContext(t)) return t; } catch { /* ignore */ } } return 'unknown'; };
  const canvases = [...document.querySelectorAll('canvas')].filter((c) => c.offsetWidth > 50 && c.offsetHeight > 50).slice(0, 8).map((c) => {
    const r = c.getBoundingClientRect();
    const top = Math.round(r.top + scrollY);
    return { w: Math.round(r.width), h: Math.round(r.height), top, left: Math.round(r.left), context: ctxOf(c), hero: top < innerHeight && r.width > innerWidth * 0.4 };
  });
  const videos = [...document.querySelectorAll('video[autoplay]')].slice(0, 5).map((v) => ({ w: v.offsetWidth, h: v.offsetHeight, muted: v.muted, loop: v.loop }));

  return {
    transitions: Object.entries(trans).sort((a, b) => b[1] - a[1]).slice(0, 10),
    animations, keyframes, reducedMotion,
    scroll: { behavior: getComputedStyle(document.documentElement).scrollBehavior, snap, sticky },
    media3d: { canvases, spline: document.querySelectorAll('spline-viewer').length, modelViewer: document.querySelectorAll('model-viewer').length, videos, preserve3d },
  };
}
