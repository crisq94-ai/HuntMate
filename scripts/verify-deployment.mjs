import assert from 'node:assert/strict';

const base = new URL(process.argv[2] || 'http://127.0.0.1:3006');
async function call(path, { cookie, body, expected = 200, origin = base.origin } = {}) {
  const response = await fetch(new URL(`/api/${path}`, base), {
    method: body === undefined ? 'GET' : 'POST',
    headers: { ...(cookie ? { Cookie: cookie } : {}),
      ...(body === undefined ? {} : { 'Content-Type': 'application/json', Origin: origin }) },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(60000)
  });
  const value = await response.json();
  assert.equal(response.status, expected, `${path}: ${JSON.stringify(value)}`);
  return { value, response };
}
async function session(userId) {
  const { response } = await call('auth/demo', { body: { userId } });
  const cookie = response.headers.get('set-cookie');
  assert.ok(cookie?.includes('HttpOnly'));
  assert.match(cookie, /SameSite=lax/i);
  if (base.protocol === 'https:') assert.match(cookie, /Secure/i);
  return cookie.split(';')[0];
}
assert.equal((await call('health')).value.ok, true);
assert.equal((await call('bootstrap')).value.demo, true);
const client = await session('c1');
const performer = await session('p1');
const outsider = await session('c6');
const admin = await session('admin');
const profile = (await call('providers/p1')).value;
const slots = [];
for (const available of profile.availability) {
  if (slots.some(s => s.start.slice(0, 10) === available.start.slice(0, 10))) continue;
  for (let time = Date.parse(available.start); time + 3600000 <= Date.parse(available.end); time += 1800000) {
    const slot = { start: new Date(time).toISOString(), end: new Date(time + 3600000).toISOString() };
    if (time <= Date.now() + 300000 || profile.busy.some(b => slot.start < b.end && b.start < slot.end)) continue;
    slots.push(slot); break;
  }
  if (slots.length === 2) break;
}
assert.equal(slots.length, 2, 'Magnum musi mieć dwa wolne przyszłe terminy.');
const booking = (await call('bookings', { cookie: client, body: {
  providerId: 'p1', mode: 'client', profession: 'Monk', minLevel: 700, maxLevel: 700,
  world: 'Antica', spawn: 'Roshamuul', characterId: '', slots,
  note: 'Demonstracja działania rezerwacji — dwie sesje.'
} })).value;
assert.equal(booking.status, 'pending');
await call(`bookings/${booking.id}/decision`, { cookie: performer, body: { action: 'confirm' } });
const bookings = (await call('account', { cookie: client })).value.bookings;
assert.equal(bookings.find(b => b.id === booking.id)?.status, 'confirmed');
const thread = (await call('threads', { cookie: client, body: { recipientId: 'p1' } })).value;
const message = 'Pokaz HuntMate: rezerwacja dwóch sesji została potwierdzona.';
await call(`threads/${thread.id}/messages`, { cookie: client, body: { body: message } });
const threads = (await call('threads', { cookie: performer })).value;
assert.equal(threads.find(t => t.id === thread.id)?.messages.at(-1)?.body, message);
await call(`threads/${thread.id}/messages`, { cookie: outsider, body: { body: 'Test uprawnień' }, expected: 403 });
await call('admin', { cookie: admin });
await call('auth/demo', { body: { userId: 'admin' }, origin: 'https://obca-strona.example', expected: 403 });
console.log(`OK ${base.origin}: HTTPS/sesje, klient, dwie sesje, akceptacja, czat, uprawnienia, administracja.`);
