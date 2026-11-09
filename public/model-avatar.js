// Model-based avatar (VRM) that honours the same userData contract as the
// procedural avatar() in scene.js: legs[], gun, scope, aura, halo, wings,
// signature, deadAt. The VRM is loaded once per file (bytes cached), then
// parsed per actor so every actor owns its spring-bone / expression state.
import * as THREE from 'three';
import { createGunSlot } from './asset-models.js';
let vrmLibPromise = null;
function vrmLib() {
  if (!vrmLibPromise) vrmLibPromise = import('/vendor/vrm-bundle.module.js');
  return vrmLibPromise;
}

// Per-model config: VRM url, gun mount (gun-local x/y are free; z stays .54
// because scene.js damps it there) and the aim pose solved on that model's
// own skeleton so its hands land on the grip (see tools/probe-ik3.mjs).
const MODELS = {
  juanita: {
    url: '/models/juanita.vrm',
    gun: [-.22, 1.14, .54],
    pose: {
      spine: [-10, 0, 0], neck: [4, 0, 0], head: [8, 0, 0],
      rightUpperArm: [0, 86, -32], rightLowerArm: [0, -6, 24],
      leftUpperArm: [0, -112, 9], leftLowerArm: [0, -15, 3],
    },
  },
  anna: {
    url: '/models/anna.vrm',
    // Anna's rig is adult-proportioned (shoulders near y≈1.7 at uniform
    // game height, vs Juanita's ≈1.22). Ken asked for her shrunk into
    // the chibi line-up, then raised a touch after seeing ~1.96: keep
    // her width, squash by squashY at height 2.7, so she ends ~2.3 tall
    // with a relatively bigger head and stubbier legs. Gun mount and
    // pose were re-solved on the squashed skeleton (tools/probe-anna.mjs).
    height: 2.7, squashY: .85,
    gun: [-.26, 1.62, .54],
    pose: {
      spine: [-10, 0, 0], neck: [4, 0, 0], head: [8, 0, 0],
      rightUpperArm: [0, 87, -52], rightLowerArm: [0, -17, 46],
      leftUpperArm: [0, -94, 12], leftLowerArm: [0, -58, -5],
    },
  },
  // StrawberryPrincess (100 Avatars R3 #291, CC0): a mascot, not a person —
  // long stick arms hang off a giant head-body and a leaf collar swallows
  // the gun at chest height, so the mount sits low and near centre where
  // both stick hands can converge (solved with tools/probe-strawberry.mjs:
  // right hand 0.012 off the grip, left hand 0.001 off the gun body). The
  // blaster still overlaps the lowest leaf tips at this height; that is
  // the price of a two-handed hold on this skeleton.
  strawberry: {
    url: '/models/strawberry.vrm',
    gun: [-.06, 1.15, .54],
    pose: {
      spine: [-10, 0, 0], neck: [4, 0, 0], head: [8, 0, 0],
      rightUpperArm: [0, 124, -18], rightLowerArm: [0, 38, -3],
      leftUpperArm: [0, -126, 9], leftLowerArm: [0, -45, -2],
    },
  },
  // AjoMajo (100 Avatars R3 #282, CC0): axolotl mascot with near-human
  // proportions but very short arms (0.48 vs Juanita's ~0.55), so the gun
  // rides high and close (mount/pose solved with tools/probe-ajo.mjs:
  // right hand 0.020 off the grip). Her left arm is 0.145 short of the
  // standard support point no matter the mount — the hand rests against
  // the gun's rear body instead; that is this skeleton's physical limit.
  ajo: {
    url: '/models/ajo.vrm',
    gun: [-.14, 1.5, .54],
    pose: {
      spine: [-10, 0, 0], neck: [4, 0, 0], head: [8, 0, 0],
      rightUpperArm: [0, 124, 3], rightLowerArm: [0, -8, -5],
      leftUpperArm: [0, -142, -16], leftLowerArm: [0, 3, 0],
    },
  },
};
const TARGET_HEIGHT = 2.7; // same height as the procedural avatars (Ken approved scaling up from 2.45)
const bytesCache = new Map();

async function fetchBytes(url) {
  if (!bytesCache.has(url)) bytesCache.set(url, fetch(url).then(r => {
    if (!r.ok) throw new Error('model fetch ' + r.status);
    return r.arrayBuffer();
  }));
  return bytesCache.get(url);
}

async function loadVrm(url) {
  const bytes = await fetchBytes(url);
  const { GLTFLoader, VRMLoaderPlugin, VRMUtils } = await vrmLib();
  const loader = new GLTFLoader();
  loader.register(parser => new VRMLoaderPlugin(parser));
  const gltf = await loader.parseAsync(bytes.slice(0), url);
  const vrm = gltf.userData.vrm;
  if (vrm) VRMUtils.rotateVRM0(vrm); // VRM 0.x faces -Z; game actors face +Z
  return vrm;
}

function buildGun(g, mountPos) {
  // Mounted closer to the body centre than the procedural avatars' gun
  // (-.58, 1.25): these chibi arms are only ~0.545 units long, so the
  // grip has to sit here for her posed hands to actually reach it. scene.js
  // only drives this group's rotation.x, position.z, scale and visibility.
  const gun = new THREE.Group(); gun.position.set(mountPos[0], mountPos[1], mountPos[2]); g.add(gun);
  const std = c => new THREE.MeshStandardMaterial({ color: c, roughness: .6 });
  const add = (geo, color, x, y, z) => { const o = new THREE.Mesh(geo, std(color)); o.position.set(x, y, z); o.castShadow = true; gun.add(o); return o; };
  const body = add(new THREE.BoxGeometry(.3, .25, .58), '#73cacc', 0, 0, .1);
  const grip = add(new THREE.BoxGeometry(.16, .25, .16), '#ef936e', 0, -.19, -.04);
  const tank = add(new THREE.CylinderGeometry(.13, .13, .28, 10), '#f8d275', 0, .23, .03);
  const nozzle = add(new THREE.CylinderGeometry(.09, .09, .21, 10), '#f39270', 0, 0, .48); nozzle.rotation.x = Math.PI / 2;
  // Kenney blaster slot: the meshes above stay as the instant placeholder
  // (body remains gun.children[0] for setState's per-weapon tint) and are
  // hidden once the matching blaster GLB arrives.
  gun.userData.placeholderMeshes = [body, grip, tank, nozzle];
  createGunSlot(gun);
  const scope = new THREE.Group(); gun.add(scope); scope.visible = false;
  const lens = new THREE.Mesh(new THREE.CylinderGeometry(.11, .11, .45, 10), std('#32484f')); lens.rotation.x = Math.PI / 2; lens.position.set(0, .25, .17); scope.add(lens);
  const mount = new THREE.Mesh(new THREE.BoxGeometry(.1, .12, .14), std('#526b69')); mount.position.set(0, .11, .12); scope.add(mount);
  return { gun, scope };
}

function buildAura(g) {
  const aura = new THREE.Group(); g.add(aura); aura.visible = false;
  const halo = new THREE.Mesh(new THREE.TorusGeometry(.85, .065, 6, 24), new THREE.MeshBasicMaterial({ color: '#89ffb4', transparent: true, opacity: .8, depthWrite: false, toneMapped: false }));
  halo.rotation.x = -Math.PI / 2; halo.position.y = .2; aura.add(halo);
  const wings = new THREE.Group(); aura.add(wings);
  for (const sign of [-1, 1]) {
    const wing = new THREE.Mesh(new THREE.SphereGeometry(.65, 10, 8), new THREE.MeshStandardMaterial({ color: '#dac8ff', roughness: .86 }));
    wing.position.set(sign * .9, 1.5, -.15); wing.scale.set(1.3, .18, .7); wing.rotation.z = sign * .5; wings.add(wing);
  }
  return { aura, halo, wings };
}

const stillLegs = [{ rotation: { x: 0 } }, { rotation: { x: 0 } }];

export function modelAvatar(outfit, hat) {
  const g = new THREE.Group();
  const cfg = MODELS[outfit.model] || {};
  const url = cfg.url;
  const { gun, scope } = buildGun(g, cfg.gun || [-.22, 1.14, .54]);
  const { aura, halo, wings } = buildAura(g);
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(.68, 24), new THREE.MeshBasicMaterial({ color: '#2c635a', transparent: true, opacity: .13, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = .025; shadow.castShadow = false; g.add(shadow);
  g.userData = { scope, aura, halo, wings, legs: stillLegs, signature: `${outfit.id}/${hat}`, gun, deadAt: null, modelPending: true };
  if (!url) { g.userData.modelPending = false; return g; }
  loadVrm(url).then(vrm => {
    if (!vrm) { g.userData.modelPending = false; return; }
    const scene = vrm.scene;
    const box = new THREE.Box3().setFromObject(scene);
    const natural = Math.max(.1, box.max.y - box.min.y);
    const s = (cfg.height || TARGET_HEIGHT) / natural;
    const sy = s * (cfg.squashY || 1); // non-uniform squash (Anna) shortens Y only
    scene.scale.set(s, sy, s);
    scene.position.y = -box.min.y * sy;
    scene.traverse(o => { if (o.isMesh) { o.castShadow = true; o.frustumCulled = false; } });
    g.add(scene);
    const humanoid = vrm.humanoid;
    const legL = humanoid?.getNormalizedBoneNode?.('leftUpperLeg');
    const legR = humanoid?.getNormalizedBoneNode?.('rightUpperLeg');
    if (legL && legR) g.userData.legs = [legL, legR];
    // Aim pose (per-model, in MODELS above) so she actually HOLDS the gun
    // instead of standing in the model's rest T-pose: spine leans forward,
    // head/neck counter the lean so her face stays level, right hand lands
    // on the grip, left hand supports the gun body from below.
    // Set once on the normalized bones; vrm.update() in the frame loop
    // re-applies them to the raw bones every frame, like the leg swing.
    const DEG = Math.PI / 180;
    const AIM_POSE = cfg.pose || {};
    for (const [bone, [x, y, z]] of Object.entries(AIM_POSE)) {
      const node = humanoid?.getNormalizedBoneNode?.(bone);
      if (node) node.rotation.set(x * DEG, y * DEG, z * DEG);
    }
    // Apply once right away: pages that never call vrm.update() per frame
    // (e.g. the character gallery) would otherwise keep the bind T-pose,
    // because normalized-bone rotations only reach the skinned mesh
    // through humanoid.update().
    vrm.update?.(1 / 60);
    g.userData.vrm = vrm;
    g.userData.modelPending = false;
  }).catch(err => { console.warn('VRM load failed', err); g.userData.modelPending = false; });
  return g;
}
