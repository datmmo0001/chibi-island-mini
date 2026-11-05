import test from 'node:test';
import assert from 'node:assert/strict';
import {Group} from 'three';
import {MAP,concealedAt,obstacleSolid,visible} from '../shared.js';
import {resetRespawnVisual} from '../public/actor-life.js';
import {defaultWidgets} from '../public/hud-layout.js';

test('Candy has five times original area and enterable full-height cover without bullet collision',()=>{
 assert.ok(Math.abs((MAP.radius/31)**2-5)<1e-9);
 const bushes=MAP.obstacles.filter(o=>o.kind==='bush');assert.equal(bushes.length,40);
 for(const o of bushes){assert.ok(o.h>=3);assert.equal(obstacleSolid(o),false);assert.equal(concealedAt({x:o.x,y:0,z:o.z},MAP),true);assert.ok(Math.hypot(o.x,o.z)+o.r<MAP.radius);}
 for(const p of MAP.spawnPoints)assert.ok(MAP.obstacles.filter(obstacleSolid).every(o=>Math.hypot(o.x-p.x,o.z-p.z)>o.r+.65));
});
test('repeated respawns remove balloon groups and clear rising state at the actual spawn',()=>{
 const actor=new Group(),body=new Group();actor.add(body);actor.userData.deadAt=null;let disposed=0;
 for(let i=0;i<8;i++){
  const balloon=new Group();balloon.add(new Group(),new Group());actor.add(balloon);actor.userData.deathVisual=balloon;actor.userData.deadAt=10+i;actor.position.y=12;actor.visible=false;
  assert.equal(resetRespawnVisual(actor,{alive:false,x:5,y:0,z:6},()=>disposed++),false);
  assert.equal(resetRespawnVisual(actor,{alive:true,x:i,y:0,z:-i},()=>disposed++),true);
  assert.equal(actor.userData.deadAt,null);assert.equal(actor.userData.deathVisual,null);assert.equal(actor.position.y,0);assert.equal(actor.position.x,i);assert.equal(actor.visible,true);assert.deepEqual(actor.children,[body]);
  assert.equal(resetRespawnVisual(actor,{alive:true,x:i,y:0,z:-i},()=>disposed++),false);
 }assert.equal(disposed,8);
});
test('fire diameter is thirty percent smaller and the thumb arc is closer',()=>{
 for(const [w,h]of [[390,844],[915,412]]){
  const d=defaultWidgets(w,h);assert.ok(Math.abs(d.fire.width-88*.7)<1e-9);assert.ok(Math.abs(d.fire.height-88*.7)<1e-9);
  const usable=w-16;if(w<h)assert.ok(Math.abs((d.fire.x-d.jump.x)*usable-74)<1e-7);else assert.ok(d.scope.x<d.joystick.x+.08);assert.ok((d.fire.x-d.skill.x)*usable<=140.001);
 }
});
