import { resetRespawnVisual } from './actor-life.js';
import * as THREE from 'three';
import { MAPS, OUTFITS, RULES, WEAPONS, SKILLS, getMap, cylinderHit, obstacleSolid, obstacleHit, obstacleContains, clamp } from '/shared.js';

const colorMat = color => new THREE.MeshStandardMaterial({ color, roughness: 0.86, metalness: 0, flatShading: true });
const materials = new Map();
function mat(color) { if (!materials.has(color)) materials.set(color, colorMat(color)); return materials.get(color); }
function mesh(geometry, color, parent, x = 0, y = 0, z = 0) {
  const o = new THREE.Mesh(geometry, mat(color)); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; parent.add(o); return o;
}
const sphere = (r, color, p, x, y, z, detail = 14) => mesh(new THREE.SphereGeometry(r, detail, 10), color, p, x, y, z);
const box = (w, h, d, color, p, x, y, z) => mesh(new THREE.BoxGeometry(w, h, d), color, p, x, y, z);
const cylinder = (rt, rb, h, color, p, x, y, z, detail = 20) => mesh(new THREE.CylinderGeometry(rt, rb, h, detail), color, p, x, y, z);

export function avatar(outfitId = 'bear', hat = 'ears') {
  const outfit = OUTFITS.find(o => o.id === outfitId) || OUTFITS[0], g = new THREE.Group();
  const body = sphere(0.49, outfit.color, g, 0, 0.94, 0); body.scale.set(1, 1.16, 0.8);
  const belly = sphere(0.35, outfit.light, g, 0, 0.93, 0.31); belly.scale.set(1, 1, 0.26);
  const head = sphere(0.73, outfit.color, g, 0, 1.94, 0); head.scale.set(1, .93, .93);
  const face = sphere(0.59, '#ffdfbd', g, 0, 1.91, .33); face.scale.set(.94, .86, .65);
  sphere(.065, '#3d4740', g, -.21, 1.99, .681, 10); sphere(.065, '#3d4740', g, .21, 1.99, .681, 10);
  sphere(.018, '#fffdf5', g, -.225, 2.01, .73, 8); sphere(.018, '#fffdf5', g, .195, 2.01, .73, 8);
  const blush1 = sphere(.105, '#eeaa99', g, -.36, 1.82, .64); blush1.scale.set(1, .5, .2);
  const blush2 = sphere(.105, '#eeaa99', g, .36, 1.82, .64); blush2.scale.set(1, .5, .2);
  const mouth = mesh(new THREE.TorusGeometry(.075, .014, 5, 10, Math.PI), '#955d4b', g, 0, 1.79, .692); mouth.rotation.z = Math.PI;
  const leftLeg = new THREE.Group(), rightLeg = new THREE.Group(); g.add(leftLeg, rightLeg);
  leftLeg.position.set(-.23, .48, 0); rightLeg.position.set(.23, .48, 0);
  cylinder(.15, .17, .34, outfit.accent, leftLeg, 0, -.1, 0, 10); cylinder(.15, .17, .34, outfit.accent, rightLeg, 0, -.1, 0, 10);
  const shoe1 = sphere(.23, outfit.light, leftLeg, 0, -.29, .12); shoe1.scale.set(.85, .55, 1.2);
  const shoe2 = sphere(.23, outfit.light, rightLeg, 0, -.29, .12); shoe2.scale.set(.85, .55, 1.2);
  const arm1 = sphere(.18, outfit.color, g, -.48, 1.09, .16); arm1.scale.y = 1.6; arm1.rotation.x = -.7;
  const arm2 = sphere(.18, outfit.color, g, .48, 1.09, .22); arm2.scale.y = 1.6; arm2.rotation.x = -.9;
  sphere(.17, '#ffdfbd', g, -.46, .93, .35); sphere(.17, '#ffdfbd', g, .48, .96, .47);
  const gun = new THREE.Group(); gun.position.set(-.58, 1.25, .54); g.add(gun);
  box(.3, .25, .58, '#73cacc', gun, 0, 0, .1); box(.16, .25, .16, '#ef936e', gun, 0, -.19, -.04);
  cylinder(.13, .13, .28, '#f8d275', gun, 0, .23, .03, 10);
  const nozzle = cylinder(.09, .09, .21, '#f39270', gun, 0, 0, .48, 10); nozzle.rotation.x = Math.PI / 2;
  const pack = sphere(.36, outfit.accent, g, 0, 1.04, -.38); pack.scale.set(1, 1.1, .4);
  if(outfit.anime){
    head.material=mat(outfit.hair);body.scale.set(.92,1.12,.78);belly.material=mat(outfit.light);
    const details=new THREE.Group();details.name=`anime-${outfit.id}`;g.add(details);
    // Smooth, layered locks frame the face while keeping the eyes visible.
    for(let i=0;i<7;i++){const x=(i-3)*.17,lock=sphere(.24,outfit.hair,details,x,2.43-Math.abs(x)*.19,.48,12);lock.scale.set(.72,1.2,.7);lock.rotation.z=(i-3)*.13;}
    for(const sign of [-1,1]){
      const lock=sphere(.26,outfit.hair,details,sign*.61,1.97,.1,12);lock.scale.set(.55,1.65,.8);
      const iris=sphere(.09,outfit.eye,details,sign*.21,1.99,.724,12);iris.scale.set(.8,1.25,.3);
      sphere(.028,'#ffffff',details,sign*.21-.025,2.025,.754,8);
      box(.17,.05,.04,outfit.hair,details,sign*.21,2.105,.7);
      sphere(.075,'#fff4dc',details,sign*.59,1.79,.13,8);
    }
    box(.79,.09,.66,outfit.accent,details,0,.76,0);
    const collar=box(.59,.17,.13,outfit.light,details,0,1.36,.33);collar.rotation.z=.02;
    sphere(.07,'#ffe6a2',details,0,1.14,.45,8);
    if(outfit.id==='akari'){
      for(const sign of [-1,1]){const tail=sphere(.43,outfit.hair,details,sign*.86,1.9,-.12);tail.scale.set(.7,1.5,.75);tail.rotation.z=sign*-.2;
        const bow=box(.24,.21,.17,outfit.accent,details,sign*.75,2.3,.03);bow.rotation.z=sign*.4;
        for(let j=0;j<3;j++){const petal=sphere(.09,'#ffe5f0',details,sign*.68+Math.cos(j*2.1)*.07,2.36+Math.sin(j*2.1)*.07,.25,8);petal.scale.z=.4;}}
      const skirt=cylinder(.38,.61,.32,outfit.color,details,0,.69,0,12);box(.1,.3,.1,outfit.accent,details,0,1.16,.47);
    }else if(outfit.id==='ren'){
      for(let i=0;i<5;i++){const spike=mesh(new THREE.ConeGeometry(.18,.46,5),outfit.hair,details,(i-2)*.2,2.64-Math.abs(i-2)*.04,-.05);spike.rotation.z=(i-2)*-.16;}
      box(1.22,.14,.19,outfit.accent,details,0,2.29,.53);box(.27,.13,.04,'#cbdfe7',details,0,2.29,.65);
      const scarf=cylinder(.32,.36,.19,outfit.accent,details,0,1.4,0,12);
      for(const sign of [-1,1]){const ribbon=box(.15,.57,.05,outfit.accent,details,sign*.17,1.1,-.54);ribbon.rotation.z=sign*.32;}
    }else if(outfit.id==='aoi'){
      for(const sign of [-1,1]){const braid=sphere(.22,outfit.hair,details,sign*.57,1.65,-.06);braid.scale.set(.65,1.8,.7);}
      const cape=mesh(new THREE.ConeGeometry(.63,.95,12,1,true),outfit.color,details,0,1.04,-.17);cape.scale.z=.72;
      const brim=cylinder(.91,.91,.09,outfit.accent,details,0,2.5,0,18);
      const hatTop=mesh(new THREE.ConeGeometry(.61,1.05,14),outfit.color,details,.08,2.99,0);hatTop.rotation.z=-.15;
      const star=mesh(new THREE.OctahedronGeometry(.14), '#ffe8a3',details,.1,2.82,.49);star.scale.z=.3;
    }else{
      for(const sign of [-1,1]){const tuft=sphere(.25,outfit.hair,details,sign*.54,2.42,-.08);tuft.scale.set(1.35,.55,.8);tuft.rotation.z=sign*.3;}
      const jacket=box(.14,.53,.12,outfit.accent,details,-.24,1.02,.4);
      box(.09,.59,.12,outfit.light,details,.21,1.02,.4);
      const goggles=cylinder(.12,.12,.07,outfit.accent,details,-.21,2.47,.57,12);goggles.rotation.x=Math.PI/2;
      const glass=cylinder(.12,.12,.07,outfit.accent,details,.21,2.47,.57,12);glass.rotation.x=Math.PI/2;
      box(.22,.04,.05,'#e7d9a6',details,0,2.47,.59);
      pack.material=mat('#679f91');
    }
    if(hat==='cap'){const clip=sphere(.1,'#ffe8a3',details,.58,2.36,.3);clip.scale.z=.3;}
    if(hat==='leaf'){const pin=sphere(.17,'#81bd86',details,-.59,2.3,.34);pin.scale.set(.5,1,.25);pin.rotation.z=.5;}
  }else if (hat === 'ears') {
    if (outfit.id === 'bunny') {
      for (const sign of [-1, 1]) {
        const ear = sphere(.23, outfit.color, g, sign * .36, 2.75, -.05); ear.scale.set(.75, 2.5, .7); ear.rotation.z = sign * -.13;
        const inner = sphere(.14, outfit.light, g, sign * .36, 2.79, .08); inner.scale.set(.7, 2.8, .4); inner.rotation.z = sign * -.13;
      }
    } else if (outfit.id === 'duck') {
      const top = sphere(.67, '#f4ce56', g, 0, 2.1, -.04); top.scale.set(1.15, .8, 1.04);
      const bill = sphere(.31, '#ef9b4b', g, 0, 2.15, .67); bill.scale.set(1.3, .23, .8);
      sphere(.04, '#414c3d', g, -.22, 2.39, .5); sphere(.04, '#414c3d', g, .22, 2.39, .5);
    } else {
      for (const sign of [-1, 1]) { sphere(.25, outfit.color, g, sign * .57, 2.47, -.02); sphere(.14, outfit.light, g, sign * .57, 2.48, .16); }
    }
  } else if (hat === 'cap') {
    const cap = sphere(.72, '#8ebba7', g, 0, 2.19, -.05); cap.scale.set(1, .65, 1);
    const brim = sphere(.5, '#567f6f', g, 0, 2.17, .52); brim.scale.set(1.2, .13, .8);
    sphere(.075, '#fbe4ac', g, 0, 2.66, -.03);
  } else {
    const leaf = sphere(.42, '#7eaa6c', g, .1, 2.65, 0); leaf.scale.set(.5, .25, 1.25); leaf.rotation.z = -.3; leaf.rotation.y = .65;
    const stem = cylinder(.03, .03, .37, '#5b815b', g, 0, 2.57, 0, 7); stem.rotation.z = -.45;
  }
  const shadow = mesh(new THREE.CircleGeometry(.68, 24), '#487c62', g, 0, .025, 0); shadow.rotation.x = -Math.PI / 2;
  shadow.material = new THREE.MeshBasicMaterial({ color: '#2c635a', transparent: true, opacity: .13, depthWrite: false }); shadow.castShadow = false;
  const scope=new THREE.Group();gun.add(scope);scope.visible=false;
  const lens=cylinder(.11,.11,.45,'#32484f',scope,0,.25,.17,10);lens.rotation.x=Math.PI/2;
  box(.1,.12,.14,'#526b69',scope,0,.11,.12);
  const aura=new THREE.Group();g.add(aura);aura.visible=false;
  const halo=new THREE.Mesh(new THREE.TorusGeometry(.85,.065,6,24),new THREE.MeshBasicMaterial({color:'#89ffb4',transparent:true,opacity:.8,depthWrite:false,toneMapped:false}));halo.rotation.x=-Math.PI/2;halo.position.y=.2;aura.add(halo);
  const wings=new THREE.Group();aura.add(wings);for(const sign of [-1,1]){const wing=sphere(.65,'#dac8ff',wings,sign*.9,1.5,-.15,7);wing.scale.set(1.3,.18,.7);wing.rotation.z=sign*.5;}
  g.userData = { scope, aura, halo, wings, legs: [leftLeg, rightLeg], signature: `${outfit.id}/${hat}`, gun, deadAt: null };
  return g;
}

export class IslandScene {
  constructor(canvas) {
    this.canvas = canvas; this.scene = new THREE.Scene(); this.scene.background = new THREE.Color('#a8d8ed');
    this.scene.fog = new THREE.Fog('#a8d8ed', 115, 280);
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping; this.renderer.toneMappingExposure = 1.05;
    this.previewCamera = new THREE.OrthographicCamera(-30,30,24,-24,.1,400);
    this.followCamera = new THREE.PerspectiveCamera(65,1,.08,420); this.camera = this.previewCamera;
    this.scene.add(new THREE.HemisphereLight('#e4f6ff','#527f36',2));
    this.sun = new THREE.DirectionalLight('#fff3ce',2.3); this.sun.position.set(-23,40,20); this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(1024,1024); Object.assign(this.sun.shadow.camera,{left:-32,right:32,top:32,bottom:-32,near:1,far:110});
    this.sun.shadow.bias=-.001; this.sun.shadow.normalBias=.06; this.scene.add(this.sun,this.sun.target);
    this.actors=new Map(); this.projectiles=new Map(); this.pickupMeshes=new Map(); this.lootMeshes=new Map(); this.obstacleMeshes=new Map(); this.markerMeshes=new Map(); this.particles=[]; this.fadingTraces=[];
    this.localInput={fire:false};this.nextLocalShot=0;this.sensitivity=1;this.invertY=false;
    this.mode='home'; this.clock=0; this.cameraYaw=Math.PI; this.cameraPitch=.12;
    this.target=new THREE.Vector3(-12,0,3); this.desiredTarget=this.target.clone(); this.raycaster=new THREE.Raycaster();
    this.mapRoot=new THREE.Group(); this.scene.add(this.mapRoot); this.map=getMap('meadow'); this.makeMap();
    this.preview=new THREE.Group(); this.scene.add(this.preview); this.updatePreview('bear','ears');
    this.resize(); addEventListener('resize',()=>this.configure({quality:this.quality||'auto',sensitivity:this.sensitivity,invertY:this.invertY}));
  }
  changeMap(id) {
    if(this.map.id===id)return;
    this.clearMatch(); this.scene.remove(this.mapRoot); this.dispose(this.mapRoot);
    this.mapRoot=new THREE.Group(); this.scene.add(this.mapRoot); this.map=getMap(id); this.obstacleMeshes.clear(); this.pickupMeshes.clear(); this.makeMap();
  }
  makeMap() {
    const p=this.mapRoot,R=this.map.radius;
    const sea=mesh(new THREE.PlaneGeometry(1100,1100),'#68c4cb',p,0,-1.1,0); sea.rotation.x=-Math.PI/2; sea.castShadow=false;
    cylinder(R+2.6,R+3.1,1,'#d9ca8d',p,0,-.6,0,96);
    const ground=cylinder(R,R+.6,.25,'#4e9d3c',p,0,-.12,0,96); ground.castShadow=false;
    const grassCanvas=document.createElement('canvas');grassCanvas.width=128;grassCanvas.height=128;const cx=grassCanvas.getContext('2d');
    cx.fillStyle='#71ac4d';cx.fillRect(0,0,128,128);
    for(let i=0;i<700;i++){cx.fillStyle=i%3?'#77b450':'#649e41';cx.fillRect(Math.random()*128,Math.random()*128,2+Math.random()*3,1+Math.random()*2);}
    const texture=new THREE.CanvasTexture(grassCanvas);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(R/2,R/2);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;
    ground.material=new THREE.MeshStandardMaterial({map:texture,color:'#c8e6a8',roughness:1});
    const pathColor='#c1ae75';
    if(this.map.id==='candy'){
      cylinder(5.1,5.1,.025,pathColor,p,0,.025,0,32);box(2.4,.025,R*1.74,pathColor,p,0,.025,0);box(R*1.74,.025,2.4,pathColor,p,0,.025,0);
    }else{
      for(const region of this.map.regions){
        cylinder(13,13,.025,pathColor,p,region.x,.025,region.z,32).castShadow=false;
        const length=Math.hypot(region.x,region.z), trail=box(3.5,.02,length,pathColor,p,region.x/2,.025,region.z/2);trail.rotation.y=Math.atan2(region.x,region.z);trail.castShadow=false;
        this.makeSign(region);
      }
      const geo=new THREE.ConeGeometry(.11,.55,3), material=mat('#6da747'); const grass=new THREE.InstancedMesh(geo,material,2600), dummy=new THREE.Object3D();
      for(let i=0;i<2600;i++){const a=i*2.399963,r=Math.sqrt((i*.618034)%1)*(R-3);dummy.position.set(Math.sin(a)*r,.2,Math.cos(a)*r);dummy.rotation.y=a;dummy.scale.setScalar(.65+(i%7)/10);dummy.updateMatrix();grass.setMatrixAt(i,dummy.matrix);}grass.receiveShadow=true;grass.castShadow=false;p.add(grass);
    }
    for(const o of this.map.obstacles)this.makeObstacle(o);
    this.zone=mesh(new THREE.TorusGeometry(1,.018,5,160),'#63dcff',p,0,.12,0);this.zone.rotation.x=-Math.PI/2;this.zone.castShadow=false;
    this.zone.material=new THREE.MeshBasicMaterial({color:'#70e5ff',toneMapped:false});
    this.zoneWall=mesh(new THREE.CylinderGeometry(1,1,1,128,1,true),'#69d3ef',p,0,5,0);
    this.zoneWall.material=new THREE.MeshBasicMaterial({color:'#55b5e7',transparent:true,opacity:.14,side:THREE.DoubleSide,depthWrite:false,toneMapped:false});this.zoneWall.castShadow=false;
    this.zone.scale.setScalar(R-3);this.zoneWall.scale.set(R-3,10,R-3);
    for(const [id,point]of this.map.pickups.entries()){const obj=this.makeLoot({type:'heal'});obj.position.set(point.x,.5,point.z);p.add(obj);this.pickupMeshes.set(id,obj);}
    this.obstacleStates=new Map();
  }
  makeSign(region){
    const group=new THREE.Group();group.position.set(region.x+10,0,region.z-7);this.mapRoot.add(group);
    cylinder(.09,.09,2.4,'#7b5c39',group,0,1.2,0,7);
    const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;const c=canvas.getContext('2d');c.fillStyle='#faf1cf';c.fillRect(0,0,512,128);c.fillStyle='#315b35';c.font='bold 42px Segoe UI';c.textAlign='center';c.textBaseline='middle';c.fillText(region.name,256,64);
    const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;
    const sign=new THREE.Mesh(new THREE.PlaneGeometry(4.5,1.12),new THREE.MeshBasicMaterial({map:t,side:THREE.DoubleSide}));sign.position.y=2.2;group.add(sign);
  }
  makeObstacle(o){
    const g=new THREE.Group();g.position.set(o.x,0,o.z);g.userData.obstacle=o;this.mapRoot.add(g);this.obstacleMeshes.set(o.id,g);
    if(o.shape==='box'){
      const base=o.base||0,height=o.h-base;
      const color=o.kind==='house'?(o.color||'#e4d5ae'):o.kind==='stairs'?'#b7bdab':o.kind==='ledge'?'#9daa8c':o.kind==='parapet'?'#d1d5bb':o.kind==='barricade'?'#9baf9e':'#8e6840';
      const bodyHeight=o.kind==='house'?height-.08:height;
      box(o.hx*2,bodyHeight,o.hz*2,color,g,0,base+bodyHeight/2,0);
      if(o.kind==='barricade'){
        // Recessed mortar lines make the full collision volume easy to read.
        for(let y=.65;y<o.h;y+=.65){
          if(o.hx>o.hz)for(const sign of [-1,1])box(o.hx*2,.035,.025,'#d3decb',g,0,y,sign*(o.hz+.013));
          else for(const sign of [-1,1])box(.025,.035,o.hz*2,'#d3decb',g,sign*(o.hx+.013),y,0);
        }
      }else if(o.kind==='house'){
        box(o.hx*2+.08,.08,o.hz*2+.08,'#729e86',g,0,o.h-.04,0);
        box(1.2,2.3,.05,'#7b6446',g,-1,1.15,o.hz+.04);
        for(const x of [-2.7,1]){box(1.1,1.1,.06,'#5c95a0',g,x,2.45,-o.hz-.04);box(1.25,.1,.1,'#fff0cd',g,x,1.9,-o.hz-.08);}
      }else if(o.kind==='stairs')box(o.hx*2,.04,.08,'#e6e9d0',g,0,o.h,o.hz-.04);
      else if(o.kind==='tower'){
        for(let i=-2;i<=2;i++)box(.035,.035,5.5,'#c6a56c',g,i,6.37,0);
        cylinder(.055,.055,3.2,'#d2b785',g,-2.4,7.95,-2.4,6);box(.9,.55,.025,'#f2b35e',g,-1.95,9.1,-2.4);
      }
    }else if(o.kind==='bush'){
      const leaves=[];
      for(const [x,z,size,tone]of [[0,0,1,'#39752e'],[-.9,.3,.78,'#4c922e'],[.85,-.3,.82,'#64a83e']]){
        const leaf=sphere(o.r*size,tone,g,x,o.h*.48,z,8);leaf.scale.y=o.h*.56/(o.r*size);leaf.material=leaf.material.clone();leaves.push(leaf);
      }g.userData.leaves=leaves;
    }else if(o.kind==='ladder'){
      for(const x of [-.48,.48])box(.1,o.h+.6,.14,'#e8c889',g,x,(o.h+.6)/2,0);
      for(let y=.3;y<o.h+.4;y+=.4)box(1,.08,.18,'#ead6a3',g,0,y,0);
    }else if(o.kind==='tree'){
      cylinder(o.r*.52,o.r*.64,o.h*.68,'#94704b',g,0,o.h*.34,0,8);
      const crown=sphere(o.r*2.5,'#3f843e',g,0,o.h*.77,0,10);crown.scale.y=1.1;
      sphere(o.r*1.9,'#69a34c',g,-o.r*.6,o.h*.98,.2,9);
    }else if(o.kind==='chest'){
      box(o.r*1.5,o.h*.62,o.r*1.28,'#a46c31',g,0,o.h*.31,0);
      for(const x of [-o.r*.52,o.r*.52])box(.11,o.h*.62,o.r*1.32,'#e8bd50',g,x,o.h*.31,0);
      const lid=new THREE.Group();lid.position.set(0,o.h*.62,-o.r*.64);g.add(lid);box(o.r*1.55,o.h*.35,o.r*1.3,'#d6a34b',lid,0,o.h*.17,o.r*.64);g.userData.lid=lid;
      box(.2,.25,.08,'#fff0a0',g,0,o.h*.57,o.r*.69);
    }else if(o.kind==='crate'){
      box(o.r*1.5,o.h,o.r*1.5,'#a77847',g,0,o.h/2,0);
      for(const y of [.2,o.h-.2])box(o.r*1.54,.12,o.r*1.54,'#dbb36f',g,0,y,0);
      const cross=box(o.r*1.6,.12,.06,'#e0b773',g,0,o.h/2,o.r*.77);cross.rotation.z=.6;
    }else if(o.kind==='platform'){
      cylinder(o.r,o.r,o.h,'#a7aa94',g,0,o.h/2,0,10);cylinder(o.r*1.02,o.r*1.02,.1,'#79984e',g,0,o.h,0,10);
      for(let i=0;i<3;i++)box(.16,.17,.08,'#d9d6b2',g,(i-1)*.45,o.h-.35,o.r*.97);
    }else if(o.kind==='gate'||o.kind==='wall'){
      for(const side of [-1,1])box(.2,o.h+.2,.25,'#725539',g,side*o.r*.85,(o.h+.2)/2,0);
      const panel=new THREE.Group();panel.position.x=-o.r*.85;g.add(panel);g.userData.panel=panel;
      for(let i=0;i<5;i++)box(o.r*.29,o.h*.8,.16,o.kind==='gate'?'#bd9b57':'#aeb393',panel,o.r*.16+i*o.r*.34,o.h*.53,0);
      for(const y of [.6,o.h-.4])box(o.r*1.7,.12,.2,'#7c6848',panel,o.r*.85,y,0);
    }else if(o.kind==='log'){
      const log=cylinder(o.h*.5,o.h*.5,o.r*1.8,'#8c603b',g,0,o.h/2,0,10);log.rotation.z=Math.PI/2;
      const end=cylinder(o.h*.4,o.h*.4,.03,'#d6b87a',g,o.r*.92,o.h/2,0,10);end.rotation.z=Math.PI/2;
    }else if(o.kind==='cake'){
      cylinder(o.r,o.r,o.h*.8,'#e2ab93',g,0,o.h*.4,0,20);cylinder(o.r*1.02,o.r*1.02,o.h*.2,'#fff0d4',g,0,o.h*.9,0,20);sphere(.22,'#ef8395',g,0,o.h+.18,0,8);
    }else{
      const rock=sphere(o.r,'#a4af99',g,0,o.h*.46,0,7);rock.scale.y=o.h/(o.r*1.8);rock.rotation.y=o.x;
      const moss=sphere(o.r*.7,'#719549',g,-.1,o.h*.85,0,7);moss.scale.y=.2;
    }
  }
  makeLoot(item){
    const group=new THREE.Group(),color=item.type==='weapon'?(WEAPONS[item.weapon]?.color||'#42eaff'):item.type==='ammo'?'#ffe865':item.type==='skill'?(SKILLS[item.weapon]?.color||'#c9abff'):item.type==='scope'?'#95d9ff':'#80ff9d';
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.5,.04,5,20),new THREE.MeshBasicMaterial({color,toneMapped:false}));ring.rotation.x=-Math.PI/2;group.add(ring);
    if(item.type==='skill'){
      const crystal=mesh(new THREE.OctahedronGeometry(.48),color,group,0,.65,0);crystal.material=new THREE.MeshBasicMaterial({color,toneMapped:false});
      const canvas=document.createElement('canvas');canvas.width=128;canvas.height=128;const ctx=canvas.getContext('2d');ctx.font='bold 70px Segoe UI';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#fff8df';ctx.fillText(SKILLS[item.weapon]?.icon||'✦',64,64);
      const tex=new THREE.CanvasTexture(canvas),label=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,depthWrite:false}));label.position.y=1.35;label.scale.set(.8,.8,1);group.add(label);
    }else if(item.type==='scope'){
      const tube=cylinder(.19,.19,.7,'#345765',group,0,.5,0,10);tube.rotation.x=Math.PI/2;
      const lens=cylinder(.15,.15,.035,'#8ce6ff',group,0,.5,.37,10);lens.rotation.x=Math.PI/2;
      box(.2,.17,.3,'#738d8f',group,0,.29,0);
    }else if(item.type==='weapon'){
      box(.26,.24,.85,color,group,0,.4,0);box(.14,.25,.15,'#3f6367',group,0,.23,-.2);cylinder(.13,.13,.25,'#e7eacb',group,0,.65,-.14,8);
    }else if(item.type==='ammo'){
      box(.55,.38,.45,'#d9b351',group,0,.25,0);box(.3,.09,.47,'#fff4a5',group,0,.35,0);
    }else{
      cylinder(.28,.28,.55,'#75c985',group,0,.35,0,9);cylinder(.23,.23,.09,'#f3f5da',group,0,.66,0,9);box(.32,.09,.04,'#fffbe1',group,0,.36,.28);box(.09,.3,.04,'#fffbe1',group,0,.36,.28);
    }
    return group;
  }
  updatePreview(outfit,hat,players=null,selfId=null){
    for(const child of [...this.preview.children]){this.preview.remove(child);this.dispose(child);}
    const selections=players?players.map(p=>({outfit:p.outfit,hat:p.hat,mine:p.id===selfId})):[{outfit:'bunny',hat:'ears'},{outfit,hat,mine:true},{outfit:'duck',hat:'ears'}];
    selections.forEach((p,i)=>{const a=avatar(p.outfit,p.hat);a.position.set((i-(selections.length-1)/2)*4.5,.05,8+(p.mine?1:-.3));a.scale.setScalar(p.mine?2.25:1.95);a.rotation.y=i===0?.16:-.15;this.preview.add(a);});
  }
  resize(){this.width=innerWidth;this.height=innerHeight;this.renderer.setSize(this.width,this.height,false);}
  configure({quality='auto',sensitivity=1,invertY=false}={}){
    this.quality=quality;this.sensitivity=clamp(sensitivity,.5,2);this.invertY=invertY;
    const mobile=matchMedia('(pointer: coarse)').matches||innerWidth<=700;
    const cap=quality==='low'?.85:quality==='high'?2:quality==='standard'?1.25:mobile?1:1.5;
    const shadows=quality!=='low'&&(quality!=='auto'||!mobile);
    if(this.renderer.shadowMap.enabled!==shadows){this.renderer.shadowMap.enabled=shadows;this.scene.traverse(o=>{if(o.material)o.material.needsUpdate=true;});}
    this.lowDetail=quality==='low'||(quality==='auto'&&mobile);this.renderer.setPixelRatio(Math.min(devicePixelRatio||1,cap));this.resize();
  }
  setLocalInput(input){this.localInput=input;}
  setScoped(value){this.scoped=!!value;}
  dispose(group){group.traverse(o=>{o.geometry?.dispose();if(o.material&&!materials.has(o.material.color?.getStyle())&&![...materials.values()].includes(o.material)){o.material.map?.dispose();o.material.dispose();}});}
  clearMatch(){
    for(const a of this.actors.values()){this.scene.remove(a);this.dispose(a);}this.actors.clear();
    for(const b of this.projectiles.values()){this.scene.remove(b);this.dispose(b);}this.projectiles.clear();
    for(const l of this.lootMeshes.values()){this.scene.remove(l);this.dispose(l);}this.lootMeshes.clear();
    for(const m of this.markerMeshes.values()){this.scene.remove(m);this.dispose(m);}this.markerMeshes.clear();
    this.localInput={fire:false};this.nextLocalShot=0;
    for(const trace of this.fadingTraces){this.scene.remove(trace.object);this.dispose(trace.object);}this.fadingTraces=[];
  }
  setMode(mode){if(mode===this.mode)return;this.mode=mode;this.preview.visible=mode==='home'||mode==='lobby';if(this.preview.visible)this.clearMatch();}
  setState(state,selfId){
    this.changeMap(state.mapId||'candy');
    const entering=state.phase==='playing'&&(this.mode!=='playing'||this.round!==state.round);
    if(this.round!==state.round){this.clearMatch();this.round=state.round;this.cameraYaw=Math.PI;this.cameraPitch=.12;}
    this.state=state;this.selfId=selfId;this.setMode(state.phase==='lobby'?'lobby':'playing');if(state.phase==='lobby')return;
    if(entering){const me=state.players.find(p=>p.id===selfId);if(me)this.target.set(me.x,(me.y||0)+1.65,me.z);}
    this.obstacleStates=new Map((state.obstacles||[]).map(o=>[o.id,o]));
    for(const [id,g]of this.obstacleMeshes){const s=this.obstacleStates.get(id);g.visible=!s?.destroyed;if(g.userData.lid)g.userData.lid.rotation.x=s?.open?-1.4:0;if(g.userData.panel&&g.userData.obstacle.kind==='gate')g.userData.panel.rotation.y=s?.open?-Math.PI/2:0;}
    for(const p of state.players){
      let a=this.actors.get(p.id);if(!a){a=avatar(p.outfit,p.hat);a.position.set(p.x,p.y||0,p.z);const flash=sphere(.23,'#b9ffff',a.userData.gun,0,0,.67,7);flash.material=new THREE.MeshBasicMaterial({color:'#b9ffff',toneMapped:false});flash.visible=false;a.userData.flash=flash;this.scene.add(a);this.actors.set(p.id,a);}
      resetRespawnVisual(a,p,object=>this.dispose(object));
      if(a.userData.hp!==undefined&&p.hp<a.userData.hp)this.splash(p.x,(p.y||0)+1.3,p.z,p.alive?'#65e9ff':'#ffe0a5',p.alive?4:10);
      if((p.shots||0)>(a.userData.shots||0))a.userData.flashUntil=this.clock+.08;
      a.userData.shots=p.shots||0;a.userData.hp=p.hp;a.userData.target=p;
      const w=p.inventory?.[p.slot||0];a.userData.gun.visible=!!w;a.userData.scope.visible=!!p.scope;
      a.userData.aura.visible=!!p.effect||!!p.team;a.userData.wings.visible=p.effect==='flight';a.userData.halo.material.color.set(SKILLS[p.effect]?.color||(p.team===1?'#58caff':p.team===2?'#ff9c59':'#89ffb4'));
      if(w){a.userData.gun.scale.set(w.id==='candy'?1.3:1,1,w.id==='bubble'?1.4:1);a.userData.gun.children[0].material=mat(WEAPONS[w.id].color);}
      if(!p.alive&&a.userData.deadAt===null){a.userData.deadAt=this.clock;const effect=new THREE.Group();a.add(effect);a.userData.deathVisual=effect;const balloon=sphere(.6,'#ef9cb8',effect,0,3.4,0);balloon.scale.y=1.25;cylinder(.012,.012,1.2,'#ffe9cc',effect,0,2.8,0,5);}
    }
    const ids=new Set(state.players.map(p=>p.id));for(const[id,a]of this.actors)if(!ids.has(id)){this.scene.remove(a);this.dispose(a);this.actors.delete(id);}
    const bids=new Set(state.bullets.map(b=>b.id));for(const[id,b]of this.projectiles)if(!bids.has(id)){this.fadingTraces.push({object:b,life:.18});this.projectiles.delete(id);}
    for(const b of state.bullets){let obj=this.projectiles.get(b.id);if(!obj){obj=new THREE.Group();const color=b.weapon==='rocket'?'#ff9b58':WEAPONS[b.weapon]?.color||'#57e9ff';const core=new THREE.Mesh(new THREE.BoxGeometry(.065,.065,2.8),new THREE.MeshBasicMaterial({color:'#efffff',toneMapped:false}));core.position.z=-1.4;const glow=new THREE.Mesh(new THREE.BoxGeometry(.16,.16,2.6),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.65,toneMapped:false,depthWrite:false}));glow.position.z=-1.3;obj.add(core,glow);if(b.weapon==='rocket'){core.scale.set(2,2,7);core.position.z=-10;glow.scale.set(3,3,7);glow.position.z=-9;const missile=mesh(new THREE.ConeGeometry(.3,1.2,8),'#ffda86',obj,0,0,.4);missile.rotation.x=Math.PI/2;}const head=sphere(.16,color,obj,0,0,0,6);head.material=new THREE.MeshBasicMaterial({color,toneMapped:false});this.scene.add(obj);this.projectiles.set(b.id,obj);}obj.userData={...b,at:this.clock};obj.position.set(b.x,b.y,b.z);obj.lookAt(b.x+b.vx,b.y+b.vy,b.z+b.vz);}
    const lids=new Set((state.loot||[]).map(l=>l.id));for(const[id,l]of this.lootMeshes)if(!lids.has(id)){this.scene.remove(l);this.dispose(l);this.lootMeshes.delete(id);}
    for(const l of state.loot||[]){let obj=this.lootMeshes.get(l.id);if(!obj){obj=this.makeLoot(l);this.scene.add(obj);this.lootMeshes.set(l.id,obj);}obj.userData.loot=l;obj.position.set(l.x,(l.y||0)+.3,l.z);}
    const mids=new Set((state.markers||[]).map(m=>m.id));for(const[id,m]of this.markerMeshes)if(!mids.has(id)){this.scene.remove(m);this.dispose(m);this.markerMeshes.delete(id);}
    for(const marker of state.markers||[]){if(this.markerMeshes.has(marker.id))continue;const g=new THREE.Group(),color=marker.player===selfId?'#6ef8ff':'#ffe282';
      const ring=new THREE.Mesh(new THREE.TorusGeometry(.85,.08,5,24),new THREE.MeshBasicMaterial({color,toneMapped:false}));ring.rotation.x=-Math.PI/2;g.add(ring);
      const beam=new THREE.Mesh(new THREE.CylinderGeometry(.08,.08,7,6),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.6,depthWrite:false,toneMapped:false}));beam.position.y=3.5;g.add(beam);
      const tip=new THREE.Mesh(new THREE.OctahedronGeometry(.45),new THREE.MeshBasicMaterial({color,toneMapped:false}));tip.position.y=7;g.add(tip);g.position.set(marker.x,.18,marker.z);this.scene.add(g);this.markerMeshes.set(marker.id,g);}
    for(const p of state.pickups){const obj=this.pickupMeshes.get(p.id);if(obj)obj.visible=p.active;}
    const zone=state.zone||{x:0,z:0,radius:state.radius};this.zone.position.set(zone.x,.14,zone.z);this.zone.scale.setScalar(zone.radius);this.zoneWall.position.set(zone.x,5,zone.z);this.zoneWall.scale.set(zone.radius,10,zone.radius);
  }
  rotateCamera(dx,dy){const zoom=this.scoped?.42:1;this.cameraYaw-=dx*.004*this.sensitivity*zoom;this.cameraPitch=clamp(this.cameraPitch+dy*.003*this.sensitivity*zoom*(this.invertY?-1:1),-.5,.78);}
  movement(x,z){return{x:-Math.cos(this.cameraYaw)*x-Math.sin(this.cameraYaw)*z,z:Math.sin(this.cameraYaw)*x-Math.cos(this.cameraYaw)*z};}
  aimAt(actor){
    this.raycaster.setFromCamera(new THREE.Vector2(0,0),this.followCamera);const ray=this.raycaster.ray;let distance=this.map.radius*2+20;
    if(ray.direction.y<-.001){const t=-ray.origin.y/ray.direction.y;if(t>0)distance=Math.min(distance,t);}
    const end=ray.at(distance,new THREE.Vector3());
    for(const o of this.map.obstacles)if(obstacleSolid(o,this.obstacleStates)){const t=obstacleHit(ray.origin.x,ray.origin.y,ray.origin.z,end.x,end.y,end.z,o);if(t!==null)distance=Math.min(distance,t*ray.origin.distanceTo(end));}
    const hitCandidates=[];
    for(const p of this.state?.players||[])if(p.alive&&p.id!==this.selfId&&(!p.concealed||Math.hypot(p.x-actor.x,p.z-actor.z)<5))hitCandidates.push({x:p.x,z:p.z,r:RULES.playerRadius,low:p.y+.15,high:p.y+2.6});
    for(const o of hitCandidates){const t=cylinderHit(ray.origin.x,ray.origin.y,ray.origin.z,end.x,end.y,end.z,o.x,o.z,o.r,o.low,o.high);if(t!==null)distance=Math.min(distance,t*ray.origin.distanceTo(end));}
    const point=ray.at(distance,new THREE.Vector3()),dx=point.x-actor.x,dz=point.z-actor.z;
    const yaw=Math.atan2(dx,dz),mx=actor.x-Math.cos(yaw)*.42,mz=actor.z+Math.sin(yaw)*.42;
    return{aim:Math.atan2(point.x-mx,point.z-mz),pitch:Math.atan2(point.y-(actor.y+1.25),Math.hypot(point.x-mx,point.z-mz))};
  }
  splash(x,y,z,color,count){if(this.lowDetail)count=Math.ceil(count/2);for(let i=0;i<count;i++){const o=sphere(.07+Math.random()*.1,color,this.scene,x,y,z,6);o.castShadow=false;this.particles.push({o,vx:(Math.random()-.5)*5,vy:2+Math.random()*3,vz:(Math.random()-.5)*5,life:.6});}}
  frame(dt){
    this.clock+=dt;const t=this.clock,mobile=this.width<=700,playing=this.mode==='playing';let viewportHeight=this.height;
    const me=this.state?.players.find(p=>p.id===this.selfId),gun=me?.inventory?.[me.slot||0];
    if(this.state?.phase==='playing'&&me?.alive&&this.localInput.fire&&gun&&me.reload<=0&&(!this.map.survival||gun.mag>0)&&t>=this.nextLocalShot){
      this.nextLocalShot=t+WEAPONS[gun.id].interval;const model=this.actors.get(this.selfId);if(model)model.userData.flashUntil=t+.07;this.onLocalShot?.(gun.id);
    }
    for(const[id,a]of this.actors){const p=a.userData.target;if(!p)continue;const dying=a.userData.deadAt!==null,age=dying?t-a.userData.deadAt:0;a.visible=age<3&&!(id===this.selfId&&this.scoped)&&!(p.concealed&&id!==this.selfId&&me&&(!this.state.teamSize||p.team!==me.team)&&Math.hypot(p.x-me.x,p.z-me.z)>5);
      a.userData.halo.rotation.z=t*2;a.userData.wings.rotation.z=Math.sin(t*9)*.12;
      const local=id===this.selfId&&p.alive,follow=local?36:22;
      a.position.x=THREE.MathUtils.damp(a.position.x,p.x,follow,dt);a.position.z=THREE.MathUtils.damp(a.position.z,p.z,follow,dt);
      const bob=p.grounded&&p.moving?Math.abs(Math.sin(t*(p.sprinting?18:12)))*.055:0;
      a.position.y=THREE.MathUtils.damp(a.position.y,(p.y||0)+(dying?age*3:bob),25,dt);
      const aim=local&&Number.isFinite(this.localInput.aim)?this.localInput.aim:p.aim,pitch=local&&Number.isFinite(this.localInput.pitch)?this.localInput.pitch:p.pitch;
      const diff=Math.atan2(Math.sin(aim-a.rotation.y),Math.cos(aim-a.rotation.y));a.rotation.y+=diff*(1-Math.exp(-dt*(local?36:20)));a.rotation.x=p.sprinting?.08:0;
      a.userData.legs[0].rotation.x=p.climbing?Math.sin(t*9)*.6:!p.grounded?-.4:p.moving?Math.sin(t*(p.sprinting?18:12))*(p.sprinting?.75:.5):0;
      a.userData.legs[1].rotation.x=!p.grounded?.5:p.moving?-a.userData.legs[0].rotation.x:0;a.userData.gun.rotation.x=-(pitch||0);a.userData.flash.visible=t<(a.userData.flashUntil||0);a.userData.gun.position.z=THREE.MathUtils.damp(a.userData.gun.position.z,a.userData.flash.visible?.45:.54,25,dt);
    }
    if(playing){
      this.camera=this.followCamera;let p=this.state?.players.find(p=>p.id===this.selfId);if(!p?.alive)p=this.state?.players.find(p=>p.alive)||p;
      const model=this.actors.get(p?.id),pos=model?.position||new THREE.Vector3(p?.x||0,p?.y||0,p?.z||0);
      this.desiredTarget.set(pos.x,pos.y+1.65,pos.z);this.target.lerp(this.desiredTarget,1-Math.exp(-dt*28));
      const dir=new THREE.Vector3(Math.sin(this.cameraYaw)*Math.cos(this.cameraPitch),-Math.sin(this.cameraPitch),Math.cos(this.cameraYaw)*Math.cos(this.cameraPitch));
      const right=new THREE.Vector3(-Math.cos(this.cameraYaw),0,Math.sin(this.cameraYaw));let cam=this.target.clone().addScaledVector(dir,-(this.scoped?.25:(this.cameraDistance||(mobile?8.5:7.5)))).addScaledVector(right,this.scoped?0:mobile?1.2:2.3);
      let limit=1;for(const o of this.map.obstacles)if(obstacleSolid(o,this.obstacleStates)){const hit=obstacleHit(this.target.x,this.target.y,this.target.z,cam.x,cam.y,cam.z,o,.3);if(hit!==null)limit=Math.min(limit,Math.max(.15,hit-.06));}
      cam=this.target.clone().lerp(cam,limit);cam.y=Math.max(.45,cam.y);this.camera.position.copy(cam);this.camera.lookAt(this.target.clone().addScaledVector(dir,30));
      this.camera.aspect=this.width/this.height;this.camera.fov=THREE.MathUtils.damp(this.camera.fov,this.scoped?24:p?.sprinting?76:mobile?72:65,12,dt);this.camera.updateProjectionMatrix();
      this.sun.position.set(pos.x-23,pos.y+40,pos.z+20);this.sun.target.position.set(pos.x,0,pos.z);
    }else{
      this.camera=this.previewCamera;let span=22;if(mobile&&this.mode==='home'){viewportHeight=Math.min(420,this.height*.57);span=14;this.desiredTarget.set(0,0,1);}else this.desiredTarget.set(mobile?0:-13,0,3);
      this.target.lerp(this.desiredTarget,1-Math.exp(-dt*3));const ratio=this.width/viewportHeight;this.camera.left=-span*ratio;this.camera.right=span*ratio;this.camera.top=span;this.camera.bottom=-span;this.camera.updateProjectionMatrix();this.camera.position.set(this.target.x,35,this.target.z+28);this.camera.lookAt(this.target);
      this.preview.children.forEach((a,i)=>{a.position.y=.05+Math.sin(t*2+i)*.045;a.rotation.z=Math.sin(t*1.5+i)*.018;});
    }
    this.camera.updateMatrixWorld();
    for(const b of this.projectiles.values()){const d=b.userData,elapsed=Math.min(.08,t-d.at),speed=d.speed||WEAPONS[d.weapon]?.speed||58;b.position.set(d.x+d.vx*speed*elapsed,d.y+d.vy*speed*elapsed,d.z+d.vz*speed*elapsed);}
    this.fadingTraces=this.fadingTraces.filter(trace=>{trace.life-=dt;trace.object.traverse(o=>{if(o.material){o.material.transparent=true;o.material.opacity=Math.max(0,trace.life/.18)*.7;}});if(trace.life<=0){this.scene.remove(trace.object);this.dispose(trace.object);return false;}return true;});
    for(const[id,o]of this.lootMeshes){const l=o.userData.loot;o.position.y=(l.y||0)+.32+Math.sin(t*2.3+l.x)*.12;o.rotation.y=t*.65;o.visible=!playing||Math.hypot(l.x-this.target.x,l.z-this.target.z)<65;}
    for(const[id,o]of this.pickupMeshes){o.position.y=.4+Math.sin(t*2.3+id)*.12;o.rotation.y=t*.5;}
    for(const[id,g]of this.obstacleMeshes){const o=g.userData.obstacle;g.visible=!this.obstacleStates.get(id)?.destroyed&&Math.hypot(o.x-this.target.x,o.z-this.target.z)<(playing?(this.scoped?240:140):80);if(g.userData.leaves){const inside=me&&obstacleContains(o,me.x,me.z)&&me.y<o.h;for(const leaf of g.userData.leaves){leaf.material.transparent=!!inside;leaf.material.opacity=inside?.23:1;leaf.material.depthWrite=!inside;}}}
    this.particles=this.particles.filter(p=>{p.life-=dt;p.vy-=dt*10;p.o.position.x+=p.vx*dt;p.o.position.y+=p.vy*dt;p.o.position.z+=p.vz*dt;p.o.scale.multiplyScalar(Math.exp(-dt*2));if(p.life<=0){this.scene.remove(p.o);p.o.geometry.dispose();return false;}return true;});
    this.zone.visible=playing;this.zoneWall.visible=playing;this.renderer.setViewport(0,0,this.width,this.height);this.renderer.clear();this.renderer.setViewport(0,this.height-viewportHeight,this.width,viewportHeight);this.renderer.render(this.scene,this.camera);
  }
}
