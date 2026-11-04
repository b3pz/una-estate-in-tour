import {test} from 'node:test';
import assert from 'node:assert/strict';
import {roadLayout,isWalkable} from '../dist/world.js';
import {findPath} from '../dist/core.js';
import {ROUTES,pathDistance,inRect} from '../dist/routes.js';
test('hand-drawn routes are walkable end to end in both directions and reach every point of interest',()=>{
 for(const key of Object.keys(ROUTES)){const [a,b]=key.split('-').map(Number);
  for(const [from,to] of [[a,b],[b,a]]){const L=roadLayout(from,to);assert.ok(L.route);const can=(x,y)=>isWalkable(L,x,y);
   const end=L.gates.find(g=>g.kind==='roadEnd');assert.ok(can(L.spawn.x,L.spawn.y));
   assert.ok(findPath(L.spawn,{x:end.x>24?end.x-1:end.x+1,y:end.y},can,48,34).length>0,`${from}->${to} arrivo`);
   for(const o of L.objects){const near=[[0,1],[1,0],[-1,0],[0,-1],[0,0]].map(([dx,dy])=>({x:o.x+dx,y:o.y+dy})).find(q=>can(q.x,q.y));assert.ok(near,`${o.kind} raggiungibile`);assert.ok(findPath(L.spawn,near,can,48,34).length>0,`${o.kind} percorso`);}
  }
  const L=roadLayout(a,b);let woods=0;for(let x=2;x<46;x+=3)for(let y=2;y<32;y+=3)if(pathDistance(L.route,x,y)>3&&!L.route.clearings.some(r=>inRect(r,x,y,1))){woods++;assert.equal(isWalkable(L,x,y),false,`bosco ${x},${y}`);}assert.ok(woods>20);
 }
});
