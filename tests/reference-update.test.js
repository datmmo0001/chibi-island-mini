import test from 'node:test';
import assert from 'node:assert/strict';
import {MAP,WEAPONS,moveActor,visible} from '../shared.js';
import {Room} from '../server/game.js';
import {shoot,advanceBullets} from '../server/survival.js';

test('all maps admit five real players, reject sixth, and fill the remaining three slots',()=>{
 for(const mapId of ['candy','meadow','frontier']){
  const r=new Room('FIVE','p0',{mapId,capacity:5});
  for(let i=0;i<5;i++){r.addHuman(`p${i}`,`Friend ${i}`);r.configure(`p${i}`,{ready:true});}
  assert.throws(()=>r.addHuman('extra','Sixth'),/5/);r.start('p0');assert.equal(r.players.size,8);assert.equal(r.humans().length,5);assert.equal([...r.players.values()].filter(p=>p.bot).length,3);
  assert.equal(r.snapshot().capacity,5);
 }
});
test('Candy walls stop swept bullets from every gun and block walking at ground level',()=>{
 const wall=MAP.obstacles.find(o=>o.kind==='barricade');assert.equal(MAP.obstacles.filter(o=>o.kind==='barricade').length,8);
 const map={...MAP,obstacles:[wall]};
 for(const id of Object.keys(WEAPONS)){
  const room=new Room('WALL','me',{mapId:'candy',random:()=>.5});room.addHuman('me','Shooter');room.configure('me',{ready:true});room.start('me');room.map=map;
  const shooter=room.players.get('me'),target=room.players.get('bot-0');
  for(const p of room.players.values())if(p!==shooter&&p!==target)p.alive=false;
  Object.assign(shooter,{x:wall.x,y:0,z:wall.z-8,aim:0,pitch:0,cooldown:0,inventory:[{id,mag:WEAPONS[id].capacity,reserve:60}],slot:0});
  Object.assign(target,{x:wall.x,y:0,z:wall.z+8,hp:100});shoot(room,shooter);
  for(let i=0;i<10;i++)advanceBullets(room,.2);
  assert.equal(target.hp,100,`${id} cannot penetrate wall`);assert.equal(room.bullets.length,0);
 }
 const p={x:wall.x,y:0,z:wall.z-4,grounded:true};
 for(let i=0;i<60;i++)moveActor(p,0,1,1/30,map);
 assert.ok(p.z<=wall.z-wall.hz-.65+.001);
 assert.equal(visible(wall.x,wall.z-8,wall.x,wall.z+8,map,null,1.3),false);
 assert.equal(visible(wall.x,wall.z-8,wall.x,wall.z+8,map,null,4),true);
});
