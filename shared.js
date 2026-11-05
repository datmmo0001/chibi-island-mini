export const RULES = Object.freeze({ humans: 3, bots: 5, tickRate: 30, snapshotRate: 20, duration: 180, arenaRadius: 31, playerRadius: 0.65, speed: 6.4, sprintMultiplier: 1.6, gravity: 25, jumpSpeed: 11.8, interactRange: 3.4, bulletSpeed: 58, damage: 16, fireInterval: 0.33, bulletLife: 1.3, reconnectSeconds: 25 });
export const WEAPONS = Object.freeze({
  water: { id: 'water', name: 'Súng nước', damage: 16, speed: 58, interval: .28, capacity: 18, reserve: 54, reload: 1.3, life: 1.3, spread: .018, pellets: 1, color: '#42eaff' },
  spray: { id: 'spray', name: 'Vòi phun liên thanh', damage: 10, speed: 54, interval: .12, capacity: 28, reserve: 84, reload: 1.65, life: 1.1, spread: .055, pellets: 1, color: '#ffe45b' },
  candy: { id: 'candy', name: 'Kẹo chùm', damage: 10, speed: 52, interval: .82, capacity: 6, reserve: 24, reload: 1.8, life: .64, spread: .15, pellets: 5, color: '#ff95e8' },
  bubble: { id: 'bubble', name: 'Bong bóng tầm xa', damage: 34, speed: 78, interval: .85, capacity: 8, reserve: 24, reload: 1.7, life: 1.4, spread: .008, pellets: 1, color: '#b3ff75' }
});
export const OUTFITS = [
  { id: 'bear', name: 'Gấu Caramel', color: '#c98b57', light: '#ffe3b9', accent: '#734c39' },
  { id: 'bunny', name: 'Thỏ Mây Hồng', color: '#ef9ebc', light: '#fff0ee', accent: '#c35e91' },
  { id: 'duck', name: 'Vịt Đi Mưa', color: '#f5cd55', light: '#fff3bd', accent: '#ee8746' }
];
export const HATS = ['ears', 'cap', 'leaf'];
export const MAP = Object.freeze({
  id: 'candy', name: 'Đảo Kẹo', radius: 31, duration: 180, survival: false, areaMultiplier: 1,
  obstacles: [
    { x: -8, z: -5, r: 1.8, kind: 'cake' }, { x: 8, z: 5, r: 1.8, kind: 'cake' },
    { x: 7, z: -9, r: 1.5, kind: 'rock' }, { x: -7, z: 9, r: 1.5, kind: 'rock' },
    { x: 0, z: -14, r: 1.3, kind: 'tree' }, { x: 0, z: 14, r: 1.3, kind: 'tree' },
    { x: -16, z: 0, r: 1.4, kind: 'tree' }, { x: 16, z: 0, r: 1.4, kind: 'tree' },
    { x: -16, z: -16, r: 1.7, kind: 'cake' }, { x: 16, z: 16, r: 1.7, kind: 'cake' },
    { x: -17, z: 14, r: 1.3, kind: 'rock' }, { x: 17, z: -14, r: 1.3, kind: 'rock' }
  ].map((o, id) => ({ ...o, id: `c-${id}`, h: o.kind === 'tree' ? 5 : o.kind === 'cake' ? 2.15 : 1.7, walkable: o.kind !== 'tree' })),
  pickups: [{ x: 0, z: 0 }, { x: -12, z: 6 }, { x: 12, z: -6 }],
  loot: [], spawnPoints: Array.from({ length: 8 }, (_, i) => ({ x: Math.sin(i * Math.PI / 4) * 25.8, z: Math.cos(i * Math.PI / 4) * 25.8 })),
  zones: [{ wait: 15, shrink: 155, radius: 4, x: 0, z: 0, damage: 9 }]
});
function meadowMap() {
  let seed = 20261105;
  const random = () => { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; return (seed >>> 0) / 4294967296; };
  const radius = 31 * Math.sqrt(20), obstacles = [], loot = [];
  const spawnPoints = Array.from({ length: 8 }, (_, i) => ({ x: Math.sin(i * Math.PI / 4) * 78, z: Math.cos(i * Math.PI / 4) * 78 }));
  const add = o => obstacles.push({ id: `m-${obstacles.length}`, walkable: true, ...o });
  const drop = (x, z, type, weapon) => loot.push({ id: `loot-${loot.length}`, x, z, y: 0, type, weapon });
  const regions = [{ x: -65, z: -42, name: 'Trại Mây' }, { x: 64, z: -44, name: 'Vườn Nắng' }, { x: -61, z: 49, name: 'Đồi Cỏ' }, { x: 62, z: 55, name: 'Kho Tiếp Tế' }, { x: 0, z: 4, name: 'Quảng Trường' }, { x: 0, z: -96, name: 'Rừng Thông' }];
  spawnPoints.forEach((p, i) => {
    drop(p.x, p.z - 2.5, 'weapon', 'water'); drop(p.x + 1.8, p.z - 2.5, 'ammo'); drop(p.x - 2, p.z - 2, 'heal');
    add({ x: p.x - 5, z: p.z - 5, r: 2, h: 1.25, kind: 'platform' });
    add({ x: p.x - 8, z: p.z - 5, r: 1.8, h: 2.8, kind: 'platform' });
    add({ x: p.x + 5, z: p.z - 4, r: .85, h: 1.1, kind: 'chest', interactive: true });
  });
  regions.forEach((p, i) => {
    add({ x: p.x - 6, z: p.z, r: 3.1, h: 1.4, kind: 'platform' });
    add({ x: p.x - 10, z: p.z, r: 2.3, h: 3, kind: 'platform' });
    add({ x: p.x + 4, z: p.z - 3, r: 1, h: 1.2, kind: 'chest', interactive: true });
    add({ x: p.x + 7, z: p.z + 2, r: 1, h: 1.4, kind: 'crate', destructible: true, hp: 48 });
    add({ x: p.x + 2, z: p.z + 6, r: 1.6, h: 2.5, kind: 'gate', interactive: true, walkable: false });
    add({ x: p.x + 6, z: p.z + 6, r: 1.7, h: 2.5, kind: 'wall' });
    add({ x: p.x - 2, z: p.z + 6, r: 1.7, h: 2.5, kind: 'wall' });
    drop(p.x, p.z, 'weapon', ['spray', 'candy', 'bubble'][i % 3]);
    drop(p.x + 2, p.z, 'ammo'); drop(p.x - 2, p.z - 1, 'heal');
  });
  for (let i = 0; i < 190; i++) {
    const a = random() * Math.PI * 2, r = Math.sqrt(random()) * (radius - 9), x = Math.sin(a) * r, z = Math.cos(a) * r;
    if (spawnPoints.some(p => Math.hypot(x - p.x, z - p.z) < 12) || regions.some(p => Math.hypot(x - p.x, z - p.z) < 16) || obstacles.some(o => Math.hypot(x - o.x, z - o.z) < o.r + 2.8)) continue;
    const kind = i % 5 === 0 ? 'crate' : i % 3 === 0 ? 'rock' : i % 7 === 0 ? 'log' : 'tree';
    add({ x, z, r: kind === 'tree' ? .85 : 1.1 + random(), h: kind === 'tree' ? 6 + random() * 2 : kind === 'log' ? .85 : 1.2 + random() * .8,
      kind, walkable: kind !== 'tree', destructible: kind === 'crate', hp: kind === 'crate' ? 48 : undefined });
    if (i % 8 === 0) drop(x + 3, z, 'weapon', Object.keys(WEAPONS)[i % 4]);
    if (i % 6 === 0) drop(x - 2.8, z, i % 12 === 0 ? 'ammo' : 'heal');
  }
  const safeObstacles = obstacles.filter(o => spawnPoints.every(p => Math.hypot(p.x - o.x, p.z - o.z) > o.r + RULES.playerRadius + 1));
  return Object.freeze({ id: 'meadow', name: 'Đảo Cỏ Xanh', radius, duration: 480, survival: true, areaMultiplier: 20,
    obstacles: safeObstacles, loot, pickups: [], spawnPoints, regions,
    zones: [
      { wait: 35, shrink: 55, radius: 96, x: 15, z: -12, damage: 2 },
      { wait: 25, shrink: 55, radius: 64, x: 2, z: -6, damage: 4 },
      { wait: 20, shrink: 55, radius: 36, x: -8, z: 5, damage: 6 },
      { wait: 15, shrink: 55, radius: 16, x: 0, z: 8, damage: 9 },
      { wait: 10, shrink: 40, radius: 5, x: 4, z: 8, damage: 14 }
    ] });
}
export const MAPS = Object.freeze({ candy: MAP, meadow: meadowMap() });
export const getMap = id => MAPS[id] || MAPS.meadow;
export const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
export const obstacleSolid = (o, states) => { const s = states?.get?.(o.id) || states?.[o.id]; return !s?.destroyed && !(o.kind === 'gate' && s?.open); };
export function moveActor(actor, dx, dz, dt, map = MAP, states = null, speed = RULES.speed) {
  const length = Math.hypot(dx, dz);
  if (length > 1) { dx /= length; dz /= length; }
  const moveAxis = (axis, delta) => {
    actor[axis] += delta;
    for (const o of map.obstacles) {
      if (!obstacleSolid(o, states) || Math.max(actor.y || 0, actor.previousY || 0) >= o.h - .035) continue;
      const x = actor.x - o.x, z = actor.z - o.z, d = Math.hypot(x, z), limit = o.r + RULES.playerRadius;
      if (d < limit) {
        const nx = d > 0.0001 ? x / d : 1, nz = d > 0.0001 ? z / d : 0;
        actor.x = o.x + nx * limit; actor.z = o.z + nz * limit;
      }
    }
    const d = Math.hypot(actor.x, actor.z), limit = map.radius - RULES.playerRadius;
    if (d > limit) { actor.x *= limit / d; actor.z *= limit / d; }
  };
  moveAxis('x', dx * speed * dt); moveAxis('z', dz * speed * dt);
}
export function stepActor(actor, input, dt, map, states) {
  const previousY = actor.y || 0; actor.previousY = previousY;
  if (input.jump && actor.grounded) { actor.vy = RULES.jumpSpeed; actor.grounded = false; }
  actor.vy = (actor.vy || 0) - RULES.gravity * dt; actor.y = previousY + actor.vy * dt;
  moveActor(actor, input.x, input.z, dt, map, states, RULES.speed * (input.sprint ? RULES.sprintMultiplier : 1));
  let floor = 0;
  for (const o of map.obstacles) if (o.walkable && obstacleSolid(o, states) && previousY >= o.h - .04 && Math.hypot(actor.x - o.x, actor.z - o.z) < o.r + RULES.playerRadius * .5) floor = Math.max(floor, o.h);
  if (actor.y <= floor && actor.vy <= 0) { actor.y = floor; actor.vy = 0; actor.grounded = true; }
  else actor.grounded = false;
}
export function segmentCircle(ax, az, bx, bz, cx, cz, radius) {
  const dx = bx - ax, dz = bz - az, ll = dx * dx + dz * dz;
  const t = ll ? clamp(((cx - ax) * dx + (cz - az) * dz) / ll, 0, 1) : 0;
  return Math.hypot(ax + dx * t - cx, az + dz * t - cz) <= radius;
}
export function visible(ax, az, bx, bz, map = MAP, states = null, eyeHeight = 1.3) {
  return !map.obstacles.some(o => obstacleSolid(o, states) && o.h > eyeHeight && segmentCircle(ax, az, bx, bz, o.x, o.z, o.r + 0.1));
}
export function zoneAt(map, time) {
  let radius = map.id === 'candy' ? 30 : map.radius - 3, x = 0, z = 0, elapsed = Math.max(0, time);
  for (let i = 0; i < map.zones.length; i++) {
    const p = map.zones[i];
    if (elapsed < p.wait + p.shrink) {
      const t = clamp((elapsed - p.wait) / p.shrink, 0, 1);
      return { x: x + (p.x - x) * t, z: z + (p.z - z) * t, radius: radius + (p.radius - radius) * t,
        nextX: p.x, nextZ: p.z, nextRadius: p.radius, phase: i + 1, shrinking: elapsed >= p.wait,
        seconds: Math.ceil(elapsed < p.wait ? p.wait - elapsed : p.wait + p.shrink - elapsed), damage: p.damage };
    }
    elapsed -= p.wait + p.shrink; x = p.x; z = p.z; radius = p.radius;
  }
  return { x, z, radius, nextX: x, nextZ: z, nextRadius: radius, phase: map.zones.length, shrinking: false, seconds: 0, damage: map.zones.at(-1).damage };
}
// Earliest intersection of a swept 3D projectile with a vertical cylinder.
export function cylinderHit(ax, ay, az, bx, by, bz, cx, cz, r, low, high) {
  const dx = bx - ax, dy = by - ay, dz = bz - az, ox = ax - cx, oz = az - cz;
  let enter = 0, exit = 1; const a = dx * dx + dz * dz, b = 2 * (ox * dx + oz * dz), c = ox * ox + oz * oz - r * r;
  if (a < 1e-10) { if (c > 0) return null; }
  else { const disc = b * b - 4 * a * c; if (disc < 0) return null; const s = Math.sqrt(disc); enter = Math.max(enter, (-b - s) / (2 * a)); exit = Math.min(exit, (-b + s) / (2 * a)); }
  if (Math.abs(dy) < 1e-10) { if (ay < low || ay > high) return null; }
  else { const t1 = (low - ay) / dy, t2 = (high - ay) / dy; enter = Math.max(enter, Math.min(t1, t2)); exit = Math.min(exit, Math.max(t1, t2)); }
  return enter <= exit && exit >= 0 && enter <= 1 ? Math.max(0, enter) : null;
}
