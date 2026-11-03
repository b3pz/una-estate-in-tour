import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initialState,validateState,award,MUSIC_CITIES} from '../dist/core.js';
import {abilityDex,metroReason,MAP_POINTS,metroSpawn} from '../dist/progress.js';
import {townLayout,isWalkable} from '../dist/world.js';
test('one campaign can collect all 32 skills with independent scores for all instruments',()=>{const s=initialState();s.stage='tour';for(const c of MUSIC_CITIES){s.visited.push(c.id);s.puzzles.push(c.id);for(const instrument of ['guitar','bass','drums']){s.instrument=instrument;award(s,c.id,90,'concert');}}const dex=abilityDex(s);assert.equal(dex.length,32);assert.ok(dex.every(a=>a.learned&&a.mastered));assert.equal(s.starter,'guitar');assert.deepEqual(validateState(JSON.parse(JSON.stringify(s))),s);});
test('failed performances and uncompleted theory do not grant instrument abilities',()=>{const s=initialState();award(s,1,90,'practice');assert.equal(abilityDex(s).filter(a=>a.learned).length,0);s.puzzles=[1];award(s,1,10,'concert');assert.equal(s.mastery['1:guitar'],undefined);award(s,1,65,'concert');assert.equal(s.mastery['1:guitar'],65);assert.equal(s.mastery['1:bass'],undefined);});
test('old saves migrate only earned passes to the original instrument',()=>{const s=initialState('bass');delete s.mastery;delete s.starter;s.passes=[1];s.best={1:72};const v=validateState(s);assert.equal(v.starter,'bass');assert.equal(v.mastery['1:bass'],72);assert.equal(v.mastery['1:guitar'],undefined);});
test('metro needs story unlock, visited stops, boat and festival requirements',()=>{const s=initialState();s.city=3;s.visited=[0,1,3,9,11];assert.ok(metroReason(s,1));s.stage='tour';assert.ok(metroReason(s,1));s.stories=[3];assert.ok(metroReason(s,1));s.bicycle=true;s.transport={bike:3,metro:3};assert.equal(metroReason(s,1),null);assert.ok(metroReason(s,2));assert.ok(metroReason(s,9));s.boat=true;assert.ok(metroReason(s,9));assert.ok(metroReason(s,11));s.passes=MUSIC_CITIES.map(c=>c.id);s.homeShow=true;assert.equal(metroReason(s,11),null);assert.ok(metroReason(s,0));});
test('illustrated map has all cities and metro arrival avoids buildings',()=>{assert.equal(MAP_POINTS.length,12);for(let i=0;i<12;i++){assert.ok(MAP_POINTS[i].every(n=>n>0&&n<100));const l=townLayout(i);assert.ok(metroSpawn(l).some(p=>isWalkable(l,p.x,p.y)));}});

test('physical metro entrances exist only in served towns; island and mountain have dedicated transport',async()=>{const {METRO_STOPS}=await import('../dist/progress.js');for(let id=0;id<12;id++)assert.equal(townLayout(id).objects.some(o=>o.kind==='metro'),METRO_STOPS.includes(id));assert.ok(townLayout(7).objects.some(o=>o.kind==='cable'));assert.ok(townLayout(6).objects.some(o=>o.kind==='cable'));for(const id of [9,10])assert.ok(townLayout(id).objects.some(o=>o.kind==='bridge'));});
test('island walkway stays on the deck in both directions',async()=>{const {roadLayout}=await import('../dist/world.js');for(const [a,b]of [[9,10],[10,9]]){const l=roadLayout(a,b);assert.equal(l.theme,'seaBridge');assert.ok(isWalkable(l,24,18));assert.equal(isWalkable(l,21,18),false);}});
test('transport mission progress survives reload and old bikes do not unlock the metro',()=>{const s=initialState();s.bicycle=true;delete s.transport;const v=validateState(s);assert.deepEqual(v.transport,{bike:3,metro:0});v.transport.metro=2;assert.equal(validateState(v).transport.metro,2);v.transport.metro=3;assert.equal(validateState(v).transport.metro,3);});

test('journey advice respects prologue, first island crossing, mountain cable and festival gates',async()=>{
 const {journeyRoute,journeyLeg}=await import('../dist/progress.js');const s=initialState();
 assert.equal(journeyRoute(s,1),null);s.stage='tour';s.city=10;
 const firstIsland=journeyRoute(s,9);assert.equal(firstIsland.legs.at(-1).from,8);assert.equal(firstIsland.legs.at(-1).mode,'Traghetto');assert.ok(firstIsland.legs.at(-1).requirement);
 s.boat=true;assert.deepEqual(journeyRoute(s,9).cities,[10,9]);assert.equal(journeyRoute(s,9).legs[0].mode,'Pontile');
 s.city=6;assert.equal(journeyRoute(s,7).legs[0].mode,'Funivia');assert.equal(journeyRoute(s,11),null);
 s.passes=MUSIC_CITIES.map(c=>c.id);s.homeShow=true;assert.ok(journeyRoute(s,11));assert.equal(journeyRoute(s,-1),null);assert.equal(journeyRoute(s,1.5),null);
 assert.deepEqual(journeyRoute(s,6).legs,[]);assert.equal(journeyLeg(s,1,2).mode,'Sentiero');
});
test('all metro destinations have a safe arrival within reach of the physical entrance',async()=>{
 const {METRO_STOPS}=await import('../dist/progress.js');for(const id of METRO_STOPS){const l=townLayout(id),station=l.objects.find(o=>o.kind==='metro'),pos=metroSpawn(l).find(p=>isWalkable(l,p.x,p.y));assert.ok(pos);assert.ok(Math.hypot(pos.x-station.x,pos.y-station.y)<2.6);}
});
