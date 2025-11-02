/* assets/js/index.js */
(() => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  function roleFromFile(file) {
    const f = String(file || '').toLowerCase();
    if (f.includes('dj')) return 'DJ';
    if (f.includes('producer')) return 'Producer';
    if (f.includes('manager')) return 'Manager';
    return 'Home';
  }

  function updateActiveNav() {
    try {
      const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
      $$('.topnav a').forEach(a => {
        const href = String(a.getAttribute('href') || '').toLowerCase();
        a.classList.toggle('active', href === path);
      });
    } catch {}
  }

  function saveLast(file) {
    try {
      localStorage.setItem('lastRole', roleFromFile(file));
      localStorage.setItem('lastRoleFile', file);
      localStorage.setItem('lastVisitedAt', String(Date.now()));
    } catch {}
  }

  function relTime(ts) {
    const diff = Date.now() - Number(ts || 0);
    const rtf = new Intl.RelativeTimeFormat(navigator.language || 'en', { numeric: 'auto' });
    const sec = Math.round(diff / 1000);
    if (sec < 60) return rtf.format(-sec, 'second');
    const min = Math.round(sec / 60);
    if (min < 60) return rtf.format(-min, 'minute');
    const hr = Math.round(min / 60);
    if (hr < 24) return rtf.format(-hr, 'hour');
    const day = Math.round(hr / 24);
    if (day < 30) return rtf.format(-day, 'day');
    const mo = Math.round(day / 30);
    if (mo < 12) return rtf.format(-mo, 'month');
    const yr = Math.round(mo / 12);
    return rtf.format(-yr, 'year');
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.documentElement.classList.add('js');

    updateActiveNav();

    try {
      $$('.topnav a').forEach(a => {
        a.addEventListener('click', () => {
          const file = String(a.getAttribute('href') || 'index.html').split('/').pop();
          saveLast(file);
        });
      });
    } catch {}

    try {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'light') document.body.classList.add('light');
      const btn = $('.site-header .actions button');
      if (btn) {
        btn.addEventListener('click', () => {
          const light = document.body.classList.contains('light');
          localStorage.setItem('theme', light ? 'light' : 'dark');
        });
      }
    } catch {}

    try {
      const isIndex = (location.pathname.split('/').pop() || 'index.html').toLowerCase() === 'index.html';
      if (isIndex) {
        const status = $('#continueStatus');
        const link = $('#continueLink');
        const f = localStorage.getItem('lastRoleFile');
        const t = Number(localStorage.getItem('lastVisitedAt') || 0);
        if (f) {
          if (link) link.setAttribute('href', f);
          if (status) status.textContent = 'Last visit ' + relTime(t);
        } else {
          if (status) status.textContent = 'No recent activity yet';
        }
      }
    } catch {}

    try {
      const input = $('#videoUrl');
      const btn = $('#saveLinks');
      const saved = localStorage.getItem('videoUrl');
      if (input && saved) input.value = saved;
      if (btn) {
        btn.addEventListener('click', () => {
          if (input) {
            localStorage.setItem('videoUrl', input.value.trim());
            const msg = $('#savedMsg');
            if (msg) {
              msg.textContent = 'Saved';
              setTimeout(() => (msg.textContent = ''), 1500);
            }
          }
        });
      }
    } catch {}
  });
})();
