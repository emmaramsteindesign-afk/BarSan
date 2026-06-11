// js/hero.js

document.addEventListener('DOMContentLoaded', () => {

  gsap.registerPlugin(ScrollTrigger);

  function positionMixoDots() {
    const hero = document.getElementById('hero');
    const vw = hero.offsetWidth;
    const vh = hero.offsetHeight;
    const IMG_RATIO = 1920 / 1080;

    let renderedW, renderedH, offsetX, offsetY;
    if (vw / vh > IMG_RATIO) {
      renderedW = vw;
      renderedH = vw / IMG_RATIO;
      offsetX   = 0;
      offsetY   = (vh - renderedH) / 2;
    } else {
      renderedH = vh;
      renderedW = vh * IMG_RATIO;
      offsetX   = (vw - renderedW) / 2;
      offsetY   = 0;
    }

    const dots = [
      { x: 0.26, y: 0.48 },
      { x: 0.35, y: 0.51 },
      { x: 0.40, y: 0.53 },
      { x: 0.44, y: 0.57 },
      { x: 0.50, y: 0.52 },
      { x: 0.57, y: 0.53 },
      { x: 0.62, y: 0.50 },
      { x: 0.69, y: 0.52 },
      { x: 0.72, y: 0.49 },
    ];

    hero.querySelectorAll('.mixo').forEach((el, i) => {
      if (!dots[i]) return;
      el.style.left   = (offsetX + dots[i].x * renderedW) + 'px';
      el.style.top    = (offsetY + dots[i].y * renderedH) + 'px';
      el.style.bottom = 'auto';
    });
  }

  positionMixoDots();
  window.addEventListener('resize', positionMixoDots);

  // entrance
  const tl = gsap.timeline({ delay: .2 });
  tl.fromTo('.hero-logo',      { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1.3, ease: 'power3.out' })
    .fromTo('.hero-info-text', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1,   ease: 'power2.out' }, '-=.7')
    .fromTo('.hero-captions',  { opacity: 0 },        { opacity: 1, duration: .8 }, '-=.4')
    .fromTo('.mixo-dot',       { scale: 0 },          { scale: 1, stagger: .12, duration: .5, ease: 'back.out' }, '-=.5');

  // parallax — fonctionne uniquement si .hero-bg a top:-15% height:130% dans le CSS
  gsap.to('.hero-bg', {
    yPercent: 15,
    ease: 'none',
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true
    }
  });

  gsap.to('.hero-fg', {
    yPercent: -10,
    ease: 'none',
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true
    }
  });

});