import { cp, copyFile, mkdir, rm } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const videoDir=dirname(fileURLToPath(import.meta.url));
const root=resolve(videoDir,'..');
const source=resolve(root,'dist');
const target=resolve(root,'.video-dist');

await new Promise((resolveBuild,rejectBuild)=>{
  const npm=process.platform==='win32'?'npm.cmd':'npm';
  const child=spawn(npm,['run','build'],{
    cwd:root,
    stdio:'inherit',
    env:{...process.env,VIDEO_BUILD:'1'},
  });
  child.once('error',rejectBuild);
  child.once('exit',code=>code===0?resolveBuild():rejectBuild(new Error(`Astro build exited with code ${code}`)));
});

await rm(target,{recursive:true,force:true});
await mkdir(target,{recursive:true});
await cp(source,target,{recursive:true});
await copyFile(resolve(source,'video/index.html'),resolve(target,'index.html'));
