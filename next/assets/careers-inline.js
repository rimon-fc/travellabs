(() => {
  const application = document.getElementById('apply');
  if (!application) return;
  const summary = application.querySelector('summary');
  function openFromHash() {
    if (location.hash === '#apply') application.open = true;
  }
  openFromHash();
  window.addEventListener('hashchange', openFromHash);
  document.querySelectorAll('a[href="#apply"],a[href="about.html#apply"]').forEach(link => {
    link.addEventListener('click', () => { application.open = true; });
  });
  application.querySelector('.application-close').addEventListener('click', () => {
    application.open = false;
    summary.focus();
  });
})();
