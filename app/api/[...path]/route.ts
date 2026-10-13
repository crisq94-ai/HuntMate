import { NextRequest, NextResponse } from 'next/server';
import { getDB, all, one, run } from '@/lib/db';
import * as s from '@/lib/services';
import { z } from 'zod';
import { requestOrigin, isSameOrigin } from '@/lib/runtime';
export const runtime='nodejs';
export const dynamic='force-dynamic';
async function handler(request:NextRequest,context:{params:Promise<{path:string[]}>}) {
  try {
    const {path}=await context.params;const key=path.join('/');const db=getDB();const token=request.cookies.get('huntmate-session')?.value;const user=s.currentUser(db,token);const method=request.method;let body:any={};
    const originUrl=requestOrigin(request.headers,request.url);
    if(method!=='GET'){ const origin=request.headers.get('origin');if(origin&&!isSameOrigin(origin,originUrl))throw new s.ApiError(403,'Niedozwolone źródło żądania.');body=await request.json().catch(()=>({})); }
    let result:unknown;
    if(key==='auth/logout'&&method==='POST'){s.destroySession(db,token);const res=NextResponse.json({ok:true});res.cookies.delete('huntmate-session');return res;}
    if(['auth/login','auth/register','auth/demo'].includes(key)&&method==='POST') {
      let target;
      if(key==='auth/demo'){s.ensure(s.demoEnabled(),'Tryb demo jest wyłączony.',403);const selected=one(db,'SELECT * FROM users WHERE id=? AND demo=1',z.string().parse(body.userId));s.ensure(selected,'Nie znaleziono konta demo.',404);target=s.publicUser(selected);}else target=key==='auth/login'?s.login(db,body):s.register(db,body);
      s.destroySession(db,token);const res=NextResponse.json({user:target});res.cookies.set('huntmate-session',s.createSession(db,target.id),{httpOnly:true,sameSite:'lax',secure:originUrl.startsWith('https:'),path:'/',maxAge:604800});return res;
    }
    if(key==='health'&&method==='GET'){one(db,'SELECT 1 AS ok');result={ok:true};}
    else if(key==='bootstrap'&&method==='GET')result={user,demo:s.demoEnabled(),demoUsers:s.demoEnabled()?all(db,'SELECT id,name,email,role FROM users WHERE demo=1'):[],counts:{providers:s.searchProviders(db,new URLSearchParams()).length,listings:s.getListings(db).length,reviews:one(db,'SELECT count(*) AS n FROM reviews WHERE hidden=0')!.n}};
    else if(key==='providers'&&method==='GET')result=s.searchProviders(db,request.nextUrl.searchParams);
    else if(path[0]==='providers'&&path.length===2&&method==='GET')result=s.provider(db,path[1]);
    else if(key==='listings'&&method==='GET')result=s.getListings(db,request.nextUrl.searchParams);
    else {
      const u=s.requireUser(user);
      if(key==='account'&&method==='GET')result=s.account(db,u);
      else if(key==='notifications'&&method==='GET')result=all(db,'SELECT * FROM notifications WHERE userId=? ORDER BY created DESC LIMIT 60',u.id);
      else if(key==='bookings'&&method==='POST')result=s.createBooking(db,u,body);
      else if(path[0]==='bookings'&&path[2]==='decision'&&method==='POST')result=s.decideBooking(db,u,path[1],body.action);
      else if(key==='availability'&&method==='POST')result=s.setAvailability(db,u,body.slots);
      else if(key==='listings'&&method==='POST')result=s.createListing(db,u,body);
      else if(path[0]==='listings'&&path[2]==='apply'&&method==='POST')result=s.applyListing(db,u,path[1],body.characterId);
      else if(path[0]==='listings'&&path[2]==='select'&&method==='POST')result=s.selectCandidate(db,u,path[1],body.providerId);
      else if(key==='threads'&&method==='GET')result=s.getThreads(db,u);
      else if(key==='threads'&&method==='POST')result=s.startThread(db,u,z.string().parse(body.recipientId));
      else if(path[0]==='threads'&&path[2]==='messages'&&method==='POST')result=s.sendMessage(db,u,path[1],body);
      else if(key==='reviews'&&method==='POST')result=s.addReview(db,u,body);
      else if(key==='application'&&method==='POST')result=s.saveProfile(db,u,body,true);
      else if(key==='profile'&&method==='POST')result=s.saveProfile(db,u,body);
      else if(key==='admin'&&method==='GET')result=s.adminData(db,u);
      else if(path[0]==='admin'&&path[1]==='profiles'&&method==='POST')result=s.moderateProfile(db,u,path[2],body.action);
      else if(path[0]==='admin'&&path[1]==='reviews'&&method==='POST'){s.requireAdmin(u);run(db,'UPDATE reviews SET hidden=? WHERE id=?',body.hidden?1:0,path[2]);result={ok:true};}
      else if(key==='settings'&&method==='POST'){const name=z.string().trim().min(2).max(50).parse(body.name);run(db,'UPDATE users SET name=? WHERE id=?',name,u.id);result={ok:true};}
      else if(key==='notifications/read'&&method==='POST'){run(db,'UPDATE notifications SET read=1 WHERE userId=?',u.id);result={ok:true};}
      else throw new s.ApiError(404,'Nie znaleziono funkcji.');
    }
    return NextResponse.json(result,{headers:{'Cache-Control':'no-store'}});
  }catch(error){ if(error instanceof z.ZodError)return NextResponse.json({error:'Sprawdź wymagane pola, zakresy poziomów oraz poprawność dat i godzin.'},{status:400});if(error instanceof s.ApiError)return NextResponse.json({error:error.message},{status:error.status});console.error('HuntMate API:',error);return NextResponse.json({error:'Wystąpił błąd serwera. Spróbuj ponownie.'},{status:500}); }
}
export { handler as GET, handler as POST };
