import test from 'node:test';
import assert from 'node:assert/strict';
import { Room } from '../server/game.js';
import { RULES, MAP, moveActor } from '../shared.js';

function readyRoom() {
  const room = new Room('TEST12', 'p1', { random: () => .6 });
  for (let i = 1; i <= 3; i++) { room.addHuman(`p${i}`, `Bạn ${i}`); room.configure(`p${i}`, { ready: true }); }
  return room;
}
test('requires all participants ready; prevents non-host start and fourth player', () => {
  const room = new Room('TEST12', 'p1');
  assert.throws(() => room.start('p1'), /ít nhất một/);
  room.addHuman('p1', 'One');
  assert.throws(() => room.start('p1'), /Sẵn sàng/);
  room.configure('p1', { ready: true });
  room.addHuman('p2', 'Two'); room.addHuman('p3', 'Three');
  assert.throws(() => room.addHuman('p4', 'Four'), /đủ 3/);
  assert.throws(() => room.start('p2'), /chủ phòng/);
  assert.throws(() => room.start('p1'), /Sẵn sàng/);
  room.configure('p2', { ready: true }); room.configure('p3', { ready: true }); room.start('p1');
  assert.equal(room.humans().length, 3); assert.equal(room.players.size, 8);
  assert.equal([...room.players.values()].filter(p => p.bot).length, 5);
  assert.ok([...room.players.values()].every(p => MAP.obstacles.every(o => Math.hypot(p.x - o.x, p.z - o.z) > o.r + RULES.playerRadius)));
  assert.throws(() => room.addHuman('p4', 'Four'), /đang diễn ra/);
});
test('one or two humans can start with fill to eight, including repeated solo rounds', () => {
  for (const humans of [1, 2]) {
    const room = new Room('FILL12', 'p1', { mode: humans === 1 ? 'solo' : 'party' });
    for (let i = 1; i <= humans; i++) { room.addHuman(`p${i}`, `Bạn ${i}`); room.configure(`p${i}`, { ready: true }); }
    room.start('p1'); assert.equal(room.players.size, 8);
    assert.equal([...room.players.values()].filter(p => p.bot).length, 8 - humans);
    assert.ok([...room.players.values()].every(p => typeof p.name === 'string' && p.name.length > 0));
    assert.equal(new Set([...room.players.values()].filter(p => p.bot).map(p => p.name)).size, 8 - humans);
    for (let i = 0; i < 180 * 30 + 10 && room.phase === 'playing'; i++) room.tick(1 / 30);
    assert.equal(room.phase, 'finished'); room.backToLobby('p1'); assert.equal(room.players.size, humans);
    for (const p of room.humans()) room.configure(p.id, { ready: true }); room.start('p1');
    assert.equal(room.players.size, 8); assert.equal(room.round, 2);
  }
});
test('solo lobby refuses a second human without blocking normal party rooms', () => {
  const room = new Room('SOLO12', 'p1', { mode: 'solo' }); room.addHuman('p1', 'One');
  assert.throws(() => room.addHuman('p2', 'Two'), /chơi riêng/);
  assert.equal(room.snapshot().mode, 'solo');
});
test('client cannot submit health or position and malformed movement never poisons simulation', () => {
  const room = readyRoom(); room.start('p1'); const p = room.players.get('p1'), before = { x: p.x, z: p.z };
  room.setInput('p1', { x: NaN, z: 0, aim: Infinity, hp: 9999 });
  assert.equal(p.hp, 100); assert.equal(p.input.x, 0);
  room.setInput('p1', { x: 10000, z: 10000, aim: 0, hp: 9999, position: { x: 1000 } }); room.tick(1 / 30);
  assert.ok(Math.hypot(p.x - before.x, p.z - before.z) <= RULES.speed / 30 + .001); assert.equal(p.hp, 100);
  assert.ok(Number.isFinite(p.x) && Number.isFinite(p.z));
});
test('movement cannot pass through map obstacles or the shore', () => {
  const obstacle = MAP.obstacles[0], actor = { x: obstacle.x - obstacle.r - 2, z: obstacle.z };
  for (let i = 0; i < 60; i++) moveActor(actor, 1, 0, 1 / 30);
  assert.ok(Math.hypot(actor.x - obstacle.x, actor.z - obstacle.z) >= obstacle.r + RULES.playerRadius - .001);
  actor.x = 30; actor.z = 0; for (let i = 0; i < 60; i++) moveActor(actor, 1, 0, 1 / 30);
  assert.ok(Math.hypot(actor.x, actor.z) <= RULES.arenaRadius - RULES.playerRadius + .001);
});
test('server projectile hits change health and cannot grant client-selected kills', () => {
  const room = readyRoom(); room.start('p1');
  for (const p of room.players.values()) { p.x = -24; p.z = -10; if (p.bot) p.decision = 1000; p.input = { x: 0, z: 0, aim: 0, fire: false }; }
  const shooter = room.players.get('p1'), target = room.players.get('p2');
  Object.assign(shooter, { x: 0, z: 3, cooldown: 0 }); Object.assign(target, { x: 0, z: 7 });
  for (let i = 0; i < 90 && target.alive; i++) { room.setInput('p1', { x: 0, z: 0, aim: 0, fire: true }); room.tick(1 / 30); }
  assert.equal(target.alive, false); assert.equal(target.hp, 0); assert.equal(shooter.kills, 1);
  assert.ok(room.events.some(e => e.type === 'out' && e.player === 'p2' && e.attacker === 'p1'));
});
test('bots move, fire and damage other entities; full match terminates and rematch resets', () => {
  const room = readyRoom(); room.start('p1');
  const bot = room.players.get('bot-0'), start = { x: bot.x, z: bot.z };
  let shots = false, damaged = false;
  for (let i = 0; i < 180 * 30 + 5 && room.phase === 'playing'; i++) {
    room.tick(1 / 30); shots ||= room.bullets.some(b => b.owner.startsWith('bot-'));
    damaged ||= [...room.players.values()].some(p => p.hp < 100);
  }
  assert.ok(Math.hypot(bot.x - start.x, bot.z - start.z) > 1); assert.ok(shots); assert.ok(damaged);
  assert.equal(room.phase, 'finished'); assert.ok(room.time <= 180.1); assert.ok(room.winner);
  assert.throws(() => room.backToLobby('p2'), /chủ phòng/); room.backToLobby('p1');
  assert.equal(room.phase, 'lobby'); assert.equal(room.players.size, 3);
  assert.ok(room.humans().every(p => !p.ready && p.hp === 100));
  for (const p of room.humans()) room.configure(p.id, { ready: true }); room.start('p1'); assert.equal(room.round, 2); assert.equal(room.players.size, 8);
});
test('disconnect transfers host, stops movement, and allows bounded reconnect', () => {
  const room = readyRoom(); room.start('p1'); room.setInput('p1', { x: 1, z: 0, aim: 0, fire: true });
  room.disconnect('p1'); assert.equal(room.hostId, 'p2'); assert.equal(room.players.get('p1').input.fire, false);
  room.tick(.1); assert.equal(room.resume('p1'), true); assert.equal(room.players.get('p1').connected, true);
  room.disconnect('p1'); room.players.get('p1').disconnectedFor = RULES.reconnectSeconds; room.tick(.1);
  assert.equal(room.players.get('p1').alive, false); assert.equal(room.resume('p1'), false);
});
