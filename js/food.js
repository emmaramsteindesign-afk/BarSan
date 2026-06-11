{
  const foodCols   = document.getElementById('foodCols');
  const foodColEls = [...foodCols.querySelectorAll('.food-col')];
  const COL_N      = foodColEls.length;
  const COL_BASE   = 1;
  const COL_EXPAND = 2.0;
  const fCols = {};
  for (let i = 0; i < COL_N; i++) fCols[`c${i}`] = COL_BASE;

  function applyFoodGrid() {
    const vals = Array.from({ length: COL_N }, (_, i) => `${fCols['c' + i]}fr`).join(' ');
    foodCols.style.gridTemplateColumns = vals;
  }

  foodColEls.forEach((col, idx) => {
    const label = col.querySelector('.food-col-label');
    const items = col.querySelectorAll('.food-item');

    label.addEventListener('mouseenter', () => {
      const other = (COL_N * COL_BASE - COL_EXPAND) / (COL_N - 1);
      const target = {};
      for (let i = 0; i < COL_N; i++)
        target[`c${i}`] = i === idx ? COL_EXPAND : other;
      gsap.killTweensOf(fCols);
      gsap.to(fCols, { ...target, duration: .4, ease: 'power2.out', overwrite: true, onUpdate: applyFoodGrid });
      gsap.to(items, { opacity: 1, y: 0, duration: .4, stagger: .07, ease: 'power3.out' });
    });

    label.addEventListener('mouseleave', () => {
      const reset = {};
      for (let i = 0; i < COL_N; i++) reset[`c${i}`] = COL_BASE;
      gsap.killTweensOf(fCols);
      gsap.to(fCols, { ...reset, duration: .5, ease: 'power3.inOut', overwrite: true, onUpdate: applyFoodGrid });
      gsap.to(items, { opacity: 0, y: 8, duration: .3, ease: 'power2.in' });
    });
  });
}