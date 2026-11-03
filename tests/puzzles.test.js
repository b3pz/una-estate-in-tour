import {test} from 'node:test';
import assert from 'node:assert/strict';
import {MUSIC_CITIES} from '../dist/core.js';
import {PUZZLE_INFO,BLUES_TARGET,bluesMatches,diagnoseSignal,SIGNAL_SOLUTION,songOrderMatches,grooveDiff,GROOVE_TARGET,tempoResult,claveCycle,CLAVE_STEPS,levareClips,RESPONSE_RULES,makeMotif} from '../dist/puzzles.js';
test('eight puzzles with eight different mechanics; hints never list the full answer',()=>{
 assert.deepEqual(Object.keys(PUZZLE_INFO).map(Number),MUSIC_CITIES.map(c=>c.id));assert.equal(new Set(Object.values(PUZZLE_INFO).map(p=>p.mech)).size,8);
 assert.doesNotMatch(PUZZLE_INFO[1].hint,/Re7, Re7, La7, La7/);
});
test('blues by ear, signal chain diagnosis and song form',()=>{
 assert.equal(bluesMatches(BLUES_TARGET),12);assert.equal(bluesMatches(BLUES_TARGET.map(()=>'La7')),7);
 assert.ok(diagnoseSignal(SIGNAL_SOLUTION).ok);assert.match(diagnoseSignal({...SIGNAL_SOLUTION,microfono:'amplificatore'}).message,/Larsen/);assert.match(diagnoseSignal({chitarra:'mixer'}).message,/microfoni/);assert.equal(diagnoseSignal({}).ok,false);
 assert.equal(songOrderMatches(['strofa','ritornello','ponte','finale']),4);assert.equal(songOrderMatches(['finale','ritornello','ponte','strofa']),2);
});
test('groove grid, tempo keeping, clave timing',()=>{
 assert.ok(grooveDiff(GROOVE_TARGET).ok);assert.deepEqual(grooveDiff([1,1,1,1,1,1,1,1]),{extra:5,missing:0,ok:false});
 const taps=b=>Array.from({length:8},(_,i)=>i*60/b);assert.ok(tempoResult(taps(80),80).ok);assert.equal(tempoResult(taps(92),80).ok,false);assert.equal(tempoResult([0,1,1.3,2.9,3.2,5],60).steady,false);
 const step=60/96/4;assert.ok(claveCycle(CLAVE_STEPS.map(s=>s*step+.03),step));assert.equal(claveCycle(CLAVE_STEPS.slice(0,4).map(s=>s*step),step),false);assert.equal(claveCycle([...CLAVE_STEPS.map(s=>s*step),1*step],step),false);
});
test('levare clips mix both kinds and jazz responses follow their rule',()=>{
 for(let seed=1;seed<50;seed++){const c=levareClips(seed);assert.ok(c.some(x=>x.onLevare)&&c.some(x=>!x.onLevare));}
 const m=[0,2,1,3];assert.ok(RESPONSE_RULES[0].check(m,[0,2,1,0]));assert.equal(RESPONSE_RULES[0].check(m,m),false);assert.ok(RESPONSE_RULES[1].check(m,[3,1,2,0]));
 const m3=makeMotif(7,2);assert.ok(m3.every(x=>x<3));assert.ok(RESPONSE_RULES[2].check(m3,m3.map(x=>x+1)));
});
