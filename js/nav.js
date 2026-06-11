ScrollTrigger.create({
  trigger: '#hero',
  start: 'bottom 80px',
  onEnter:     () => document.getElementById('nav').classList.add('solid'),
  onLeaveBack: () => document.getElementById('nav').classList.remove('solid'),
});
const burger = document.getElementById('navBurger');
const navR   = document.querySelector('.nav-r');
const navEl  = document.getElementById('nav');

burger.addEventListener('click', () => {
  navEl.classList.toggle('menu-open');
  navR.classList.toggle('open');
});

// Ferme au clic sur un lien
navR.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navEl.classList.remove('menu-open');
    navR.classList.remove('open');
  });
});