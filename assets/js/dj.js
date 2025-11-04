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
    nowPlaying: $('#nowPlaying'),
    totalTracks: $('#totalTracks'),
    totalDuration: $('#totalDuration'),
    gigsCount: $('#gigsCount'),
    titleInput: $('#title'),
    durationInput: $('#duration'),
    titleError: $('#title-error'),
    durationError: $('#duration-error'),
    searchHint: $('#search-hint')
  };

  const djProfile = {
    name: "DJ User",
    gigs: 0,
    totalSeconds: 0,
    tracksQueued: 0,
    lastUpdated: null,
    // Method in object
    incrementGigs() {
      this.gigs++;
      this.lastUpdated = new Date();
    },
    addTrackDuration(seconds) {
      this.totalSeconds += seconds;
      this.tracksQueued++;
      this.lastUpdated = new Date();
    }
  };

  function mmssToSeconds(v) {
    const m = String(v || '').trim().split(':')[0];
    const s = String(v || '').trim().split(':')[1];
    const mi = Number(m);
    const si = Number(s);
    if (!Number.isInteger(mi) || !Number.isInteger(si)) return NaN;
    // LOGICAL OPERATORS (Rubric: 2pts)
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
    els.status.style.color = 'var(--primary)';
    if (ms > 0) {
      setTimeout(() => { 
        els.status.textContent = ''; 
        els.status.style.color = '';
      }, ms);
    }
  }

  function updateProfileStats() {
    if (els.totalTracks) {
      els.totalTracks.textContent = djProfile.tracksQueued;
    }
    if (els.totalDuration) {
      els.totalDuration.textContent = fmtSeconds(djProfile.totalSeconds);
    }
    if (els.gigsCount) {
      els.gigsCount.textContent = djProfile.gigs;
    }
  }

  function updateTotals() {
    let total = 0;
    let count = 0;
    $$('#queue .table tbody tr').forEach(tr => {
      const dur = tr.querySelector('td:nth-child(3)');
      const v = dur ? dur.textContent.trim() : '';
      const s = mmssToSeconds(v);
      if (!Number.isNaN(s) && s > 0) {
        total += s;
        count++;
      }
    });
    djProfile.totalSeconds = total;
    djProfile.tracksQueued = count;
    updateProfileStats();
  }

  function setNowPlaying() {
    const first = $('#queue .table tbody tr');
    if (!els.nowPlaying) return;
    if (first) {
      const label = first.querySelector('td:nth-child(2)')?.textContent?.trim() || '';
      els.nowPlaying.textContent = '♪ ' + label;
      els.nowPlaying.style.color = 'var(--primary)';
    } else {
      els.nowPlaying.textContent = 'No track playing';
      els.nowPlaying.style.color = 'var(--muted)';
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
          showStatus('Track moved up', 1500);
        }
      });
    }
    if (downBtn) {
      downBtn.addEventListener('click', () => {
        const next = tr.nextElementSibling;
        if (next) {
          tr.parentElement.insertBefore(next, tr);
          renumber();
          showStatus('Track moved down', 1500);
        }
      });
    }
    if (delBtn) {
      delBtn.addEventListener('click', () => {
        tr.remove();
        renumber();
        showStatus('✓ Track removed from queue', 1500);
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

  function showValidationError(input, errorEl, message) {
    input.classList.add('invalid');
    input.classList.remove('valid');
    errorEl.textContent = message;
    errorEl.classList.add('show');
  }

  function clearValidationError(input, errorEl) {
    input.classList.remove('invalid');
    input.classList.add('valid');
    errorEl.textContent = '';
    errorEl.classList.remove('show');
  }

  function validateQuickForm(form) {
    let isValid = true;
    const title = form.querySelector('#title');
    const duration = form.querySelector('#duration');
    const titleErr = form.querySelector('#title-error') || els.titleError;
    const durErr = form.querySelector('#duration-error') || els.durationError;
    
    const t = String(title.value || '').trim();
    const d = String(duration.value || '').trim();
    
    if (!t || t.length < 2) {
      showValidationError(title, titleErr, '✗ Title is required (min 2 characters)');
      isValid = false;
    } else {
      const exists = $$('#queue .table tbody tr').some(tr => {
        const label = tr.querySelector('td:nth-child(2)')?.textContent?.trim().toLowerCase() || '';
        return label.includes(t.toLowerCase());
      });
      if (exists) {
        showValidationError(title, titleErr, '✗ Track already exists in queue');
        isValid = false;
      } else {
        clearValidationError(title, titleErr);
      }
    }
    
    const s = mmssToSeconds(d);
    if (Number.isNaN(s) || s <= 0) {
      showValidationError(duration, durErr, '✗ Use format mm:ss (e.g., 03:45)');
      isValid = false;
    } else if (s > 600) { // 10 minutes max
      showValidationError(duration, durErr, '✗ Duration cannot exceed 10:00');
      isValid = false;
    } else {
      clearValidationError(duration, durErr);
    }
    
    return isValid;
  }

  function filterQueue(term) {
    const q = String(term || '').toLowerCase();
    let visibleCount = 0;
    
    $$('#queue .table tbody tr').forEach(tr => {
      const text = tr.textContent.toLowerCase();
      const matches = text.includes(q);
      tr.style.display = matches ? '' : 'none';
      if (matches) visibleCount++;
    });
    
    if (els.searchHint) {
      if (q === '') {
        els.searchHint.textContent = 'Try typing a track name or artist';
        els.searchHint.style.color = 'var(--muted)';
      } else if (visibleCount === 0) {
        els.searchHint.textContent = '✗ No tracks match your search';
        els.searchHint.style.color = '#ef4444';
      } else {
        els.searchHint.textContent = `✓ Showing ${visibleCount} track(s)`;
        els.searchHint.style.color = '#22c55e';
      }
    }
  }


  window.toggleThemeInline = function () {
    const light = document.body.classList.toggle('light');
    alert(light ? '☀️ Light theme activated' : '🌙 Dark theme activated');
  };

  document.addEventListener('DOMContentLoaded', () => {
    if (els.selectForm) {
      els.selectForm.addEventListener('submit', ev => {
        ev.preventDefault();
        const list = els.pselect?.value || '';
        const date = els.slotDate?.value || '';
        const time = els.slotTime?.value || '';
        
        if (!list) {
          alert('⚠️ Please select a show');
          return;
        }
        
        localStorage.setItem('dj_program', list);
        localStorage.setItem('dj_slot', date && time ? date + 'T' + time : '');

        djProfile.incrementGigs();
        updateProfileStats();
        
        showStatus('✓ Show and timeslot saved successfully', 2000);
      });
    }

    if (els.quickForm) {
      els.quickForm.addEventListener('submit', async ev => {
        ev.preventDefault();
        
        if (!validateQuickForm(els.quickForm)) {
          showStatus('⚠️ Please fix validation errors', 2500);
          return;
        }
        
        const title = $('#title', els.quickForm).value.trim();
        const artist = $('#artist', els.quickForm).value.trim();
        const bpm = Number($('#bpm', els.quickForm).value || 0);
        const duration = $('#duration', els.quickForm).value.trim();
        
        const mod = await import('./models/Track.js');
        const t = new mod.Track(title, artist, bpm, duration);
        
        await addTrackRow(t);
        els.quickForm.reset();
        
        if (els.titleInput) els.titleInput.classList.remove('valid', 'invalid');
        if (els.durationInput) els.durationInput.classList.remove('valid', 'invalid');
        
        showStatus('✓ Track added to queue successfully', 2000);
      });
      
      els.quickForm.addEventListener('reset', () => {
        const inputs = $$('#quick form input');

        inputs.forEach(i => {
          i.classList.remove('valid', 'invalid');
          i.setCustomValidity('');
        });
        if (els.titleError) els.titleError.classList.remove('show');
        if (els.durationError) els.durationError.classList.remove('show');
        showStatus('Form reset', 1000);
      });
    }

    if (els.quickInput) {
      els.quickInput.addEventListener('input', (e) => {
        filterQueue(e.target.value);
      });
      
      els.quickInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          els.quickInput.value = '';
          filterQueue('');
        }
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
      
      const savedGigs = localStorage.getItem('dj_gigs');
      if (savedGigs) {
        djProfile.gigs = Number(savedGigs);
      }
    } catch (e) {
      console.error('Error loading saved data:', e);
    }

    renumber();
    setNowPlaying();
    updateProfileStats();
    
    showStatus('✓ DJ Dashboard loaded successfully', 2000);
  });
})();