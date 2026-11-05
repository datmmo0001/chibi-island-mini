import { GAME_VERSION, clamp } from '/shared.js';
import { createHudLayout } from './hud-layout.js';

export function createMenus({ world, store, resetInput, getSound, toggleSound, getPhase }) {
  let saved = {}; try { saved = JSON.parse(store.get('chibi-settings', '{}')) || {}; } catch {}
  const finite = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const settings = {
    quality: ['auto','low','standard','high'].includes(saved.quality) ? saved.quality : 'auto',
    sensitivity: clamp(finite(saved.sensitivity, 1), .5, 2),
    volume: clamp(finite(saved.volume, .7), 0, 1), invertY: saved.invertY === true
  };
  const $ = id => document.getElementById(id), dialogs = [...document.querySelectorAll('.game-dialog')];
  let remoteVersion = null;
  const hudLayout = createHudLayout({ store, resetInput, getPhase });
  function save() { store.set('chibi-settings', JSON.stringify(settings)); world.configure(settings); }
  function refreshNotice() {
    $('version-notice').hidden = !remoteVersion || getPhase() === 'playing';
    $('version-notice').querySelector('span').textContent = getPhase() === 'playing' ? 'Có bản mới · Bạn có thể tải lại sau trận' : 'Có phiên bản mới sẵn sàng';
    $('refresh-version').textContent = getPhase() === 'playing' ? 'Tải lại · Rời trận' : 'Tải bản mới';
  }
  function announceVersion(version) {
    if (typeof version !== 'string' || !/^\d+\.\d+\.\d+$/.test(version) || version === GAME_VERSION) return;
    remoteVersion = version; refreshNotice();
  }
  async function checkVersion() {
    if (document.hidden) return;
    try { const response = await fetch('/version', { cache: 'no-store', signal: AbortSignal.timeout(7000) }); if (response.ok) announceVersion((await response.json()).version); } catch {}
  }
  $('quality-setting').value = settings.quality;
  $('sensitivity-setting').value = settings.sensitivity;
  $('sensitivity-value').textContent = `${settings.sensitivity.toFixed(1)}×`;
  $('volume-setting').value = Math.round(settings.volume * 100); $('volume-value').textContent = `${Math.round(settings.volume * 100)}%`;
  $('invert-setting').checked = settings.invertY;
  const syncSound = () => { $('sound-setting').checked = getSound(); };
  syncSound(); world.configure(settings); $('build-label').textContent = `BẢN ${GAME_VERSION}`;
  for (const button of document.querySelectorAll('[data-dialog]')) button.addEventListener('click', () => {
    resetInput(); syncSound();
    for (const note of document.querySelectorAll('.live-match-note')) note.hidden = getPhase() !== 'playing';
    $(button.dataset.dialog).showModal();
  });
  for (const button of document.querySelectorAll('[data-close-dialog]')) button.addEventListener('click', () => button.closest('dialog').close());
  for (const dialog of dialogs) { dialog.addEventListener('close', resetInput); dialog.addEventListener('cancel', resetInput); }
  $('quality-setting').onchange = event => { settings.quality = event.target.value; save(); };
  $('sensitivity-setting').oninput = event => { settings.sensitivity = Number(event.target.value); $('sensitivity-value').textContent = `${settings.sensitivity.toFixed(1)}×`; save(); };
  $('volume-setting').oninput = event => { settings.volume = Number(event.target.value) / 100; $('volume-value').textContent = `${event.target.value}%`; save(); };
  $('invert-setting').onchange = event => { settings.invertY = event.target.checked; save(); };
  $('sound-setting').onchange = () => { if ($('sound-setting').checked !== getSound()) toggleSound(); };
  $('refresh-version').onclick = () => location.reload();
  setInterval(checkVersion, 60000); document.addEventListener('visibilitychange', checkVersion);
  return { isOpen: () => hudLayout.isEditing() || dialogs.some(dialog => dialog.open), volume: () => settings.volume, syncSound, refreshNotice, announceVersion };
}
