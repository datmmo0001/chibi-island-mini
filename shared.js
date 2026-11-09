export const GAME_VERSION = '0.7.2';
export const RULES = Object.freeze({ humans: 3, bots: 5, tickRate: 30, snapshotRate: 20, duration: 180, arenaRadius: 31 * Math.sqrt(5), playerRadius: 0.65, speed: 6.4, sprintMultiplier: 1.6, gravity: 25, jumpSpeed: 11.8, interactRange: 3.4, bulletSpeed: 58, damage: 16, fireInterval: 0.33, bulletLife: 1.3, reconnectSeconds: 25, markerLife: 8, markerCooldown: 3, markerRange: 18 });
export const WEAPONS = Object.freeze({
  water: { id: 'water', name: 'Súng nước', damage: 16, speed: 58, interval: .28, capacity: 18, reserve: 54, reload: 1.3, life: 1.3, spread: .018, pellets: 1, color: '#42eaff' },
  spray: { id: 'spray', name: 'Vòi phun liên thanh', damage: 10, speed: 54, interval: .12, capacity: 28, reserve: 84, reload: 1.65, life: 1.1, spread: .055, pellets: 1, color: '#ffe45b' },
  candy: { id: 'candy', name: 'Kẹo chùm', damage: 10, speed: 52, interval: .82, capacity: 6, reserve: 24, reload: 1.8, life: .64, spread: .15, pellets: 5, color: '#ff95e8' },
  bubble: { id: 'bubble', name: 'Bong bóng tầm xa', damage: 34, speed: 78, interval: .85, capacity: 8, reserve: 24, reload: 1.7, life: 1.4, spread: .008, pellets: 1, color: '#b3ff75' }
});
export const SKILLS = Object.freeze({
  dash: { name:'Lướt gió', icon:'»', duration:5, color:'#71eeff', description:'Tốc độ ×3 trong 5 giây' },
  flight: { name:'Cánh trời', icon:'↟', duration:4, color:'#d6b1ff', description:'Bật lên cao và bay trong 4 giây' },
  regen: { name:'Suối lành', icon:'✚', duration:4, color:'#89ffb4', description:'Hồi 16 máu mỗi giây trong 4 giây' },
  power: { name:'Hỏa lực', icon:'×2', duration:4, color:'#ffca6f', description:'Sát thương súng ×2 trong 4 giây' },
  rocket: { name:'Tên lửa xuyên phá', icon:'➤', duration:0, color:'#ff947b', description:'Tên lửa xuyên vật cản và người, 65 sát thương mỗi người' }
});
export const OUTFITS = [
  { id: 'bear', name: 'Gấu Caramel', color: '#c98b57', light: '#ffe3b9', accent: '#734c39' },
  { id: 'bunny', name: 'Thỏ Mây Hồng', color: '#ef9ebc', light: '#fff0ee', accent: '#c35e91' },
  { id: 'duck', name: 'Vịt Đi Mưa', color: '#f5cd55', light: '#fff3bd', accent: '#ee8746' },
  {id:'akari',name:'Akari · Hoa Anh Đào',anime:true,color:'#f4a8c2',light:'#fff1eb',accent:'#a63665',hair:'#b44b76',eye:'#8742b1'},
  {id:'ren',name:'Ren · Ninja Gió',anime:true,color:'#354d83',light:'#bfe9ef',accent:'#e65d62',hair:'#23344c',eye:'#3598a6'},
  {id:'aoi',name:'Aoi · Pháp Sư Sao',anime:true,color:'#7772c8',light:'#e6e8ff',accent:'#ecc873',hair:'#79baca',eye:'#3d76bf'},
  {id:'haru',name:'Haru · Lữ Khách Nắng',anime:true,color:'#e6ad51',light:'#fff5d7',accent:'#528275',hair:'#705444',eye:'#71954a'},
  {id:'miku',name:'Miku · Ca Sĩ Xanh Ngọc',anime:true,color:'#46525e',light:'#eef7f7',accent:'#14b8a6',hair:'#2ec4b6',eye:'#0e9fd8'},
  {id:'juanita',name:'Juanita · Chibi CC0',model:'juanita',color:'#8fce5a',light:'#fff6ec',accent:'#ef7fa8',hair:'#f2a0c4',eye:'#a03d63'},
  {id:'anna',name:'Anna · Chibi CC0',model:'anna',color:'#e8a2b8',light:'#fff2f5',accent:'#8a5a72',hair:'#e8b4c4',eye:'#7a4a5e'}
];
export const HATS = ['ears', 'cap', 'leaf'];
export const MAP = Object.freeze({
  id: 'candy', name: 'Đảo Kẹo', radius: 31 * Math.sqrt(5), duration: 180, survival: false, areaMultiplier: 5,
  obstacles: [
    { x: -8, z: -5, r: 1.8, kind: 'cake' }, { x: 8, z: 5, r: 1.8, kind: 'cake' },
    { x: 7, z: -9, r: 1.5, kind: 'rock' }, { x: -7, z: 9, r: 1.5, kind: 'rock' },
    { x: 0, z: -14, r: 1.3, kind: 'tree' }, { x: 0, z: 14, r: 1.3, kind: 'tree' },
    { x: -16, z: 0, r: 1.4, kind: 'tree' }, { x: 16, z: 0, r: 1.4, kind: 'tree' },
    { x: -16, z: -16, r: 1.7, kind: 'cake' }, { x: 16, z: 16, r: 1.7, kind: 'cake' },
    { x: -17, z: 14, r: 1.3, kind: 'rock' }, { x: 17, z: -14, r: 1.3, kind: 'rock' }
  ].map((o, id) => ({ ...o, x:o.x*Math.sqrt(5), z:o.z*Math.sqrt(5), id: `c-${id}`, h: o.kind === 'tree' ? 5 : o.kind === 'cake' ? 2.15 : 1.7, walkable: o.kind !== 'tree' })).concat(Array.from({length:40},(_,i)=>{const a=i*2.399963,r=18+Math.sqrt((i*.618034)%1)*43;return {id:`c-bush-${i}`,x:Math.sin(a)*r,z:Math.cos(a)*r,r:2.6,h:3.4,kind:'bush',solid:false,walkable:false};})).concat([
    {x:-16,z:8,hx:4.2,hz:.45},{x:-20,z:12,hx:.45,hz:4.2},
    {x:18,z:-6,hx:4.2,hz:.45},{x:22,z:-10,hx:.45,hz:4.2},
    {x:4,z:27,hx:5,hz:.45},{x:-4,z:-27,hx:5,hz:.45},
    {x:42,z:12,hx:.45,hz:5},{x:-42,z:-12,hx:.45,hz:5}
  ].map((o,i)=>({...o,id:`c-wall-${i}`,r:Math.hypot(o.hx,o.hz),h:3.3,shape:'box',kind:'barricade',walkable:true,solid:true}))),
  pickups: [{ x: 0, z: 0 }, { x: -12, z: 6 }, { x: 12, z: -6 }],
  loot: [], spawnPoints: Array.from({ length: 8 }, (_, i) => ({ x: Math.sin(i * Math.PI / 4) * 25.8 * Math.sqrt(5), z: Math.cos(i * Math.PI / 4) * 25.8 * Math.sqrt(5) })),
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
  return Object.freeze({ id: 'meadow', name: 'Đảo Cỏ Xanh', radius, duration: 600, survival: true, areaMultiplier: 20,
    obstacles: safeObstacles, loot, pickups: [], spawnPoints, regions,
    zones: [
      { wait: 55, shrink: 75, radius: 96, x: 15, z: -12, damage: 2 },
      { wait: 45, shrink: 75, radius: 64, x: 2, z: -6, damage: 4 },
      { wait: 35, shrink: 75, radius: 36, x: -8, z: 5, damage: 6 },
      { wait: 25, shrink: 75, radius: 16, x: 0, z: 8, damage: 9 },
      { wait: 20, shrink: 90, radius: 5, x: 4, z: 8, damage: 14 }
    ] });
}
function frontierMap() {
  let seed=862410;
  const random=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296;};
  const radius=31*Math.sqrt(40), obstacles=[],loot=[],structures=[];
  const add=o=>{const item={id:`f-${obstacles.length}`,walkable:true,...o};obstacles.push(item);return item;};
  const rect=(x,z,hx,hz,h,kind,extra={})=>add({x,z,hx,hz,r:Math.hypot(hx,hz),h,kind,shape:'box',...extra});
  const drop=(x,z,type,weapon,y=0)=>loot.push({id:`f-loot-${loot.length}`,x,y,z,type,weapon});
  const spawnPoints=Array.from({length:8},(_,i)=>({x:Math.sin(i*Math.PI/4)*110,z:Math.cos(i*Math.PI/4)*110}));
  const regions=spawnPoints.map((p,i)=>({x:p.x,z:p.z-18,name:['Trạm Gió','Làng Ban Mai','Đồi Lá','Vườn Mây','Bến Rừng','Trại Bình Minh','Xóm Thông','Đồi Canh'][i]}));
  function house(x,z,index){
    rect(x,z,4.2,3.4,4,'house',{color:index%2?'#cedbc3':'#e8d6ad'});
    // Ten 40 cm risers join the roof; geometry is shared by server and renderer.
    for(let i=0;i<10;i++)rect(x+2.1,z+3.85+(9-i)*.8,1.35,.42,(i+1)*.4,'stairs');
    // Two jumpable ledges are an alternative way onto the same roof.
    rect(x-6,z,1.35,1.5,1.35,'ledge');rect(x-4.8,z-1.8,1.2,1.2,2.7,'ledge');
    rect(x,z-3.2,4.2,.18,4.65,'parapet',{base:4,walkable:false});
    drop(x, z, 'weapon','bubble',4);drop(x-1.3,z,'ammo',undefined,4);
    structures.push({kind:'house',x,z,height:4});
  }
  function tower(x,z){
    rect(x,z,2.8,2.8,6.35,'tower',{base:6});
    for(const sx of [-1,1])for(const sz of [-1,1])rect(x+sx*2.4,z+sz*2.4,.17,.17,6,'post',{walkable:false});
    rect(x,z-2.7,2.8,.13,7.35,'rail',{base:6.35,walkable:false});
    for(const sx of [-1,1])rect(x+sx*2.7,z,.13,2.8,7.35,'rail',{base:6.35,walkable:false});
    add({kind:'ladder',x,z:z+3.2,r:.65,h:6.35,solid:false,walkable:false,interactive:true,topX:x,topZ:z+1.5});
    drop(x,z,'weapon','bubble',6.35);drop(x-1.4,z,'ammo',undefined,6.35);
    structures.push({kind:'tower',x,z,height:6.35});
  }
  regions.forEach((p,i)=>{
    house(p.x-13,p.z,i);tower(p.x+11,p.z-2);
    add({x:p.x+3,z:p.z+13,r:.9,h:1.2,kind:'chest',interactive:true});
    add({x:p.x-5,z:p.z+12,r:2.6,h:3.4,kind:'bush',solid:false,walkable:false});
    add({x:p.x+7,z:p.z+6,r:2.8,h:3.5,kind:'bush',solid:false,walkable:false});
    const s=spawnPoints[i];drop(s.x,s.z-2.3,'weapon','water');drop(s.x-2,s.z-2,'ammo');drop(s.x+2,s.z-2,'heal');
  });
  regions.push({x:0,z:0,name:'Làng Trung Tâm'});house(-12,0,0);tower(14,-5);
  add({x:1,z:3,r:.9,h:1.2,kind:'chest',interactive:true});drop(0,0,'weapon','spray');
  for(let i=0;i<430;i++){
    const a=random()*Math.PI*2,r=Math.sqrt(random())*(radius-8),x=Math.sin(a)*r,z=Math.cos(a)*r;
    if(spawnPoints.some(p=>Math.hypot(x-p.x,z-p.z)<10)||regions.some(p=>Math.hypot(x-p.x,z-p.z)<29)||obstacles.some(o=>Math.hypot(x-o.x,z-o.z)<o.r+4))continue;
    const kind=i%3===0?'bush':i%7===0?'chest':i%5===0?'rock':'tree';
    add({x,z,r:kind==='bush'?2.5:kind==='tree'?.8:kind==='chest'?.9:1.8,h:kind==='bush'?3.4:kind==='tree'?7:kind==='chest'?1.2:1.8,kind,
      solid:kind!=='bush',walkable:!['bush','tree'].includes(kind),interactive:kind==='chest'});
    if(i%11===0)drop(x+3,z,'weapon',['water','spray','candy','bubble'][i%4]);
  }
  return Object.freeze({id:'frontier',name:'Đảo Rừng Gió',radius,duration:600,survival:true,areaMultiplier:40,obstacles,loot,pickups:[],spawnPoints,regions,structures,
    zones:[{wait:55,shrink:75,radius:132,x:12,z:-10,damage:2},{wait:45,shrink:75,radius:86,x:2,z:-5,damage:4},
      {wait:35,shrink:75,radius:49,x:-7,z:4,damage:6},{wait:25,shrink:75,radius:22,x:0,z:7,damage:9},{wait:20,shrink:90,radius:6,x:3,z:7,damage:14}]});
}
export const MAPS = Object.freeze({ candy: MAP, meadow: meadowMap(), frontier: frontierMap() });
export const getMap = id => MAPS[id] || MAPS.meadow;
export const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
export const obstacleSolid = (o, states) => { const s = states?.get?.(o.id) || states?.[o.id]; return o.solid !== false && !s?.destroyed && !(o.kind === 'gate' && s?.open); };
export function obstacleContains(o,x,z,padding=0) {
  return o.shape==='box' ? Math.abs(x-o.x)<o.hx+padding && Math.abs(z-o.z)<o.hz+padding : Math.hypot(x-o.x,z-o.z)<o.r+padding;
}
export function concealedAt(actor,map) {
  return (actor.y||0)<.35 && map.obstacles.some(o=>o.kind==='bush'&&obstacleContains(o,actor.x,actor.z,-.45));
}
export function moveActor(actor, dx, dz, dt, map = MAP, states = null, speed = RULES.speed) {
  const length=Math.hypot(dx,dz);if(length>1){dx/=length;dz/=length;}
  // Small steps prevent the 3x dash from passing through thin walls and stair risers.
  const steps=Math.max(1,Math.ceil(speed*dt*Math.min(1,length)/.24));
  for(let step=0;step<steps;step++)for(const [axis,delta]of [['x',dx],['z',dz]]){
    if(delta===0)continue;
    actor[axis]+=delta*speed*dt/steps;
    for(const o of map.obstacles){
      const feet=Math.max(actor.y||0,actor.previousY||0);
      if(!obstacleSolid(o,states)||feet>=o.h-.035||(actor.y||0)+2.65<=(o.base||0)+1e-6)continue;
      if(!obstacleContains(o,actor.x,actor.z,RULES.playerRadius))continue;
      if(o.walkable&&actor.grounded&&o.h-feet<=.42){actor.y=o.h;actor.previousY=o.h;actor.vy=0;continue;}
      if(o.shape==='box'){
        const half=axis==='x'?o.hx:o.hz,side=actor[axis]>=o[axis]?1:-1;
        actor[axis]=o[axis]+side*(half+RULES.playerRadius);
      }else{
        const x=actor.x-o.x,z=actor.z-o.z,d=Math.hypot(x,z),limit=o.r+RULES.playerRadius;
        actor.x=o.x+(d>.0001?x/d:1)*limit;actor.z=o.z+(d>.0001?z/d:0)*limit;
      }
    }
    const d=Math.hypot(actor.x,actor.z),limit=map.radius-RULES.playerRadius;
    if(d>limit){actor.x*=limit/d;actor.z*=limit/d;}
  }
}
export function stepActor(actor,input,dt,map,states){
  const previousY=actor.y||0;actor.previousY=previousY;
  if(actor.climb){
    if(input.jump){actor.climb=null;actor.vy=RULES.jumpSpeed;actor.grounded=false;}
    else {const c=actor.climb,delta=c.toY-actor.y,step=3.2*dt;actor.x=c.x;actor.z=c.z;actor.grounded=false;actor.vy=0;
      if(Math.abs(delta)<=step){actor.y=c.toY;actor.x=c.exitX;actor.z=c.exitZ;actor.climb=null;actor.grounded=true;}
      else actor.y+=Math.sign(delta)*step;return;}
  }
  const flying=actor.effect==='flight'&&actor.effectRemaining>0;
  if(flying){actor.vy=Math.max(0,Math.min(14,((actor.flightAltitude||8)-previousY)*5));actor.grounded=false;}
  else {if(input.jump&&actor.grounded){actor.vy=RULES.jumpSpeed;actor.grounded=false;}actor.vy=(actor.vy||0)-RULES.gravity*dt;}
  actor.y=previousY+actor.vy*dt;
  for(const o of map.obstacles)if((o.base||0)>0&&obstacleSolid(o,states)&&obstacleContains(o,actor.x,actor.z,RULES.playerRadius*.5)&&previousY+2.65<=o.base+.04&&actor.y+2.65>=o.base&&actor.vy>0){actor.y=o.base-2.65;actor.vy=0;}
  const boost=actor.effect==='dash'&&actor.effectRemaining>0?3:1;
  moveActor(actor,input.x,input.z,dt,map,states,RULES.speed*(input.sprint?RULES.sprintMultiplier:1)*boost*(input.aiming?.65:1));
  // Stop upward motion at the underside of a raised platform.
  for(const o of map.obstacles)if((o.base||0)>0&&obstacleSolid(o,states)&&obstacleContains(o,actor.x,actor.z,RULES.playerRadius*.5)&&previousY+2.65<=o.base+.04&&actor.y+2.65>=o.base&&actor.vy>0){actor.y=o.base-2.65;actor.vy=0;}
  let floor=0;
  for(const o of map.obstacles)if(o.walkable&&obstacleSolid(o,states)&&Math.max(previousY,actor.previousY)>=o.h-.04&&obstacleContains(o,actor.x,actor.z,RULES.playerRadius*.5))floor=Math.max(floor,o.h);
  if(actor.y<=floor&&actor.vy<=0){actor.y=floor;actor.vy=0;actor.grounded=true;}else actor.grounded=false;
}
export function segmentCircle(ax, az, bx, bz, cx, cz, radius) {
  const dx = bx - ax, dz = bz - az, ll = dx * dx + dz * dz;
  const t = ll ? clamp(((cx - ax) * dx + (cz - az) * dz) / ll, 0, 1) : 0;
  return Math.hypot(ax + dx * t - cx, az + dz * t - cz) <= radius;
}
export function visible(ax, az, bx, bz, map = MAP, states = null, eyeHeight = 1.3) {
  return !map.obstacles.some(o => obstacleSolid(o, states) && obstacleHit(ax,eyeHeight,az,bx,eyeHeight,bz,o,.1)!==null);
}
export function zoneAt(map, time) {
  let radius = map.id === 'candy' ? map.radius-1 : map.radius - 3, x = 0, z = 0, elapsed = Math.max(0, time);
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

// Shared box/cylinder ray tests keep cover, the camera and server projectiles aligned.
export function obstacleHit(ax,ay,az,bx,by,bz,o,padding=0){
  if(o.shape!=='box')return cylinderHit(ax,ay,az,bx,by,bz,o.x,o.z,o.r+padding,o.base||0,o.h);
  let enter=0,exit=1;
  for(const [a,b,low,high]of [[ax,bx,o.x-o.hx-padding,o.x+o.hx+padding],[ay,by,o.base||0,o.h],[az,bz,o.z-o.hz-padding,o.z+o.hz+padding]]){
    const d=b-a;if(Math.abs(d)<1e-10){if(a<low||a>high)return null;}
    else{const t1=(low-a)/d,t2=(high-a)/d;enter=Math.max(enter,Math.min(t1,t2));exit=Math.min(exit,Math.max(t1,t2));if(enter>exit)return null;}
  }return enter<=exit&&exit>=0&&enter<=1?Math.max(0,enter):null;
}
