import test from 'node:test';
import assert from 'node:assert/strict';
import {Room} from '../server/game.js';
import {shoot,advanceBullets} from '../server/survival.js';
import {useSkill} from '../server/skills.js';
import {createGameAudio} from '../public/game-audio.js';
import {readFile} from 'node:fs/promises';
function room(n,mapId='candy',respawn=false){const r=new Room('TEAMS','a',{teamSize:n,mapId,respawn});r.addHuman('a','A');r.configure('a',{ready:true});r.start('a');for(const p of r.players.values())if(p.bot)p.decision=1e9;return r;}
test('all four squad sizes fill two equal teams on every map with distinct clear spawn points',()=>{
 for(const n of [2,3,4,5])for(const mapId of ['candy','meadow','frontier']){const r=room(n,mapId);assert.equal(r.players.size,n*2);for(const t of [1,2])assert.equal([...r.players.values()].filter(p=>p.team===t).length,n);assert.equal(new Set([...r.players.values()].map(p=>`${p.x}/${p.z}`)).size,n*2);assert.equal(r.snapshot().teamSize,n);assert.ok(r.snapshot().players.every(p=>[1,2].includes(p.team)));}
});
test('team switching enforces capacity and invalidates ready; six real players can play three versus three',()=>{
 const r=new Room('TEAM','p0',{teamSize:3,mapId:'meadow'});for(let i=0;i<6;i++)r.addHuman(`p${i}`,`P${i}`);assert.throws(()=>r.addHuman('extra','Extra'),/6/);assert.throws(()=>r.configure('p0',{team:2}),/đủ/);r.leave('p1');r.configure('p0',{ready:true});r.configure('p0',{team:2});assert.equal(r.players.get('p0').ready,false);r.addHuman('new','New');for(const p of r.humans())r.configure(p.id,{ready:true});r.start('p0');assert.equal(r.humans().length,6);assert.equal(r.players.size,6);
});
test('team damage cannot hurt a teammate; normal bullets score no kill, the blast rocket kills only the enemy',()=>{
 for(const rocket of [false,true]){const r=room(2),me=r.players.get('a'),friend=[...r.players.values()].find(p=>p.id!=='a'&&p.team===me.team),enemy=[...r.players.values()].find(p=>p.team!==me.team);r.map={...r.map,obstacles:[]};for(const p of r.players.values()){p.x=25;p.z=25;}Object.assign(me,{x:0,z:0,y:0,aim:0,pitch:0,cooldown:0});Object.assign(friend,{x:0,z:3,y:0});Object.assign(enemy,{x:0,z:7,y:0});r.damage(friend,100,me.id);assert.equal(friend.hp,100);if(rocket){me.skill='rocket';useSkill(r,me);}else shoot(r,me);for(let i=0;i<12;i++)advanceBullets(r,.02);assert.equal(friend.hp,100);if(rocket){assert.equal(enemy.hp,0,'blast rocket deals 100 and kills the enemy');assert.equal(me.kills,1);}else{assert.ok(enemy.hp<100);assert.equal(me.kills,0);}}
});
test('survival only ends when the enemy team is eliminated; deathmatch ranks combined team kills',()=>{
 let r=room(3);const foes=[...r.players.values()].filter(p=>p.team===2);r.damage(foes[0],100,'a');r.tick(.01);assert.equal(r.phase,'playing');for(const p of foes.slice(1))r.damage(p,100,'a');r.tick(.01);assert.equal(r.winner.team,1);assert.equal(r.phase,'finished');
 r=room(2,'candy',true);for(const p of r.players.values())p.kills=p.team===1?4:1;r.time=r.duration-.01;r.tick(.02);assert.equal(r.winner.team,1);assert.equal(r.winner.kills,8);
});
test('offline music, effects and five English voice files are real PCM audio assets',async()=>{for(const name of ['island-loop','heal','defeat','skill','kill','kill-1','kill-2','kill-3','kill-4','pentakill']){const b=await readFile(new URL(`../public/audio/${name}.wav`,import.meta.url));assert.equal(b.toString('ascii',0,4),'RIFF');assert.ok(b.length>2000);}});
test('only local events play effects; voice kill count is bounded and sound disabling mutes audio',()=>{
 const sounds=[],events={};let enabled=true;class Sound{constructor(src){this.src=src;this.paused=true;sounds.push(this);}play(){this.paused=false;return Promise.resolve();}pause(){this.paused=true;}}
 const audio=createGameAudio({enabled:()=>enabled,doc:{hidden:false,addEventListener:(n,f)=>events[n]=f},AudioCtor:Sound});audio.unlock();audio.event({type:'heal',player:'other'},'me');assert.equal(sounds.length,1);audio.event({type:'heal',player:'me'},'me');audio.event({type:'skill',player:'me'},'me');audio.event({type:'out',player:'enemy',attacker:'me',kills:2},'me');assert.ok(sounds.some(s=>s.src.endsWith('kill-2.wav')));audio.event({type:'out',player:'me'},'me');assert.ok(sounds.some(s=>s.src.endsWith('defeat.wav')));enabled=false;audio.sync();assert.equal(sounds[0].paused,true);const count=sounds.length;audio.event({type:'heal',player:'me'},'me');assert.equal(sounds.length,count);
});
import {WebSocket} from 'ws';
import {createGameServer} from '../server/index.js';
test('independent WebSocket clients fill and start 2v2, 3v3, 4v4 and 5v5 with consistent team IDs',async t=>{
 const app=createGameServer();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));t.after(()=>app.close());
 async function peer(){const socket=new WebSocket(`ws://127.0.0.1:${app.server.address().port}/socket`),messages=[];socket.on('message',b=>messages.push(JSON.parse(b)));await new Promise((r,j)=>{socket.once('open',r);socket.once('error',j);});t.after(()=>socket.close());return{socket,send:m=>socket.send(JSON.stringify(m)),async wait(match){const end=Date.now()+4000;while(Date.now()<end){const i=messages.findIndex(match);if(i>=0)return messages.splice(i,1)[0];await new Promise(r=>setTimeout(r,10));}throw new Error('team network timeout');}};}
 for(const size of [2,3,4,5]){const peers=await Promise.all(Array.from({length:size*2},peer));const host=peers[0];host.send({type:'create',teamSize:size,mapId:'candy',name:'Host'});const joined=await host.wait(m=>m.type==='joined');for(const p of peers.slice(1)){p.send({type:'join',code:joined.code,name:'Friend'});await p.wait(m=>m.type==='joined');}for(const p of peers)p.send({type:'configure',ready:true});await host.wait(m=>m.type==='state'&&m.players.length===size*2&&m.players.every(p=>p.ready));host.send({type:'start'});for(const p of peers){const s=await p.wait(m=>m.type==='state'&&m.phase==='playing');assert.equal(s.teamSize,size);assert.equal(s.players.filter(p=>!p.bot).length,size*2);for(const team of [1,2])assert.equal(s.players.filter(p=>p.team===team).length,size);}for(const p of peers){p.send({type:'leave'});p.socket.close();}}
});

test('background plays only in the waiting room and effects have an independent switch; fifth kill is Pentakill',async()=>{
 const sounds=[];let current='home',musicOn=true,effectsOn=false;
 class Sound{constructor(src){this.src=src;this.paused=true;sounds.push(this);}play(){this.paused=false;return Promise.resolve();}pause(){this.paused=true;}}
 const a=createGameAudio({enabled:()=>effectsOn,musicEnabled:()=>musicOn,phase:()=>current,doc:{hidden:false,addEventListener(){}},AudioCtor:Sound});
 a.unlock();assert.equal(sounds[0].paused,true);
 current='lobby';a.sync();assert.equal(sounds[0].paused,false);await Promise.resolve();await Promise.resolve();
 current='playing';a.sync();assert.equal(sounds[0].paused,true);
 effectsOn=true;musicOn=false;a.sync();a.event({type:'out',player:'enemy',attacker:'me',kills:5},'me');assert.ok(sounds.some(s=>s.src.endsWith('/pentakill.wav')));assert.ok(!sounds.some(s=>s.src.endsWith('/kill-5.wav')));
 effectsOn=false;a.sync();assert.ok(sounds.slice(1).every(s=>s.volume===0));current='finished';a.sync();assert.equal(sounds[0].paused,true);
});
