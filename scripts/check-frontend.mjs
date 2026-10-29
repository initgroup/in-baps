import {readdir,readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
async function check(dir){for(const f of await readdir(dir,{withFileTypes:true})){const full=path.join(dir,f.name);if(f.isDirectory()){if(f.name!=='vendor')await check(full);}else if(f.name.endsWith('.js')){const result=spawnSync(process.execPath,['--check','--input-type=module'],{input:await readFile(full),encoding:'utf8'});if(result.status)throw new Error(full+'\n'+result.stderr);}}}
await check(path.join(root,'frontend'));console.log('Frontend JavaScript syntax verified.');
