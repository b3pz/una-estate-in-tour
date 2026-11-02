import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CITIES,MUSIC_CITIES,INSTRUMENTS,initialState,validateState,neighbors,findPath,gate,makeChart,findNote,accuracy,award} from '../dist/core.js';
test('world has eight music cities, three story locations and one festival; every place is reachable',()=>{
 assert.equal(MUSIC_CITIES.length,8);assert.equal(CITIES.filter(c=>c.type==='story').length,3);assert.equal(CITIES.filter(c=>c.type==='final').length,1);
 const seen=new Set([0]),queue=[0];while(queue.length)for(const n of neighbors(queue.shift()))if(!seen.has(n)){seen.add(n);queue.push(n);}assert.equal(seen.size,12);
});
test('every instrument and difficulty produces a playable sorted chart within the song',()=>{
 for(const instrument of Object.keys(INSTRUMENTS))for(const city of CITIES)for(const difficulty of ['assist','normal','expert'])for(const kind of ['tutorial','concert','final']){
 const chart=makeChart(instrument,city.id,difficulty,kind);assert.ok(chart.notes.length>0);let previous=-1;const slots=new Set();for(const n of chart.notes){assert.ok(n.t>=previous);assert.ok(n.t+n.duration<chart.duration);assert.ok(n.lane>=0&&n.lane<INSTRUMENTS[instrument].lanes);assert.ok(!slots.has(`${n.t}/${n.lane}`));slots.add(`${n.t}/${n.lane}`);previous=n.t;}
 }
});
test('instruments have different patterns and guitar sustains; expert increases density',()=>{
 const charts=Object.keys(INSTRUMENTS).map(i=>makeChart(i,2));assert.notDeepEqual(charts[0].notes,charts[1].notes);assert.notDeepEqual(charts[1].notes,charts[2].notes);assert.ok(charts[0].notes.some(n=>n.duration>0));
 for(const i of Object.keys(INSTRUMENTS))assert.ok(makeChart(i,2,'expert').notes.length>makeChart(i,2,'assist').notes.length);
});
test('hitting a chord matches individual lanes once and rejects late input',()=>{
 const notes=[{t:1,lane:0},{t:1,lane:2},{t:1.5,lane:0}];assert.equal(findNote(notes,0,1.03,.16),notes[0]);notes[0].status='hit';assert.equal(findNote(notes,0,1.03,.16),null);assert.equal(findNote(notes,2,1.03,.16),notes[1]);assert.equal(findNote(notes,0,1.8,.16),null);assert.equal(accuracy([{points:1},{points:0}]),50);
});
test('campaign can progress from school to all eight passes to home and festival',()=>{
 const s=initialState('bass');assert.ok(gate(s,1));award(s,0,0,'tutorial');assert.equal(s.stage,'rival');award(s,0,90,'rival');assert.equal(s.stage,'tour');assert.equal(gate(s,1),null);assert.ok(gate(s,11));
 for(const c of MUSIC_CITIES){const fail=award(s,c.id,20,'concert');assert.equal(fail.won,false);assert.ok(!s.passes.includes(c.id));const win=award(s,c.id,90,'concert');assert.ok(win.won);}
 assert.equal(s.passes.length,8);assert.ok(gate(s,11));award(s,0,90,'home');assert.equal(gate(s,11),null);award(s,11,90,'final');assert.ok(s.finished);
});
test('replays do not grant duplicate passes or repeated experience; boat unlocks separately',()=>{
 const s=initialState();s.stage='tour';award(s,1,80,'concert');const xp=s.xp;award(s,1,90,'concert');assert.equal(s.passes.length,1);assert.equal(s.xp,xp);award(s,8,90,'boat');assert.ok(s.boat);assert.ok(!s.passes.includes(8));
});
test('corrupted saves are rejected or normalized and fresh saves round trip',()=>{
 assert.equal(validateState(null),null);assert.equal(validateState({version:1,instrument:'flute',city:0}),null);assert.equal(validateState({...initialState(),city:999}),null);assert.deepEqual(validateState(JSON.parse(JSON.stringify(initialState()))),initialState());
 const valid=validateState({...initialState(),x:1000,y:-22,passes:[1,1,0,999],settings:{offset:9999,volume:-4,difficulty:'hack'}});assert.deepEqual(valid.passes,[1]);assert.equal(valid.x,44);assert.equal(valid.y,8);assert.equal(valid.settings.volume,0);assert.equal(valid.settings.offset,250);assert.equal(valid.settings.difficulty,'normal');
});
test('walking paths route around buildings and reject blocked destinations',()=>{
 const walkable=(x,y)=>x>=0&&x<=8&&y>=0&&y<=8&&!(x>=3&&x<=5&&y>=1&&y<=6);
 const path=findPath({x:1,y:3},{x:7,y:3},walkable,8,8);assert.ok(path.length>0);assert.deepEqual(path.at(-1),{x:7,y:3});assert.ok(path.every(p=>walkable(p.x,p.y)));assert.deepEqual(findPath({x:1,y:3},{x:4,y:3},walkable,8,8),[]);
});
