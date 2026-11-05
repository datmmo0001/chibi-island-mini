// The same actor is reused across deaths. Remove its old death effect before
// accepting the live snapshot, and snap to the server's new spawn location.
export function resetRespawnVisual(actor,player,dispose){
  if(!player.alive||actor.userData.deadAt===null)return false;
  const effect=actor.userData.deathVisual;
  if(effect){actor.remove(effect);dispose(effect);}
  actor.userData.deathVisual=null;actor.userData.deadAt=null;
  actor.position.set(player.x,player.y||0,player.z);
  actor.rotation.x=0;actor.rotation.z=0;actor.visible=true;
  return true;
}
