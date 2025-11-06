# DJ & Index Pages Implementation

**Student:** Pedro San Martin Alvarez G01598045 
**Assignment:** Iteration 3 — Client-side Interactions  
**Role:** DJ + Index (Home Page)  
---

## Form Validations and Other Events — 40/40 pts

### Inline Event Handler Approach — 10/10 pts
**Points Earned:** 10/10

**Implementation:** Inline handlers via `onclick` in HTML.

**Examples (in `dj.html`):**
```html
<button onclick="alert('✓ Inline onclick event fired!')">Inline Event Demo</button>
<button onclick="toggleThemeInline()">Toggle Theme (Inline)</button>
```

**Function (in `dj.js`):**
```javascript
window.toggleThemeInline = function () {
  const light = document.body.classList.toggle('light');
  alert(light ? '☀️ Light theme activated' : '🌙 Dark theme activated');
};
```

**Demonstration:** Video shows clicking both buttons. First displays an alert; second toggles theme and confirms via alert.

---

### Listener Approach — 10/10 pts
**Points Earned:** 10/10

**Implementation:** Extensive use of `addEventListener` across the app.

**DJ Page (`dj.js`) listeners:**
- Show/slot selection form submit
- Track addition form submit
- Form reset
- Real-time search/filter
- Queue manipulation (up/down/delete) clicks

**Example:**
```javascript
els.quickForm.addEventListener('submit', async ev => {
  ev.preventDefault();
  if (!validateQuickForm(els.quickForm)) {
    showStatus('⚠️ Please fix validation errors', 2500);
    return;
  }
  // track creation logic...
});
```

**Index Page (`index.js`) listeners:**
- Navigation click tracking (save last page)
- Theme toggle button
- `DOMContentLoaded` initialization

**Demonstration:** Video shows listeners responding to submissions, clicks, and navigation.

---

### Event Types — 10/10 pts
**Points Earned:** 10/10 (8 pts implementation + 2 pts successful execution)

**Implemented:**
1. **submit** — show selection & track forms  
2. **reset** — clears inputs and validation state  
3. **click** — queue up/down/remove, theme toggle, nav tracking  
4. **input** — real-time queue filtering  
5. **keydown** — e.g., ESC to clear search  
6. **DOMContentLoaded** — safe initialization; loads saved data

**Demonstration:** Video shows each event type triggering and updating the UI.

---

### Validating Forms — 10/10 pts
**Points Earned:** 10/10 (8 pts implementation + 2 pts visibility)

**Implementation:** Client-side validation with visible feedback.

**Rules:**
- **Title:** required, min length 2, duplicate detection
```javascript
if (!t || t.length < 2) {
  showValidationError(title, titleErr, '✗ Title is required (min 2 characters)');
  isValid = false;
}
```

- **Duration:** `mm:ss` format, > 0, ≤ 10:00
```javascript
if (Number.isNaN(s) || s <= 0) {
  showValidationError(duration, durErr, '✗ Use format mm:ss (e.g., 03:45)');
  isValid = false;
} else if (s > 600) {
  showValidationError(duration, durErr, '✗ Duration cannot exceed 10:00');
  isValid = false;
}
```

**Visual feedback (in `dj.html` or CSS):**
```css
.validation-message { color: #ef4444; font-size: 14px; margin-top: 4px; display: none; }
.validation-message.show { display: block; }
input.invalid { border-color: #ef4444; }
input.valid { border-color: #22c55e; }
```

**Demonstration:** Video covers empty submit, bad format, duplicate track, and a valid submission.

---

## Manipulate Style — 30/30 pts

### Modifying a DOM Element — 10/10 pts
**Points Earned:** 10/10

**Key functions:**
1) **`renumber()`**
```javascript
rows.forEach((tr, i) => {
  const idxCell = tr.children[0];
  if (idxCell) idxCell.textContent = String(i + 1);
  const upBtn = tr.querySelector('button[data-action="up"]');
  const downBtn = tr.querySelector('button[data-action="down"]');
  if (upBtn) upBtn.disabled = i === 0;
  if (downBtn) downBtn.disabled = i === rows.length - 1;
});
```

2) **`setNowPlaying()`**
```javascript
if (first) {
  const label = first.querySelector('td:nth-child(2)')?.textContent?.trim() || '';
  els.nowPlaying.textContent = '♪ ' + label;
  els.nowPlaying.style.color = 'var(--primary)';
} else {
  els.nowPlaying.textContent = 'No track playing';
  els.nowPlaying.style.color = 'var(--muted)';
}
```

3) **`showStatus()`**
```javascript
els.status.textContent = message;
setTimeout(() => { els.status.textContent = ''; }, ms);
```

4) **`filterQueue()`**
```javascript
tr.style.display = text.includes(q) ? '' : 'none';
```

5) **`updateActiveNav()` (index.js)**
```javascript
$$('.topnav a').forEach(a => {
  const href = String(a.getAttribute('href') || '').toLowerCase();
  a.classList.toggle('active', href === path);
});
```

6) **`addTrackRow()`**
```javascript
const tr = mod.makeRowFromTrack(trackData);
els.queueBody.appendChild(tr);
```

**Demonstration:** Video shows dynamic creation, updates, and removal without page reload.

---

### Properties (Custom Objects) — 10/10 pts
**Points Earned:** 10/10

**Object:**
```javascript
const djProfile = {
  name: "DJ User",
  gigs: 0,
  totalSeconds: 0,
  tracksQueued: 0,
  lastUpdated: null,
  incrementGigs() { this.gigs++; this.lastUpdated = new Date(); },
  addTrackDuration(seconds) { this.totalSeconds += seconds; this.tracksQueued++; this.lastUpdated = new Date(); }
};
```

**Operations:**
```javascript
djProfile.totalSeconds = total;
djProfile.tracksQueued = count;
```

**Demonstration:** UI stats reflect real-time changes; console shows object state.

---

### Window Object — 10/10 pts
**Points Earned:** 10/10

**Used APIs:**
- **`alert()`**
```javascript
alert(light ? '☀️ Light theme activated' : '🌙 Dark theme activated');
```
- **`setTimeout()`**
```javascript
setTimeout(() => { els.status.textContent = ''; }, ms);
```
- **`localStorage`**
```javascript
localStorage.setItem('dj_program', list);
localStorage.setItem('dj_slot', date && time ? date + 'T' + time : '');
```
- **`DOMContentLoaded`**
```javascript
document.addEventListener('DOMContentLoaded', () => { /* init */ });
```
- **`console`**
```javascript
console.error('Error loading saved data:', e);
```

**Demonstration:** Alerts, timed messages, persistence, initialization, and logs shown.

---

## Implement Advanced Concepts — 20/20 pts

### Uses Prototypes/Classes — 10/10 pts
**Points Earned:** 10/10

**Track class (`models/Track.js`):**
```javascript
export class Track {
  constructor(title, artist, bpm, mmss) {
    this.title = title;
    this.artist = artist || '';
    this.bpm = Number(bpm) || 0;
    this.mmss = mmss;
  }
  get seconds() {
    const parts = String(this.mmss || '').split(':'); 
    const m = Number(parts[0] || 0);
    const s = Number(parts[1] || 0);
    return m * 60 + s;
  }
  label() {
    const a = this.artist ? ' — ' + this.artist : '';
    const b = this.bpm ? ', ' + this.bpm + ' BPM' : '';
    return this.title + a + ' [' + this.mmss + b + ']';
  }
}
```

**Usage:**
```javascript
const mod = await import('./models/Track.js');
const t = new mod.Track(title, artist, bpm, duration);
```

---

### Use Modules — 10/10 pts
**Points Earned:** 10/10

**Module structure:**
- `models/Track.js` — data model
- `dj-module.js` — UI helpers
- `dj.js` — main DJ logic with dynamic imports
- `index.js` — Home logic (theme, last visit)

**Helper (`dj-module.js`):**
```javascript
export function makeRowFromTrack(track) {
  const tr = document.createElement('tr');
  // build cells, actions...
  return tr;
}
```

**Benefits:** organization, reusability, maintainability, separation of concerns, lazy loading.

**File layout:**
```
assets/js/
  index.js
  dj.js
  dj-module.js
  models/
    Track.js
```

---

## Demonstrate Use of Various JavaScript Fundamentals — 10/10 pts

### Variables — 2/2
```javascript
const $ = (s, c = document) => c.querySelector(s);
let total = 0;
```

### Comparison Operators — 2/2
```javascript
if (upBtn) upBtn.disabled = i === 0;
if (downBtn) downBtn.disabled = i === rows.length - 1;
```

### Logical Operators — 2/2
```javascript
if (!Number.isNaN(s) && s > 0) total += s;
if (!els.status) return;
```

### Conditionals — 2/2
```javascript
if (first) { /* ... */ } else { /* ... */ }
```

### Loops — 2/2
```javascript
rows.forEach((tr, i) => { /* ... */ });
const exists = rows.some(tr => /* ... */);
const opt = [...els.pselect.options].find(o => o.value === list);
```

---

## Capabilities Address Role — 10/10 pts

### Includes Functionality According to User Profile — 6/6
**DJ:**
- Queue management: add/reorder/remove, auto numbering
- Track metadata: title/artist/BPM/duration
- Show scheduling: program/date/time, persistence
- Real-time search/filter
- Performance tracking: count, total duration
- Now Playing display

**Home:**
- Navigation hub
- Continue where you left off
- Theme persistence

### Elements Accurate to Profile — 2/2
- Interactions match DJ workflows: real-time control, quick search, reliable timing.

### Complexity and Understanding — 2/2
- Advanced validation logic, modular architecture, state synchronization, coordinated queue operations, i18n relative time.

---

## Complexity Highlights

1. **Advanced validation** with nested rules and DOM querying  
2. **Modular architecture** with dynamic imports  
3. **State synchronization** via object methods and UI updates  
4. **Queue operations** maintaining integrity and UX constraints  
5. **Relative time** with `Intl.RelativeTimeFormat` and unit selection

---
