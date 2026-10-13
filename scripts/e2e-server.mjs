import {rmSync,mkdirSync} from 'node:fs';
import {spawn} from 'node:child_process';
import path from 'node:path';
const file=path.join(process.cwd(),'data','e2e.sqlite');
mkdirSync(path.dirname(file),{recursive:true});
for(const suffix of ['','-wal','-shm'])rmSync(file+suffix,{force:true});
const child=spawn(process.execPath,['node_modules/next/dist/bin/next','dev','--hostname','127.0.0.1','--port','3005'],{stdio:'inherit',env:{...process.env,HUNTMATE_DB:file,HUNTMATE_TEST:'1',DEMO_MODE:'true'}});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>child.kill(signal));
child.on('exit',code=>process.exit(code??0));
