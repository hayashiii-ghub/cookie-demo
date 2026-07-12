#!/bin/zsh
#
# A FINGERPRINT OF WHAT THE REEL DRAWS.
#
# The reel is one file of physics and one file of CSS, and almost every change to either is
# meant to leave the picture alone. This proves that, so a refactor is not a matter of opinion.
#
# It does NOT compare screenshots. Screenshot bytes are not reproducible here: mix-blend-mode
# and the preserve-3d lid are rasterised on the GPU, and two runs of identical code disagree by
# a few thousand bytes. Everything captured below is computed on the CPU:
#
#   canvas    an FNV-1a hash of every pixel of #cookie, at 14 points on the timeline
#   crumbs    the 47 crumb canvases: their bakes, their sizes, and where they sit on the lid
#   geometry  the transforms, opacities and rects of the case, lid, cover, disc and doodle
#   marks     the --w each of the 15 doodle marks is holding, the disc highlighter's --hw,
#             and the booklet's live strokes (--uw underline, --lw highlighter)
#   css       the RESOLVED backgroundImage of the four moulded surfaces
#
# That last one is not decoration. A refactor of the ribs gradient once passed every other
# check in here and was still wrong: custom properties resolve their var() references where
# they are DECLARED, so the three depths of shadow had silently collapsed into one. The
# fingerprint saw canvas and geometry, and backgrounds were its blind spot. Now they are not.
#
# The camera drifts on a 16s loop, so every rect depends on the wall clock. All CSS animation
# is frozen before measuring; the reel itself is scroll-driven and needs no clock.
#
# Requires: `aside repl`, and the dev server already running.
#
#   scripts/fingerprint.sh selftest          capture twice, prove the tool is deterministic
#   scripts/fingerprint.sh capture <label>   write .fingerprints/<label>.json
#   scripts/fingerprint.sh diff <a> <b>      compare two captures
#
# The discipline this tool exists to enforce, and the one it kept failing itself:
# RUN SELFTEST FIRST. A comparison that cannot fail proves nothing. Three times in this
# codebase a green check turned out to be an empty file, a frozen GPU, or a mouse event that
# healed the bug it was meant to expose.
#
set -e
ROOT=${0:A:h:h}
# 127.0.0.1, not localhost: on a dual-stack machine localhost resolves per-connection, and a
# second dev server bound to the same port on ::1 answers instead. The capture then probes a
# stranger's page and dies -- or worse, doesn't (see below).
URL=${FP_URL:-http://127.0.0.1:4322/}
OUT=$ROOT/.fingerprints
mkdir -p $OUT

capture() {
  local label=$1 log=$OUT/$label.log
  # a failed capture must not inherit last run's file: the success check below is "the json
  # exists", and a stale one turns "nothing was written" into a green check. selftest once
  # compared two captures that had both failed, found last session's pair identical, and
  # declared the tool sound. the fourth way a green check has lied, and the quietest.
  rm -f $OUT/$label.json
  print -r -- "capturing '$label' from $URL"
  {
    echo "await openTab('$URL')"; sleep 6
    echo "await page.evaluate(() => window.dispatchEvent(new WheelEvent('wheel'))); console.log('VIEWPORT ' + await page.evaluate(()=>innerWidth+'x'+innerHeight))"; sleep 2
    echo "await fs.mkdir('./artifacts',{recursive:true}); console.log('AT ' + pwd)"; sleep 1

    echo "await page.evaluate(() => { const s=document.createElement('style'); s.textContent='*,*::before,*::after{animation:none !important;transition:none !important}'; document.head.appendChild(s); }); console.log('FROZEN')"; sleep 2

    # FNV-1a over the raw bytes. cheap, and we only ever ask "same or not".
    echo "await page.evaluate(() => { window.__h = (buf) => { let h = 0x811c9dc5; for (let i=0;i<buf.length;i++){ h ^= buf[i]; h = Math.imul(h, 0x01000193); } return (h>>>0).toString(16).padStart(8,'0'); }; window.__cv = (c) => { const g=c.getContext('2d'); return window.__h(g.getImageData(0,0,c.width,c.height).data); }; }); console.log('HASHER')"; sleep 2

    # the crumb canvases are baked once at load and never redrawn: hash them and their seats.
    echo "await page.evaluate(() => { window.__crumbs = [...document.querySelectorAll('#crumbs canvas')].map(c => c.width+'x'+c.height+'@'+c.style.left+','+c.style.top+':'+window.__cv(c)).join('|'); }); console.log('CRUMBS ' + await page.evaluate(()=>document.querySelectorAll('#crumbs canvas').length) + ' canvases')"; sleep 3

    # the surfaces whose backgrounds are assembled from shared gradients. resolved, not authored.
    # (no backslash-n anywhere below: zsh's echo would turn it into a real newline and split the JS.)
    echo "const bg = await page.evaluate(() => { const g=(sel,ps)=>{const e=document.querySelector(sel); return e? getComputedStyle(e, ps||null).backgroundImage : 'MISSING '+sel;}; const c=getComputedStyle(document.getElementById('case')); return { 'tray::before':g('.tray','::before'), 'r-hinge':g('.r-hinge'), 'spine.cover':g('.face.cover .spine'), 'spine.inside':g('.face.inside .spine'), 'case.size':c.width+' x '+c.height }; }); console.log('CSS ' + Object.keys(bg).length + ' surfaces')"; sleep 3

    echo "const MARKS='d-njk d-nj d-gem d-att d-arrow2 d-hype d-arrow1 d-song d-cut d-hurt d-flow d-heart2 d-arrow3 d-smile d-star3'.split(' ')"; sleep 1
    echo "const probe = async (p) => page.evaluate(({p,MARKS}) => { const max=document.documentElement.scrollHeight-innerHeight; window.dispatchEvent(new WheelEvent('wheel')); scrollTo(0, Math.round(p*max)); return new Promise(res => requestAnimationFrame(() => requestAnimationFrame(() => { const cs=e=>getComputedStyle(e); const rect=e=>{const r=e.getBoundingClientRect(); return [r.x,r.y,r.width,r.height].map(v=>v.toFixed(2)).join(',');}; res({ p:p.toFixed(2), tc:document.getElementById('tc').textContent, canvas:window.__cv(document.getElementById('cookie')), caseT:document.getElementById('case').style.transform, caseO:document.getElementById('case').style.opacity, lidT:document.getElementById('lid').style.transform, gloss:cs(document.getElementById('cover')).getPropertyValue('--gloss').trim(), crumbsO:cs(document.getElementById('crumbs')).opacity, sweep:cs(document.getElementById('cd1')).getPropertyValue('--sweep').trim(), bgD:cs(document.getElementById('bgDark')).opacity, bgB:cs(document.getElementById('bgBlue')).opacity, rects:['case','lid','cover','cd1','doodle'].map(id=>id+'='+rect(document.getElementById(id))).join(' '), w:MARKS.map(m=>{const e=document.querySelector('.'+m); return m+':'+cs(e).getPropertyValue('--w').trim();}).join(' '), hw:cs(document.querySelector('.d-cut')).getPropertyValue('--hw').trim(), uw:cs(document.querySelector('.ib-ul')).getPropertyValue('--uw').trim(), lw:cs(document.querySelector('.tl li.on')).getPropertyValue('--lw').trim() }); }))); }, {p,MARKS})"; sleep 2

    # 0.2999 and 0.30 straddle the canvas -> DOM hand-off. the pair is the point.
    echo "const PS=[0,0.05,0.10,0.16,0.20,0.26,0.2999,0.30,0.34,0.42,0.52,0.70,0.86,1.00]; const out={crumbs: await page.evaluate(()=>window.__h(new TextEncoder().encode(window.__crumbs))), css: bg, frames:[]}; for (const p of PS) { out.frames.push(await probe(p)); } await fs.writeFile('./artifacts/fp.json', JSON.stringify(out,null,1)); console.log('WROTE ' + out.frames.length + ' frames, crumbs=' + out.crumbs)"; sleep 25
    echo "console.log('ALLDONE')"; sleep 40
  } | aside repl 2>&1 > $log &
  local repl=$!

  # the repl session's directory is deleted when it exits, so fetch the file while it lives
  local dir=""
  for i in $(seq 1 100); do
    dir=$(LC_ALL=C grep -ao "AT [^ ]*" $log 2>/dev/null | head -1 | cut -d' ' -f2)
    if [[ -n "$dir" ]] && LC_ALL=C grep -aq ALLDONE $log 2>/dev/null; then
      cp $dir/artifacts/fp.json $OUT/$label.json 2>/dev/null && break
    fi
    sleep 2
  done
  wait $repl 2>/dev/null || true

  LC_ALL=C grep -aoE "(VIEWPORT [^\"]*|CRUMBS [^\"]*|CSS [^\"]*|WROTE [^\"]*|Error[^\"]*)" $log | sed 's/^/  /'
  if [[ ! -s $OUT/$label.json ]]; then
    print -r -- "  FAILED: no fingerprint written. is the dev server up at $URL ?"
    return 1
  fi
  print -r -- "  -> .fingerprints/$label.json"
}

compare() {
  local a=$OUT/$1.json b=$OUT/$2.json
  [[ -s $a ]] || { print -r -- "missing $a"; return 2 }
  [[ -s $b ]] || { print -r -- "missing $b"; return 2 }
  if diff -q $a $b > /dev/null; then
    print -r -- "IDENTICAL  $1 == $2  (the reel draws the same picture)"
    return 0
  fi
  print -r -- "DIFFERENT  $1 != $2"
  diff $a $b | head -40
  return 1
}

case ${1:-} in
  capture) [[ -n ${2:-} ]] || { print -r -- "usage: $0 capture <label>"; exit 2 }
           capture $2 ;;
  diff)    [[ -n ${3:-} ]] || { print -r -- "usage: $0 diff <a> <b>"; exit 2 }
           compare $2 $3 ;;
  selftest)
    # Same code, twice. If these two disagree, the tool is measuring the weather and every
    # green check it has ever given you was luck. Do not skip this.
    capture __self_a
    capture __self_b
    print -r -- ""
    if compare __self_a __self_b; then
      print -r -- ""
      print -r -- "the tool is deterministic on this machine. its verdicts mean something."
    else
      print -r -- ""
      print -r -- "THE TOOL IS NOT DETERMINISTIC. fix it before trusting any comparison."
      exit 1
    fi ;;
  *) sed -n '2,40p' $0 | sed 's/^# \?//' ;;
esac
