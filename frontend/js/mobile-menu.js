// Mobile Menu Handler with Hamburger Toggle
// Works on ALL mobile breakpoints: 375px, 425px, 554px, 768px and below
(function() {
    'use strict';

    let resizeTimeout;

    document.addEventListener('DOMContentLoaded', function() {
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('nav-menu');
        const mobileOverlay = document.getElementById('mobile-overlay');

        if (!hamburger || !navMenu) return;

        // Close menu helper function
        const closeMenu = () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            if (mobileOverlay) {
                mobileOverlay.classList.remove('active');
            }
            document.body.style.overflow = 'visible';
            hamburger.setAttribute('aria-expanded', 'false');
        };

        // Toggle mobile menu on hamburger click
        hamburger.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            if (mobileOverlay) {
                mobileOverlay.classList.toggle('active');
            }
            
            const isOpen = navMenu.classList.contains('active');
            document.body.style.overflow = isOpen ? 'hidden' : 'visible';
            hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        // Close menu when a link is clicked
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        // Close menu when overlay is clicked
        if (mobileOverlay) {
            mobileOverlay.addEventListener('click', function(e) {
                e.stopPropagation();
                closeMenu();
            });
        }

        // Close menu on ESC key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                closeMenu();
            }
        });

        // Close menu on window resize to desktop (debounced)
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (window.innerWidth > 768 && navMenu.classList.contains('active')) {
                    closeMenu();
                }
            }, 150);
        });
    });
})();
