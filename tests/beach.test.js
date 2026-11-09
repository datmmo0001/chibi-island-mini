import test from 'node:test';
import assert from 'node:assert/strict';
import {MAPS,RULES,obstacleContains,concealedAt} from '../shared.js';
import {Room} from '../server/game.js';

test('beach is a separate 20x survival island shaped like the meadow',()=>{
  const b=MAPS.beach,m=MAPS.meadow;
  assert.ok(b,'MAPS.beach exists');
  assert.equal(b.id,'beach');assert.equal(b.name,'Đảo Bãi Cát');
  assert.ok(Math.abs(b.radius-31*Math.sqrt(20))<1e-9,'radius is 31*sqrt(20)');
  assert.ok(Math.abs((b.radius/31)**2-20)<1e-9,'area is 20x');
  assert.equal(b.duration,600);assert.equal(b.survival,true);assert.equal(b.areaMultiplier,20);
  assert.equal(b.regions.length,6);assert.deepEqual(b.regions.map(r=>r.name),['Bãi Cọ','Vịnh San Hô','Đồi Cát','Bến Thuyền','Quảng Trường Cát','Mũi Đá']);
  assert.equal(b.spawnPoints.length,8);assert.ok(b.spawnPoints.every(p=>Math.abs(Math.hypot(p.x,p.z)-78)<1e-9),'spawns on the radius-78 ring');
  assert.equal(b.zones.length,5);assert.deepEqual(b.zones,m.zones,'same five zone rings as the meadow');
  assert.ok(Array.isArray(b.loot)&&b.loot.length>0);assert.ok(Array.isArray(b.pickups));
  assert.notEqual(b.obstacles,m.obstacles,'own obstacle layout');
});

test('beach obstacles stay on the island, off the spawns, and lean palm/rock/bush',()=>{
  const b=MAPS.beach;
  assert.ok(b.obstacles.length>150,'dense scatter like the meadow');
  for(const o of b.obstacles)assert.ok(Math.hypot(o.x,o.z)+o.r<b.radius,`obstacle ${o.id} stays on island`);
  for(const p of b.spawnPoints)for(const o of b.obstacles)
    assert.ok(Math.hypot(p.x-o.x,p.z-o.z)>o.r+RULES.playerRadius,`spawn clear of ${o.id}`);
  const trees=b.obstacles.filter(o=>o.kind==='tree').length;
  const rocks=b.obstacles.filter(o=>o.kind==='rock').length;
  const bushes=b.obstacles.filter(o=>o.kind==='bush').length;
  assert.ok(trees>60,'mostly trees (rendered as coconut palms on this map)');
  assert.ok(rocks>20&&bushes>=8,'rocks and hide-bushes present');
  const bush=b.obstacles.find(o=>o.kind==='bush');
  assert.equal(bush.solid,false);
  assert.equal(concealedAt({x:bush.x,y:0,z:bush.z},b),true,'players can hide in beach bushes');
  assert.ok(b.obstacles.some(o=>o.kind==='platform'&&o.walkable),'climbable platforms kept');
  assert.ok(b.obstacles.some(o=>o.kind==='chest'&&o.interactive),'supply chests kept');
  assert.ok(b.obstacles.every(o=>o.id.startsWith('b-')),'beach obstacle ids are namespaced');
});

test('a beach room opens at meadow capacity and starts solo',()=>{
  const room=new Room('BEACH','me',{mapId:'beach',mode:'solo',random:()=>.5});
  assert.equal(room.map.id,'beach');assert.equal(room.map.name,'Đảo Bãi Cát');
  assert.equal(room.capacity,3,'beach rooms cap at 3 like the meadow, not 20');
  room.addHuman('me','Explorer');room.configure('me',{ready:true});room.start('me');
  assert.equal(room.phase,'playing');
  const p=room.players.get('me');
  assert.ok(room.map.spawnPoints.some(s=>Math.hypot(p.x-s.x,p.z-s.z)<1e-6),'human starts on a beach spawn point');
  const big=new Room('BEACH20','host',{mapId:'beach',mode:'party',capacity:20,random:()=>.5});
  assert.equal(big.capacity,3,'capacity 20 is reserved for the frontier map');
});
