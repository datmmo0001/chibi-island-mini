import test from 'node:test';
import assert from 'node:assert/strict';
import {portraitBlocked,controlsBlocked,createPlayGuard} from '../public/play-guard.js';
test('phone portrait is blocked; landscape touch and captured desktop controls are allowed',()=>{
 assert.equal(portraitBlocked({width:390,height:844,coarse:true,touchPoints:5}),true);
 assert.equal(portraitBlocked({width:915,height:412,coarse:true,touchPoints:5}),false);
 assert.equal(portraitBlocked({width:1024,height:1280,coarse:true}),true);
 assert.equal(portraitBlocked({width:1280,height:720}),false);
 assert.equal(controlsBlocked({portrait:false,desktop:true,playing:true,alive:true,locked:false}),true);
 assert.equal(controlsBlocked({portrait:false,desktop:true,playing:true,alive:true,locked:true}),false);
 assert.equal(controlsBlocked({portrait:false,desktop:false,playing:true,alive:true,locked:false}),false);
 assert.equal(controlsBlocked({portrait:true,desktop:false,playing:false,alive:false,locked:false}),true);
});
test('rotation makes UI inert, clears input, closes details, and capture never auto-retries',()=>{
 const nodes=Object.fromEntries(['game-ui','rotate-gate','mouse-gate','rotate-title','capture-mouse'].map(id=>[id,{hidden:true,inert:false,focus(){}}]));
 let locked=false,resets=0,releases=0,retries=0,requests=0,closed=0;
 const doc={getElementById:id=>nodes[id],body:{classList:{toggle(){}}},querySelectorAll:()=>[{close:()=>closed++}],addEventListener(){}};
 const win={innerWidth:1280,innerHeight:720,coarse:false,desktop:true,navigator:{maxTouchPoints:0},matchMedia(q){return {matches:q.includes('coarse')?this.coarse:this.desktop};},addEventListener(){}};
 const guard=createPlayGuard({doc,win,mouseLock:{locked:()=>locked,release:()=>releases++,retry:()=>retries++,request:()=>requests++},resetInput:()=>resets++,getPhase:()=> 'playing',isAlive:()=>true,menusOpen:()=>false});
 assert.equal(nodes['mouse-gate'].hidden,false);assert.equal(guard.isBlocked(),true);assert.equal(requests,0);
 nodes['capture-mouse'].onclick();assert.equal(retries,1);assert.equal(requests,1);
 locked=true;guard.refresh();assert.equal(guard.isBlocked(),false);assert.equal(nodes['mouse-gate'].hidden,true);
 locked=false;guard.refresh();assert.equal(guard.isBlocked(),true);const stable=resets;guard.refresh();assert.equal(resets,stable);assert.equal(requests,1);
 Object.assign(win,{innerWidth:390,innerHeight:844,coarse:true,desktop:false});win.navigator.maxTouchPoints=1;guard.refresh();assert.equal(nodes['game-ui'].inert,true);assert.equal(nodes['rotate-gate'].hidden,false);assert.equal(closed,1);assert.equal(releases,1);
 Object.assign(win,{innerWidth:915,innerHeight:412});guard.refresh();assert.equal(nodes['game-ui'].inert,false);assert.equal(guard.isBlocked(),false);assert.equal(nodes['mouse-gate'].hidden,true);
});
