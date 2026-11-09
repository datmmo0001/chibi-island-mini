import test from 'node:test';
import assert from 'node:assert/strict';
import {MAP,MAPS,RULES,SKILLS,stepActor,obstacleContains,obstacleHit,concealedAt,visible} from '../shared.js';
import {Room} from '../server/game.js';
import {interact,addLoot,equipLoot,shoot,advanceBullets} from '../server/survival.js';
import {useSkill,updateSkill} from '../server/skills.js';

const emptyMap={radius:250,obstacles:[]};
const actor=()=>({x:0,y:0,z:0,vy:0,grounded:true,hp:20,alive:true});
function roomForForest(random=()=>.5){
  const room=new Room('FOREST','me',{mapId:'frontier',mode:'solo',random});room.addHuman('me','Explorer');room.configure('me',{ready:true});room.start('me');
  for(const p of room.players.values())if(p.bot)p.decision=100000;return room;
}
test('forest is a separate 40x island with clear spawns, full-body bushes and reachable structures',()=>{
  const m=MAPS.frontier;assert.ok(Math.abs((m.radius/31)**2-40)<1e-9);assert.equal(m.duration,600);
  assert.equal(MAPS.meadow.areaMultiplier,20);assert.equal(m.structures.filter(o=>o.kind==='house').length,9);assert.equal(m.structures.filter(o=>o.kind==='tower').length,9);
  assert.ok(m.obstacles.filter(o=>o.kind==='bush'&&o.h>3&&o.r>2).length>=40);
  for(const p of m.spawnPoints)assert.ok(m.obstacles.every(o=>!obstacleContains(o,p.x,p.z,RULES.playerRadius)),JSON.stringify(p));
  for(const o of m.obstacles)assert.ok(Math.hypot(o.x,o.z)+o.r<m.radius,'objects stay on island');
});
test('stairs can be walked up and down; roof supports players; jump ledges also reach the roof',()=>{
  const room=roomForForest(),map=room.map,house=map.structures.find(o=>o.kind==='house');
  for(const fps of [30,60]){
    const p={...actor(),x:house.x+2.1,z:house.z+12.5};
    for(let i=0;i<fps*2.2;i++)stepActor(p,{x:0,z:-1},1/fps,map,room.obstacles);
    for(let i=0;i<fps;i++)stepActor(p,{x:0,z:0},1/fps,map,room.obstacles);
    assert.equal(p.y,4,`walk upstairs at ${fps} FPS: ${JSON.stringify(p)}`);assert.equal(p.grounded,true);
    for(let i=0;i<fps*3;i++)stepActor(p,{x:0,z:1},1/fps,map,room.obstacles);
    assert.equal(p.y,0,'walk back to ground');
    const q={...actor(),x:house.x-6,z:house.z+2.3};
    for(let i=0;i<fps*1.4;i++)stepActor(q,{x:0,z:i<fps*.3?-1:0,jump:i===0},1/fps,map,room.obstacles);
    assert.equal(q.y,1.35,'first jump ledge');
    for(let i=0;i<fps*1.4;i++)stepActor(q,{x:i<fps*.2?1:0,z:i<fps*.3?-1:0,jump:i===0},1/fps,map,room.obstacles);
    assert.equal(q.y,2.7,'second jump ledge');
    for(let i=0;i<fps*1.4;i++)stepActor(q,{x:i<fps*.45?1:0,z:0,jump:i===0},1/fps,map,room.obstacles);
    assert.equal(q.y,4,'jump from ledge to roof');
  }
});
test('ladder climbs to tower floor, descends, and jump cancels without teleporting up',()=>{
  const room=roomForForest(),p=room.players.get('me'),ladder=room.map.obstacles.find(o=>o.kind==='ladder');
  Object.assign(p,{x:ladder.x,z:ladder.z+.6});interact(room,p);assert.ok(p.climb);
  for(let i=0;i<75;i++)stepActor(p,{x:0,z:0},1/30,room.map,room.obstacles);
  assert.equal(p.y,ladder.h);assert.equal(p.climb,null);assert.equal(p.grounded,true);
  p.z=ladder.topZ-1;interact(room,p);assert.equal(p.inventory.at(-1).id,'bubble','nearby rooftop gun takes priority when walking away from the ladder');assert.equal(p.climb,null);p.z=ladder.topZ;
  interact(room,p);assert.ok(p.climb);for(let i=0;i<75;i++)stepActor(p,{x:0,z:0},1/30,room.map,room.obstacles);assert.equal(p.y,0);
  interact(room,p);stepActor(p,{x:0,z:0},.2,room.map,room.obstacles);stepActor(p,{x:0,z:0,jump:true},1/30,room.map,room.obstacles);
  assert.equal(p.climb,null);assert.ok(p.y<2);
});
test('box cover and raised tower floors block the right 3D rays, bushes pass bullets',()=>{
  const tower=MAPS.frontier.obstacles.find(o=>o.kind==='tower');
  assert.equal(obstacleHit(tower.x,1,tower.z-5,tower.x,1,tower.z+5,tower),null,'space under floor remains open');
  assert.ok(obstacleHit(tower.x,0,tower.z,tower.x,10,tower.z,tower)!==null);
  const bush=MAPS.frontier.obstacles.find(o=>o.kind==='bush');const m={radius:20,obstacles:[bush]};
  const p={...actor(),x:bush.x,z:bush.z};assert.equal(concealedAt(p,m),true);
  assert.equal(visible(bush.x-5,bush.z,bush.x+5,bush.z,m),true);
  p.y=2;assert.equal(concealedAt(p,m),false);
});
test('concealment avoids distant bot targets and firing reveals the player temporarily',()=>{
  const room=roomForForest(),p=room.players.get('me'),bush=room.map.obstacles.find(o=>o.kind==='bush');
  Object.assign(p,{x:bush.x,z:bush.z,inventory:[{id:'water',mag:18,reserve:54}],cooldown:0});
  room.setInput('me',{x:0,z:0,aim:0});room.tick(1/30);assert.equal(p.concealed,true);
  const bot=room.players.get('bot-0');Object.assign(bot,{x:p.x,z:p.z-12,decision:0,inventory:[{id:'water',mag:18,reserve:54}]});
  for(const q of room.players.values())if(q!==p&&q!==bot)q.alive=false;
  room.botInput(bot,.1);assert.equal(bot.input.fire,false);
  room.setInput('me',{x:0,z:0,aim:0,fire:true});room.tick(1/30);assert.equal(p.concealed,false);
  p.input.fire=false;for(let i=0;i<50;i++){room.setInput('me',{x:0,z:0,aim:0});bot.decision=10000;room.tick(1/30);}assert.equal(p.concealed,true);
});
test('every skill and scope can be looted from a chest only once, cannot be fabricated by input',()=>{
  for(const [i,id]of Object.keys(SKILLS).entries()){
    const room=roomForForest(()=> (i+.1)/5),p=room.players.get('me'),chest=room.map.obstacles.find(o=>o.kind==='chest');
    room.loot.forEach(l=>l.active=false);Object.assign(p,{x:chest.x,z:chest.z+2.5});const before=room.loot.length;interact(room,p);
    assert.equal(room.loot.length,before+5);const skill=room.loot.find(l=>l.active&&l.type==='skill');assert.equal(skill.weapon,id);
    Object.assign(p,{x:skill.x,z:skill.z});assert.equal(equipLoot(room,p,skill),true);assert.equal(p.skill,id);
    const extra=addLoot(room,p.x,p.y,p.z,'skill',id);assert.equal(equipLoot(room,p,extra),false,'cannot stack charges');
    const scope=room.loot.find(l=>l.active&&l.type==='scope');Object.assign(p,{x:scope.x,z:scope.z});assert.equal(equipLoot(room,p,scope),true);assert.equal(p.scope,true);
    room.setInput('me',{x:0,z:0,aim:0,skill:'rocket',effect:'power',effectRemaining:999,hp:999,scope:false});assert.equal(p.skill,id);assert.equal(p.effect,null);assert.equal(p.hp,100);assert.equal(p.scope,true);
  }
});
test('dash travels 3x for 5 seconds, stops at walls and does not stack with another skill',()=>{
  const room=roomForForest(),p=room.players.get('me');Object.assign(p,actor(),{skill:'dash'});assert.ok(useSkill(room,p));assert.equal(p.skill,null);
  const normal=actor();stepActor(normal,{x:1,z:0},.1,emptyMap);stepActor(p,{x:1,z:0},.1,emptyMap);assert.ok(Math.abs(p.x/normal.x-3)<1e-6);
  const m={...emptyMap,obstacles:[{id:'wall',x:2,z:0,hx:.1,hz:3,r:3,h:5,shape:'box'}]};p.x=0;stepActor(p,{x:1,z:0,sprint:true},.2,m);assert.ok(p.x<=1.251);
  p.skill='power';assert.equal(useSkill(room,p),false);assert.equal(p.skill,'power');updateSkill(p,5);assert.equal(p.effect,null);
});
test('flight lifts above roofs for five seconds then falls, cannot tunnel through tower underside',()=>{
  const room=roomForForest(),p=room.players.get('me');Object.assign(p,actor(),{skill:'flight'});useSkill(room,p);
  for(let i=0;i<150;i++){stepActor(p,{x:0,z:0},1/30,emptyMap);updateSkill(p,1/30);}assert.ok(p.y>7.9&&p.y<=8.01);assert.equal(p.effect,null);
  for(let i=0;i<60;i++)stepActor(p,{x:0,z:0},1/30,emptyMap);assert.equal(p.y,0);
  Object.assign(p,actor(),{skill:'flight'});useSkill(room,p);const platform={...emptyMap,obstacles:[{id:'floor',x:0,z:0,hx:3,hz:3,r:4,base:6,h:6.3,shape:'box',walkable:true}]};
  for(let i=0;i<60;i++)stepActor(p,{x:0,z:0},1/30,platform);assert.ok(p.y<=3.351);
});
test('regeneration heals over five seconds only and 2x damage expires exactly',()=>{
  const room=roomForForest(),p=room.players.get('me');Object.assign(p,actor(),{skill:'regen'});useSkill(room,p);updateSkill(p,1);assert.equal(p.hp,36);updateSkill(p,3.5);assert.equal(p.hp,92);updateSkill(p,.5);assert.equal(p.hp,100);updateSkill(p,2);assert.equal(p.hp,100);
  p.skill='power';useSkill(room,p);p.inventory=[{id:'water',mag:18,reserve:54}];p.slot=0;p.cooldown=0;p.reload=0;p.aim=0;
  shoot(room,p);assert.equal(room.bullets.at(-1).damage,32);updateSkill(p,4);p.cooldown=0;shoot(room,p);assert.equal(room.bullets.at(-1).damage,32);updateSkill(p,1);p.cooldown=0;shoot(room,p);assert.equal(room.bullets.at(-1).damage,16);
});
test('rocket pierces cover and multiple players, damages each only once and crosses the island',()=>{
  const room=roomForForest(),p=room.players.get('me');room.map={...room.map,radius:196,obstacles:[{id:'wall',x:0,z:10,hx:5,hz:1,r:5,h:8,shape:'box'}]};
  Object.assign(p,{x:0,y:0,z:-180,aim:0,pitch:0,skill:'rocket'});for(const q of room.players.values())if(q!==p)Object.assign(q,{x:100,z:100});
  const a=room.players.get('bot-0'),b=room.players.get('bot-1');Object.assign(a,{x:0,z:30});Object.assign(b,{x:0,z:80});
  assert.ok(useSkill(room,p));assert.equal(useSkill(room,p),false);
  let maxZ=-180;for(let i=0;i<100;i++){advanceBullets(room,1/30);maxZ=Math.max(maxZ,...room.bullets.map(q=>q.z));}
  assert.equal(a.hp,35);assert.equal(b.hp,35);assert.ok(maxZ>196);assert.equal(room.bullets.length,0);
});
