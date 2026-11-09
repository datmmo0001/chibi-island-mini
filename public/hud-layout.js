import { USER_LANDSCAPE_HUD } from './hud-preset.js';
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
const finite = (n, fallback) => typeof n === 'number' && Number.isFinite(n) ? n : fallback;
export const HUD_LABELS = Object.freeze({ timer:'Thời gian', alive:'Số người còn lại', tools:'Nút tiện ích', compass:'La bàn', health:'Vòng máu', weapon:'Súng và đạn', minimap:'Bản đồ nhỏ', fullscreen:'Toàn màn hình', joystick:'Cần di chuyển', fire:'Nút bắn', jump:'Nút nhảy', sprint:'Nút chạy', pickup:'Nút nhặt / mở', reload:'Nút nạp đạn', swap:'Nút đổi súng', heal:'Nút hồi máu', skill:'Nút kỹ năng', scope:'Nút ống ngắm',camera:'Nút khóa camera', interaction:'Gợi ý nhặt đồ', warning:'Cảnh báo vòng bo', feed:'Thông báo trận' });
// The old grouped action row must not override the new independent arc buttons.
// Keep the old key intact as a rollback; save this revision independently.
export const HUD_STORAGE = 'chibi-hud-photo-v7';
export const layoutMode = (width, height) => width > height ? 'landscape' : 'portrait';
export function cleanLayouts(raw) {
  const result = { portrait:{}, landscape:{} };
  for (const mode of Object.keys(result)) for (const id of Object.keys(HUD_LABELS)) {
    const item = raw?.[mode]?.[id];
    if (!item || typeof item !== 'object' || Array.isArray(item)) continue;
    result[mode][id] = { x:clamp(finite(item.x,.5),0,1), y:clamp(finite(item.y,.5),0,1), scale:clamp(finite(item.scale,1),.6,1.5), opacity:clamp(finite(item.opacity,1),.25,1) };
  }
  return result;
}
export function defaultWidgets(width, height, touch = true, safe = {}) {
  const defaults=baseWidgets(width,height,touch,safe);
  if(layoutMode(width,height)==='landscape' && width-Math.max(8,safe.left||0)-Math.max(8,safe.right||0)>=780) { for(const id of ['compass','joystick','fire','jump','sprint','pickup','skill','scope']) defaults[id]={...defaults[id],...USER_LANDSCAPE_HUD[id]};
    // Camera-lock toggle hangs off the user's own scope position (right and
    // slightly down from it, clear of the joystick) so it follows wherever
    // their saved layout puts scope. Landscape only — the preset is
    // landscape-only, so this must not leak into portrait defaults.
    if(USER_LANDSCAPE_HUD.scope){const s=USER_LANDSCAPE_HUD.scope;defaults.camera={...defaults.camera,x:s.x+68/(width-Math.max(8,safe.left||0)-Math.max(8,safe.right||0)),y:s.y+28/(height-Math.max(8,safe.top||0)-Math.max(8,safe.bottom||0))};} }
  if(width>height && width-Math.max(8,safe.left||0)-Math.max(8,safe.right||0)>=700){
    // Image 7: fire at lower right, sprint above-left, skill further left.
    const positions={fire:[.907,.780],sprint:[.815,.620],skill:[.733,.665],jump:[.805,.800],pickup:[.885,.523],swap:[.952,.563],reload:[.739,.876]};
    for(const [id,[x,y]] of Object.entries(positions)) defaults[id]={...defaults[id],x,y,...(['fire','skill'].includes(id)?{scale:USER_LANDSCAPE_HUD[id].scale,opacity:USER_LANDSCAPE_HUD[id].opacity}:{})};
  }
  return defaults;
}
function baseWidgets(width, height, touch = true, safe = {}) {
  width-=Math.max(8,safe.left||0)+Math.max(8,safe.right||0);
  height-=Math.max(8,safe.top||0)+Math.max(8,safe.bottom||0);
  const portrait = layoutMode(width,height) === 'portrait', small = width < 360;
  const health = portrait ? (small ? 48 : 52) : 60;
  const weapon = Math.min(112, width/2-health/2-16-44);
  const compact = !portrait && width < 800, short = !portrait && height < 350;
  const fireX = width-(portrait?58:66), fireY = height-(portrait?180:compact?112:86);
  const mapSize=short?60:!portrait?76:88, mapX=width-(short?42:!portrait?50:56), mapY=portrait?112:short?42:46;
  const weaponX=width/2+health/2+8+weapon/2, baseY=height-38;
  const item = (x,y,w,h) => ({ x:x/width, y:y/height, width:w, height:h, scale:1, opacity:1 });
  if(!portrait&&width>=780){
    // Reference photo positions, measured within the safe rectangle.
    const healthX=width*.385, bottom=height*.865;
    const gunX=Math.max(width*.48,healthX+health/2+8+weapon/2);
    return {
      timer:item(width*.51,height*.10,80,34),compass:item(width*.51,height*.19,104,22),
      tools:item(width*.14,height*.107,140,36),alive:item(Math.max(width*.278,width*.14+128),height*.107,100,26),
      health:item(healthX,bottom,health,health),weapon:item(gunX,bottom,weapon,60),
      heal:item(healthX-health/2-30,bottom,44,44),
      reload:item(width*.739,height*.876,44,44),
      minimap:item(mapX,height*.137,mapSize,mapSize),fullscreen:item(width*.862,height*.109,40,40),
      joystick:item(width*.137,height*.756,104,104),scope:item(width*.192,height*.501,44,44),camera:item(width*.192,height*.610,44,44),
      fire:item(width*.910,height*.780,61.6,61.6),jump:item(width*.810,height*.840,52,52),
      pickup:item(width*.855,height*.559,50,50),sprint:item(width*.926,height*.538,50,50),
      skill:item(Math.min(width*.802,width*.855-55),height*.667,44,44),
      swap:item(Math.max(width*.585,gunX+weapon/2+30),bottom,44,44),
      interaction:item(width*.5,height*.64,Math.min(260,width*.34),34),
      warning:item(width*.5,height*.30,Math.min(300,width*.38),32),feed:item(width-124,height*.39,224,82)
    };
  }
  return {
    timer:item(width/2,28,80,34), alive:item(72,portrait?136:74,116,26), tools:item(82,portrait?96:30,140,36),
    compass:item(width/2,61,104,22), health:item(width/2,baseY,health,health),
    weapon:item(weaponX,baseY,weapon,60),
    heal:item(width/2-health/2-8-22,baseY,44,44),
    reload:item(weaponX+weapon/2+8+22,baseY,44,44),
    minimap:item(mapX,mapY,mapSize,mapSize),
    fullscreen:item(mapX-mapSize/2-8-(short?18:20),short?18:mapY,short?36:40,short?36:40),
    joystick:item(portrait?68:80,height-(portrait?176:80),104,104),
    fire:item(fireX,fireY,61.6,61.6),
    jump:item(fireX-74,fireY,52,52),
    sprint:item(fireX-80,fireY-56,50,50),
    pickup:item(fireX-54,fireY-110,50,50),
    swap:item(fireX,fireY-74,44,44),
    skill:item(portrait?fireX:fireX-140,portrait?fireY-166:fireY,44,44),
    scope:item(portrait?68:100,portrait?fireY-124:height-188,44,44),camera:item(portrait?152:156,portrait?190:152,40,40),
    interaction:item(compact?width*.37:width/2,compact?height/2-15:height-(touch?(portrait?(height<650?98:421):145):125),compact?Math.min(180,width*.32):Math.min(portrait?220:260,width-32),34),
    warning:item(portrait&&height<650?70:width/2,portrait?180:98,portrait&&height<650?124:Math.min(300,width-28),32),
    feed:item(width-124,portrait?244:170,224,82)
  };
}
// Store positions as fractions of the safe rectangle. Clamp the *scaled* bounds,
// including when rotating or opening a layout made on a different phone.
export function resolveWidget(item, width, height, safe = {}) {
  const left=Math.max(8,safe.left||0), right=width-Math.max(8,safe.right||0), top=Math.max(8,safe.top||0), bottom=height-Math.max(8,safe.bottom||0);
  const scale=Math.min(clamp(finite(item.scale,1),.6,1.5),(right-left)/item.width,(bottom-top)/item.height);
  const halfW=item.width*scale/2, halfH=item.height*scale/2;
  return { x:clamp(left+finite(item.x,.5)*(right-left),left+halfW,right-halfW), y:clamp(top+finite(item.y,.5)*(bottom-top),top+halfH,bottom-halfH), scale, opacity:clamp(finite(item.opacity,1),.25,1) };
}

export function createHudLayout({ store, resetInput, getPhase }) {
  const $=id=>document.getElementById(id), hud=$('hud'), editor=$('hud-editor'), select=$('hud-widget-select');
  let saved; try {
    const current=store.get(HUD_STORAGE,'');
    if(current)saved=JSON.parse(current);
    else{saved=JSON.parse(store.get('chibi-hud-user-v6','{}'));for(const id of ['fire','sprint','skill','jump','pickup','swap','reload'])if(saved?.landscape)delete saved.landscape[id];}
  } catch {}
  let layouts=cleanLayouts(saved), before=null, editing=false, selected='health', drag=null;
  const widgets=new Map([...document.querySelectorAll('[data-hud]')].map(el=>[el.dataset.hud,el]));
  const handles=new Map();
  for(const [id,label] of Object.entries(HUD_LABELS)) {
    const option=document.createElement('option'); option.value=id; option.textContent=label; select.append(option);
    const handle=document.createElement('button'); handle.className='hud-handle'; handle.dataset.widget=id; handle.setAttribute('aria-label',`Di chuyển ${label.toLocaleLowerCase('vi')}`); handle.title=label;
    const caption=document.createElement('span'); caption.textContent=label; handle.append(caption); $('hud-editor-canvas').append(handle); handles.set(id,handle);
  }
  function geometry(){const style=getComputedStyle($('hud-safe'));return {width:innerWidth,height:innerHeight,safe:{left:parseFloat(style.paddingLeft),right:parseFloat(style.paddingRight),top:parseFloat(style.paddingTop),bottom:parseFloat(style.paddingBottom)}};}
  function current(){const g=geometry(), mode=layoutMode(g.width,g.height), touch=matchMedia('(pointer:coarse)').matches||g.width<=1024;return {...g,mode,touch,defaults:defaultWidgets(g.width,g.height,touch,g.safe)};}
  function item(id,g=current()){return {...g.defaults[id],...layouts[g.mode][id]};}
  function apply(){
    const g=current(); hud.classList.toggle('hud-touch',g.touch);
    for(const [id,element] of widgets){const config=item(id,g),p=resolveWidget(config,g.width,g.height,g.safe);
      for(const el of [element,handles.get(id)]) { el.style.setProperty('--hud-x',`${p.x}px`);el.style.setProperty('--hud-y',`${p.y}px`);el.style.setProperty('--hud-scale',p.scale);el.style.setProperty('--hud-opacity',p.opacity);el.style.setProperty('--hud-width',`${config.width}px`);el.style.setProperty('--hud-height',`${config.height}px`); }
    }
    if(editing){$('hud-orientation').textContent=g.mode==='landscape'?'Bố cục ngang':'Bố cục dọc';sync();}
  }
  function sync(){const config=item(selected);select.value=selected;for(const [name,multiplier]of [['x',100],['y',100],['scale',100],['opacity',100]]){$(`hud-${name}`).value=Math.round(config[name]*multiplier);$(`hud-${name}-value`).textContent=`${Math.round(config[name]*multiplier)}%`;}for(const [id,handle]of handles){handle.classList.toggle('selected',id===selected);handle.hidden=['warning','feed','interaction'].includes(id)&&id!==selected;widgets.get(id).classList.toggle('hud-selected',id===selected);}}
  function choose(id){selected=id;sync();}
  function change(values){const g=current();const config=item(selected,g);layouts[g.mode][selected]={x:config.x,y:config.y,scale:config.scale,opacity:config.opacity,...values};apply();}
  function finish(save){if(!editing)return;editing=false;drag=null;if(save)store.set(HUD_STORAGE,JSON.stringify(layouts));else layouts=before;document.body.classList.remove('hud-editing');editor.hidden=true;hud.inert=false;$('fullscreen-toggle').inert=false;resetInput();apply();$('settings-dialog').showModal();}
  $('edit-hud').onclick=()=>{
    resetInput();$('settings-dialog').close();before=structuredClone(layouts);editing=true;editor.hidden=false;hud.inert=true;$('fullscreen-toggle').inert=true;document.body.classList.add('hud-editing');
    $('hud-edit-note').textContent=getPhase()==='playing'?'Trận vẫn tiếp diễn. Kéo nút để di chuyển; mở danh sách để chọn phần bị che.':'Đây là bản xem trước, chưa vào trận. Kéo từng UI hoặc dùng thanh vị trí.';
    if(getPhase()!=='playing'){$('alive-count').textContent='8';$('reload-progress').hidden=true;$('timer').textContent='10:00';$('health-number').textContent='100%';widgets.get('health').setAttribute('aria-label','Sức khỏe 100%');$('health-fill').style.strokeDashoffset='0';$('health-fill').style.stroke='#aaffc1';$('weapon-name').textContent='Súng nước';$('weapon-icon-use').setAttribute('href','/weapon-icons.svg#water');$('weapon-icon').dataset.weapon='water';$('ammo-mag').textContent='18';$('ammo-reserve').textContent='/ 54';$('reload-status').textContent='';$('interact-text').textContent='Nhặt súng nước';}
    choose('health');apply();select.focus();
  };
  select.onchange=()=>choose(select.value);
  for(const name of ['x','y','scale','opacity'])$(`hud-${name}`).oninput=event=>change({[name]:Number(event.target.value)/100});
  $('hud-export').onclick=()=>{const g=current(),data={mode:g.mode,widgets:{}};for(const id of Object.keys(HUD_LABELS)){const c=item(id,g);data.widgets[id]={x:c.x,y:c.y,scale:c.scale,opacity:c.opacity};}const output=$('hud-export-data');output.hidden=false;output.value=JSON.stringify(data,null,2);output.focus();output.select();};
  $('hud-save').onclick=()=>finish(true);$('hud-cancel').onclick=()=>finish(false);
  $('hud-reset').onclick=()=>{layouts[current().mode]={};apply();};
  $('hud-collapse').onclick=()=>{const collapsed=$('hud-editor-panel').classList.toggle('collapsed');$('hud-collapse').textContent=collapsed?'Mở chỉnh sửa':'Thu gọn';};
  for(const [id,handle] of handles) {
    handle.addEventListener('pointerdown',event=>{event.preventDefault();choose(id);const r=widgets.get(id).getBoundingClientRect();drag={id,pointer:event.pointerId,dx:event.clientX-r.left-r.width/2,dy:event.clientY-r.top-r.height/2};handle.setPointerCapture(event.pointerId);});
    handle.addEventListener('pointermove',event=>{if(!drag||event.pointerId!==drag.pointer)return;const g=current(),left=Math.max(8,g.safe.left),top=Math.max(8,g.safe.top),w=g.width-left-Math.max(8,g.safe.right),h=g.height-top-Math.max(8,g.safe.bottom);change({x:clamp((event.clientX-drag.dx-left)/w,0,1),y:clamp((event.clientY-drag.dy-top)/h,0,1)});});
    for(const type of ['pointerup','pointercancel','lostpointercapture'])handle.addEventListener(type,()=>{drag=null;});
    handle.addEventListener('keydown',event=>{const delta={ArrowLeft:[-.01,0],ArrowRight:[.01,0],ArrowUp:[0,-.01],ArrowDown:[0,.01]}[event.key];if(!delta)return;event.preventDefault();choose(id);const c=item(id);change({x:clamp(c.x+delta[0],0,1),y:clamp(c.y+delta[1],0,1)});});
  }
  document.addEventListener('keydown',event=>{if(!editing)return;if(event.key==='Escape'){event.preventDefault();finish(false);}else if(event.key==='Tab'){const focusable=[...editor.querySelectorAll('button,select,input')].filter(e=>e.getClientRects().length&&!e.disabled),first=focusable[0],last=focusable.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}});
  addEventListener('resize',()=>{drag=null;apply();});apply();
  return { isEditing:()=>editing, refresh:apply };
}
