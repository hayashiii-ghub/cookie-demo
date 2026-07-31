import { cp, copyFile, mkdir, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const videoDir=dirname(fileURLToPath(import.meta.url));
const root=resolve(videoDir,'..');
const source=resolve(root,'dist');
const target=resolve(root,'.video-dist');

await rm(target,{recursive:true,force:true});
await mkdir(target,{recursive:true});
await cp(source,target,{recursive:true});
await copyFile(resolve(source,'video/index.html'),resolve(target,'index.html'));
