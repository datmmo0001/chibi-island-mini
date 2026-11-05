import test from 'node:test';
import assert from 'node:assert/strict';
import { WebSocket } from 'ws';
import { Room } from '../server/game.js';
import { createGameServer } from '../server/index.js';
import { GAME_VERSION, RULES } from '../shared.js';

function match() {
  const room = new Room('MARKER', 'a', { mapId: 'meadow', random: () => .6 });
  for (const id of ['a', 'b', 'c']) { room.addHuman(id, id); room.configure(id, { ready: true }); }
  room.start('a');
  for (const p of room.players.values()) if (p.bot) p.decision = 10000;
  return room;
}

test('markers are bounded, rate limited, replaced per player and expire on server time', () => {
  const room = match(), p = room.players.get('a');
  assert.throws(() => room.placeMarker('a', NaN), /hợp lệ/);
  assert.throws(() => room.placeMarker('a', Infinity), /hợp lệ/);
  const first = room.placeMarker('a', 0);
  assert.ok(Math.abs(Math.hypot(first.x - p.x, first.z - p.z) - RULES.markerRange) < 1e-8);
  assert.throws(() => room.placeMarker('a', 1), /Chờ/);
  for (let i = 0; i < 91; i++) room.tick(1 / 30);
  Object.assign(p, { x: 0, z: room.map.radius - 3 });
  room.placeMarker('a', 0);
  assert.equal(room.markers.length, 1);
  assert.ok(Math.hypot(room.markers[0].x, room.markers[0].z) <= room.map.radius - 2 + 1e-8);
  const copy = room.snapshot(); copy.markers[0].x = 999;
  assert.notEqual(room.markers[0].x, 999);
  for (let i = 0; i < 241; i++) room.tick(1 / 30);
  assert.equal(room.snapshot().markers.length, 0);
});

test('spectators, bots and disconnected people cannot mark; leaving and rematches clear markers', () => {
  const room = match();
  assert.throws(() => room.placeMarker('missing', 0), /trong trận/);
  assert.throws(() => room.placeMarker('bot-0', 0), /trong trận/);
  room.disconnect('b'); assert.throws(() => room.placeMarker('b', 0), /trong trận/);
  room.players.get('c').alive = false; assert.throws(() => room.placeMarker('c', 0), /trong trận/);
  room.placeMarker('a', 0); room.leave('a'); assert.equal(room.markers.length, 0);
  const fresh = match(); fresh.placeMarker('a', 0); fresh.phase = 'finished'; fresh.backToLobby('a');
  for (const p of fresh.humans()) fresh.configure(p.id, { ready: true });
  fresh.start('a'); assert.equal(fresh.markers.length, 0); assert.doesNotThrow(() => fresh.placeMarker('a', 0));
});

test('three clients receive the same marker, cannot impersonate its owner, and read release version', async t => {
  const app = createGameServer(); await new Promise(resolve => app.server.listen(0, '127.0.0.1', resolve));
  t.after(() => app.close()); const base = `http://127.0.0.1:${app.server.address().port}`;
  const version = await fetch(`${base}/version`);
  assert.equal(version.headers.get('cache-control'), 'no-store');
  assert.equal((await version.json()).version, GAME_VERSION);
  assert.equal((await (await fetch(`${base}/health`)).json()).version, GAME_VERSION);
  async function client() {
    const socket = new WebSocket(base.replace('http:', 'ws:') + '/socket'), messages = [];
    socket.on('message', raw => messages.push(JSON.parse(raw)));
    await new Promise((resolve, reject) => { socket.once('open', resolve); socket.once('error', reject); });
    return { send: data => socket.send(JSON.stringify(data)), async wait(predicate) {
      const end = Date.now() + 4000;
      while (Date.now() < end) { const i = messages.findIndex(predicate); if (i >= 0) return messages.splice(i, 1)[0]; await new Promise(resolve => setTimeout(resolve, 10)); }
      throw Error('Missing marker state');
    } };
  }
  const clients = await Promise.all([client(), client(), client()]), [a,b,c] = clients;
  assert.equal((await a.wait(m => m.type === 'hello')).version, GAME_VERSION);
  a.send({ type: 'create', mapId: 'meadow', name: 'A' }); const joinedA = await a.wait(m => m.type === 'joined');
  b.send({ type: 'join', code: joinedA.code, name: 'B' }); const joinedB = await b.wait(m => m.type === 'joined');
  c.send({ type: 'join', code: joinedA.code, name: 'C' }); await c.wait(m => m.type === 'joined');
  for (const p of clients) p.send({ type: 'configure', ready: true });
  await a.wait(m => m.type === 'state' && m.players.length === 3 && m.players.every(p => p.ready));
  a.send({ type: 'start' }); await a.wait(m => m.type === 'state' && m.phase === 'playing');
  b.send({ type: 'marker', player: joinedA.id, aim: 1 });
  const states = await Promise.all(clients.map(p => p.wait(m => m.type === 'state' && m.markers?.length === 1)));
  assert.deepEqual(states[0].markers, states[1].markers); assert.deepEqual(states[1].markers, states[2].markers);
  assert.equal(states[0].markers[0].player, joinedB.id);
  b.send({ type: 'leave' }); await a.wait(m => m.type === 'state' && m.markers?.length === 0 && !m.players.some(p => p.id === joinedB.id));
});
