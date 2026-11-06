export const portraitBlocked=({width,height,coarse=false,touchPoints=0})=>height>width&&(coarse||touchPoints>0||width<=700);
export const controlsBlocked=({portrait,desktop,playing,alive,locked})=>portrait||(desktop&&playing&&alive&&!locked);

export function createPlayGuard({mouseLock,resetInput,getPhase,isAlive,menusOpen,doc=document,win=window}){
  const ui=doc.getElementById('game-ui'),rotate=doc.getElementById('rotate-gate'),capture=doc.getElementById('mouse-gate');
  let portrait=false,desktop=false,previousPortrait=null,previousCapture=null;
  function refresh(){
    const coarse=win.matchMedia('(pointer: coarse)').matches;
    desktop=win.matchMedia('(hover: hover) and (pointer: fine)').matches;
    portrait=portraitBlocked({width:win.innerWidth,height:win.innerHeight,coarse,touchPoints:win.navigator.maxTouchPoints||0});
    if(portrait!==previousPortrait){
      previousPortrait=portrait;rotate.hidden=!portrait;ui.inert=portrait;doc.body.classList.toggle('portrait-blocked',portrait);
      if(portrait){mouseLock.release();for(const dialog of doc.querySelectorAll('dialog[open]'))dialog.close();doc.getElementById('rotate-title').focus();}
      resetInput();
    }
    const needsCapture=!portrait&&desktop&&getPhase()==='playing'&&isAlive()&&!mouseLock.locked()&&!menusOpen();
    if(needsCapture!==previousCapture){previousCapture=needsCapture;capture.hidden=!needsCapture;if(needsCapture)resetInput();}
  }
  for(const event of ['resize','orientationchange'])win.addEventListener(event,refresh);
  for(const event of ['pointerlockchange','fullscreenchange'])doc.addEventListener(event,refresh);
  doc.getElementById('capture-mouse').onclick=()=>{mouseLock.retry();mouseLock.request();};
  refresh();
  return {refresh,isPortrait:()=>portrait,isBlocked:()=>controlsBlocked({portrait,desktop,playing:getPhase()==='playing',alive:isAlive(),locked:mouseLock.locked()})};
}
