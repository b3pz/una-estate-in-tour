export class MusicAudio {
 constructor() {
  this.ctx = null;
  this.master = null;
  this.volume = .55;
  this.muted = false;
  this.scheduled = [];
 }
 async init() {
  if (!this.ctx) {
   this.ctx = new(window.AudioContext || window.webkitAudioContext)();
   this.master = this.ctx.createGain();
   this.master.connect(this.ctx.destination);
   this.update();
  }
  if (this.ctx.state === 'suspended') await this.ctx.resume();
  return this.ctx;
 }
 update() {
  if (this.master) this.master.gain.setValueAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime);
 }
 tone(freq, start, duration = .12, type = 'triangle', volume = .12) {
  if (!this.ctx) return;
  const t = Math.max(start, this.ctx.currentTime),
   o = this.ctx.createOscillator(),
   g = this.ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(volume, t + .008);
  g.gain.exponentialRampToValueAtTime(.0001, t + Math.max(.02, duration));
  o.connect(g);
  g.connect(this.master);
  o.start(t);
  o.stop(t + duration + .03);
  this.scheduled.push(o);
  o.onended = () => {
   const i = this.scheduled.indexOf(o);
   if (i >= 0) this.scheduled.splice(i, 1);
  };
 }
 drum(lane, start, vol = .1) {
  if (!this.ctx) return;
  const t = Math.max(start, this.ctx.currentTime);
  if (lane === 0) {
   const o = this.ctx.createOscillator(),
    g = this.ctx.createGain();
   o.frequency.setValueAtTime(130, t);
   o.frequency.exponentialRampToValueAtTime(38, t + .15);
   g.gain.setValueAtTime(vol * 2, t);
   g.gain.exponentialRampToValueAtTime(.0001, t + .18);
   o.connect(g);
   g.connect(this.master);
   o.start(t);
   o.stop(t + .2);
   this.scheduled.push(o);
   o.onended = () => {
    const i = this.scheduled.indexOf(o);
    if (i >= 0) this.scheduled.splice(i, 1);
   };
   return;
  }
  const len = lane === 3 ? .3 : lane === 1 ? .12 : .045,
   b = this.ctx.createBuffer(1, Math.ceil(this.ctx.sampleRate * len), this.ctx.sampleRate),
   a = b.getChannelData(0);
  for (let i = 0; i < a.length; i++) a[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / a.length, 2);
  const src = this.ctx.createBufferSource(),
   filter = this.ctx.createBiquadFilter(),
   g = this.ctx.createGain();
  src.buffer = b;
  filter.type = 'highpass';
  filter.frequency.value = lane === 1 ? 1000 : 6500;
  g.gain.value = vol;
  src.connect(filter);
  filter.connect(g);
  g.connect(this.master);
  src.start(t);
  this.scheduled.push(src);
  src.onended = () => {
   const i = this.scheduled.indexOf(src);
   if (i >= 0) this.scheduled.splice(i, 1);
  };
 }
 note(instrument, lane, root, time, duration = .15, vol = .16) {
  if (instrument === 'drums') {
   this.drum(lane, time, vol);
   return;
  }
  const semitones = [0, 5, 7, 12];
  this.tone(root * Math.pow(2, semitones[lane] / 12) * (instrument === 'guitar' ? 2 : 1), time, Math.max(.1, duration), instrument === 'guitar' ? 'sawtooth' : 'triangle', instrument === 'guitar' ? vol * .45 : vol);
 }
 backing(chart, city, bar, start) {
  const {
   beat
  } = chart, root = (city.root || 110) * [1, 1, 4 / 3, 1.5][Math.floor(bar / 4) % 4];
  for (let b = 0; b < 4; b++) {
   const t = start + (bar * 4 + b) * beat;
   if (chart.instrument !== 'drums') {
    this.drum(b % 2 === 0 ? 0 : 1, t, .075);
    this.drum(2, t, .025);
    if (city.genre === 'Metal') this.drum(0, t + beat * .5, .045);
   }
   if (chart.instrument !== 'bass' && (b === 0 || b === 2)) this.note('bass', b === 0 ? 0 : 2, root, t, beat * .55, .085);
   if (chart.instrument !== 'guitar' && (b % 2 === 0 || city.genre === 'Reggae')) {
    const off = city.genre === 'Reggae' ? beat * .5 : 0;
    this.tone(root * 2, t + off, beat * .45, 'triangle', .045);
    this.tone(root * 3, t + off, beat * .4, 'triangle', .025);
   }
  }
 }
 stop() {
  for (const src of [...this.scheduled]) try {
   src.stop();
  } catch {}
  this.scheduled = [];
 }
}