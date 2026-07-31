/* HyperFrames transport: the renderer seeks arbitrary frames instead of playing forward.
   All visual state is therefore derived from the supplied time, never from wall-clock time. */
import { clamp } from './util.js';
import { frame } from './frame.js';
import { DURATION_SECONDS } from '../config/reel.js';

var grain=document.querySelector('.grain');
var stage=document.querySelector('.stage');
var flash=document.getElementById('flash');
var GRAIN=[[0,0],[-13,8],[9,-14],[-8,-6],[12,10]];

function flashOpacity(time){
  var local=time-DURATION_SECONDS*0.15;
  if(local<0||local>.5)return 0;
  var q=local/.5;
  return q<.09?q/.09*.97:(1-(q-.09)/.91)*.97;
}

function applyVideoTime(time){
  var t=clamp(Number(time)||0,0,DURATION_SECONDS), p=t/DURATION_SECONDS;
  frame(p);

  /* The web reel uses ambient CSS clocks. Freeze those in render mode and reproduce
     their poses from video time so parallel workers always capture the same pixels. */
  var gi=Math.floor((t/.9)*5)%GRAIN.length, g=GRAIN[gi];
  grain.style.transform='translate('+g[0]+'px,'+g[1]+'px)';
  var cam=Math.floor((t/16)*32)/32;
  stage.style.transform='translate('+(cam*.9-.45)+'%,'+(cam*.65-.3)+'%) rotate('+(cam*.44-.22)+'deg) scale('+(1.006+cam*.008)+')';
  flash.style.opacity=flashOpacity(t).toFixed(3);
}

window.addEventListener('hf-seek',function(event){applyVideoTime(event.detail.time);});
applyVideoTime(0);
