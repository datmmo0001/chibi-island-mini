// Fullscreen belongs to the page, not a match or menu. Only the toggle asks to
// leave; browser/system exits are reflected in the UI without re-entering.
export function createFullscreen({ button, notify, resetInput, doc = document }) {
  let pending = false;
  const active = () => Boolean(doc.fullscreenElement || doc.webkitFullscreenElement);
  function sync() {
    const on = active(), supported = Boolean(doc.documentElement.requestFullscreen || doc.documentElement.webkitRequestFullscreen);
    button.setAttribute('aria-pressed', String(on));
    button.setAttribute('aria-label', on ? 'Thoát toàn màn hình' : 'Toàn màn hình');
    button.title = on ? 'Thoát toàn màn hình' : supported ? 'Toàn màn hình' : 'Trình duyệt chưa hỗ trợ toàn màn hình';
    button.disabled = pending;
    doc.body.classList.toggle('fullscreen-active', on);
  }
  async function toggle() {
    if (pending) return;
    pending = true; resetInput(); sync();
    try {
      if (active()) {
        const exit = doc.exitFullscreen || doc.webkitExitFullscreen;
        if (!exit) throw new Error('unsupported');
        await exit.call(doc);
      } else {
        const enter = doc.documentElement.requestFullscreen || doc.documentElement.webkitRequestFullscreen;
        if (!enter) throw new Error('unsupported');
        await enter.call(doc.documentElement, { navigationUI: 'hide' });
      }
    } catch {
      notify('Chưa bật được toàn màn hình. Hãy mở game trực tiếp trong Chrome hoặc Samsung Internet rồi thử lại.');
    } finally { pending = false; sync(); }
  }
  button.addEventListener('click', toggle);
  const changed = () => { resetInput(); sync(); };
  doc.addEventListener('fullscreenchange', changed);
  doc.addEventListener('webkitfullscreenchange', changed);
  sync();
  return { isActive: active };
}
