// Mobile Menu Handler with Dropdown Support
// Mobile menu disabled by global desktop-first override.
// No-op to prevent mobile menu JS from running and logging in console.
(function(){
    'use strict';
    if (window.__FORCE_DESKTOP_NAV === undefined) window.__FORCE_DESKTOP_NAV = true;
    if (window.__FORCE_DESKTOP_NAV) return;
})();
