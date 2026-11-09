import test from 'node:test';
import assert from 'node:assert/strict';
import { Room } from '../server/game.js';
import { shoot, advanceBullets, bodyScaleOf } from '../server/survival.js';
import { useSkill } from '../server/skills.js';
import { MAPS, SKILLS, WEAPONS, ROCKET_BLAST, stepActor } from '../shared.js';

// Packages 4-7 (Ken 2026-11-09): URF mode, blast rockets, random entry
// skills with a 30 s cooldown, and the shrink/grow skills.
const mulberry = seed => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
function startedRoom(mapId, seed = 7, options = {}) {
  const room = new Room('TEST', 'me', { mapId, random: mulberry(seed), ...options });
  room.addHuman('me', 'Me'); room.configure('me', { ready: true }); room.start('me');
  room.nextBombAt = 1e9; // keep sky bombs out of these assertions
  return room;
}

test('urf map exists: empty world, meadow radius (20x), forced respawn, rocket-only loadout', () => {
  assert.ok(MAPS.urf, 'urf map registered');
  assert.equal(MAPS.urf.obstacles.length, 0, 'no obstacles at all');
  assert.equal(MAPS.urf.radius, MAPS.meadow.radius, 'radius equals meadow (20x area)');
  const room = startedRoom('urf');
  assert.equal(room.respawn, true, 'respawn forced on even though it was not requested');
  const me = room.players.get('me');
  assert.deepEqual(me.inventory.map(g => g.id), ['rocket'], 'players spawn holding only the URF rocket');
  assert.equal(me.inventory[0].mag, WEAPONS.rocket.capacity);
  assert.equal(WEAPONS.rocket.damage, 100);
  assert.equal(WEAPONS.rocket.interval, 2, 'two seconds between shots');
  assert.equal(ROCKET_BLAST, 3);
});

test('urf rocket: one blast shell per shot, 2 s refire block, blast kills in radius 3, respawn after 3 s', () => {
  const room = startedRoom('urf');
  const me = room.players.get('me'), foe = [...room.players.values()].find(p => p.bot);
  Object.assign(me, { x: 0, y: 0, z: 0, aim: 0, pitch: 0, cooldown: 0 });
  Object.assign(foe, { x: 0, y: 0, z: 10 });
  shoot(room, me);
  assert.equal(room.bullets.length, 1, 'exactly one rocket shell');
  const shell = room.bullets[0];
  assert.equal(shell.weapon, 'rocket'); assert.equal(shell.damage, 100); assert.equal(shell.blast, ROCKET_BLAST);
  const shotsAfterFirst = me.shots;
  shoot(room, me); // immediately: the 2 s interval must block this
  assert.equal(me.shots, shotsAfterFirst, 'second shot inside 2 s is blocked');
  assert.equal(room.bullets.length, 1);
  for (let i = 0; i < 40 && room.bullets.length; i++) advanceBullets(room, 1 / 30);
  assert.equal(foe.hp, 0, 'enemy inside the blast radius dies to 100 damage');
  assert.equal(me.kills, 1);
  assert.equal(me.hp, 100, 'the shooter is excluded from their own blast');
  assert.ok(room.events.some(e => e.type === 'explosion'), 'explosion event emitted for client effects');
  // foe died during advanceBullets; run room ticks and expect revival ~3 s later.
  const diedAt = room.time;
  for (let i = 0; i < 200 && !foe.alive; i++) room.tick(1 / 30);
  assert.ok(foe.alive, 'urf respawn revives the dead player');
  assert.ok(Math.abs((room.time - diedAt) - 3) < .2, `respawn took ${(room.time - diedAt).toFixed(2)} s (expected ~3)`);
});

test('entry skill: everyone holds a random skill at match start; use starts a 30 s cooldown; a fresh skill returns after it', () => {
  const room = startedRoom('meadow', 11);
  room.tick(1 / 30);
  for (const p of room.players.values()) assert.ok(p.skill && SKILLS[p.skill], `${p.id} holds a valid skill (${p.skill})`);
  const me = room.players.get('me');
  me.skill = 'dash';
  assert.equal(useSkill(room, me), true);
  assert.equal(me.skill, null, 'skill is spent');
  const snap = room.snapshot().players.find(p => p.id === 'me');
  assert.ok(snap.skillCooldownLeft >= 29 && snap.skillCooldownLeft <= 30, `cooldown snapshot ${snap.skillCooldownLeft} ~ 30 s`);
  me.skill = 'flight';
  assert.equal(useSkill(room, me), false, 'cannot use another skill during the cooldown');
  assert.equal(me.skill, 'flight', 'held skill is kept while cooling down');
  me.effect = null; me.effectRemaining = 0; me.skillReadyAt = room.time + .01; me.skill = null;
  room.tick(1 / 30); room.tick(1 / 30);
  assert.ok(me.skill && SKILLS[me.skill], 'a new random skill is granted once the cooldown ends');
});

test('respawn does not reset the skill cooldown', () => {
  const room = startedRoom('urf');
  const me = room.players.get('me');
  const readyAt = room.time + 25; me.skillReadyAt = readyAt; me.skill = null;
  room.damage(me, 1000, null);
  for (let i = 0; i < 200 && !me.alive; i++) room.tick(1 / 30);
  assert.ok(me.alive, 'player respawned');
  assert.equal(me.skillReadyAt, readyAt, 'cooldown survived death and respawn');
  assert.equal(me.skill, null, 'no free skill from dying');
});

test('skill rocket: 100 blast damage, explodes on first cover, never pierces', () => {
  const room = startedRoom('frontier', 5);
  room.map = { ...room.map, obstacles: [{ id: 'wall', x: 0, z: 10, hx: 5, hz: 1, r: 5, h: 8, shape: 'box' }] };
  const me = room.players.get('me');
  const [near, far] = [...room.players.values()].filter(p => p.bot);
  for (const q of room.players.values()) if (q !== me) Object.assign(q, { x: 100, z: 100 });
  Object.assign(me, { x: 0, y: 0, z: 0, aim: 0, pitch: 0, skill: 'rocket' });
  Object.assign(near, { x: 2, z: 10.5, y: 0 }); Object.assign(far, { x: 0, z: 20, y: 0 });
  assert.equal(useSkill(room, me), true);
  const shell = room.bullets.at(-1);
  assert.equal(shell.damage, 100); assert.equal(shell.blast, ROCKET_BLAST); assert.ok(!shell.piercing);
  for (let i = 0; i < 90 && room.bullets.length; i++) advanceBullets(room, 1 / 30);
  assert.equal(room.bullets.length, 0, 'rocket consumed by the explosion at the wall');
  assert.equal(near.hp, 0, 'enemy beside the wall is inside the blast');
  assert.equal(far.hp, 100, 'enemy behind the wall is outside the blast and safe');
});

test('shrink: +30% speed, body scale .3, bullets that would hit a normal body miss', () => {
  const map = MAPS.candy;
  const walk = { x: 0, y: 0, z: 0, vy: 0, grounded: true, effect: null, effectRemaining: 0 };
  const small = { ...walk, effect: 'shrink', effectRemaining: 5 };
  for (let i = 0; i < 30; i++) { stepActor(walk, { x: 0, z: 1 }, 1 / 30, map); stepActor(small, { x: 0, z: 1 }, 1 / 30, map); }
  const ratio = Math.hypot(small.x, small.z) / Math.hypot(walk.x, walk.z);
  assert.ok(Math.abs(ratio - 1.3) < .01, `shrink speed ratio ${ratio.toFixed(3)} ~ 1.3`);
  assert.equal(bodyScaleOf({ effect: 'shrink', effectRemaining: 5 }), .3);
  assert.equal(bodyScaleOf({ effect: 'grow', effectRemaining: 5 }), 1.5);
  assert.equal(bodyScaleOf({ effect: null, effectRemaining: 0 }), 1);
  // Hitbox: a bullet passing 0.5 to the side at chest height hits a normal
  // body (radius .75) but misses a shrunk one (radius floored at .22).
  const room = startedRoom('candy', 3);
  const me = room.players.get('me'), target = [...room.players.values()].find(p => p.bot);
  Object.assign(me, { x: 0, y: 0, z: 0, aim: Math.PI / 2, pitch: 0, cooldown: 0 }); // aim +x so the lateral offset is purely sideways
  Object.assign(target, { x: 6, y: 0, z: .5 });
  target.effect = 'shrink'; target.effectRemaining = 5;
  shoot(room, me); for (let i = 0; i < 10; i++) advanceBullets(room, 1 / 30);
  assert.equal(target.hp, 100, 'shrunk target is missed by the side shot');
  target.effect = null; target.effectRemaining = 0;
  Object.assign(me, { cooldown: 0 }); room.bullets = [];
  shoot(room, me); for (let i = 0; i < 10; i++) advanceBullets(room, 1 / 30);
  assert.ok(target.hp < 100, 'same shot hits the normal-sized target');
});

test('grow: normal bullets deal 1.5x damage while the effect lasts', () => {
  const room = startedRoom('candy', 9);
  const me = room.players.get('me');
  Object.assign(me, { x: 0, y: 0, z: 0, aim: 0, pitch: 0, cooldown: 0, effect: 'grow', effectRemaining: 5 });
  shoot(room, me);
  assert.equal(room.bullets.at(-1).damage, 24, 'water 16 x 1.5 = 24');
});
