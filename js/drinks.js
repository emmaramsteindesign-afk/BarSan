document.querySelectorAll('.drink-cell').forEach(cell => {
  const bars = cell.querySelectorAll('.fl-bar');

  cell.addEventListener('mouseenter', () => {
    bars.forEach((bar, i) => {
      const w = parseFloat(bar.dataset.w || 0.5);
      gsap.fromTo(bar,
        { scaleX: 0 },
        { scaleX: w, duration: .65 + i * .06, ease: 'power2.out', transformOrigin: 'left' }
      );
    });
  });

  cell.addEventListener('mouseleave', () => {
    bars.forEach(bar => {
      gsap.to(bar, { scaleX: 0, duration: .35, ease: 'power2.in', transformOrigin: 'left' });
    });
  });
});
