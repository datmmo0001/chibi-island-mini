import test from 'node:test';
import assert from 'node:assert/strict';
import {Room} from '../server/game.js';
test('forest allows twenty real people and rejects a twenty first',()=>{
 const r=new Room('TWENTY','p0',{mapId:'frontier',capacity:20});
 for(let i=0;i<20;i++){r.addHuman(`p${i}`,`Player ${i}`);r.configure(`p${i}`,{ready:true});}
 assert.throws(()=>r.addHuman('extra','extra'),/20/);r.start('p0');assert.equal(r.players.size,20);assert.equal(r.snapshot().capacity,20);
 const positions=new Set([...r.players.values()].map(p=>`${p.x}/${p.z}`));assert.equal(positions.size,20);
});
test('deathmatch respawns after three seconds and highest kills wins even when dead',()=>{
 const r=new Room('AGAIN','me',{mapId:'candy',respawn:true,random:()=>.61});r.addHuman('me','Me');r.configure('me',{ready:true});r.start('me');
 for(const p of r.players.values())if(p.bot)p.decision=1e9;
 const p=r.players.get('me'),enemy=r.players.get('bot-0');r.damage(p,100,enemy.id);assert.equal(enemy.kills,1);
 for(let i=0;i<89;i++)r.tick(1/30);assert.equal(p.alive,false);for(let i=0;i<3;i++)r.tick(1/30);assert.equal(p.alive,true);assert.equal(p.hp,100);
 p.kills=10;r.damage(p,100,null);r.time=r.duration-.01;r.tick(1/30);assert.equal(r.phase,'finished');assert.equal(r.winner.id,'me');
});
