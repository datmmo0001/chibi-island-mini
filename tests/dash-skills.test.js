import test from 'node:test';
import assert from 'node:assert/strict';
import { Room } from '../server/game.js';
import { SKILLS, RULES } from '../shared.js';

function startedRoom(opts) {
  const r = new Room('DASH', 'me', { random: () => .61, mapId: 'candy', ...opts });
  r.addHuman('me', 'Me'); r.configure('me', { ready: true }); r.start('me');
  r.nextBombAt = 1e9; // isolate dash behaviour from sky-bomb waves
  for (const p of r.players.values()) if (p.bot) p.decision = 1e9; // freeze bot brains; inputs stay as set
  return r;
}
function place(p, x, z) { Object.assign(p, { x, z, y: 0, vy: 0, grounded: true }); }

test('every timed skill lasts 5 seconds; rocket stays instant', () => {
  for (const [id, skill] of Object.entries(SKILLS)) {
    if (id === 'rocket') assert.equal(skill.duration, 0, 'rocket is instant');
    else assert.equal(skill.duration, 5, `${id} duration`);
    if (skill.duration > 0) assert.ok(skill.description.includes('5 giây'), `${id} description matches its duration`);
  }
  assert.ok(SKILLS.regen.description.includes('16 máu mỗi giây'), 'regen rate unchanged (16/s x 5s = 80 total)');
  assert.equal(RULES.dashDuration, .35); assert.equal(RULES.dashSpeedMultiplier, 2.2); assert.equal(RULES.dashCooldown, 5);
  assert.equal(RULES.sprintMultiplier, 1.6, 'legacy sprint multiplier kept for bots/stepActor');
});

test('dash: server times 0.35s at higher speed, 5s cooldown blocks re-press, then it works again', () => {
  const r = startedRoom();
  const me = r.players.get('me');
  // Baseline: plain walking for 10 ticks (1/3 s) straight ahead (+z, aim 0).
  place(me, 0, 0);
  r.setInput('me', { x: 0, z: 1, aim: 0 });
  for (let i = 0; i < 10; i++) r.tick(1 / 30);
  const walkDisp = Math.hypot(me.x, me.z);
  assert.ok(walkDisp > 1.8 && walkDisp < 2.6, `walk displacement ${walkDisp.toFixed(2)} ≈ 6.4 speed`);
  assert.equal(me.sprinting, false);

  // Dash while moving: direction follows the move input.
  place(me, 0, 0);
  r.setInput('me', { x: 0, z: 1, aim: 0, dash: true });
  r.tick(1 / 30);
  assert.ok(me.dashUntil > r.time, 'dash is active right after the press');
  assert.ok(Math.abs((me.dashReadyAt - me.dashUntil) - (RULES.dashCooldown - RULES.dashDuration)) < 1e-9,
    'cooldown (5s from the press) and duration (0.35s) are both server-set');
  assert.equal(me.dashVx, 0); assert.equal(me.dashVz, 1);
  const snap = r.snapshot().players.find(p => p.id === 'me');
  assert.equal(snap.dashing, true); assert.equal(snap.sprinting, true, 'snapshot sprinting mirrors dashing for the scene');
  assert.ok(snap.dashCooldownLeft > 4.5 && snap.dashCooldownLeft <= 5, `cooldown left ${snap.dashCooldownLeft}`);

  // Pressing again immediately must not restart or extend anything.
  const until = me.dashUntil, ready = me.dashReadyAt;
  r.setInput('me', { x: 0, z: 1, aim: 0, dash: true });
  r.tick(1 / 30);
  assert.equal(me.dashUntil, until); assert.equal(me.dashReadyAt, ready);

  // Remaining dash ticks are much faster than walking.
  for (let i = 0; i < 8; i++) r.tick(1 / 30);
  const dashDisp = Math.hypot(me.x, me.z);
  assert.ok(dashDisp > walkDisp * 1.8, `dash displacement ${dashDisp.toFixed(2)} >> walk ${walkDisp.toFixed(2)}`);

  // Wait out the cooldown standing still, then dash again.
  r.setInput('me', { x: 0, z: 0, aim: 0 });
  while (r.time < ready) r.tick(1 / 30);
  const cooled = r.snapshot().players.find(p => p.id === 'me');
  assert.equal(cooled.dashCooldownLeft, 0); assert.equal(cooled.dashing, false);
  place(me, 0, 0);
  r.setInput('me', { x: 0, z: 1, aim: 0, dash: true });
  r.tick(1 / 30);
  assert.ok(me.dashUntil > r.time && me.dashReadyAt > ready, 'dash is available again after 5s');
});

test('dash while standing still follows the aim direction', () => {
  const r = startedRoom();
  const me = r.players.get('me');
  place(me, 0, 0);
  r.setInput('me', { x: 0, z: 0, aim: Math.PI / 2, dash: true }); // aim +x
  for (let i = 0; i < 5; i++) r.tick(1 / 30);
  assert.ok(me.x > 1.5, `dashed along aim (+x): x=${me.x.toFixed(2)}`);
  assert.ok(Math.abs(me.z) < .01, `no sideways drift: z=${me.z.toFixed(3)}`);
});

test('held sprint no longer speeds up a human, but bots keep the old sprint', () => {
  const r = startedRoom();
  const me = r.players.get('me');
  place(me, 0, 0);
  r.setInput('me', { x: 0, z: 1, aim: 0, sprint: true });
  for (let i = 0; i < 10; i++) r.tick(1 / 30);
  const humanDisp = Math.hypot(me.x, me.z);
  assert.ok(humanDisp < 2.6, `human sprint input is ignored: ${humanDisp.toFixed(2)} (sprint would be ≈3.41)`);
  assert.equal(me.sprinting, false);
  assert.equal(r.snapshot().players.find(p => p.id === 'me').sprinting, false);

  const bot = [...r.players.values()].find(p => p.bot);
  place(bot, 0, 0);
  bot.input = { x: 0, z: 1, aim: 0, pitch: 0, fire: false, sprint: true };
  for (let i = 0; i < 10; i++) r.tick(1 / 30);
  const botDisp = Math.hypot(bot.x, bot.z);
  assert.ok(botDisp > 3.0, `bot still sprints at x1.6: ${botDisp.toFixed(2)}`);
  assert.equal(bot.sprinting, true);
});
