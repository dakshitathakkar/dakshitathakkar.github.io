// Progressive enhancements. Links and disclosures work without JavaScript.
(() => {
  const oldSections = { '#ds-work': 'work.html', '#ds-experience': 'experience.html', '#ds-talk': 'speaking.html', '#ds-about': 'about.html', '#ds-contact': 'contact.html' };
  if (document.querySelector('[data-page="home"]') && oldSections[location.hash]) {
    location.replace(oldSections[location.hash] + location.hash);
    return;
  }
  const root = document.getElementById('dakshita-studio');
  const header = root.querySelector('.ds-nav');
  const progress = root.querySelector('.ds-reading-progress');
  const photo = root.querySelector('.ds-photo');
  const motionButton = root.querySelector('.ds-motion-toggle');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = matchMedia('(hover: hover) and (pointer: fine)');
  let userMotion = true, motion = false, frame = 0, pointerFrame = 0;
  let pointerPosition = null, headerHeight = header.offsetHeight;
  try { userMotion = localStorage.getItem('ds-motion') !== 'off'; } catch {}
  const animations = new Set();
  function animate(element, frames, options) {
    if (!motion || !element.animate) return;
    const animation = element.animate(frames, options);
    animations.add(animation);
    animation.finished.catch(() => {}).finally(() => animations.delete(animation));
  }
  function resetPhoto() {
    photo?.style.removeProperty('--photo-x');
    photo?.style.removeProperty('--photo-y');
    photo?.classList.remove('is-tilting');
  }
  function updateMotion() {
    motion = userMotion && !reduce.matches;
    root.dataset.motion = motion ? 'on' : 'off';
    document.documentElement.dataset.motion = root.dataset.motion;
    motionButton.hidden = false;
    motionButton.disabled = reduce.matches;
    motionButton.setAttribute('aria-pressed', String(motion));
    motionButton.textContent = reduce.matches ? 'Reduced motion' : `Motion ${motion ? 'on' : 'off'}`;
    if (!motion) {
      animations.forEach(animation => animation.cancel());
      root.classList.remove('pointer-active');
      resetPhoto();
    }
  }
  motionButton.addEventListener('click', () => { userMotion = !userMotion; try { localStorage.setItem('ds-motion', userMotion ? 'on' : 'off'); } catch {} updateMotion(); });
  reduce.addEventListener('change', updateMotion);
  pointer.addEventListener('change', () => {
    if (!pointer.matches) { root.classList.remove('pointer-active'); resetPhoto(); }
  });
  updateMotion();
  function updateScroll() {
    frame = 0;
    const scrollable = document.documentElement.scrollHeight - innerHeight;
    const ratio = scrollable > 0 ? Math.min(1, Math.max(0, scrollY / scrollable)) : 0;
    progress.style.transform = `scaleX(${ratio})`;
    header.classList.toggle('has-scrolled', scrollY > 24);
  }
  function queueScroll() { if (!frame) frame = requestAnimationFrame(updateScroll); }
  function measureHeader() {
    headerHeight = header.offsetHeight;
    document.documentElement.style.setProperty('--ds-header-height', `${headerHeight}px`);
    queueScroll();
  }
  if ('ResizeObserver' in window) new ResizeObserver(measureHeader).observe(header);
  addEventListener('resize', measureHeader, { passive: true });
  addEventListener('scroll', queueScroll, { passive: true });
  addEventListener('load', measureHeader, { once: true });
  measureHeader();
  root.addEventListener('pointermove', event => {
    if (!motion || !pointer.matches || event.pointerType === 'touch') return;
    pointerPosition = { x: event.clientX, y: event.clientY };
    if (!pointerFrame) pointerFrame = requestAnimationFrame(() => {
      pointerFrame = 0;
      if (!motion || !pointer.matches || !pointerPosition) return;
      root.style.setProperty('--pointer-x', `${pointerPosition.x}px`);
      root.style.setProperty('--pointer-y', `${pointerPosition.y}px`);
      root.classList.add('pointer-active');
    });
  }, { passive: true });
  root.addEventListener('pointerleave', () => { pointerPosition = null; root.classList.remove('pointer-active'); });
  photo?.addEventListener('pointermove', event => {
    if (!motion || !pointer.matches || event.pointerType === 'touch') return;
    const bounds = photo.getBoundingClientRect();
    const x = Math.max(-.5, Math.min(.5, (event.clientX - bounds.left) / bounds.width - .5));
    const y = Math.max(-.5, Math.min(.5, (event.clientY - bounds.top) / bounds.height - .5));
    photo.style.setProperty('--photo-x', `${-y * 8}deg`);
    photo.style.setProperty('--photo-y', `${x * 10}deg`);
    photo.classList.add('is-tilting');
  }, { passive: true });
  photo?.addEventListener('pointerleave', resetPhoto);
  // Animate once on entry without hiding content or delaying keyboard access.
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        if (!entry.target.contains(document.activeElement)) animate(entry.target,
          [{ opacity: .8, transform: 'translateY(14px)' }, { opacity: 1, transform: 'translateY(0)' }],
          { duration: 460, easing: 'cubic-bezier(.22,1,.36,1)' });
      });
    }, { threshold: .12 });
    root.querySelectorAll('.ds-project,.ds-role,.ds-notes-section,.ds-education').forEach(el => observer.observe(el));
  }
  root.querySelectorAll('details').forEach(details => details.addEventListener('toggle', () => {
    queueScroll();
    if (details.open) animate(details.querySelector('.ds-outline'),
      [{ opacity: .65, transform: 'translateY(-5px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 230, easing: 'ease-out' });
  }));
})();
