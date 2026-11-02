import {test} from 'node:test';
import {spriteCell} from '../dist/assets.js';
import assert from 'node:assert/strict';
import {CITIES,EDGES,findPath,stepToward,initialState,validateState} from '../dist/core.js';
import {WIDTH,HEIGHT,OPPOSITE,townGates,townLayout,roadLayout,arrival,isWalkable,gateAt,facingFor,cameraFor} from '../dist/world.js';
test('all connections have matching entrances, with safe inward spawns on both ends',()=>{
 for(const [a,b]of EDGES)for(const [from,to]of [[a,b],[b,a]]){
 const gates=townGates(to),g=gates.find(x=>x.to===from),pos=arrival(to,from),layout=townLayout(to);
 assert.ok(g);assert.equal(pos.facing,OPPOSITE[g.side]);assert.ok(isWalkable(layout,pos.x,pos.y),`${from}->${to} unsafe spawn`);assert.equal(gateAt(layout,pos.x,pos.y),null,'arrival must not immediately exit');
 if(g.side==='west')assert.ok(pos.x<5);if(g.side==='east')assert.ok(pos.x>WIDTH-5);if(g.side==='north')assert.ok(pos.y<5);if(g.side==='south')assert.ok(pos.y>HEIGHT-5);
 }
});
test('road entry and departure preserve cardinal direction, including bent routes',()=>{
 for(const [a,b]of EDGES)for(const [from,to]of [[a,b],[b,a]]){const road=roadLayout(from,to),departure=townGates(from).find(g=>g.to===to),destination=townGates(to).find(g=>g.to===from);assert.equal(road.gates[0].side,OPPOSITE[departure.side]);assert.equal(road.gates[1].side,OPPOSITE[destination.side]);assert.equal(road.spawn.facing,departure.side);assert.equal(gateAt(road,road.spawn.x,road.spawn.y),null);}
});
test('all town entrances can reach every interactive building and teacher',()=>{
 for(const city of CITIES){const l=townLayout(city.id);for(const g of l.gates){const pos=arrival(city.id,g.to);for(const target of l.objects){const path=findPath(pos,target,(x,y)=>isWalkable(l,x,y),WIDTH,HEIGHT);assert.ok(path.length,`${city.name}: entrance ${g.side} cannot reach ${target.label}`);}}}
});
test('all routes can be walked in both directions without clicking a transition',()=>{
 for(const [a,b]of EDGES){const l=roadLayout(a,b);for(const gate of l.gates)assert.ok(gateAt(l,gate.x,gate.y));assert.ok(findPath(l.spawn,l.gates[1],(x,y)=>isWalkable(l,x,y),WIDTH,HEIGHT).length);}
});
test('layouts have distinct building positions and visual themes, not only palettes',()=>{
 const layouts=CITIES.map(c=>townLayout(c.id));assert.equal(new Set(layouts.map(l=>l.theme)).size,12);assert.equal(new Set(layouts.map(l=>JSON.stringify(l.buildings.map(b=>[b.x,b.y,b.w,b.h,b.style])))).size,12);
});
test('direction follows movement and save files preserve route/interior location',()=>{
 assert.equal(facingFor(-1,0),'west');assert.equal(facingFor(1,0),'east');assert.equal(facingFor(0,-1),'north');assert.equal(facingFor(0,1),'south');
 const s=initialState();s.scene={type:'road',from:0,to:1};s.x=3.3;s.y=18;s.facing='east';assert.deepEqual(validateState(JSON.parse(JSON.stringify(s))),s);
 s.scene={type:'interior',label:'Scuola'};s.x=24;s.y=26;assert.deepEqual(validateState(JSON.parse(JSON.stringify(s))),s);
 assert.equal(validateState({...s,scene:{type:'road',from:0,to:11}}).scene,null);
});

test('walking west is drawn from consistent mirrored east poses, while north and south stay distinct',()=>{
 for(const walk of [0,.2,.4,.6]){const west=spriteCell('west',true,walk),east=spriteCell('east',true,walk);assert.equal(west.col,east.col);assert.equal(west.flip,true);assert.equal(east.flip,false);}
 assert.equal(spriteCell('west').col,1);assert.equal(spriteCell('north').col,3);assert.equal(spriteCell('south').col,0);
});

test('wide viewports center the map rather than leaving a blank strip on the right',()=>{const cam=cameraFor(23,22,1440,600);assert.equal(cam.x,(48*24-1440)/2);assert.ok(cam.y>=0);const narrow=cameraFor(23,22,300,600);assert.ok(narrow.x>=0);});
test('click walking reaches the garage door even with slow and irregular frames',()=>{
 const l=townLayout(0),door=l.objects.find(o=>o.kind==='garage'),pos={x:19.2,y:18};const path=findPath(pos,door,(x,y)=>isWalkable(l,x,y),WIDTH,HEIGHT);let frames=0;
 while(path.length&&frames<500){const target=path[0];if(Math.hypot(pos.x-target.x,pos.y-target.y)<.15)path.shift();else{const delta=stepToward(pos,target,[.54,.08,.4,.12][frames%4]);pos.x+=delta.dx;pos.y+=delta.dy;assert.ok(isWalkable(l,pos.x,pos.y));}frames++;}
 assert.equal(path.length,0,'must reach the destination rather than oscillating around a waypoint');assert.ok(Math.hypot(pos.x-door.x,pos.y-door.y)<.7,'must enter automatic door trigger');
});
