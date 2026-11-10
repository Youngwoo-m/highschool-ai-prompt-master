/* Phaser rendering + accessible DOM controls. See rules.js for simulation. */
'use strict';
const Q=s=>document.querySelector(s), R=GameRules, chars=window.CHARACTERS;
const lesson=Number(new URLSearchParams(location.search).get('lesson')||3);
let selected=1, state=null, engine=null, sceneRef=null;
const held={left:false,right:false,jump:false};let jumpQueued=false;
const keys={};
function select(id){selected=id;document.querySelectorAll('.card').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.id)===id)));Q('#chosen').textContent='선택: '+chars[id-1].label;}
for(const c of chars){const b=document.createElement('button');b.className='card';b.dataset.id=c.id;b.setAttribute('aria-label',c.label+' 선택');b.setAttribute('aria-pressed','false');b.innerHTML=`<img src="${c.file}" alt="${c.label} 원본 이미지"><span>VIEW ${String(c.id).padStart(2,'0')}</span><strong>${c.name}</strong>`;b.onclick=()=>select(c.id);Q('#cards').append(b);}select(1);
function setStatus(){Q('#hero-name').textContent=chars[selected-1].label;Q('#hud-text').textContent=`♥ ${state.hp} / 3　점수 ${state.score}　거리 ${Math.floor(state.maxX-80)}m`;Q('#status').textContent={playing:'장애물을 점프로 넘어 도착 깃발까지!',paused:'일시정지 — P 또는 계속하기',over:'탐험 종료 — 다시 시작해 보세요',won:'도착! 제천10경 탐험 완료'}[state.mode];Q('#pause').textContent=state.mode==='paused'?'계속하기 P':'일시정지 P';Q('#state').textContent=JSON.stringify({characterId:state.id,mode:state.mode,x:Math.round(state.x),y:Math.round(state.y),grounded:state.grounded,hp:state.hp,score:state.score,jumps:state.jumps,hits:state.hits,events:state.events},null,2);}
function reset(){state=R.create(selected,lesson);jumpQueued=false;held.left=held.right=false;for(const k in keys)delete keys[k];if(sceneRef){sceneRef.hero.setTexture('c'+selected);sceneRef.hero.setVisible(lesson>=3);}setStatus();Q('#game').focus();}
function toggle(){if(!state)return;R.pause(state);jumpQueued=false;setStatus();}
Q('#pause').onclick=toggle;Q('#restart').onclick=reset;Q('#choose-again').onclick=()=>{state=null;if(engine){engine.destroy(true);engine=null;sceneRef=null;}Q('#play').hidden=true;Q('#selection').hidden=false;};
for(const id of ['left','right']){const b=Q('#'+id);b.onpointerdown=e=>{b.setPointerCapture(e.pointerId);held[id]=true;};b.onpointerup=()=>held[id]=false;b.onpointercancel=()=>held[id]=false;}
Q('#jump').onclick=()=>jumpQueued=true;
document.addEventListener('keydown',e=>{if(!state||Q('#play').hidden)return;if(['ArrowLeft','ArrowRight','Space','KeyA','KeyD','KeyP'].includes(e.code))e.preventDefault();if(e.code==='KeyP'&&!e.repeat)toggle();if(e.code==='Space'&&!e.repeat)jumpQueued=true;keys[e.code]=true;});
document.addEventListener('keyup',e=>{keys[e.code]=false;});window.addEventListener('blur',()=>{for(const k in keys)delete keys[k];held.left=held.right=false;if(state&&state.mode==='playing')toggle();});
Q('#start').onclick=()=>{Q('#selection').hidden=true;Q('#play').hidden=false;state=R.create(selected,lesson);boot();setStatus();Q('#game').focus();};
function boot(){
class Trail extends Phaser.Scene{
 preload(){for(const c of chars)this.load.image('c'+c.id,c.file);this.load.on('loaderror',f=>{Q('#runtime').textContent='이미지 로딩 실패: '+f.url;});}
 create(){sceneRef=this;this.bg=this.add.graphics();this.hero=this.add.image(0,0,'c'+selected).setOrigin(0);this.hero.setDisplaySize(R.PW,R.PH);this.hero.setVisible(lesson>=3);Q('#runtime').textContent='Phaser '+Phaser.VERSION+' · 로컬 자원 · 단일 스테이지 · 수업용 예제';}
 update(time,delta){if(!state)return;R.step(state,{left:held.left||keys.ArrowLeft||keys.KeyA,right:held.right||keys.ArrowRight||keys.KeyD,jump:jumpQueued},delta/1000);jumpQueued=false;const cam=Math.max(0,Math.min(R.W-960,state.x-230));const g=this.bg;g.clear();g.fillStyle(0xb4ded9);g.fillRect(0,0,960,450);
  // Pixel stepped mountains, lake and ground are original procedural artwork.
  g.fillStyle(0x7eaaa8);for(let j=-1;j<8;j++){let x=j*240-(cam*.15)%240;for(let k=0;k<6;k++)g.fillRect(x+k*20,250-k*20,240-k*40,145+k*20);}
  g.fillStyle(0x4b8b94);g.fillRect(0,320,960,74);g.fillStyle(0x9bd7ce);for(let j=0;j<22;j++)g.fillRect(j*59-(cam*.3)%59,342+(j%3)*11,28,3);
  g.fillStyle(0x41684f);g.fillRect(0,R.FLOOR,960,56);g.fillStyle(0x7ea862);g.fillRect(0,R.FLOOR,960,8);g.fillStyle(0x2c4b3b);for(let j=0;j<40;j++)g.fillRect(j*32-cam%32,R.FLOOR+22,19,4);
  if(lesson>1){for(const p of R.platforms){g.fillStyle(0x72965d);g.fillRect(p.x-cam,p.y,p.w,9);g.fillStyle(0x5c6250);g.fillRect(p.x-cam,p.y+9,p.w,12);}for(const o of R.obstacles){g.fillStyle(0xac6549);g.fillRect(o.x-cam,R.FLOOR-o.h,o.w,o.h);g.fillStyle(0xe3ac64);g.fillRect(o.x-cam+4,R.FLOOR-o.h+4,o.w-8,6);g.fillStyle(0x855244);g.fillRect(o.x-cam+o.w/2-2,R.FLOOR-o.h+12,4,o.h-12);}}
  for(let i=0;i<9;i++){if(!state.collected.includes(i)){let x=260+i*320-cam;g.fillStyle(0xf0c975);g.fillRect(x,308,12,12);g.fillStyle(0xffe6a5);g.fillRect(x+3,311,6,6);}}
  const gx=R.W-120-cam;g.fillStyle(0x274850);g.fillRect(gx,200,6,194);g.fillStyle(0xeec777);g.fillRect(gx+6,200,64,40);g.fillStyle(0x315849);g.fillRect(gx+22,212,24,12);
  this.hero.setPosition(Math.floor(state.x-cam),Math.floor(state.y));this.hero.setAlpha(state.cooldown>0&&Math.floor(time/90)%2?.45:1);if(lesson<3){g.fillStyle(0x1c5667);g.fillRect(state.x-cam,state.y,R.PW,R.PH);}
  if(state.mode!=='playing'){g.fillStyle(0x0b263c,.4);g.fillRect(0,0,960,450);}setStatus();
 }
}
engine=new Phaser.Game({type:Phaser.CANVAS,width:960,height:450,parent:'game',pixelArt:true,roundPixels:true,backgroundColor:'#b4ded9',scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:Trail,audio:{noAudio:true}});
}
