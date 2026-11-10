/* Independent, deterministic game rules. Phaser supplies rendering, not the rules. */
(function(root,factory){if(typeof module==='object')module.exports=factory();else root.GameRules=factory();})(this,function(){
 'use strict';
 const W=3200,FLOOR=394,PW=66,PH=40;
 const BASE_OBS=[{x:470,w:36,h:42},{x:820,w:40,h:52},{x:1210,w:46,h:45},{x:1640,w:42,h:58},{x:2070,w:50,h:48},{x:2530,w:44,h:56}];
 const PLATFORMS=[{x:630,y:315,w:100},{x:1440,y:310,w:100},{x:2300,y:310,w:100}];
 function create(id=1,stage=3){if(!Number.isInteger(id)||id<1||id>10)throw Error('invalid character');return {id,stage,x:80,y:FLOOR-PH,vx:0,vy:0,hp:3,score:0,maxX:80,grounded:true,mode:'playing',cooldown:0,elapsed:0,jumps:0,hits:0,collected:[],events:[]};}
 function pause(s){if(s.mode==='playing')s.mode='paused';else if(s.mode==='paused')s.mode='playing';}
 function step(s,input,dt){
  if(s.mode!=='playing')return s; dt=Math.max(0,Math.min(dt,0.035));s.elapsed+=dt;s.cooldown=Math.max(0,s.cooldown-dt);
  s.vx=((input.right?1:0)-(input.left?1:0))*205;
  if(input.jump&&s.grounded){s.vy=-510;s.grounded=false;s.jumps++;s.events.push('jump');}
  let oldBottom=s.y+PH;s.vy+=1300*dt;s.x=Math.max(0,Math.min(W-PW,s.x+s.vx*dt));s.y+=s.vy*dt;s.grounded=false;
  if(s.stage>1&&s.vy>=0){for(const p of PLATFORMS){if(oldBottom<=p.y+2&&s.y+PH>=p.y&&s.x+PW>p.x&&s.x<p.x+p.w){s.y=p.y-PH;s.vy=0;s.grounded=true;break;}}}
  if(s.y+PH>=FLOOR){s.y=FLOOR-PH;s.vy=0;s.grounded=true;}
  if(s.stage>1&&s.cooldown===0){for(const o of BASE_OBS){if(s.x+PW>o.x&&s.x<o.x+o.w&&s.y+PH>FLOOR-o.h&&s.y<FLOOR){s.hp--;s.hits++;s.cooldown=1.25;s.x=Math.max(0,s.x-90);s.events.push('hit');if(s.hp<=0){s.mode='over';s.events.push('over');}break;}}}
  s.maxX=Math.max(s.maxX,s.x);
  for(let i=0;i<9;i++){if(s.x>260+i*320&&!s.collected.includes(i)){s.collected.push(i);s.events.push('stamp');}}
  s.score=Math.max(0,Math.floor((s.maxX-80)/10))+s.collected.length*50;
  if(s.x>=W-PW-5&&s.mode==='playing'){s.mode='won';s.events.push('won');}
  if(s.events.length>50)s.events=s.events.slice(-50);return s;
 }
 return {create,step,pause,W,FLOOR,PW,PH,obstacles:BASE_OBS,platforms:PLATFORMS};
});
