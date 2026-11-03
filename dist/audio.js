import { CHORD_TONES } from './music.js';
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
 // Suono di una nota della partitura: altezza e accordo dipendono dal giro armonico del brano.
 playNote(instrument, n, base, time, vol = .14) {
  if (!this.ctx) return;
  if (instrument === 'drums') {
   this.drum(n.lane, time, n.lane === 2 ? vol * .35 : vol);
   return;
  }
  const f = base * Math.pow(2, (n.pitch || 0) / 12), dur = Math.max(.12, n.duration || .16);
  if (instrument === 'bass') {
   this.tone(f, time, dur, 'triangle', vol);
   this.tone(f * 2, time, dur * .6, 'sine', vol * .25);
   return;
  }
  const tones = CHORD_TONES[n.chord] || [0, 7];
  const r = base * 2 * Math.pow(2, (n.root || 0) / 12);
  this.tone(f * 2, time, dur, 'sawtooth', vol * .32);
  for (const st of tones.slice(1, 3)) this.tone(r * Math.pow(2, st / 12), time, dur * .9, 'triangle', vol * .16);
 }
 backing(chart, city, bar, start) {
  if (!chart.backing) return;
  const base = city.root || 110, beat = chart.beat, origin = start - 2, from = 2 + bar * 4 * beat, to = from + 4 * beat;
  for (const [inst, notes] of Object.entries(chart.backing))
   for (const n of notes)
    if (n.t >= from && n.t < to) this.playNote(inst, n, base, origin + n.t, inst === 'drums' ? .075 : inst === 'bass' ? .085 : .07);
 }
 stop() {
  for (const src of [...this.scheduled]) try {
   src.stop();
  } catch {}
  this.scheduled = [];
 }
}