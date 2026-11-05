import test from 'node:test';
import assert from 'node:assert/strict';
import { WebSocket } from 'ws';
import { createGameServer } from '../server/index.js';
import { addLoot } from '../server/survival.js';

test('five independent browsers join and start a shared match on each map',async t=>{
 const app=createGameServer();await new Promise(resolve=>app.server.listen(0,'127.0.0.1',resolve));t.after(()=>app.close());
 const url=`ws://127.0.0.1:${app.server.address().port}/socket`;
 for(const mapId of ['candy','meadow','frontier']){
  const peers=await Promise.all(Array.from({length:6},()=>client(url)));
  const host=peers[0];host.send({type:'create',mapId,capacity:5,name:'Host'});const joined=await host.wait(m=>m.type==='joined');
  for(let i=1;i<5;i++){peers[i].send({type:'join',code:joined.code,name:`Friend ${i}`});await peers[i].wait(m=>m.type==='joined');}
  peers[5].send({type:'join',code:joined.code,name:'Sixth'});assert.match((await peers[5].wait(m=>m.type==='error')).message,/5/);
  for(const peer of peers.slice(0,5))peer.send({type:'configure',ready:true});
  await host.wait(m=>m.type==='state'&&m.players.length===5&&m.players.every(p=>p.ready));host.send({type:'start'});
  for(const peer of peers.slice(0,5)){const s=await peer.wait(m=>m.type==='state'&&m.phase==='playing');assert.equal(s.capacity,5);assert.equal(s.players.filter(p=>!p.bot).length,5);assert.equal(s.players.filter(p=>p.bot).length,3);}
  for(const peer of peers)peer.socket.close();
 }
});

test('home chat broadcasts text to another connection and limits repeated messages',async t=>{
 const app=createGameServer();await new Promise(resolve=>app.server.listen(0,'127.0.0.1',resolve));t.after(()=>app.close());
 const url=`ws://127.0.0.1:${app.server.address().port}/socket`,a=await client(url),b=await client(url);
 a.send({type:'chat',name:'Tester',message:'<b>Hello</b>'});const message=await b.wait(m=>m.type==='chat');assert.equal(message.message,'<b>Hello</b>');assert.equal(message.name,'Tester');
 a.send({type:'chat',message:'too soon'});a.send({type:'ping',at:123});await a.wait(m=>m.type==='pong'&&m.at===123);assert.equal(b.messages.some(m=>m.type==='chat'&&m.message==='too soon'),false);
});

test('three forest clients see the same skill activation, scope and elevated tower player',async t=>{
  const app=createGameServer();await new Promise(resolve=>app.server.listen(0,'127.0.0.1',resolve));t.after(()=>app.close());
  const url=`ws://127.0.0.1:${app.server.address().port}/socket`,a=await client(url),b=await client(url),c=await client(url);
  a.send({type:'create',mapId:'frontier',name:'Forest'});const joined=await a.wait(m=>m.type==='joined');
  for(const [p,name]of [[b,'Second'],[c,'Third']]){p.send({type:'join',code:joined.code,name});await p.wait(m=>m.type==='joined');}
  for(const p of [a,b,c])p.send({type:'configure',ready:true});
  await a.wait(m=>m.type==='state'&&m.players.length===3&&m.players.every(p=>p.ready));a.send({type:'start'});
  const initial=await a.wait(m=>m.type==='state'&&m.phase==='playing');assert.equal(initial.mapId,'frontier');assert.equal(initial.players.filter(p=>p.bot).length,5);
  a.send({type:'input',x:0,z:0,aim:Math.PI,interact:true});
  await a.wait(m=>m.type==='state'&&m.players.find(p=>p.id===joined.id).inventory.length===1);
  const room=app.rooms.get(joined.code),me=room.players.get(joined.id);for(const p of room.players.values())if(p.bot)p.decision=10000;
  addLoot(room,me.x,0,me.z,'skill','power');addLoot(room,me.x,0,me.z,'scope');
  await a.wait(m=>m.type==='state'&&m.players.find(p=>p.id===joined.id).skill==='power');
  a.send({type:'input',x:0,z:0,aim:Math.PI,skill:true,aiming:true});
  const states=await Promise.all([a,b,c].map(p=>p.wait(m=>m.type==='state'&&m.players.find(p=>p.id===joined.id).effect==='power')));
  for(const s of states){const p=s.players.find(p=>p.id===joined.id);assert.equal(p.scope,true);assert.equal(p.skill,null);assert.ok(p.effectRemaining>3);}
  assert.equal(me.input.aiming,true);
  const ladder=room.map.obstacles.find(o=>o.kind==='ladder');Object.assign(me,{x:ladder.x,z:ladder.z+.5,y:0});
  a.send({type:'input',x:0,z:0,aim:0,interact:true});
  await b.wait(m=>m.type==='state'&&m.players.find(p=>p.id===joined.id).climbing);
  const climbing=await c.wait(m=>m.type==='state'&&m.players.find(p=>p.id===joined.id).y>1);
  assert.ok(climbing.players.find(p=>p.id===joined.id).y<ladder.h);
  const top=await b.wait(m=>m.type==='state'&&m.players.find(p=>p.id===joined.id).y===ladder.h);assert.equal(top.players.find(p=>p.id===joined.id).climbing,false);
});

async function client(url) {
  const socket = new WebSocket(url), messages = [];
  socket.on('message', raw => messages.push(JSON.parse(raw)));
  await new Promise((resolve, reject) => { socket.once('open', resolve); socket.once('error', reject); });
  return { socket, messages, send: data => socket.send(JSON.stringify(data)),
    async wait(predicate, timeout = 4000) {
      const end = Date.now() + timeout;
      while (Date.now() < end) {
        const index = messages.findIndex(predicate); if (index >= 0) return messages.splice(index, 1)[0];
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      throw new Error('Timed out waiting for server message');
    }
  };
}
test('three independent WebSocket clients share one authoritative 3+5 match, reconnect and rematch', async t => {
  const app = createGameServer(); await new Promise(resolve => app.server.listen(0, '127.0.0.1', resolve));
  const port = app.server.address().port, base = `http://127.0.0.1:${port}`, url = `ws://127.0.0.1:${port}/socket`;
  t.after(() => app.close());
  assert.equal((await fetch(base + '/health')).status, 200);
  for (const file of ['/', '/client.js', '/scene.js', '/shared.js', '/vendor/three.module.js', '/vendor/three.core.js']) assert.equal((await fetch(base + file)).status, 200, file);
  assert.equal((await fetch(base + '/server/index.js')).status, 404);
  const a = await client(url), b = await client(url), c = await client(url), d = await client(url);
  a.send({ type: 'create', mapId: 'candy', name: '<b>Gấu</b>', outfit: 'bear', hat: 'cap' }); const joined = await a.wait(m => m.type === 'joined');
  assert.match(joined.code, /^[A-Z2-9]{6}$/);
  a.send({ type: 'start' }); assert.match((await a.wait(m => m.type === 'error')).message, /Sẵn sàng/);
  b.send({ type: 'join', code: joined.code, name: 'Thỏ', outfit: 'bunny' }); const jb = await b.wait(m => m.type === 'joined');
  c.send({ type: 'join', code: joined.code, name: 'Vịt', outfit: 'duck' }); await c.wait(m => m.type === 'joined');
  d.send({ type: 'join', code: joined.code, name: 'Người thứ tư' }); assert.match((await d.wait(m => m.type === 'error')).message, /đủ 3/);
  const waiting = await c.wait(m => m.type === 'state' && m.players.length === 3); assert.equal(waiting.players.filter(p => p.bot).length, 0);
  for (const p of [a, b, c]) p.send({ type: 'configure', ready: true });
  await a.wait(m => m.type === 'state' && m.players.length === 3 && m.players.every(p => p.ready));
  b.send({ type: 'start' }); assert.match((await b.wait(m => m.type === 'error')).message, /chủ phòng/);
  a.send({ type: 'start' });
  const states = await Promise.all([a, b, c].map(p => p.wait(m => m.type === 'state' && m.phase === 'playing')));
  assert.ok(states.every(s => s.players.length === 8 && s.players.filter(p => p.bot).length === 5));
  assert.deepEqual(states[0].players.map(p => p.id), states[1].players.map(p => p.id));
  a.send({ type: 'input', x: 1, z: 0, aim: 0, fire: true, hp: 9999 });
  const movement = await c.wait(m => m.type === 'state' && m.phase === 'playing' && m.players.find(p => p.id === joined.id).x > .1);
  assert.ok(movement.players.find(p => p.id === joined.id).hp <= 100);
  b.socket.terminate(); await new Promise(resolve => setTimeout(resolve, 50));
  const reconnect = await client(url); reconnect.send({ type: 'resume', token: jb.token });
  assert.equal((await reconnect.wait(m => m.type === 'joined')).id, jb.id);
  const room = app.rooms.get(joined.code); assert.equal(room.players.get(jb.id).connected, true);
  for (let i = 0; i < 180 * 30 + 10 && room.phase === 'playing'; i++) room.tick(1 / 30);
  const finished = await Promise.all([a, reconnect, c].map(p => p.wait(m => m.type === 'state' && m.phase === 'finished')));
  assert.deepEqual(finished[0].winner, finished[1].winner); assert.deepEqual(finished[0].winner, finished[2].winner);
  a.send({ type: 'rematch' }); const lobby = await c.wait(m => m.type === 'state' && m.phase === 'lobby' && m.round === 1);
  assert.equal(lobby.players.length, 3); assert.ok(lobby.players.every(p => !p.ready));
  for (const p of [a, reconnect, c]) p.send({ type: 'configure', ready: true });
  await a.wait(m => m.type === 'state' && m.phase === 'lobby' && m.players.every(p => p.ready)); a.send({ type: 'start' });
  assert.equal((await c.wait(m => m.type === 'state' && m.phase === 'playing' && m.round === 2)).players.length, 8);
});
test('solo request enters a live eight-character match immediately, reconnects and replays', async t => {
  const app = createGameServer(); await new Promise(resolve => app.server.listen(0, '127.0.0.1', resolve)); t.after(() => app.close());
  const url = `ws://127.0.0.1:${app.server.address().port}/socket`, a = await client(url), visitor = await client(url);
  a.send({ type: 'solo', mapId: 'candy', name: 'Chơi một mình', outfit: 'duck', hat: 'leaf' });
  const joined = await a.wait(m => m.type === 'joined');
  const playing = await a.wait(m => m.type === 'state' && m.phase === 'playing');
  assert.equal(playing.mode, 'solo'); assert.equal(playing.players.length, 8);
  assert.equal(playing.players.filter(p => p.bot).length, 7);
  assert.equal(playing.players.find(p => p.id === joined.id).outfit, 'duck');
  visitor.send({ type: 'join', code: joined.code, name: 'Visitor' });
  assert.match((await visitor.wait(m => m.type === 'error')).message, /đang diễn ra/);
  a.socket.terminate(); await new Promise(resolve => setTimeout(resolve, 40));
  const resumed = await client(url); resumed.send({ type: 'resume', token: joined.token });
  assert.equal((await resumed.wait(m => m.type === 'joined')).id, joined.id);
  const room = app.rooms.get(joined.code);
  for (let i = 0; i < 180 * 30 + 10 && room.phase === 'playing'; i++) room.tick(1 / 30);
  await resumed.wait(m => m.type === 'state' && m.phase === 'finished');
  resumed.send({ type: 'rematch' });
  const second = await resumed.wait(m => m.type === 'state' && m.phase === 'playing' && m.round === 2);
  assert.equal(second.players.length, 8); assert.equal(second.players.filter(p => !p.bot).length, 1);
  resumed.send({ type: 'leave' }); await resumed.wait(m => m.type === 'left'); assert.equal(room.humans().length, 0);
});
test('malformed JSON and invalid vectors do not crash server; room codes are case insensitive', async t => {
  const app = createGameServer(); await new Promise(resolve => app.server.listen(0, '127.0.0.1', resolve)); t.after(() => app.close());
  const url = `ws://127.0.0.1:${app.server.address().port}/socket`, a = await client(url), b = await client(url);
  a.socket.send('{nope'); assert.equal((await a.wait(m => m.type === 'error')).type, 'error');
  a.send({ type: 'create', mapId: 'candy', name: 'One', outfit: 'not-a-real-outfit', hat: 'invalid' }); const joined = await a.wait(m => m.type === 'joined');
  b.send({ type: 'join', code: joined.code.toLowerCase(), name: 'Two' }); await b.wait(m => m.type === 'joined');
  const state = await b.wait(m => m.type === 'state'); assert.equal(state.players[0].outfit, 'bear'); assert.equal(state.players[0].hat, 'ears');
  a.send({ type: 'leave' }); await a.wait(m => m.type === 'left');
  assert.equal(app.rooms.get(joined.code).humans().length, 1); assert.notEqual(app.rooms.get(joined.code).hostId, joined.id);
});
test('three meadow clients synchronize loot, weapon pickup and jump height over WebSocket',async t=>{
  const app=createGameServer();await new Promise(resolve=>app.server.listen(0,'127.0.0.1',resolve));t.after(()=>app.close());
  const url=`ws://127.0.0.1:${app.server.address().port}/socket`,a=await client(url),b=await client(url),c=await client(url);
  a.send({type:'create',mapId:'meadow',name:'Explorer'});const joined=await a.wait(m=>m.type==='joined');
  for(const [p,name]of [[b,'Second'],[c,'Third']]){p.send({type:'join',code:joined.code,name});await p.wait(m=>m.type==='joined');}
  for(const p of [a,b,c])p.send({type:'configure',ready:true});
  await a.wait(m=>m.type==='state'&&m.players.length===3&&m.players.every(p=>p.ready));a.send({type:'start'});
  const first=await a.wait(m=>m.type==='state'&&m.phase==='playing');assert.equal(first.mapId,'meadow');assert.equal(first.duration,600);assert.ok(first.loot.length>60);assert.equal(first.players.find(p=>p.id===joined.id).inventory.length,0);
  a.send({type:'input',x:0,z:0,aim:Math.PI,interact:true});
  const armed=await a.wait(m=>m.type==='state'&&m.players.find(p=>p.id===joined.id).inventory.length>0);assert.equal(armed.players.find(p=>p.id===joined.id).inventory[0].id,'water');
  const witnessed=await b.wait(m=>m.type==='state'&&m.players.find(p=>p.id===joined.id).inventory.length>0);assert.equal(witnessed.players.filter(p=>p.bot).length,5);
  a.send({type:'input',x:0,z:0,aim:Math.PI,jump:true,y:500});
  const jumping=await a.wait(m=>m.type==='state'&&m.players.find(p=>p.id===joined.id).y>.1);assert.ok(jumping.players.find(p=>p.id===joined.id).y<3);assert.equal(jumping.players.find(p=>p.id===joined.id).grounded,false);
  await c.wait(m=>m.type==='state'&&m.players.find(p=>p.id===joined.id).y>.1);
});
