(() => {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  const els = {
    status: $('#status'),
    queueBody: $('#queue .table tbody'),
    selectForm: $('#select form'),
    slotDate: $('#slot-date'),
    slotTime: $('#slot-time'),
    pselect: $('#pselect'),
    quickForm: $('#quick form'),
    quickInput: $('#q'),
    nowPlaying: $('#nowPlaying')
  };

  const profile = { gigs: 0, totalSeconds: 0 };

  function mmssToSeconds(v) {
    const m = String(v || '').trim().split(':')[0];
    const s = String(v || '').trim().split(':')[1];
    const mi = Number(m);
    const si = Number(s);
    if (!Number.isInteger(mi) || !Number.isInteger(si)) return NaN;
    if (mi < 0 || si < 0 || si > 59) return NaN;
    return mi * 60 + si;
  }

  function fmtSeconds(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  }

  function showStatus(msg, ms = 2000) {
    if (!els.status) return;
    els.status.textContent = msg;
    if (ms > 0) setTimeout(() => { els.status.textContent = ''; }, ms);
  }

  function updateTotals() {
    let total = 0;
    $$('#queue .table tbody tr').forEach(tr => {
      const dur = tr.querySelector('td:nth-child(3)');
      const v = dur ? dur.textContent.trim() : '';
      const s = mmssToSeconds(v);
      if (!Number.isNaN(s)) total += s;
    });
    profile.totalSeconds = total;
  }

  function setNowPlaying() {
    const first = $('#queue .table tbody tr');
    if (!els.nowPlaying) return;
    if (first) {
      const label = first.querySelector('td:nth-child(2)')?.textContent?.trim() || '';
      els.nowPlaying.textContent = label;
    } else {
      els.nowPlaying.textContent = '';
    }
  }

  function renumber() {
    const rows = $$('#queue .table tbody tr');
    rows.forEach((tr, i) => {
      const idxCell = tr.children[0];
      if (idxCell) idxCell.textContent = String(i + 1);
      const upBtn = tr.querySelector('button[data-action="up"]');
      const downBtn = tr.querySelector('button[data-action="down"]');
      if (upBtn) upBtn.disabled = i === 0;
      if (downBtn) downBtn.disabled = i === rows.length - 1;
    });
    updateTotals();
    setNowPlaying();
  }

  function attachRowActions(tr) {
    const upBtn = tr.querySelector('button[data-action="up"]');
    const downBtn = tr.querySelector('button[data-action="down"]');
    const delBtn = tr.querySelector('button[data-action="del"]');
    if (upBtn) {
      upBtn.addEventListener('click', () => {
        const prev = tr.previousElementSibling;
        if (prev) {
          tr.parentElement.insertBefore(tr, prev);
          renumber();
        }
      });
    }
    if (downBtn) {
      downBtn.addEventListener('click', () => {
        const next = tr.nextElementSibling;
        if (next) {
          tr.parentElement.insertBefore(next, tr);
          renumber();
        }
      });
    }
    if (delBtn) {
      delBtn.addEventListener('click', () => {
        tr.remove();
        renumber();
        showStatus('Track removed', 1500);
      });
    }
  }

  async function addTrackRow(trackData) {
    const mod = await import('./dj-module.js');
    const tr = mod.makeRowFromTrack(trackData);
    els.queueBody.appendChild(tr);
    attachRowActions(tr);
    renumber();
  }

  function validateQuickForm(form) {
    const title = form.querySelector('#title');
    const duration = form.querySelector('#duration');
    const t = String(title.value || '').trim();
    const d = String(duration.value || '').trim();
    if (!t) {
      title.setCustomValidity('Title is required');
      title.reportValidity();
      return false;
    }
    title.setCustomValidity('');
    const s = mmssToSeconds(d);
    if (Number.isNaN(s)) {
      duration.setCustomValidity('Use mm:ss');
      duration.reportValidity();
      return false;
    }
    duration.setCustomValidity('');
    const exists = $$('#queue .table tbody tr').some(tr => {
      const label = tr.querySelector('td:nth-child(2)')?.textContent?.trim().toLowerCase() || '';
      return label.includes(t.toLowerCase());
    });
    if (exists) {
      title.setCustomValidity('Track already exists in the queue');
      title.reportValidity();
      return false;
    }
    title.setCustomValidity('');
    return true;
  }

  function filterQueue(term) {
    const q = String(term || '').toLowerCase();
    $$('#queue .table tbody tr').forEach(tr => {
      const text = tr.textContent.toLowerCase();
      tr.style.display = text.includes(q) ? '' : 'none';
    });
  }

  window.toggleThemeInline = function () {
    const light = document.body.classList.toggle('light');
    alert(light ? 'Light theme' : 'Dark theme');
  };

  document.addEventListener('DOMContentLoaded', () => {
    if (els.selectForm) {
      els.selectForm.addEventListener('submit', ev => {
        ev.preventDefault();
        const list = els.pselect?.value || '';
        const date = els.slotDate?.value || '';
        const time = els.slotTime?.value || '';
        localStorage.setItem('dj_program', list);
        localStorage.setItem('dj_slot', date && time ? date + 'T' + time : '');
        showStatus('Show saved', 1500);
      });
    }

    if (els.quickForm) {
      els.quickForm.addEventListener('submit', async ev => {
        ev.preventDefault();
        if (!validateQuickForm(els.quickForm)) return;
        const title = $('#title', els.quickForm).value.trim();
        const artist = $('#artist', els.quickForm).value.trim();
        const bpm = Number($('#bpm', els.quickForm).value || 0);
        const duration = $('#duration', els.quickForm).value.trim();
        const mod = await import('./models/Track.js');
        const t = new mod.Track(title, artist, bpm, duration);
        await addTrackRow(t);
        els.quickForm.reset();
        showStatus('Track added', 1500);
      });
      els.quickForm.addEventListener('reset', () => {
        const inputs = $$('#quick form input');
        inputs.forEach(i => i.setCustomValidity(''));
        showStatus('', 0);
      });
    }

    if (els.quickInput) {
      els.quickInput.addEventListener('keydown', () => {
        filterQueue(els.quickInput.value);
      });
    }

    try {
      const list = localStorage.getItem('dj_program') || '';
      const slot = localStorage.getItem('dj_slot') || '';
      if (list && els.pselect) {
        const opt = [...els.pselect.options].find(o => o.value === list);
        if (opt) els.pselect.value = list;
      }
      if (slot) {
        const parts = String(slot).split('T');
        if (els.slotDate) els.slotDate.value = parts[0] || '';
        if (els.slotTime) els.slotTime.value = (parts[1] || '').slice(0, 5);
      }
    } catch {}

    renumber();
    setNowPlaying();
  });
})();
