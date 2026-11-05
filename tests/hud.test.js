import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanLayouts, defaultWidgets, resolveWidget, layoutMode } from '../public/hud-layout.js';
import { MAPS, zoneAt } from '../shared.js';

const controls=['timer','alive','tools','compass','health','weapon','minimap','fullscreen','joystick','fire','jump','sprint','pickup','reload','swap','heal','skill','scope'];
const box=(item,w,h,safe)=>{const p=resolveWidget(item,w,h,safe);return {left:p.x-item.width*p.scale/2,right:p.x+item.width*p.scale/2,top:p.y-item.height*p.scale/2,bottom:p.y+item.height*p.scale/2};};
test('phone HUD leaves each persistent control separate in both orientations',()=>{
  for(const [w,h,safe={}] of [[320,568],[390,844],[430,932],[568,320],[667,375],[844,390],[915,412],[1280,720],[390,844,{top:44,bottom:34}],[844,390,{left:44,right:44,bottom:21}]]){
    const defaults=defaultWidgets(w,h,true,safe), rects=Object.fromEntries(controls.map(id=>[id,box(defaults[id],w,h,safe)]));
    for(let i=0;i<controls.length;i++)for(let j=i+1;j<controls.length;j++){
      const a=rects[controls[i]],b=rects[controls[j]];
      assert.ok(Math.min(a.right,b.right)-Math.max(a.left,b.left)<=.5||Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)<=.5,`${w}x${h}: ${controls[i]} overlaps ${controls[j]}`);
    }
    if(w>h&&w-Math.max(8,safe.left||0)-Math.max(8,safe.right||0)>=780){assert.ok(rects.scope.right<rects.health.left,'scope stays on the left');assert.ok(rects.reload.right<rects.jump.left,'reload is left of jump');}else assert.ok(Math.abs((rects.health.left+rects.health.right)/2-w/2)<1,'portrait health stays centered');
    assert.ok(rects.jump.right<rects.fire.left,'jump is left of fire');
    assert.ok(rects.sprint.bottom<rects.jump.top,'sprint is above jump');
    assert.ok(rects.pickup.bottom<rects.fire.top,'pickup is above fire');
    assert.ok(rects.heal.right<rects.health.left,'healing stays next to health');
    assert.ok(rects.reload.left>rects.weapon.right,'reload is right of the weapon');
    assert.ok(rects.fullscreen.right<rects.minimap.left,'fullscreen is beside the minimap');
  }
});
test('saved HUD is bounded, finite, and independent for each orientation',()=>{
  const saved=cleanLayouts({portrait:{health:{x:Infinity,y:-4,scale:9,opacity:0},fire:{x:.7,y:.4,scale:.8,opacity:.5}},landscape:{health:{x:.3,y:.6,scale:1.2,opacity:.8},unknown:{x:.2}}});
  assert.deepEqual(saved.portrait.health,{x:.5,y:0,scale:1.5,opacity:.25});
  const roundtrip=cleanLayouts(JSON.parse(JSON.stringify(saved)));assert.deepEqual(roundtrip,saved);
  assert.equal(saved.landscape.health.x,.3);assert.equal(saved.portrait.fire.scale,.8);assert.equal(saved.landscape.unknown,undefined);
  assert.equal(layoutMode(844,390),'landscape');assert.equal(layoutMode(390,844),'portrait');
  for(const x of [0,.5,1])for(const y of [0,.5,1]){
    const r=box({width:184,height:44,x,y,scale:1.5,opacity:.5},390,844,{left:22,right:12,top:44,bottom:34});
    assert.ok(r.left>=22&&r.right<=378&&r.top>=44&&r.bottom<=810,'scaled control stays within safe area');
  }
});
test('survival has a ten minute budget with continuous storm stages across the match',()=>{
  const map=MAPS.meadow;assert.equal(map.duration,600);
  let elapsed=0;for(const stage of map.zones){elapsed+=stage.wait+stage.shrink;const a=zoneAt(map,elapsed-.0001),b=zoneAt(map,elapsed);assert.ok(Math.abs(a.radius-b.radius)<.001);assert.ok(Math.hypot(a.x-b.x,a.z-b.z)<.001);}
  assert.equal(elapsed,570);assert.ok(zoneAt(map,480).radius>5);assert.equal(zoneAt(map,600).radius,5);
});
