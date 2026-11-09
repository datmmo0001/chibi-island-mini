import test from 'node:test';
import assert from 'node:assert/strict';
import { Room } from '../server/game.js';
import { MAPS } from '../shared.js';

// Package 3 (Ken 2026-11-09): bots must actually shoot. Before the fix the
// fire decision reused the movement target (nearest enemy, even out of
// range / without line of sight), so bots with short-range guns stood at
// ~15 units and never fired; candy's slow shells were never compensated;
// and a bot beside a ladder toggled climb on/off forever via interact.
const mulberry = seed => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

// One armed bot vs one stationary human on the flat candy map, 20 s of
// ticks. Both are kept alive so the match (and the bot's decisions) runs
// for the full window.
function duel(gunId, distance, seed) {
  const room = new Room('BOT', 'me', { mapId: 'candy', random: mulberry(seed) });
  room.addHuman('me', 'Me'); room.configure('me', { ready: true }); room.start('me');
  room.nextBombAt = 1e9;
  const me = room.players.get('me'), bot = room.players.get('bot-0');
  for (const p of room.players.values()) if (p !== me && p !== bot) p.alive = false;
  Object.assign(me, { x: 0, y: 0, z: 0 });
  Object.assign(bot, { x: 0, y: 0, z: distance, decision: 0, skillReadyAt: 1e9 }); // skillReadyAt pinned: only gun shots are counted
  bot.inventory = [{ id: gunId, mag: 99, reserve: 99 }]; bot.slot = 0;
  for (let i = 0; i < 30 * 20 && room.phase === 'playing'; i++) { me.hp = 100; bot.hp = 100; room.tick(1 / 30); }
  return { shots: bot.shots, phase: room.phase, gap: Math.hypot(bot.x - me.x, bot.z - me.z) };
}

test('bots with a gun actually fire at an enemy in line of sight', () => {
  for (const [gun, distance, seed] of [['water', 20, 11], ['bubble', 25, 15]]) {
    const r = duel(gun, distance, seed);
    assert.ok(r.shots > 0, `${gun} bot at ${distance} fired ${r.shots} shots`);
  }
});

test('candy bot fires too, and closes in when the enemy starts beyond candy range', () => {
  const near = duel('candy', 20, 12);
  assert.ok(near.shots > 0, `candy bot at 20 fired ${near.shots} shots`);
  const far = duel('candy', 45, 14); // candy's effective range is ~33: the bot must approach first
  assert.ok(far.shots > 0, `candy bot starting at 45 fired ${far.shots} shots after closing in`);
  assert.ok(far.gap < 20, `bot closed the gap to ${far.gap.toFixed(1)}`);
});

test('a climbing bot never toggles interact (no ladder climb loop)', () => {
  const room = new Room('BOT', 'me', { mapId: 'frontier', random: mulberry(3) });
  room.addHuman('me', 'Me'); room.configure('me', { ready: true }); room.start('me');
  const bot = room.players.get('bot-0');
  bot.inventory = []; bot.decision = 0;
  bot.climb = { x: bot.x, z: bot.z, toY: 6, exitX: bot.x, exitZ: bot.z };
  // A loot orb the bot wants sits right at its feet: without the guard this
  // is exactly what made it interact every decision cycle and bounce on the
  // ladder instead of shooting.
  room.loot.push({ id: 'tempt', x: bot.x, z: bot.z, y: 0, type: 'weapon', weapon: 'water', active: true });
  room.botInput(bot, .5);
  assert.equal(bot.actions.interact, false, 'interact stays off while climbing');
});

test('bot beside a ladder with an enemy in range shoots and never gets stuck climbing', () => {
  const room = new Room('BOT', 'me', { mapId: 'frontier', random: mulberry(21) });
  room.addHuman('me', 'Me'); room.configure('me', { ready: true }); room.start('me');
  room.nextBombAt = 1e9;
  const me = room.players.get('me'), bot = room.players.get('bot-0');
  for (const p of room.players.values()) if (p !== me && p !== bot) p.alive = false;
  const ladder = MAPS.frontier.obstacles.find(o => o.kind === 'ladder');
  Object.assign(me, { x: ladder.x + 6, y: 0, z: ladder.z });
  Object.assign(bot, { x: ladder.x, y: 0, z: ladder.z, decision: 0 });
  bot.inventory = [{ id: 'water', mag: 18, reserve: 54 }]; bot.slot = 0;
  bot.skill = 'dash'; // a held skill makes the bot refuse the skill orb below, like the interact trap
  room.loot.push({ id: 'tempt', x: ladder.x, z: ladder.z, y: 0, type: 'skill', weapon: 'regen', active: true });
  let climbRun = 0, maxRun = 0;
  for (let i = 0; i < 30 * 20 && room.phase === 'playing'; i++) {
    me.hp = 100; bot.hp = 100; room.tick(1 / 30);
    if (bot.climb) { climbRun += 1 / 30; maxRun = Math.max(maxRun, climbRun); } else climbRun = 0;
  }
  assert.ok(bot.shots > 0, `bot fired ${bot.shots} shots beside the ladder`);
  assert.ok(maxRun < 3, `longest continuous climb was ${maxRun.toFixed(2)} s (< 3 s)`);
});
