import {test} from 'node:test';
import assert from 'node:assert/strict';
import {concertGeometry,notePosition} from '../dist/concert.js';
test('perspective notes reach the timing line exactly at their scheduled beat on wide and narrow screens',()=>{for(const W of [240,320,700,1440])for(const lanes of [3,4]){const g=concertGeometry(W,600,lanes);assert.equal(notePosition(g,0).y,g.hit);assert.equal(notePosition(g,5).y,g.horizon);assert.ok(notePosition(g,1).y<notePosition(g,.5).y);assert.ok(g.bottom<W);for(let l=0;l<lanes;l++){const x=g.cx-g.bottom/2+(l+.5)*g.bottom/lanes;assert.ok(x>0&&x<W);}}});
