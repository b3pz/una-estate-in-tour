import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CASES,chapter,caseComplete,mysteryEnding} from '../dist/adventure.js';
import {initialState,validateState,MUSIC_CITIES} from '../dist/core.js';
import {spriteFit} from '../dist/assets.js';
test('all eight musical towns have distinct reconstructable cases and mystery clues',()=>{assert.deepEqual(Object.keys(CASES).map(Number),MUSIC_CITIES.map(c=>c.id));for(const q of Object.values(CASES)){assert.ok(q.clue&&q.fact&&q.hint);assert.ok(caseComplete(q.parts,q.parts.map((_,i)=>i)));assert.equal(caseComplete(q.parts,[]),false);assert.equal(caseComplete(q.parts,q.parts.map((_,i)=>q.parts.length-i-1)),false);}});
test('story time and mystery depend on durable events and survive saved games',()=>{const s=initialState();assert.match(chapter(s),/MATTINA/);s.stage='practice';assert.match(chapter(s),/POMERIGGIO/);s.stage='rival';assert.match(chapter(s),/SERA/);s.puzzles=MUSIC_CITIES.map(c=>c.id);assert.equal(mysteryEnding(s),false);s.stories=[6];assert.ok(mysteryEnding(validateState(JSON.parse(JSON.stringify(s)))));s.passes=[1,2];assert.match(chapter(s),/LUGLIO/);s.passes=[1,2,4,5,7];assert.match(chapter(s),/AGOSTO/);s.homeShow=true;assert.match(chapter(s),/SETTEMBRE/);});
test('sprite boxes preserve original aspect ratios for people and furniture',()=>{for(const [sw,sh,w,h]of [[100,300,64,64],[300,100,100,160],[100,100,50,94]]){const fit=spriteFit(sw,sh,w,h);assert.ok(fit.w<=w&&fit.h<=h);assert.ok(Math.abs(fit.w/fit.h-sw/sh)<1e-9);}});
