import test from 'node:test';
import assert from 'node:assert/strict';
import { Room, AIRDROP, bombDamageFor } from '../server/game.js';
import { createGameAudio } from '../public/game-audio.js';

function startedRoom(opts) {
  const r = new Room('TEST', 'me', { random: () => .61, ...opts });
  r.addHuman('me', 'Me'); r.configure('me', { ready: true }); r.start('me');
  for (const p of r.players.values()) if (p.bot) p.decision = 1e9;
  return r;
}

test('bomb damage is 75 at the centre, falls off to the edge, zero outside', () => {
  assert.equal(AIRDROP.damage, 75); assert.equal(AIRDROP.interval, 30); assert.equal(AIRDROP.radius, 4);
  assert.equal(bombDamageFor(0), 75);
  assert.equal(bombDamageFor(2), 53);
  assert.equal(bombDamageFor(AIRDROP.radius), 30);
  assert.equal(bombDamageFor(AIRDROP.radius + .01), 0);
});

test('respawn mode works on a survival map: zone still shrinks and respawn lands inside the current zone', () => {
  const r = startedRoom({ mapId: 'meadow', mode: 'solo', respawn: true });
  assert.equal(r.respawn, true);
  r.nextBombAt = 1e9; // isolate the respawn behaviour from bomb waves
  r.time = 200;
  const zone = r.zone();
  assert.ok(zone.radius < r.map.radius, 'survival zone must keep shrinking in respawn mode');
  const me = r.players.get('me');
  r.damage(me, 1000, null);
  assert.equal(me.alive, false); assert.equal(me.deaths, 1);
  for (let i = 0; i < 89; i++) r.tick(1 / 30);
  assert.equal(me.alive, false, 'no respawn before 3 seconds');
  for (let i = 0; i < 4; i++) r.tick(1 / 30);
  assert.equal(me.alive, true); assert.equal(me.hp, 100);
  const d = Math.hypot(me.x - zone.x, me.z - zone.z);
  assert.ok(d <= zone.radius + 1, `respawn inside the zone (d=${d.toFixed(1)} <= r=${zone.radius.toFixed(1)})`);
});

test('bots respawn too in respawn mode; without the mode a survival room still eliminates', () => {
  const r = startedRoom({ mapId: 'beach', respawn: true });
  r.nextBombAt = 1e9;
  const bot = [...r.players.values()].find(p => p.bot);
  r.damage(bot, 1000, null);
  for (let i = 0; i < 95; i++) r.tick(1 / 30);
  assert.equal(bot.alive, true);

  const elim = startedRoom({ mapId: 'candy' });
  assert.equal(elim.respawn, false);
  for (const p of [...elim.players.values()]) if (p.id !== 'me') elim.damage(p, 1000, null);
  elim.tick(.01);
  assert.equal(elim.phase, 'finished'); assert.equal(elim.winner.id, 'me');
});

test('a bomb wave falls inside the zone every 30s and the blast applies falloff damage with no kill credit', () => {
  const r = startedRoom({ mapId: 'candy' });
  assert.equal(r.nextBombAt, 30);
  r.nextBombAt = .05;
  for (let i = 0; i < 3; i++) r.tick(1 / 30);
  assert.ok(r.bombs.length >= AIRDROP.minPerWave && r.bombs.length <= AIRDROP.maxPerWave, `wave size ${r.bombs.length}`);
  const zone = r.zone();
  for (const b of r.bombs) assert.ok(Math.hypot(b.x - zone.x, b.z - zone.z) <= zone.radius * .85 + 1, 'bomb target inside the zone');
  const bomb = r.bombs[0];
  const [a, b] = [...r.players.values()].filter(p => p.bot);
  Object.assign(a, { x: bomb.x, z: bomb.z, hp: 50 });        // centre: 75 damage, dies, nobody credited
  Object.assign(b, { x: bomb.x + AIRDROP.radius, z: bomb.z, hp: 100 }); // edge: 30 damage
  r.bombs = [{ ...bomb, fall: .001 }];
  r.tick(1 / 30);
  assert.equal(a.alive, false); assert.equal(a.deaths, 1);
  assert.equal(b.hp, 70);
  assert.ok(r.events.some(e => e.type === 'explosion'));
  const out = r.events.find(e => e.type === 'out' && e.player === a.id);
  assert.ok(out && out.attacker === null, 'bomb kills give no player kill credit');
  assert.equal(r.snapshot().bombs.length, 0);
});

test('kill voice follows the local streak (not match totals) and restarts after resetStreak', () => {
  const sounds = [];
  class Sound { constructor(src) { this.src = src; sounds.push(this); } play() { return Promise.resolve(); } pause() {} }
  const audio = createGameAudio({ enabled: () => true, doc: { hidden: false, addEventListener() {} }, AudioCtor: Sound });
  audio.unlock();
  const voices = () => sounds.map(s => s.src.split('/').pop()).filter(f => /^kill-\d\.wav$/.test(f) || f === 'pentakill.wav');
  audio.streakEvent({ type: 'out', player: 'x', attacker: 'me', kills: 9 }, 'me');
  audio.streakEvent({ type: 'out', player: 'y', attacker: 'me', kills: 10 }, 'me');
  assert.deepEqual(voices(), ['kill-1.wav', 'kill-2.wav']);
  audio.streakEvent({ type: 'out', player: 'z', attacker: 'someone-else', kills: 3 }, 'me');
  assert.deepEqual(voices(), ['kill-1.wav', 'kill-2.wav'], 'other players\u2019 kills never trigger my voice');
  audio.resetStreak(); // what the client calls when the local player respawns
  for (let i = 0; i < 5; i++) audio.streakEvent({ type: 'out', player: `v${i}`, attacker: 'me', kills: 20 + i }, 'me');
  assert.deepEqual(voices(), ['kill-1.wav', 'kill-2.wav', 'kill-1.wav', 'kill-2.wav', 'kill-3.wav', 'kill-4.wav', 'pentakill.wav']);
});

test('footstep plays a step sample without throwing (synth fallback is guarded)', () => {
  const sounds = [];
  class Sound { constructor(src) { this.src = src; sounds.push(this); } play() { return Promise.resolve(); } pause() {} }
  const audio = createGameAudio({ enabled: () => true, doc: { hidden: false, addEventListener() {} }, AudioCtor: Sound });
  audio.unlock();
  audio.footstep(false); audio.footstep(true);
  assert.ok(sounds.some(s => s.src.includes('step-')), 'a footstep sample was attempted');
  audio.bombWhistle(); audio.boom(.5); audio.resetStreak();
});
