export function createGameAudio({enabled=()=>false,musicEnabled=enabled,phase=()=>null,volume=()=>.7,doc=document,AudioCtor=Audio}={}){
  const music=new AudioCtor('/audio/island-loop.wav');music.loop=true;music.preload='auto';
  const status=message=>{const e=doc.getElementById?.('audio-status');if(e)e.textContent=message;};music.onplaying=()=>status('Nhạc nền đang phát');music.onpause=()=>status('Nhạc nền đã tạm dừng');music.onerror=()=>status('Không tải được nhạc nền. Thử tải lại trang.');
  const effects=new Set();let speech=null,unlocked=false,lastVolume=-1,musicPending=false;let ctx=null,noiseBuf=null,lastSplashAt=0;
  // Kill-streak voice (Ken 2026-11-09): the streak counts the LOCAL player's
  // consecutive kills and restarts from zero after every respawn. event()
  // keeps its legacy behaviour (voice tier from the event's kills field);
  // streakEvent() feeds it the streak instead of the match total.
  let streak=0,stepIdx=0,lastStepAt=0,stepPool=null,stepFilesOk=true;
  const STEP_FILES=['/audio/step-1.wav','/audio/step-2.wav','/audio/step-3.wav','/audio/step-4.wav'];
  function sync(){
    const effectVolume=enabled()&&!doc.hidden?volume():0;
    const musicVolume=musicEnabled()&&!doc.hidden&&phase()==='lobby'?volume()*.22:0;
    if(effectVolume!==lastVolume){lastVolume=effectVolume;for(const a of effects)a.volume=effectVolume*.7;}
    music.volume=musicVolume;
    if(!musicVolume){music.pause();status(phase()==='lobby'?'Nhạc nền đã tắt':'Nhạc nền chỉ phát trong phòng chờ');}
    else if(unlocked&&music.paused&&!musicPending){musicPending=true;music.play().catch(()=>status('Bấm nút nhạc nền để cho phép phát nhạc.')).finally(()=>musicPending=false);}
  }
  function unlock(){unlocked=true;sync();}
  function play(name,voice=false){if(!enabled()||doc.hidden||!unlocked)return;if(voice&&speech){speech.pause();effects.delete(speech);}const a=new AudioCtor(`/audio/${name}.wav`);a.volume=volume()*(voice?.9:.65);effects.add(a);if(voice)speech=a;const done=()=>{effects.delete(a);if(speech===a)speech=null;};a.onended=done;a.onerror=done;a.play().catch(done);}
  function splash(){
    // Synthesized water "toe" (no audio file): a short noise burst through a
    // band-pass sweep sounds like a splash; capped so rapid fire cannot spam.
    if(!enabled()||doc.hidden)return;const now=performance.now();if(now-lastSplashAt<120)return;lastSplashAt=now;
    try{
      const AC=globalThis.AudioContext||globalThis.webkitAudioContext;if(!AC)return;ctx||=new AC();if(ctx.state==='suspended'){ctx.resume().catch(()=>{});return;}
      if(!noiseBuf){noiseBuf=ctx.createBuffer(1,Math.floor(ctx.sampleRate*.2),ctx.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;}
      const t0=ctx.currentTime,src=ctx.createBufferSource();src.buffer=noiseBuf;
      const bp=ctx.createBiquadFilter();bp.type='bandpass';bp.Q.value=.9;bp.frequency.setValueAtTime(1500+Math.random()*500,t0);bp.frequency.exponentialRampToValueAtTime(500,t0+.16);
      const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=3200;
      const g=ctx.createGain();const peak=.5*volume();g.gain.setValueAtTime(peak,t0);g.gain.exponentialRampToValueAtTime(.001,t0+.18);
      src.connect(bp);bp.connect(lp);lp.connect(g);g.connect(ctx.destination);src.start(t0);src.stop(t0+.19);
    }catch{}
  }
  function ensureCtx(){try{const AC=globalThis.AudioContext||globalThis.webkitAudioContext;if(!AC)return null;ctx||=new AC();if(ctx.state==='suspended')ctx.resume().catch(()=>{});return ctx;}catch{return null;}}
  function noise(){if(!noiseBuf){noiseBuf=ctx.createBuffer(1,Math.floor(ctx.sampleRate*.2),ctx.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;}return noiseBuf;}
  function thud(run){
    // Synthesized footstep fallback: a short low thump plus a soft scrape,
    // alternating pitch so consecutive steps do not sound identical.
    const c=ensureCtx();if(!c)return;try{const t0=c.currentTime,o=c.createOscillator(),g=c.createGain();o.type='sine';const f=(run?108:88)*(stepIdx%2?1.14:1);o.frequency.setValueAtTime(f,t0);o.frequency.exponentialRampToValueAtTime(45,t0+.09);g.gain.setValueAtTime(.32*volume(),t0);g.gain.exponentialRampToValueAtTime(.001,t0+.1);o.connect(g);g.connect(c.destination);o.start(t0);o.stop(t0+.11);
    const src=c.createBufferSource();src.buffer=noise();const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=520;const g2=c.createGain();g2.gain.setValueAtTime(.1*volume(),t0);g2.gain.exponentialRampToValueAtTime(.001,t0+.06);src.connect(lp);lp.connect(g2);g2.connect(c.destination);src.start(t0);src.stop(t0+.07);}catch{}
  }
  function footstep(run=false){
    if(!enabled()||doc.hidden)return;const now=performance.now();if(now-lastStepAt<(run?175:250))return;lastStepAt=now;stepIdx++;
    if(unlocked&&stepFilesOk){
      if(!stepPool)stepPool=STEP_FILES.map(f=>{const a=new AudioCtor(f);a.preload='auto';a.onerror=()=>{stepFilesOk=false;};return a;});
      const a=stepPool[stepIdx%stepPool.length];
      try{a.pause();a.currentTime=0;a.volume=volume()*(run?.5:.36);a.playbackRate=(run?1.5:1)*(stepIdx%2?1.1:.95);const p=a.play();if(p&&p.catch)p.catch(()=>{stepFilesOk=false;thud(run);});return;}catch{stepFilesOk=false;}
    }
    thud(run);
  }
  function bombWhistle(){
    // Falling-bomb whistle: a sine gliding down for roughly the fall time.
    if(!enabled()||doc.hidden)return;const c=ensureCtx();if(!c)return;try{const t0=c.currentTime,o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(1500,t0);o.frequency.exponentialRampToValueAtTime(320,t0+1.5);g.gain.setValueAtTime(.0001,t0);g.gain.exponentialRampToValueAtTime(.09*volume()+.0001,t0+.18);g.gain.exponentialRampToValueAtTime(.001,t0+1.6);o.connect(g);g.connect(c.destination);o.start(t0);o.stop(t0+1.65);}catch{}
  }
  function boom(level=1){
    if(!enabled()||doc.hidden)return;const c=ensureCtx();if(!c)return;try{const t0=c.currentTime,v=Math.max(.04,Math.min(1,level))*volume();
    const src=c.createBufferSource();src.buffer=noise();src.loop=true;const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.setValueAtTime(900,t0);lp.frequency.exponentialRampToValueAtTime(60,t0+.6);const g=c.createGain();g.gain.setValueAtTime(.85*v,t0);g.gain.exponentialRampToValueAtTime(.001,t0+.7);src.connect(lp);lp.connect(g);g.connect(c.destination);src.start(t0);src.stop(t0+.75);
    const o=c.createOscillator(),g2=c.createGain();o.type='sine';o.frequency.setValueAtTime(110,t0);o.frequency.exponentialRampToValueAtTime(32,t0+.5);g2.gain.setValueAtTime(.7*v,t0);g2.gain.exponentialRampToValueAtTime(.001,t0+.55);o.connect(g2);g2.connect(c.destination);o.start(t0);o.stop(t0+.6);}catch{}
  }
  function streakEvent(e,id){if(e.type==='out'&&e.attacker===id){streak++;return event({...e,kills:Math.min(streak,5)},id);}return event(e,id);}
  function resetStreak(){streak=0;}
  function event(e,id){if(e.type==='heal'&&e.player===id)play('heal');if(e.type==='skill'&&e.player===id)play('skill');if(e.type==='out'){if(e.player===id)play('defeat');else if(e.attacker===id){play('kill');if(e.kills>=1&&e.kills<=5)play(e.kills===5?'pentakill':`kill-${e.kills}`,true);}}}
  doc.addEventListener('visibilitychange',()=>{sync();if(doc.hidden){for(const a of effects)a.pause();effects.clear();speech=null;}});
  return{unlock,sync,event,splash,streakEvent,resetStreak,footstep,bombWhistle,boom,preview:name=>{unlock();play(name,name.startsWith('kill-')||name==='pentakill');}};
}
