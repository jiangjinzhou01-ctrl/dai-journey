import {cp,mkdir,rm,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..'),dist=path.join(root,'dist');
await rm(dist,{recursive:true,force:true});await mkdir(dist,{recursive:true});
for(const entry of ['index.html','src','assets','FONT-LICENSE.txt'])await cp(path.join(root,entry),path.join(dist,entry),{recursive:true,filter:p=>!p.endsWith('landscape.png')});
const index=await readFile(path.join(dist,'index.html'),'utf8');
if(!index.includes('./src/app.js'))throw new Error('Missing application entry');
await writeFile(path.join(dist,'404.html'),index);
console.log('Built dist/: portable static website, no runtime services or external requests.');
