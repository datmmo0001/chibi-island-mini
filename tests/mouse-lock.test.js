import test from 'node:test';
import assert from 'node:assert/strict';
import {createMouseLock} from '../public/mouse-lock.js';
test('mouse lock uses gesture request, tracks relative motion, and permits explicit or system exit',()=>{
  const listeners={},classes=new Set(),moves=[];let resets=0,playable=true;
  const doc={pointerLockElement:null,body:{classList:{toggle:(name,on)=>on?classes.add(name):classes.delete(name)}},addEventListener:(event,cb)=>listeners[event]=cb,exitPointerLock(){this.pointerLockElement=null;listeners.pointerlockchange();}};
  const canvas={requestPointerLock(){doc.pointerLockElement=canvas;listeners.pointerlockchange();}};
  const lock=createMouseLock({canvas,doc,isPlayable:()=>playable,rotate:(x,y)=>moves.push([x,y]),resetInput:()=>resets++,notify:()=>{throw Error('unexpected error');}});
  assert.equal(lock.request(),true);assert.ok(lock.locked());assert.ok(classes.has('mouse-locked'));
  listeners.mousemove({movementX:12,movementY:-4});assert.deepEqual(moves,[[12,-4]]);
  playable=false;listeners.mousemove({movementX:7,movementY:1});assert.equal(moves.length,1);
  lock.release();assert.equal(lock.locked(),false);assert.equal(resets,2);
  playable=true;lock.request();doc.pointerLockElement=null;listeners.pointerlockchange();assert.equal(lock.locked(),false);
});
test('denied pointer lock remains usable via drag fallback without request loops',async()=>{
  const listeners={};let notices=0,requests=0;
  const doc={body:{classList:{toggle(){}}},addEventListener:(event,cb)=>listeners[event]=cb};
  const lock=createMouseLock({canvas:{requestPointerLock(){requests++;return Promise.reject(Error('denied'));}},doc,isPlayable:()=>true,rotate(){},resetInput(){},notify:()=>notices++});
  lock.request();await Promise.resolve();assert.equal(notices,1);assert.equal(lock.request(),false);assert.equal(requests,1);assert.equal(lock.locked(),false);
});
