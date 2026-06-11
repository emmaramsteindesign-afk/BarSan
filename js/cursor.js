const cur  = document.getElementById('cur');
const curR = document.getElementById('curR');

let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

(function loop() {
  rx += (mx - rx) * .18;
  ry += (my - ry) * .18;
  cur.style.left  = mx + 'px';
  cur.style.top   = my + 'px';
  curR.style.left = rx + 'px';
  curR.style.top  = ry + 'px';
  requestAnimationFrame(loop);
})();

document.querySelectorAll('a,button,.mixo,.photo-cell,.drink-cell,.cal-day,.food-row').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});
/* Patch : curseur blanc sur #drinks */
(function(){
  const drinksSection = document.getElementById('drinks');
  if (!drinksSection) return;

  const cur  = document.getElementById('cur');
  const curR = document.getElementById('curR');
  if (!cur || !curR) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        cur.style.background  = '#fff';
        cur.style.mixBlendMode = 'normal';
        curR.style.borderColor = 'rgba(255,255,255,.45)';
      } else {
        cur.style.background  = '';
        cur.style.mixBlendMode = '';
        curR.style.borderColor = '';
      }
    });
  }, { threshold: 0.1 });

  obs.observe(drinksSection);

  /* aussi : hover curseur sur les colonnes */
  document.querySelectorAll('.da-col').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
})();