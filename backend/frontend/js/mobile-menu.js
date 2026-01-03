// Mobile Menu Handler - replaced with no-op to prevent console spam
(function(){
    'use strict';
    // Force desktop navigation flag (used elsewhere)
    if (window.__FORCE_DESKTOP_NAV === undefined) window.__FORCE_DESKTOP_NAV = true;
    // If desktop forced, stop execution to avoid mobile menu logs
    if (window.__FORCE_DESKTOP_NAV) return;
    // If someone disables the desktop-only override, a minimal safe handler can be implemented later.
})();
