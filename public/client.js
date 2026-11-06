import { IslandScene } from './scene.js';
import { createMenus } from './menus.js';
import { createPlayGuard } from './play-guard.js';
import { createMouseLock } from './mouse-lock.js';
import { createFullscreen } from './fullscreen.js';
import { RULES, OUTFITS, HATS, WEAPONS, SKILLS, getMap, visible } from '/shared.js';

const $ = id => document.getElementById(id);
let world;
try { world = new IslandScene($('world')); }
catch (error) { $('fatal').hidden = false; $('fatal-message').textContent = 'Trình duyệt cần bật WebGL để hiển thị đảo. Hãy thử Chrome/Edge mới hoặc bật tăng tốc đồ họa. ' + error.message; throw error; }
const safeStore = {
  get(key, fallback = '') { try { return localStorage.getItem(key) || fallback; } catch { return fallback; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch {} }
};
const sessionStore = {
  get() { try { return sessionStorage.getItem('chibi-session'); } catch { return null; } },
  set(value) { try { if (value) sessionStorage.setItem('chibi-session', value); else sessionStorage.removeItem('chibi-session'); } catch {} }
};
let outfit = safeStore.get('chibi-outfit', 'bear'), hat = safeStore.get('chibi-hat', 'ears');
let selectedMap = safeStore.get('chibi-map', 'frontier'), activeMap = getMap(selectedMap); selectedMap = activeMap.id;
$('map-select').value = selectedMap;
function selectMap() {
  selectedMap = getMap($('map-select').value).id; activeMap = getMap(selectedMap); safeStore.set('chibi-map', selectedMap); world.changeMap(selectedMap);
  $('match-duration-tag').innerHTML = activeMap.survival ? '<b>10′</b> sinh tồn' : '<b>3′</b> đấu trường';
  $('room-size').querySelector('[value="20"]').disabled=selectedMap!=='frontier';if(selectedMap!=='frontier'&&$('room-size').value==='20')$('room-size').value='3';$('respawn-mode').disabled=selectedMap!=='candy';document.querySelector('.mode-chips span:nth-child(2) b').textContent=`1–${$('room-size').value}`;
  $('hero-map-name').textContent = activeMap.name.toLocaleUpperCase('vi');
  $('hero-map-heading').innerHTML = activeMap.survival ? 'Đảo rộng hơn.<br>Phiêu lưu xa hơn.' : 'Đảo nhỏ.<br>Niềm vui lớn.';
  $('hero-map-subtitle').textContent = activeMap.survival ? `DIỆN TÍCH ${activeMap.areaMultiplier}× / GÓC NHÌN THỨ BA` : 'ĐẤU TRƯỜNG NHANH / GÓC NHÌN THỨ BA';
  $('preview-note').textContent = activeMap.id==='frontier' ? 'Núp trong cây · Leo chòi · Săn kỹ năng' : activeMap.survival ? 'Nhảy qua bục · Nhặt súng · Chạy vào bo' : 'Chạy nhảy · Bắn nước · Vui cùng bạn';
}
$('room-size').onchange=selectMap;$('respawn-mode').onchange=selectMap;
$('map-select').onchange = selectMap; selectMap();
if (!OUTFITS.some(o => o.id === outfit)) outfit = 'bear'; if (!HATS.includes(hat)) hat = 'ears';
let ws, identity = null, state = null, retry = 0, retryTimer, toastTimer, pending = false, previewSignature = '', lastPhase = '', lastRound = 0, lastEvent = 0;
let lastZoneKey = '';
const keys = new Set(), pointer = { x: 0, y: 0, down: false, look: false }, touch = { x: 0, z: 0, fire: false, sprint: false };
const actions = { jump: false, interact: false, reload: false, swap: false, heal: false, skill: false };
let mouseLock, playGuard, scoped=false;
let audio = null, menus, soundEnabled = safeStore.get('chibi-sound', 'off') === 'on', latency = 0, resumed = false;
let lastHealth = null, damageTimer, firingTimer, feedSignature = '', compassAt = 0;
$('player-name').value = safeStore.get('chibi-name');
const invitedRoom = new URL(location.href).searchParams.get('room'); if (invitedRoom) $('room-code').value = invitedRoom.toUpperCase().slice(0, 6);
function toast(message) { $('toast').textContent = message; $('toast').hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { $('toast').hidden = true; }, 4200); }
function send(data) { if (ws?.readyState !== WebSocket.OPEN) { toast('Đang kết nối lại máy chủ. Chờ một chút nhé.'); return false; } ws.send(JSON.stringify(data)); return true; }
function connection(online, text) { $('connection').classList.toggle('online', online); $('connection').lastChild.textContent = ' ' + text; }
function setPending(value) { pending = value; $('create').disabled = value; $('solo').disabled = value; }
function resetInput() { setScoped(false); keys.clear(); pointer.down = false; pointer.look = false; lookPointer = null; joystickPointer = null; touch.x = 0; touch.z = 0; touch.fire = false; touch.sprint = false; for (const key of Object.keys(actions)) actions[key] = false; $('touch-sprint').classList.remove('active'); $('joystick-knob').style.transform = ''; world.setLocalInput({fire:false}); flushInput(); }
function home() {
  mouseLock?.release();
  identity = null; state = null; sessionStore.set(null); lastPhase = ''; lastEvent = 0; lastRound = 0; pending = false;
  $('home').hidden = false; $('lobby').hidden = true; $('hud').hidden = true; $('results').hidden = true;
  document.body.classList.remove('playing','lobby-mode'); world.setMode('home'); world.updatePreview(outfit, hat); resetInput();
  activeMap = getMap(selectedMap); world.changeMap(selectedMap);
  setPending(false);
  lastHealth = null; menus?.refreshNotice(); $('damage-vignette').classList.remove('visible');
}
function connect() {
  clearTimeout(retryTimer); connection(false, retry ? 'Đang kết nối lại…' : 'Đang kết nối…');
  ws = new WebSocket(`${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}/socket`);
  ws.addEventListener('open', () => { retry = 0; connection(true, 'Máy chủ sẵn sàng'); setPending(false); const token = sessionStore.get(); if (token) send({ type: 'resume', token }); });
  ws.addEventListener('message', event => {
    let data; try { data = JSON.parse(event.data); } catch { return; }
    if(data.type==='chat'){const line=document.createElement('div');line.textContent=`${data.name}: ${data.message}`;$('online-chat').append(line);while($('online-chat').children.length>30)$('online-chat').firstChild.remove();}
    else if (data.type === 'hello') menus?.announceVersion(data.version);
    else if (data.type === 'joined') {
      identity = data.id; sessionStore.set(data.token); setPending(false); $('lobby-code').textContent = data.code;
      safeStore.set('chibi-name', $('player-name').value.trim()); resetInput();
      if (resumed) { toast('Đã nối lại phòng chơi.'); resumed = false; }
    } else if (data.type === 'state' && identity) renderState(data);
    else if (data.type === 'error') { setPending(false); toast(data.message); }
    else if (data.type === 'left') home();
    else if (data.type === 'resumeFailed') { home(); toast('Phiên trước đã kết thúc. Bạn có thể vào phòng lại.'); }
    else if (data.type === 'pong') { latency = Math.max(0, Math.round(performance.now() - data.at)); connection(true, identity ? `Online · ${latency} ms` : 'Máy chủ sẵn sàng'); }
  });
  ws.addEventListener('close', event => {
    resetInput(); setPending(false); connection(false, 'Mất kết nối…');
    if (event.code === 4001) { sessionStore.set(null); home(); toast('Phòng đã được mở trong kết nối khác. Tải lại trang để vào lại.'); return; }
    if (identity) { resumed = true; toast('Mất kết nối. Đang thử nối lại; giữ chỗ tối đa 25 giây.'); }
    retryTimer = setTimeout(connect, Math.min(500 * 2 ** retry++, 5000));
  });
  ws.addEventListener('error', () => {});
}
function outfitSvg(o) {
  const ears = o.id === 'bunny' ? '<ellipse cx="24" cy="13" rx="5" ry="12"/><ellipse cx="45" cy="13" rx="5" ry="12"/>' : '<circle cx="17" cy="21" r="8"/><circle cx="52" cy="21" r="8"/>';
  return `<svg viewBox="0 0 70 78" aria-hidden="true"><ellipse cx="35" cy="73" rx="23" ry="3" fill="#75876a" opacity=".12"/><g fill="${o.color}">${ears}<ellipse cx="35" cy="54" rx="17" ry="19"/><ellipse cx="35" cy="32" rx="24" ry="22"/></g><ellipse cx="35" cy="35" rx="19" ry="15" fill="#ffdfbd"/><circle cx="28" cy="34" r="2" fill="#3d4740"/><circle cx="43" cy="34" r="2" fill="#3d4740"/><path d="M32 41q3 3 6 0" fill="none" stroke="#9d6b54" stroke-width="1.3"/><ellipse cx="35" cy="59" rx="10" ry="11" fill="${o.light}"/><ellipse cx="25" cy="72" rx="8" ry="4" fill="${o.accent}"/><ellipse cx="45" cy="72" rx="8" ry="4" fill="${o.accent}"/>${o.id === 'duck' ? '<ellipse cx="35" cy="19" rx="22" ry="5" fill="#edb845"/>' : ''}</svg>`;
}
function renderOutfits() {
  $('outfits').replaceChildren(...OUTFITS.map(o => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'outfit' + (o.id === outfit ? ' selected' : ''); b.setAttribute('aria-pressed', String(o.id === outfit)); b.setAttribute('aria-label', o.name);
    b.innerHTML = outfitSvg(o); const name = document.createElement('span'); name.textContent = o.name; b.append(name);
    b.onclick = () => { outfit = o.id; safeStore.set('chibi-outfit', outfit); renderOutfits(); world.updatePreview(outfit, hat); }; return b;
  }));
  const labels = { ears: 'Tai thú', cap: 'Mũ lưỡi trai', leaf: 'Lá non' };
  $('hats').replaceChildren(...HATS.map(h => { const b = document.createElement('button'); b.type = 'button'; b.className = 'hat' + (h === hat ? ' selected' : ''); b.textContent = labels[h]; b.setAttribute('aria-pressed', String(h === hat)); b.onclick = () => { hat = h; safeStore.set('chibi-hat', hat); renderOutfits(); world.updatePreview(outfit, hat); }; return b; }));
}
function enter(type) {
  if (pending) return;
  const name = $('player-name').value.trim(); if (!name) { toast('Đặt tên trước khi lên đảo nhé.'); $('player-name').focus(); return; }
  const code = $('room-code').value.toUpperCase().trim(); if (type === 'join' && code.length !== 6) { toast('Mã phòng có 6 ký tự.'); $('room-code').focus(); return; }
  initAudio(); setPending(send({ type, name, code, outfit, hat, mapId: selectedMap,capacity:Number($('room-size').value),respawn:$('respawn-mode').checked }));
}
$('solo').onclick = () => enter('solo');
$('create').onclick = () => enter('create'); $('join-form').onsubmit = event => { event.preventDefault(); enter('join'); };
$('ready').onclick = () => { const me = state?.players.find(p => p.id === identity); if (me) send({ type: 'configure', ready: !me.ready }); initAudio(); };
$('start').onclick = () => send({ type: 'start' });
$('rematch').onclick = () => send({ type: 'rematch' });
for (const id of ['leave-lobby', 'leave-game', 'leave-results']) $(id).onclick = () => send({ type: 'leave' });
$('copy-invite').onclick = async () => {
  if (!state) return; const link = new URL(location.href); link.search = ''; link.searchParams.set('room', state.code);
  try { await navigator.clipboard.writeText(link.href); toast('Đã sao chép lời mời. Gửi cho bạn bè nhé!'); }
  catch { const input = document.createElement('textarea'); input.value = link.href; input.style.position = 'fixed'; input.style.opacity = '0'; document.body.append(input); input.select(); let copied = false; try { copied = document.execCommand('copy'); } catch {} input.remove(); toast(copied ? 'Đã sao chép lời mời.' : `Mã phòng: ${state.code}. Sao chép địa chỉ trang và gửi kèm mã này.`); }
};
function renderLobby(data) {
  activeMap = getMap(data.mapId); $('lobby').querySelector('.lobby-description').textContent = `${activeMap.name} · Mời thêm bạn hoặc bắt đầu ngay khi đã sẵn sàng.`;
  document.querySelector('.bot-note small').textContent=`Mỗi trận có ${data.capacity===20?20:8} nhân vật cùng tranh tài`;
  $('lobby-mode-line').textContent=`${activeMap.name} · ${data.capacity||3} chỗ · ${data.respawn?'Hồi sinh / tính kill':activeMap.survival?'Sinh tồn':'Đấu trường'}`;
  $('detail-map').textContent=activeMap.name;$('detail-capacity').textContent=`Tối đa ${data.capacity||3} người thật`;$('detail-mode').textContent=data.respawn?'Hồi sinh sau 3s · Tính kill':activeMap.survival?'Sinh tồn':'Đấu trường';$('detail-duration').textContent=`Tối đa ${Math.round(activeMap.duration/60)} phút`;
  const humans = data.players.filter(p => !p.bot), me = humans.find(p => p.id === identity);
  $('lobby-code').textContent = data.code; $('lobby-count').textContent = `${humans.length}/${data.capacity||3} bạn đã vào phòng`;
  $('player-slots').replaceChildren(...Array.from({ length: Math.min(8,data.capacity||3,humans.length+1) }, (_, i) => {
    const p = humans[i], row = document.createElement('div'); row.className = 'player-slot' + (!p ? ' empty' : '');
    const icon = document.createElement('div'); icon.className = 'player-avatar'; icon.textContent = p ? ({ bear: '🐻', bunny: '🐰', duck: '🐤' }[p.outfit]) : '+';
    const details = document.createElement('div'); details.className = 'player-details'; const title = document.createElement('b'), sub = document.createElement('small');
    title.textContent = p ? p.name + (p.id === identity ? ' · Bạn' : '') : 'Chờ một người bạn…';
    sub.textContent = p ? (p.id === data.hostId ? 'Chủ phòng' : 'Đã lên đảo') : 'Gửi mã phòng để rủ bạn vào'; details.append(title, sub);
    row.append(icon, details);
    if (p) { const status = document.createElement('span'); status.className = 'player-ready' + (p.ready ? ' yes' : ''); status.textContent = p.ready ? '✓ Sẵn sàng' : 'Đang chuẩn bị'; row.append(status); }
    return row;
  }));
  $('people-details').replaceChildren(...humans.map(p=>{const li=document.createElement('li');li.textContent=`${p.name}${p.id===data.hostId?' · Chủ phòng':''} · ${p.ready?'Sẵn sàng':'Đang chuẩn bị'}`;return li;}));
  $('ready').textContent = me?.ready ? '✓ Đã sẵn sàng · Bấm để hủy' : 'Mình sẵn sàng! ✓';
  const canStart = humans.length > 0 && humans.every(p => p.ready && p.connected), isHost = data.hostId === identity;
  $('start').disabled = !isHost || !canStart;
  $('start').textContent = !isHost ? 'Chờ chủ phòng bắt đầu' : canStart ? 'Lên đảo thôi →' : 'Chờ mọi người sẵn sàng';
  const sig = humans.map(p => `${p.id}:${p.outfit}:${p.hat}`).join();
  if (sig !== previewSignature) { previewSignature = sig; world.updatePreview(outfit, hat, humans, identity); }
}
function renderState(data) {
  activeMap = getMap(data.mapId);
  state = data; const phaseChanged = data.phase !== lastPhase || data.round !== lastRound;
  if (data.round !== lastRound) { lastEvent = 0; lastZoneKey = ''; feedSignature = ''; }
  if (phaseChanged) { lastHealth = null; $('damage-vignette').classList.remove('visible'); }
  $('home').hidden = true; $('lobby').hidden = data.phase !== 'lobby'; $('hud').hidden = data.phase !== 'playing'; $('results').hidden = data.phase !== 'finished';
  document.body.classList.toggle('playing', data.phase !== 'lobby');document.body.classList.toggle('lobby-mode',data.phase==='lobby');
  if (phaseChanged) { resetInput();if(data.phase!=='playing')mouseLock?.release(); if (data.phase === 'playing') { toast(activeMap.survival ? 'Nhặt súng gần bạn · Mở hòm tìm kỹ năng / ống ngắm · Leo thang bằng E' : 'Bấm vào cảnh để khóa chuột · Chuột trái bắn · Space nhảy'); tone(620, .15, .05); } }
  if (data.phase === 'lobby') renderLobby(data);
  else {
    const me = data.players.find(p => p.id === identity), alive = data.players.filter(p => p.alive);
    $('alive-count').textContent = alive.length; const seconds = Math.max(0, Math.ceil(data.duration - data.time)), zone = data.zone;
    const timeText = n => `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;
    $('timer').textContent = timeText(seconds); $('zone-phase').textContent = `BO ${zone.phase} · ${zone.shrinking ? 'ĐANG THU' : 'CHỜ'}`;
    const zoneKey = `${zone.phase}/${zone.shrinking}`;
    if (zoneKey !== lastZoneKey && zone.shrinking && data.phase === 'playing') { toast(`Vòng bo ${zone.phase} đang thu! Đi vào vòng xanh trên bản đồ nhé.`); tone(440,.18,.035); }
    lastZoneKey = zoneKey;
    $('match-clock').textContent = timeText(seconds); $('map-name').textContent = activeMap.name;
    if (me) {
      if(!me.alive){mouseLock?.release();setScoped(false);}
      if (lastHealth !== null && me.hp < lastHealth && data.phase === 'playing') { $('damage-vignette').classList.add('visible'); clearTimeout(damageTimer); damageTimer = setTimeout(() => $('damage-vignette').classList.remove('visible'), 350); }
      lastHealth = me.hp;
      $('my-name').textContent = me.name; $('kills').textContent = `${me.kills} lần loại`; $('health-number').textContent = `${Math.ceil(me.hp)}%`;
      document.querySelector('[data-hud=health]').setAttribute('aria-label', `Sức khỏe ${Math.ceil(me.hp)}%`);
      $('health-fill').style.strokeDashoffset = String(100 - me.hp); $('health-fill').style.stroke = me.hp < 30 ? '#ff9b87' : '#aaffc1';
      $('spectating').hidden = me.alive || data.phase === 'finished';
      const outside = Math.max(0, Math.hypot(me.x - zone.x, me.z - zone.z) - zone.radius);
      $('zone-warning').hidden = !me.alive || outside <= 0 || data.phase !== 'playing';
      $('zone-distance').textContent = outside > 0 ? `Vào bo: ${Math.ceil(outside)} m` : 'Trong vùng an toàn';
      $('compass').hidden = outside > 0;
      const marker = (data.markers || []).find(m => m.player === identity), cooldown = marker ? Math.max(0, Math.ceil(RULES.markerCooldown - (data.time - marker.expiresAt + RULES.markerLife))) : 0;
      $('mark-position').disabled = !me.alive || cooldown > 0 || data.phase !== 'playing';
      $('marker-hint').textContent = cooldown ? `Chờ ${cooldown}s` : 'T · Đánh dấu';
      renderInventory(me, data);
    }
    const recent = data.events.filter(e => e.type === 'out' || (e.type === 'marker' && data.time - e.at < RULES.markerLife)).slice(-4), signature = recent.map(e => e.id).join('/');
    if (signature !== feedSignature) { feedSignature = signature; $('feed').replaceChildren(...recent.map(e => { const line = document.createElement('div'); line.className = 'feed-line' + (e.type === 'marker' ? ' marker-line' : ''); line.textContent = (e.type === 'marker' ? '⌖ ' : '') + e.text; return line; })); }
    for (const e of data.events) if (e.id > lastEvent) {
      if(e.type==='out'){const killer=data.players.find(p=>p.id===e.attacker),victim=data.players.find(p=>p.id===e.player);$('kill-notice').textContent=killer?`${killer.name} ▸ ${victim?.name||''}`:`${victim?.name||''} bị loại`; }
      if (e.type === 'out') tone(380, .12, .025);
      if (e.type === 'pickup' && e.player === identity) toast(e.text);
      if (e.type === 'marker' && data.time - e.at < RULES.markerLife) { tone(820, .09, .04); if(e.player === identity) toast('Đã đánh dấu phía trước · Mọi người trong phòng đều thấy.'); }
      if (e.type === 'hit' && e.attacker === identity) { $('crosshair').classList.add('hit'); setTimeout(() => $('crosshair').classList.remove('hit'), 110); tone(1000, .04, .025); }
      lastEvent = Math.max(lastEvent, e.id);
    }
    drawMinimap(data);
    if (data.phase === 'finished') {
      if (phaseChanged) renderResults(data);
      const host = identity === data.hostId;
      $('rematch').disabled = !host;
      $('rematch').textContent = host ? (data.mode === 'solo' ? 'Chơi lại ngay ↗' : 'Về phòng chờ · Chơi tiếp ↗') : 'Chờ chủ phòng mở trận tiếp';
    }
  }
  world.setState(data, identity); lastPhase = data.phase; lastRound = data.round; menus?.refreshNotice();
}
function renderResults(data) {
  const winner = data.winner;
  $('result-title').textContent = winner?.id === identity ? 'Bạn là quán quân!' : winner ? 'Đảo có quán quân!' : 'Hòa cả làng!';
  $('winner-name').textContent = winner ? `${winner.name} giữ đảo thành công ✦` : 'Hẹn nhau một trận nữa nhé.';
  const sorted = [...data.players].sort((a, b) => Number(b.id === winner?.id) - Number(a.id === winner?.id) || Number(b.alive) - Number(a.alive) || b.kills - a.kills || b.hp - a.hp);
  $('scoreboard').replaceChildren(...sorted.map((p, i) => {
    const row = document.createElement('div'); row.className = 'score-row';
    const place = document.createElement('span'); place.className = 'score-place'; place.textContent = i === 0 && winner ? '✦' : String(i + 1);
    const name = document.createElement('b'); name.textContent = p.name + (p.id === identity ? ' · Bạn' : '');
    const score = document.createElement('span'); score.textContent = `${p.kills} lần loại`; row.append(place, name, score); return row;
  }));
  const host = identity === data.hostId; $('rematch').disabled = !host; $('rematch').textContent = host ? (data.mode === 'solo' ? 'Chơi lại ngay ↗' : 'Về phòng chờ · Chơi tiếp ↗') : 'Chờ chủ phòng mở trận tiếp';
  tone(winner?.id === identity ? 880 : 520, .3, .045);
}
function drawMinimap(data) {
  const ctx = $('minimap').getContext('2d'), size = 170, scale = 77 / activeMap.radius, zone = data.zone;
  ctx.clearRect(0, 0, size, size); ctx.save(); ctx.translate(size / 2, size / 2);
  ctx.fillStyle = '#5b9b46'; ctx.beginPath(); ctx.arc(0, 0, activeMap.radius * scale, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#375b35'; for (const o of activeMap.obstacles) { ctx.beginPath(); ctx.arc(o.x * scale, o.z * scale, Math.max(.6, o.r * scale), 0, Math.PI * 2); ctx.fill(); }
  ctx.strokeStyle = '#73def8'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(zone.x * scale, zone.z * scale, data.radius * scale, 0, Math.PI * 2); ctx.stroke();
  ctx.save(); ctx.setLineDash([3,3]); ctx.strokeStyle = '#fffbd4'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(zone.nextX * scale, zone.nextZ * scale, zone.nextRadius * scale, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  for (const p of data.players) if (p.alive && (!p.concealed || p.id===identity)) { ctx.fillStyle = p.id === identity ? '#fffef0' : '#498b7b'; ctx.strokeStyle = p.id === identity ? '#386552' : '#fff4'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(p.x * scale, p.z * scale, p.id === identity ? 4 : 2.8, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
  for (const m of data.markers || []) { ctx.strokeStyle = m.player === identity ? '#6ef8ff' : '#ffe282'; ctx.fillStyle = '#203d2b'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(m.x * scale, m.z * scale, 4.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
  ctx.restore();
}
function renderInventory(me, data) {
  const inventory = me.inventory || [], gun = inventory[me.slot || 0], definition = gun && WEAPONS[gun.id];
  $('weapon-name').textContent = definition?.name || 'Chưa có súng';
  renderAbilities(me);
  const iconHref = `/weapon-icons.svg#${definition?.id || 'none'}`;
  if ($('weapon-icon-use').getAttribute('href') !== iconHref) $('weapon-icon-use').setAttribute('href', iconHref);
  $('weapon-icon').dataset.weapon = definition?.id || 'none';
  document.querySelector('[data-hud=weapon]').title = definition?.name || 'Chưa có súng';
  $('ammo-mag').textContent = gun ? (activeMap.survival ? gun.mag : '∞') : '—';
  $('ammo-reserve').textContent = gun ? (activeMap.survival ? `/ ${gun.reserve}` : 'Nước không giới hạn') : 'Nhặt súng';
  $('reload-status').textContent = me.reload > 0 ? `Đang nạp · ${me.reload.toFixed(1)} s` : gun && gun.mag === 0 ? 'Cần nạp đạn' : '';
  $('reload-progress').hidden = !(me.reload > 0 && definition); const reloadPercent = definition ? Math.round(Math.max(0, Math.min(1, 1 - me.reload / definition.reload)) * 100) : 0;
  $('reload-progress').setAttribute('aria-valuenow', reloadPercent); $('reload-progress').firstElementChild.style.width = `${reloadPercent}%`;
  $('medkit-count').textContent = `Bình hồi phục: ${me.medkits || 0} · H`;
  $('touch-heal').querySelector('small').textContent = String(me.medkits || 0);
  for (let i = 0; i < 2; i++) { const button = $(`weapon-slot-${i}`); button.disabled = !inventory[i]; button.classList.toggle('active', !!inventory[i] && me.slot === i); button.textContent = `${i+1} · ${inventory[i] ? WEAPONS[inventory[i].id].name : 'Trống'}`; }
  const loot = (data.loot || []).filter(l => Math.abs(l.y - me.y) < 2 && Math.hypot(l.x - me.x, l.z - me.z) <= RULES.interactRange).sort((a,b) => Math.hypot(a.x-me.x,a.z-me.z)-Math.hypot(b.x-me.x,b.z-me.z))[0];
  const statuses = new Map((data.obstacles || []).map(o => [o.id,o]));
  const ladder=activeMap.obstacles.find(o=>o.kind==='ladder'&&((Math.abs(me.y)<1.5&&Math.hypot(o.x-me.x,o.z-me.z)<2.7)||(Math.abs(me.y-o.h)<1.5&&Math.hypot(o.topX-me.x,o.topZ-me.z)<2.7)));
  const obstacle=ladder||activeMap.obstacles.filter(o=>o.interactive&&o.kind!=='ladder'&&Math.abs(me.y)<o.h+1.5&&!statuses.get(o.id)?.destroyed&&!(o.kind==='chest'&&statuses.get(o.id)?.open)&&Math.hypot(o.x-me.x,o.z-me.z)<=o.r+RULES.interactRange).sort((a,b)=>Math.hypot(a.x-me.x,a.z-me.z)-Math.hypot(b.x-me.x,b.z-me.z))[0];
  const obstacleDistance=ladder?Math.hypot(me.x-(me.y>ladder.h/2?ladder.topX:ladder.x),me.z-(me.y>ladder.h/2?ladder.topZ:ladder.z)):obstacle?Math.hypot(obstacle.x-me.x,obstacle.z-me.z)-obstacle.r+.5:Infinity;
  const chooseLoot=loot&&Math.hypot(loot.x-me.x,loot.z-me.z)<obstacleDistance;
  const hint = chooseLoot ? `Nhặt ${loot.type === 'weapon' ? WEAPONS[loot.weapon].name : loot.type === 'ammo' ? 'nước tiếp đạn' : loot.type==='scope'?'ống ngắm 3×':loot.type==='skill'?`kỹ năng ${SKILLS[loot.weapon]?.name}`:'bình hồi phục'}` : obstacle ? (obstacle.kind==='ladder'?(me.y>obstacle.h/2?'Xuống thang chòi':'Leo thang chòi'):obstacle.kind === 'chest' ? 'Mở hòm tiếp tế' : statuses.get(obstacle.id)?.open ? 'Đóng cổng' : 'Mở cổng') : '';
  $('interact-prompt').hidden = !hint || !me.alive; $('interact-text').textContent = me.climbing?'Đang leo · Nhảy để rời thang':hint;
}
function setScoped(value){scoped=!!value;world.setScoped(scoped);document.body.classList.toggle('scoped',scoped);$('scope-overlay').hidden=!scoped;$('touch-scope').setAttribute('aria-pressed',String(scoped));}
function toggleScope(){const me=state?.players.find(p=>p.id===identity);if(state?.phase!=='playing'||!me?.alive||menus?.isOpen()||playGuard?.isBlocked())return;if(!me.scope||!me.inventory?.length){toast('Mở hòm và nhặt ống ngắm trước, sau đó cầm súng để ngắm.');return;}setScoped(!scoped);flushInput();}
function renderAbilities(me){
  const active=SKILLS[me.effect],held=SKILLS[me.skill],skill=active||held,button=$('touch-skill');
  button.disabled=!me.alive||!held||!!active||me.climbing;button.classList.toggle('active',!!active);button.style.setProperty('--skill-color',skill?.color||'#d4bcff');
  $('skill-icon').textContent=skill?.icon||'✦';$('skill-label').textContent=active?`${me.effectRemaining.toFixed(1)}s`:held?({dash:'LƯỚT',flight:'BAY',regen:'HỒI',power:'×2 DAME',rocket:'TÊN LỬA'}[me.skill]):'MỞ HÒM';
  button.setAttribute('aria-label',skill?`${active?'Đang dùng':'Dùng kỹ năng'} ${skill.name}`:'Kỹ năng · Mở hòm để nhặt');button.title=skill?.description||'Mở hòm để nhặt kỹ năng';
  $('touch-scope').disabled=!me.alive||!me.scope||!me.inventory?.length;$('scope-label').textContent=me.scope?'NGẮM 3×':'TÌM KÍNH';
  if($('touch-scope').disabled)setScoped(false);
  document.querySelector('.health-symbol').textContent=me.concealed?'♣':'♥';document.querySelector('[data-hud=health]').title=me.concealed?'Đang ẩn trong lùm cây':'';
}
function initAudio() { if (!soundEnabled) return; try { audio ||= new (window.AudioContext || window.webkitAudioContext)(); if (audio.state === 'suspended') audio.resume().catch(() => {}); } catch {} }
function tone(frequency, duration, volume) {
  if (!soundEnabled || !audio || audio.state !== 'running') return;
  const level = volume * (menus?.volume() ?? .7); if (level <= 0) return;
  try { const osc = audio.createOscillator(), gain = audio.createGain(); osc.type = 'sine'; osc.frequency.setValueAtTime(frequency, audio.currentTime); osc.frequency.exponentialRampToValueAtTime(frequency * .6, audio.currentTime + duration); gain.gain.setValueAtTime(level, audio.currentTime); gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + duration); osc.connect(gain); gain.connect(audio.destination); osc.start(); osc.stop(audio.currentTime + duration); } catch {}
}
function toggleSound() { soundEnabled = !soundEnabled; safeStore.set('chibi-sound', soundEnabled ? 'on' : 'off'); updateSound(); initAudio(); if (soundEnabled) tone(660, .1, .04); }
function updateSound() { $('sound').classList.toggle('active', soundEnabled); $('sound').setAttribute('aria-label', soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'); $('sound').setAttribute('aria-pressed', String(soundEnabled)); menus?.syncSound(); }
$('sound').onclick = toggleSound;
addEventListener('keydown', event => {
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement) return;
  if (menus?.isOpen()) return;
  if (state?.phase !== 'playing') return;
  if(event.code==='Tab'){event.preventDefault();mouseLock?.release();resetInput();$('settings-dialog').showModal();return;}
  if(event.code==='KeyV'&&!event.repeat){event.preventDefault();toggleScope();return;}
  if(playGuard?.isBlocked()){if(event.code==='Enter'&&!event.repeat){event.preventDefault();mouseLock.retry();mouseLock.request();}return;}
  if (event.code === 'KeyT' && !event.repeat) { event.preventDefault(); markPosition(); return; }
  const actionKeys = { Space: 'jump', KeyE: 'interact', KeyR: 'reload', KeyQ: 'swap', KeyH: 'heal', KeyC: 'skill' };
  if (actionKeys[event.code]) { event.preventDefault(); if (!event.repeat) actions[actionKeys[event.code]] = true; }
  if (['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ShiftLeft','ShiftRight','KeyF'].includes(event.code)) { event.preventDefault(); keys.add(event.code); }
  if (event.code === 'Digit1' && state.players.find(p=>p.id===identity)?.slot===1) actions.swap=true;
  if (event.code === 'Digit2' && state.players.find(p=>p.id===identity)?.slot===0) actions.swap=true;
  if (event.code === 'Escape') resetInput();
  if (!event.repeat) flushInput();
});
addEventListener('keyup', event => { if (keys.delete(event.code)) flushInput(); }); addEventListener('blur', resetInput);
document.addEventListener('visibilitychange', () => { if (document.hidden) resetInput(); });
let lookPointer = null;
$('world').addEventListener('pointerdown', event => {
  if (state?.phase !== 'playing' || menus?.isOpen() || playGuard?.isPortrait()) return;
  if(event.pointerType==='mouse'&&!mouseLock.locked()){event.preventDefault();mouseLock.retry();mouseLock.request();return;}
  if(event.pointerType==='mouse'&&event.button===2&&mouseLock.locked()){event.preventDefault();toggleScope();return;}
  if (event.pointerType === 'mouse' && event.button === 0) { pointer.down = true; initAudio(); }
  if ((event.pointerType === 'mouse' && event.button === 2) || (event.pointerType !== 'mouse' && event.clientX > innerWidth * .36)) {
    event.preventDefault(); lookPointer=event.pointerId; pointer.look=true; pointer.x=event.clientX; pointer.y=event.clientY; $('world').setPointerCapture(event.pointerId);
  }
  flushInput();
});
$('world').addEventListener('pointermove', event => {
  if (pointer.look && event.pointerId === lookPointer) { world.rotateCamera(event.clientX-pointer.x,event.clientY-pointer.y); pointer.x=event.clientX; pointer.y=event.clientY; }
});
function releaseLook(event) { if (event.pointerType==='mouse'&&event.button===0)pointer.down=false; if(event.pointerId===lookPointer){pointer.look=false;lookPointer=null;} flushInput(); }
for(const type of ['pointerup','pointercancel','lostpointercapture'])addEventListener(type,releaseLook);
$('world').addEventListener('contextmenu',event=>{if(state?.phase==='playing')event.preventDefault();});
$('world').addEventListener('wheel',event=>{if(state?.phase==='playing'){event.preventDefault();world.cameraDistance=Math.max(4.5,Math.min(11,(world.cameraDistance||7.5)+event.deltaY*.006));}},{passive:false});
let joystickPointer=null; const joystick=$('joystick');
function moveJoystick(event){
  if(event.pointerId!==joystickPointer)return;const rect=joystick.getBoundingClientRect(),dx=event.clientX-rect.left-rect.width/2,dy=event.clientY-rect.top-rect.height/2;
  const length=Math.hypot(dx,dy),limit=rect.width*.32,factor=length>limit?limit/length:1,scale=rect.width/joystick.offsetWidth;touch.x=dx*factor/limit;touch.z=dy*factor/limit;$('joystick-knob').style.transform=`translate(${dx*factor/scale}px,${dy*factor/scale}px)`;
}
joystick.addEventListener('pointerdown',event=>{if(joystickPointer!==null)return;event.preventDefault();joystickPointer=event.pointerId;joystick.setPointerCapture(event.pointerId);moveJoystick(event);initAudio();flushInput();});
joystick.addEventListener('pointermove',moveJoystick);
function releaseJoystick(event){if(event.pointerId!==joystickPointer)return;joystickPointer=null;touch.x=0;touch.z=0;$('joystick-knob').style.transform='';flushInput();}
for(const type of ['pointerup','pointercancel','lostpointercapture'])joystick.addEventListener(type,releaseJoystick);
$('touch-fire').addEventListener('pointerdown',event=>{event.preventDefault();$('touch-fire').setPointerCapture(event.pointerId);touch.fire=true;initAudio();flushInput();});
for(const type of ['pointerup','pointercancel','lostpointercapture'])$('touch-fire').addEventListener(type,()=>{touch.fire=false;flushInput();});
for(const [id,key]of [['touch-jump','jump'],['touch-interact','interact'],['touch-reload','reload'],['touch-swap','swap'],['touch-heal','heal'],['touch-skill','skill']])$(id).addEventListener('pointerdown',event=>{event.preventDefault();actions[key]=true;initAudio();flushInput();});
$('touch-scope').onclick=toggleScope;
$('touch-sprint').onclick=()=>{touch.sprint=!touch.sprint;$('touch-sprint').classList.toggle('active',touch.sprint);flushInput();};
for(let i=0;i<2;i++)$(`weapon-slot-${i}`).onclick=()=>{const me=state?.players.find(p=>p.id===identity);if(me&&me.inventory?.[i]&&me.slot!==i){actions.swap=true;flushInput();}};
function markPosition(){const me=state?.players.find(p=>p.id===identity);if(state?.phase==='playing'&&me?.alive&&!menus?.isOpen()&&!playGuard?.isBlocked())send({type:'marker',aim:world.cameraYaw});}
$('mark-position').onclick=markPosition;
function flushInput(){
  if(!identity||state?.phase!=='playing'||ws?.readyState!==WebSocket.OPEN)return;
  const me=state.players.find(p=>p.id===identity);if(!me?.alive)return;
  if (menus?.isOpen() || document.hidden || playGuard?.isBlocked()) { world.setLocalInput({fire:false}); send({type:'input',x:0,z:0,aim:me.aim,fire:false}); return; }
  let x=Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft'))+touch.x;
  let z=Number(keys.has('KeyS')||keys.has('ArrowDown'))-Number(keys.has('KeyW')||keys.has('ArrowUp'))+touch.z;
  const d=Math.hypot(x,z);if(d>1){x/=d;z/=d;}
  const movement=world.movement(x,z);let aim=world.aimAt(me),fire=pointer.down||touch.fire||keys.has('KeyF');
  if(!scoped&&(touch.fire||keys.has('KeyF'))){
    const forward={x:Math.sin(world.cameraYaw),z:Math.cos(world.cameraYaw)};
    const statuses=new Map((state.obstacles||[]).map(o=>[o.id,o]));
    const target=state.players.filter(p=>{const dx=p.x-me.x,dz=p.z-me.z,d=Math.hypot(dx,dz);return p.alive&&p.id!==identity&&(!p.concealed||d<5)&&d<65&&(dx*forward.x+dz*forward.z)/Math.max(.01,d)>.48&&visible(me.x,me.z,p.x,p.z,activeMap,statuses,Math.min(me.y,p.y)+1.3);})
      .sort((a,b)=>Math.hypot(a.x-me.x,a.z-me.z)-Math.hypot(b.x-me.x,b.z-me.z))[0];
    if(target){const dx=target.x-me.x,dz=target.z-me.z;aim={aim:Math.atan2(dx,dz),pitch:Math.atan2(target.y-me.y,Math.hypot(dx,dz))};}
  }
  world.setLocalInput({...aim,fire});
  if(send({type:'input',...movement,...aim,fire,aiming:scoped,sprint:touch.sprint||keys.has('ShiftLeft')||keys.has('ShiftRight'),...actions}))for(const key of Object.keys(actions))actions[key]=false;
}
setInterval(flushInput,50);
setInterval(()=>{if(ws?.readyState===WebSocket.OPEN)send({type:'ping',at:performance.now()});},2500);
let previous = performance.now();
function frame(now) { playGuard?.refresh();const dt = Math.min((now - previous) / 1000, .05); previous = now; world.frame(dt); if(state?.phase==='playing'&&now-compassAt>100){compassAt=now;const degrees=((Math.PI-world.cameraYaw)*180/Math.PI%360+360)%360;const names=['BẮC','ĐÔNG BẮC','ĐÔNG','ĐÔNG NAM','NAM','TÂY NAM','TÂY','TÂY BẮC'];$('compass-name').textContent=names[Math.round(degrees/45)%8];$('compass-degrees').textContent=`${String(Math.round(degrees)%360).padStart(3,'0')}°`;} requestAnimationFrame(frame); }
mouseLock=createMouseLock({canvas:$('world'),isPlayable:()=>state?.phase==='playing'&&state.players.find(p=>p.id===identity)?.alive&&!menus?.isOpen()&&!playGuard?.isPortrait(),rotate:(dx,dy)=>world.rotateCamera(dx,dy),resetInput,notify:()=>{$('mouse-lock-status').textContent='Trình duyệt này chưa cho khóa chuột. Hãy mở game trực tiếp trong Chrome hoặc Edge, rồi bấm lại để vào trận.';}});
menus=createMenus({world,store:safeStore,resetInput:()=>{mouseLock.release();resetInput();},getSound:()=>soundEnabled,toggleSound,getPhase:()=>state?.phase});
playGuard=createPlayGuard({mouseLock,resetInput,getPhase:()=>state?.phase,isAlive:()=>!!state?.players.find(p=>p.id===identity)?.alive,menusOpen:()=>!!menus?.isOpen()});
createFullscreen({button:$('fullscreen-toggle'),notify:toast,resetInput});
world.onLocalShot=()=>{clearTimeout(firingTimer);$('crosshair').classList.add('firing');firingTimer=setTimeout(()=>$('crosshair').classList.remove('firing'),90);tone(740+Math.random()*80,.07,.025);};
renderOutfits(); world.updatePreview(outfit, hat); updateSound(); connect(); requestAnimationFrame(frame);

$('chat-send').onclick=()=>{if(send({type:'chat',name:$('player-name').value,message:$('chat-message').value}))$('chat-message').value='';};
