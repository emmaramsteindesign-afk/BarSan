/* ═══════════════════════════════════════════════
   Bar·San — Integrated Drinks Visualizer Logic
═══════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function() {
  if (!document.getElementById('glassCanvas')) return;

  const canvas = document.getElementById('glassCanvas');
  const ctx = canvas.getContext('2d');

  let currentGlass = 'coupe';
  let currentGarnish = 'none';
  let targetFill = 0;
  let animFill = 0;
  let T = 0;
  let debounceTimer = null;
  let scanning = false;
  let lastFlavors = [50, 50, 50, 50, 50, 50];

function sizeCanvas() {
  const isMobile = window.innerWidth <= 1200;
  const W = isMobile ? Math.min(window.innerWidth * 0.7, 280) : 320;
  const H = isMobile ? Math.round(W * 1.6) : Math.min(
    document.getElementById('centerPanel').offsetHeight * 0.88, 560
  );
  canvas.width = Math.round(W);
  canvas.height = Math.round(H);
}
  sizeCanvas();
  window.addEventListener('resize', sizeCanvas);

  /* ── render loop ── */
  function loop() {
    T += 0.012;
    animFill += (targetFill - animFill) * 0.04;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGlass(ctx, canvas, currentGlass, animFill, currentGarnish, T);
    requestAnimationFrame(loop);
  }
  loop();

  /* ── matching ── */
  function getVals() {
    return [
      +document.getElementById('sl-0').value,
      +document.getElementById('sl-1').value,
      +document.getElementById('sl-2').value
    ];
  }

  function findClosest(a, f, c) {
    let best = null, minD = Infinity;
    const names = Object.keys(COCKTAILS);
    for (const n of names) {
      const d = COCKTAILS[n];
      const dist = Math.sqrt((a - d.acid) ** 2 + (f - d.fruit) ** 2 + (c - d.complexity) ** 2);
      if (dist < minD) { minD = dist; best = n; }
    }
    return best;
  }

  /* ── show result ── */
  function showResult(name) {
    const c = COCKTAILS[name];
    currentGlass = c.glass;
    currentGarnish = c.garnish;
    targetFill = c.fill;

    document.getElementById('rIdle').style.display = 'none';

    // desktop
    document.getElementById('rName').textContent = name;
    document.getElementById('rType').textContent = c.type;

    // mobile
    document.getElementById('rName-mobile').textContent = name;
    document.getElementById('rType-mobile').textContent = c.type;

    const ingrEl = document.getElementById('rIngr');
    ingrEl.innerHTML = '';
    c.ingredients.forEach((i) => {
      const d = document.createElement('div');
      d.className = 'bs-r-ingr-item';
      d.textContent = i;
      ingrEl.appendChild(d);
    });

    updateChartDots(c.flavors || [50, 50, 50, 50, 50, 50]);

    [c.acid, c.fruit, c.complexity].forEach((v, i) => {
      const m = document.getElementById('md-' + i);
      m.style.left = v + '%';
      m.classList.add('show');
    });

    const rb = document.getElementById('resultBlock');
    rb.classList.remove('show');
    requestAnimationFrame(() => rb.classList.add('show'));
  }

  /* ── scan animation ── */
  function runScan(callback) {
    if (scanning) return;
    scanning = true;
    const line = document.getElementById('scanLine');
    canvas.classList.add('fading');
    line.classList.add('running');
    setStatus('Scanning...');
    let t0 = null;
    const dur = 680;
    function step(ts) {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / dur, 1);
      const e = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
      line.style.top = e * 100 + '%';
      if (p < 1) { requestAnimationFrame(step); return; }
      line.classList.remove('running');
      line.style.top = '0%';
      canvas.classList.remove('fading');
      scanning = false;
      callback();
      setStatus('Match found.');
      setTimeout(() => setStatus('\u00a0'), 1800);
    }
    requestAnimationFrame(step);
  }

  function setStatus(m) {
    document.getElementById('statusMsg').textContent = m;
  }

  function updateLabels() {
    const [a, f, c] = getVals();
    [
      [a, 'll-0', 'lr-0'],
      [f, 'll-1', 'lr-1'],
      [c, 'll-2', 'lr-2']
    ].forEach(([v, l, r]) => {
      document.getElementById(l).classList.toggle('lit', v < 50);
      document.getElementById(r).classList.toggle('lit', v >= 50);
    });
  }

  ['sl-0', 'sl-1', 'sl-2'].forEach((id) => {
    document.getElementById(id).addEventListener('input', () => {
      updateLabels();
      ['md-0', 'md-1', 'md-2'].forEach((m) => document.getElementById(m).classList.remove('show'));
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const [a, f, c] = getVals();
        runScan(() => showResult(findClosest(a, f, c)));
      }, 500);
    });
  });

  document.getElementById('btnRandom').addEventListener('click', () => {
    if (scanning) return;
    clearTimeout(debounceTimer);
    const names = Object.keys(COCKTAILS);
    const pick = names[Math.floor(Math.random() * names.length)];
    document.getElementById('sl-0').value = COCKTAILS[pick].acid;
    document.getElementById('sl-1').value = COCKTAILS[pick].fruit;
    document.getElementById('sl-2').value = COCKTAILS[pick].complexity;
    updateLabels();
    ['md-0', 'md-1', 'md-2'].forEach((m) => document.getElementById(m).classList.remove('show'));
    runScan(() => showResult(pick));
  });

  updateLabels();

  setTimeout(() => {
    const names = Object.keys(COCKTAILS);
    const pick = names[Math.floor(Math.random() * names.length)];
    document.getElementById('sl-0').value = COCKTAILS[pick].acid;
    document.getElementById('sl-1').value = COCKTAILS[pick].fruit;
    document.getElementById('sl-2').value = COCKTAILS[pick].complexity;
    updateLabels();
    showResult(pick);
  }, 200);

  /* ── flavor chart (SVG) ── */
  const FLAVOR_ROWS = ['ABV', 'Sweet', 'Sour', 'Bitter', 'Salty', 'Creamy'];
  const SVG_NS = 'http://www.w3.org/2000/svg';

  function makeSVGEl(tag, attrs) {
    const el = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    return el;
  }

  function buildChart() {
    const svg = document.getElementById('flavorChart');
    svg.innerHTML = '';

    const W = svg.parentElement.offsetWidth || 220;
    const H = Math.round(W * 0.85);
    const labelW = Math.round(W * 0.28);
    const padR = 6, padT = 10, padB = 28;
    const chartX = labelW, chartW = W - labelW - padR;
    const rowCount = 6, rowH = (H - padT - padB) / rowCount;

    const fontSize = 12;
    const fontSizeAxis = 10;

    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

    svg.appendChild(makeSVGEl('rect', { x: 0, y: 0, width: W, height: H, fill: 'transparent' }));

    [0, 25, 50, 75, 100].forEach((v) => {
      const x = chartX + (v / 100) * chartW;
      svg.appendChild(makeSVGEl('line', {
        x1: x, y1: padT, x2: x, y2: H - padB,
        stroke: 'rgba(232,228,220,0.18)', 'stroke-width': '0.5'
      }));
      const txt = makeSVGEl('text', {
        x: x, y: H - 8, 'text-anchor': 'middle',
        'font-family': 'Jost,sans-serif', 'font-size': fontSizeAxis,
        fill: 'rgba(232,228,220,0.3)', 'letter-spacing': '0.05em'
      });
      txt.textContent = v;
      svg.appendChild(txt);
    });

    FLAVOR_ROWS.forEach((label, i) => {
      const y = padT + (i + 0.5) * rowH;
      svg.appendChild(makeSVGEl('line', {
        x1: chartX, y1: y, x2: chartX + chartW, y2: y,
        stroke: 'rgba(232,228,220,0.18)', 'stroke-width': '0.5'
      }));
      const txt = makeSVGEl('text', {
        x: labelW - 6, y: y + fontSize * 0.35, 'text-anchor': 'end',
        'font-family': 'Jost,sans-serif', 'font-size': fontSize,
        fill: 'rgba(232,228,220,0.45)', 'letter-spacing': '0.04em'
      });
      txt.textContent = label;
      svg.appendChild(txt);
      const dot = makeSVGEl('circle', {
        id: 'svgdot-' + FLAVOR_KEYS[i],
        cx: chartX + 0.5 * chartW, cy: y, r: 4,
        fill: 'transparent',
        stroke: 'rgba(232,228,220,0.7)', 'stroke-width': '0.8'
      });
      svg.appendChild(dot);
    });

    _chartX = chartX;
    _chartW = chartW;
  }

  let _chartX = 0, _chartW = 0;

  const dotTargets = {};
  const dotCurrent = {};
  FLAVOR_KEYS.forEach((k) => {
    dotTargets[k] = 50;
    dotCurrent[k] = 50;
  });

  function animateChartDots() {
    FLAVOR_KEYS.forEach((k) => {
      dotCurrent[k] += (dotTargets[k] - dotCurrent[k]) * 0.06;
      const dot = document.getElementById('svgdot-' + k);
      if (dot) {
        dot.setAttribute('cx', _chartX + (dotCurrent[k] / 100) * _chartW);
      }
    });
    requestAnimationFrame(animateChartDots);
  }

  buildChart();
  animateChartDots();

  function updateChartDots(flavors) {
    lastFlavors = flavors;
    FLAVOR_KEYS.forEach((k, i) => {
      dotTargets[k] = flavors[i];
      const dot = document.getElementById('svgdot-' + k);
      if (dot) dot.setAttribute('stroke', 'rgba(232,228,220,0.85)');
    });
  }

  window.addEventListener('resize', () => {
    sizeCanvas();
    buildChart();
    updateChartDots(lastFlavors);
  });

});