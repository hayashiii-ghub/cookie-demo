/* ===== the transport: scroll is the tape, and everything here just moves the tape =====
   entry module — importing this pulls in the whole reel (util → stage → cookie → frame)
   in the same order the old inline script ran it, and the wiring below is the part that
   used to sit at the bottom of that script. */
import { $, clamp, reduce } from './util.js';
import { sizeCookie } from './cookie.js';
import { frame } from './frame.js';

var bar=$('bar');

var maxScroll=1;
function measure(){maxScroll=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);}
measure();

var ticking=false;
function onScroll(){ if(!ticking){ticking=true;requestAnimationFrame(function(){frame(clamp(window.scrollY/maxScroll,0,1));ticking=false;});} }
window.addEventListener('scroll',onScroll,{passive:true});

/* A resize wipes the canvas: assigning cv.width resets the bitmap, and frame() is otherwise
   only ever driven by scroll. On a phone every show and hide of the URL bar is a resize, so
   stopping the scroll at the wrong moment left the reel blank. Repaint at once, and do the
   whole thing in one listener so the layout is read once and the stage is sized before the
   new maxScroll is used to place the playhead. */
/* p is the truth; scrollY is only what carries it. maxScroll is scrollHeight minus the
   viewport, so anything that changes the viewport changes p without the page having moved.
   On a phone that is the URL bar sliding away: the reel would jump a couple of percent down
   its own timeline while the finger held still. Read p first, then put scrollY back where it
   has to be to mean the same p. The reel is position:fixed, so nothing on screen moves. */
window.addEventListener('resize',function(){
  var p=clamp(window.scrollY/maxScroll,0,1);
  sizeCookie(); measure();
  var y=p*maxScroll;
  if(Math.abs(y-window.scrollY)>0.5) window.scrollTo(0,y);
  frame(p); });

/* ===== the scrubber =====
   A single tap eases to its mark. A DRAG must not: a phone delivers pointermove at 120Hz,
   and a smooth scroll started on every one of them spends its life being cancelled by the
   next, so the playhead lags the thumb by however long the easing had left. While the
   thumb is down the scroll is instantaneous and the film moves exactly with it. */
function jump(x,smooth){ var r=bar.getBoundingClientRect(), f=clamp((x-r.left)/r.width,0,1);
  window.scrollTo({top:f*maxScroll, behavior:smooth?'smooth':'auto'}); }
function seek(p){ window.scrollTo({top:clamp(p,0,1)*maxScroll, behavior:'auto'}); }
var dragging=0;   /* the captured pointerId, or 0 */
/* release on cancel as well as on up. iOS cancels a gesture the moment it decides the touch
   belongs to the page, and a drag that is never released leaves the bar seeking under any
   finger that later crosses it. */
function endDrag(e){ if(!dragging) return;
  if(bar.hasPointerCapture(e.pointerId)) bar.releasePointerCapture(e.pointerId);
  dragging=0; }
bar.addEventListener('pointerdown',function(e){ userInterrupt(); dragging=e.pointerId;
  bar.setPointerCapture(e.pointerId); bar.focus(); jump(e.clientX,true); });
bar.addEventListener('pointermove',function(e){ if(dragging===e.pointerId) jump(e.clientX,false); });
bar.addEventListener('pointerup',endDrag);
bar.addEventListener('pointercancel',endDrag);

/* the bar is a slider, so it answers to a keyboard. one frame of the reel is 1/168. */
var STEP=1/168, PAGE=24/168;   /* a frame, and a second */
bar.addEventListener('keydown',function(e){
  var p=clamp(window.scrollY/maxScroll,0,1), k=e.key, d=0;
  if(k==='ArrowRight'||k==='ArrowUp') d=STEP; else if(k==='ArrowLeft'||k==='ArrowDown') d=-STEP;
  else if(k==='PageUp') d=PAGE; else if(k==='PageDown') d=-PAGE;
  else if(k==='Home'){ userInterrupt(); e.preventDefault(); seek(0); return; }
  else if(k==='End'){ userInterrupt(); e.preventDefault(); seek(1); return; }
  else return;
  userInterrupt(); e.preventDefault(); seek(p+d); });

/* ===== playback — a ▶ that scrolls the timeline; any scroll/touch/drag pauses it ===== */
var playBtn=$('play');
var ICON_PLAY='<svg viewBox="0 0 24 24"><path d="M7 5 L19 12 L7 19 Z"/></svg>';
var ICON_PAUSE='<svg viewBox="0 0 24 24"><path d="M7 5h4v14H7z M13 5h4v14h-4z"/></svg>';
/* 7000 is not a taste number: the reel IS seven seconds (2:13 → 2:20), so autoplay runs
   the timecode at 1:1. it was 6000, quietly playing the film 17% fast. */
var PLAY_MS=7000, playing=false, rafId=0, playStart=0, playFromP=0, userTouched=false;
function setBtn(on){ playBtn.innerHTML=on?ICON_PAUSE:ICON_PLAY; playBtn.setAttribute('aria-label',on?'일시정지':'재생'); playBtn.setAttribute('aria-pressed',on?'true':'false'); }
function stopPlay(){ if(rafId){cancelAnimationFrame(rafId);rafId=0;} if(playing){playing=false;setBtn(false);} }
function tickPlay(now){ var p=playFromP+(now-playStart)/PLAY_MS;
  if(p>=1){ window.scrollTo(0,maxScroll); stopPlay(); return; }
  window.scrollTo(0,p*maxScroll); rafId=requestAnimationFrame(tickPlay); }
function startPlay(){ var cur=clamp(window.scrollY/maxScroll,0,1); if(cur>=0.999)cur=0;
  playFromP=cur; window.scrollTo(0,cur*maxScroll); playStart=performance.now(); playing=true; setBtn(true); rafId=requestAnimationFrame(tickPlay); }
function togglePlay(){ if(playing)stopPlay(); else startPlay(); }
/* the target must be checked before contains(): a synthetic wheel dispatched on window
   arrives with target=window, which is not a Node, and contains() throws on it — killing
   the listener and leaving autoplay running through the very event sent to stop it.
   real input never trips this; test harnesses (shimon included) dispatch exactly that. */
function onButton(t){ return playBtn && t instanceof Node && (t===playBtn || playBtn.contains(t)); }
function userInterrupt(e){ if(e && onButton(e.target)) return; userTouched=true; stopPlay(); }
if(playBtn){ setBtn(false); playBtn.addEventListener('click',function(){userTouched=true;togglePlay();}); }
window.addEventListener('wheel',userInterrupt,{passive:true});
window.addEventListener('touchstart',userInterrupt,{passive:true});
window.addEventListener('keydown',function(e){
  if(e.code==='Space'){ if(onButton(e.target))return; e.preventDefault(); userTouched=true; togglePlay(); }
  else if(e.key==='ArrowDown'||e.key==='ArrowUp'||e.key==='PageDown'||e.key==='PageUp'||e.key==='Home'||e.key==='End'){ userInterrupt(); } });

frame(clamp(window.scrollY/maxScroll,0,1));

/* autostart once — reveals the intended motion; skipped for reduced-motion or if the user already moved */
if(!reduce){ setTimeout(function(){ if(!userTouched && window.scrollY<2){ startPlay(); } }, 1100); }
