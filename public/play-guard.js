export const portraitBlocked=({width,height,coarse=false,touchPoints=0,safeTop=0,safeBottom=0})=>{
 // A platform without touch points and wider than 700 is a desktop window:
 // never block it (its owner can always resize), whatever the shape.
 if(!(coarse||touchPoints>0)&&width>700)return false;
 // Usable height is what remains after the notch / gesture-bar insets: a
 // landscape shot at 915x412 with tall insets (e.g. a photo of a Galaxy A15
 // run in a portrait browser window) is really a portrait phone underneath.
 const usable=height-safeTop-safeBottom;
 // Only the portrait-browser-chrome case blocks: usable height collapses
 // under ~1/3 of the width. Real landscape phones (safe areas ~5% of the
 // width per side) always stay above that.
 return height>width||usable<width/3;
};
export const controlsBlocked=({portrait,desktop,playing,alive,locked})=>portrait||(desktop&&playing&&alive&&!locked);

export function createPlayGuard({mouseLock,resetInput,getPhase,isAlive,menusOpen,doc=document,win=window}){
  const ui=doc.getElementById('game-ui'),rotate=doc.getElementById('rotate-gate'),capture=doc.getElementById('mouse-gate'),safe=doc.getElementById('hud-safe');
  function safeInsets(){
    if(!safe||!win.getComputedStyle)return {top:0,bottom:0};
    const style=win.getComputedStyle(safe);
    return {top:parseFloat(style.paddingTop)||0,bottom:parseFloat(style.paddingBottom)||0};
  }
  let portrait=false,desktop=false,previousPortrait=null,previousCapture=null;
  function refresh(){
    const coarse=win.matchMedia('(pointer: coarse)').matches;
    desktop=win.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const insets=safeInsets();
    portrait=portraitBlocked({width:win.innerWidth,height:win.innerHeight,coarse,touchPoints:win.navigator.maxTouchPoints||0,safeTop:insets.top,safeBottom:insets.bottom});
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
