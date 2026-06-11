(function () {
  const loader = document.getElementById('loader');
  const rect   = document.getElementById('loader-rect');
  const W = () => window.innerWidth;
  const H = () => window.innerHeight;

  const tl = gsap.timeline({
    onComplete: () => {
      gsap.to(loader, { autoAlpha: 0, duration: .3, onComplete: () => loader.remove() });
    }
  });

  tl
    .to(rect, { width:24,  height:4,   duration:.50, ease:'sine.inOut' })
    .to(rect, { width:6,   height:36,  duration:.45, ease:'sine.inOut' })
    .to(rect, { width:44,  height:4,   duration:.50, ease:'sine.inOut' })
    .to(rect, { width:8,   height:55,  duration:.45, ease:'sine.inOut' })
    .to(rect, { width:36,  height:5,   duration:.50, ease:'sine.inOut' })
    .to(rect, { width:6,   height:68,  duration:.45, ease:'sine.inOut' })
    .to(rect, { width:58,  height:4,   duration:.55, ease:'sine.inOut' })
    .to(rect, { width:9,   height:82,  duration:.45, ease:'sine.inOut' })
    .to(rect, { width:48,  height:5,   duration:.50, ease:'sine.inOut' })
    .to(rect, { width:7,   height:95,  duration:.45, ease:'sine.inOut' })
    .to(rect, { width:42,  height:6,   duration:.55, ease:'sine.inOut' })
    .to(rect, { width:38,  height:5,   duration:.60, ease:'sine.inOut' })
    .to(rect, {
      width:  () => W(),
      height: 5,
      duration: .28,
      ease: 'expo.out'
    }, '+=.06')
    .to(rect, {
      height: () => H(),
      duration: .32,
      ease: 'expo.out'
    }, '+=.02')
    .to(loader, { backgroundColor: 'transparent', duration:.01 }, '<.30')
    .to(rect,   { opacity:0, duration:.35, ease:'power2.out' }, '<.01');
})();