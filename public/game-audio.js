export function createGameAudio({enabled=()=>false,musicEnabled=enabled,phase=()=>null,volume=()=>.7,doc=document,AudioCtor=Audio}={}){
  const music=new AudioCtor('/audio/island-loop.wav');music.loop=true;music.preload='auto';
  const status=message=>{const e=doc.getElementById?.('audio-status');if(e)e.textContent=message;};music.onplaying=()=>status('Nhạc nền đang phát');music.onpause=()=>status('Nhạc nền đã tạm dừng');music.onerror=()=>status('Không tải được nhạc nền. Thử tải lại trang.');
  const effects=new Set();let speech=null,unlocked=false,lastVolume=-1,musicPending=false;
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
  function event(e,id){if(e.type==='heal'&&e.player===id)play('heal');if(e.type==='skill'&&e.player===id)play('skill');if(e.type==='out'){if(e.player===id)play('defeat');else if(e.attacker===id){play('kill');if(e.kills>=1&&e.kills<=5)play(e.kills===5?'pentakill':`kill-${e.kills}`,true);}}}
  doc.addEventListener('visibilitychange',()=>{sync();if(doc.hidden){for(const a of effects)a.pause();effects.clear();speech=null;}});
  return{unlock,sync,event,preview:name=>{unlock();play(name,name.startsWith('kill-')||name==='pentakill');}};
}
