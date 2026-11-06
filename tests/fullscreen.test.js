import test from 'node:test';
import assert from 'node:assert/strict';
import { createFullscreen } from '../public/fullscreen.js';

function fixture(reject=false, orientation=null) {
  const events=new Map(),attrs={},classes=new Set(),notices=[];
  const counts={enter:0,exit:0,reset:0};let click;
  const doc={fullscreenElement:null,body:{classList:{toggle(name,on){if(on)classes.add(name);else classes.delete(name);}}},addEventListener(name,fn){events.set(name,fn);}};
  doc.documentElement={async requestFullscreen(options){counts.enter++;assert.equal(options.navigationUI,'hide');if(reject)throw new Error('denied');doc.fullscreenElement=this;events.get('fullscreenchange')();}};
  doc.exitFullscreen=async()=>{counts.exit++;doc.fullscreenElement=null;events.get('fullscreenchange')();};
  const button={setAttribute(name,value){attrs[name]=value;},addEventListener(name,fn){assert.equal(name,'click');click=fn;}};
  createFullscreen({doc,button,orientation,isPhone:()=>Boolean(orientation),notify:message=>notices.push(message),resetInput:()=>counts.reset++});
  return {doc,button,events,attrs,classes,counts,notices,click:()=>click()};
}
test('fullscreen stays active across unrelated page events and exits through its toggle',async()=>{
  const f=fixture();await f.click();assert.equal(f.attrs['aria-pressed'],'true');assert.equal(f.attrs['aria-label'],'Thoát toàn màn hình');assert.ok(f.classes.has('fullscreen-active'));
  for(const event of ['visibilitychange','resize','phasechange'])f.events.get(event)?.();
  f.events.get('fullscreenchange')();assert.equal(f.counts.exit,0);assert.equal(f.doc.fullscreenElement,f.doc.documentElement);
  await f.click();assert.equal(f.counts.exit,1);assert.equal(f.attrs['aria-pressed'],'false');assert.equal(f.button.disabled,false);assert.ok(f.counts.reset>=2);
});
test('browser or system fullscreen exit updates the button without forcing re-entry',async()=>{
  const f=fixture();await f.click();f.doc.fullscreenElement=null;f.events.get('fullscreenchange')();assert.equal(f.counts.enter,1);assert.equal(f.attrs['aria-label'],'Toàn màn hình');assert.ok(!f.classes.has('fullscreen-active'));
});
test('denied fullscreen is recoverable and does not pretend it succeeded',async()=>{
  const f=fixture(true);await f.click();assert.equal(f.notices.length,1);assert.equal(f.attrs['aria-pressed'],'false');assert.equal(f.button.disabled,false);await f.click();assert.equal(f.counts.enter,2);
});

test('phone enters fullscreen before landscape lock, then releases lock on system exit',async()=>{
  const calls=[];let f;
  const orientation={async lock(value){assert.ok(f.doc.fullscreenElement);calls.push(value);},unlock(){calls.push('unlock');}};
  f=fixture(false,orientation);await f.click();assert.deepEqual(calls,['landscape']);
  f.doc.fullscreenElement=null;f.events.get('fullscreenchange')();assert.deepEqual(calls,['landscape','unlock']);assert.equal(f.counts.enter,1);
});
test('orientation refusal retains fullscreen with honest manual rotation guidance',async()=>{
  const f=fixture(false,{async lock(){throw new Error('denied');}});await f.click();
  assert.equal(f.attrs['aria-pressed'],'true');assert.match(f.notices[0],/xoay điện thoại/);assert.equal(f.button.disabled,false);
});
test('fullscreen refusal never requests orientation lock',async()=>{
  let locks=0;const f=fixture(true,{async lock(){locks++;}});await f.click();assert.equal(locks,0);
});
