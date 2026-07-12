/* ===== the timeline: frame(p) writes the whole reel's state for one scroll position ===== */
import { $, reduce, seg, lerp, eOut, fmt } from './util.js';
import { PW, PAN, SPREAD } from './stage.js';
import { drawCookie, CRUMB_P, crumbLayer } from './cookie.js';

var bgDark=$('bgDark'),bgBlue=$('bgBlue'),bug=$('bug'),flash=$('flash'),
    tcEl=$('tc'),fill=$('fill'),head=$('head'),shotEl=$('shot'),hint=$('hint'),
    bar=$('bar'),marks=$('marks');
var E={cd1:$('cd1'),doodle:$('doodle'),kase:$('case'),lid:$('lid'),cover:$('cover')};

var mh='';for(var s=0;s<=7;s++){mh+='<b style="left:'+(s/7*100)+'%">2:'+(13+s)+'</b>';}marks.innerHTML=mh;

var lastP=0,lastPct=-1,lastTc='';

/* ===== the burn, in the order a hand would do it =====
   [class, start, duration] in timeline p. Nothing here fades in: SVG marks are drawn by
   letting out a dashoffset, lettering is wiped left→right the way a marker lays ink down.
   The order is the order you would work in — name who it is, name the song (twice: the
   disc is bilingual), box the cut that is on it, then fill the gaps with decoration. The
   cookie is drawn last, because it is the thing the reel opened on, and closing the loop
   is the last thing you do. */
var MARKS=[
  ['d-njk',   0.580,0.050],  /* 뉴진스 — the first stroke, landing as the disc reaches its seat */
  ['d-nj',    0.608,0.068],  /* NEWJEANS, big, in red */
  ['d-bang',  0.662,0.022],
  ['d-song',  0.672,0.036],  /* COOKIE */
  ['d-arrow2',0.700,0.028],  /* → NEWJEANS */
  ['d-kuki',  0.706,0.036],  /* 쿠키 */
  ['d-arrow1',0.732,0.028],  /* → 쿠키 */
  ['d-cut',   0.740,0.038],  /* 2:13-2:20, the seven seconds */
  ['d-star',  0.762,0.034],
  ['d-star2', 0.774,0.024],
  ['d-heart', 0.778,0.024],
  ['d-smile', 0.784,0.030],
  ['d-star3', 0.786,0.016],
  ['d-spark', 0.792,0.014],
  ['d-heart2',0.796,0.016],
  ['d-note',  0.800,0.024],
  ['d-flow',  0.806,0.028],
  ['d-squig', 0.812,0.020],
  ['d-loop',  0.818,0.018],
  ['d-yeah',  0.822,0.024],
  ['d-cookie',0.826,0.046]
];
/* [node, start, end, the last --w written]. --w is read by stroke-dashoffset, fill-opacity
   and clip-path, so a single write invalidates every shape under that mark. A mark that has
   not started, or has already finished, holds the same number for most of the reel: 21 marks
   were being rewritten 60 times a second to say nothing. Write only what changed. */
var mEl=MARKS.map(function(m){return [E.doodle.querySelector('.'+m[0]),m[1],m[1]+m[2],''];});
var cutEl=E.doodle.querySelector('.d-cut'), lastHw='';
var ulEl=document.querySelector('.ib-ul'), lastUw='';
var lwEl=document.querySelector('.tl li.on'), lastLw='';

/* most of what frame() writes sits still for most of the timeline. the marks learned this
   first (mEl above): write only what changed. L caches the last written value of everything
   else -- each value built exactly as before, numbers and strings alike, so a skipped write
   is precisely a write that would have said nothing. */
var L={bg:-1,ko:-1,kt:'',lt:'',cl:-1,gl:'',sw:'',bt:'',fl:'',sh:-1,hint:false};
var SHOTN=['암전 · black','쿠키 · zoom & burst','파랑 · into blue','케이스 · the lid opens','룩 · type · color · layout','닫기 · the lid comes down'];
var SHOTC=['#9aa0b2','#e8b06a','#eaf1ff','#eaf1ff','#eaf1ff','#eaf1ff'];

export function frame(p){
  /* pure dark → giant cookie zooms in → bursts (canvas); a few crumbs ride into the blue */
  drawCookie(p);
  /* background snaps dark→blue at the burst */
  var cx=seg(p,0.15,0.20);
  if(cx!==L.bg){ L.bg=cx; bgDark.style.opacity=1-cx; bgBlue.style.opacity=cx; }

  /* the case rises exactly as the giant cookie leaves: its ramp is the mirror of the blurred
     cookie's fade (1 - fa, fa = 1 - seg(p,0.15,0.19)). the bloom is translucent by then, so a
     ramp that finished any earlier would show the printed cover straight through the burst. */
  var open=eOut(seg(p,0.34,0.52)), shut=eOut(seg(p,0.90,1.00));
  var swing=open-shut;                          /* 0 = lid down, 1 = flat open */
  var ko=seg(p,0.155,0.205);
  if(ko!==L.ko){ L.ko=ko; E.kase.style.opacity=ko; }

  /* ===== the camera =====
     There was never a camera here: a tripod wide shot, with the case sliding itself
     sideways to keep the spread centred. That slide IS a camera whose focus F sits on the
     spread's centre at z=1 — so generalise it instead of adding to it. F is a point in the
     case's own coordinates (0 = the hub), z multiplies the rise scale, and the case is
     transformed so F lands on the stage's centre. With A=B=C=0 the formula collapses to
     the old translateX(swing*PAN): before 0.36, and at the canvas→DOM hand-off at 0.30,
     nothing has changed.
     One continuous move, and the scroll is its dolly rail — reversible, like everything
     else on this transport. Push in on the booklet while the lid opens, slide right onto
     the bare disc so the camera lands as the first stroke does (0.580), sit there while
     the marker works, let the lid come down across the lens at 0.90, and only then step
     back out to the tripod. The longest act finally gets the closest shot.
     The booklet is a true insert, not a half-zoom: at 1.6 the page owns the frame top to
     bottom, with one sliver of blue field on its left and one of spine on its right, so
     it still reads as a page on the case and not a scan of one (1.85, tried, was a scan).
     Its content (measured: y -237..198 in case coords) sits whole inside the window —
     which is why the focus never needs to leave y=0 and the transform stays
     translateX-only. An insert needs an event, so the camera does not visit a printed
     page: it lands, and the marker pulls the red line out under 파랑 (--uw below)
     before walking right to start on the disc. */
  var A=eOut(seg(p,0.36,0.51));    /* push in: the opening booklet */
  var B=eOut(seg(p,0.568,0.605));  /* slide right: the disc, met by the first stroke */
  var C=eOut(seg(p,0.93,1.00));    /* step back out to the tripod */
  var fx=lerp(lerp(lerp(-swing*PAN,-PW,A),0,B),-swing*PAN,C);
  /* +0.05 creep across the burn: a locked-off zoom reads as a still, a breathing one as a
     shot that is waiting. C lerps from the crept value, so the pull-out is seamless. */
  var z=lerp(lerp(lerp(1,1.6,A),1.5,B)+0.05*seg(p,0.62,0.88),1,C);
  var k=z*lerp(0.985,1,eOut(seg(p,0.16,0.30)));
  var kt='translateX('+(-k*fx).toFixed(1)+'px) scale('+k.toFixed(4)+')';
  if(kt!==L.kt){ L.kt=kt; E.kase.style.transform=kt; }
  /* negative: the free edge lifts toward the camera and arcs over the hinge, rather than
     sinking away from it. the same 180deg, the opposite half of the sphere. */
  var lt='rotateY('+(-180*swing).toFixed(2)+'deg)';
  if(lt!==L.lt){ L.lt=lt; E.lid.style.transform=lt; }
  var cl=p<CRUMB_P?0:1;   /* the other half of the hand-off */
  if(cl!==L.cl){ L.cl=cl; crumbLayer.style.opacity=cl; }
  /* light drags across the lid twice: once when the cookie uncovers it, once as it shuts.
     between 0.52 and 0.90 the cover faces away, so resetting the band at 0.86 is unseen. */
  var gl=((p<0.86?seg(p,0.20,0.33):seg(p,0.90,1.00))*SPREAD).toFixed(0)+'px';
  if(gl!==L.gl){ L.gl=gl; E.cover.style.setProperty('--gloss',gl); }

  /* one rake of light across the face — a still disc with a frozen highlight reads as printed */
  var sw=lerp(-62,32,eOut(seg(p,0.46,0.72))).toFixed(1)+'deg';
  if(sw!==L.sw){ L.sw=sw; E.cd1.style.setProperty('--sweep',sw); }
  /* the ident's opacity clock (.20-.30) closes inside its transform clock (.20-.32) */
  var bt='scale('+lerp(0.6,1,eOut(seg(p,0.20,0.32)))+') rotate(-1.5deg)';
  if(bt!==L.bt){ L.bt=bt; bug.style.opacity=seg(p,0.20,0.30); bug.style.transform=bt; }

  /* burn — the marker goes to work on the bare disc, one mark at a time */
  for(var i=0;i<mEl.length;i++){ var m=mEl[i], w=seg(p,m[1],m[2]).toFixed(3);
    if(w!==m[3]){ m[3]=w; m[0].style.setProperty('--w', w); } }
  /* the highlighter is pulled through the cut after the box around it is closed:
     on this surface the seven seconds are the subject */
  var hw=seg(p,0.780,0.808).toFixed(3);
  if(hw!==lastHw){ lastHw=hw; cutEl.style.setProperty('--hw', hw); }
  /* the insert's two events, in reading order and with one hand: the red line goes under
     파랑, then the highlighter is pulled through "3 layout" — the same gesture the burn
     repeats on the disc at 0.780, there through the timecode: the pen marks each
     surface's subject. the camera is 99.8% landed by 0.49 (eOut), so the dwell
     effectively starts there. after the swipe the finished page holds for one beat
     (0.548-0.568, a breath at play speed) before B leaves for the disc: an insert has to
     show you what the hand made, not just the making. */
  var uw=seg(p,0.494,0.526).toFixed(3);
  if(uw!==lastUw){ lastUw=uw; ulEl.style.setProperty('--uw', uw); }
  var lw=seg(p,0.530,0.548).toFixed(3);
  if(lw!==lastLw){ lastLw=lw; lwEl.style.setProperty('--lw', lw); }

  /* scrubber + hud. the aria pair is only rewritten when the whole percent turns over:
     a screen reader does not want 60 announcements a second, and neither does the DOM. */
  var tc=fmt(p);
  if(tc!==lastTc){ lastTc=tc; tcEl.textContent=tc; bar.setAttribute('aria-valuetext',tc); }
  var fl=(p*100)+'%';
  if(fl!==L.fl){ L.fl=fl; fill.style.width=fl; head.style.left=fl; }
  var pct=Math.round(p*100);
  if(pct!==lastPct){ lastPct=pct; bar.setAttribute('aria-valuenow',pct); }
  var sh=p<0.055?0:p<0.22?1:p<0.34?2:p<0.56?3:p<0.90?4:5;
  if(sh!==L.sh){ L.sh=sh; shotEl.textContent=SHOTN[sh]; shotEl.style.color=SHOTC[sh]; }
  if(!reduce && lastP<0.15 && p>=0.15){flash.classList.remove('go');void flash.offsetWidth;flash.classList.add('go');}
  lastP=p;
  if(p>0.01&&!L.hint){ L.hint=true; hint.classList.add('hide'); }
}
