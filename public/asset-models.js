// Shared Kenney CC0 GLB loading for scene.js / model-avatar.js.
// Templates are fetched+parsed once per URL, then cloned per instance.
// Everything loads lazily and asynchronously: callers always show their
// procedural placeholder first and swap the real model in when it arrives;
// any failure is swallowed so the placeholder simply stays.
import * as THREE from 'three';

let libPromise = null;
function gltfLib() {
  if (!libPromise) libPromise = import('/vendor/vrm-bundle.module.js');
  return libPromise;
}

const bytesCache = new Map();
function fetchBytes(url) {
  if (!bytesCache.has(url)) bytesCache.set(url, fetch(url).then(r => {
    if (!r.ok) throw new Error('asset fetch ' + r.status);
    return r.arrayBuffer();
  }));
  return bytesCache.get(url);
}

const templateCache = new Map();
export function loadTemplate(url) {
  if (!templateCache.has(url)) {
    const promise = (async () => {
      const bytes = await fetchBytes(url);
      const { GLTFLoader } = await gltfLib();
      const loader = new GLTFLoader();
      // parseAsync's path is the BASE directory external resources resolve
      // against (e.g. the blasters' shared "Textures/colormap.png"), so pass
      // the folder, not the file URL.
      const gltf = await loader.parseAsync(bytes.slice(0), url.slice(0, url.lastIndexOf('/') + 1));
      const root = gltf.scene;
      root.traverse(o => {
        if (!o.isMesh) return;
        o.castShadow = true; o.receiveShadow = true;
        // Kenney nature GLBs ship metallicFactor=1 with flat colours, which
        // renders near-black under plain PBR lighting; neutralise it.
        // (Blaster materials carry a texture map and metallicFactor=0
        // already, so they are left untouched.)
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        for (const m of mats) if (m && m.isMeshStandardMaterial && !m.map) {
          m.metalness = 0; m.roughness = 0.92;
          // Kenney's authored foliage palette is a pale teal that reads as
          // ice at map scale; pull leaf/grass materials toward the game's
          // deep greens (flat colours, so a multiply keeps the variation
          // between leafsGreen / leafsDark / grass).
          if (/leaf|grass/i.test(m.name || '')) m.color.multiply(new THREE.Color(0.30, 0.62, 0.24));
        }
      });
      return root;
    })();
    promise.catch(() => templateCache.delete(url));
    templateCache.set(url, promise);
  }
  return templateCache.get(url);
}

// Clone the template for `url` into `parent`; onLoaded(clone) runs after the
// swap so callers can hide placeholders / rewire userData.
export function attachModel(parent, url, { scale = [1, 1, 1], pos = [0, 0, 0], rotY = 0, onLoaded = null } = {}) {
  loadTemplate(url).then(tpl => {
    const m = tpl.clone(true);
    m.scale.set(scale[0], scale[1], scale[2]);
    m.position.set(pos[0], pos[1], pos[2]);
    m.rotation.y = rotY;
    parent.add(m);
    if (onLoaded) onLoaded(m);
  }).catch(() => {});
}

export function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// --- Gun slot ---------------------------------------------------------------
// Every avatar gun group keeps its procedural placeholder meshes as
// gun.userData.placeholderMeshes (children[0] stays the tintable body, which
// scene.setState recolours per weapon). The slot swaps in the matching
// Kenney blaster and hides the placeholder once the GLB has loaded.
// grip = point on the blaster (model units) that must land on the
// placeholder grip centre (0, -0.19, -0.04) in gun-local space, so posed
// hands keep touching the handle. Blaster long axis is +Z (muzzle at +Z),
// same as the game's gun group.
export const BLASTERS = {
  water: { file: 'blaster-a.glb', scale: 1.0, grip: [0, -0.20, -0.06] },
  spray: { file: 'blaster-e.glb', scale: 0.55, grip: [0, -0.10, 0.30] },
  candy: { file: 'blaster-h.glb', scale: 1.30, grip: [0, -0.09, -0.02] },
  bubble: { file: 'blaster-r.glb', scale: 1.20, grip: [0, -0.11, 0.02] },
};
const GRIP_TARGET = [0, -0.19, -0.04];

export function createGunSlot(gun) {
  const slot = new THREE.Group();
  slot.name = 'blaster-slot';
  gun.add(slot);
  gun.userData.blasterSlot = slot;
  gun.userData.blasterWeapon = null;
  setGunWeapon(gun, 'water');
  return slot;
}

export function setGunWeapon(gun, weaponId) {
  if (!gun || !gun.userData.blasterSlot || gun.userData.blasterWeapon === weaponId) return;
  const cfg = BLASTERS[weaponId];
  if (!cfg) return;
  gun.userData.blasterWeapon = weaponId;
  const slot = gun.userData.blasterSlot;
  while (slot.children.length) slot.remove(slot.children[0]);
  if (gun.userData.placeholderMeshes) for (const m of gun.userData.placeholderMeshes) m.visible = true;
  loadTemplate('/models/' + cfg.file).then(tpl => {
    if (gun.userData.blasterWeapon !== weaponId) return; // weapon changed again meanwhile
    while (slot.children.length) slot.remove(slot.children[0]);
    const m = tpl.clone(true);
    const s = cfg.scale;
    m.scale.setScalar(s);
    m.position.set(
      GRIP_TARGET[0] - cfg.grip[0] * s,
      GRIP_TARGET[1] - cfg.grip[1] * s,
      GRIP_TARGET[2] - cfg.grip[2] * s
    );
    slot.add(m);
    gun.userData.blasterLoaded = weaponId;
    if (gun.userData.placeholderMeshes) for (const p of gun.userData.placeholderMeshes) p.visible = false;
  }).catch(() => {});
}

// Weapon loot lying on the ground: centre the blaster over the loot ring
// and hide the blocky placeholder once loaded.
export function attachLootBlaster(group, weaponId, placeholders) {
  const cfg = BLASTERS[weaponId];
  if (!cfg) return;
  loadTemplate('/models/' + cfg.file).then(tpl => {
    const m = tpl.clone(true);
    const box = new THREE.Box3().setFromObject(m);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const s = 0.95 / Math.max(size.x, size.y, size.z, 0.001);
    m.scale.setScalar(s);
    m.position.set(-center.x * s, 0.45 - center.y * s, -center.z * s);
    group.add(m);
    for (const p of placeholders) p.visible = false;
  }).catch(() => {});
}
