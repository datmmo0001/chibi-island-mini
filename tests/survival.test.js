import test from 'node:test';
import assert from 'node:assert/strict';
import { Room } from '../server/game.js';
import { MAP, MAPS, RULES, WEAPONS, stepActor, moveActor, zoneAt, cylinderHit } from '../shared.js';
import { addLoot, interact, equipLoot, shoot, updateWeapon, reloadWeapon, activeWeapon } from '../server/survival.js';

function roomForMeadow() {
  const room = new Room('GREEN1','me',{mapId:'meadow',mode:'solo',random:()=>.61});
  room.addHuman('me','Me'); room.configure('me',{ready:true});room.start('me');
  for(const p of room.players.values())if(p.bot)p.decision=10000;
  return room;
}
test('new map has exactly twenty times the area, clear spawns and dense cover/loot',()=>{
  const map=MAPS.meadow;
  assert.ok(Math.abs((map.radius/31)**2-20)<1e-9);
  assert.ok(map.obstacles.length>150);assert.ok(map.loot.length>60);
  for(const p of map.spawnPoints)assert.ok(map.obstacles.every(o=>Math.hypot(p.x-o.x,p.z-o.z)>o.r+RULES.playerRadius));
  assert.ok(map.obstacles.some(o=>o.kind==='gate'&&o.interactive));assert.ok(map.obstacles.some(o=>o.kind==='chest'&&o.interactive));
});
test('jump lands on a low platform, then a higher one, and falls after leaving',()=>{
  for(const fps of [30,60]){
  const room=roomForMeadow(),map=room.map,p=room.players.get('me'),low=map.obstacles[0],high=map.obstacles[1];
  Object.assign(p,{x:low.x,z:low.z+low.r+RULES.playerRadius+.1,y:0,vy:0,grounded:true});
  for(let i=0;i<fps*1.5;i++)stepActor(p,{x:0,z:i<Math.round(fps*26/60)?-1:0,jump:i===0,sprint:false},1/fps,map,room.obstacles);
  assert.ok(Math.abs(p.y-low.h)<.02,`expected low ledge ${low.h}, got ${p.y}`);assert.equal(p.grounded,true);
  for(let i=0;i<fps*1.5;i++)stepActor(p,{x:i<Math.round(fps*28/60)?-1:0,z:0,jump:i===0,sprint:false},1/fps,map,room.obstacles);
  assert.ok(Math.abs(p.y-high.h)<.02,`expected high ledge ${high.h}, got ${p.y}`);
  for(let i=0;i<fps*2;i++)stepActor(p,{x:0,z:-1,jump:false,sprint:false},1/fps,map,room.obstacles);
  assert.equal(p.y,0);assert.equal(p.grounded,true);
  }
});
test('repeated jump requests cannot create flight; sprint increases horizontal speed',()=>{
  const room=roomForMeadow(),p=room.players.get('me');Object.assign(p,{x:0,z:35,y:0,grounded:true,vy:0});
  let peak=0;for(let i=0;i<40;i++){stepActor(p,{x:0,z:0,jump:true},1/60,room.map,room.obstacles);peak=Math.max(peak,p.y);}
  assert.ok(peak>2&&peak<3);
  const a={x:0,z:35,y:0},b={...a};moveActor(a,1,0,.1,room.map,room.obstacles);moveActor(b,1,0,.1,room.map,room.obstacles,RULES.speed*RULES.sprintMultiplier);
  assert.ok(b.x>a.x*1.5);
});
test('chest opens once, spawns real loot; gate cannot close on a player',()=>{
  const room=roomForMeadow(),p=room.players.get('me'),chest=room.map.obstacles.find(o=>o.kind==='chest');
  Object.assign(p,{x:chest.x,z:chest.z+chest.r+1.5,y:0});const count=room.loot.length;interact(room,p);
  assert.equal(room.obstacles.get(chest.id).open,true);assert.equal(room.loot.length,count+5);interact(room,p);assert.equal(room.loot.length,count+5);
  const gate=room.map.obstacles.find(o=>o.kind==='gate');Object.assign(p,{x:gate.x,z:gate.z+gate.r+1.2,y:0});interact(room,p);assert.equal(room.obstacles.get(gate.id).open,true);
  Object.assign(p,{x:gate.x,z:gate.z});interact(room,p);assert.equal(room.obstacles.get(gate.id).open,true);
});
test('loot equips two slots, swaps and drops a third weapon; ammo and reload are authoritative',()=>{
  const room=roomForMeadow(),p=room.players.get('me');room.loot.forEach(l=>l.active=false);
  for(const id of ['water','spray','bubble']){const l=addLoot(room,p.x,0,p.z-1,'weapon',id);assert.equal(equipLoot(room,p,l),true);}
  assert.equal(p.inventory.length,2);assert.equal(activeWeapon(p).id,'bubble');assert.ok(room.loot.some(l=>l.active&&l.weapon==='spray'));
  const w=activeWeapon(p);w.mag=1;w.reserve=4;p.cooldown=0;shoot(room,p);assert.equal(w.mag,0);shoot(room,p);assert.equal(w.mag,0);
  reloadWeapon(p);updateWeapon(p,WEAPONS.bubble.reload+.01);assert.equal(w.mag,4);assert.equal(w.reserve,0);
  room.setInput('me',{x:0,z:0,aim:0,mag:9999,inventory:[{id:'water',mag:9999}],y:999});assert.equal(w.mag,4);assert.equal(p.y,0);
});
test('3D sweep respects cover and elevation, without tunneling through a player',()=>{
  assert.equal(cylinderHit(0,1,0,0,1,20,0,10,1,0,2),.45);
  assert.equal(cylinderHit(0,4,0,0,4,20,0,10,1,0,2),null);
  const room=roomForMeadow(),p=room.players.get('me'),crate=room.map.obstacles.find(o=>o.kind==='crate');
  Object.assign(p,{x:crate.x,z:crate.z-4.5,y:0,inventory:[{id:'water',mag:18,reserve:54}],slot:0,cooldown:0});
  assert.ok(room.map.obstacles.every(o=>Math.hypot(p.x-o.x,p.z-o.z)>o.r+RULES.playerRadius));
  for(let i=0;i<90&&!room.obstacles.get(crate.id).destroyed;i++){room.setInput('me',{x:0,z:0,aim:0,pitch:0,fire:true});room.tick(1/30);}
  assert.equal(room.obstacles.get(crate.id).destroyed,true);assert.ok(room.loot.some(l=>l.id.startsWith('drop-')&&l.type==='ammo'));
});
test('survival storm moves continuously and finishes at a small safe area',()=>{
  const map=MAPS.meadow,a=zoneAt(map,129.999),b=zoneAt(map,130);
  assert.ok(Math.abs(a.radius-b.radius)<.01);assert.ok(Math.hypot(a.x-b.x,a.z-b.z)<.01);
  assert.ok(zoneAt(map,0).radius>130);assert.equal(zoneAt(map,600).radius,5);assert.equal(zoneAt(map,600).damage,14);
  const room=roomForMeadow(),p=room.players.get('me');room.time=400;Object.assign(p,{x:-120,z:0,hp:100});room.tick(.1);assert.ok(p.hp<100);
});
