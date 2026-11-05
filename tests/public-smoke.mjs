import assert from 'node:assert/strict';
import { WebSocket } from 'ws';
import { GAME_VERSION } from '../shared.js';

const origin = new URL(process.argv[2]);
assert.equal(origin.protocol, 'https:', 'Use the public HTTPS origin');
const health = await fetch(new URL('/health', origin), { signal: AbortSignal.timeout(20000) });
assert.equal(health.status, 200); const healthData = await health.json(); assert.equal(healthData.ok, true); assert.equal(healthData.version, GAME_VERSION);
assert.equal((await (await fetch(new URL('/version', origin))).json()).version, GAME_VERSION);
const html = await fetch(origin, { signal: AbortSignal.timeout(20000) });
assert.equal(html.status, 200); assert.match(await html.text(), /Chibi Island/);
const socketUrl = new URL('/socket', origin); socketUrl.protocol = 'wss:';
async function connect(name) {
  const socket = new WebSocket(socketUrl, { origin: origin.origin }); const messages = [];
  socket.on('message', bytes => messages.push(JSON.parse(bytes)));
  socket.on('error', () => {});
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => { socket.terminate(); reject(new Error(`${name}: WebSocket timeout`)); }, 20000);
    socket.once('open', () => { clearTimeout(timer); resolve(); });
    socket.once('error', error => { clearTimeout(timer); reject(error); });
  });
  return { socket, send: data => socket.send(JSON.stringify(data)), async wait(predicate) {
    const end = Date.now() + 20000;
    while (Date.now() < end) {
      const index = messages.findIndex(predicate);
      if (index >= 0) return messages.splice(index, 1)[0];
      await new Promise(resolve => setTimeout(resolve, 30));
    }
    throw new Error(`${name}: no matching server message`);
  }};
}
const clients = [];
try {
  for (const name of ['public-1','public-2','public-3']) clients.push(await connect(name));
  const [a,b,c] = clients;
  a.send({ type: 'create', mapId: 'meadow', name: 'Kiểm tra mạng 1', outfit: 'bear' });
  const joined = await a.wait(m => m.type === 'joined');
  for (const [client,name] of [[b,'Kiểm tra mạng 2'],[c,'Kiểm tra mạng 3']]) {
    client.send({ type: 'join', code: joined.code, name }); await client.wait(m => m.type === 'joined');
  }
  for (const client of clients) client.send({ type: 'configure', ready: true });
  await a.wait(m => m.type === 'state' && m.players.length === 3 && m.players.every(p => p.ready));
  a.send({ type: 'start' });
  const states = await Promise.all(clients.map(client => client.wait(m => m.type === 'state' && m.phase === 'playing')));
  assert.ok(states.every(s => s.mapId === 'meadow' && s.players.length === 8 && s.players.filter(p => !p.bot).length === 3));
  a.send({ type: 'input', x: 0, z: 0, aim: Math.PI, interact: true });
  const witnessed = await b.wait(m => m.type === 'state' && m.players.find(p => p.id === joined.id)?.inventory?.length > 0);
  assert.equal(witnessed.players.find(p => p.id === joined.id).inventory[0].id, 'water');
  a.send({ type: 'input', x: 0, z: 0, aim: Math.PI, jump: true });
  await c.wait(m => m.type === 'state' && m.players.find(p => p.id === joined.id)?.y > .1);
  a.send({ type: 'marker', aim: 0 });
  await b.wait(m => m.type === 'state' && m.markers?.some(marker => marker.player === joined.id));
  await c.wait(m => m.type === 'state' && m.markers?.some(marker => marker.player === joined.id));
  console.log(JSON.stringify({ version: GAME_VERSION, https: true, secureWebSocket: true, clients: 3, map: 'meadow', characters: 8, sharedLootAndJump: true, sharedMarkers: true, origin: origin.origin }));
} finally {
  for (const client of clients) { if (client.socket.readyState === WebSocket.OPEN) client.send({ type: 'leave' }); client.socket.close(); }
}
