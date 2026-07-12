/* ===== cookie zoom + burst engine (canvas, drawn in 1200x900 stage coords) ===== */
import { $, reduce, lcg, seg, lerp, eOut } from './util.js';
import { BW, BH, PANEL_X, PANEL_Y, fitStage } from './stage.js';

var cv=$('cookie'), ctx=cv.getContext('2d'), DPR=Math.min(2,window.devicePixelRatio||1);
export function sizeCookie(){ var f=fitStage();
  cv.width=Math.round(BW*f*DPR); cv.height=Math.round(BH*f*DPR);
  cv.style.width=BW+'px'; cv.style.height=BH+'px'; ctx.setTransform(f*DPR,0,0,f*DPR,0,0); }
sizeCookie();   /* the resize listener is installed in transport.js, once frame() exists to repaint */
/* milk-glass pastels, not primaries. the reel's world is black, dough and timecode orange;
   a full-saturation candy set read as a logo dropped into it. these keep each hue's name
   but pull it toward milk, which is where the Y2K frame and the MV's props live. */
var MM=['#a3c47e','#88b4e2','#e28275','#eed06a','#f0a984','#ab8fd4'];
var TOP=[ {x:-0.48,y:-0.42,r:0.17,c:'#a3c47e',mm:1},{x:0.34,y:-0.5,r:0.18,c:'#5a2d1c',mm:0},
  {x:-0.56,y:0.48,r:0.16,c:'#88b4e2',mm:1},{x:0.6,y:0.42,r:0.15,c:'#eed06a',mm:1},
  {x:0.42,y:-0.05,r:0.10,c:'#e28275',mm:1},{x:0.66,y:-0.34,r:0.07,c:'#ab8fd4',mm:1},
  {x:0.04,y:0.12,r:0.11,c:'#4a2c17',mm:0},{x:-0.18,y:-0.08,r:0.08,c:'#4a2c17',mm:0},
  {x:-0.32,y:0.2,r:0.09,c:'#4a2c17',mm:0},{x:0.16,y:0.5,r:0.09,c:'#4a2c17',mm:0},{x:-0.04,y:-0.5,r:0.08,c:'#4a2c17',mm:0} ];

/* the crust wobble, one law, shared by the canvas cookie, the disc doodle and the jacket art */
function crustPath(g,cx,cy,R,N){ g.beginPath();
  for(var i=0;i<=N;i++){ var a=i/N*6.283, rad=R*(0.96+0.04*Math.sin(a*5+1.2)+0.02*Math.sin(a*9));
    var x=cx+Math.cos(a)*rad, y=cy+Math.sin(a)*rad; i?g.lineTo(x,y):g.moveTo(x,y); }
  g.closePath(); }

/* a chocolate chunk is a broken solid: a body, a facet where the break caught the light,
   and one small specular on the facet's edge. a flat polygon with a soft blob on it is
   the plastic look — the facet is what makes it read as broken chocolate. */
function chunk(g,x,y,r,rot,jag){ var i,pts=[];
  for(i=0;i<jag.length;i++){ var a=rot+i/jag.length*6.283;
    pts.push([x+Math.cos(a)*r*jag[i], y+Math.sin(a)*r*jag[i]]); }
  function poly(sh,dx,dy){ g.beginPath();
    for(i=0;i<pts.length;i++){ var px=x+(pts[i][0]-x)*sh+dx, py=y+(pts[i][1]-y)*sh+dy;
      i?g.lineTo(px,py):g.moveTo(px,py); } g.closePath(); }
  g.save();
  g.shadowColor='rgba(58,28,7,.5)'; g.shadowBlur=r*0.3; g.shadowOffsetY=r*0.1;
  poly(1,0,0);
  var cg=g.createLinearGradient(x-r*0.8,y-r*0.8,x+r*0.7,y+r*0.9);
  cg.addColorStop(0,'#6a4527');cg.addColorStop(0.42,'#3a2213');cg.addColorStop(1,'#1b0f08');
  g.fillStyle=cg; g.fill(); g.shadowColor='transparent';
  /* each break catches the light its own way: the facet and its specular vary per chunk,
     derived from the jag it already owns (no extra randomness to thread through). the
     offsets stay negative so the key light never leaves the top-left. an identical white
     ellipse on three chunks in one macro frame read as a copy-paste, because it was one. */
  var u=(jag[0]-0.78)/0.34, v=(jag[1]-0.78)/0.34, w=(jag[2]-0.78)/0.34;
  poly(0.6,-r*(0.11+0.12*u),-r*(0.13+0.12*v));
  g.fillStyle='rgba(150,102,60,.28)'; g.fill();
  g.beginPath(); g.ellipse(x-r*(0.24+0.18*v),y-r*(0.26+0.2*u),r*(0.13+0.11*w),r*(0.06+0.07*u),-0.4-0.6*w,0,6.283);
  g.fillStyle='rgba(255,238,212,'+(0.16+0.16*v).toFixed(2)+')'; g.fill();
  g.restore(); }

/* a candy shell is matte, not chrome. a broad soft light off the top-left, a thin dark rim
   where the shell turns away, and a specular small enough to stay a shell and not a marble. */
function candy(g,x,y,r,c,tilt){ var ry=r*0.95; g.save();
  g.shadowColor='rgba(58,28,7,.45)'; g.shadowBlur=r*0.42; g.shadowOffsetY=r*0.15;
  g.beginPath(); g.ellipse(x,y,r,ry,tilt,0,6.283); g.fillStyle=c; g.fill();
  g.shadowColor='transparent';
  /* the light stays flat across the middle and only falls off in the last fifth of the
     radius. a gradient that brightens from the centre outward is what makes a marble. */
  var rg=g.createRadialGradient(x-r*0.22,y-ry*0.26,r*0.02,x,y,r*1.04);
  rg.addColorStop(0,'rgba(255,255,255,.17)');rg.addColorStop(0.44,'rgba(255,255,255,.04)');
  rg.addColorStop(0.8,'rgba(0,0,0,.02)');rg.addColorStop(0.94,'rgba(0,0,0,.13)');rg.addColorStop(1,'rgba(0,0,0,.26)');
  g.fillStyle=rg; g.beginPath(); g.ellipse(x,y,r,ry,tilt,0,6.283); g.fill();
  g.beginPath(); g.ellipse(x-r*0.33,y-ry*0.38,r*0.145,ry*0.085,-0.45,0,6.283);
  g.fillStyle='rgba(255,255,255,.34)'; g.fill(); g.restore(); }

/* ===== the cookie is BAKED ONCE into an offscreen canvas, then blitted =====
   A flat radial gradient with circles on it reads as clip art at any size. What makes a
   cookie look baked is the stuff you cannot draw per frame: mottled dough, a few thousand
   specks of flour and toasted sugar, craquelure, and a rim that caught more heat than the
   middle. Bake it into one texture and the zoom becomes a macro shot instead of a scale-up.
   The crumbs are then literal crops of this same texture, so they are made of the cookie. */
var TEX=1600, ctex=document.createElement('canvas'); ctex.width=ctex.height=TEX;
(function(){ var tg=ctex.getContext('2d'), rnd=lcg(0.4242);
  var C=TEX/2, R=C*0.98, i;

  tg.save(); crustPath(tg,C,C,R,180); tg.clip();
  var g=tg.createRadialGradient(C-R*0.26,C-R*0.3,R*0.06,C,C,R*1.02);
  g.addColorStop(0,'#f4d79f');g.addColorStop(0.42,'#e0b073');g.addColorStop(0.74,'#c78c48');g.addColorStop(1,'#a3652d');
  tg.fillStyle=g; tg.fillRect(0,0,TEX,TEX);

  /* mottling — dough never bakes evenly */
  for(i=0;i<240;i++){ var a=rnd()*6.283, d=Math.sqrt(rnd())*R,
      x=C+Math.cos(a)*d, y=C+Math.sin(a)*d, rr=R*(0.03+rnd()*0.13), dark=rnd()<0.5;
    var lg=tg.createRadialGradient(x,y,0,x,y,rr);
    lg.addColorStop(0, dark?'rgba(120,70,26,.11)':'rgba(255,232,186,.11)');
    lg.addColorStop(1, dark?'rgba(120,70,26,0)':'rgba(255,232,186,0)');
    tg.fillStyle=lg; tg.beginPath(); tg.arc(x,y,rr,0,6.283); tg.fill(); }

  /* flour, toasted sugar, and the odd over-baked fleck */
  for(i=0;i<5200;i++){ var a2=rnd()*6.283, d2=Math.sqrt(rnd())*R*0.99,
      sx=C+Math.cos(a2)*d2, sy=C+Math.sin(a2)*d2, big=rnd()<0.06,
      sr=R*(big?0.0035+rnd()*0.004:0.0008+rnd()*0.0026);
    tg.fillStyle = big ? 'rgba(92,52,18,.26)' : (rnd()<0.55 ? 'rgba(86,50,18,.2)' : 'rgba(255,243,214,.2)');
    tg.beginPath(); tg.arc(sx,sy,sr,0,6.283); tg.fill(); }

  /* craquelure: the pale lip goes down FIRST, then the split is cut into it. the other way
     round and the crack reads as a light thread lying on top of the cookie. both passes have
     to trace the SAME wobble, so the walk is resolved to points before anything is stroked.
     a bake splits where it dries first: at the rim, short, and open toward the edge. the
     long uniform wanderers this used to draw read as hairs at macro. each crack starts in
     the outer band, walks outward, and is FILLED as one wedge polygon: a point at the
     inner tip, widening toward the rim end. strokes were tried first and their per-segment
     caps read as bamboo joints at macro; a fill has no joints to show. */
  for(i=0;i<9;i++){ var a3=rnd()*6.283, d3=R*(0.45+rnd()*0.42), len=R*(0.10+rnd()*0.18),
      px=C+Math.cos(a3)*d3, py=C+Math.sin(a3)*d3, dir=a3+(rnd()-0.5)*1.0, k;
    var lw=R*(0.006+rnd()*0.006), pts=[[px,py]];
    for(k=0;k<7;k++){ dir+=(rnd()-0.5)*0.75; px+=Math.cos(dir)*len/7; py+=Math.sin(dir)*len/7; pts.push([px,py]); }
    function wedge(w1,dy,col){ var n=pts.length,j,Lft=[],Rgt=[];
      for(j=0;j<n;j++){ var t0=pts[Math.max(0,j-1)], t1=pts[Math.min(n-1,j+1)],
          dx=t1[0]-t0[0], dv=t1[1]-t0[1], dl=Math.sqrt(dx*dx+dv*dv)||1,
          nx=-dv/dl, ny=dx/dl, w=w1*j/(n-1)/2+lw*0.03;
        Lft.push([pts[j][0]+nx*w,pts[j][1]+ny*w+dy]); Rgt.push([pts[j][0]-nx*w,pts[j][1]-ny*w+dy]); }
      tg.beginPath(); tg.moveTo(Lft[0][0],Lft[0][1]);
      for(j=1;j<n;j++) tg.lineTo(Lft[j][0],Lft[j][1]);
      for(j=n-1;j>=0;j--) tg.lineTo(Rgt[j][0],Rgt[j][1]);
      tg.closePath(); tg.fillStyle=col; tg.fill(); }
    wedge(lw*0.7,-lw*0.75,'rgba(255,238,202,.2)');
    wedge(lw,0,'rgba(84,44,12,.5)'); }

  /* the rim caught the heat */
  var eg=tg.createRadialGradient(C,C,R*0.66,C,C,R);
  eg.addColorStop(0,'rgba(120,66,22,0)');eg.addColorStop(0.7,'rgba(116,62,20,.2)');eg.addColorStop(1,'rgba(80,42,11,.74)');
  tg.fillStyle=eg; tg.fillRect(0,0,TEX,TEX);
  /* and the key light sits top-left, the same place it sits on the disc */
  var hg=tg.createRadialGradient(C-R*0.42,C-R*0.46,R*0.02,C-R*0.28,C-R*0.3,R*0.98);
  hg.addColorStop(0,'rgba(255,241,208,.30)');hg.addColorStop(1,'rgba(255,241,208,0)');
  tg.fillStyle=hg; tg.fillRect(0,0,TEX,TEX);
  tg.restore();

  crustPath(tg,C,C,R,180); tg.lineWidth=R*0.02; tg.strokeStyle='rgba(104,58,20,.45)'; tg.stroke();

  /* the dough acknowledges what is baked into it. a topping that only casts a shadow is
     PLACED; one the dough answers is BAKED IN. under each: a dark seam right at the sunk
     edge, and a pale ridge just outside it where the dough rose. drawn BEFORE the topping,
     so its cast shadow lands on the ridge the way it would on risen dough. the centre is
     nudged down-right so the seam sits heavier away from the key light. */
  function seat(g,x,y,r){ var sx=x+r*0.05, sy=y+r*0.07;
    var q=g.createRadialGradient(sx,sy,r*0.55,sx,sy,r*1.5);
    q.addColorStop(0,'rgba(90,50,16,.20)');
    q.addColorStop(0.40,'rgba(90,50,16,.20)');
    q.addColorStop(0.52,'rgba(255,236,196,.15)');
    q.addColorStop(0.72,'rgba(255,236,196,.10)');
    q.addColorStop(1,'rgba(255,236,196,0)');
    g.fillStyle=q; g.beginPath(); g.arc(sx,sy,r*1.5,0,6.283); g.fill(); }

  for(i=0;i<TOP.length;i++){ var t=TOP[i], tx=C+t.x*R, ty=C+t.y*R, tr=t.r*R;
    seat(tg,tx,ty,tr);
    if(t.mm) candy(tg,tx,ty,tr,t.c,rnd()*0.7);
    else { var jag=[],n=7,j; for(j=0;j<n;j++) jag.push(0.78+rnd()*0.34);
      chunk(tg,tx,ty,tr,rnd()*6.283,jag); } }
})();

/* ===== the shadow is baked beside the dough =====
   bigCookie used to run a shadowBlur as wide as the frame on every zoom frame, to put the
   same shadow in the same place under the same cookie. ctexS is ctex plus its own cast
   shadow, on a pad wide enough to hold the blur; scaling the draw scales the shadow with
   it, which is all the per-frame version was doing. A zoom frame is now one drawImage. */
var SPAD=110, TEXS=TEX+SPAD*2, HTS=TEXS/2, HT=TEX/2;
var ctexS=document.createElement('canvas'); ctexS.width=ctexS.height=TEXS;
(function(){ var g=ctexS.getContext('2d'), R=HT*0.98;
  g.shadowColor='rgba(58,26,4,.5)'; g.shadowBlur=R*0.09; g.shadowOffsetY=R*0.045;
  g.drawImage(ctex,SPAD,SPAD); })();
function bigCookie(cx,cy,R,alpha){ var m=R/HT*HTS;
  ctx.globalAlpha=alpha; ctx.drawImage(ctexS,cx-m,cy-m,m*2,m*2); ctx.globalAlpha=1; }

/* ===== the defocus, without ctx.filter =====
   A blur is a low-pass, and the cheapest low-pass a canvas owns is its own resampler:
   squeeze the shadowed cookie into a pocket canvas whose width IS the kernel, then smooth
   back up (in two hops -- one bilinear jump from ~30px to ~2000 shows its grid). filter
   re-ran a true gaussian over the whole cookie every frame: the most expensive single
   frame in the reel, spent on four percent of the timeline. A resample is not a gaussian,
   so the bloom's falloff differs by a hair -- this window is the one place this refactor
   is checked by eye against main, not by hash. */
var blurA=document.createElement('canvas'), gA=blurA.getContext('2d'),
    blurB=document.createElement('canvas'), gB=blurB.getContext('2d'),
    blurC=document.createElement('canvas'), gC=blurC.getContext('2d');
function bigCookieBlur(cx,cy,R,blur,alpha){ var m=R/HT*HTS;
  var w=Math.max(4,Math.round(m*2/(blur*1.3)))+2, U=m*2/(w-2);
  blurA.width=blurA.height=w;             /* the assignment also clears the canvas */
  gA.imageSmoothingQuality='high';        /* ...and resets this, so set it every time */
  gA.drawImage(ctexS,1,1,w-2,w-2);        /* 1px clear ring: the upscale feathers the rim */
  /* climb back up in x4 hops until the last jump to the screen is gentle. the guard is
     the RATIO, not the pocket's width: one long bilinear jump interpolates the pocket's
     raw pixels and paints them as a grid of diamonds, however wide the pocket was. */
  var src=blurA, sw=w, rr=U, hop=[blurB,blurC], gh=[gB,gC], hi=0;
  while(rr>8){ var nw=sw*4, c=hop[hi], g=gh[hi]; hi=1-hi;
    c.width=c.height=nw; g.imageSmoothingQuality='high';
    g.drawImage(src,0,0,nw,nw); src=c; sw=nw; rr/=4; }
  ctx.globalAlpha=alpha; ctx.drawImage(src,cx-m-U,cy-m-U,w*U,w*U); ctx.globalAlpha=1; }

/* a crumb is a torn piece of the same texture, not a small drawing of a cookie.
   g is passed in because the landed crumbs are re-baked into their own little canvases
   and handed to the DOM, where they can ride the lid. */
function particle(g,x,y,s,rot,mm,col,alpha,q){ if(s<=0.3||alpha<=0)return;
  g.save(); g.globalAlpha=alpha; g.translate(x,y); g.rotate(rot);
  if(mm){ candy(g,0,0,s,col,0); }
  else { g.save(); g.beginPath();
    for(var i=0;i<q.wob.length;i++){ var a=i/q.wob.length*6.283, rr=s*q.wob[i];
      var px=Math.cos(a)*rr, py=Math.sin(a)*rr; i?g.lineTo(px,py):g.moveTo(px,py); }
    g.closePath(); g.save(); g.clip();
    g.drawImage(ctex, q.sx, q.sy, TEX*0.42, TEX*0.42, -s*1.2, -s*1.2, s*2.4, s*2.4);
    g.restore();
    g.lineWidth=s*0.1; g.strokeStyle='rgba(92,50,16,.5)'; g.stroke(); g.restore(); }
  g.restore(); }

function crumbShape(rnd){ var w=[],i; for(i=0;i<9;i++) w.push(0.8+rnd()*0.34); return w; }
/* every piece, in either population, is a torn shape holding a crop of the one cookie.
   it draws three times from the stream, and it must keep doing so in this order: the two
   populations share one deck each, and reordering a draw redeals every piece after it. */
function torn(rnd,o){ o.wob=crumbShape(rnd);
  o.sx=TEX*(0.12+rnd()*0.46); o.sy=TEX*(0.12+rnd()*0.46); return o; }

/* ===== the flight is drawn from bakes, not from scratch =====
   particle() rebuilds each piece's wobble path point by point, and for every candy
   allocates two gradients and runs a shadow blur -- 87 times a frame across the burst,
   to draw the same 87 pieces. None of that changes between frames; only position, angle,
   scale and alpha do. So the constant part is baked once per piece: a torn shape keeps
   its outline as a unit Path2D (the texture is still sampled at native resolution
   through it, so nothing softens), and a candy -- smooth gradients, the one thing
   scaling cannot hurt -- is rendered once, shadow and all, and blitted. particle()
   itself stays: the DOM crumbs are baked through it, which is why their hash cannot move. */
function bakeFlight(q,maxS){
  if(q.mm){ var R=Math.ceil(maxS*1.6)+2;    /* 1.6: room for the shadow's throw */
    var c=document.createElement('canvas'); c.width=c.height=R*4;   /* 2x supersample */
    var g=c.getContext('2d'); g.setTransform(2,0,0,2,0,0);
    candy(g,R,R,maxS,q.col,0);
    q.spr=c; q.sk=R/maxS; }
  else { var P=new Path2D();
    for(var i=0;i<q.wob.length;i++){ var a=i/q.wob.length*6.283,
        px=Math.cos(a)*q.wob[i], py=Math.sin(a)*q.wob[i];
      i?P.lineTo(px,py):P.moveTo(px,py); }
    P.closePath(); q.upath=P; } }
function blit(q,x,y,s,rot,alpha){ if(s<=0.3||alpha<=0)return;
  ctx.save(); ctx.globalAlpha=alpha; ctx.translate(x,y); ctx.rotate(rot);
  if(q.spr){ var m=s*q.sk; ctx.drawImage(q.spr,-m,-m,m*2,m*2); }
  else { ctx.scale(s,s);
    ctx.save(); ctx.clip(q.upath);
    ctx.drawImage(ctex,q.sx,q.sy,TEX*0.42,TEX*0.42,-1.2,-1.2,2.4,2.4);
    ctx.restore();
    ctx.lineWidth=0.1; ctx.strokeStyle='rgba(92,50,16,.5)'; ctx.stroke(q.upath); }
  ctx.restore(); }
var PART=[];
(function(){ var rnd=lcg(0.1234);
  for(var i=0;i<40;i++){ var mm=rnd()<0.3;
    PART.push(torn(rnd,{an:rnd()*6.283, sp:0.42+rnd()*0.95, sz:mm?14+rnd()*12:26+rnd()*26,
      rot:rnd()*6.283, spin:(rnd()*2-1)*3.2, gv:0.6+rnd()*0.8, mm:mm,
      col:mm?MM[(rnd()*MM.length)|0]:'#c88a44'})); }
})();
/* the burst throws everything off-screen, but a handful of crumbs stay in frame, arc up,
   and drop onto the shut lid. nothing is printed on the cover where they land: what the
   jacket carries is not a drawing of a cookie, it is what is left of one. */
/* THE COVER, LAID OUT IN CRUMBS.
   A jacket needs a figure. Debris left where the physics dropped it is a mess, however
   honest, so the resting points are composed, and what they compose is a RING. The cookie
   that was here is drawn by what is left of it, and the ring lies CONCENTRIC on the glow
   of the disc ghosting through the film (the .jk-spec circle: true position, true size).
   The centre is the shut panel's centre — where the disc really is, under the lid.

   Placed in polar coordinates, the same law the doodles on that disc obey: a bearing and a
   fraction of a radius. Here 0deg is 3 o'clock and the angle runs clockwise.

     the ring   — three big chunks at 168 / 286 / 32 make an uneven triangle, so the eye
                  never locates the circle's centre by symmetry. the radius wobbles between
                  0.88 and 1.08: a ring at a constant radius is a drawn circle.
     the break  — 40deg to 110deg carries one speck and nothing else. a closed ring is a
                  wreath. this one gave way at the bottom right.
     the fall   — what came out of the break, resting ON the letters, so the debris and the
                  type share one plane instead of stacking as two layers.
     the dust   — specks hugging the ring inside and out. real debris is a few big pieces
                  and a great many fines; all-mid-size is the tell that somebody placed it.

   Sizes carry it: one chunk at 34 does more than six at 9.

   The candies that come to REST here are red and yellow only, and they punctuate the ring
   at a rhythm. Everything on paper in this reel is drawn with three pens (red marker, navy
   marker, yellow highlighter), and six hues of candy on a navy-and-cream cover is confetti.
   The burst keeps all six: that is a cookie coming apart in the air, not a printed surface. */
/* 600,450 is the stage centre of the shut panel = the ghost's centre. RR grew 142 -> 160
   when the ring moved down onto the glow: the same debris on a bigger stage read thinner. */
var RCX=600, RCY=450, RR=160;
/* bearing (deg) · radius as a fraction of RR · size · candy colour, -1 for a chunk */
var RING=[
  [168,1.00,34.0,-1], [286,0.92,24.0,-1], [ 32,1.02,20.0,-1],        /* the three anchors */
  [205,1.07,13.0,-1], [232,0.93,11.5,-1], [258,1.04,12.5,-1],
  [312,0.94,10.0,-1], [338,1.06,14.0,-1], [  6,0.95, 9.0,-1],
  [140,1.05,11.0,-1], [118,0.94, 8.0,-1], [196,0.90, 6.5,-1], [352,0.88,6.0,-1],
  [150,1.00, 8.5, 2], [224,0.98, 7.0, 3], [272,1.00, 6.5, 2],        /* the punctuation */
  [326,0.99, 7.5, 3], [ 18,1.00, 6.0, 2], [128,1.01, 5.5, 3],
  [178,1.14,3.0,-1], [160,0.86,2.4,-1], [192,1.18,2.6,-1], [150,1.10,2.2,-1],
  [212,0.84,2.8,-1], [240,1.16,2.4,-1], [266,0.86,3.0,-1], [296,1.14,2.6,-1],
  [322,0.85,2.2,-1], [344,1.16,3.2,-1], [ 10,0.87,2.4,-1], [ 44,1.12,2.6,-1],
  [130,1.16,2.2,-1], [112,0.85,2.8,-1], [196,1.24,2.0,-1], [300,1.24,2.0,-1]
];
/* what fell out of the break, plus two strays that keep the ring from reading as a stamp.
   rx, ry (stage px) · size · candy colour */
var FALL=[
  [700,572,12.0,-1], [748,598, 8.0,-1], [660,600, 6.5,-1],
  [790,566, 5.5,-1], [716,628, 5.0,-1], [676,566, 5.0, 2],
  [724,556,2.6,-1], [678,588,2.2,-1], [762,620,2.4,-1], [640,576,2.0,-1],
  [470,330, 5.5,-1], [836,336, 4.5,-1]
];

/* ONE EXPLOSION, TWO FATES.
   Everything in frame is a piece of the same cookie, so everything obeys one law. What
   separates the pieces that leave from the pieces that stay is not the law, it is mass.

   THROW. A crumb is fired straight OUTWARD from the break, along the bearing of the point
   it has to reach, and the air takes the speed away: v(t) = v0·e^-kt. It arrives and stops.
   Ballistics were wrong here. Gravity's drop over a 0.42 flight is 253px against a ring of
   radius 142, so solving the launch backwards forced every piece to be lobbed upward first,
   hard enough to cancel a fall taller than the figure it was drawing. The whole population
   rose 95–271px above its own resting point and hung there in a knot; the highest cleared
   the top of the case and sat in the blue. Gravity is now a sag, not the subject: GS is
   small, so it bends the outward line without deciding it.

     S(t) = (1-e^-kt)/k         distance carried by a decaying push
     B(t) = (t - S(t))/k        distance carried by a constant pull against that same air
     k = DRAG/tL                so e^-k·tL ≈ 0.06: the piece has spent its speed on arrival

   Solve v0 from where it must end up, exactly as before, but now the sag GS·B is a 36–82px
   correction rather than the dominant term, and what is left over points outward.

   DEPTH. Sizes used to be a free parameter, which is why the burst read as one event and the
   crumbs as another: 40 pieces at 26–52px flying out, 47 pieces at 2–34px lobbing about. They
   are all the same distance from the lens at the instant of the break, so they are now drawn
   at one plane and their sizes only diverge afterwards, by perspective.

     the leavers — the light pieces. blown past the lens, so they GROW (1 → KG) and go.
     the stayers — the heavy ones. the blast could not carry them, so they fall back onto the
                   lid, receding from the lens, and SHRINK (K0 → 1) to their resting size.

   1/scale is what is linear in depth, not scale — hence lerp on the reciprocal. And note the
   three ring anchors start out the biggest things on screen. The pieces that stay are the
   pieces that were too heavy to throw. That is why they are the ones drawing the cover. */
var DRAG=2.8, GS=900, K0=1.85, KG=2.2;
var CRUMB=[], CX=BW/2, CY=BH*0.46;
(function(){ var rnd=lcg(0.777);
  var pts=[], i, s;
  for(i=0;i<RING.length;i++){ s=RING[i];
    var a=s[0]*Math.PI/180, rad=RR*s[1];
    pts.push([RCX+Math.cos(a)*rad, RCY+Math.sin(a)*rad, s[2], s[3]]); }
  for(i=0;i<FALL.length;i++) pts.push(FALL[i]);

  for(i=0;i<pts.length;i++){ var P=pts[i], mm=P[3]>=0;
    var q=torn(rnd,{rx:P[0], ry:P[1], sz:P[2], mm:mm, col:mm?MM[P[3]]:'#c88a44',
      rot:rnd()*6.283, spin:(rnd()*2-1)*1.8});
    var d=Math.min(Math.sqrt((q.rx-CX)*(q.rx-CX)+(q.ry-CY)*(q.ry-CY))/250,1);
    q.tL=0.28+0.34*d+(rnd()-0.5)*0.03;
    q.k=DRAG/q.tL;
    q.A=(1-Math.exp(-DRAG))/q.k;          /* S(tL) */
    q.B=(q.tL-q.A)/q.k;                   /* B(tL) */
    q.vx=(q.rx-CX)/q.A;
    q.vy=(q.ry-CY-GS*q.B)/q.A;
    CRUMB.push(q); }
})();
/* both populations, one bake. maxS is the largest size depth ever hands a piece: a leaver
   grows to sz*KG on its way past the lens, a stayer starts at sz*K0 and shrinks home. */
(function(){ var i;
  for(i=0;i<PART.length;i++) bakeFlight(PART[i], PART[i].sz*KG);
  for(i=0;i<CRUMB.length;i++) bakeFlight(CRUMB[i], CRUMB[i].sz*K0); })();
/* where a crumb is, and how big, at flight time tt. u is its progress into the depth of the
   shot: 0 at the cookie's plane, 1 lying on the lid. spin decays on the same S(t) as speed,
   so it coasts to a stop instead of freezing mid-turn. */
function flight(q,tt,o){ var S=(1-Math.exp(-q.k*tt))/q.k, u=Math.min(S/q.A,1);
  o.x=CX+q.vx*S; o.y=CY+q.vy*S+GS*(tt-S)/q.k;
  o.s=q.sz/lerp(1/K0,1,u);
  o.rot=q.rot+(reduce?0:q.spin*S); return o; }
var FL={x:0,y:0,s:0,rot:0};

/* HAND-OFF. up to 0.30 the crumbs are canvas: they fly, they land, they stop. at 0.30 the
   identical pixels are swapped for little canvases parked on the cover at the same stage
   coordinates, and from then on they are part of the lid. so when it swings they go face
   down with it, and when it shuts at 2:20 they come back. the swap is a hard cut, not a
   crossfade: the art is the same and the positions are the same, so nothing can show. */
/* the contact shadow is BAKED, not filtered. as a CSS drop-shadow it was 47 composited
   layers inside the lid's preserve-3d subtree, switched on all at once at CRUMB_P: 17ms a
   frame, arriving at exactly the moment the crumbs appear. baked, it costs nothing.
   PAD is the shadow's reach — 3px down plus 2.6px of blur — because the piece is drawn
   within 1.2*sz of the middle and the smallest crumb is 2px across. */
export var CRUMB_P=0.30;
var CRUMB_PAD=7;
export var crumbLayer=$('crumbs');
(function(){
  for(var i=0;i<CRUMB.length;i++){ var q=CRUMB[i], S=Math.ceil(q.sz*4)+CRUMB_PAD*2;
    /* the piece alone, so the shadow can be cast from its silhouette in one go: particle()
       clips while it draws, and a clip region clips the shadow away with it. */
    var t=document.createElement('canvas'); t.width=t.height=S*2;
    var tg=t.getContext('2d'); tg.scale(2,2);
    particle(tg, S/2, S/2, q.sz, flight(q,q.tL,FL).rot, q.mm, q.col, 1, q);

    var c=document.createElement('canvas');
    c.width=c.height=S*2; c.style.width=c.style.height=S+'px';
    var g=c.getContext('2d'); g.scale(2,2);
    /* the cover's paper gradient runs 158deg, so the key is top-left and the shadow falls
       down-right. one drawImage lays down the shadow and the piece together. */
    g.shadowColor='rgba(34,24,10,.42)'; g.shadowOffsetX=2; g.shadowOffsetY=3; g.shadowBlur=2.6;
    g.drawImage(t,0,0,S,S);
    c.style.cssText+=';position:absolute;left:'+(q.rx-PANEL_X).toFixed(1)+'px;top:'
      +(q.ry-PANEL_Y).toFixed(1)+'px;transform:translate(-50%,-50%)';
    crumbLayer.appendChild(c); }
})();

function crumbs(p){ if(p>=CRUMB_P) return;
  var t=seg(p,0.15,0.34); if(t<=0) return;
  /* the same ramp the burst pieces get. these leave the cookie, they do not fade up out of it */
  var a=seg(p,0.15,0.159); if(a<=0) return;   /* full opacity: the DOM copy is opaque too */
  for(var i=0;i<CRUMB.length;i++){ var q=CRUMB[i];
    var f=flight(q,Math.min(t,q.tL),FL);
    blit(q,f.x,f.y,f.s,f.rot,a); } }

var cvDirty=true;
export function drawCookie(p){ var W=BW,H=BH;
  /* nothing paints outside this window -- the bloom dies at .19, the last burst piece
     fades by ~.30, the flight crumbs hand off at .30 -- but an empty canvas was still
     being cleared, full frame, on every scroll tick of the back two thirds of the reel. */
  var live=p>=0.05&&p<0.34;
  if(!live){ if(cvDirty){ ctx.clearRect(0,0,W,H); cvDirty=false; } return; }
  ctx.clearRect(0,0,W,H); cvDirty=true;
  var cx=W/2, cy=H*0.46, minD=Math.min(W,H), maxD=Math.max(W,H), maxR=maxD*0.8;
  if(p<0.15){ bigCookie(cx,cy, lerp(minD*0.05,maxR,eOut(seg(p,0.055,0.15))), 1); return; }
  if(p<=0.34){
    var b=seg(p,0.15,0.32);
    /* the cookie is rushing past the lens now. once it is bigger than the frame its chips
       are metre-wide polygons, and a sharp one reads as a grey mess rather than as speed.
       defocus it as it goes: what stays is a warm bloom, which is what a camera would see. */
    var fa=1-seg(p,0.15,0.19);
    if(fa>0) bigCookieBlur(cx,cy, maxR*(1+0.25*b), (1-fa)*70+4, fa*0.9);
    /* gone by p=0.30. the canvas now draws over the stage, so a burst piece lingering at
       low alpha does not read as debris in the air, it reads as dirt on the lens. */
    /* the light pieces. same plane, same instant as the crumbs, so q.sz is read at the break
       and only depth moves it afterwards: these are coming AT the lens, so they grow. they
       used to shrink, which said "receding" while they were plainly rushing past you. */
    var spread=Math.hypot(W,H)*0.72, grav=H*0.12, a=Math.min(seg(b,0,0.05),1-seg(b,0.45,0.88));
    if(a>0) for(var i=0;i<PART.length;i++){ var q=PART[i], e=eOut(b), d=e*spread*q.sp;
      var x=cx+Math.cos(q.an)*d, y=cy+Math.sin(q.an)*d + b*b*grav*q.gv;
      blit(q, x, y, q.sz/lerp(1,1/KG,e), q.rot+(reduce?0:b*q.spin), a); }
  }
  crumbs(p); }
