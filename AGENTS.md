# Working on Chibi Island

REQUIRED RELEASE RULE: Always let the user inspect the local/offline preview first. Never upload source or deploy to the server until the user approves that specific preview. User explicitly authorized adding 4 original anime-style 3D characters and publishing the complete 0.7.2 release after testing. Proceed with this release; future releases still require local preview approval.

CURRENT STATUS: Version 0.6.4 published to the fixed Render URL and verified Live on 2026-11-06. Commit 0a727d4823fe97fde11cd331592bfa80e4ac0f35. HTTPS/version checks, three-client WSS smoke, and five-client WSS smoke on every map passed. All 52 tests passed. Public lobby and portrait gate verified; actual pointer lock needs direct Chrome/Edge because the embedded browser blocks capture.

- Project: this directory. Preserve the original game_development_plan.md in the parent directory.
- Public game: https://chibi-island-mini.onrender.com
- Private source repository: https://github.com/datmmo0001/chibi-island-mini, branch main.
- Render service: srv-dblv4tt9fdbs73bagjf0, workspace datpro88, Singapore, Docker, Free, one instance.
- Keep this service and URL. The user chose the free plan. Ask before any paid upgrade or new financial commitment.
- Rooms live in RAM. Keep one instance; a deploy/restart can end active rooms.
- Auto-Deploy was deliberately set Off. Upload the complete coherent release first, then use Manual Deploy -> Deploy latest commit. Partial source uploads must not become separate production releases.
- Run the package's tests and relevant browser checks. After Render reports Live, check /health and /version and run tests/public-smoke.mjs against the fixed HTTPS origin. Report publication only after these checks pass.
- Preserve private rooms of 3 or 5 humans on every map and 20 humans on Frontier, plus solo play. Fill rooms of 3/5 humans to eight participants, and 20-human rooms to twenty participants. Keep the optional game-info disclosure about computer opponents, without labels on individual opponents or fake online-user counts.
- Never upload .runtime, .tools, .env, control tokens, private local logs, or unrelated personal files. The Dockerfile copies only package.json, shared.js, server and public.
- Use existing authenticated tools/browser sessions when available. There is no Git checkout in this directory yet; prior releases were uploaded through the GitHub browser UI. Do not assume local Git authentication exists.
- Keep HUONG_DAN.md, BAN_GIAO.md, RENDER_HOSTING.md and CHANGELOG.md accurate. Update the packaged source and local runnable copy in the chat outputs after a release.
- Real-device touch/performance testing and an Android package are still pending. Do not claim Play Store publication or an achieved store rating.

LAN ACCESS: User authorized all phones on same Wi-Fi subnet. TCP 3100 allowed for 192.168.1.0/24 on Wi-Fi at 192.168.1.15 for game Node executable (Chibi-Game-3100-Allow-Wifi-LAN). Prior per-phone block now excludes whole /24; other-address block, other ports and UDP unchanged. LAN HTTP and WebSocket checked from PC; physical peer check remains with user. Do not restore Samsung-only restriction.
