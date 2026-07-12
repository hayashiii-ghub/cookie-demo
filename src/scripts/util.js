/* the shared drawer: one dollar, one deck, and the little algebra of the timeline */
export var $=function(id){return document.getElementById(id);};
export var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* the one deck the whole reel is dealt from: a seed in, a stream out. it used to be written
   out once per population, three times, and the three copies could have drifted apart with
   nothing to notice. the only symptom would have been a different cookie. */
export function lcg(seed){ var r=seed;
  return function(){ r=(r*9301+49297)%233280; return r/233280; }; }

export function clamp(v,a,b){return v<a?a:v>b?b:v;}
export function seg(p,a,b){return clamp((p-a)/(b-a),0,1);}
export function lerp(a,b,t){return a+(b-a)*t;}
export function eOut(t){return 1-Math.pow(1-t,3);}
export function pad(n){return(n<10?'0':'')+n;}
export function fmt(p){var f=133*24+Math.round(p*168),sec=Math.floor(f/24),ff=f%24;return Math.floor(sec/60)+':'+pad(sec%60)+':'+pad(ff);}
