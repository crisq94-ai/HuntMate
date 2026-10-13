import { getDB } from '../lib/db';
import { rmSync, existsSync } from 'node:fs';
import path from 'node:path';
if(process.argv.includes('--reset')) {
  const file=path.resolve(process.env.HUNTMATE_DB || 'data/huntmate.sqlite');
  if(!file.startsWith(path.resolve('data')+path.sep)) throw new Error('Reset jest dozwolony wyłącznie wewnątrz katalogu data projektu.');
  console.log('Odtwarzanie demonstracyjnej bazy HuntMate. Poprzednie dane demo zostaną usunięte.');
  for(const suffix of ['','-wal','-shm']) if(existsSync(file+suffix)) rmSync(file+suffix);
}
const db=getDB();
console.log('Baza gotowa:',db.prepare('SELECT count(*) AS users FROM users').get());
db.close();
