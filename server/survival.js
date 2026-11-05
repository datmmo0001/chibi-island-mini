import { RULES, WEAPONS, cylinderHit, obstacleSolid } from '../shared.js';

export const activeWeapon = p => p.inventory?.[p.slot || 0] || null;
export function resetWorld(room) {
  room.obstacles = new Map(room.map.obstacles.map(o => [o.id, { id: o.id, open: false, destroyed: false, hp: o.hp || 0, maxHp: o.hp || 0 }]));
  room.loot = room.map.loot.map(p => ({ ...p, active: true })); room.lootId = room.loot.length;
}
export function addLoot(room, x, y, z, type, weapon) {
  const p = { id: `drop-${++room.lootId}`, x, y, z, type, weapon, active: true }; room.loot.push(p); return p;
}
export function equipLoot(room, p, loot) {
  if (!loot.active || !p.alive || Math.hypot(p.x - loot.x, p.z - loot.z) > RULES.interactRange || Math.abs(p.y - loot.y) > 2) return false;
  if (loot.type === 'weapon') {
    const definition = WEAPONS[loot.weapon]; if (!definition) return false;
    const existing = p.inventory.find(w => w.id === loot.weapon);
    if (existing) { existing.reserve = Math.min(240, existing.reserve + definition.capacity * 2); }
    else {
      const gun = { id: definition.id, mag: definition.capacity, reserve: definition.reserve + (p.ammoBonus || 0) }; p.ammoBonus = 0;
      if (p.inventory.length < 2) { p.inventory.push(gun); p.slot = p.inventory.length - 1; }
      else { addLoot(room, p.x + 1.5, p.y, p.z, 'weapon', activeWeapon(p).id); p.inventory[p.slot] = gun; }
      p.reload = 0;
    }
    room.event('pickup', { player: p.id, text: `Đã nhặt ${definition.name}` });
  } else if (loot.type === 'ammo') {
    if (p.inventory.length) for (const w of p.inventory) w.reserve = Math.min(240, w.reserve + WEAPONS[w.id].capacity * 2);
    else p.ammoBonus = Math.min(120, (p.ammoBonus || 0) + 36);
    room.event('pickup', { player: p.id, text: 'Đã nhặt thêm nước tiếp đạn' });
  } else if (loot.type === 'heal') {
    if (p.hp < 85) p.hp = Math.min(100, p.hp + 35);
    else if (p.medkits < 3) p.medkits++; else return false;
    room.event('pickup', { player: p.id, text: 'Đã nhặt bình hồi phục' });
  } else return false;
  loot.active = false; return true;
}
export function interact(room, p) {
  const loot = room.loot.filter(l => l.active && Math.abs(l.y - p.y) < 2 && Math.hypot(l.x - p.x, l.z - p.z) <= RULES.interactRange)
    .sort((a, b) => Math.hypot(a.x - p.x, a.z - p.z) - Math.hypot(b.x - p.x, b.z - p.z))[0];
  const obstacle = room.map.obstacles.filter(o => o.interactive && Math.abs(p.y) < o.h + 1.5 && Math.hypot(p.x - o.x, p.z - o.z) <= o.r + RULES.interactRange && !room.obstacles.get(o.id)?.destroyed && !(o.kind === 'chest' && room.obstacles.get(o.id)?.open))
    .sort((a, b) => Math.hypot(a.x - p.x, a.z - p.z) - Math.hypot(b.x - p.x, b.z - p.z))[0];
  if (loot && (!obstacle || Math.hypot(loot.x-p.x,loot.z-p.z) < Math.hypot(obstacle.x-p.x,obstacle.z-p.z)-obstacle.r+.5) && equipLoot(room, p, loot)) return;
  if (!obstacle) return;
  const s = room.obstacles.get(obstacle.id);
  if (obstacle.kind === 'chest') {
    s.open = true;
    const ids = Object.keys(WEAPONS), weapon = ids[Math.floor(room.random() * ids.length)];
    addLoot(room, obstacle.x, 0, obstacle.z - obstacle.r - 1.2, 'weapon', weapon);
    addLoot(room, obstacle.x + 1.5, 0, obstacle.z - obstacle.r - 1.3, 'ammo');
    addLoot(room, obstacle.x - 1.5, 0, obstacle.z - obstacle.r - 1.3, 'heal');
    room.event('pickup', { player: p.id, text: 'Đã mở hòm tiếp tế · nhặt đồ ở phía trước hòm' });
  } else if (obstacle.kind === 'gate') {
    if (s.open && [...room.players.values()].some(q => q.alive && q.y < obstacle.h && Math.hypot(q.x - obstacle.x, q.z - obstacle.z) < obstacle.r + RULES.playerRadius)) return;
    s.open = !s.open; room.event('pickup', { player: p.id, text: s.open ? 'Đã mở cổng' : 'Đã đóng cổng' });
  }
}
export function reloadWeapon(p) {
  const w = activeWeapon(p); if (!w || p.reload > 0 || !w.reserve || w.mag >= WEAPONS[w.id].capacity) return;
  p.reload = WEAPONS[w.id].reload;
}
export function updateWeapon(p, dt) {
  if (p.reload > 0) {
    p.reload = Math.max(0, p.reload - dt);
    if (p.reload === 0) { const w = activeWeapon(p); if (w) { const n = Math.min(WEAPONS[w.id].capacity - w.mag, w.reserve); w.mag += n; w.reserve -= n; } }
  }
  p.cooldown = Math.max(0, p.cooldown - dt); p.healCooldown = Math.max(0, p.healCooldown - dt);
}
export function healPlayer(p) { if (p.medkits > 0 && p.hp < 100 && p.healCooldown <= 0) { p.medkits--; p.hp = Math.min(100, p.hp + 35); p.healCooldown = 2; } }
export function shoot(room, p) {
  const gun = activeWeapon(p); if (!gun || p.cooldown > 0 || p.reload > 0 || !p.alive) return;
  if (gun.mag <= 0) { reloadWeapon(p); return; }
  const w = WEAPONS[gun.id]; if (room.map.survival) gun.mag--;
  p.cooldown = w.interval * (p.bot ? 1.35 : 1); p.shots++;
  const muzzleY = p.y + 1.25;
  for (let i = 0; i < w.pellets; i++) {
    const angle = p.aim + (room.random() - .5) * w.spread * 2, pitch = (p.pitch || 0) + (room.random() - .5) * w.spread;
    const vx = Math.sin(angle) * Math.cos(pitch), vz = Math.cos(angle) * Math.cos(pitch), vy = Math.sin(pitch);
    room.bullets.push({ id: ++room.bulletId, owner: p.id, weapon: gun.id, damage: w.damage, speed: w.speed,
      x: p.x + vx * .86 - Math.cos(p.aim) * .42, y: muzzleY + vy * .86, z: p.z + vz * .86 + Math.sin(p.aim) * .42, vx, vy, vz, life: w.life });
  }
}
export function advanceBullets(room, dt) {
  room.bullets = room.bullets.filter(b => {
    const x = b.x + b.vx * b.speed * dt, y = b.y + b.vy * b.speed * dt, z = b.z + b.vz * b.speed * dt;
    let hit = null, first = 2;
    for (const o of room.map.obstacles) if (obstacleSolid(o, room.obstacles)) {
      const t = cylinderHit(b.x, b.y, b.z, x, y, z, o.x, o.z, o.r + .1, 0, o.h);
      if (t !== null && t < first) { first = t; hit = { obstacle: o }; }
    }
    for (const p of room.players.values()) if (p.alive && p.id !== b.owner) {
      const t = cylinderHit(b.x, b.y, b.z, x, y, z, p.x, p.z, RULES.playerRadius + .1, p.y + .15, p.y + 2.6);
      if (t !== null && t < first) { first = t; hit = { player: p }; }
    }
    if (hit) {
      if (hit.player) { room.damage(hit.player, b.damage, b.owner); room.event('hit', { attacker: b.owner, player: hit.player.id }); }
      else if (hit.obstacle.destructible) {
        const s = room.obstacles.get(hit.obstacle.id); s.hp -= b.damage;
        if (s.hp <= 0 && !s.destroyed) { s.destroyed = true; addLoot(room, hit.obstacle.x, 0, hit.obstacle.z, 'ammo'); if (room.random() > .45) addLoot(room, hit.obstacle.x + 1.2, 0, hit.obstacle.z, 'heal'); }
      }
      return false;
    }
    b.x = x; b.y = y; b.z = z; b.life -= dt;
    return b.life > 0 && y >= .02 && Math.hypot(x, z) < room.map.radius + 2;
  });
}
