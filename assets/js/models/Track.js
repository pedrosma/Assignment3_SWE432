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
