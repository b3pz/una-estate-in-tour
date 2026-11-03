// Partiture per genere. Ogni stile descrive un giro armonico e i pattern di chitarra,
// basso e batteria su una griglia di sedicesimi (0–15). Il livello di ogni nota decide
// in quale difficoltà compare: 1 = sempre, 2 = normale e virtuoso, 3 = solo virtuoso.
// I pattern sono esempi didattici di un brano, non la definizione di un intero genere.

// Accordi: [semitoni dalla tonica, qualità]
const I = [0, '7'], IV = [5, '7'], V = [7, '7'];
const maj = s => [s, 'maj'], min = s => [s, 'min'], pw = s => [s, '5'], m7 = s => [s, 'm7'], d7 = s => [s, '7'];

// n(step, laneOffset, level, durationSteps)
const n = (s, l = 0, lv = 1, d = 0) => ({ s, l, lv, d });

export const STYLES = {
 Casa: {
  swing: false,
  progression: [maj(0), maj(0), maj(5), maj(7), maj(0), min(9), maj(5), maj(7)],
  guitar: { A: [n(0, 0), n(4, 1), n(8, 0, 1), n(10, 2, 2), n(12, 1, 1, 3)], B: [n(0, 0, 1, 6), n(8, 2), n(12, 1), n(14, 3, 2)] },
  bass: { A: [n(0, 0), n(8, 1), n(12, 2, 2)], B: [n(0, 0, 1, 3), n(6, 1, 2), n(8, 2)] },
  drums: { A: [n(0, 0), n(4, 1), n(8, 0), n(12, 1), n(2, 2, 2), n(6, 2, 2), n(10, 2, 2), n(14, 2, 2)], B: [n(0, 3), n(4, 1), n(8, 0), n(10, 0, 2), n(12, 1)] }
 },
 // Blues in La: dodici battute più quattro di coda, terzine (shuffle).
 Blues: {
  swing: true,
  progression: [I, I, I, I, IV, IV, I, I, V, IV, I, V, I, IV, I, V],
  guitar: { A: [n(0, 0), n(2, 1, 2), n(4, 0), n(6, 1, 2), n(8, 0), n(10, 2, 2), n(12, 0), n(14, 1, 2), n(15, 3, 3)], B: [n(0, 2, 1, 5), n(8, 3), n(10, 2, 2), n(12, 1), n(14, 0, 2)] },
  bass: { A: [n(0, 0), n(4, 1, 2), n(8, 2), n(12, 1, 2), n(14, 0, 3)], B: [n(0, 0), n(4, 1), n(8, 2), n(12, 1), n(10, 2, 3)] },
  drums: { A: [n(0, 0), n(4, 1), n(8, 0), n(12, 1), n(0, 2, 2), n(2, 2, 3), n(4, 2, 2), n(6, 2, 2), n(8, 2, 2), n(10, 2, 2), n(12, 2, 2), n(14, 2, 2)], B: [n(0, 3), n(4, 1), n(8, 0), n(10, 0, 3), n(12, 1), n(6, 2, 2), n(14, 2, 2)] }
 },
 // Rock: power chord in ottavi, backbeat su 2 e 4.
 Rock: {
  swing: false,
  progression: [pw(0), pw(0), pw(10), pw(5), pw(0), pw(0), pw(3), pw(5)],
  guitar: { A: [n(0, 0), n(2, 0, 2), n(4, 0), n(6, 0, 2), n(8, 1), n(10, 1, 2), n(12, 2, 1, 3), n(14, 3, 3)], B: [n(0, 0), n(0, 2, 2), n(6, 1), n(8, 0, 1, 4), n(14, 3, 2)] },
  bass: { A: [n(0, 0), n(2, 0, 2), n(4, 0), n(6, 0, 2), n(8, 1), n(10, 1, 2), n(12, 1), n(14, 2, 3)], B: [n(0, 0, 1, 3), n(6, 1, 2), n(8, 2), n(12, 1)] },
  drums: { A: [n(0, 0), n(4, 1), n(6, 0, 2), n(8, 0), n(12, 1), n(2, 2, 2), n(10, 2, 2), n(14, 2, 2), n(15, 1, 3)], B: [n(0, 3), n(4, 1), n(8, 0), n(10, 0, 2), n(12, 1), n(13, 1, 3), n(14, 1, 2)] }
 },
 // Pop: giro I–V–vi–IV con strofa sincopata e ritornello tenuto.
 Pop: {
  swing: false,
  progression: [maj(0), maj(7), min(9), maj(5), maj(0), maj(7), min(9), maj(5)],
  guitar: { A: [n(0, 0), n(4, 1, 2), n(6, 2), n(10, 1), n(12, 0, 2), n(14, 3, 3)], B: [n(0, 0, 1, 5), n(6, 2, 2), n(8, 1, 1, 3), n(12, 3), n(14, 2, 2)] },
  bass: { A: [n(0, 0, 1, 3), n(6, 1, 2), n(8, 0), n(14, 2, 3)], B: [n(0, 0), n(4, 0, 2), n(8, 1), n(12, 2), n(14, 1, 3)] },
  drums: { A: [n(0, 0), n(4, 1), n(6, 0, 2), n(8, 0), n(12, 1), n(2, 2, 2), n(6, 2, 3), n(10, 2, 2), n(14, 2, 2)], B: [n(0, 3), n(0, 0), n(4, 1), n(8, 0), n(12, 1), n(14, 1, 2)] }
 },
 // Funk: vamp su un accordo, sedicesimi spezzati e pause sul battere.
 Funk: {
  swing: false,
  progression: [m7(0), m7(0), m7(0), m7(5), m7(0), m7(0), d7(7), m7(5)],
  guitar: { A: [n(2, 0), n(3, 1, 3), n(6, 1), n(7, 0, 2), n(10, 0), n(13, 2, 2), n(14, 1)], B: [n(1, 3, 2), n(4, 2), n(9, 0, 2), n(10, 1), n(12, 2), n(15, 3, 3)] },
  bass: { A: [n(0, 0), n(6, 0), n(8, 1), n(11, 2, 2), n(14, 0, 3)], B: [n(0, 0), n(3, 2, 2), n(6, 1), n(10, 0), n(13, 2, 3)] },
  drums: { A: [n(0, 0), n(4, 1), n(7, 1, 3), n(10, 0), n(12, 1), n(2, 2, 2), n(6, 2, 2), n(9, 2, 3), n(14, 2, 2)], B: [n(0, 0), n(3, 0, 2), n(4, 1), n(10, 0), n(12, 1), n(15, 1, 3), n(8, 3)] }
 },
 // Metal: galoppo (ottavo e due sedicesimi) e doppia cassa nel virtuoso.
 Metal: {
  swing: false,
  progression: [pw(0), pw(0), pw(1), pw(0), pw(0), pw(10), pw(8), pw(10)],
  guitar: { A: [n(0, 0), n(2, 0, 2), n(3, 0, 3), n(4, 0), n(6, 0, 2), n(7, 0, 3), n(8, 1), n(10, 1, 2), n(11, 1, 3), n(12, 3, 1, 2)], B: [n(0, 0, 1, 3), n(4, 2), n(6, 1, 2), n(8, 3, 1, 3), n(12, 1), n(14, 0, 2)] },
  bass: { A: [n(0, 0), n(2, 0, 2), n(4, 0), n(6, 0, 2), n(8, 1), n(10, 1, 2), n(12, 2), n(14, 2, 3)], B: [n(0, 0, 1, 3), n(4, 1), n(8, 2, 1, 3), n(12, 1)] },
  drums: { A: [n(0, 0), n(2, 0, 2), n(4, 1), n(6, 0, 2), n(8, 0), n(10, 0, 2), n(12, 1), n(14, 0, 2), n(1, 0, 3), n(5, 0, 3), n(9, 0, 3), n(13, 0, 3)], B: [n(0, 3), n(0, 0), n(4, 1), n(8, 0), n(8, 3, 2), n(12, 1), n(14, 1, 2), n(15, 1, 3)] }
 },
 // Latino: esempio di clave son 3–2 su due battute; tumbao con anticipazioni.
 Latino: {
  swing: false,
  twoBar: true,
  progression: [min(0), min(5), d7(7), min(0), min(0), min(5), d7(7), min(0)],
  guitar: { A: [n(0, 0), n(3, 1, 2), n(6, 2), n(10, 1), n(12, 0), n(14, 3, 3)], B: [n(2, 1), n(4, 2), n(8, 0), n(11, 3, 2), n(14, 1)] },
  bass: { A: [n(6, 0, 1, 2), n(12, 1, 1, 2), n(0, 2, 3)], B: [n(6, 0, 1, 2), n(12, 1, 1, 2), n(10, 2, 3)] },
  // corsia 1 = clave (rullante sul bordo), 2 = cascara, 0 = cassa sul tumbao
  drums: { A: [n(0, 1), n(6, 1), n(12, 1), n(6, 0, 2), n(12, 0, 2), n(2, 2, 2), n(10, 2, 2), n(14, 2, 3)], B: [n(4, 1), n(8, 1), n(6, 0, 2), n(12, 0, 2), n(0, 2, 2), n(14, 2, 2), n(15, 3, 3)] }
 },
 // Reggae: accordi sul levare, one drop (cassa e rullante sul terzo movimento).
 Reggae: {
  swing: false,
  progression: [maj(0), maj(0), maj(5), maj(5), maj(0), maj(0), maj(7), maj(5)],
  guitar: { A: [n(2, 0, 2), n(6, 1), n(10, 0, 2), n(14, 1)], B: [n(2, 2, 2), n(6, 1), n(10, 2, 2), n(14, 3), n(15, 3, 3)] },
  bass: { A: [n(4, 0, 1, 3), n(10, 1, 2), n(12, 2)], B: [n(3, 1, 2), n(4, 0, 1, 2), n(8, 2), n(12, 1, 3)] },
  drums: { A: [n(8, 0), n(8, 1), n(2, 2, 2), n(6, 2, 2), n(10, 2, 2), n(14, 2, 2), n(15, 1, 3)], B: [n(8, 0), n(8, 1), n(0, 3, 2), n(6, 2, 2), n(14, 2, 2), n(12, 1, 3)] }
 },
 // Jazz: ii–V–I–vi in swing, comping a «Charleston» e basso camminante.
 Jazz: {
  swing: true,
  progression: [m7(2), d7(7), maj(0), m7(9), m7(2), d7(7), maj(0), d7(9)],
  guitar: { A: [n(0, 0), n(6, 1), n(12, 2, 2), n(14, 3, 3)], B: [n(4, 2), n(10, 1, 1, 3), n(14, 0, 2), n(2, 3, 3)] },
  bass: { A: [n(0, 0), n(4, 1), n(8, 2), n(12, 1, 2), n(14, 0, 3)], B: [n(0, 2), n(4, 1, 2), n(8, 0), n(12, 1), n(10, 2, 3)] },
  drums: { A: [n(0, 2), n(4, 2), n(6, 2, 2), n(8, 2), n(12, 2), n(14, 2, 2), n(4, 1, 3), n(12, 1, 3)], B: [n(0, 2), n(4, 2), n(6, 2, 2), n(8, 2), n(10, 1, 2), n(12, 2), n(14, 1, 3), n(0, 3, 2)] }
 }
};
STYLES.Festival = STYLES.Casa;
STYLES.Crocevia = STYLES.Rock;
STYLES.Archivio = STYLES.Jazz;

const MEDLEY = ['Blues', 'Rock', 'Pop', 'Funk', 'Metal', 'Latino', 'Reggae', 'Jazz'];
const VOICES = { guitar: [0, 7, 12, 16], bass: [-12, -5, 0], drums: [0, 0, 0, 0] };
const LANES = { guitar: 4, bass: 3, drums: 4 };

function chordLane(semitones, lanes) {
 const map = { 0: 0, 5: 1, 7: 2, 2: 1, 9: 3, 10: 3, 3: 1, 8: 3, 1: 1 };
 return (map[((semitones % 12) + 12) % 12] ?? 0) % lanes;
}

// Struttura di un brano da concerto: intro, strofa, ritornello, ripresa con chiusura.
export function songPlan(kind, genre) {
 const bars = kind === 'tutorial' ? 6 : kind === 'rival' ? 8 : kind === 'final' ? 24 : 16;
 const plan = [];
 for (let bar = 0; bar < bars; bar++) {
  let style = genre, section = 'A', intro = false;
  if (kind === 'final') { style = MEDLEY[Math.floor(bar / 3)]; section = bar % 3 === 2 ? 'B' : 'A'; intro = bar === 0; }
  else if (kind === 'tutorial') { intro = bar < 2; section = bar >= 4 ? 'B' : 'A'; }
  else if (kind === 'rival') { section = bar >= 4 ? 'B' : 'A'; intro = bar === 0; }
  else { intro = bar < 2; section = bar >= 8 && bar < 12 ? 'B' : 'A'; }
  plan.push({ bar, style, section, intro, fill: bar === bars - 1 || (kind !== 'final' && bar === 11) });
 }
 return plan;
}

function stepTime(step, swing) {
 const beatIndex = Math.floor(step / 4), sub = step % 4;
 if (swing && sub === 2) return beatIndex + 2 / 3;
 if (swing && (sub === 1 || sub === 3)) return beatIndex + (sub === 1 ? 1 / 3 : 5 / 6);
 return beatIndex + sub / 4;
}

// Restituisce le note di uno strumento per un'intera canzone.
export function partNotes(instrument, plan, difficulty) {
 const lanes = LANES[instrument], maxLevel = difficulty === 'assist' ? 1 : difficulty === 'expert' ? 3 : 2;
 const out = [], seen = new Set();
 for (const p of plan) {
  const style = STYLES[p.style] || STYLES.Casa;
  const chord = style.progression[p.bar % style.progression.length];
  const section = style.twoBar && p.section === 'A' && p.bar % 2 ? 'B' : p.section;
  let pattern = style[instrument][section];
  if (p.intro) pattern = pattern.filter(x => x.lv === 1);
  for (const x of pattern) {
   if (x.lv > maxLevel) continue;
   let lane = instrument === 'drums' ? x.l : (chordLane(chord[0], lanes) + x.l) % lanes;
   const beatPos = p.bar * 4 + stepTime(x.s, style.swing);
   const key = beatPos.toFixed(3) + '/' + lane;
   if (seen.has(key)) continue;
   seen.add(key);
   const pitch = instrument === 'drums' ? 0 : chord[0] + VOICES[instrument][x.l % VOICES[instrument].length];
   out.push({ beat: beatPos, lane, durBeats: x.d / 4, pitch, chord: chord[1], root: chord[0] });
  }
  if (p.fill && instrument === 'drums') for (const s of [12, 13, 14, 15]) {
   const beatPos = p.bar * 4 + stepTime(s, style.swing), key = beatPos.toFixed(3) + '/1';
   if (maxLevel >= 2 && !seen.has(key)) { seen.add(key); out.push({ beat: beatPos, lane: 1, durBeats: 0, pitch: 0 }); }
  }
 }
 return out;
}

// Accordo per l'accompagnamento: semitoni dalla tonica e qualità della battuta.
export function chordAt(plan, bar) {
 const p = plan[Math.min(plan.length - 1, Math.max(0, bar))];
 const style = STYLES[p.style] || STYLES.Casa;
 return { chord: style.progression[bar % style.progression.length], style: p.style, swing: style.swing };
}
export const CHORD_TONES = { maj: [0, 4, 7], min: [0, 3, 7], '7': [0, 4, 7, 10], m7: [0, 3, 7, 10], '5': [0, 7, 12] };
