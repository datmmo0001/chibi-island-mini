import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {OUTFITS,HATS} from '../shared.js';import {Room} from '../server/game.js';
test('five original anime characters have valid distinct 3D meshes and all gameplay attachments',async()=>{
 const source=(await readFile(new URL('../public/scene.js',import.meta.url),'utf8')).replace("'./actor-life.js'",JSON.stringify(new URL('../public/actor-life.js',import.meta.url).href)).replace("'./model-avatar.js'",JSON.stringify(new URL('../public/model-avatar.js',import.meta.url).href)).replace("'./asset-models.js'",JSON.stringify(new URL('../public/asset-models.js',import.meta.url).href)).replace("'three'",JSON.stringify(new URL('../node_modules/three/build/three.module.js',import.meta.url).href)).replace("'/shared.js'",JSON.stringify(new URL('../shared.js',import.meta.url).href));
 const {avatar}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
 const characters=OUTFITS.filter(o=>o.anime);assert.equal(characters.length,5);assert.equal(new Set(characters.map(o=>o.hair)).size,5);
 for(const o of characters)for(const hat of HATS){const a=avatar(o.id,hat);assert.ok(a.getObjectByName(`anime-${o.id}`));assert.equal(a.userData.legs.length,2);for(const key of ['gun','scope','aura','halo','wings'])assert.ok(a.userData[key]);let count=0;a.traverse(m=>{if(m.isMesh){count++;assert.ok(m.geometry.attributes.position.count>0);assert.ok(Number.isFinite(m.position.x));}});assert.ok(count<130);}
});
test('anime selections survive authoritative room snapshots, squad start and rematch',()=>{
 const chars=OUTFITS.filter(o=>o.anime);
 const r=new Room('ANIME','a',{teamSize:3,mapId:'candy'});
 chars.forEach((o,i)=>{const id=i===0?'a':`p${i}`;r.addHuman(id,o.name,o.id);r.configure(id,{ready:true});});
 r.start('a');
 assert.deepEqual(r.snapshot().players.filter(p=>!p.bot).map(p=>p.outfit).sort(),chars.map(o=>o.id).sort());
 r.phase='finished';r.backToLobby('a');
 assert.ok(r.snapshot().players.every(p=>OUTFITS.some(o=>o.id===p.outfit)));
});
test('model mascots ajo and strawberry are registered outfits with matching VRM entries',async()=>{
 const models=OUTFITS.filter(o=>o.model);assert.deepEqual(models.map(o=>o.id).sort(),['ajo','anna','juanita','strawberry']);
 for(const o of models){assert.equal(o.model,o.id);assert.ok(o.name&&o.color&&o.light&&o.accent&&o.hair&&o.eye);}
 const source=await readFile(new URL('../public/model-avatar.js',import.meta.url),'utf8');
 for(const o of models){assert.ok(source.includes(`url: '/models/${o.model}.vrm'`),`model-avatar.js missing ${o.model}`);}
 const r=new Room('MASCOT','a',{teamSize:3,mapId:'candy'});
 r.addHuman('a','Kỳ Giông','ajo');r.addHuman('b','Dâu Tây','strawberry');r.configure('a',{ready:true});r.configure('b',{ready:true});r.start('a');
 assert.deepEqual(r.snapshot().players.filter(p=>!p.bot).map(p=>p.outfit).sort(),['ajo','strawberry']);
});
