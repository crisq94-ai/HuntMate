import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { randomUUID, scryptSync, randomBytes, timingSafeEqual } from 'node:crypto';
import { fromZonedTime } from 'date-fns-tz';
import type { Slot } from './types';
export const id = () => randomUUID();
export function hashPassword(password: string) { const salt = randomBytes(16).toString('hex'); return `${salt}:${scryptSync(password,salt,64).toString('hex')}`; }
export function verifyPassword(password: string, hash: string) { const [salt,key] = hash.split(':'); const value = scryptSync(password,salt,64); return value.length === Buffer.from(key,'hex').length && timingSafeEqual(value,Buffer.from(key,'hex')); }
const schema = `
PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,name TEXT NOT NULL,email TEXT UNIQUE COLLATE NOCASE,password TEXT NOT NULL,role TEXT NOT NULL DEFAULT 'client',demo INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,userId TEXT NOT NULL REFERENCES users(id),expires TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS profiles(id TEXT PRIMARY KEY REFERENCES users(id),avatar TEXT NOT NULL,description TEXT NOT NULL,status TEXT NOT NULL,hidden INTEGER DEFAULT 0,modes TEXT NOT NULL,specs TEXT NOT NULL,spawns TEXT NOT NULL,characters TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS availability(id TEXT PRIMARY KEY,providerId TEXT NOT NULL REFERENCES profiles(id),start TEXT NOT NULL,end TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS availability_provider ON availability(providerId,start);
CREATE TABLE IF NOT EXISTS listings(id TEXT PRIMARY KEY,clientId TEXT NOT NULL REFERENCES users(id),title TEXT NOT NULL,mode TEXT NOT NULL,profession TEXT NOT NULL,minLevel INTEGER NOT NULL,maxLevel INTEGER NOT NULL,world TEXT NOT NULL,spawn TEXT NOT NULL,note TEXT NOT NULL,budget TEXT NOT NULL DEFAULT '',status TEXT NOT NULL DEFAULT 'open',slots TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS candidates(listingId TEXT NOT NULL REFERENCES listings(id),providerId TEXT NOT NULL REFERENCES profiles(id),characterId TEXT NOT NULL DEFAULT '',PRIMARY KEY(listingId,providerId));
CREATE TABLE IF NOT EXISTS bookings(id TEXT PRIMARY KEY,clientId TEXT NOT NULL REFERENCES users(id),providerId TEXT NOT NULL REFERENCES profiles(id),mode TEXT NOT NULL,profession TEXT NOT NULL,minLevel INTEGER NOT NULL,maxLevel INTEGER NOT NULL,world TEXT NOT NULL,spawn TEXT NOT NULL,note TEXT NOT NULL,characterId TEXT NOT NULL DEFAULT '',status TEXT NOT NULL,slots TEXT NOT NULL,listingId TEXT REFERENCES listings(id),created TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS bookings_provider ON bookings(providerId,status);
CREATE UNIQUE INDEX IF NOT EXISTS bookings_listing_active ON bookings(listingId) WHERE listingId IS NOT NULL AND status IN ('pending','confirmed');
CREATE TABLE IF NOT EXISTS threads(id TEXT PRIMARY KEY,participants TEXT NOT NULL,updated TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS messages(id TEXT PRIMARY KEY,threadId TEXT NOT NULL REFERENCES threads(id),senderId TEXT NOT NULL REFERENCES users(id),body TEXT NOT NULL,created TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS reviews(id TEXT PRIMARY KEY,bookingId TEXT NOT NULL UNIQUE REFERENCES bookings(id),providerId TEXT NOT NULL REFERENCES profiles(id),clientId TEXT NOT NULL REFERENCES users(id),rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),comment TEXT NOT NULL,hidden INTEGER DEFAULT 0,created TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS notifications(id TEXT PRIMARY KEY,userId TEXT NOT NULL REFERENCES users(id),body TEXT NOT NULL,href TEXT NOT NULL,read INTEGER DEFAULT 0,created TEXT NOT NULL);
`;
export type DB = DatabaseSync;
export type Row = Record<string, any>;
export const all = (db: DB, sql: string, ...args: (string|number|null)[]) => db.prepare(sql).all(...args) as Row[];
export const one = (db: DB, sql: string, ...args: (string|number|null)[]) => db.prepare(sql).get(...args) as Row | undefined;
export const run = (db: DB, sql: string, ...args: (string|number|null)[]) => db.prepare(sql).run(...args);
export function openDatabase(file: string, withSeed = true) { if(file !== ':memory:') mkdirSync(path.dirname(path.resolve(file)),{recursive:true}); const db = new DatabaseSync(file); db.exec(schema); if(withSeed && !one(db,'SELECT id FROM users LIMIT 1')) seedDatabase(db); return db; }
const globalDB = globalThis as unknown as { huntmateDB?: DB; huntmatePath?: string };
export function getDB() { const file = process.env.HUNTMATE_DB || path.join(process.cwd(),'data','huntmate.sqlite'); if(!globalDB.huntmateDB || globalDB.huntmatePath !== file) { globalDB.huntmateDB = openDatabase(file); globalDB.huntmatePath = file; } return globalDB.huntmateDB; }
export function demoSlot(day: number, hour = 19, hours = 2): Slot { const d = new Date(); d.setUTCDate(d.getUTCDate()+day); const date = d.toISOString().slice(0,10); return { start:fromZonedTime(`${date}T${String(hour).padStart(2,'0')}:00:00`,'Europe/Warsaw').toISOString(),end:fromZonedTime(`${date}T${String(hour+hours).padStart(2,'0')}:00:00`,'Europe/Warsaw').toISOString() }; }
export function seedDatabase(db: DB) {
  db.exec('BEGIN IMMEDIATE');
  try {
    const password = hashPassword('HuntMateDemo!2026');
    const names = ['Magnum','Runa','Aegis','Volt','Taro','Sol','Mistral','Bastion'];
    const specs = [[['Monk',600,1800],['Paladin',600,1800]],[['Druid',400,1200]],[['Knight',300,1500]],[['Sorcerer',250,1300]],[['Monk',200,1000]],[['Paladin',500,1600]],[['Druid',150,700],['Sorcerer',150,700]],[['Knight',800,2000],['Paladin',800,2000]]];
    const worlds = ['Antica','Secura','Bona','Monza'];
    const spawns = ['Roshamuul','Prison','Catacombs','Asura Mirror','Buried Cathedral','Secret Library','Soul War','Gnomprona'];
    const descriptions = ['Spokojna głowa i dobra komunikacja. Najlepiej czuję się na wymagających huntach — gram uważnie i słucham drużyny.','Druid z zamiłowania. Dbam o rytm drużyny, leczenie i jasną komunikację podczas każdego huntu.','Lubię kontrolować tempo i dobrze przygotować trasę. Punktualność i współpraca są dla mnie najważniejsze.','Skupiam się na pozycjonowaniu i płynnej grze. Znam popularne expowiska oraz strategie zespołowe.','Chętnie dołączę do regularnego zespołu. Gram spokojnie i dopasowuję tempo do pozostałych osób.','Doświadczony paladyn. Dobrze odnajduję się w wymagających team huntach i dłuższej współpracy.','Elastyczny gracz na średnie poziomy. Pomogę uzupełnić drużynę w wieczornych godzinach.','Specjalizuję się w wysokich poziomach. Cenię przygotowanie i przejrzyste ustalenia przed sesją.'];
    names.forEach((name,i) => {
      run(db,'INSERT INTO users VALUES(?,?,?,?,?,1)',`p${i+1}`,name,`${name.toLowerCase()}@demo.local`,password,'provider');
      const s = specs[i].map(([profession,min,max]) => ({profession,min,max}));
      const characters = s.map((s,j) => ({id:`char-${i}-${j}`,name:`${name} ${j ? 'Alt' : 'Main'}`,world:worlds[(i+j)%4],profession:s.profession,level:Math.round((Number(s.min)+Number(s.max))/2)}));
      run(db,'INSERT INTO profiles VALUES(?,?,?,?,?,?,?,?,?)',`p${i+1}`,`/images/avatar-${i%5+1}.png`,descriptions[i],'approved',0,JSON.stringify(i===6?['client']:['client','own']),JSON.stringify(s),JSON.stringify(i===0?spawns:spawns.filter((_,j)=> j%3===i%3 || j===0)),JSON.stringify(characters));
      for(let day=1;day<=28;day++) { for(const hour of [15,19]) { const slot=demoSlot(day,hour,3); run(db,'INSERT INTO availability VALUES(?,?,?,?)',id(),`p${i+1}`,slot.start,slot.end); } }
    });
    ['Nova','Echo'].forEach((name,i)=>{run(db,'INSERT INTO users VALUES(?,?,?,?,?,1)',`app${i+1}`,name,`${name.toLowerCase()}@demo.local`,password,'client');run(db,'INSERT INTO profiles VALUES(?,?,?,?,?,?,?,?,?)',`app${i+1}`,'/images/avatar-2.png','Chcę dołączyć do rynku. Gram regularnie i mam doświadczenie w team huntach.','pending',0,'["client"]','[{"profession":"Druid","min":300,"max":900}]','["Roshamuul"]','[]');});
    ['Kuba','Ola','Marek','Ania','Piotr','Zosia'].forEach((name,i)=>run(db,'INSERT INTO users VALUES(?,?,?,?,?,1)',`c${i+1}`,name,`${name.toLowerCase()}@demo.local`,password,'client'));
    run(db,'INSERT INTO users VALUES(?,?,?,?,?,1)','admin','Administracja','admin@demo.local',password,'admin');
    for(let i=0;i<12;i++) { const p=i%8; const s=specs[p][0]; const mode=i%2?'own':'client'; run(db,'INSERT INTO listings VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)',`l${i+1}`,`c${i%6+1}`,['Szukamy zastępstwa na wieczorny hunt','Dwie spokojne sesje z naszą drużyną','Zastępstwo na kilka dni','Wolne miejsce w zgranym teamie'][i%4],mode,String(s[0]),Number(s[1]),Number(s[2]),worlds[p%4],spawns[i%8],'Gramy w stałej drużynie. Szczegóły oraz wynagrodzenie ustalimy w rozmowie.',i%3?'Do uzgodnienia':'Budżet do omówienia','open',JSON.stringify([demoSlot(i+3),demoSlot(i+4)])); }
    for(let i=0;i<42;i++) {
      const p=i<30?i%7:(i-30)%8; const s=specs[p][0]; const historical=i<30; const status=historical?'confirmed':i<36?'pending':i<40?'confirmed':'rejected';
      const slots=historical?[demoSlot(-i-2)]:[demoSlot(i-27, i%2?15:19)];
      run(db,'INSERT INTO bookings VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',`b${i+1}`,`c${i%6+1}`,`p${p+1}`,'client',String(s[0]),Number(s[1]),Number(s[2]),worlds[p%4],spawns[i%8],'Ustalamy szczegóły przed sesją.','',status,JSON.stringify(slots),null,new Date().toISOString());
      if(i<24) run(db,'INSERT INTO reviews VALUES(?,?,?,?,?,?,?,?)',`r${i+1}`,`b${i+1}`,`p${p+1}`,`c${i%6+1}`,i%5===0?4:5,['Punktualnie, dobra komunikacja i spokojna gra. Polecam współpracę.','Wszystko zgodnie z ustaleniami. Nasza drużyna była bardzo zadowolona.','Dobrze zna expowisko. Chętnie umówimy kolejną sesję.'][i%3],0,slots[0].end);
    }
    for(let i=0;i<8;i++) { const participants=[`c${i%6+1}`,`p${i+1}`]; const created=new Date(Date.now()-i*3600000).toISOString();run(db,'INSERT INTO threads VALUES(?,?,?)',`t${i+1}`,JSON.stringify(participants),created); ['Cześć! Czy masz czas na wieczorny hunt w tym tygodniu?','Cześć, tak. Podeślij proszę serwer, profesję i godziny.','Antica, najlepiej od 19:00. Szczegóły ustalimy tutaj.'].forEach((body,j)=>run(db,'INSERT INTO messages VALUES(?,?,?,?,?)',id(),`t${i+1}`,participants[j%2],body,new Date(Date.now()-(8-i)*3600000+j*60000).toISOString())); }
    run(db,'INSERT INTO candidates VALUES(?,?,?)','l1','p1','');
    for(const user of ['c1','p1','admin']) run(db,'INSERT INTO notifications VALUES(?,?,?,?,?,?)',id(),user,'Witaj w HuntMate! Sprawdź przykładowe rezerwacje i rozmowy.','/panel',0,new Date().toISOString());
    db.exec('COMMIT');
  } catch(e) { db.exec('ROLLBACK'); throw e; }
}
