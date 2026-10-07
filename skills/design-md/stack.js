// Runs in the page (Playwright browser_evaluate, async) AFTER scrolling. Detects the whole front-end stack:
// framework/platform, UI kit, 3D, canvas/2D, animation, scroll, text, slider, page-transition, audio, physics libraries,
// plus UI component patterns, shaders, GSAP/ScrollTrigger configs, Framer Motion props, Three.js objects and media assets.
// Fetches every loaded script from inside the page, so lazy chunks count and Node-blocking sites still work.
async () => {
  // [name, category, bundle regex, global name, DOM selector, resource-URL regex]
  const SIG = [
    // framework / platform
    ['Next.js', 'framework', null, '__NEXT_DATA__', '#__next, script[src*="/_next/"]', /\/_next\//],
    ['Nuxt', 'framework', null, '__NUXT__', '#__nuxt', /\/_nuxt\//],
    ['Astro', 'framework', null, null, 'astro-island, [data-astro-cid]', /\/_astro\//],
    ['SvelteKit', 'framework', null, null, '[data-sveltekit-preload-data]', /\/_app\/immutable\//],
    ['Gatsby', 'framework', null, null, '#___gatsby', null],
    ['Remix', 'framework', null, '__remixContext', null, null],
    ['React', 'framework', /react-dom|__reactFiber|createRoot/, 'React', '[data-reactroot]', null],
    ['Vue', 'framework', /__vue_app__|createApp\(/, 'Vue', '[data-v-app]', null],
    ['Angular', 'framework', null, 'ng', '[ng-version]', null],
    ['Svelte', 'framework', /svelte\/internal|SvelteComponent/, null, null, null],
    ['Framer (site builder)', 'platform', null, null, '[data-framer-name], [data-framer-component-type]', /framerusercontent|framer\.com\/m\//],
    ['Webflow', 'platform', /Webflow\.push|webflow\.js/, 'Webflow', 'html[data-wf-page], [data-w-id]', /website-files\.com|webflow/],
    ['Wix', 'platform', null, 'wixBiSession', null, /wixstatic|parastorage/],
    ['Squarespace', 'platform', null, 'Static', '[data-squarespace-cacheversion]', /squarespace/],
    ['Shopify', 'platform', null, 'Shopify', null, /cdn\.shopify/],
    ['WordPress', 'platform', null, 'wp', null, /wp-content|wp-includes/],
    ['Lovable / shadcn template', 'platform', /lovable|gptengineer/, null, null, /lovable|gptengineer/],
    // UI kit
    ['Tailwind CSS', 'ui-kit', null, null, '[class*="px-"], [class*="text-["], [class*="md:"]', null],
    ['Radix UI / shadcn', 'ui-kit', /@radix-ui|radix-/, null, '[data-radix-collection-item], [data-radix-popper-content-wrapper], [data-state][aria-controls]', null],
    ['Headless UI', 'ui-kit', /headlessui/, null, '[data-headlessui-state]', null],
    ['MUI', 'ui-kit', /@mui\/|MuiButton/, null, '[class*="Mui"]', null],
    ['Chakra UI', 'ui-kit', /@chakra-ui/, null, '[class*="chakra-"]', null],
    ['Mantine', 'ui-kit', /@mantine/, null, '[class*="mantine-"]', null],
    ['Ant Design', 'ui-kit', /antd/, null, '[class^="ant-"], [class*=" ant-"]', null],
    ['Bootstrap', 'ui-kit', /data-bs-toggle|bootstrap(\.bundle)?(\.min)?\.js/, 'bootstrap', '.container .row [class*="col-"]', /bootstrap/],
    ['Sonner (toasts)', 'ui-kit', /sonner/, null, '[data-sonner-toaster]', null],
    ['Lucide icons', 'icons', /lucide/, null, 'svg.lucide, svg[class*="lucide"]', null],
    ['Font Awesome', 'icons', /fontawesome|font-awesome/, null, '[class^="fa-"], [class*=" fa-"], i.fa, i.fas, i.fab', /fontawesome/],
    ['Phosphor icons', 'icons', /phosphor/, null, '[class^="ph-"], [class*=" ph-"]', null],
    // 3D / WebGL
    ['Three.js', '3d', /WebGLRenderer|THREE\.REVISION|three\.module|"three"/, 'THREE', null, /three(\.module)?(\.min)?\.js|\/three@/],
    ['React Three Fiber', '3d', /@react-three\/fiber|__r3f|useThree\(/, null, null, null],
    ['drei', '3d', /@react-three\/drei|MeshTransmissionMaterial|useGLTF|ScrollControls/, null, null, null],
    ['postprocessing', '3d', /EffectComposer|UnrealBloomPass|BloomEffect|postprocessing/, null, null, null],
    ['OGL', '3d', /from"ogl"|["']ogl["']|ogl\/src/, null, null, /\bogl\b/],
    ['Babylon.js', '3d', /BABYLON\.|babylonjs/, 'BABYLON', null, /babylon/],
    ['PlayCanvas', '3d', /playcanvas|pc\.Application/, null, null, /playcanvas/],
    ['A-Frame', '3d', null, 'AFRAME', 'a-scene', /aframe/],
    ['regl', '3d', /createREGL|regl\(/, null, null, /regl/],
    ['twgl', '3d', /twgl/, 'twgl', null, /twgl/],
    ['curtains.js', '3d', /Curtains\(|curtainsjs/, 'Curtains', null, /curtains/],
    ['Spline', '3d', /@splinetool|splinecode/, null, 'spline-viewer', /\.splinecode|@splinetool/],
    ['model-viewer', '3d', /model-viewer/, null, 'model-viewer', /model-viewer/],
    ['COBE (globe)', '3d', /markerElevation|mapSamples/, null, null, /cobe/],
    ['Unicorn Studio', '3d', /unicornStudio|UnicornStudio/, 'UnicornStudio', '[data-us-project]', /unicorn\.studio|unicornstudio/],
    ['Vanta.js', '3d', /VANTA\./, 'VANTA', null, /vanta/],
    ['Theatre.js', 'animation', /@theatre\/|theatre\.js/, null, null, /theatre/],
    ['Raw WebGL', '3d', /getContext\(["']webgl2?["']/, null, null, null],
    // 2D canvas / vector
    ['PixiJS', '2d', /PIXI\.|@pixi\/|pixi\.js/, 'PIXI', null, /pixi/],
    ['p5.js', '2d', /new p5\(|p5\.prototype/, 'p5', null, /p5(\.min)?\.js/],
    ['Paper.js', '2d', /paper\.setup|paper\.view/, 'paper', null, /paper(-full)?(\.min)?\.js/],
    ['Konva', '2d', /Konva\./, 'Konva', null, /konva/],
    ['tsParticles / particles.js', '2d', /tsparticles|particlesJS/, 'particlesJS', '#tsparticles', /particles/],
    ['Rive', '2d', /@rive-app|rive\.wasm/, 'rive', 'canvas[class*="rive"]', /\.riv(\?|$)|@rive-app/],
    ['Lottie', '2d', /lottie-web|bodymovin|lottie\.loadAnimation/, 'lottie', 'lottie-player, dotlottie-player, dotlottie-wc', /lottie|\.lottie(\?|$)/],
    // animation
    ['GSAP', 'animation', /gsap\.(to|from|fromTo|timeline|set)|GreenSock/, 'gsap', null, /gsap/],
    ['Framer Motion / Motion', 'animation', /framer-motion|whileInView|AnimatePresence|motion\/react/, null, null, /framer-motion|motion@/],
    ['anime.js', 'animation', /anime\.timeline|animejs/, 'anime', null, /anime(\.min)?\.js/],
    ['React Spring', 'animation', /@react-spring/, null, null, null],
    ['Velocity.js', 'animation', /Velocity\.animate|velocity-animate/, 'Velocity', null, /velocity/],
    ['Popmotion', 'animation', /popmotion/, null, null, null],
    ['AutoAnimate', 'animation', /auto-animate|autoAnimate\(/, null, null, null],
    ['View Transitions API', 'page-transition', null, null, null, null],
    // GSAP plugins
    ['GSAP ScrollTrigger', 'scroll', /ScrollTrigger|scrollTrigger:\{/, 'ScrollTrigger', null, /ScrollTrigger/],
    ['GSAP ScrollSmoother', 'scroll', /ScrollSmoother\.create|smooth-wrapper/, 'ScrollSmoother', '#smooth-wrapper', /ScrollSmoother/],
    ['GSAP SplitText', 'text', /SplitText\(|SplitText\.create|\.chars,\{/, 'SplitText', null, /SplitText/],
    ['GSAP Flip', 'animation', /Flip\.(getState|from)/, 'Flip', null, null],
    ['GSAP Draggable', 'animation', /Draggable\.create/, 'Draggable', null, null],
    ['GSAP Observer', 'scroll', /Observer\.create/, 'Observer', null, null],
    ['GSAP MorphSVG', 'animation', /morphSVG/, 'MorphSVGPlugin', null, /MorphSVG/],
    ['GSAP DrawSVG', 'animation', /drawSVG/, 'DrawSVGPlugin', null, /DrawSVG/],
    ['GSAP MotionPath', 'animation', /motionPath:/, 'MotionPathPlugin', null, /MotionPath/],
    ['GSAP CustomEase', 'animation', /CustomEase\.create/, 'CustomEase', null, /CustomEase/],
    ['GSAP ScrambleText', 'text', /scrambleText/, 'ScrambleTextPlugin', null, /ScrambleText/],
    // scroll
    ['Lenis', 'scroll', /new Lenis|lenis/i, 'Lenis', 'html.lenis, html.lenis-smooth', /lenis/],
    ['Locomotive Scroll', 'scroll', /LocomotiveScroll|locomotive-scroll/, 'LocomotiveScroll', '[data-scroll-container]', /locomotive/],
    ['smooth-scrollbar', 'scroll', /smooth-scrollbar/, 'Scrollbar', '[data-scrollbar]', /smooth-scrollbar/],
    ['AOS', 'scroll', /AOS\.init/, 'AOS', '[data-aos]', /\baos\b/],
    ['ScrollReveal', 'scroll', /ScrollReveal\(/, 'ScrollReveal', null, /scrollreveal/],
    ['Rellax', 'scroll', /new Rellax/, 'Rellax', '.rellax', /rellax/],
    ['CSS scroll-driven animations', 'scroll', null, null, null, null],
    // text
    ['SplitType', 'text', /SplitType|split-type/, 'SplitType', null, /split-type/],
    ['Splitting.js', 'text', /Splitting\(/, 'Splitting', '[data-splitting]', /splitting/],
    ['Typed.js', 'text', /new Typed\(/, 'Typed', null, /typed(\.umd)?(\.min)?\.js/],
    // sliders
    ['Swiper', 'slider', /new Swiper|swiper-wrapper/, 'Swiper', '.swiper, swiper-container', /swiper/],
    ['Splide', 'slider', /new Splide|splide__track/, 'Splide', '.splide', /splide/],
    ['Embla Carousel', 'slider', /embla/i, null, '[class*="embla"]', /embla/],
    ['Keen Slider', 'slider', /keen-slider/, null, '.keen-slider', /keen-slider/],
    ['Glide.js', 'slider', /@glidejs|new Glide\(/, 'Glide', '.glide', /glidejs/],
    ['Flickity', 'slider', /Flickity/, 'Flickity', '.flickity-enabled', /flickity/],
    ['Slick', 'slider', /\.slick\(/, null, '.slick-slider', /slick/],
    // page transitions
    ['Barba.js', 'page-transition', /barba\.init/, 'barba', '[data-barba]', /barba/],
    ['Swup', 'page-transition', /new Swup/, 'swup', '#swup', /swup/],
    ['Taxi.js', 'page-transition', /@unseenco\/taxi|data-taxi/, null, '[data-taxi]', /@unseenco\/taxi/],
    ['Highway', 'page-transition', /@dogstudio\/highway/, null, '[data-router-wrapper]', /@dogstudio\/highway/],
    // audio / physics
    ['Howler.js', 'audio', /new Howl\(|howler/, 'Howl', null, /howler/],
    ['Tone.js', 'audio', /Tone\.(Synth|Transport|start)/, 'Tone', null, /tone(\.min)?\.js/],
    ['Matter.js', 'physics', /Matter\.Engine|matter-js/, 'Matter', null, /matter(\.min)?\.js|matter-js/],
    ['cannon-es', 'physics', /cannon-es|CANNON\./, 'CANNON', null, /cannon/],
    ['Rapier', 'physics', /@dimforge\/rapier|rapier3d/, null, null, /rapier/],
  ];

  const resources = performance.getEntriesByType('resource').map((r) => r.name);
  const found = {};
  const add = (name, cat, ev) => { (found[cat] ||= {}); (found[cat][name] ||= []); if (found[cat][name].length < 3 && !found[cat][name].includes(ev)) found[cat][name].push(ev); };
  for (const [name, cat, , glob, sel, resRe] of SIG) {
    if (glob) { try { if (window[glob]) add(name, cat, `window.${glob}`); } catch { /* ignore */ } }
    if (sel) { let n = 0; try { n = document.querySelectorAll(sel).length; } catch { /* bad selector */ } if (n) add(name, cat, `${n}x ${sel.split(',')[0]}`); }
    if (resRe) { const r = resources.find((u) => resRe.test(u) && !/\.(png|jpe?g|svg|webp|avif|gif|ico)(\?|$)/i.test(u)); if (r) add(name, cat, r.split('?')[0].slice(-80)); }
  }

  // CSS-only features: read same-origin stylesheet text.
  let css = '';
  for (const sh of document.styleSheets) { try { for (const r of sh.cssRules) css += r.cssText; } catch { /* cross-origin */ } }
  if (/view-transition/.test(css)) add('View Transitions API', 'page-transition', 'view-transition in CSS');
  if (/animation-timeline|view-timeline|scroll-timeline/.test(css)) add('CSS scroll-driven animations', 'scroll', 'animation-timeline in CSS');

  // Fetch every script the page loaded (incl. lazy chunks) and inline scripts.
  const urls = [...new Set([...resources.filter((u) => /\.m?js(\?|$)/.test(u)), ...[...document.scripts].map((s) => s.src).filter(Boolean)])].slice(0, 80);
  const sources = [...document.scripts].filter((s) => !s.src && s.textContent.length > 200).map((s, i) => ({ name: `inline-${i}`, src: s.textContent }));
  let failed = 0;
  await Promise.all(urls.map(async (u) => {
    try { const r = await fetch(u); if (!r.ok) throw 0; const t = await r.text(); if (t.length < 8e6) sources.push({ name: u.split('/').pop().split('?')[0], src: t }); }
    catch { failed++; }
  }));

  const shaders = [], scrollTriggers = [], tweens = [], motionProps = [], threeObjects = {};
  for (const { name, src } of sources) {
    for (const [lib, cat, re] of SIG) if (re && re.test(src)) add(lib, cat, name);
    // GLSL: from each "void main", expand to the enclosing string literal.
    let perFile = 0;
    for (const m of src.matchAll(/void main\s*\(\s*\)/g)) {
      if (perFile >= 4 || shaders.length >= 12) break;
      const before = src.slice(Math.max(0, m.index - 3000), m.index);
      const open = Math.max(before.lastIndexOf('`'), before.lastIndexOf('"'));
      if (open < 0) continue;
      const start = m.index - before.length + open + 1, end = src.indexOf(before[open], m.index);
      if (end < 0 || end - start > 6000) continue;
      const glsl = src.slice(start, end).replace(/\\n/g, '\n').trim();
      if (!/gl_Position|gl_FragColor|fragColor/.test(glsl) || /function\s*\(|=>/.test(glsl)) continue;
      shaders.push({ file: name, glsl: glsl.slice(0, 2000) }); perFile++;
    }
    for (const m of src.matchAll(/scrollTrigger:\{[^{}]{0,300}\}|\.create\(\{trigger:[^{}]{0,300}\}/g)) if (scrollTriggers.length < 15) scrollTriggers.push(m[0]);
    for (const m of src.matchAll(/\.(?:to|from|fromTo)\([^(),]{1,60},\{[^{}]{0,300}\}/g))
      if (/ease|stagger|duration/.test(m[0]) && !/scrollTrigger/.test(m[0]) && tweens.length < 15) tweens.push(m[0]);
    for (const m of src.matchAll(/(?:initial|animate|whileInView|whileHover|whileTap|exit|transition):\{[^{}]{0,160}\}/g)) if (motionProps.length < 12) motionProps.push(m[0]);
    for (const m of src.matchAll(/new [\w$]+\.(\w+(?:Geometry|Material|Pass|Loader|Camera|Light|Texture|Effect))\(|\(\s*"(\w+(?:Geometry|Material|Light|Camera))"/g)) {
      const k = m[1] || m[2]; threeObjects[k] = (threeObjects[k] || 0) + 1;
    }
  }

  // UI component patterns in the DOM.
  const count = (sel) => { try { return document.querySelectorAll(sel).length; } catch { return 0; } };
  const components = Object.fromEntries(Object.entries({
    accordion: 'details, [data-state][aria-expanded], [aria-controls][aria-expanded]',
    tabs: '[role="tablist"]',
    dialog: 'dialog, [role="dialog"]',
    menu: '[role="menu"], [role="menubar"]',
    tooltip: '[role="tooltip"]',
    carousel: '[aria-roledescription="carousel"], .swiper, .splide, [class*="embla"], [class*="carousel"]',
    marquee: '[class*="marquee"], [class*="ticker"]',
    form: 'form',
    video: 'video',
    iframe: 'iframe',
    svgAnimated: 'svg animate, svg animateTransform, svg [class*="draw"]',
    preloader: '[class*="preloader"], [id*="preloader"], [class*="loading-screen"]',
    themeToggle: '[aria-label*="theme" i], [aria-label*="dark" i], [aria-label*="light mode" i]',
  }).map(([k, sel]) => [k, count(sel)]).filter(([, n]) => n));

  // Custom cursor: small fixed element that ignores the pointer.
  const cursors = [...document.querySelectorAll('body *')].filter((el) => { const st = getComputedStyle(el); return st.position === 'fixed' && st.pointerEvents === 'none' && el.offsetWidth > 4 && el.offsetWidth < 120 && el.offsetHeight < 120; });
  if (cursors.length) components.cursorFollower = cursors.length;

  const assets = resources.filter((u) => /\.(glb|gltf|fbx|obj|usdz|hdr|exr|ktx2|basis|drc|riv|splinecode|lottie|wasm|mp4|webm|mp3|wav|ogg)(\?|$)|lottie.*\.json/i.test(u)).map((u) => u.split('?')[0].slice(-90)).slice(0, 20);

  const custom3d = found['3d']?.['Raw WebGL'] && !['Three.js', 'React Three Fiber', 'OGL', 'Babylon.js', 'PlayCanvas', 'regl', 'twgl', 'curtains.js'].some((n) => found['3d']?.[n]);
  return {
    stack: found,
    note: custom3d ? 'WebGL is used without a general 3D engine: custom hand-written WebGL. Read the shaders.' : undefined,
    components, shaders, scrollTriggers, tweens, motionProps,
    threeObjects: Object.entries(threeObjects).sort((a, b) => b[1] - a[1]).slice(0, 20),
    assets, scripts: { scanned: sources.length, failed },
  };
}
