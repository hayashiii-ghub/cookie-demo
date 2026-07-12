/* the whole reel is authored on a fixed 1200x900 (4:3) stage and scaled to fit */
export var BW=1200, BH=900;

/* THE PANEL IS DECLARED ONCE, IN CSS, AND EVERYTHING HERE IS DERIVED FROM IT.
   It used to be written out four times: .case in the stylesheet, PAN, the crumbs' seat, and
   the gloss travel. Three of those were in this file, and none of them knew about the first.
   Editing the stylesheet moved the case and left the crumbs behind, silently, with a clean
   build. Read it instead. */
var ROOT=getComputedStyle(document.documentElement);
function cssPx(n){ return parseFloat(ROOT.getPropertyValue(n)); }
export var PW=cssPx('--panel-w'), PH=cssPx('--panel-h');
export var PAN=PW/2;          /* shut, the case is centred on the stage; open, the spread is */
export var SPREAD=PW*2;       /* two leaves, and the distance the gloss band has to cross */
export var PANEL_X=(BW-PW)/2, PANEL_Y=(BH-PH)/2;   /* the shut case's top-left, in stage coords */

export function fitStage(){ var f=Math.min(innerWidth/BW, innerHeight/BH);
  var d=document.documentElement.style; d.setProperty('--fit', f);
  d.setProperty('--scan', f>=0.62?0.16:0);   /* kill scanlines when scaled small (moiré) */
  return f; }
