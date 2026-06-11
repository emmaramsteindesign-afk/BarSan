// ── scroll reveals ─────────────────────────────────────────────
document.querySelectorAll('.js-line').forEach(el => {
  ScrollTrigger.create({
    trigger: el, start: 'top 90%',
    onEnter: () => el.classList.add('in'),
  });
});
document.querySelectorAll('.js-fade').forEach((el, i) => {
  ScrollTrigger.create({
    trigger: el, start: 'top 88%',
    onEnter: () => setTimeout(() => el.classList.add('in'), (i % 6) * 60),
  });
});

// ── PHOTO GRID ─────────────────────────────────────────────────
(function initPhotoGrid() {
  const grid = document.querySelector('.photo-grid');
  if (!grid) return;

  const COL_EXPAND  = 1.5;
  const COL_OTHER   = 0.5;
  const ROW_EXPAND_0 = 320;
  const ROW_EXPAND_1 = 260;
  const ROW_SHRINK_0 = 200;
  const ROW_SHRINK_1 = 140;

  const c = { c0: 1, c1: 1 };
  const r = { r0: 260, r1: 200 };

  function applyGrid() {
    grid.style.gridTemplateColumns = `${c.c0}fr ${c.c1}fr`;
    grid.style.gridTemplateRows    = `${r.r0}px ${r.r1}px`;
  }

  function getColRow(cell) {
    const cells = [...grid.querySelectorAll('.photo-cell')];
    const idx   = cells.indexOf(cell);
    if (idx === 0) return { col: 0, row: -1 };
    if (idx === 1) return { col: 1, row: 0 };
    return { col: 1, row: 1 };
  }

  function expandCell(cell) {
    cell.classList.add('is-hovered');
    const { col, row } = getColRow(cell);
    gsap.killTweensOf(c);
    gsap.killTweensOf(r);
    gsap.to(c, {
      c0: col === 0 ? COL_EXPAND : COL_OTHER,
      c1: col === 1 ? COL_EXPAND : COL_OTHER,
      duration: .38, ease: 'power2.out',
      overwrite: true, onUpdate: applyGrid,
    });
    if (row >= 0) {
      gsap.to(r, {
        r0: row === 0 ? ROW_EXPAND_0 : ROW_SHRINK_0,
        r1: row === 1 ? ROW_EXPAND_1 : ROW_SHRINK_1,
        duration: .38, ease: 'power2.out',
        overwrite: true, delay: .26, onUpdate: applyGrid,
      });
    }
  }

  function collapseAll() {
    grid.querySelectorAll('.photo-cell').forEach(cell => cell.classList.remove('is-hovered'));
    gsap.killTweensOf(c);
    gsap.killTweensOf(r);
    gsap.to(c, {
      c0: 1, c1: 1,
      duration: .5, ease: 'power3.inOut',
      overwrite: true, onUpdate: applyGrid,
    });
    gsap.to(r, {
      r0: 260, r1: 200,
      duration: .45, ease: 'power3.inOut',
      overwrite: true, delay: .05, onUpdate: applyGrid,
    });
  }

  grid.querySelectorAll('.photo-cell').forEach(cell => {

    // ── Touch (fonctionne aussi dans Firefox DevTools) ──
    cell.addEventListener('touchstart', (e) => {
      e.preventDefault(); // coupe le ghost-click 300ms
      if (cell.classList.contains('is-hovered')) {
        collapseAll();
      } else {
        collapseAll();
        expandCell(cell);
      }
    }, { passive: false });

    // ── Mouse / desktop ──
    cell.addEventListener('mouseenter', () => {
      document.body.classList.add('cursor-hover');
      expandCell(cell);
    });
    cell.addEventListener('mouseleave', () => {
      cell.classList.remove('is-hovered');
      document.body.classList.remove('cursor-hover');
      collapseAll();
    });
  });

  // Tap en dehors de la grille → collapse
  document.addEventListener('touchstart', (e) => {
    if (!e.target.closest('.photo-cell')) collapseAll();
  }, { passive: true });

})();