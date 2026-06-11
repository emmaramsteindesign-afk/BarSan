gsap.registerPlugin(ScrollTrigger);

gsap.set('.footer-info', { opacity: 0 });
gsap.set('.footer-logo', { opacity: 0, x: 50 });

// Départ : lignes égales (texte centré)
gsap.set('.footer-line', { flexGrow: 1, flexShrink: 1, flexBasis: '0%', scaleX: 0 });
gsap.set('.footer-line--left',  { transformOrigin: 'left' });
gsap.set('.footer-line--right', { transformOrigin: 'right' });

const row1L = document.querySelector('.footer-row:nth-child(1) .footer-line--left');
const row1R = document.querySelector('.footer-row:nth-child(1) .footer-line--right');
const row2L = document.querySelector('.footer-row:nth-child(2) .footer-line--left');
const row2R = document.querySelector('.footer-row:nth-child(2) .footer-line--right');
const row3L = document.querySelector('.footer-row:nth-child(3) .footer-line--left');
const row3R = document.querySelector('.footer-row:nth-child(3) .footer-line--right');

const footerTl = gsap.timeline({
  scrollTrigger: { trigger: '.footer', start: 'top 80%' }
});

footerTl
  // Étape 1 — lignes s'étirent symétriquement, texte centré
  .to('.footer-line', {
    scaleX: 1,
    duration: 0.8,
    stagger: 0.12,
    ease: 'power3.out'
  })
  .to('.footer-info', {
    opacity: 1,
    duration: 0.4,
    stagger: 0.12
  }, '-=0.4')

  // Étape 2 — poussée : flexGrow 1→20 d'un côté, 1→0.05 de l'autre
  .to([row1L, row3L], { flexGrow: 20, duration: 0.9, ease: 'power4.inOut' }, '+=0.3')
  .to([row1R, row3R], { flexGrow: 0.05, duration: 0.9, ease: 'power4.inOut' }, '<')
  .to(row2R,          { flexGrow: 20, duration: 0.9, ease: 'power4.inOut' }, '<')
  .to(row2L,          { flexGrow: 0.05, duration: 0.9, ease: 'power4.inOut' }, '<')

  .to('.footer-logo', {
    opacity: 1, x: 0,
    duration: 1, ease: 'power3.out'
  }, '-=0.5');