import {test} from 'node:test';
import assert from 'node:assert/strict';
import {MUSIC_CITIES,INSTRUMENTS,makeChart} from '../dist/core.js';
const signature=ch=>ch.notes.map(n=>((n.t-2)/ch.beat).toFixed(2)+':'+n.lane).join(',');
test('every music city has its own chart for every instrument',()=>{
 for(const instrument of Object.keys(INSTRUMENTS)){const seen=new Set(MUSIC_CITIES.map(c=>signature(makeChart(instrument,c.id))));assert.equal(seen.size,MUSIC_CITIES.length,instrument);}
});
test('swing genres place off-beat eighths on the triplet, straight genres on the half beat',()=>{
 const off=ch=>ch.notes.map(n=>((n.t-2)/ch.beat)%1).filter(x=>x>.01);
 assert.ok(off(makeChart('drums',1)).some(x=>Math.abs(x-2/3)<.01));assert.ok(!off(makeChart('drums',2)).some(x=>Math.abs(x-2/3)<.01));
});
test('festival is a medley and backing parts use the other two instruments',()=>{
 const f=makeChart('bass',11,'normal','final');assert.equal(new Set(f.plan.map(p=>p.style)).size,8);assert.deepEqual(Object.keys(f.backing).sort(),['drums','guitar']);
 for(const n of makeChart('guitar',8).notes)assert.ok(Number.isFinite(n.pitch));
});
