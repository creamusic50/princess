// Attach handlers for elements using data-action to avoid inline onclicks (CSP-safe)
document.addEventListener('DOMContentLoaded', function () {
  // Convert common inline onclick attributes into data-action/data-arg so existing
  // minified bundles and legacy markup become CSP-safe without rebuilding.
  document.querySelectorAll('[onclick]').forEach(el => {
    try {
      const code = el.getAttribute('onclick').trim();
      // common patterns
      let m;
      if (code === 'location.reload()' || code === 'location.reload();') {
        el.dataset.action = 'reload';
      } else if ((m = code.match(/^goToPage\((\d+)\)$/))) {
        el.dataset.action = 'goToPage';
        el.dataset.argPage = m[1];
      } else if ((m = code.match(/^editPost\(['"]?([^'")]+)['"]?\)$/))) {
        el.dataset.action = 'editPost';
        el.dataset.argId = m[1];
      } else if ((m = code.match(/^deletePost\(['"]?([^'")]+)['"]?\)$/))) {
        el.dataset.action = 'deletePost';
        el.dataset.argId = m[1];
      } else if (code === 'search.clearRecentSearches()' || code === 'search.clearRecentSearches();') {
        el.dataset.action = 'search.clearRecentSearches';
      } else if ((m = code.match(/^search.setSearchTerm\(['"](.+)['"]\)$/))) {
        el.dataset.action = 'search.setSearchTerm';
        el.dataset.argTerm = m[1];
      } else if (code.includes('search.removeRecentSearch')) {
        // pattern like: event.stopPropagation(); search.removeRecentSearch('term')
        const mm = code.match(/search\.removeRecentSearch\(['"](.+)['"]\)/);
        if (mm) {
          el.dataset.action = 'search.removeRecentSearch';
          el.dataset.argTerm = mm[1];
          if (code.includes('stopPropagation')) el.dataset.stopPropagation = 'true';
        }
      }
      // remove original onclick to satisfy CSP
      el.removeAttribute('onclick');
    } catch (e) {
      // non-fatal; leave element as-is
      console.warn('Failed to convert onclick for element', el, e);
    }
  });

  function callAction(el) {
    const action = el.dataset.action;
    if (!action) return;
    // special actions
    if (action === 'reload') return location.reload();
    if (action === 'alert') return alert(el.dataset.argMessage || '');

    // resolve dotted action names (e.g., "search.clearRecentSearches")
    const fn = action.split('.').reduce((obj, key) => (obj ? obj[key] : undefined), window);
    if (typeof fn !== 'function') return;

    // collect data-arg-* attributes in order
    const args = Object.keys(el.dataset)
      .filter(k => k.startsWith('arg'))
      .sort()
      .map(k => el.dataset[k]);

    // convert numeric-looking args to numbers when appropriate
    const parsedArgs = args.map(a => (/^-?\d+$/.test(a) ? parseInt(a, 10) : a));
    fn.apply(window, parsedArgs);
  }

  document.querySelectorAll('[data-action]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      // allow opt-in to stop propagation from markup
      if (el.dataset.stopPropagation === 'true') e.stopPropagation();
      // prevent default for anchor-like elements unless data-preserve-default
      if (!el.dataset.preserveDefault) e.preventDefault();
      callAction(el);
    });
  });
});
