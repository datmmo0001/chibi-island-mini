import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { WebSocketServer, WebSocket } from 'ws';
import { Room, makeCode, makeId } from './game.js';
import { RULES, GAME_VERSION } from '../shared.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml' };
export function createGameServer({ maxRooms = 50 } = {}) {
  const rooms = new Map(), sessions = new Map();
  const server = http.createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff'); res.setHeader('Referrer-Policy', 'same-origin');
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end(); }
    let pathname; try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); } catch { res.writeHead(400); return res.end(); }
    if (pathname === '/health' || pathname === '/version') { res.setHeader('Content-Type', 'application/json'); res.setHeader('Cache-Control', 'no-store'); return res.end(JSON.stringify(pathname === '/health' ? { ok: true, rooms: rooms.size, version: GAME_VERSION } : { version: GAME_VERSION })); }
    let file;
    if (pathname === '/shared.js') file = path.join(root, 'shared.js');
    else if (/^\/vendor\/three\.(core|module)\.js$/.test(pathname)) file = path.join(root, 'node_modules/three/build', path.basename(pathname));
    else {
      const requested = pathname === '/' ? '/index.html' : pathname;
      const publicRoot = path.join(root, 'public'); file = path.resolve(publicRoot, '.' + requested);
      if (!file.startsWith(publicRoot + path.sep)) { res.writeHead(403); return res.end(); }
    }
    try { const body = await readFile(file); res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream'); res.setHeader('Cache-Control', 'no-cache'); res.writeHead(200); res.end(req.method === 'HEAD' ? undefined : body); }
    catch { res.writeHead(404); res.end('Not found'); }
  });
  const wss = new WebSocketServer({ noServer: true, maxPayload: 4096, perMessageDeflate: false });
  const send = (ws, data) => { if (ws.readyState === WebSocket.OPEN && ws.bufferedAmount < 128 * 1024) ws.send(JSON.stringify(data)); };
  const broadcast = room => { const data = room.snapshot(); for (const s of sessions.values()) if (s.roomCode === room.code && s.ws) send(s.ws, data); };
  server.on('upgrade', (req, socket, head) => {
    if (new URL(req.url, 'http://localhost').pathname !== '/socket' || wss.clients.size >= 180) return socket.destroy();
    // Browsers must originate from this host (including a reverse proxy's public host).
    if (req.headers.origin) {
      let origin; try { origin = new URL(req.headers.origin).host; } catch { return socket.destroy(); }
      if (origin !== req.headers.host) return socket.destroy();
    }
    wss.handleUpgrade(req, socket, head, ws => wss.emit('connection', ws));
  });
  wss.on('connection', ws => {
    let session = null, budget = 90, budgetAt = Date.now(); ws.isAlive = true;
    ws.on('pong', () => { ws.isAlive = true; });
    send(ws, { type: 'hello', version: GAME_VERSION });
    ws.on('message', raw => {
      const now = Date.now(); if (now - budgetAt >= 1000) { budget = 90; budgetAt = now; }
      if (--budget < 0) return ws.close(1008, 'Too many messages');
      let data; try { data = JSON.parse(raw.toString()); } catch { return send(ws, { type: 'error', message: 'Dữ liệu không hợp lệ.' }); }
      if (!data || typeof data !== 'object' || Array.isArray(data)) return;
      try {
        if (data.type === 'ping') return send(ws, { type: 'pong', at: data.at });
        if (data.type === 'resume' && !session) {
          const found = typeof data.token === 'string' ? sessions.get(data.token) : null;
          const room = found && rooms.get(found.roomCode);
          if (!found || !room || !room.resume(found.id)) return send(ws, { type: 'resumeFailed' });
          const previous = found.ws; found.ws = ws; session = found; if (previous && previous !== ws) previous.close(4001, 'Reconnected elsewhere');
          send(ws, { type: 'joined', id: session.id, token: session.token, code: room.code }); broadcast(room); return;
        }
        if (data.type === 'create' || data.type === 'join' || data.type === 'solo') {
          if (session) throw new Error('Bạn đã ở trong một phòng.');
          let room;
          if (data.type === 'create' || data.type === 'solo') {
            if (rooms.size >= maxRooms) throw new Error('Máy chủ đang đầy, vui lòng thử lại sau.');
            let code; do { code = makeCode(); } while (rooms.has(code));
            room = new Room(code, null, { mode: data.type === 'solo' ? 'solo' : 'party', mapId: data.mapId || 'meadow' }); rooms.set(code, room);
          } else {
            room = rooms.get(String(data.code || '').toUpperCase().trim());
            if (!room) throw new Error('Không tìm thấy phòng. Kiểm tra lại mã nhé.');
          }
          const id = makeId(), token = makeId();
          room.addHuman(id, data.name, data.outfit, data.hat); if (!room.hostId) room.hostId = id;
          session = { id, token, roomCode: room.code, ws, lastSeen: now }; sessions.set(token, session);
          if (room.mode === 'solo') { room.configure(id, { ready: true }); room.start(id); }
          send(ws, { type: 'joined', id, token, code: room.code }); broadcast(room); return;
        }
        if (!session) throw new Error('Hãy tạo hoặc vào phòng trước.');
        const room = rooms.get(session.roomCode); if (!room) throw new Error('Phòng đã đóng.');
        if (data.type === 'input') room.setInput(session.id, data);
        else if (data.type === 'configure') { room.configure(session.id, data); broadcast(room); }
        else if (data.type === 'start') { room.start(session.id); broadcast(room); }
        else if (data.type === 'marker') { room.placeMarker(session.id, data.aim); broadcast(room); }
        else if (data.type === 'rematch') {
          room.backToLobby(session.id);
          if (room.mode === 'solo' && room.phase === 'lobby') { room.configure(session.id, { ready: true }); room.start(session.id); }
          broadcast(room);
        }
        else if (data.type === 'leave') {
          room.leave(session.id); sessions.delete(session.token); session = null;
          send(ws, { type: 'left' }); broadcast(room);
        }
      } catch (error) { send(ws, { type: 'error', message: error.message }); }
    });
    ws.on('error', () => {});
    ws.on('close', () => {
      if (!session || session.ws !== ws) return;
      session.ws = null; session.lastSeen = Date.now(); const room = rooms.get(session.roomCode);
      if (room) { room.disconnect(session.id); broadcast(room); }
    });
  });
  let previous = performance.now(), accumulator = 0, snapshotClock = 0;
  const timer = setInterval(() => {
    const now = performance.now(), delta = Math.min((now - previous) / 1000, 0.25); previous = now;
    accumulator += delta; snapshotClock += delta;
    while (accumulator >= 1 / RULES.tickRate) { for (const room of rooms.values()) room.tick(1 / RULES.tickRate); accumulator -= 1 / RULES.tickRate; }
    if (snapshotClock >= 1 / RULES.snapshotRate) { for (const room of rooms.values()) if (room.phase !== 'lobby') broadcast(room); snapshotClock %= 1 / RULES.snapshotRate; }
    for (const [code, room] of rooms) {
      if (room.humans().some(p => p.connected)) room.emptySince = null;
      else if (!room.emptySince) room.emptySince = Date.now();
      else if (Date.now() - room.emptySince > 60000) {
        rooms.delete(code); for (const [token, s] of sessions) if (s.roomCode === code) sessions.delete(token);
      }
    }
    for (const [token, s] of sessions) if (!s.ws && Date.now() - s.lastSeen > 90000) sessions.delete(token);
  }, 1000 / RULES.tickRate);
  const heartbeat = setInterval(() => { for (const ws of wss.clients) { if (!ws.isAlive) ws.terminate(); else { ws.isAlive = false; ws.ping(); } } }, 10000);
  return { server, rooms, async close() { clearInterval(timer); clearInterval(heartbeat); for (const ws of wss.clients) ws.terminate(); await new Promise(resolve => wss.close(resolve)); if (server.listening) await new Promise(resolve => server.close(resolve)); } };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const app = createGameServer(), port = Number(process.env.PORT || 3000), host = process.env.HOST || '0.0.0.0';
  app.server.listen(port, host, () => console.log(`Chibi Island: http://localhost:${port} (solo / party)`));
  app.server.on('error', error => { console.error(`Cannot start: ${error.message}`); process.exitCode = 1; app.close(); });
  for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => { app.close().then(() => process.exit(0)); });
}
