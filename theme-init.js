// Apply the saved choice before styles paint. New visitors always start in light mode.
(() => {
  let theme = 'light';
  try { if (localStorage.getItem('ds-theme') === 'dark') theme = 'dark'; } catch {}
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#182c25' : '#f7f2e8';
})();
