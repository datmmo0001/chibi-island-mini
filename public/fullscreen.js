// Fullscreen and orientation are requested from a user gesture only.
export function createFullscreen({ button, buttons = [], notify, resetInput, doc = document,
  orientation = globalThis.screen?.orientation,
  isPhone = () => globalThis.matchMedia?.('(pointer: coarse)').matches === true }) {
  const controls = [button, ...buttons].filter(Boolean);
  let pending = false;
  const active = () => Boolean(doc.fullscreenElement || doc.webkitFullscreenElement);
  function sync() {
    const on = active();
    for (const control of controls) {
      control.setAttribute('aria-pressed', String(on));
      const label = on ? 'Thoát toàn màn hình' : 'Toàn màn hình';
      control.setAttribute('aria-label', label);
      control.title = label;
      control.disabled = pending;
      if (control.dataset?.fullscreenText !== undefined) control.textContent = on ? '⛶ Thoát toàn màn hình' : '⛶ Toàn màn hình · Xoay ngang';
    }
    doc.body.classList.toggle('fullscreen-active', on);
  }
  function report(message) { notify(message); const status=doc.getElementById?.('rotate-status'); if(status) status.textContent=message; }
  async function landscape() {
    if (!isPhone()) return;
    try {
      if (!orientation?.lock) throw new Error('unsupported');
      await orientation.lock('landscape');
    } catch {
      report('Đã bật toàn màn hình. Trình duyệt chưa khóa ngang được; hãy xoay điện thoại sang ngang để chơi.');
    }
  }
  async function toggle() {
    if (pending) return;
    pending = true; const status=doc.getElementById?.('rotate-status'); if(status) status.textContent=''; resetInput(); sync();
    try {
      if (active()) {
        const exit = doc.exitFullscreen || doc.webkitExitFullscreen;
        if (!exit) throw new Error('unsupported');
        await exit.call(doc);
      } else {
        const enter = doc.documentElement.requestFullscreen || doc.documentElement.webkitRequestFullscreen;
        if (!enter) throw new Error('unsupported');
        await enter.call(doc.documentElement, { navigationUI: 'hide' });
        if (active()) await landscape();
      }
    } catch {
      report('Chưa bật được toàn màn hình. Hãy mở trực tiếp bằng Chrome hoặc Samsung Internet, hoặc xoay máy sang ngang để tiếp tục.');
    } finally { pending = false; sync(); }
  }
  for (const control of controls) control.addEventListener('click', toggle);
  const changed = () => {
    if (!active()) { try { orientation?.unlock?.(); } catch {} }
    resetInput(); sync();
  };
  doc.addEventListener('fullscreenchange', changed);
  doc.addEventListener('webkitfullscreenchange', changed);
  sync();
  return { isActive: active };
}
