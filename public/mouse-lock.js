// Request only from a player gesture. Escape and browser/system exits stay available.
export function createMouseLock({canvas,doc=document,isPlayable,rotate,resetInput,notify}){
  let pending=false,failed=false;
  const locked=()=>doc.pointerLockElement===canvas;
  const sync=()=>{pending=false;doc.body.classList.toggle('mouse-locked',locked());resetInput();};
  const fail=error=>{pending=false;failed=true;if(error?.name)console.warn(`Pointer lock: ${error.name}: ${error.message||''}`);notify('Trình duyệt chưa cho khóa chuột. Bạn vẫn có thể giữ chuột phải để xoay; thử mở game trực tiếp trong Chrome hoặc Edge.');};
  doc.addEventListener('pointerlockchange',sync);
  doc.addEventListener('pointerlockerror',()=>{if(!failed)fail();});
  doc.addEventListener('mousemove',event=>{if(locked()&&isPlayable())rotate(event.movementX||0,event.movementY||0);});
  return {
    locked,
    request(){
      if(locked()||pending||!isPlayable())return true;
      if(!canvas.requestPointerLock){if(!failed)fail();return false;}
      if(failed)return false;
      pending=true;
      try {const result=canvas.requestPointerLock();result?.catch(error=>{if(!failed)fail(error);});}catch(error){fail(error);return false;}
      return true;
    },
    release(){if(locked())doc.exitPointerLock?.();},
    retry(){failed=false;}
  };
}
