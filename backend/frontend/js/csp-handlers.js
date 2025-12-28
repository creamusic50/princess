// CSP handlers mirror for backend frontend copies
document.addEventListener('DOMContentLoaded', function () {
  function callAction(el) {
    const action = el.dataset.action;
    if (!action) return;
    if (action === 'reload') return location.reload();
    if (action === 'alert') return alert(el.dataset.argMessage || '');
    const fn = window[action];
    if (typeof fn !== 'function') return;
    const args = Object.keys(el.dataset)
      .filter(k => k.startsWith('arg'))
      .sort()
      .map(k => el.dataset[k]);
    const parsedArgs = args.map(a => (/^-?\d+$/.test(a) ? parseInt(a, 10) : a));
    fn.apply(window, parsedArgs);
  }
  document.querySelectorAll('[data-action]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      if (!el.dataset.preserveDefault) e.preventDefault();
      callAction(el);
    });
  });
});
