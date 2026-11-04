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
test('town roads never run under buildings and reach every door, gate, stage and transport',async()=>{const w=await import('../dist/world.js');
 const seg=(a,b,r)=>{for(let i=0;i<=60;i++){const x=a.x+(b.x-a.x)*i/60,y=a.y+(b.y-a.y)*i/60;if(x>r.x-.4&&x<r.x+r.w+.4&&y>r.y-.4&&y<r.y+r.h-.1)return true;}return false;};
 for(let id=0;id<12;id++){const L=w.townLayout(id);for(const p of L.paths)for(let i=1;i<p.length;i++)for(const b of L.buildings)assert.equal(seg(p[i-1],p[i],b),false,`${id} ${b.label}`);
  const ends=L.paths.map(p=>p.at(-1));for(const t of [...L.gates,...L.objects.filter(o=>o.building||o.kind==='stage'||['metro','cable','ferry','bridge'].includes(o.kind))])assert.ok(ends.some(e=>Math.hypot(e.x-t.x,e.y-t.y)<1.2),`${id} ${t.label}`);}});
test('cities have blocks and passers-by, villages do not; every door stays reachable',async()=>{const w=await import('../dist/world.js');const {findPath}=await import('../dist/core.js');
 for(let id=0;id<12;id++){const L=w.townLayout(id);const blocks=L.buildings.filter(b=>b.kind==='scenery'&&b.city!==undefined).length,pb=L.objects.filter(o=>o.kind==='passerby').length;
  if(w.TOWN_SIZE[id]==='city'){assert.ok(blocks>=1,`${id} isolati`);assert.ok(pb>=1,`${id} passanti`);}else{assert.equal(blocks,0);assert.equal(pb,0);}
  const can=(x,y)=>w.isWalkable(L,x,y),start={x:Math.round(L.plaza[0]),y:Math.round(L.plaza[1])};
  for(const o of L.objects.filter(o=>o.building))assert.ok(findPath(start,{x:Math.round(o.x),y:Math.round(o.y+.4)},can,48,34).length>0||Math.hypot(start.x-o.x,start.y-o.y)<1,`${id} porta ${o.label}`);}});
test('no town road junction forms a pinwheel (arms all turning the same way)',async()=>{const w=await import('../dist/world.js');
 const set=pts=>new Set(pts.map(([x,y])=>x+','+y)),line=(x0,y0,x1,y1)=>{const o=[];for(let x=Math.min(x0,x1);x<=Math.max(x0,x1);x++)for(let y=Math.min(y0,y1);y<=Math.max(y0,y1);y++)o.push([x,y]);return o;};
 const bad=set([...line(10,4,10,16),...line(4,10,16,10),...line(10,4,14,4),...line(16,10,16,14),...line(10,16,6,16),...line(4,10,4,6)]);
 assert.equal(w.pinwheels(bad).length,1,'il rilevatore riconosce la forma');
 const ok=set([...line(10,4,10,16),...line(4,10,16,10),...line(10,4,14,4),...line(16,10,16,14),...line(10,16,14,16),...line(4,10,4,14)]);
 assert.equal(w.pinwheels(ok).length,0);
 for(let id=0;id<12;id++)assert.equal(w.roadReport(id).pinwheels.length,0,`città ${id}`);});
test('town roads cross water only on bridges',async()=>{const w=await import('../dist/world.js');
 for(let id=0;id<12;id++){const L=w.townLayout(id);for(const p of L.paths)for(let i=1;i<p.length;i++)for(let k=0;k<=10;k++){const x=p[i-1].x+(p[i].x-p[i-1].x)*k/10,y=p[i-1].y+(p[i].y-p[i-1].y)*k/10;
  if(L.waters.some(wt=>x>wt.x&&x<wt.x+wt.w&&y>wt.y&&y<wt.y+wt.h))assert.ok(L.gates.some(g=>(g.side==='east'||g.side==='west')&&Math.abs(y-g.y)<1),`${id} ${x.toFixed(1)},${y.toFixed(1)}`);}}});
test('every house and city block has a road to its door',async()=>{const w=await import('../dist/world.js');
 for(let id=0;id<12;id++){const L=w.townLayout(id);const ends=L.paths.map(p=>p.at(-1));for(const b of L.buildings.filter(b=>b.kind==='scenery'))assert.ok(ends.some(e=>Math.abs(e.x-(b.x+b.w/2))<1&&Math.abs(e.y-(b.y+b.h+.5))<1),`${id} casa @${b.x},${b.y}`);}});
