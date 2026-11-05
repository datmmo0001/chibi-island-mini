import { SKILLS, clamp } from '../shared.js';

export function useSkill(room,p){
  const id=p.skill,definition=SKILLS[id];
  if(!p.alive||!definition||p.effectRemaining>0||p.climb)return false;
  p.skill=null;p.revealedUntil=room.time+1.5;
  if(id==='rocket'){
    const pitch=clamp(p.pitch||0,-1.1,1.1),vx=Math.sin(p.aim)*Math.cos(pitch),vz=Math.cos(p.aim)*Math.cos(pitch),vy=Math.sin(pitch);
    room.bullets.push({id:++room.bulletId,owner:p.id,weapon:'rocket',damage:65,speed:120,x:p.x+vx*.9,y:p.y+1.3,z:p.z+vz*.9,
      vx,vy,vz,life:(room.map.radius*2+30)/120,piercing:true,hitPlayers:new Set()});
    p.shots++;
  }else{
    p.effect=id;p.effectRemaining=definition.duration;
    if(id==='flight'){p.flightAltitude=(p.y||0)+8;p.grounded=false;p.vy=14;}
  }
  room.event('pickup',{player:p.id,text:`${definition.name} · ${definition.description}`});return true;
}

export function updateSkill(p,dt){
  if(!p.effect||!(p.effectRemaining>0))return;
  const activeTime=Math.min(dt,p.effectRemaining);
  if(p.effect==='regen'&&p.alive)p.hp=Math.min(100,p.hp+16*activeTime);
  p.effectRemaining=Math.max(0,p.effectRemaining-dt);
  if(p.effectRemaining<1e-8){p.effectRemaining=0;p.effect=null;}
}
