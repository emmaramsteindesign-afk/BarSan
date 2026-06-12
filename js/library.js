const isTouchDevice = () => window.matchMedia('(hover: none)').matches;
 
// ═══════════════════════════════════════════════
// CALENDAR
// ═══════════════════════════════════════════════
 
const MONTHS = ['January','February','March','April','May','June',
  'July','August','September','October','November','December'];
 
const events = {
  '2026-6-4':  { name: 'DJ Night — House & Nu-Jazz',  desc: 'Local DJ sets blending house and nu-jazz until midnight. No cover charge.', img: '/assets/images/bar-01.avif' },
  '2026-6-9':  { name: 'Cocktail Tasting Menu',        desc: 'A guided 5-cocktail journey through seasonal ingredients. Booking required.', img: '/assets/images/bar-02.avif' },
  '2026-6-19': { name: 'Live Jazz Quartet',             desc: 'Four musicians, one evening. Standards and originals from 8 PM.', img: '/assets/images/bar-03.avif' },
  '2026-6-21': { name: 'Mezcal & Fire',                 desc: 'A special menu built around smoked spirits and Thai chili. Limited seats.', img: '/assets/images/bar-01.avif' },
  '2026-7-2':  { name: 'Acoustic Duo',                  desc: 'Intimate acoustic set. Arrive early, it fills up fast.', img: '/assets/images/bar-02.avif' },
  '2026-7-8':  { name: "Bartender's Special",           desc: 'One night, one menu. Our head bartender takes over completely.', img: '/assets/images/bar-03.avif' },
  '2026-7-15': { name: 'Sake & Umami',                  desc: 'Curated sake pairings with small Japanese-inspired bites.', img: '/assets/images/bar-01.avif' },
  '2026-7-21': { name: 'Independence Night',            desc: 'Open bar format, live music, until 1 AM.', img: '/assets/images/bar-02.avif' },
};
 
let cY = 2026, cM = 5;
 
const COL_COUNT  = 7;
const COL_BASE   = 1;
const COL_EXPAND = 2.0;
const ROW_BASE_H = 90;
const ROW_EXPAND = 130;
 
const cols = {};
const rows = {};
let numRows = 0;
 
const isTouch = () => window.matchMedia('(hover: none)').matches;
 
function resetProxy() {
  for (let i = 0; i < COL_COUNT; i++) cols[`c${i}`] = COL_BASE;
  for (let i = 0; i < numRows; i++)   rows[`r${i}`] = ROW_BASE_H;
}
 
function applyGrid() {
  const grid = document.getElementById('calGrid');
  const cVals = Array.from({length: COL_COUNT}, (_, i) => `${cols['c'+i]}fr`).join(' ');
  const rVals = Array.from({length: numRows},   (_, i) => `${rows['r'+i]}px`).join(' ');
  grid.style.gridTemplateColumns = cVals;
  if (numRows) grid.style.gridTemplateRows = 'auto ' + rVals;
}
 
function getCellSlot(cell) {
  const grid = document.getElementById('calGrid');
  const allCells = [...grid.querySelectorAll('.cal-day')];
  const absSlot = allCells.indexOf(cell);
  return { col: absSlot % 7, row: Math.floor(absSlot / 7) };
}
 
function expandCell(cell) {
  cell.classList.add('is-hovered');
  const { col, row } = getCellSlot(cell);
  const totalFr = COL_COUNT * COL_BASE;
  const otherFr = (totalFr - COL_EXPAND) / (COL_COUNT - 1);
  const tCols = {}, tRows = {};
  for (let i = 0; i < COL_COUNT; i++)
    tCols[`c${i}`] = i === col ? COL_EXPAND : otherFr;
  const freed  = ROW_EXPAND - ROW_BASE_H;
  const shrink = numRows > 1 ? freed / (numRows - 1) : 0;
  for (let i = 0; i < numRows; i++)
    tRows[`r${i}`] = i === row ? ROW_EXPAND : ROW_BASE_H - shrink;
  gsap.killTweensOf(cols);
  gsap.killTweensOf(rows);
  gsap.to(cols, { ...tCols, duration: .35, ease: 'power2.out', overwrite: true, onUpdate: applyGrid });
  gsap.to(rows, { ...tRows, duration: .35, ease: 'power2.out', overwrite: true, delay: .22, onUpdate: applyGrid });
}
 
function collapseGrid() {
  document.querySelectorAll('.cal-day.is-hovered').forEach(c => c.classList.remove('is-hovered'));
  const rCols = {}, rRows = {};
  for (let i = 0; i < COL_COUNT; i++) rCols[`c${i}`] = COL_BASE;
  for (let i = 0; i < numRows;   i++) rRows[`r${i}`] = ROW_BASE_H;
  gsap.killTweensOf(cols);
  gsap.killTweensOf(rows);
  gsap.to(cols, { ...rCols, duration: .45, ease: 'power3.inOut', overwrite: true, onUpdate: applyGrid });
  gsap.to(rows, { ...rRows, duration: .40, ease: 'power3.inOut', overwrite: true, delay: .05, onUpdate: applyGrid });
}
 
function attachStretch(cell) {
  cell.addEventListener('mouseenter', () => {
    if (isTouch()) return;
    expandCell(cell);
    document.body.classList.add('cursor-hover');
  });
  cell.addEventListener('mouseleave', () => {
    if (isTouch()) return;
    cell.classList.remove('is-hovered');
    document.body.classList.remove('cursor-hover');
    collapseGrid();
  });
  cell.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const already = cell.classList.contains('is-hovered');
    collapseGrid();
    if (!already) expandCell(cell);
  }, { passive: false });
}
 
function buildCal(y, m) {
  const grid = document.getElementById('calGrid');
  const hds  = [...grid.querySelectorAll('.cal-hd')];
  grid.innerHTML = '';
  hds.forEach(h => grid.appendChild(h));
 
  document.getElementById('calMonthBig').textContent = MONTHS[m].toUpperCase();
 
  const firstDay  = new Date(y, m, 1).getDay();
  const totalDays = new Date(y, m + 1, 0).getDate();
  numRows = Math.ceil((firstDay + totalDays) / 7);
 
  resetProxy();
  grid.style.gridTemplateColumns = '';
  grid.style.gridTemplateRows    = '';
 
  for (let i = 0; i < firstDay; i++) {
    const e = document.createElement('div');
    e.className = 'cal-day empty';
    grid.appendChild(e);
  }
 
  for (let d = 1; d <= totalDays; d++) {
    const key  = `${y}-${m + 1}-${d}`;
    const ev   = events[key];
    const cell = document.createElement('div');
    cell.className = 'cal-day' + (ev ? ' has-event' : '');
 
    if (ev) {
      cell.style.backgroundImage    = `url('${ev.img}')`;
      cell.style.backgroundSize     = 'cover';
      cell.style.backgroundPosition = 'center';
    }
 
    const num = document.createElement('div');
    num.className   = 'cal-num';
    num.textContent = d;
    cell.appendChild(num);
 
    if (ev) {
      const overlay = document.createElement('div');
      overlay.className = 'cal-event-overlay';
      const name = document.createElement('div');
      name.className   = 'cal-event-name';
      name.textContent = ev.name;
      const desc = document.createElement('div');
      desc.className   = 'cal-event-desc';
      desc.textContent = ev.desc;
      overlay.appendChild(name);
      overlay.appendChild(desc);
      cell.appendChild(overlay);
    }
 
    attachStretch(cell);
    grid.appendChild(cell);
  }
}
 
document.addEventListener('touchstart', (e) => {
  if (!e.target.closest('.cal-day')) collapseGrid();
}, { passive: true });
 
document.getElementById('prevM').addEventListener('click', () => {
  gsap.killTweensOf(cols); gsap.killTweensOf(rows);
  cM--; if (cM < 0) { cM = 11; cY--; }
  buildCal(cY, cM);
});
document.getElementById('nextM').addEventListener('click', () => {
  gsap.killTweensOf(cols); gsap.killTweensOf(rows);
  cM++; if (cM > 11) { cM = 0; cY++; }
  buildCal(cY, cM);
});
 
buildCal(cY, cM);
 
 
// ═══════════════════════════════════════════════
// COCKTAIL DATABASE
// ═══════════════════════════════════════════════
const FLAVOR_ROWS = ['ABV', 'Sweet', 'Sour', 'Bitter', 'Salty', 'Creamy'];
const COCKTAILS = {
  "Martini Extrême":    { acid:15, fruit:5,  complexity:90, type:"Spirit-forward · Dry",     glass:"martini",   fill:.74, garnish:"olive",  ingredients:["Premium London Dry gin","Dry vermouth","Castelvetrano olive","Lemon twist","Saline solution"],         flavors:[90,5,12,38,22,0] },
  "Dirty Martini":      { acid:18, fruit:5,  complexity:80, type:"Spirit-forward · Saline",   glass:"martini",   fill:.72, garnish:"olive",  ingredients:["Vodka or gin","Dry vermouth","Olive brine","Green olives","Sea salt flakes"],                           flavors:[88,4,8,30,60,0] },
  "Negroni":            { acid:30, fruit:28, complexity:95, type:"Bitter · Herbal",            glass:"rocks",     fill:.68, garnish:"twist",  ingredients:["London Dry gin","Campari","Sweet vermouth","Orange zest","Sphere ice"],                                 flavors:[72,28,18,90,8,0] },
  "Boulevardier":       { acid:25, fruit:30, complexity:90, type:"Bitter · Warming",           glass:"rocks",     fill:.68, garnish:"twist",  ingredients:["Bourbon whiskey","Campari","Sweet vermouth","Orange peel","Large ice cube"],                             flavors:[75,32,14,85,6,0] },
  "Old Fashioned":      { acid:10, fruit:15, complexity:70, type:"Spirit-forward · Classic",   glass:"rocks",     fill:.65, garnish:"twist",  ingredients:["Rye or bourbon","Demerara syrup","Angostura bitters","Orange zest","Sphere ice"],                       flavors:[85,22,8,40,10,0] },
  "Sazerac":            { acid:8,  fruit:10, complexity:85, type:"Anise · Complex",             glass:"rocks",     fill:.60, garnish:"twist",  ingredients:["Rye whiskey","Peychaud's bitters","Demerara syrup","Absinthe rinse","Lemon zest"],                      flavors:[88,18,5,55,6,0] },
  "Vieux Carré":        { acid:20, fruit:25, complexity:95, type:"Spirit-forward · Herbal",    glass:"rocks",     fill:.68, garnish:"twist",  ingredients:["Rye whiskey","Cognac","Sweet vermouth","Bénédictine","Bitters"],                                        flavors:[80,30,14,60,8,0] },
  "Margarita":          { acid:88, fruit:40, complexity:50, type:"Tart · Classic",             glass:"martini",   fill:.78, garnish:"salt",   ingredients:["Blanco tequila","Triple sec","Fresh lime juice","Celery salt rim","Lime wheel"],                        flavors:[55,22,88,18,42,0] },
  "Whisky Sour":        { acid:72, fruit:32, complexity:65, type:"Balanced · Frothy",          glass:"rocks",     fill:.70, garnish:"foam",   ingredients:["Bourbon","Fresh lemon juice","Simple syrup","Egg white","Angostura bitters"],                           flavors:[62,30,70,25,5,8] },
  "Daiquiri":           { acid:80, fruit:55, complexity:45, type:"Crisp · Citrus",             glass:"coupe",     fill:.76, garnish:"none",   ingredients:["White rum","Fresh lime juice","Fine cane sugar","Lime zest","Saline drops"],                            flavors:[52,28,80,10,8,0] },
  "Pisco Sour":         { acid:75, fruit:38, complexity:60, type:"Frothy · Citrus",            glass:"coupe",     fill:.74, garnish:"foam",   ingredients:["Pisco","Fresh lemon juice","Simple syrup","Egg white","Angostura bitters"],                             flavors:[55,32,72,18,5,10] },
  "Gimlet":             { acid:82, fruit:42, complexity:40, type:"Sharp · Clean",              glass:"coupe",     fill:.72, garnish:"twist",  ingredients:["London Dry gin","Fresh lime juice","Simple syrup","Lime wheel","Sea salt"],                             flavors:[58,24,82,12,8,0] },
  "Paloma":             { acid:70, fruit:75, complexity:42, type:"Citrus · Sparkling",         glass:"highball",  fill:.80, garnish:"straw",  ingredients:["Blanco tequila","Fresh grapefruit juice","Sparkling water","Agave syrup","Salt rim"],                   flavors:[42,35,68,14,38,0] },
  "Tommy's Margarita":  { acid:85, fruit:38, complexity:35, type:"Pure · Tequila-forward",     glass:"rocks",     fill:.70, garnish:"none",   ingredients:["Blanco tequila","Fresh lime juice","Agave syrup","Lime wheel","Sea salt"],                              flavors:[58,18,85,8,15,0] },
  "Mojito Cubano":      { acid:72, fruit:60, complexity:40, type:"Fresh · Mint",               glass:"highball",  fill:.82, garnish:"straw",  ingredients:["White rum","Fresh lime","Fresh mint","Cane sugar","Sparkling water"],                                   flavors:[38,50,68,8,4,0] },
  "Spritz Vénitien":    { acid:55, fruit:70, complexity:58, type:"Sparkling · Gently bitter",  glass:"wine",      fill:.72, garnish:"straw",  ingredients:["Aperol","Prosecco","Sparkling water","Orange slice","Green olive"],                                     flavors:[24,42,48,55,6,0] },
  "Hugo":               { acid:38, fruit:80, complexity:35, type:"Floral · Light",             glass:"wine",      fill:.74, garnish:"straw",  ingredients:["Elderflower liqueur","Prosecco","Fresh mint","Sparkling water","Lime"],                                  flavors:[18,72,32,8,2,0] },
  "French 75":          { acid:65, fruit:45, complexity:70, type:"Elegant · Sparkling",        glass:"flute",     fill:.78, garnish:"twist",  ingredients:["London Dry gin","Fresh lemon juice","Simple syrup","Champagne","Lemon zest"],                           flavors:[45,28,62,18,5,0] },
  "Aperol Tonic":       { acid:45, fruit:65, complexity:30, type:"Easy · Bitter-sweet",        glass:"wine",      fill:.76, garnish:"straw",  ingredients:["Aperol","Premium tonic water","Orange slice","Ice","Fresh mint"],                                       flavors:[14,48,40,52,4,0] },
  "Kir Royale":         { acid:40, fruit:72, complexity:50, type:"Festive · Berry",            glass:"flute",     fill:.80, garnish:"none",   ingredients:["Crème de cassis","Champagne","Blackcurrant","Lemon zest","Ice"],                                        flavors:[18,68,35,10,2,0] },
  "Piña Colada":        { acid:22, fruit:95, complexity:35, type:"Creamy · Tropical",          glass:"hurricane", fill:.82, garnish:"straw",  ingredients:["White rum","Coconut cream","Fresh pineapple","Coconut milk","Lime"],                                    flavors:[38,82,18,5,5,75] },
  "Mai Tai":            { acid:55, fruit:88, complexity:68, type:"Complex · Tropical",         glass:"hurricane", fill:.78, garnish:"straw",  ingredients:["Aged rum","Orange curaçao","Orgeat","Fresh lime","Angostura bitters"],                                   flavors:[52,70,55,18,5,8] },
  "Sex on the Beach":   { acid:50, fruit:90, complexity:28, type:"Sweet · Fruity",             glass:"highball",  fill:.80, garnish:"straw",  ingredients:["Vodka","Peach schnapps","Orange juice","Cranberry juice","Ice"],                                        flavors:[32,88,45,5,4,0] },
  "Blue Lagoon":        { acid:48, fruit:85, complexity:25, type:"Sweet · Tropical",           glass:"highball",  fill:.80, garnish:"straw",  ingredients:["Vodka","Blue curaçao","Lemonade","Lime juice","Ice"],                                                   flavors:[28,82,44,5,3,0] },
  "Jungle Bird":        { acid:60, fruit:82, complexity:72, type:"Tropical · Bitter",          glass:"rocks",     fill:.72, garnish:"none",   ingredients:["Dark rum","Campari","Pineapple juice","Fresh lime","Demerara syrup"],                                   flavors:[50,60,55,60,5,0] },
  "Espresso Martini":   { acid:32, fruit:15, complexity:65, type:"Creamy · Coffee",            glass:"martini",   fill:.74, garnish:"none",   ingredients:["Vodka","Coffee liqueur","Fresh espresso","Simple syrup","Coffee beans"],                                flavors:[58,45,28,50,5,35] },
  "White Russian":      { acid:10, fruit:12, complexity:30, type:"Creamy · Sweet",             glass:"rocks",     fill:.70, garnish:"none",   ingredients:["Vodka","Coffee liqueur","Heavy cream","Ice","Vanilla extract"],                                         flavors:[48,55,8,30,4,72] },
  "Brandy Alexander":   { acid:8,  fruit:20, complexity:55, type:"Dessert · Creamy",           glass:"coupe",     fill:.72, garnish:"none",   ingredients:["Cognac","Brown crème de cacao","Heavy cream","Nutmeg","Vanilla"],                                       flavors:[52,68,6,18,4,80] },
  "Clover Club":        { acid:65, fruit:50, complexity:60, type:"Frothy · Berry",             glass:"coupe",     fill:.74, garnish:"none",   ingredients:["Gin","Fresh lemon juice","Raspberry syrup","Egg white","Rosé vermouth"],                                flavors:[48,58,62,12,4,15] },
  "Chablis Réserve":    { acid:62, fruit:18, complexity:72, type:"Mineral · Elegant",          glass:"wine",      fill:.68, garnish:"none",   ingredients:["Chablis","Sparkling water","Cucumber","Dill","Ice"],                                                    flavors:[28,14,58,22,12,0] },
  "Rosé d'Été":         { acid:38, fruit:52, complexity:22, type:"Floral · Light",             glass:"wine",      fill:.72, garnish:"twist",  ingredients:["Sparkling rosé","Lychee","Rose water","Raspberry","Lemon zest"],                                       flavors:[20,58,34,10,4,0] },
  "Sangria Blanche":    { acid:50, fruit:82, complexity:38, type:"Fruity · Refreshing",        glass:"wine",      fill:.76, garnish:"straw",  ingredients:["White wine","Peach","Mint","Apple juice","Sparkling water"],                                            flavors:[18,72,45,8,2,0] },
  "Cosmopolitan":       { acid:78, fruit:75, complexity:45, type:"Fruity · Sharp",             glass:"martini",   fill:.74, garnish:"twist",  ingredients:["Citrus vodka","Triple sec","Cranberry juice","Fresh lime","Lemon zest"],                                flavors:[48,38,75,15,5,0] },
  "Aperitivo Sbagliato":{ acid:42, fruit:52, complexity:78, type:"Bitter · Sparkling",         glass:"wine",      fill:.72, garnish:"twist",  ingredients:["Campari","Sweet vermouth","Prosecco","Orange peel","Ice"],                                              flavors:[22,35,35,82,5,0] },
  "Midori Sour":        { acid:70, fruit:88, complexity:32, type:"Sweet-Sour · Melon",         glass:"coupe",     fill:.74, garnish:"twist",  ingredients:["Midori melon liqueur","Fresh lemon juice","Vodka","Simple syrup","Egg white"],                          flavors:[32,78,68,8,4,8] },
  "Last Word":          { acid:78, fruit:60, complexity:88, type:"Balanced · Herbal",          glass:"coupe",     fill:.72, garnish:"none",   ingredients:["London Dry gin","Green Chartreuse","Maraschino liqueur","Fresh lime juice","Ice"],                      flavors:[58,45,75,42,5,0] },
};
 
const FLAVOR_KEYS = ['abv','sweet','sour','bitter','salty','creamy'];
 
 
// ═══════════════════════════════════════════════
// CURSOR
// ═══════════════════════════════════════════════
 
const cur  = document.getElementById('cur');
const curR = document.getElementById('curR');
let mx = 0, my = 0, rx = 0, ry = 0;
 
document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
 
(function cursorLoop() {
  rx += (mx - rx) * .18;
  ry += (my - ry) * .18;
  cur.style.left  = mx + 'px';
  cur.style.top   = my + 'px';
  curR.style.left = rx + 'px';
  curR.style.top  = ry + 'px';
  requestAnimationFrame(cursorLoop);
})();
 
document.querySelectorAll('a,button,.mixo,.photo-cell,.drink-cell,.cal-day,.food-row').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});
 
(function() {
  const drinksSection = document.getElementById('drinks');
  if (!drinksSection || !cur || !curR) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        cur.style.background   = '#fff';
        cur.style.mixBlendMode = 'normal';
        curR.style.borderColor = 'rgba(255,255,255,.45)';
      } else {
        cur.style.background   = '';
        cur.style.mixBlendMode = '';
        curR.style.borderColor = '';
      }
    });
  }, { threshold: 0.1 });
  obs.observe(drinksSection);
  document.querySelectorAll('.da-col').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
})();
 
 
// ═══════════════════════════════════════════════
// DRINK VISUALIZER
// ═══════════════════════════════════════════════
 
document.addEventListener('DOMContentLoaded', function () {
  if (!document.getElementById('glassCanvas')) return;
 
  const canvas = document.getElementById('glassCanvas');
  const ctx    = canvas.getContext('2d');
  const centerPanel = document.getElementById('centerPanel');
 
  let currentGlass   = 'coupe';
  let currentGarnish = 'none';
  let targetFill     = 0;
  let animFill       = 0;
  let T              = 0;
  let debounceTimer  = null;
  let scanning       = false;
  let lastFlavors    = [50, 50, 50, 50, 50, 50];
  
  // ← CACHE dimensions to avoid repeated DOM reads
  let cachedPanelHeight = 600;
 
  function sizeCanvas() {
    const isMobile = window.innerWidth <= 1200;
    const W = isMobile ? Math.min(window.innerWidth * 0.7, 280) : 320;
    
    // Single DOM read, cached
    if (centerPanel) {
      cachedPanelHeight = centerPanel.offsetHeight;
    }
    
    const H = isMobile
      ? Math.round(W * 1.6)
      : Math.min(cachedPanelHeight * 0.88, 560);
    
    canvas.width  = Math.round(W);
    canvas.height = Math.round(H);
  }
 
  sizeCanvas();
 
  // ← Use ResizeObserver instead of resize event for better performance
  const resizeObserver = new ResizeObserver(() => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      sizeCanvas();
    }, 150);
  });
  
  if (centerPanel) {
    resizeObserver.observe(centerPanel);
  }
 
  function renderLoop() {
    T += 0.012;
    animFill += (targetFill - animFill) * 0.04;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGlass(ctx, canvas, currentGlass, animFill, currentGarnish, T);
    requestAnimationFrame(renderLoop);
  }
  renderLoop();
 
  function getVals() {
    return [
      +document.getElementById('sl-0').value,
      +document.getElementById('sl-1').value,
      +document.getElementById('sl-2').value
    ];
  }
 
  function findClosest(a, f, c) {
    let best = null, minD = Infinity;
    for (const n of Object.keys(COCKTAILS)) {
      const d    = COCKTAILS[n];
      const dist = Math.sqrt((a - d.acid) ** 2 + (f - d.fruit) ** 2 + (c - d.complexity) ** 2);
      if (dist < minD) { minD = dist; best = n; }
    }
    return best;
  }
 
  // ── flavor chart HTML bars ──
  const FLAVOR_ROWS = ['ABV', 'Sweet', 'Sour', 'Bitter', 'Salty', 'Creamy'];
 
  function updateChartDots(flavors) {
    lastFlavors = flavors;
    FLAVOR_ROWS.forEach((_, i) => {
      const bar = document.getElementById('fc-bar-' + i);
      if (bar) bar.style.width = (flavors[i] ?? 50) + '%';
    });
  }
 
  function showResult(name) {
    const c        = COCKTAILS[name];
    currentGlass   = c.glass;
    currentGarnish = c.garnish;
    targetFill     = c.fill;
 
    document.getElementById('rIdle').style.display      = 'none';
    document.getElementById('rName').textContent        = name;
    document.getElementById('rType').textContent        = c.type;
    document.getElementById('rName-mobile').textContent = name;
    document.getElementById('rType-mobile').textContent = c.type;
 
    const ingrEl = document.getElementById('rIngr');
    ingrEl.innerHTML = '';
    c.ingredients.forEach(i => {
      const d       = document.createElement('div');
      d.className   = 'bs-r-ingr-item';
      d.textContent = i;
      ingrEl.appendChild(d);
    });
 
    updateChartDots(c.flavors || [50, 50, 50, 50, 50, 50]);
 
    [c.acid, c.fruit, c.complexity].forEach((v, i) => {
      const m      = document.getElementById('md-' + i);
      m.style.left = v + '%';
      m.classList.add('show');
    });
 
    const rb = document.getElementById('resultBlock');
    rb.classList.remove('show');
    requestAnimationFrame(() => rb.classList.add('show'));
  }
 
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
    [[a,'ll-0','lr-0'],[f,'ll-1','lr-1'],[c,'ll-2','lr-2']].forEach(([v, l, r]) => {
      document.getElementById(l).classList.toggle('lit', v < 50);
      document.getElementById(r).classList.toggle('lit', v >= 50);
    });
  }
 
  ['sl-0','sl-1','sl-2'].forEach(id => {
    document.getElementById(id).addEventListener('input', () => {
      updateLabels();
      ['md-0','md-1','md-2'].forEach(m => document.getElementById(m).classList.remove('show'));
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
    const pick  = names[Math.floor(Math.random() * names.length)];
    document.getElementById('sl-0').value = COCKTAILS[pick].acid;
    document.getElementById('sl-1').value = COCKTAILS[pick].fruit;
    document.getElementById('sl-2').value = COCKTAILS[pick].complexity;
    updateLabels();
    ['md-0','md-1','md-2'].forEach(m => document.getElementById(m).classList.remove('show'));
    runScan(() => showResult(pick));
  });
 
  updateLabels();
  updateChartDots([50, 50, 50, 50, 50, 50]);
 
  setTimeout(() => {
    const names = Object.keys(COCKTAILS);
    const pick  = names[Math.floor(Math.random() * names.length)];
    document.getElementById('sl-0').value = COCKTAILS[pick].acid;
    document.getElementById('sl-1').value = COCKTAILS[pick].fruit;
    document.getElementById('sl-2').value = COCKTAILS[pick].complexity;
    updateLabels();
    showResult(pick);
  }, 200);
 
  // ← REMOVED: duplicate window.addEventListener('resize', sizeCanvas);
  // ← ResizeObserver handles all resizing now
 
}); // ← fin DOMContentLoaded visualizer
 
 
// ═══════════════════════════════════════════════
// DRINKS ACCORDION
// ═══════════════════════════════════════════════
 
document.querySelectorAll('.drink-cell').forEach(cell => {
  const bars = cell.querySelectorAll('.fl-bar');
 
  function expandBars() {
    bars.forEach((bar, i) => {
      const w = parseFloat(bar.dataset.w || 0.5);
      gsap.fromTo(bar, { scaleX: 0 }, { scaleX: w, duration: .65 + i * .06, ease: 'power2.out', transformOrigin: 'left' });
    });
  }
  function collapseBars() {
    bars.forEach(bar => gsap.to(bar, { scaleX: 0, duration: .35, ease: 'power2.in', transformOrigin: 'left' }));
  }
 
  if (isTouchDevice()) {
    cell.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (cell.classList.contains('is-hovered')) {
        cell.classList.remove('is-hovered');
        collapseBars();
      } else {
        document.querySelectorAll('.drink-cell.is-hovered').forEach(c => {
          c.classList.remove('is-hovered');
          c.querySelectorAll('.fl-bar').forEach(b => gsap.to(b, { scaleX: 0, duration: .35, ease: 'power2.in', transformOrigin: 'left' }));
        });
        cell.classList.add('is-hovered');
        expandBars();
      }
    }, { passive: false });
  } else {
    cell.addEventListener('mouseenter', expandBars);
    cell.addEventListener('mouseleave', collapseBars);
  }
});
 
 
// ═══════════════════════════════════════════════
// FOOD
// ═══════════════════════════════════════════════
 
{
  const foodCols   = document.getElementById('foodCols');
  const foodColEls = [...foodCols.querySelectorAll('.food-col')];
  const COL_N      = foodColEls.length;
  const FOOD_COL_BASE   = 1;
  const FOOD_COL_EXPAND = 2.0;
  const isMobile = () => window.matchMedia('(max-width: 768px)').matches;
  const fCols = {};
  for (let i = 0; i < COL_N; i++) fCols[`c${i}`] = FOOD_COL_BASE;
 
  function applyFoodGrid() {
    foodCols.style.gridTemplateColumns = Array.from({ length: COL_N }, (_, i) => `${fCols['c' + i]}fr`).join(' ');
  }
 
  function expandFoodCol(idx) {
    const col   = foodColEls[idx];
    const items = col.querySelectorAll('.food-item');
    col.classList.add('is-expanded');
    if (!isMobile()) {
      const other  = (COL_N * FOOD_COL_BASE - FOOD_COL_EXPAND) / (COL_N - 1);
      const target = {};
      for (let i = 0; i < COL_N; i++) target[`c${i}`] = i === idx ? FOOD_COL_EXPAND : other;
      gsap.killTweensOf(fCols);
      gsap.to(fCols, { ...target, duration: .4, ease: 'power2.out', overwrite: true, onUpdate: applyFoodGrid });
      gsap.to(items, { opacity: 1, y: 0, duration: .4, stagger: .07, ease: 'power3.out' });
    } else {
      gsap.to(items, { opacity: 1, duration: .3, stagger: .05, ease: 'power2.out' });
    }
  }
 
  function collapseFoodAll() {
    foodColEls.forEach(col => {
      col.classList.remove('is-expanded');
      if (!isMobile()) gsap.to(col.querySelectorAll('.food-item'), { opacity: 0, y: 8, duration: .3, ease: 'power2.in' });
    });
    if (!isMobile()) {
      const reset = {};
      for (let i = 0; i < COL_N; i++) reset[`c${i}`] = FOOD_COL_BASE;
      gsap.killTweensOf(fCols);
      gsap.to(fCols, { ...reset, duration: .5, ease: 'power3.inOut', overwrite: true, onUpdate: applyFoodGrid });
    }
  }
 
  foodColEls.forEach((col, idx) => {
    const label = col.querySelector('.food-col-label');
    label.addEventListener('click', (e) => {
      e.preventDefault();
      if (isMobile()) {
        const isExpanded = col.classList.contains('is-expanded');
        if (isExpanded) {
          col.classList.remove('is-expanded');
          gsap.to(col.querySelectorAll('.food-item'), { opacity: 0, y: 8, duration: .2, ease: 'power2.in', pointerEvents: 'none' });
        } else {
          col.classList.add('is-expanded');
          gsap.to(col.querySelectorAll('.food-item'), { opacity: 1, y: 0, duration: .3, stagger: .05, ease: 'power2.out', pointerEvents: 'auto' });
        }
      } else {
        const already = col.classList.contains('is-expanded');
        collapseFoodAll();
        if (!already) expandFoodCol(idx);
      }
    });
    if (!isMobile()) {
      label.addEventListener('mouseenter', () => { document.body.classList.add('cursor-hover'); collapseFoodAll(); expandFoodCol(idx); });
      label.addEventListener('mouseleave', () => { document.body.classList.remove('cursor-hover'); collapseFoodAll(); });
    }
  });
 
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.food-col') && isMobile()) collapseFoodAll();
  }, { passive: true });
}
 
 
// ═══════════════════════════════════════════════
// FOOTER
// ═══════════════════════════════════════════════
 
gsap.registerPlugin(ScrollTrigger);
 
gsap.set('.footer-info', { opacity: 0 });
gsap.set('.footer-logo', { opacity: 0, x: 50 });
gsap.set('.footer-line', { flexGrow: 1, flexShrink: 1, flexBasis: '0%', scaleX: 0 });
gsap.set('.footer-line--left',  { transformOrigin: 'left' });
gsap.set('.footer-line--right', { transformOrigin: 'right' });
 
const row1L = document.querySelector('.footer-row:nth-child(1) .footer-line--left');
const row1R = document.querySelector('.footer-row:nth-child(1) .footer-line--right');
const row2L = document.querySelector('.footer-row:nth-child(2) .footer-line--left');
const row2R = document.querySelector('.footer-row:nth-child(2) .footer-line--right');
const row3L = document.querySelector('.footer-row:nth-child(3) .footer-line--left');
const row3R = document.querySelector('.footer-row:nth-child(3) .footer-line--right');
 
gsap.timeline({ scrollTrigger: { trigger: '.footer', start: 'top 80%' } })
  .to('.footer-line', { scaleX: 1, duration: 0.8, stagger: 0.12, ease: 'power3.out' })
  .to('.footer-info', { opacity: 1, duration: 0.4, stagger: 0.12 }, '-=0.4')
  .to([row1L, row3L], { flexGrow: 20, duration: 0.9, ease: 'power4.inOut' }, '+=0.3')
  .to([row1R, row3R], { flexGrow: 0.05, duration: 0.9, ease: 'power4.inOut' }, '<')
  .to(row2R,          { flexGrow: 20, duration: 0.9, ease: 'power4.inOut' }, '<')
  .to(row2L,          { flexGrow: 0.05, duration: 0.9, ease: 'power4.inOut' }, '<')
  .to('.footer-logo', { opacity: 1, x: 0, duration: 1, ease: 'power3.out' }, '-=0.5');
 
 
// ═══════════════════════════════════════════════
// GLASSES
// ═══════════════════════════════════════════════
 
function hash(x,y){let h=(x*1619+y*31337+1013904223)&0xffffffff;h=Math.imul(h^(h>>>16),0x45d9f3b);h=Math.imul(h^(h>>>16),0x45d9f3b);return((h^(h>>>16))>>>0)/0xffffffff}
function noise(x,y){const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy;const a=hash(ix,iy),b=hash(ix+1,iy),c=hash(ix,iy+1),d=hash(ix+1,iy+1);const ux=fx*fx*(3-2*fx),uy=fy*fy*(3-2*fy);return a+(b-a)*ux+(c-a)*uy+(a-b-c+d)*ux*uy}
 
function drawLiquid(ctx, canvas, clipFn, botY, fillPct, seed, t) {
  if (fillPct <= 0) return;
  const W = canvas.width;
  ctx.save(); clipFn(); ctx.clip();
  const cols=28, rows=40, cw=W/cols, ch=botY/rows;
  const liqStartY = botY*(1-fillPct);
  for(let row=0;row<rows;row++){
    for(let col=0;col<cols;col++){
      const px=col*cw,py=row*ch;
      if(py+ch<liqStartY)continue;
      const depth=(py-liqStartY)/(botY-liqStartY);
      const n1=noise(col*0.22+seed,row*0.20+t*0.55);
      const n2=noise(col*0.38+seed+4.1,row*0.32-t*0.32);
      const n=n1*0.65+n2*0.35;
      const alpha=(0.04+n*0.22)*(0.25+depth*0.75);
      const topClip=Math.max(0,liqStartY-py);
      ctx.fillStyle=`rgba(232,228,220,${alpha.toFixed(3)})`;
      ctx.fillRect(px,py+topClip,cw-0.5,ch-topClip-0.5);
    }
  }
  for(let i=0;i<14;i++){
    const sx=noise(i*2.7+seed,t*0.18+i*0.4)*W;
    const sy=liqStartY+noise(i*1.9,t*0.22+i*0.6)*(botY-liqStartY);
    const sr=0.7+noise(i+seed,t*0.12)*2.0;
    ctx.beginPath();ctx.arc(sx,sy,sr,0,Math.PI*2);
    ctx.fillStyle='rgba(232,228,220,0.32)';ctx.fill();
  }
  ctx.beginPath();
  for(let i=0;i<=32;i++){
    const xp=(i/32)*W;
    const wave=Math.sin(i*0.55+t*2.8)*1.8+Math.cos(i*0.9-t*1.9)*1.2;
    const yp=liqStartY+wave;
    i===0?ctx.moveTo(xp,yp):ctx.lineTo(xp,yp);
  }
  ctx.strokeStyle='rgba(232,228,220,0.18)';ctx.lineWidth=0.8;ctx.stroke();
  ctx.restore();
}
 
function drawStraw(ctx, x1,y1,x2,y2,r){
  const dx=x2-x1,dy=y2-y1,len=Math.sqrt(dx*dx+dy*dy);
  const nx=-dy/len,ny=dx/len;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x1+nx*r,y1+ny*r);ctx.lineTo(x2+nx*r,y2+ny*r);
  ctx.lineTo(x2-nx*r,y2-ny*r);ctx.lineTo(x1-nx*r,y1-ny*r);
  ctx.closePath();
  ctx.strokeStyle='rgba(232,228,220,0.75)';ctx.lineWidth=0.8;ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x1+nx*(r*0.3),y1+ny*(r*0.3));ctx.lineTo(x2+nx*(r*0.3),y2+ny*(r*0.3));
  ctx.strokeStyle='rgba(232,228,220,0.22)';ctx.lineWidth=r*0.45;ctx.stroke();
  ctx.restore();
}
 
function drawIce(ctx, cx, liqY, bot, S, t, offsetX=0){
  const iceBob=Math.sin(t*1.2)*2.5*S;
  const iceY=liqY+(bot-liqY)*0.10+iceBob;
  const iceX=cx-22*S+offsetX, iceS=36*S;
  ctx.save();
  ctx.strokeStyle='rgba(232,228,220,0.38)';ctx.lineWidth=0.6*S;ctx.setLineDash([]);
  ctx.strokeRect(iceX,iceY,iceS,iceS);
  ctx.setLineDash([2,2]);ctx.lineWidth=0.35*S;ctx.globalAlpha=0.28;
  ctx.beginPath();ctx.moveTo(iceX,iceY+iceS*0.5);ctx.lineTo(iceX+iceS,iceY+iceS*0.5);ctx.stroke();
  ctx.beginPath();ctx.moveTo(iceX+iceS*0.5,iceY);ctx.lineTo(iceX+iceS*0.5,iceY+iceS);ctx.stroke();
  ctx.setLineDash([]);ctx.globalAlpha=0.22;
  ctx.beginPath();ctx.moveTo(iceX,iceY);ctx.lineTo(iceX-7*S,iceY-7*S);ctx.lineTo(iceX+iceS-7*S,iceY-7*S);ctx.lineTo(iceX+iceS,iceY);ctx.stroke();
  ctx.beginPath();ctx.moveTo(iceX+iceS,iceY);ctx.lineTo(iceX+iceS-7*S,iceY-7*S);ctx.stroke();
  ctx.globalAlpha=1;ctx.setLineDash([]);ctx.restore();
}
 
function drawCoupe(ctx, canvas, fillPct, garnish, t){
  const W=canvas.width,H=canvas.height,S=W/200,cx=W/2;
  const bowlTop=28*S, bowlBot=Math.min(H*0.50,260*S);
  const inset1=9*S, inset2=20*S;
  function bowl(ins){ctx.beginPath();ctx.moveTo(ins,bowlTop);ctx.quadraticCurveTo(ins-6*S,bowlTop+(bowlBot-bowlTop)*0.55,cx-2*S,bowlBot);ctx.lineTo(cx+2*S,bowlBot);ctx.quadraticCurveTo(W-ins+6*S,bowlTop+(bowlBot-bowlTop)*0.55,W-ins,bowlTop);ctx.closePath();}
  drawLiquid(ctx,canvas,()=>bowl(inset1),bowlBot,fillPct,1.1,t);
  ctx.strokeStyle='rgba(232,228,220,0.85)';ctx.lineWidth=0.9*S;ctx.lineJoin='round';ctx.lineCap='round';
  if(garnish==='twist'&&fillPct>0){ctx.save();ctx.globalAlpha=0.5;ctx.strokeStyle='rgba(232,228,220,0.7)';ctx.lineWidth=0.7*S;ctx.beginPath();ctx.moveTo(W-22*S,bowlTop+4*S);ctx.quadraticCurveTo(W-8*S,bowlTop-10*S,W-14*S,bowlTop+20*S);ctx.quadraticCurveTo(W-5*S,bowlTop+6*S,W-18*S,bowlTop+30*S);ctx.stroke();ctx.restore();}
  if(garnish==='salt'){ctx.save();ctx.globalAlpha=0.35;ctx.strokeStyle='rgba(232,228,220,0.85)';ctx.lineWidth=3*S;ctx.setLineDash([2.5,3]);ctx.beginPath();ctx.moveTo(inset1,bowlTop);ctx.lineTo(W-inset1,bowlTop);ctx.stroke();ctx.setLineDash([]);ctx.restore();}
  bowl(inset1);ctx.stroke();
  ctx.save();ctx.globalAlpha=0.22;ctx.beginPath();ctx.moveTo(inset2,bowlTop);ctx.quadraticCurveTo(inset2-5*S,bowlTop+(bowlBot-bowlTop)*0.55,cx-3*S,bowlBot-2*S);ctx.stroke();ctx.beginPath();ctx.moveTo(W-inset2,bowlTop);ctx.quadraticCurveTo(W-inset2+5*S,bowlTop+(bowlBot-bowlTop)*0.55,cx+3*S,bowlBot-2*S);ctx.stroke();ctx.restore();
  ctx.globalAlpha=0.25;ctx.lineWidth=0.5*S;ctx.beginPath();ctx.moveTo(cx-26*S,bowlBot);ctx.quadraticCurveTo(cx,bowlBot+8*S,cx+26*S,bowlBot);ctx.stroke();ctx.globalAlpha=1;
  ctx.lineWidth=0.9*S;ctx.beginPath();ctx.moveTo(cx,bowlBot);ctx.lineTo(cx,H-44*S);ctx.stroke();
  ctx.globalAlpha=0.18;ctx.lineWidth=0.4*S;ctx.beginPath();ctx.moveTo(cx+3.5*S,bowlBot+2*S);ctx.lineTo(cx+3.5*S,H-44*S);ctx.stroke();ctx.globalAlpha=1;
  ctx.lineWidth=0.85*S;ctx.beginPath();ctx.moveTo(cx-52*S,H-44*S);ctx.lineTo(cx+52*S,H-44*S);ctx.stroke();
  ctx.globalAlpha=0.2;ctx.lineWidth=0.45*S;ctx.beginPath();ctx.moveTo(cx-52*S,H-44*S);ctx.quadraticCurveTo(cx,H-36*S,cx+52*S,H-44*S);ctx.stroke();ctx.globalAlpha=1;
  ctx.globalAlpha=0.18;ctx.lineWidth=1.6*S;ctx.beginPath();ctx.moveTo(inset1,bowlTop);ctx.lineTo(W-inset1,bowlTop);ctx.stroke();ctx.globalAlpha=1;
  ctx.globalAlpha=0.12;ctx.lineWidth=0.4*S;ctx.beginPath();ctx.moveTo(20*S,bowlTop+16*S);ctx.quadraticCurveTo(16*S,bowlTop+(bowlBot-bowlTop)*0.5,36*S,bowlTop+(bowlBot-bowlTop)*0.78);ctx.stroke();ctx.globalAlpha=1;
}
 
function drawRocks(ctx, canvas, fillPct, garnish, t){
  const W=canvas.width,H=canvas.height,S=W/220,cx=W/2;
  const top=28*S,bot=H-30*S,wT=100*S,wB=86*S;
  const liqY=bot-(bot-top)*fillPct;
  function clip(){ctx.beginPath();ctx.moveTo(cx-wT,top);ctx.lineTo(cx+wT,top);ctx.lineTo(cx+wB,bot);ctx.lineTo(cx-wB,bot);ctx.closePath();}
  drawLiquid(ctx,canvas,clip,bot,fillPct,2.3,t);
  ctx.strokeStyle='rgba(232,228,220,0.85)';ctx.lineWidth=0.85*S;ctx.lineJoin='round';ctx.lineCap='round';
  if(garnish==='foam'&&fillPct>0.1){ctx.save();clip();ctx.clip();const hw=wT-(wT-wB)*(liqY-top)/(bot-top);ctx.beginPath();ctx.ellipse(cx,liqY,hw*0.88,5*S,0,0,Math.PI*2);ctx.fillStyle='rgba(232,228,220,0.16)';ctx.fill();ctx.restore();}
  ctx.save();clip();ctx.clip();drawIce(ctx,cx,liqY,bot,S,t);ctx.restore();
  clip();ctx.stroke();
  const iT=9*S,iB=6*S;
  ctx.save();ctx.globalAlpha=0.22;ctx.beginPath();ctx.moveTo(cx-wT+iT,top);ctx.lineTo(cx-wB+iB,bot-5*S);ctx.stroke();ctx.beginPath();ctx.moveTo(cx+wT-iT,top);ctx.lineTo(cx+wB-iB,bot-5*S);ctx.stroke();ctx.restore();
  ctx.globalAlpha=0.18;ctx.lineWidth=0.45*S;ctx.beginPath();ctx.moveTo(cx-wB+iB,bot-5*S);ctx.quadraticCurveTo(cx,bot+5*S,cx+wB-iB,bot-5*S);ctx.stroke();ctx.beginPath();ctx.moveTo(cx-wB,bot);ctx.quadraticCurveTo(cx,bot+10*S,cx+wB,bot);ctx.stroke();ctx.globalAlpha=1;
  ctx.globalAlpha=0.2;ctx.lineWidth=1.8*S;ctx.beginPath();ctx.moveTo(cx-wT,top);ctx.lineTo(cx+wT,top);ctx.stroke();ctx.globalAlpha=1;
  ctx.globalAlpha=0.12;ctx.lineWidth=0.4*S;ctx.beginPath();ctx.moveTo(cx-wT+6*S,top+10*S);ctx.lineTo(cx-wT*0.5+4*S,top+(bot-top)*0.5);ctx.stroke();ctx.globalAlpha=1;
  if(garnish==='twist'){ctx.save();ctx.globalAlpha=0.45;ctx.strokeStyle='rgba(232,228,220,0.7)';ctx.lineWidth=0.8*S;ctx.beginPath();ctx.moveTo(cx+wT-14*S,top-4*S);ctx.quadraticCurveTo(cx+wT+2*S,top-16*S,cx+wT-8*S,top+12*S);ctx.quadraticCurveTo(cx+wT+6*S,top,cx+wT-4*S,top+22*S);ctx.stroke();ctx.restore();}
}
 
function drawHighball(ctx, canvas, fillPct, garnish, t){
  const W=canvas.width,H=canvas.height,S=W/160,cx=W/2;
  const top=22*S,bot=H-20*S,wT=54*S,wB=46*S;
  const liqY=bot-(bot-top)*fillPct;
  function clip(){ctx.beginPath();ctx.moveTo(cx-wT,top);ctx.lineTo(cx+wT,top);ctx.lineTo(cx+wB,bot);ctx.lineTo(cx-wB,bot);ctx.closePath();}
  drawLiquid(ctx,canvas,clip,bot,fillPct,4.7,t);
  ctx.strokeStyle='rgba(232,228,220,0.85)';ctx.lineWidth=0.9*S;ctx.lineJoin='round';ctx.lineCap='round';
  if(fillPct>0.3){ctx.save();clip();ctx.clip();drawIce(ctx,cx,liqY,bot,S,t,8*S);ctx.restore();}
  clip();ctx.stroke();
  const iT=8*S,iB=5*S;
  ctx.save();ctx.globalAlpha=0.22;ctx.beginPath();ctx.moveTo(cx-wT+iT,top);ctx.lineTo(cx-wB+iB,bot-4*S);ctx.stroke();ctx.beginPath();ctx.moveTo(cx+wT-iT,top);ctx.lineTo(cx+wB-iB,bot-4*S);ctx.stroke();ctx.restore();
  ctx.globalAlpha=0.18;ctx.lineWidth=0.45*S;ctx.beginPath();ctx.moveTo(cx-wB+iB,bot-4*S);ctx.quadraticCurveTo(cx,bot+5*S,cx+wB-iB,bot-4*S);ctx.stroke();ctx.beginPath();ctx.moveTo(cx-wB,bot);ctx.quadraticCurveTo(cx,bot+9*S,cx+wB,bot);ctx.stroke();ctx.globalAlpha=1;
  ctx.globalAlpha=0.2;ctx.lineWidth=1.8*S;ctx.beginPath();ctx.moveTo(cx-wT,top);ctx.lineTo(cx+wT,top);ctx.stroke();ctx.globalAlpha=1;
  ctx.globalAlpha=0.12;ctx.lineWidth=0.4*S;ctx.beginPath();ctx.moveTo(cx-wT+5*S,top+10*S);ctx.lineTo(cx-wT*0.45+4*S,top+(bot-top)*0.46);ctx.stroke();ctx.globalAlpha=1;
  if(garnish==='straw'){const swayTop=Math.sin(t*0.85)*5*S;const swayBot=Math.sin(t*0.85+0.7)*2*S;const bob=Math.sin(t*1.3)*2.8*S;const sx=cx+wT*0.46;drawStraw(ctx,sx+swayTop,top-20*S,sx+swayBot,liqY+3*S+bob,4.5*S);}
}
 
function drawMartini(ctx, canvas, fillPct, garnish, t){
  const W=canvas.width,H=canvas.height,S=W/200,cx=W/2;
  const rimY=24*S, tipY=Math.min(H*0.54,280*S), rimW=88*S;
  function bowl(){ctx.beginPath();ctx.moveTo(cx-rimW,rimY);ctx.lineTo(cx,tipY);ctx.lineTo(cx+rimW,rimY);ctx.closePath();}
  drawLiquid(ctx,canvas,bowl,tipY,fillPct,3.2,t);
  ctx.strokeStyle='rgba(232,228,220,0.85)';ctx.lineWidth=0.9*S;ctx.lineJoin='round';ctx.lineCap='round';
  if(garnish==='olive'&&fillPct>0){ctx.save();const oy=tipY-(tipY-rimY)*fillPct*0.4+Math.sin(t*0.8)*2*S;ctx.globalAlpha=0.55;ctx.strokeStyle='rgba(232,228,220,0.7)';ctx.lineWidth=0.5*S;ctx.beginPath();ctx.moveTo(cx-20*S,rimY-8*S);ctx.lineTo(cx+14*S,oy+4*S);ctx.stroke();ctx.beginPath();ctx.ellipse(cx-14*S,oy,5*S,3*S,0.3,0,Math.PI*2);ctx.stroke();ctx.restore();}
  if(garnish==='twist'){ctx.save();ctx.globalAlpha=0.45;ctx.strokeStyle='rgba(232,228,220,0.7)';ctx.lineWidth=0.7*S;ctx.beginPath();ctx.moveTo(cx+rimW-16*S,rimY+4*S);ctx.quadraticCurveTo(cx+rimW-2*S,rimY-10*S,cx+rimW-10*S,rimY+18*S);ctx.stroke();ctx.restore();}
  if(garnish==='salt'){ctx.save();ctx.globalAlpha=0.35;ctx.strokeStyle='rgba(232,228,220,0.85)';ctx.lineWidth=3*S;ctx.setLineDash([2.5,3]);ctx.beginPath();ctx.moveTo(cx-rimW,rimY);ctx.lineTo(cx+rimW,rimY);ctx.stroke();ctx.setLineDash([]);ctx.restore();}
  bowl();ctx.stroke();
  ctx.save();ctx.globalAlpha=0.2;const iRimW=rimW-14*S;ctx.beginPath();ctx.moveTo(cx-iRimW,rimY);ctx.lineTo(cx,tipY-3*S);ctx.stroke();ctx.beginPath();ctx.moveTo(cx+iRimW,rimY);ctx.lineTo(cx,tipY-3*S);ctx.stroke();ctx.restore();
  ctx.globalAlpha=0.2;ctx.lineWidth=0.5*S;ctx.beginPath();ctx.moveTo(cx-18*S,tipY);ctx.quadraticCurveTo(cx,tipY+7*S,cx+18*S,tipY);ctx.stroke();ctx.globalAlpha=1;
  ctx.lineWidth=0.9*S;ctx.beginPath();ctx.moveTo(cx,tipY);ctx.lineTo(cx,H-44*S);ctx.stroke();
  ctx.globalAlpha=0.18;ctx.lineWidth=0.4*S;ctx.beginPath();ctx.moveTo(cx+3.5*S,tipY+2*S);ctx.lineTo(cx+3.5*S,H-44*S);ctx.stroke();ctx.globalAlpha=1;
  ctx.lineWidth=0.85*S;ctx.beginPath();ctx.moveTo(cx-50*S,H-44*S);ctx.lineTo(cx+50*S,H-44*S);ctx.stroke();
  ctx.globalAlpha=0.18;ctx.lineWidth=0.45*S;ctx.beginPath();ctx.moveTo(cx-50*S,H-44*S);ctx.quadraticCurveTo(cx,H-36*S,cx+50*S,H-44*S);ctx.stroke();ctx.globalAlpha=1;
  ctx.globalAlpha=0.18;ctx.lineWidth=1.6*S;ctx.beginPath();ctx.moveTo(cx-rimW,rimY);ctx.lineTo(cx+rimW,rimY);ctx.stroke();ctx.globalAlpha=1;
  ctx.globalAlpha=0.12;ctx.lineWidth=0.4*S;ctx.beginPath();ctx.moveTo(cx-rimW+8*S,rimY+10*S);ctx.lineTo(cx-rimW*0.35,rimY+(tipY-rimY)*0.6);ctx.stroke();ctx.globalAlpha=1;
}
 
function drawWine(ctx, canvas, fillPct, garnish, t){
  const W=canvas.width,H=canvas.height,S=W/200,cx=W/2;
  const bowlTop=22*S, neckY=Math.min(H*0.46,240*S), bowlMidY=bowlTop+(neckY-bowlTop)*0.55;
  const rimW=50*S, bowlW=72*S, neckW=18*S;
  function bowl(){ctx.beginPath();ctx.moveTo(cx-rimW,bowlTop);ctx.bezierCurveTo(cx-bowlW,bowlTop+(neckY-bowlTop)*0.25,cx-bowlW,bowlTop+(neckY-bowlTop)*0.65,cx-neckW,neckY);ctx.lineTo(cx+neckW,neckY);ctx.bezierCurveTo(cx+bowlW,bowlTop+(neckY-bowlTop)*0.65,cx+bowlW,bowlTop+(neckY-bowlTop)*0.25,cx+rimW,bowlTop);ctx.closePath();}
  drawLiquid(ctx,canvas,bowl,neckY,fillPct,5.5,t);
  ctx.strokeStyle='rgba(232,228,220,0.85)';ctx.lineWidth=0.9*S;ctx.lineJoin='round';ctx.lineCap='round';
  if(garnish==='twist'){ctx.save();ctx.globalAlpha=0.45;ctx.strokeStyle='rgba(232,228,220,0.7)';ctx.lineWidth=0.7*S;ctx.beginPath();ctx.moveTo(cx+rimW-14*S,bowlTop+4*S);ctx.quadraticCurveTo(cx+rimW+2*S,bowlTop-10*S,cx+rimW-8*S,bowlTop+18*S);ctx.stroke();ctx.restore();}
  bowl();ctx.stroke();
  const iRW=rimW-14*S,iBW=bowlW-10*S,iNW=neckW-3*S;
  ctx.save();ctx.globalAlpha=0.2;ctx.beginPath();ctx.moveTo(cx-iRW,bowlTop);ctx.bezierCurveTo(cx-iBW,bowlTop+(neckY-bowlTop)*0.25,cx-iBW,bowlTop+(neckY-bowlTop)*0.65,cx-iNW,neckY-3*S);ctx.stroke();ctx.beginPath();ctx.moveTo(cx+iRW,bowlTop);ctx.bezierCurveTo(cx+iBW,bowlTop+(neckY-bowlTop)*0.25,ctx+iBW,bowlTop+(neckY-bowlTop)*0.65,cx+iNW,neckY-3*S);ctx.stroke();ctx.restore();
  ctx.lineWidth=0.85*S;ctx.beginPath();ctx.moveTo(cx-neckW,neckY);ctx.lineTo(cx-4*S,neckY+18*S);ctx.lineTo(cx-3*S,H-44*S);ctx.stroke();ctx.beginPath();ctx.moveTo(cx+neckW,neckY);ctx.lineTo(cx+4*S,neckY+18*S);ctx.lineTo(cx+3*S,H-44*S);ctx.stroke();
  ctx.globalAlpha=0.18;ctx.lineWidth=0.4*S;ctx.beginPath();ctx.moveTo(cx+5*S,neckY+4*S);ctx.lineTo(cx+4.5*S,H-44*S);ctx.stroke();ctx.globalAlpha=1;
  ctx.lineWidth=0.85*S;ctx.beginPath();ctx.moveTo(cx-50*S,H-44*S);ctx.lineTo(cx+50*S,H-44*S);ctx.stroke();
  ctx.globalAlpha=0.18;ctx.lineWidth=0.45*S;ctx.beginPath();ctx.moveTo(cx-50*S,H-44*S);ctx.quadraticCurveTo(cx,H-36*S,cx+50*S,H-44*S);ctx.stroke();ctx.globalAlpha=1;
  ctx.globalAlpha=0.18;ctx.lineWidth=1.6*S;ctx.beginPath();ctx.moveTo(cx-rimW,bowlTop);ctx.lineTo(cx+rimW,bowlTop);ctx.stroke();ctx.globalAlpha=1;
  ctx.globalAlpha=0.12;ctx.lineWidth=0.4*S;ctx.beginPath();ctx.moveTo(cx-rimW+6*S,bowlTop+14*S);ctx.bezierCurveTo(cx-bowlW+4*S,bowlMidY,cx-bowlW*0.5,bowlMidY+20*S,cx-neckW+4*S,neckY-10*S);ctx.stroke();ctx.globalAlpha=1;
}
 
function drawHurricane(ctx, canvas, fillPct, garnish, t){
  const W=canvas.width,H=canvas.height,S=W/180,cx=W/2;
  const top=20*S,bot=H-20*S,rimW=62*S,midW=34*S,baseW=50*S,midY=top+(bot-top)*0.4;
  function clip(){ctx.beginPath();ctx.moveTo(cx-rimW,top);ctx.bezierCurveTo(cx-rimW*0.5,top+(bot-top)*0.15,cx-midW,midY-20*S,cx-midW,midY);ctx.bezierCurveTo(cx-midW,midY+20*S,cx-baseW*0.9,bot-30*S,cx-baseW,bot);ctx.lineTo(cx+baseW,bot);ctx.bezierCurveTo(cx+baseW*0.9,bot-30*S,cx+midW,midY+20*S,cx+midW,midY);ctx.bezierCurveTo(cx+midW,midY-20*S,cx+rimW*0.5,top+(bot-top)*0.15,cx+rimW,top);ctx.closePath();}
  drawLiquid(ctx,canvas,clip,bot,fillPct,6.1,t);
  ctx.strokeStyle='rgba(232,228,220,0.85)';ctx.lineWidth=0.9*S;ctx.lineJoin='round';ctx.lineCap='round';
  if(fillPct>0.3){ctx.save();clip();ctx.clip();drawIce(ctx,cx,bot-(bot-top)*fillPct,bot,S,t,5*S);ctx.restore();}
  clip();ctx.stroke();
  const iRW=rimW-14*S,iMW=midW-5*S,iBW=baseW-7*S;
  ctx.save();ctx.globalAlpha=0.2;ctx.beginPath();ctx.moveTo(cx-iRW,top);ctx.bezierCurveTo(cx-iRW*0.5,top+(bot-top)*0.15,cx-iMW,midY-20*S,cx-iMW,midY);ctx.bezierCurveTo(cx-iMW,midY+20*S,cx-iBW*0.9,bot-30*S,cx-iBW,bot-4*S);ctx.stroke();ctx.beginPath();ctx.moveTo(cx+iRW,top);ctx.bezierCurveTo(cx+iRW*0.5,top+(bot-top)*0.15,cx+iMW,midY-20*S,cx+iMW,midY);ctx.bezierCurveTo(cx+iMW,midY+20*S,cx+iBW*0.9,bot-30*S,cx+iBW,bot-4*S);ctx.stroke();ctx.restore();
  ctx.globalAlpha=0.18;ctx.lineWidth=0.45*S;ctx.beginPath();ctx.moveTo(cx-baseW,bot);ctx.quadraticCurveTo(cx,bot+10*S,cx+baseW,bot);ctx.stroke();ctx.globalAlpha=1;
  ctx.globalAlpha=0.18;ctx.lineWidth=1.8*S;ctx.beginPath();ctx.moveTo(cx-rimW,top);ctx.lineTo(cx+rimW,top);ctx.stroke();ctx.globalAlpha=1;
  ctx.globalAlpha=0.12;ctx.lineWidth=0.4*S;ctx.beginPath();ctx.moveTo(cx-rimW+8*S,top+14*S);ctx.bezierCurveTo(cx-rimW*0.4,top+(bot-top)*0.14,cx-midW+4*S,midY-14*S,cx-midW+4*S,midY+10*S);ctx.stroke();ctx.globalAlpha=1;
  if(garnish==='straw'){const liqSurf=bot-(bot-top)*fillPct;const swayTop=Math.sin(t*0.82)*6*S;const swayBot=Math.sin(t*0.82+0.7)*2.5*S;const bob=Math.sin(t*1.2)*3*S;const sx=cx+rimW*0.48;drawStraw(ctx,sx+swayTop,top-22*S,sx+swayBot,liqSurf+3*S+bob,4.5*S);}
}
 
function drawFlute(ctx, canvas, fillPct, garnish, t){
  const W=canvas.width,H=canvas.height,S=W/200,cx=W/2;
  const top=20*S,bowlBot=H-85*S,rimW=26*S,baseW=14*S;
  function clip(){ctx.beginPath();ctx.moveTo(cx-rimW,top);ctx.lineTo(cx-baseW,bowlBot);ctx.lineTo(cx+baseW,bowlBot);ctx.lineTo(cx+rimW,top);ctx.closePath();}
  drawLiquid(ctx,canvas,clip,bowlBot,fillPct,7.3,t);
  ctx.strokeStyle='rgba(232,228,220,0.85)';ctx.lineWidth=0.9*S;ctx.lineJoin='round';ctx.lineCap='round';
  if(fillPct>0){ctx.save();clip();ctx.clip();const liqTop=bowlBot-(bowlBot-top)*fillPct;for(let i=0;i<6;i++){const bx=cx-10*S+i*4*S;const phase=t*0.8+i*1.1;const by=bowlBot-((phase%4)/4)*(bowlBot-liqTop);const br=0.8+Math.sin(i*2.3)*0.4;ctx.beginPath();ctx.arc(bx,by,br*S,0,Math.PI*2);ctx.strokeStyle='rgba(232,228,220,0.25)';ctx.lineWidth=0.4*S;ctx.stroke();}ctx.restore();}
  clip();ctx.stroke();
  const iRW=rimW-8*S,iBW=baseW-3*S;
  ctx.save();ctx.globalAlpha=0.2;ctx.beginPath();ctx.moveTo(cx-iRW,top);ctx.lineTo(cx-iBW,bowlBot-3*S);ctx.stroke();ctx.beginPath();ctx.moveTo(cx+iRW,top);ctx.lineTo(cx+iBW,bowlBot-3*S);ctx.stroke();ctx.restore();
  ctx.globalAlpha=0.2;ctx.lineWidth=0.45*S;ctx.beginPath();ctx.moveTo(cx-baseW,bowlBot);ctx.quadraticCurveTo(cx,bowlBot+5*S,cx+baseW,bowlBot);ctx.stroke();ctx.globalAlpha=1;
  ctx.lineWidth=0.85*S;ctx.beginPath();ctx.moveTo(cx-baseW,bowlBot);ctx.lineTo(cx-2*S,bowlBot+14*S);ctx.lineTo(cx-2*S,H-44*S);ctx.stroke();ctx.beginPath();ctx.moveTo(cx+baseW,bowlBot);ctx.lineTo(cx+2*S,bowlBot+14*S);ctx.lineTo(cx+2*S,H-44*S);ctx.stroke();
  ctx.globalAlpha=0.18;ctx.lineWidth=0.4*S;ctx.beginPath();ctx.moveTo(cx+3.5*S,bowlBot+6*S);ctx.lineTo(cx+3.5*S,H-44*S);ctx.stroke();ctx.globalAlpha=1;
  ctx.lineWidth=0.85*S;ctx.beginPath();ctx.moveTo(cx-46*S,H-44*S);ctx.lineTo(cx+46*S,H-44*S);ctx.stroke();
  ctx.globalAlpha=0.18;ctx.lineWidth=0.45*S;ctx.beginPath();ctx.moveTo(cx-46*S,H-44*S);ctx.quadraticCurveTo(cx,H-36*S,cx+46*S,H-44*S);ctx.stroke();ctx.globalAlpha=1;
  ctx.globalAlpha=0.18;ctx.lineWidth=1.6*S;ctx.beginPath();ctx.moveTo(cx-rimW,top);ctx.lineTo(cx+rimW,top);ctx.stroke();ctx.globalAlpha=1;
  ctx.globalAlpha=0.12;ctx.lineWidth=0.4*S;ctx.beginPath();ctx.moveTo(cx-rimW+4*S,top+10*S);ctx.lineTo(cx-rimW*0.4+2*S,top+(bowlBot-top)*0.5);ctx.stroke();ctx.globalAlpha=1;
}
 
function drawGlass(ctx, canvas, type, fillPct, garnish, t){
  switch(type){
    case 'coupe':     drawCoupe(ctx,canvas,fillPct,garnish,t);    break;
    case 'rocks':     drawRocks(ctx,canvas,fillPct,garnish,t);    break;
    case 'highball':  drawHighball(ctx,canvas,fillPct,garnish,t); break;
    case 'martini':   drawMartini(ctx,canvas,fillPct,garnish,t);  break;
    case 'wine':      drawWine(ctx,canvas,fillPct,garnish,t);     break;
    case 'hurricane': drawHurricane(ctx,canvas,fillPct,garnish,t);break;
    case 'flute':     drawFlute(ctx,canvas,fillPct,garnish,t);    break;
    default:          drawHighball(ctx,canvas,fillPct,garnish,t);
  }
}
 
 
// ═══════════════════════════════════════════════
// HERO
// ═══════════════════════════════════════════════
 
document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);
 
  function positionMixoDots() {
    const hero = document.getElementById('hero');
    const vw = hero.offsetWidth, vh = hero.offsetHeight;
    const IMG_RATIO = 1920 / 1080;
    let renderedW, renderedH, offsetX, offsetY;
    if (vw / vh > IMG_RATIO) { renderedW=vw; renderedH=vw/IMG_RATIO; offsetX=0; offsetY=(vh-renderedH)/2; }
    else { renderedH=vh; renderedW=vh*IMG_RATIO; offsetX=(vw-renderedW)/2; offsetY=0; }
    const dots = [{x:.26,y:.48},{x:.35,y:.51},{x:.40,y:.53},{x:.44,y:.57},{x:.50,y:.52},{x:.57,y:.53},{x:.62,y:.50},{x:.69,y:.52},{x:.72,y:.49}];
    hero.querySelectorAll('.mixo').forEach((el, i) => {
      if (!dots[i]) return;
      el.style.left   = (offsetX + dots[i].x * renderedW) + 'px';
      el.style.top    = (offsetY + dots[i].y * renderedH) + 'px';
      el.style.bottom = 'auto';
    });
  }
  positionMixoDots();
  window.addEventListener('resize', positionMixoDots);
 
  gsap.timeline({ delay: .2 })
    .fromTo('.hero-logo',      { opacity:0, y:40 }, { opacity:1, y:0, duration:1.3, ease:'power3.out' })
    .fromTo('.hero-info-text', { opacity:0, y:20 }, { opacity:1, y:0, duration:1,   ease:'power2.out' }, '-=.7')
    .fromTo('.hero-captions',  { opacity:0 },       { opacity:1, duration:.8 }, '-=.4')
    .fromTo('.mixo-dot',       { scale:0 },         { scale:1, stagger:.12, duration:.5, ease:'back.out' }, '-=.5');
 
  gsap.to('.hero-bg', { yPercent:15, ease:'none', scrollTrigger:{ trigger:'#hero', start:'top top', end:'bottom top', scrub:true } });
  gsap.to('.hero-fg', { yPercent:-10, ease:'none', scrollTrigger:{ trigger:'#hero', start:'top top', end:'bottom top', scrub:true } });
});
 
 
// ═══════════════════════════════════════════════
// LOADER
// ═══════════════════════════════════════════════
 
(function () {
  const loader = document.getElementById('loader');
  const rect   = document.getElementById('loader-rect');
  const W = () => window.innerWidth;
  const H = () => window.innerHeight;
 
  gsap.timeline({
    onComplete: () => gsap.to(loader, { autoAlpha:0, duration:.25, onComplete:() => loader.remove() })
  })
    .to(rect, { width:6,  height:55, duration:.35, ease:'sine.inOut' })
    .to(rect, { width:48, height:5,  duration:.35, ease:'sine.inOut' })
    .to(rect, { width:9,  height:82, duration:.35, ease:'sine.inOut' })
    .to(rect, { width:()=>W(), height:5,    duration:.22, ease:'expo.out' }, '+=.04')
    .to(rect, { height:()=>H(),             duration:.26, ease:'expo.out' }, '+=.02')
    .to(loader, { backgroundColor:'transparent', duration:.01 }, '<.25')
    .to(rect,   { opacity:0, duration:.28, ease:'power2.out' }, '<.01');
})();
 
 
// ═══════════════════════════════════════════════
// NAV
// ═══════════════════════════════════════════════
 
ScrollTrigger.create({
  trigger: '#hero',
  start: 'bottom 80px',
  onEnter:     () => document.getElementById('nav').classList.add('solid'),
  onLeaveBack: () => document.getElementById('nav').classList.remove('solid'),
});
 
const burger = document.getElementById('navBurger');
const navR   = document.querySelector('.nav-r');
const navEl  = document.getElementById('nav');
 
burger.addEventListener('click', () => { navEl.classList.toggle('menu-open'); navR.classList.toggle('open'); });
navR.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { navEl.classList.remove('menu-open'); navR.classList.remove('open'); }));
 
 
// ═══════════════════════════════════════════════
// REVEALS
// ═══════════════════════════════════════════════
 
document.querySelectorAll('.js-line').forEach(el => {
  ScrollTrigger.create({ trigger:el, start:'top 90%', onEnter:() => el.classList.add('in') });
});
document.querySelectorAll('.js-fade').forEach((el, i) => {
  ScrollTrigger.create({ trigger:el, start:'top 88%', onEnter:() => setTimeout(() => el.classList.add('in'), (i % 6) * 60) });
});
 
 
// ═══════════════════════════════════════════════
// PHOTO GRID
// ═══════════════════════════════════════════════
 
(function initPhotoGrid() {
  const grid = document.querySelector('.photo-grid');
  if (!grid) return;
  const c = { c0:1, c1:1 };
  const r = { r0:260, r1:200 };
 
  function applyGrid() {
    grid.style.gridTemplateColumns = `${c.c0}fr ${c.c1}fr`;
    grid.style.gridTemplateRows    = `${r.r0}px ${r.r1}px`;
  }
  function getColRow(cell) {
    const cells = [...grid.querySelectorAll('.photo-cell')];
    const idx   = cells.indexOf(cell);
    if (idx === 0) return { col:0, row:-1 };
    if (idx === 1) return { col:1, row:0 };
    return { col:1, row:1 };
  }
  function expandCell(cell) {
    cell.classList.add('is-hovered');
    const { col, row } = getColRow(cell);
    gsap.killTweensOf(c); gsap.killTweensOf(r);
    gsap.to(c, { c0:col===0?1.5:.5, c1:col===1?1.5:.5, duration:.38, ease:'power2.out', overwrite:true, onUpdate:applyGrid });
    if (row >= 0) gsap.to(r, { r0:row===0?320:200, r1:row===1?260:140, duration:.38, ease:'power2.out', overwrite:true, delay:.26, onUpdate:applyGrid });
  }
  function collapseAll() {
    grid.querySelectorAll('.photo-cell').forEach(cell => cell.classList.remove('is-hovered'));
    gsap.killTweensOf(c); gsap.killTweensOf(r);
    gsap.to(c, { c0:1, c1:1, duration:.5, ease:'power3.inOut', overwrite:true, onUpdate:applyGrid });
    gsap.to(r, { r0:260, r1:200, duration:.45, ease:'power3.inOut', overwrite:true, delay:.05, onUpdate:applyGrid });
  }
 
  grid.querySelectorAll('.photo-cell').forEach(cell => {
    cell.addEventListener('touchstart', (e) => { e.preventDefault(); cell.classList.contains('is-hovered') ? collapseAll() : (collapseAll(), expandCell(cell)); }, { passive:false });
    cell.addEventListener('mouseenter', () => { document.body.classList.add('cursor-hover'); expandCell(cell); });
    cell.addEventListener('mouseleave', () => { cell.classList.remove('is-hovered'); document.body.classList.remove('cursor-hover'); collapseAll(); });
  });
  document.addEventListener('touchstart', (e) => { if (!e.target.closest('.photo-cell')) collapseAll(); }, { passive:true });
})();
 
 
// ═══════════════════════════════════════════════
// FERMETURE MOBILE
// ═══════════════════════════════════════════════
 
if (isTouchDevice()) {
  document.addEventListener('touchstart', (e) => {
    if (!e.target.closest('.cal-day')) {
      document.querySelectorAll('.cal-day.is-hovered').forEach(c => c.classList.remove('is-hovered'));
      gsap.killTweensOf(cols); gsap.killTweensOf(rows);
      const rC = {}, rR = {};
      for (let i = 0; i < COL_COUNT; i++) rC[`c${i}`] = COL_BASE;
      for (let i = 0; i < numRows;   i++) rR[`r${i}`] = ROW_BASE_H;
      gsap.to(cols, { ...rC, duration:.45, ease:'power3.inOut', onUpdate:applyGrid });
      gsap.to(rows, { ...rR, duration:.40, ease:'power3.inOut', delay:.05, onUpdate:applyGrid });
    }
    if (!e.target.closest('.drink-cell')) {
      document.querySelectorAll('.drink-cell.is-hovered').forEach(c => {
        c.classList.remove('is-hovered');
        c.querySelectorAll('.fl-bar').forEach(b => gsap.to(b, { scaleX:0, duration:.35, ease:'power2.in', transformOrigin:'left' }));
      });
    }
  }, { passive:true });
}
 
 
// ═══════════════════════════════════════════════
// WORD-SMALL ANIMATION
// ═══════════════════════════════════════════════
 
const wordSmalls = document.querySelectorAll('.word-small');
 
new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('refined'), 400);
    } else {
      entry.target.classList.remove('refined');
    }
  });
}, { threshold: 0.8 }).observe !== undefined && (() => {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) setTimeout(() => entry.target.classList.add('refined'), 400);
      else entry.target.classList.remove('refined');
    });
  }, { threshold: 0.8 });
  wordSmalls.forEach(el => obs.observe(el));
})();
