import test from 'node:test';
import assert from 'node:assert/strict';
import { createFullscreen } from '../public/fullscreen.js';

function fixture(reject=false) {
  const events=new Map(),attrs={},classes=new Set(),notices=[];
  const counts={enter:0,exit:0,reset:0};let click;
  const doc={fullscreenElement:null,body:{classList:{toggle(name,on){if(on)classes.add(name);else classes.delete(name);}}},addEventListener(name,fn){events.set(name,fn);}};
  doc.documentElement={async requestFullscreen(options){counts.enter++;assert.equal(options.navigationUI,'hide');if(reject)throw new Error('denied');doc.fullscreenElement=this;events.get('fullscreenchange')();}};
  doc.exitFullscreen=async()=>{counts.exit++;doc.fullscreenElement=null;events.get('fullscreenchange')();};
  const button={setAttribute(name,value){attrs[name]=value;},addEventListener(name,fn){assert.equal(name,'click');click=fn;}};
  createFullscreen({doc,button,notify:message=>notices.push(message),resetInput:()=>counts.reset++});
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
