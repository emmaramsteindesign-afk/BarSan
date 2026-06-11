const MONTHS = ['January','February','March','April','May','June',
  'July','August','September','October','November','December'];

const events = {
  '2026-6-4':  { name: 'DJ Night — House & Nu-Jazz',  desc: 'Local DJ sets blending house and nu-jazz until midnight. No cover charge.', img: './assets/images/bar-01.webp' },
  '2026-6-9':  { name: 'Cocktail Tasting Menu',        desc: 'A guided 5-cocktail journey through seasonal ingredients. Booking required.', img: './assets/images/bar-02.webp' },
  '2026-6-19': { name: 'Live Jazz Quartet',             desc: 'Four musicians, one evening. Standards and originals from 8 PM.', img: './assets/images/bar-03.webp' },
  '2026-6-21': { name: 'Mezcal & Fire',                 desc: 'A special menu built around smoked spirits and Thai chili. Limited seats.', img: './assets/images/bar-01.webp' },
  '2026-7-2':  { name: 'Acoustic Duo',                  desc: 'Intimate acoustic set. Arrive early, it fills up fast.', img: './assets/images/bar-02.webp' },
  '2026-7-8':  { name: "Bartender's Special",           desc: 'One night, one menu. Our head bartender takes over completely.', img: './assets/images/bar-03.webp' },
  '2026-7-15': { name: 'Sake & Umami',                  desc: 'Curated sake pairings with small Japanese-inspired bites.', img: './assets/images/bar-01.webp' },
  '2026-7-21': { name: 'Independence Night',            desc: 'Open bar format, live music, until 1 AM.', img: './assets/images/bar-02.webp' },
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

function attachStretch(cell) {
  cell.addEventListener('mouseenter', () => {
    cell.classList.add('is-hovered');
    document.body.classList.add('cursor-hover');

    const { col, row } = getCellSlot(cell);
    const totalFr = COL_COUNT * COL_BASE;
    const otherFr = (totalFr - COL_EXPAND) / (COL_COUNT - 1);
    const tCols = {};
    for (let i = 0; i < COL_COUNT; i++)
      tCols[`c${i}`] = i === col ? COL_EXPAND : otherFr;

    const tRows = {};
    const freed  = ROW_EXPAND - ROW_BASE_H;
    const shrink = numRows > 1 ? freed / (numRows - 1) : 0;
    for (let i = 0; i < numRows; i++)
      tRows[`r${i}`] = i === row ? ROW_EXPAND : ROW_BASE_H - shrink;

    gsap.killTweensOf(cols);
    gsap.killTweensOf(rows);
    gsap.to(cols, { ...tCols, duration: .35, ease: 'power2.out', overwrite: true, onUpdate: applyGrid });
    gsap.to(rows, { ...tRows, duration: .35, ease: 'power2.out', overwrite: true, delay: .22, onUpdate: applyGrid });
  });

  cell.addEventListener('mouseleave', () => {
    cell.classList.remove('is-hovered');
    document.body.classList.remove('cursor-hover');

    const rCols = {};
    for (let i = 0; i < COL_COUNT; i++) rCols[`c${i}`] = COL_BASE;
    const rRows = {};
    for (let i = 0; i < numRows; i++)   rRows[`r${i}`] = ROW_BASE_H;

    gsap.killTweensOf(cols);
    gsap.killTweensOf(rows);
    gsap.to(cols, { ...rCols, duration: .45, ease: 'power3.inOut', overwrite: true, onUpdate: applyGrid });
    gsap.to(rows, { ...rRows, duration: .40, ease: 'power3.inOut', overwrite: true, delay: .05, onUpdate: applyGrid });
  });
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

    attachStretch(cell); // ← manquait !
    grid.appendChild(cell);
  }
}

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