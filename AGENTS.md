# Working on Chibi Island

The user's latest instruction is to keep improving this game and publish tested upgrades to the existing fixed URL so their friends can play them. Continue that workflow within the requested task, including deployment after verification.

- Project: this directory. Preserve the original game_development_plan.md in the parent directory.
- Public game: https://chibi-island-mini.onrender.com
- Private source repository: https://github.com/datmmo0001/chibi-island-mini, branch main.
- Render service: srv-dblv4tt9fdbs73bagjf0, workspace datpro88, Singapore, Docker, Free, one instance.
- Keep this service and URL. The user chose the free plan. Ask before any paid upgrade or new financial commitment.
- Rooms live in RAM. Keep one instance; a deploy/restart can end active rooms.
- Auto-Deploy was deliberately set Off. Upload the complete coherent release first, then use Manual Deploy -> Deploy latest commit. Partial source uploads must not become separate production releases.
- Run the package's tests and relevant browser checks. After Render reports Live, check /health and /version and run tests/public-smoke.mjs against the fixed HTTPS origin. Report publication only after these checks pass.
- Preserve three-human private rooms and solo play. Fill empty slots to eight participants. Keep the optional game-info disclosure about computer opponents, without labels on individual opponents or fake online-user counts.
- Never upload .runtime, .tools, .env, control tokens, private local logs, or unrelated personal files. The Dockerfile copies only package.json, shared.js, server and public.
- Use existing authenticated tools/browser sessions when available. There is no Git checkout in this directory yet; prior releases were uploaded through the GitHub browser UI. Do not assume local Git authentication exists.
- Keep HUONG_DAN.md, BAN_GIAO.md, RENDER_HOSTING.md and CHANGELOG.md accurate. Update the packaged source and local runnable copy in the chat outputs after a release.
- Real-device touch/performance testing and an Android package are still pending. Do not claim Play Store publication or an achieved store rating.
