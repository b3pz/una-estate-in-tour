import {test} from 'node:test';
import assert from 'node:assert/strict';
import {MUSIC_CITIES,initialState,validateState} from '../dist/core.js';
import {CLUE_FINDS,CLUE_BEATS,clueText,clueIndex,cluesFound,chapter,mysteryReady,mysteryEnding,DEDUCTION,RESIDENTS,ROOMS,ROAD_SCENES,roadKey} from '../dist/adventure.js';
import {EDGES} from '../dist/core.js';
import {townLayout,isWalkable} from '../dist/world.js';

test('every music city gives a clue, and clues are revealed in story order whatever the route',()=>{
 assert.deepEqual(Object.keys(CLUE_FINDS).map(Number).sort((a,b)=>a-b),MUSIC_CITIES.map(c=>c.id));assert.equal(CLUE_BEATS.length,8);
 const s=initialState();s.puzzles=[10,1];assert.equal(clueIndex(s,10),0);assert.match(clueText(s,10),/disegno di un plettro/);assert.doesNotMatch(clueText(s,10),/Andrea/);
 s.puzzles=[1,2,4,5,7,8,9,10];assert.match(clueText(s,10),/Riva \/ Andrea/);assert.equal(cluesFound(s).length,8);
});
test('the mystery needs all eight clues and the archive deduction; saves migrate',()=>{
 const s=initialState();s.puzzles=MUSIC_CITIES.map(c=>c.id).slice(0,7);assert.equal(mysteryReady(s),false);s.puzzles.push(10);assert.ok(mysteryReady(s));assert.equal(mysteryEnding(s),false);
 s.mystery=2;assert.ok(mysteryEnding(validateState(JSON.parse(JSON.stringify(s)))));
 const old=initialState();delete old.mystery;old.stories=[6];assert.equal(validateState(old).mystery,1);
 for(const d of DEDUCTION){assert.ok(d.options[d.answer]);assert.ok(d.why);}
});
test('story time depends on durable events',()=>{const s=initialState();assert.match(chapter(s),/MATTINA/);s.stage='practice';assert.match(chapter(s),/POMERIGGIO/);s.stage='rival';assert.match(chapter(s),/SERA/);s.passes=[1,2];assert.match(chapter(s),/LUGLIO/);s.passes=[1,2,4,5,7];assert.match(chapter(s),/AGOSTO/);s.homeShow=true;assert.match(chapter(s),/SETTEMBRE/);});
test('residents are walkable, never cloned at the same spot, and every road has its own scene',()=>{
 const spots=new Map();
 for(const [id,list] of Object.entries(RESIDENTS)){const L=townLayout(+id);const seen=new Set();for(const r of list){assert.ok(isWalkable(L,r.x,r.y),`${id} ${r.who}`);assert.ok(!seen.has(r.who));seen.add(r.who);assert.ok(r.lines.start);}}
 for(const [a,b] of EDGES)assert.ok(ROAD_SCENES[roadKey(a,b)],`${a}-${b}`);
});
test('narrative interiors are all different and have something to examine',()=>{
 const sigs=new Set();for(const [label,r] of Object.entries(ROOMS)){assert.ok(r.spot,label);const sig=JSON.stringify(r.items);assert.ok(!sigs.has(sig),label);sigs.add(sig);}
 for(let id=0;id<12;id++)for(const o of townLayout(id).objects.filter(o=>o.building&&o.kind!=='garage'&&o.kind!=='school'))assert.ok(ROOMS[o.label],o.label);
});
test('sprite boxes preserve original aspect ratios for people and furniture',async()=>{const {spriteFit}=await import('../dist/assets.js');for(const [sw,sh,w,h]of [[100,300,64,64],[300,100,100,160],[100,100,50,94]]){const fit=spriteFit(sw,sh,w,h);assert.ok(fit.w<=w&&fit.h<=h);assert.ok(Math.abs(fit.w/fit.h-sw/sh)<1e-9);}});
