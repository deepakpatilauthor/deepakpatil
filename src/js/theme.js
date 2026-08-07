// Theme toggle: switches the data-theme attribute, persists the choice to
// localStorage, and keeps every toggle button/icon in sync. The initial
// theme is applied by the inline blocking script in <head>, so this only
// wires up the buttons.

(function () {
    'use strict';

    function currentTheme() {
        var attr = document.documentElement.getAttribute('data-theme');
        return attr === 'dark' ? 'dark' : 'light';
    }

    function syncIcons(theme) {
        var dark = theme === 'dark';
        var isDark = { 'theme-icon-sun': !dark, 'theme-icon-moon': dark };
        var mobile = { 'theme-mobile-icon-sun': !dark, 'theme-mobile-icon-moon': dark };

        [isDark, mobile].forEach(function (map) {
            Object.keys(map).forEach(function (id) {
                var el = document.getElementById(id);
                if (el) el.classList.toggle('hidden', !map[id]);
            });
        });

        var btn = document.getElementById('theme-toggle');
        if (btn) {
            btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
            btn.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
        }

        var mobileBtn = document.getElementById('theme-toggle-mobile');
        if (mobileBtn) {
            mobileBtn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
        }
        var label = document.getElementById('theme-toggle-mobile-label');
        if (label) label.textContent = dark ? 'Light mode' : 'Dark mode';
    }

    function applyTheme(theme, persist) {
        var root = document.documentElement;
        root.setAttribute('data-theme', theme);
        root.style.colorScheme = theme;
        var meta = document.getElementById('theme-color-meta');
        if (meta) meta.setAttribute('content', theme === 'dark' ? '#0b1120' : '#ffffff');
        if (persist) {
            try { localStorage.setItem('theme', theme); } catch (e) {}
        }
        syncIcons(theme);
    }

    // Spin the icon briefly on toggle for a smooth feel.
    function spinIcon(button) {
        var svg = button && button.querySelector('svg');
        if (!svg) return;
        button.classList.add('theme-toggling');
        setTimeout(function () { button.classList.remove('theme-toggling'); }, 450);
    }

    // Single delegated handler covers the desktop button, the mobile-menu row
    // and any future toggle. Clicking an already-active theme still re-applies
    // it so the persisted value always matches the shown theme.
    document.addEventListener('click', function (e) {
        var button = e.target.closest('#theme-toggle, #theme-toggle-mobile');
        if (!button) return;
        applyTheme(currentTheme() === 'dark' ? 'light' : 'dark', true);
        spinIcon(button);
    });

    // Reflect OS-level theme changes when the user has no explicit choice.
    try {
        if (!localStorage.getItem('theme') && window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
                applyTheme(e.matches ? 'dark' : 'light', false);
            });
        }
    } catch (e) {}

    // Initialise icons/aria from whatever theme the <head> script applied.
    syncIcons(currentTheme());
})();
