import { randomBytes } from 'node:crypto';
import { RULES, OUTFITS, HATS, WEAPONS, getMap, clamp, stepActor, visible, zoneAt, obstacleSolid, obstacleContains, concealedAt } from '../shared.js';
import { activeWeapon, resetWorld, equipLoot, interact, reloadWeapon, updateWeapon, healPlayer, shoot, advanceBullets } from './survival.js';

import { useSkill, updateSkill } from './skills.js';

const botNames = ['Bông Gòn', 'Kẹo Dẻo', 'Mít Ướt', 'Bắp Rang', 'Mây Nhỏ', 'Nấm Lùn', 'Su Kem'];
const emptyInput = () => ({ x: 0, z: 0, aim: 0, pitch: 0, fire: false, sprint: false });
const emptyActions = () => ({ jump: false, interact: false, reload: false, swap: false, heal: false, skill: false });
export class Room {
  constructor(code, hostId, { random = Math.random, mode = 'party', mapId = 'candy', capacity=3, respawn=false, teamSize=0 } = {}) {
    this.teamSize=[2,3,4,5].includes(teamSize)&&mode!=='solo'?teamSize:0;
    this.capacity=capacity===5?5:mapId==='frontier'&&capacity===20?20:3;this.respawn=mapId==='candy'&&respawn===true;this.code = code; this.hostId = hostId; this.random = random; this.phase = 'lobby';
    if(this.teamSize)this.capacity=this.teamSize*2;
    this.mode = mode === 'solo' ? 'solo' : 'party';
    this.map = getMap(mapId); this.duration = this.map.duration;
    this.players = new Map(); this.bullets = []; this.events = []; this.time = 0;
    this.round = 0; this.seq = 0; this.bulletId = 0; this.winner = null;
    this.markers = []; this.markerSeq = 0;
    this.pickups = this.map.pickups.map((p, id) => ({ ...p, id, active: true, cooldown: 0 }));
    resetWorld(this);
    this.emptySince = null; this.createdAt = Date.now();
  }
  humans() { return [...this.players.values()].filter(p => !p.bot); }
  addHuman(id, name, outfit = 'bear', hat = 'ears') {
    if (this.phase !== 'lobby') throw new Error('Trận đang diễn ra. Hãy chờ trận tiếp theo.');
    if (this.mode === 'solo' && this.humans().length) throw new Error('Đây là trận chơi riêng. Hãy tạo phòng cùng bạn để mời thêm người.');
    if (this.humans().length >= this.capacity) throw new Error(`Phòng đã đủ ${this.capacity} người chơi.`);
    const p = { id, name: String(name || 'Bạn nhỏ').trim().slice(0, 18) || 'Bạn nhỏ', bot: false,
      outfit: OUTFITS.some(o => o.id === outfit) ? outfit : 'bear', hat: HATS.includes(hat) ? hat : 'ears',
      x: 0, y: 0, z: 0, aim: 0, hp: 100, alive: true, kills: 0, ready: false, inventory: [], slot: 0,
      connected: true, disconnectedFor: 0, cooldown: 0, input: emptyInput(), lastInput: 0, moving: false };
    if(this.teamSize){const counts=[1,2].map(t=>this.humans().filter(q=>q.team===t).length);p.team=counts[0]<this.teamSize&&counts[0]<=counts[1]?1:2;}
    this.players.set(id, p); return p;
  }
  configure(id, data) {
    if (this.phase !== 'lobby') return;
    const p = this.players.get(id); if (!p || p.bot) return;
    if (OUTFITS.some(o => o.id === data.outfit)) p.outfit = data.outfit;
    if (HATS.includes(data.hat)) p.hat = data.hat;
    if(this.teamSize&&[1,2].includes(data.team)&&data.team!==p.team){if(this.humans().filter(q=>q.team===data.team).length>=this.teamSize)throw new Error('Đội đã đủ người.');p.team=data.team;p.ready=false;}
    if (typeof data.ready === 'boolean') p.ready = data.ready;
  }
  start(id) {
    if (id !== this.hostId) throw new Error('Chỉ chủ phòng có thể bắt đầu.');
    if (this.phase !== 'lobby') throw new Error('Trận đã bắt đầu.');
    if (!this.humans().length || !this.humans().every(p => p.ready && p.connected))
      throw new Error('Cần ít nhất một người chơi và tất cả bấm Sẵn sàng.');
    this.round++; this.time = 0; this.phase = 'playing'; this.bullets = []; this.events = []; this.winner = null; this.markers = [];
    resetWorld(this);
    const fillCount = (this.teamSize?this.capacity:this.capacity===20?20:8) - this.humans().length;
    for (let i = 0; i < fillCount; i++) this.players.set(`bot-${i}`, {
      id: `bot-${i}`, name: botNames[i%botNames.length]+(i>=botNames.length?` ${Math.floor(i/botNames.length)+1}`:""), bot: true, outfit: OUTFITS[i % 3].id, hat: HATS[i % 3],
      connected: true, ready: true, input: emptyInput(), decision: 0, drift: this.random() * Math.PI * 2
    });
    if(this.teamSize){for(const p of this.players.values())if(p.bot){p.team=[1,2].find(t=>[...this.players.values()].filter(q=>q.team===t).length<this.teamSize);}}
    [...this.players.values()].forEach((p, i) => {
      const spawn = this.capacity===20?{x:Math.sin(i*Math.PI/10)*170,z:Math.cos(i*Math.PI/10)*170}:{...this.map.spawnPoints[i%this.map.spawnPoints.length]};
      if(this.capacity===20){for(let n=0;n<80&&this.map.obstacles.some(o=>obstacleSolid(o,this.obstacles)&&obstacleContains(o,spawn.x,spawn.z,1));n++){spawn.x*=.985;spawn.z*=.985;}}
      if(this.teamSize){const mates=[...this.players.values()].filter(q=>q.team===p.team),index=mates.indexOf(p);const center=this.map.spawnPoints[p.team===1?0:Math.floor(this.map.spawnPoints.length/2)];let found=false;for(let n=0;n<100;n++){const angle=n*2.39996+index*1.2,r=2+index*2+n*.15;const x=center.x+Math.sin(angle)*r,z=center.z+Math.cos(angle)*r;if(Math.hypot(x,z)<this.map.radius-2&&!this.map.obstacles.some(o=>obstacleSolid(o,this.obstacles)&&obstacleContains(o,x,z,1))&&!mates.slice(0,index).some(q=>Math.hypot(q.x-x,q.z-z)<1.5)){spawn.x=x;spawn.z=z;found=true;break;}}if(!found){spawn.x=center.x;spawn.z=center.z;}}
      Object.assign(p, { x: spawn.x, y: 0, z: spawn.z, vy: 0, previousY: 0, grounded: true, aim: Math.PI, pitch: 0,
        hp: 100, alive: true, kills: 0, cooldown: 0.6 + this.random(), input: emptyInput(), actions: emptyActions(), lastInput: 0, moving: false,
        sprinting: false, shots: 0, reload: 0, slot: 0, medkits: 0, healCooldown: 0, ammoBonus: 0, scope: false, skill: null, effect: null, effectRemaining: 0, climb: null, concealed: false, revealedUntil: 0, lastMarkerAt: -Infinity,
        inventory: this.map.survival ? [] : [{ id: 'water', mag: WEAPONS.water.capacity, reserve: 999 }] });
    });
    this.pickups.forEach(p => { p.active = true; p.cooldown = 0; });
    this.event('start', { text: 'Trận đấu bắt đầu!' });
  }
  setInput(id, data) {
    const p = this.players.get(id); if (!p || p.bot || !p.connected || this.phase !== 'playing') return;
    // Never accept positions, health, targets, kills, or timestamps from a client.
    if (![data.x, data.z, data.aim].every(Number.isFinite)) return;
    p.input = { x: clamp(data.x, -1, 1), z: clamp(data.z, -1, 1), aim: data.aim % (Math.PI * 2), pitch: Number.isFinite(data.pitch) ? clamp(data.pitch, -1.1, 1.1) : 0, fire: data.fire === true, sprint: data.sprint === true, aiming: data.aiming === true && p.scope === true && !!activeWeapon(p) };
    for (const key of Object.keys(p.actions)) if (data[key] === true) p.actions[key] = true;
    p.lastInput = this.time;
  }
  disconnect(id) {
    const p = this.players.get(id); if (!p) return;
    if (this.phase === 'lobby') this.players.delete(id);
    else { p.connected = false; p.disconnectedFor = 0; p.input = emptyInput(); p.actions = emptyActions(); }
    if (this.hostId === id) this.hostId = this.humans().find(p => p.connected)?.id ?? id;
  }
  resume(id) {
    const p = this.players.get(id); if (!p || p.bot) return false;
    if (p.disconnectedFor >= RULES.reconnectSeconds) return false;
    p.connected = true; p.disconnectedFor = 0; p.input = emptyInput(); return true;
  }
  leave(id) {
    const p = this.players.get(id); if (!p) return;
    if (this.phase === 'playing' && p.alive) this.damage(p, 1000, null);
    this.players.delete(id);
    this.markers = this.markers.filter(m => m.player !== id);
    if (this.hostId === id) this.hostId = this.humans().find(p => p.connected)?.id ?? null;
  }
  backToLobby(id) {
    if (this.hostId !== id) throw new Error('Chỉ chủ phòng có thể mở trận mới.');
    if (this.phase !== 'finished') return;
    this.phase = 'lobby'; this.bullets = []; this.events = []; this.markers = [];
    for (const [pid, p] of this.players) {
      if (p.bot || !p.connected) this.players.delete(pid);
      else Object.assign(p, { ready: false, alive: true, hp: 100, kills: 0, input: emptyInput() });
    }
  }
  zone() { if(this.respawn)return {x:0,z:0,radius:this.map.radius,nextX:0,nextZ:0,nextRadius:this.map.radius,phase:1,shrinking:false,seconds:0,damage:0};return zoneAt(this.map, this.phase === 'lobby' ? 0 : this.time); }
  placeMarker(id, aim) {
    const p = this.players.get(id);
    if (this.phase !== 'playing' || !p || p.bot || !p.alive || !p.connected) throw new Error('Chỉ đánh dấu khi bạn đang trong trận.');
    if (!Number.isFinite(aim)) throw new Error('Hướng đánh dấu không hợp lệ.');
    if (this.time - p.lastMarkerAt < RULES.markerCooldown) throw new Error('Chờ một chút trước khi đánh dấu tiếp nhé.');
    const angle = aim % (Math.PI * 2);
    let x = p.x + Math.sin(angle) * RULES.markerRange, z = p.z + Math.cos(angle) * RULES.markerRange;
    const distance = Math.hypot(x, z), limit = this.map.radius - 2;
    if (distance > limit) { x *= limit / distance; z *= limit / distance; }
    p.lastMarkerAt = this.time;
    const marker = { id: ++this.markerSeq, player: id, name: p.name, x, z, expiresAt: this.time + RULES.markerLife };
    this.markers = [...this.markers.filter(m => m.player !== id && m.expiresAt > this.time), marker];
    this.event('marker', { player: id, text: `${p.name} đã đánh dấu một vị trí`, at: this.time });
    return marker;
  }
  radius() { return this.zone().radius; }
  event(type, data) { this.events.push({ id: ++this.seq, type, at:this.time, ...data }); if (this.events.length > 30) this.events.shift(); }
  damage(p, amount, attacker) {
    if (!p.alive || (attacker&&this.teamSize&&this.players.get(attacker)?.team===p.team)) return;
    p.hp = Math.max(0, p.hp - amount);
    if (p.hp <= 0) {
      p.alive = false; p.moving = false;p.respawnAt=this.time+3;
      const by = this.players.get(attacker); if (by) by.kills++;
      this.event('out', { player: p.id, attacker, kills:by?.kills||0, text: `${p.name} đã bay lên trời${by ? ` · ${by.name}` : ''}` });
    }
  }
  botInput(p, dt) {
    p.decision -= dt; if (p.decision > 0) return;
    p.decision = .18 + this.random() * .13;
    const zone = this.zone(), gun = activeWeapon(p);
    const targets = [...this.players.values()].filter(q => q.id !== p.id && (!this.teamSize||q.team!==p.team) && q.alive && (!q.concealed || Math.hypot(q.x-p.x,q.z-p.z)<5));
    targets.sort((a, b) => Math.hypot(a.x - p.x, a.z - p.z) - Math.hypot(b.x - p.x, b.z - p.z));
    const lineOfSight = q => visible(p.x, p.z, q.x, q.z, this.map, this.obstacles, Math.min(p.y + 1.3, q.y + 1.3));
    const target = targets.find(q => Math.hypot(q.x - p.x, q.z - p.z) < 45 && lineOfSight(q)) || targets[0];
    const nearestLoot = this.loot.filter(l => l.active && ((!gun && l.type === 'weapon') || (gun && gun.reserve < 12 && l.type === 'ammo') || (p.hp < 60 && l.type === 'heal') || (!p.skill && l.type === 'skill')))
      .sort((a, b) => Math.hypot(a.x - p.x, a.z - p.z) - Math.hypot(b.x - p.x, b.z - p.z))[0];
    let gx = 0, gz = 0;
    if (Math.hypot(p.x - zone.x, p.z - zone.z) > zone.radius - 6) { gx = zone.x - p.x; gz = zone.z - p.z; }
    else if (nearestLoot && (!gun || Math.hypot(nearestLoot.x - p.x, nearestLoot.z - p.z) < 28)) {
      gx = nearestLoot.x - p.x; gz = nearestLoot.z - p.z;
      if (Math.hypot(gx, gz) <= RULES.interactRange) p.actions.interact = true;
    } else if (target) {
      const dx = target.x - p.x, dz = target.z - p.z, d = Math.hypot(dx, dz) || 1;
      const approach = d > 15 ? 1 : d < 7 ? -1 : 0; p.drift += .19;
      gx = dx / d * approach - dz / d * Math.sin(p.drift) * .65;
      gz = dz / d * approach + dx / d * Math.sin(p.drift) * .65;
    }
    const length = Math.hypot(gx, gz) || 1; gx /= length; gz /= length;
    const blocker = this.map.obstacles.find(o => obstacleSolid(o, this.obstacles) && p.y < o.h - .04 && obstacleContains(o,p.x+gx*2,p.z+gz*2,RULES.playerRadius));
    if (blocker?.walkable && blocker.h < p.y + 2.5 && p.grounded) p.actions.jump = true;
    else if (blocker) {
      if (blocker.kind === 'gate') p.actions.interact = true;
      const base = Math.atan2(gx, gz);
      for (const turn of [.65, -.65, 1.2, -1.2, 1.8, -1.8, Math.PI]) {
        const x = Math.sin(base + turn), z = Math.cos(base + turn);
        if (!this.map.obstacles.some(o => obstacleSolid(o, this.obstacles) && p.y < o.h - .04 && obstacleContains(o,p.x+x*2.1,p.z+z*2.1,RULES.playerRadius))) { gx = x; gz = z; break; }
      }
    }
    const d = target ? Math.hypot(target.x - p.x, target.z - p.z) : 100;
    p.input = { x: gx * .8, z: gz * .8, aim: target ? Math.atan2(target.x - p.x, target.z - p.z) + (this.random() - .5) * .16 : p.aim,
      pitch: target ? Math.atan2(target.y - p.y, d) : 0, sprint: !gun || d > 28 || Math.hypot(p.x - zone.x, p.z - zone.z) > zone.radius - 10,
      fire: !!gun && !!target && d < (WEAPONS[gun.id].speed * WEAPONS[gun.id].life * .85) && lineOfSight(target) && this.random() > .18 };
    if (p.hp < 65) p.actions.heal = true;
    if(p.skill&&p.effectRemaining<=0&&(p.hp<70||d<30))p.actions.skill=true;
    if (gun && gun.mag < 2) p.actions.reload = true;
  }
  tick(dt) {
    if (this.phase !== 'playing') return;
    this.time += dt; const zone = this.zone();
    this.markers = this.markers.filter(m => m.expiresAt > this.time);
    for (const p of this.players.values()) {
      if (!p.bot && !p.connected) {
        p.disconnectedFor += dt;
        if (p.disconnectedFor >= RULES.reconnectSeconds && p.alive) this.damage(p, 1000, null);
      }
      if(!p.alive&&this.respawn&&p.connected&&this.time+1e-6>=p.respawnAt){
        let spawn=null;for(let n=0;n<64;n++){const a=(this.random()+n*.618034)*Math.PI*2,r=Math.sqrt(this.random())*(this.map.radius-4),x=Math.sin(a)*r,z=Math.cos(a)*r;if(!this.map.obstacles.some(o=>obstacleContains(o,x,z,1))){spawn={x,z};break;}}
        spawn ||= this.map.spawnPoints[Math.floor(this.random()*this.map.spawnPoints.length)];
        Object.assign(p,{...spawn,y:0,previousY:0,vy:0,hp:100,alive:true,grounded:true,moving:false,sprinting:false,climb:null,effect:null,effectRemaining:0,concealed:false,reload:0,cooldown:1,input:emptyInput(),actions:emptyActions()});
      }
      if (!p.alive) continue;
      if (p.bot) this.botInput(p, dt);
      else if (!p.connected || this.time - p.lastInput > .5) { p.input = emptyInput(); p.actions = emptyActions(); }
      const input = p.input, actions = p.actions;
      p.aim = input.aim; p.pitch = input.pitch || 0; p.moving = Math.hypot(input.x, input.z) > .1; p.sprinting = p.moving && input.sprint;
      if(actions.skill)useSkill(this,p);
      stepActor(p, { ...input, jump: actions.jump }, dt, this.map, this.obstacles);
      if (Math.hypot(p.x - zone.x, p.z - zone.z) > zone.radius) this.damage(p, dt * zone.damage, null);
      if (actions.interact) interact(this, p);
      if (actions.swap && p.inventory.length > 1) { p.slot = (p.slot + 1) % p.inventory.length; p.reload = 0; }
      if (actions.reload) reloadWeapon(p);
      if (actions.heal) {const hp=p.hp;healPlayer(p);if(p.hp>hp)this.event('heal',{player:p.id});}
      updateWeapon(p, dt);
      if (input.fire && !p.climb) shoot(this, p);
      updateSkill(p,dt);
      p.concealed=concealedAt(p,this.map)&&this.time>=p.revealedUntil&&!p.effect;
      if (this.map.survival) for (const l of this.loot) if (l.active && l.type !== 'weapon' && Math.abs(p.y - l.y) < 1.2 && Math.hypot(p.x - l.x, p.z - l.z) < 1.15) equipLoot(this, p, l);
      p.actions = emptyActions();
    }
    advanceBullets(this, dt);
    for (const pickup of this.pickups) {
      if (!pickup.active) { pickup.cooldown -= dt; if (pickup.cooldown <= 0) pickup.active = true; }
      if (!pickup.active) continue;
      const p = [...this.players.values()].find(p => p.alive && p.hp < 100 && p.y < 1.5 && Math.hypot(p.x - pickup.x, p.z - pickup.z) < 1.3);
      if (p) { this.event('heal',{player:p.id});p.hp = Math.min(100, p.hp + 35); pickup.active = false; pickup.cooldown = 22; }
    }
    const alive = [...this.players.values()].filter(p => p.alive);
    if(this.teamSize){
      const standing=new Set(alive.map(p=>p.team));
      if((!this.respawn&&standing.size<=1)||this.time>=this.duration){
        const scores=[1,2].map(team=>{const all=[...this.players.values()].filter(p=>p.team===team);return{team,kills:all.reduce((n,p)=>n+p.kills,0),alive:all.filter(p=>p.alive).length,hp:all.reduce((n,p)=>n+(p.alive?p.hp:0),0)};});
        scores.sort((a,b)=>(this.respawn?b.kills-a.kills:b.alive-a.alive)||b.hp-a.hp||b.kills-a.kills);
        const [a,b]=scores,tie=a.kills===b.kills&&a.alive===b.alive&&a.hp===b.hp;
        this.winner=tie?null:{team:a.team,name:`Đội ${a.team===1?'Xanh':'Cam'}`,kills:a.kills};
        this.phase='finished';this.bullets=[];this.event('finish',{text:this.winner?`${this.winner.name} chiến thắng!`:'Hai đội hòa nhau!'});
      }
    }else if ((!this.respawn&&alive.length <= 1) || this.time >= this.duration) {
      const winner = (this.respawn?[...this.players.values()]:alive).sort((a, b) => (this.respawn?b.kills-a.kills:0)||b.hp - a.hp || b.kills - a.kills || a.id.localeCompare(b.id))[0];
      this.phase = 'finished'; this.winner = winner ? { id: winner.id, name: winner.name, bot: winner.bot } : null;
      this.bullets = []; this.event('finish', { text: winner ? `${winner.name} chiến thắng!` : 'Hòa cả làng!' });
    }
  }
  snapshot() {
    return { type: 'state', code: this.code, phase: this.phase, mode: this.mode, capacity:this.capacity, teamSize:this.teamSize, respawn:this.respawn, hostId: this.hostId, round: this.round,
      mapId: this.map.id, duration: this.duration, time: Math.round(this.time * 100) / 100, radius: this.radius(), zone: this.zone(), winner: this.winner, markers: this.markers.map(m => ({ ...m })),
      players: [...this.players.values()].map(({ id, name, bot, team, outfit, hat, x, y, z, aim, pitch, hp, alive, kills, ready, connected, moving, grounded, sprinting, inventory, slot, reload, medkits, shots, scope, skill, effect, effectRemaining, concealed, climb }) =>
        ({ id, name, bot, team, outfit, hat, x: +x.toFixed(3), y: +(y || 0).toFixed(3), z: +z.toFixed(3), aim, pitch, hp: Math.ceil(hp), alive, kills, ready, connected, moving, grounded, sprinting, inventory, slot, reload, medkits, shots, scope, skill, effect, effectRemaining: +(effectRemaining||0).toFixed(2), concealed, climbing:!!climb })),
      bullets: this.bullets.map(({ id, owner, weapon, x, y, z, vx, vy, vz, speed }) => ({ id, owner, weapon, x, y, z, vx, vy, vz, speed })),
      loot: this.loot.filter(l => l.active), obstacles: [...this.obstacles.values()].filter(s => s.open || s.destroyed || s.hp < s.maxHp),
      pickups: this.pickups.map(({ id, x, z, active }) => ({ id, x, z, active })), events: this.events };
  }
}
export const makeId = () => randomBytes(12).toString('hex');
export const makeCode = () => Array.from(randomBytes(6), b => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[b % 32]).join('');
