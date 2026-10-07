// Runs in the page (Playwright browser_evaluate). Returns raw design tokens as JSON.
() => {
  const count = (map, key, w = 1) => { if (key) map[key] = (map[key] || 0) + w; };
  const top = (map, n) => Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, n);
  const toHex = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const [r, g, b, a = 1] = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
    if (a === 0) return null;
    const hex = '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
    return a < 1 ? `${hex} @${a}` : hex;
  };

  const text = {}, bg = {}, border = {}, radius = {}, shadow = {}, spacing = {}, fonts = {};
  const els = [...document.querySelectorAll('body *')].slice(0, 4000);
  for (const el of els) {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    const s = getComputedStyle(el);
    if (s.visibility === 'hidden' || s.display === 'none') continue;
    const area = Math.min(r.width * r.height, 200000) / 1000;
    if (el.childNodes.length && [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()))
      count(text, toHex(s.color));
    count(bg, toHex(s.backgroundColor), area);
    if (parseFloat(s.borderTopWidth) > 0) count(border, toHex(s.borderTopColor));
    if (s.borderRadius !== '0px') count(radius, s.borderRadius);
    if (s.boxShadow !== 'none') count(shadow, s.boxShadow);
    for (const p of ['paddingTop', 'paddingLeft', 'marginBottom', 'gap']) if (s[p] && s[p] !== '0px' && s[p] !== 'normal') count(spacing, s[p]);
    count(fonts, s.fontFamily.split(',')[0].replace(/["']/g, '').trim());
  }

  const typeOf = (sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const s = getComputedStyle(el);
    return { sample: el.textContent.trim().slice(0, 60), font: s.fontFamily, size: s.fontSize, weight: s.fontWeight,
      lineHeight: s.lineHeight, letterSpacing: s.letterSpacing, color: toHex(s.color), transform: s.textTransform };
  };
  const typography = Object.fromEntries(['h1', 'h2', 'h3', 'h4', 'p', 'a', 'li', 'small', 'code', 'nav a', 'footer']
    .map((t) => [t, typeOf(t)]).filter(([, v]) => v));

  const sampleComponents = (sel, n) => [...document.querySelectorAll(sel)].filter((e) => e.offsetWidth).slice(0, n).map((el) => {
    const s = getComputedStyle(el);
    return { text: el.textContent.trim().slice(0, 40), bg: toHex(s.backgroundColor), color: toHex(s.color),
      border: `${s.borderTopWidth} ${toHex(s.borderTopColor)}`, radius: s.borderRadius, padding: s.padding,
      font: `${s.fontWeight} ${s.fontSize}/${s.lineHeight}`, shadow: s.boxShadow, height: Math.round(el.offsetHeight) };
  });

  const vars = {}, breakpoints = new Set();
  const walk = (rules) => { // recursive: Tailwind v4 nests @media inside rules and @layer
    for (const rule of rules) {
      if (rule.media) (rule.media.mediaText.match(/\d+(\.\d+)?(px|em|rem)/g) || []).forEach((b) => breakpoints.add(b));
      if (/(^|,\s*)(:root|html|body)\b/.test(rule.selectorText || '') && !rule.media)
        for (const p of rule.style) if (p.startsWith('--') && !p.startsWith('--tw-') && Object.keys(vars).length < 150) vars[p] = rule.style.getPropertyValue(p).trim();
      if (rule.cssRules) walk(rule.cssRules);
    }
  };
  for (const sheet of document.styleSheets) { try { walk(sheet.cssRules); } catch { /* cross-origin sheet */ } }

  const body = getComputedStyle(document.body);
  return {
    url: location.href, title: document.title,
    meta: { description: document.querySelector('meta[name=description]')?.content, themeColor: document.querySelector('meta[name=theme-color]')?.content },
    page: { bg: toHex(body.backgroundColor), color: toHex(body.color), font: body.fontFamily, size: body.fontSize, maxContainer: Math.max(...[...document.querySelectorAll('main *, body > * > *')].slice(0, 300).map((e) => e.offsetWidth).filter((w) => w < innerWidth)) },
    colors: { text: top(text, 12), background: top(bg, 12), border: top(border, 8) },
    fonts: top(fonts, 6), typography,
    radius: top(radius, 8), shadows: top(shadow, 6), spacing: top(spacing, 15),
    components: {
      buttons: sampleComponents('button, a[class*=btn], a[class*=button], [role=button]', 6),
      inputs: sampleComponents('input:not([type=hidden]), textarea, select', 3),
      cards: sampleComponents('[class*=card], article', 3),
      nav: sampleComponents('header, nav', 2),
    },
    cssVariables: vars, breakpoints: [...breakpoints].slice(0, 15),
  };
}
